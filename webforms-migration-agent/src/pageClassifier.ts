import { promises as fs } from "node:fs";
import path from "node:path";
import type { PageEntry, Scenario } from "./state.js";

/**
 * Heuristic classifier for .aspx pages. Reads the markup + code-behind and
 * produces a scenario + risk signal. This is deliberately dumb — the goal is
 * to produce a consistent first pass that the Copilot SDK contract phase can
 * correct if needed (via a "reclassify" tool call).
 */

export async function discoverAspxPages(root: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string) {
    let entries: { name: string; isDirectory(): boolean; isFile(): boolean }[] = [];
    try { entries = await fs.readdir(dir, { withFileTypes: true }) as typeof entries; } catch { return; }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (/node_modules|bin|obj|\.git|dist/.test(e.name)) continue;
        await walk(p);
      } else if (e.isFile() && e.name.toLowerCase().endsWith(".aspx")) {
        out.push(p);
      }
    }
  }
  await walk(root);
  return out.sort();
}

/**
 * Derive a unique page ID from the repo-relative path, not just the basename.
 * e.g. "Admin/Default.aspx" → "admin-default", "Reports/Monthly.aspx" → "reports-monthly"
 */
function derivePageId(repoRoot: string, aspxPath: string): string {
  return path
    .relative(repoRoot, aspxPath)
    .replace(/\.aspx$/i, "")
    .replaceAll("\\", "/")
    .split("/")
    .map(s => s.replace(/[^A-Za-z0-9]/g, "-").toLowerCase())
    .filter(Boolean)
    .join("-");
}

export async function classify(aspxPath: string, repoRoot?: string): Promise<Omit<PageEntry, "status">> {
  const root = repoRoot ?? process.cwd();
  const id = derivePageId(root, aspxPath);

  const markup = await fs.readFile(aspxPath, "utf8").catch(() => "");
  const codeBehind = await fs.readFile(aspxPath + ".cs", "utf8").catch(() => "");
  const all = markup + "\n" + codeBehind;

  const has = (re: RegExp) => re.test(all);

  // Scenario detection — priority order matters (most specific first).
  let scenario: Scenario = "unknown";
  if (has(/\b(Login|Authenticate|SignIn)\b/i) || has(/<asp:Login\b/i)) scenario = "auth";
  else if (has(/<asp:Wizard\b/i)) scenario = "wizard";
  else if (has(/<asp:Chart\b/i) || has(/\bdashboard\b/i)) scenario = "dashboard";
  else if (has(/<rsweb:ReportViewer\b/i) || has(/\bCrystalReport\b/i) || has(/\.pdf\b/i)) scenario = "report";
  else if (has(/<asp:(GridView|Repeater|DataList|ListView|DetailsView)\b/i)) scenario = "grid";
  else if (has(/<asp:(TextBox|DropDownList|CheckBox|RadioButton|FileUpload)\b/i) || has(/<form\b/i)) scenario = "form";

  // Risk signals.
  const updatePanels    = (markup.match(/<asp:UpdatePanel\b/gi) ?? []).length;
  const hasViewState    = has(/\bViewState\b/);
  const hasSession      = has(/\bSession\s*\[/);
  const hasMaster       = has(/MasterPageFile=/i);
  const hasEvalDataBind = has(/<%#\s*Eval\b/);
  const linesOfCode     = codeBehind.split("\n").length;

  let risk: "low" | "medium" | "high" = "low";
  if (updatePanels > 0 || hasViewState) risk = "medium";
  if (linesOfCode > 400 || scenario === "report" || scenario === "auth") risk = "high";

  const notes =
    `updatePanels=${updatePanels} viewState=${hasViewState} session=${hasSession} ` +
    `master=${hasMaster} evalBind=${hasEvalDataBind} codeBehindLines=${linesOfCode}`;

  // Auto-block auth pages per PWR domain rules.
  const entry: Omit<PageEntry, "status"> = {
    id,
    aspxPath: path.relative(root, aspxPath).replaceAll("\\", "/"),
    scenario,
    risk,
    attempts: 0,
    notes,
  };

  if (scenario === "auth") {
    (entry as Partial<PageEntry>).blockedReason = "auth-decision: franchisee tenant decision pending";
  }

  return entry;
}
