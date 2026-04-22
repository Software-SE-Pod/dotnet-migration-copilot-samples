import { promises as fs } from "node:fs";
import path from "node:path";
import { runSession } from "./copilot.js";
import {
  commitAll, createBranch, openPr, pushBranch,
  prIsGreen, mergePr, getPrState, getPrDiff, getPrFiles,
  postPrComment, postPrReview,
  checkoutDefaultBranch, type PrInfo,
} from "./github.js";
import {
  readManifest, writeManifest, stamp, addBudgetUsage,
  type Manifest, type PageEntry, type PhaseKey,
  MAX_PHASE_ATTEMPTS, MAX_PAGE_ATTEMPTS,
  escalatePage, escalatePhase,
} from "./state.js";
import { runNswag } from "./openapi.js";

const TARGET_REPO = process.env.MIGRATION_TARGET_REPO ?? process.cwd();
const MAX_REPAIR_ATTEMPTS = 2;

const BOOTSTRAP_PROMPT_FILES: Record<PhaseKey, string> = {
  solution: "00-bootstrap-solution.md",
  identity: "01-bootstrap-identity.md",
  data:     "02-bootstrap-data.md",
  secrets:  "03-bootstrap-secrets.md",
  storage:  "04-bootstrap-storage.md",
  adapters: "05-bootstrap-adapters.md",
};

const SKILL_FILES = [
  "webforms-patterns.md",
  "openapi-contract.md",
  "pwr-domain.md",
];

async function loadPrompt(name: string): Promise<string> {
  return fs.readFile(path.join("prompts", name), "utf8");
}
async function loadSkills(): Promise<string[]> {
  return Promise.all(SKILL_FILES.map(f => fs.readFile(path.join("skills", f), "utf8")));
}

/* ================================================================ */
/*  Programmatic PR Review (no Copilot SDK needed)                  */
/* ================================================================ */

interface ReviewFinding {
  severity: "critical" | "warning" | "info";
  category: string;
  message: string;
  file?: string;
}

const SECURITY_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /(?:password|secret|api[_-]?key|token)\s*[:=]\s*["'][^"']+["']/gi, message: "Possible hardcoded secret" },
  { pattern: /\bSqlCommand\b.*\+.*\bRequest\b/gi, message: "Potential SQL injection (string concat with user input)" },
  { pattern: /\beval\s*\(/gi, message: "Dangerous eval() usage" },
  { pattern: /innerHTML\s*=/gi, message: "innerHTML assignment (potential XSS)" },
  { pattern: /dangerouslySetInnerHTML/gi, message: "dangerouslySetInnerHTML usage (review for XSS)" },
  { pattern: /\bAllowAnonymous\b/gi, message: "AllowAnonymous attribute — verify intentional" },
  { pattern: /disable.*cors|cors.*\*/gi, message: "Wide-open CORS configuration" },
];

const MIGRATION_ANTIPATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /\bViewState\b/gi, message: "ViewState reference in new code — WebForms artifact" },
  { pattern: /\bSession\s*\[/gi, message: "Session bag usage — should use typed state management" },
  { pattern: /<asp:/gi, message: "ASP.NET WebForms server control in new code" },
  { pattern: /\bPage_Load\b/gi, message: "Page_Load handler — WebForms lifecycle" },
  { pattern: /\bIsPostBack\b/gi, message: "IsPostBack check — WebForms pattern" },
  { pattern: /System\.Web\b/gi, message: "System.Web namespace reference" },
];

function reviewDiff(diff: string, files: Array<{ filename: string; status: string; patch?: string }>): ReviewFinding[] {
  const findings: ReviewFinding[] = [];

  // Only check added/modified lines in the diff
  const addedLines = diff.split("\n").filter(l => l.startsWith("+") && !l.startsWith("+++"));

  for (const { pattern, message } of SECURITY_PATTERNS) {
    for (const line of addedLines) {
      if (pattern.test(line)) {
        findings.push({ severity: "critical", category: "Security", message, file: undefined });
        break; // one finding per pattern
      }
      pattern.lastIndex = 0; // reset global regex
    }
  }

  // Migration antipatterns — only in NEW files (not the legacy .aspx files)
  const newFiles = files.filter(f => f.status === "added" || f.status === "modified");
  for (const f of newFiles) {
    if (/\.aspx(\.cs)?$/i.test(f.filename)) continue; // skip legacy files
    const patch = f.patch ?? "";
    for (const { pattern, message } of MIGRATION_ANTIPATTERNS) {
      if (pattern.test(patch)) {
        findings.push({ severity: "warning", category: "Migration", message, file: f.filename });
      }
      pattern.lastIndex = 0;
    }
  }

  // Structural checks
  const hasControllers = files.some(f => /Controllers\/.*\.cs$/i.test(f.filename));
  const hasReactPages  = files.some(f => /pages\/.*\.(tsx|jsx)$/i.test(f.filename));
  const hasOpenApi     = files.some(f => /openapi\.ya?ml$/i.test(f.filename));
  const hasGenerated   = files.some(f => /Generated\//i.test(f.filename));

  if (hasOpenApi && !hasGenerated) {
    findings.push({
      severity: "warning",
      category: "Completeness",
      message: "OpenAPI YAML changed but no generated code updated — run NSwag?",
    });
  }

  return findings;
}

function formatReviewComment(findings: ReviewFinding[]): string {
  const critical = findings.filter(f => f.severity === "critical");
  const warnings = findings.filter(f => f.severity === "warning");
  const infos    = findings.filter(f => f.severity === "info");

  const lines: string[] = [
    "## 🤖 Automated Migration Review",
    "",
  ];

  if (critical.length === 0 && warnings.length === 0) {
    lines.push("✅ **No critical or warning-level issues found.**");
    lines.push("");
  }

  if (critical.length > 0) {
    lines.push("### 🚨 Critical Issues");
    for (const f of critical) {
      lines.push(`- **[${f.category}]** ${f.message}${f.file ? ` (in \`${f.file}\`)` : ""}`);
    }
    lines.push("");
  }

  if (warnings.length > 0) {
    lines.push("### ⚠️ Warnings");
    for (const f of warnings) {
      lines.push(`- **[${f.category}]** ${f.message}${f.file ? ` (in \`${f.file}\`)` : ""}`);
    }
    lines.push("");
  }

  if (infos.length > 0) {
    lines.push("### ℹ️ Info");
    for (const f of infos) {
      lines.push(`- **[${f.category}]** ${f.message}${f.file ? ` (in \`${f.file}\`)` : ""}`);
    }
    lines.push("");
  }

  const verdict = critical.length > 0 ? "REQUEST_CHANGES" : "APPROVE";
  lines.push(`### Verdict: **${verdict}**`);
  lines.push(`- Critical: ${critical.length} | Warnings: ${warnings.length} | Info: ${infos.length}`);

  return lines.join("\n");
}

/* ================================================================ */
/*  Review + Merge — called by orchestrator for any open PR         */
/* ================================================================ */

export type ReviewOutcome = "merged" | "approved-not-mergeable" | "changes-requested" | "ci-pending" | "closed";

/**
 * Review an open migration PR:
 *   1. Check if PR is still open
 *   2. Wait for CI to be green
 *   3. Run programmatic security + migration review
 *   4. Post review comment
 *   5. Approve + merge if no critical issues
 *   6. Request changes if critical issues found
 */
export async function reviewAndMergePr(prNumber: number): Promise<ReviewOutcome> {
  const prState = await getPrState(prNumber);

  if (prState.merged) return "closed";
  if (prState.state === "closed") return "closed";

  // CI check — if not green, wait for next cron run
  const ciGreen = await prIsGreen(prNumber);
  if (!ciGreen) {
    console.log(`[review] PR #${prNumber}: CI not green yet — will check next run.`);
    return "ci-pending";
  }

  // Get diff + files for review
  const [diff, files] = await Promise.all([
    getPrDiff(prNumber),
    getPrFiles(prNumber),
  ]);

  const findings = reviewDiff(diff, files);
  const reviewBody = formatReviewComment(findings);
  const hasCritical = findings.some(f => f.severity === "critical");

  // Post review comment
  await postPrComment(prNumber, reviewBody);

  if (hasCritical) {
    // Post formal review requesting changes
    await postPrReview(prNumber, "Automated review found critical issues — see comment above.", "REQUEST_CHANGES");
    console.log(`[review] PR #${prNumber}: ${findings.filter(f => f.severity === "critical").length} critical issues — requesting changes.`);
    return "changes-requested";
  }

  // Approve and merge
  await postPrReview(prNumber, "Automated review passed — no critical issues.", "APPROVE");
  const merged = await mergePr(prNumber);
  if (merged) {
    console.log(`[review] PR #${prNumber}: approved + merged ✅`);
    // Update manifest to reflect the merge
    await updateManifestAfterMerge(prNumber, prState.head);
    return "merged";
  }

  console.log(`[review] PR #${prNumber}: approved but merge failed (branch protection?) — will retry.`);
  return "approved-not-mergeable";
}

/**
 * After merging a PR, update the manifest to reflect the completion.
 */
async function updateManifestAfterMerge(prNumber: number, headBranch: string): Promise<void> {
  try {
    const manifest = await readManifest();

    // Check bootstrap phases
    for (const [key, state] of Object.entries(manifest.bootstrap)) {
      if (state.pr === prNumber && state.status === "in-progress") {
        state.status = "done";
        state.notes = `PR #${prNumber} merged`;
        stamp(state);
      }
    }

    // Check pages
    for (const page of manifest.pages) {
      if (page.contractPr === prNumber && ["contract-open", "review-open"].includes(page.status)) {
        page.status = "done";
        page.notes = `PR #${prNumber} merged`;
        stamp(page);
      }
      if (page.implPr === prNumber && page.status === "impl-open") {
        page.status = "done";
        page.notes = `PR #${prNumber} merged`;
        stamp(page);
      }
    }

    await writeManifest(manifest);
  } catch (err) {
    console.warn(`[review] failed to update manifest after merge: ${err}`);
  }
}

/* ================================================================ */
/*  Bootstrap phase (creates a PR)                                  */
/* ================================================================ */

export async function runBootstrapPhase(phase: PhaseKey): Promise<void> {
  const manifest = await readManifest();
  const state = manifest.bootstrap[phase];

  if ((state.attempts ?? 0) >= MAX_PHASE_ATTEMPTS) {
    escalatePhase(state, `exceeded ${MAX_PHASE_ATTEMPTS} attempts`);
    await writeManifest(manifest);
    return;
  }

  const branch = `migration/bootstrap/${phase}`;
  await createBranch(branch);

  state.status = "in-progress";
  state.attempts = (state.attempts ?? 0) + 1;
  stamp(state);
  await writeManifest(manifest);

  const prompt = await loadPrompt(BOOTSTRAP_PROMPT_FILES[phase]);
  const skills = await loadSkills();

  const result = await runSession({
    id: `bootstrap:${phase}`,
    prompt,
    skills,
    cwd: TARGET_REPO,
    branch,
    timeoutMinutes: 120,
    useMcpModernize: true,
  });

  addBudgetUsage(manifest, result.premiumRequests ?? 1);

  if (!result.ok) {
    state.status = "failed";
    state.notes = result.error ?? "session failed";
    stamp(state);
    await writeManifest(manifest);
    await checkoutDefaultBranch();
    return;
  }

  const committed = commitAll(`migration(${phase}): bootstrap scaffold`);
  if (!committed) {
    state.status = "done";
    state.notes = "no changes required";
    stamp(state);
    await writeManifest(manifest);
    await checkoutDefaultBranch();
    return;
  }
  pushBranch(branch);
  const pr = await openPr({
    title: `migration(${phase}): bootstrap scaffold`,
    body:  bootstrapPrBody(phase, result.summary),
    head:  branch,
    labels: ["migration", `phase:${phase}`, "auto"],
  });
  state.pr = pr;
  stamp(state);
  await writeManifest(manifest);
  commitAll(`migration(${phase}): update manifest state`);
  pushBranch(branch);
  await checkoutDefaultBranch();
}

function bootstrapPrBody(phase: PhaseKey, summary: string): string {
  return [
    `## Autonomous bootstrap: **${phase}**`,
    "",
    "This PR was produced by the migration orchestrator. It establishes the platform",
    "building block required by subsequent phases.",
    "",
    "### Session summary",
    "```",
    summary.slice(0, 4000),
    "```",
    "",
    "### Acceptance",
    "- [ ] Build green",
    "- [ ] Tests green",
    "- [ ] No secrets committed",
    "- [ ] Follows phase checklist in `prompts/`",
  ].join("\n");
}

/* ================================================================ */
/*  Page contract phase (creates a PR)                              */
/* ================================================================ */

export async function runContractPhase(page: PageEntry): Promise<void> {
  const manifest = await readManifest();
  const p = manifest.pages.find(x => x.id === page.id)!;

  if ((p.attempts ?? 0) >= MAX_PAGE_ATTEMPTS) {
    escalatePage(p, `contract phase exceeded ${MAX_PAGE_ATTEMPTS} attempts`);
    await writeManifest(manifest);
    return;
  }

  const branch = `migration/page/${page.id}/contract`;
  await createBranch(branch);

  p.status = "contract-open";
  p.attempts = (p.attempts ?? 0) + 1;
  stamp(p);
  await writeManifest(manifest);

  const prompt = (await loadPrompt("10-page-contract.md"))
    .replaceAll("{{PAGE_ID}}", page.id)
    .replaceAll("{{ASPX_PATH}}", page.aspxPath)
    .replaceAll("{{SCENARIO}}", page.scenario)
    .replaceAll("{{RISK}}", page.risk ?? "unknown")
    .replaceAll("{{NOTES}}", page.notes ?? "");
  const skills = await loadSkills();

  const result = await runSession({
    id: `page:${page.id}:contract`,
    prompt,
    skills,
    cwd: TARGET_REPO,
    branch,
    timeoutMinutes: 60,
    useMcpModernize: true,
  });

  addBudgetUsage(manifest, result.premiumRequests ?? 1);

  if (!result.ok) {
    p.status = "failed";
    p.notes = `contract: ${result.error}`;
    stamp(p);
    await writeManifest(manifest);
    await checkoutDefaultBranch();
    return;
  }

  // Deterministic contract enforcement: run NSwag after SDK edits the YAML.
  try {
    runNswag(TARGET_REPO);
  } catch (err) {
    console.warn(`[phases] NSwag failed after contract session: ${err}`);
    p.status = "failed";
    p.notes = `NSwag codegen failed: ${err}`;
    stamp(p);
    await writeManifest(manifest);
    await checkoutDefaultBranch();
    return;
  }

  const committed = commitAll(
    `migration(page ${page.id}): contract (openapi + nswag scaffolding)`
  );
  if (!committed && process.env.MIGRATION_DRY_RUN !== "1") {
    p.status = "failed";
    p.notes = "contract session + NSwag produced no diff — YAML likely unchanged";
    stamp(p);
    await writeManifest(manifest);
    await checkoutDefaultBranch();
    return;
  }

  pushBranch(branch);

  const implPrompt = (await loadPrompt("11-page-implementation.md"))
    .replaceAll("{{ASPX_PATH}}", page.aspxPath)
    .replaceAll("{{PAGE_ID}}", page.id)
    .replaceAll("{{SCENARIO}}", page.scenario);

  const pr = await openPr({
    title: `migration(${page.id}): API contract + generated scaffolding`,
    body:  contractPrBody(page, result.summary, implPrompt),
    head:  branch,
    labels: ["migration", "phase:contract", `page:${page.id}`, "auto"],
  });
  p.contractPr = pr;
  stamp(p);
  await writeManifest(manifest);
  commitAll(`migration(${page.id}): update manifest state`);
  pushBranch(branch);
  await checkoutDefaultBranch();
}

function contractPrBody(page: PageEntry, summary: string, implPrompt: string): string {
  return [
    `## Contract PR: **${page.id}** (\`${page.aspxPath}\`)`,
    `Scenario: **${page.scenario}** | Risk: **${page.risk ?? "unknown"}**`,
    "",
    "This PR contains **only contract + generated code**:",
    "- `contracts/openapi.yaml` — updated with operations for this page",
    "- `dotnet/ApiContracts/Generated/*.cs` — NSwag-generated DTOs + abstract controllers",
    "- `web/src/api/generated/*.ts` — NSwag-generated TS types + fetch client",
    "- Empty controller impl stub in `dotnet/Api/Controllers/`",
    "- Empty React page shell in `web/src/pages/`",
    "",
    "---",
    "",
    "### Implementation guidance",
    "",
    implPrompt.slice(0, 3000),
    "",
    "---",
    "",
    "### Orchestrator session summary",
    "```",
    summary.slice(0, 3000),
    "```",
  ].join("\n");
}
