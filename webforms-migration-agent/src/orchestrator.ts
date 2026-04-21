import { promises as fs } from "node:fs";
import path from "node:path";
import {
  readManifest, writeManifest, stamp, addBudgetUsage, budgetExhausted,
  nextPendingPhase, bootstrapComplete, nextPendingPage, openPrCount,
} from "./state.js";
import { runBootstrapPhase, runContractPhase, reconcile } from "./phases.js";
import { discoverAspxPages, classify } from "./pageClassifier.js";
import {
  commitAll, pushBranch, createBranch, openPr,
  checkoutDefaultBranch, getDefaultBranch,
} from "./github.js";

const BUDGET_MINUTES = parseInt(process.env.MIGRATION_BUDGET_MINUTES ?? "270", 10);
const MAX_OPEN_PRS  = parseInt(process.env.MIGRATION_MAX_OPEN_PRS ?? "3", 10);
const TARGET_REPO   = process.env.MIGRATION_TARGET_REPO ?? process.cwd();
const started = Date.now();

function wallClockExceeded(): boolean {
  return (Date.now() - started) / 60_000 > BUDGET_MINUTES;
}

async function ensurePageInventory(): Promise<void> {
  const manifest = await readManifest();
  if (manifest.pages.length > 0) return;

  console.log(`[inventory] scanning ${TARGET_REPO} for .aspx pages…`);
  const files = await discoverAspxPages(TARGET_REPO);
  console.log(`[inventory] found ${files.length} pages`);

  if (files.length === 0) {
    console.log("[inventory] no .aspx pages found — nothing to migrate.");
    return;
  }

  for (const f of files) {
    const entry = await classify(f, TARGET_REPO);
    // Auto-block auth pages per PWR domain rules.
    if (entry.scenario === "auth") {
      manifest.pages.push({
        ...entry,
        status: "blocked",
        blockedReason: "auth-decision: franchisee tenant decision pending",
      });
    } else {
      manifest.pages.push({ ...entry, status: "pending" });
    }
  }
  stamp(manifest.pages[0] ?? {});

  // Create a branch for the inventory PR. Manifest is committed on the branch.
  const branch = "migration/inventory";
  await createBranch(branch);
  await writeManifest(manifest);
  const committed = commitAll("migration: initial page inventory + risk classification");
  if (!committed) {
    console.log("[inventory] no changes to commit for inventory.");
    await checkoutDefaultBranch();
    return;
  }
  pushBranch(branch);
  await openPr({
    title: "migration: initial page inventory",
    body:  inventoryBody(manifest),
    head:  branch,
    labels: ["migration", "phase:inventory", "auto"],
  });
  await checkoutDefaultBranch();
}

function inventoryBody(manifest: { pages: Array<{ scenario: string; status: string; risk?: string }> }): string {
  const total = manifest.pages.length;
  const blocked = manifest.pages.filter(p => p.status === "blocked").length;
  const byScenario = manifest.pages.reduce((acc, p) => {
    acc[p.scenario] = (acc[p.scenario] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const byRisk = manifest.pages.reduce((acc, p) => {
    const r = p.risk ?? "unknown";
    acc[r] = (acc[r] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return [
    `This PR initializes the migration manifest with **${total} discovered .aspx pages**.`,
    "",
    "### Breakdown",
    "",
    "**By scenario:**",
    ...Object.entries(byScenario).map(([k, v]) => `- ${k}: ${v}`),
    "",
    "**By risk:**",
    ...Object.entries(byRisk).map(([k, v]) => `- ${k}: ${v}`),
    "",
    blocked > 0 ? `⚠️ **${blocked} pages blocked** (auth pages awaiting Entra tenant decision)` : "",
    "",
    "- Pages are pre-classified by scenario (form / grid / report / wizard / dashboard / auth)",
    "- Risk is a heuristic — edit `.migration/manifest.json` to reorder if needed",
    "- Merging this PR unblocks the autonomous loop",
    "",
    "No code has changed yet — this is a state file only.",
  ].filter(Boolean).join("\n");
}

async function main(): Promise<void> {
  console.log(`[orchestrator] starting run, budget=${BUDGET_MINUTES}min, maxOpenPrs=${MAX_OPEN_PRS}`);
  console.log(`[orchestrator] target repo: ${TARGET_REPO}`);
  await ensureMigrationFolder();

  // Resolve and cache default branch.
  const defaultBranch = await getDefaultBranch();
  console.log(`[orchestrator] default branch: ${defaultBranch}`);

  await ensurePageInventory();

  // Always reconcile first: merge greens, advance state, observe failures.
  console.log("[orchestrator] reconciling open PRs…");
  await reconcile();

  let manifest = await readManifest();
  if (openPrCount(manifest) >= MAX_OPEN_PRS) {
    console.log(`[orchestrator] ${openPrCount(manifest)} PRs already open — governor holding off.`);
    await commitManifestToDefault();
    return;
  }

  // Phase order: bootstrap platform → then migrate pages.
  if (!bootstrapComplete(manifest)) {
    const phase = nextPendingPhase(manifest);
    if (!phase) {
      console.log("[orchestrator] bootstrap has unrecoverable failures — human intervention required.");
      await commitManifestToDefault();
      return;
    }
    console.log(`[orchestrator] bootstrap phase: ${phase}`);
    await runBootstrapPhase(phase);
    await commitManifestToDefault();
    return;
  }

  const page = nextPendingPage(manifest);
  if (!page) {
    const remaining = manifest.pages.filter(p => !["done", "blocked", "needs-human"].includes(p.status));
    if (remaining.length === 0) {
      console.log("[orchestrator] no pending pages — migration complete 🎉");
    } else {
      console.log(`[orchestrator] ${remaining.length} pages in-flight or failed — waiting.`);
    }
    await commitManifestToDefault();
    return;
  }

  // Process pages until budget or governor limit.
  while (!wallClockExceeded()) {
    manifest = await readManifest();
    if (openPrCount(manifest) >= MAX_OPEN_PRS) {
      console.log("[orchestrator] PR governor limit reached — yielding.");
      break;
    }
    if (budgetExhausted(manifest)) {
      console.log("[orchestrator] premium-request cap reached — yielding.");
      break;
    }

    const next = nextPendingPage(manifest);
    if (!next) break;

    console.log(`[orchestrator] contract phase: ${next.id} (${next.scenario}/${next.risk})`);
    await runContractPhase(next);
  }

  await commitManifestToDefault();
  console.log(`[orchestrator] run complete after ${((Date.now() - started) / 60000).toFixed(1)}min`);
}

async function ensureMigrationFolder(): Promise<void> {
  const dir = path.resolve(".migration");
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Commit the latest manifest + audit log to the default branch.
 * This is the only place we push to default — always from a clean checkout.
 */
async function commitManifestToDefault(): Promise<void> {
  if (process.env.MIGRATION_DRY_RUN === "1") return;
  try {
    await checkoutDefaultBranch();
    // Re-read manifest from disk (it may have been updated by phases on branches).
    const committed = commitAll("migration: update manifest + audit log");
    if (committed) {
      const defaultBranch = await getDefaultBranch();
      pushBranch(defaultBranch);
      console.log("[orchestrator] manifest committed to default branch.");
    }
  } catch (err) {
    console.warn(`[orchestrator] failed to commit manifest to default: ${err}`);
  }
}

main().catch(err => {
  console.error("[orchestrator] fatal:", err);
  process.exit(1);
});
