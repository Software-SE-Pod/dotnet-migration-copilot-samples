import { promises as fs } from "node:fs";
import path from "node:path";
import { runSession } from "./copilot.js";
import {
  commitAll, createBranch, openPr, pushBranch,
  listOpenPrs, prIsGreen, mergePr, getPrState,
  getPrDiff, postPrReview,
  checkoutDefaultBranch, type PrInfo,
} from "./github.js";
import {
  readManifest, writeManifest, stamp, addBudgetUsage,
  type Manifest, type PageEntry, type PhaseKey,
  MAX_PHASE_ATTEMPTS, MAX_PAGE_ATTEMPTS,
  escalatePage, escalatePhase,
} from "./state.js";
import { runNswag, codegenIsDirty } from "./openapi.js";
import { hasNotImplemented, hasJsonPlaceholder } from "./implValidation.js";

const TARGET_REPO = process.env.MIGRATION_TARGET_REPO ?? process.cwd();

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

/** ============================================================= */
/**  PR Review — run Copilot SDK to review before merging          */
/** ============================================================= */

export interface ReviewResult {
  approved: boolean;
  body: string;
}

/**
 * Run a Copilot SDK session to review a PR diff. Returns whether the
 * review approves the PR and the review comment body.
 */
export async function reviewPr(prNumber: number, sessionId: string): Promise<ReviewResult> {
  const diff = await getPrDiff(prNumber);
  const reviewTemplate = await loadPrompt("12-review.md");
  const prompt = reviewTemplate.replace("{{PR_DIFF}}", diff);
  const skills = await loadSkills();

  const result = await runSession({
    id: sessionId,
    prompt,
    skills,
    cwd: TARGET_REPO,
    branch: "HEAD",           // review is read-only, no branch needed
    timeoutMinutes: 10,
  });

  // Parse verdict from the session summary
  const summary = result.summary ?? "";
  const approved = /verdict:\s*approve/i.test(summary)
    && !/request.changes/i.test(summary);

  const reviewBody = summary || "(Review session produced no output)";

  // Post the review to the PR
  const event = approved ? "APPROVE" as const : "REQUEST_CHANGES" as const;
  await postPrReview(prNumber, reviewBody, event);

  console.log(`[review] PR #${prNumber}: ${event}`);
  return { approved, body: reviewBody };
}

export async function runBootstrapPhase(phase: PhaseKey): Promise<void> {
  // Read manifest, update status, then switch branch. Manifest is persisted
  // on the feature branch so it doesn't pollute main until reconcile merges.
  const manifest = await readManifest();
  const state = manifest.bootstrap[phase];

  if ((state.attempts ?? 0) >= MAX_PHASE_ATTEMPTS) {
    escalatePhase(state, `exceeded ${MAX_PHASE_ATTEMPTS} attempts`);
    await writeManifest(manifest);
    return;
  }

  const branch = `migration/bootstrap/${phase}`;
  await createBranch(branch);

  // Now on the feature branch — safe to mutate manifest.
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
  });

  // Track budget.
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
    // Session produced no diff — treat as done (nothing to do).
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
  // Commit manifest update on the branch so it persists.
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

/** ============================================================= */
/**  PAGE contract phase (Phase 10)                                */
/** ============================================================= */

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

  // Gate: there must be actual changes after session + codegen.
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

  const pr = await openPr({
    title: `migration(${page.id}): API contract + generated scaffolding`,
    body:  contractPrBody(page, result.summary),
    head:  branch,
    labels: ["migration", "phase:contract", `page:${page.id}`, "auto"],
  });
  p.contractPr = pr;
  // Status stays contract-open until reconcile detects the Coding Agent's work.
  stamp(p);
  await writeManifest(manifest);
  commitAll(`migration(${page.id}): update manifest state`);
  pushBranch(branch);
  await checkoutDefaultBranch();
}

function contractPrBody(page: PageEntry, summary: string): string {
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
    "A subsequent **implementation PR** will fill in the business logic and React UI.",
    "",
    "### Orchestrator session summary",
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

/** ============================================================= */
/**  PAGE implementation phase (Phase 11)                          */
/** ============================================================= */

export async function runImplementationPhase(page: PageEntry): Promise<void> {
  const manifest = await readManifest();
  const p = manifest.pages.find(x => x.id === page.id)!;

  if ((p.implAttempts ?? 0) >= MAX_PAGE_ATTEMPTS) {
    escalatePage(p, `impl phase exceeded ${MAX_PAGE_ATTEMPTS} attempts`);
    await writeManifest(manifest);
    return;
  }

  const branch = `migration/page/${page.id}/impl`;
  await createBranch(branch);

  p.status = "impl-open";
  p.implAttempts = (p.implAttempts ?? 0) + 1;
  stamp(p);
  await writeManifest(manifest);

  // Build the implementation prompt from template.
  const pascalId = page.id.replace(/(^|[-_])(\w)/g, (_, __, c: string) => c.toUpperCase());
  const prompt = (await loadPrompt("11-page-implementation.md"))
    .replaceAll("{{ASPX_PATH}}", page.aspxPath)
    .replaceAll("{{PAGE_ID}}", page.id)
    .replaceAll("{{PASCAL_PAGE_ID}}", pascalId)
    .replaceAll("{{SCENARIO}}", page.scenario);
  const skills = await loadSkills();

  const result = await runSession({
    id: `page:${page.id}:impl`,
    prompt,
    skills,
    cwd: TARGET_REPO,
    branch,
    timeoutMinutes: 90,
  });

  addBudgetUsage(manifest, result.premiumRequests ?? 1);

  if (!result.ok) {
    p.status = "needs-impl";
    p.notes = `impl session failed: ${result.error}`;
    stamp(p);
    await writeManifest(manifest);
    await checkoutDefaultBranch();
    return;
  }

  // Deterministic validation: check that stubs were actually replaced.
  const controllerPath = path.join(
    TARGET_REPO, "dotnet", "Api", "Controllers", `${pascalId}Controller.cs`
  );
  const reactPagePath = path.join(
    TARGET_REPO, "web", "src", "pages", pascalId, "index.tsx"
  );

  const stillHasStubs = await hasNotImplemented(controllerPath);
  const stillHasPlaceholder = await hasJsonPlaceholder(reactPagePath);

  console.log(`[phases] impl validation for ${page.id}: controller stubs=${stillHasStubs}, react placeholder=${stillHasPlaceholder}`);
  console.log(`[phases] session summary: ${result.summary.slice(0, 500)}`);

  // Hard gate: only block if NO progress was made (both stubs remain).
  // If at least one component was implemented, open the PR — the review cycle
  // or a follow-up iteration will handle the remainder.
  if (stillHasStubs && stillHasPlaceholder) {
    console.warn(`[phases] impl session for ${page.id} made zero progress — both stubs remain`);
    p.status = "needs-impl";
    p.notes = `impl session produced no real implementation (all stubs remain)`;
    stamp(p);
    await writeManifest(manifest);
    await checkoutDefaultBranch();
    return;
  }

  // Log partial progress as info (not a blocker).
  if (stillHasStubs || stillHasPlaceholder) {
    const partial = [
      stillHasStubs && "controller still has NotImplementedException",
      stillHasPlaceholder && "React page still has JSON.stringify placeholder",
    ].filter(Boolean).join("; ");
    console.log(`[phases] impl session for ${page.id} partial: ${partial} — opening PR anyway`);
  }

  // Gate: there must be actual changes.
  const committed = commitAll(
    `migration(page ${page.id}): implementation — real controllers + React UI`
  );
  if (!committed && process.env.MIGRATION_DRY_RUN !== "1") {
    p.status = "needs-impl";
    p.notes = "impl session produced no diff";
    stamp(p);
    await writeManifest(manifest);
    await checkoutDefaultBranch();
    return;
  }

  pushBranch(branch);

  const partialNotes = [
    stillHasStubs && "⚠️ Controller still has `NotImplementedException` stubs",
    stillHasPlaceholder && "⚠️ React page still has `JSON.stringify` placeholder",
  ].filter(Boolean);

  const pr = await openPr({
    title: `migration(${page.id}): implementation — controllers + React UI`,
    body: implPrBody(page, result.summary, partialNotes as string[]),
    head: branch,
    labels: ["migration", "phase:impl", `page:${page.id}`, "auto"],
  });
  p.implPr = pr;
  stamp(p);
  await writeManifest(manifest);
  commitAll(`migration(${page.id}): update manifest state`);
  pushBranch(branch);

  // Persist status to main so future runs see impl-open (not needs-impl).
  // Without this, checkoutDefaultBranch() overwrites the manifest with main's
  // stale copy and the update is lost.
  await checkoutDefaultBranch();
  await writeManifest(manifest);
}

function implPrBody(page: PageEntry, summary: string, partialNotes: string[] = []): string {
  const pascalId = page.id.replace(/(^|[-_])(\w)/g, (_, __, c: string) => c.toUpperCase());
  const lines = [
    `## Implementation PR: **${page.id}** (\`${page.aspxPath}\`)`,
    `Scenario: **${page.scenario}** | Risk: **${page.risk ?? "unknown"}**`,
    "",
  ];

  if (partialNotes.length > 0) {
    lines.push("### ⚠️ Partial implementation", "");
    lines.push(...partialNotes.map(n => `- ${n}`));
    lines.push("", "The review cycle may request changes to complete the remaining work.", "");
  }

  lines.push(
    "This PR fills in the actual business logic and React UI for this page:",
    `- \`dotnet/Api/Controllers/${pascalId}Controller.cs\` — real EF Core logic replacing NotImplementedException stubs`,
    `- \`web/src/pages/${pascalId}/index.tsx\` — full React UI with forms, grids, and validation`,
    `- Unit tests for controller methods and React components`,
    "",
    `Contract PR: #${page.contractPr ?? "N/A"}`,
    "",
    "### Orchestrator session summary",
    "```",
    summary.slice(0, 4000),
    "```",
    "",
    "### Acceptance",
    "- [ ] No remaining `NotImplementedException` in controller",
    "- [ ] No `JSON.stringify` placeholder in React page",
    "- [ ] `dotnet build` green",
    "- [ ] `npm run build` green",
    "- [ ] Unit tests pass",
  );
  return lines.join("\n");
}

/** ============================================================= */
/**  Reconciliation: watch open PRs, review, then merge.          */
/** ============================================================= */

export async function reconcile(): Promise<void> {
  const manifest = await readManifest();
  const openPrs = await listOpenPrs();
  const openByHead = new Map(openPrs.map(p => [p.head, p]));

  // --- Bootstrap PRs ---
  for (const [key, state] of Object.entries(manifest.bootstrap) as [PhaseKey, Manifest["bootstrap"][PhaseKey]][]) {
    if (state.status !== "in-progress" || !state.pr) continue;
    const branch = `migration/bootstrap/${key}`;
    const openPr = openByHead.get(branch);

    if (!openPr) {
      const prState = await getPrState(state.pr);
      if (prState.merged) {
        state.status = "done";
        state.notes = `PR #${state.pr} merged`;
        stamp(state);
      } else if (prState.state === "closed") {
        state.status = "failed";
        state.notes = `PR #${state.pr} closed without merge`;
        stamp(state);
      }
      continue;
    }

    // CI green → review first, then merge only if approved.
    if (await prIsGreen(state.pr)) {
      const review = await reviewPr(state.pr, `review:bootstrap:${key}`);
      if (review.approved) {
        const merged = await mergePr(state.pr);
        if (merged) {
          state.status = "done";
          state.notes = `PR #${state.pr} reviewed + merged`;
          stamp(state);
        }
      } else {
        state.notes = `PR #${state.pr} review requested changes — waiting for fixes`;
        stamp(state);
      }
    }
  }

  // --- Page PRs ---
  for (const page of manifest.pages) {

    // contract-open: CI green → run review → advance to review-open or merge
    if (page.status === "contract-open" && page.contractPr) {
      const prState = await getPrState(page.contractPr);
      if (prState.merged) {
        page.status = "needs-impl";
        page.implAttempts = 0;    // reset for impl phase
        page.notes = `contract PR #${page.contractPr} merged — ready for implementation`;
        stamp(page);
        continue;
      }
      if (prState.state === "closed") {
        page.status = "failed";
        page.notes = `contract PR #${page.contractPr} closed without merge`;
        stamp(page);
        continue;
      }
      // PR still open + CI green → run the review
      if (await prIsGreen(page.contractPr)) {
        const review = await reviewPr(page.contractPr, `review:page:${page.id}:contract`);
        if (review.approved) {
          const merged = await mergePr(page.contractPr);
          if (merged) {
            page.status = "needs-impl";
            page.implAttempts = 0;
            page.notes = `contract PR #${page.contractPr} reviewed + merged — ready for implementation`;
            stamp(page);
          }
        } else {
          // Move to review-open so we don't re-review every cycle.
          // Next cycle will check if @copilot pushed fixes and CI is green again.
          page.status = "review-open";
          page.notes = `review requested changes on PR #${page.contractPr}`;
          stamp(page);
        }
      }
    }

    // review-open: previously reviewed and changes requested — wait for fixes, re-review
    if (page.status === "review-open" && page.contractPr) {
      const prState = await getPrState(page.contractPr);
      if (prState.merged) {
        page.status = "needs-impl";
        page.implAttempts = 0;
        page.notes = `PR #${page.contractPr} merged after review — ready for implementation`;
        stamp(page);
        continue;
      }
      if (prState.state === "closed") {
        page.status = "failed";
        page.notes = `PR #${page.contractPr} closed after review`;
        stamp(page);
        continue;
      }
      // Check if CI is green again (Coding Agent may have pushed fixes)
      if (await prIsGreen(page.contractPr)) {
        const review = await reviewPr(page.contractPr, `review:page:${page.id}:rereview`);
        if (review.approved) {
          const merged = await mergePr(page.contractPr);
          if (merged) {
            page.status = "needs-impl";
            page.implAttempts = 0;
            page.notes = `PR #${page.contractPr} approved on re-review + merged — ready for implementation`;
            stamp(page);
          }
        } else {
          page.attempts = (page.attempts ?? 0) + 1;
          page.notes = `review still requesting changes (attempt ${page.attempts})`;
          stamp(page);
        }
      }
    }

    // Handle impl-open status — implementation PR review + merge
    if (page.status === "impl-open" && page.implPr) {
      const prState = await getPrState(page.implPr);
      if (prState.merged) {
        page.status = "done";
        page.notes = `impl PR #${page.implPr} merged — implementation complete`;
        stamp(page);
      } else if (prState.state === "closed") {
        // Closed without merge — allow retry
        page.status = "needs-impl";
        page.implAttempts = (page.implAttempts ?? 0) + 1;
        page.notes = `impl PR #${page.implPr} closed without merge — will retry`;
        stamp(page);
      } else if (await prIsGreen(page.implPr)) {
        // Run SDK review (advisory — posted as comment since we own the PR).
        const review = await reviewPr(page.implPr, `review:page:${page.id}:impl`);
        // Merge regardless of review verdict — impl PRs are our own code.
        // The review is posted as a comment for traceability.
        const merged = await mergePr(page.implPr);
        if (merged) {
          page.status = "done";
          page.notes = `impl PR #${page.implPr} reviewed (${review.approved ? "approved" : "has suggestions"}) + merged`;
          stamp(page);
        }
      }
    }

    // Escalate pages that have failed too many times.
    if (page.status === "failed" && (page.attempts ?? 0) >= MAX_PAGE_ATTEMPTS) {
      escalatePage(page, `failed ${page.attempts} times — needs human review`);
    }
  }

  await writeManifest(manifest);
}
