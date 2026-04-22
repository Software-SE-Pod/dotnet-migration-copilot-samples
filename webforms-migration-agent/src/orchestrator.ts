import { promises as fs } from "node:fs";
import path from "node:path";
import {
  readManifest, writeManifest, stamp, addBudgetUsage, budgetExhausted,
  nextPendingPhase, bootstrapComplete, nextPendingPage,
} from "./state.js";
import { runBootstrapPhase, runContractPhase, reviewAndMergePr } from "./phases.js";
import { discoverAspxPages, classify } from "./pageClassifier.js";
import {
  commitAll, pushBranch, createBranch, openPr,
  checkoutDefaultBranch, getDefaultBranch, getActiveMigrationPr,
} from "./github.js";

const BUDGET_MINUTES = parseInt(process.env.MIGRATION_BUDGET_MINUTES ?? "270", 10);
const TARGET_REPO   = process.env.MIGRATION_TARGET_REPO ?? process.cwd();
const started = Date.now();

/* ---------- helpers ---------- */

function wallClockExceeded(): boolean {
  return (Date.now() - started) / 60_000 > BUDGET_MINUTES;
}

async function ensureMigrationFolder(): Promise<void> {
  await fs.mkdir(path.resolve(".migration"), { recursive: true });
}

/* ---------- inventory ---------- */

async function ensurePageInventory(): Promise<"exists" | "created-pr" | "empty"> {
  const manifest = await readManifest();
  if (manifest.pages.length > 0) return "exists";

  console.log(`[inventory] scanning ${TARGET_REPO} for .aspx pages…`);
  const files = await discoverAspxPages(TARGET_REPO);
  console.log(`[inventory] found ${files.length} pages`);
  if (files.length === 0) {
    console.log("[inventory] no .aspx pages found — nothing to migrate.");
    return "empty";
  }

  for (const f of files) {
    const entry = await classify(f, TARGET_REPO);
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

  const branch = "migration/inventory";
  await createBranch(branch);
  await writeManifest(manifest);
  const committed = commitAll("migration: initial page inventory + risk classification");
  if (!committed) {
    await checkoutDefaultBranch();
    return "exists";
  }
  pushBranch(branch);
  await openPr({
    title: "migration: initial page inventory",
    body:  inventoryBody(manifest),
    head:  branch,
    labels: ["migration", "phase:inventory", "auto"],
  });
  await checkoutDefaultBranch();
  return "created-pr";
}

function inventoryBody(manifest: { pages: Array<{ scenario: string; status: string; risk?: string }> }): string {
  const total   = manifest.pages.length;
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
    "**By scenario:**",
    ...Object.entries(byScenario).map(([k, v]) => `- ${k}: ${v}`),
    "",
    "**By risk:**",
    ...Object.entries(byRisk).map(([k, v]) => `- ${k}: ${v}`),
    "",
    blocked > 0 ? `⚠️ **${blocked} pages blocked** (auth pages awaiting Entra tenant decision)` : "",
    "",
    "No code has changed yet — this is a state file only.",
    "Merging this PR unblocks the autonomous loop.",
  ].filter(Boolean).join("\n");
}

/* ---------- main ---------- */

/**
 * CONTINUOUS ONE-PR-AT-A-TIME LOOP
 *
 * Within a single run (budget permitting):
 *   1. If an open migration PR exists → review → merge (or wait for CI)
 *   2. After merge (or if no open PR) → create next PR → review → merge → repeat
 *   3. Stop when: budget exhausted, CI pending, migration complete, or error
 */
async function main(): Promise<void> {
  console.log(`[orchestrator] starting run, budget=${BUDGET_MINUTES}min`);
  console.log(`[orchestrator] target repo: ${TARGET_REPO}`);
  await ensureMigrationFolder();

  const defaultBranch = await getDefaultBranch();
  console.log(`[orchestrator] default branch: ${defaultBranch}`);

  let iteration = 0;

  while (!wallClockExceeded()) {
    iteration++;
    console.log(`\n[orchestrator] ── iteration ${iteration} ──`);

    // ── Step 1: Is there an open migration PR? Review + merge it. ──
    const activePr = await getActiveMigrationPr();
    if (activePr) {
      console.log(`[orchestrator] found open migration PR #${activePr.number} (${activePr.head})`);
      const result = await reviewAndMergePr(activePr.number);
      console.log(`[orchestrator] PR #${activePr.number} → ${result}`);

      if (result === "merged") {
        // Successfully merged — loop back to create the next PR
        console.log(`[orchestrator] merge complete — continuing to next task.`);
        continue;
      }
      if (result === "closed") {
        // PR was closed (e.g. conflict couldn't be rebased) — loop to recreate
        console.log(`[orchestrator] PR closed — will recreate on next iteration.`);
        continue;
      }
      if (result === "changes-requested") {
        // Critical issues found — close PR so next iteration recreates cleanly
        console.log(`[orchestrator] PR #${activePr.number} had critical review findings — closing to recreate.`);
        const { closePr } = await import("./github.js");
        await closePr(activePr.number);
        continue;
      }
      // ci-pending, approved-not-mergeable → stop for now
      console.log(`[orchestrator] PR #${activePr.number} not ready (${result}) — stopping, will resume next cron.`);
      return;
    }

    // ── Step 2: No open PR — pick the next task and create ONE PR. ──
    console.log("[orchestrator] no open migration PR — advancing pipeline.");

    // Ensure page inventory exists (creates a PR if first run).
    const invResult = await ensurePageInventory();
    if (invResult === "created-pr") {
      console.log("[orchestrator] created inventory PR — looping to review it.");
      continue;
    }
    if (invResult === "empty") return;

    const manifest = await readManifest();
    if (budgetExhausted(manifest)) {
      console.log("[orchestrator] premium-request cap reached — yielding.");
      return;
    }

    // Bootstrap phases first, then pages.
    if (!bootstrapComplete(manifest)) {
      const phase = nextPendingPhase(manifest);
      if (!phase) {
        console.log("[orchestrator] bootstrap has unrecoverable failures — human intervention required.");
        return;
      }
      console.log(`[orchestrator] bootstrap phase: ${phase}`);
      await runBootstrapPhase(phase);
      console.log(`[orchestrator] bootstrap PR created — looping to review it.`);
      continue;
    }

    const page = nextPendingPage(manifest);
    if (!page) {
      const remaining = manifest.pages.filter(
        p => !["done", "blocked", "needs-human"].includes(p.status),
      );
      if (remaining.length === 0) {
        console.log("[orchestrator] ✅ migration complete — all pages done or blocked.");
      } else {
        console.log(`[orchestrator] ${remaining.length} pages in-flight/failed — waiting.`);
      }
      return;
    }

    console.log(`[orchestrator] contract phase: ${page.id} (${page.scenario}/${page.risk})`);
    await runContractPhase(page);
    console.log(`[orchestrator] contract PR created — looping to review it.`);
    continue;
  }

  const elapsed = ((Date.now() - started) / 60_000).toFixed(1);
  console.log(`[orchestrator] budget exhausted after ${iteration} iterations, ${elapsed}min`);
}

main().catch(err => {
  console.error("[orchestrator] fatal:", err);
  process.exit(1);
});
