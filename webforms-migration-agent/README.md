# WebForms → React + .NET Autonomous Migration Agent

A 24/7 autonomous migration loop built on the **GitHub Copilot SDK**, orchestrated
from **GitHub Actions**, that incrementally converts an ASP.NET WebForms application
to a **React SPA + .NET Core Web API** with an **OpenAPI (NSwag) contract as the
single source of truth** for types and API clients on both sides.

## The Big Idea

Instead of letting a single Coding Agent session try to "port" a page — which never
fits in one PR (auth, DI, DTOs, controllers, React components, routing all at once) —
this orchestrator **decomposes the work into a phase pipeline** and runs each phase
as its own Copilot SDK session. State lives in a JSON manifest in the repo, so every
GH Actions run is restart-safe and resumable.

### API-First Contract Flow

```
 .aspx page (legacy)
      │
      ▼
 1.  Classify page → scenario (form | grid | report | wizard | dashboard)
      │
      ▼
 2.  Generate/extend  openapi.yaml   ← single source of truth
      │
      ▼
 3.  NSwag codegen (enforced by orchestrator after SDK session)
        ├─► dotnet/ApiContracts/*.cs         (DTOs, ASP.NET Core abstract controllers)
        └─► web/src/api/generated/*.ts       (TS types + typed fetch client)
      │
      ▼
 4.  Open "Contract PR" with: openapi.yaml + generated code + empty controller impls +
     empty React page shell + implementation prompt for @copilot
      │
      ▼
 5.  Assign @copilot (Coding Agent) → implements controller logic + React UI
      │
      ▼
 6.  CI validates: build, contract drift check, tests, smoke
      │
      ▼
 7.  Orchestrator reconciles: merges green PRs, advances state, escalates failures.
```

The **contract PR** is the magic. It's a fully deterministic, codegen-driven PR with
no ambiguous choices — the Coding Agent only has to fill in the bodies of known
methods and render a known data shape. That's a size of work it can handle reliably.

## Architecture

### State Machine

**Bootstrap phases** (sequential, one PR each):
```
solution → identity → data → secrets → storage → adapters
```

**Page migration** (parallel after bootstrap):
```
pending → contract-open → review-open → done   (happy: CI green, review approved, merged)
pending → contract-open → done                  (fast: review approved on first pass)
pending → contract-open → review-open → failed  (review keeps requesting changes)
pending → contract-open → failed                (Coding Agent couldn't complete)
pending → contract-open → needs-human           (exceeded retry cap)
pending → blocked                               (auth pages, awaiting Entra decision)
```

### Governor Controls

- **Max open PRs**: configurable (default 3) — prevents runaway
- **Premium request budget**: per-run cap tracked in manifest
- **Wall-clock budget**: 270 min default (fits in a 300-min Actions job)
- **Retry escalation**: after 3 failed attempts, pages are marked `needs-human`
- **Auth page blocking**: auth-flavoured pages auto-blocked per PWR domain rules

### Reconciliation + Review

Every run starts by reconciling all open PRs:
- **Merged** → mark done, advance state
- **Closed unmerged** → mark failed, allow retry
- **Green CI** → run Copilot SDK review session:
  - **Review approves** → auto-merge, mark done
  - **Review requests changes** → mark `review-open`, wait for Coding Agent fixes
- **Still in progress** → leave as-is

## Why GitHub Actions (not ACA)

- **6-hour job limit is a non-issue**: orchestrator is restart-safe, cron re-enters.
- **State in the repo**: `.migration/manifest.json`, committed each pass.
- **Zero ops**: GitHub runs the loop; Windows runner handles .NET Framework.
- **~$230/mo** standard `windows-latest` for ~8h/day active — rounding error.

## Folder Layout

```
webforms-migration-agent/
├── src/
│   ├── orchestrator.ts      # main loop: inventory → reconcile → bootstrap → pages
│   ├── state.ts             # manifest CRUD, types, budget, escalation helpers
│   ├── phases.ts            # bootstrap + contract phase runners + reconcile
│   ├── copilot.ts           # @github/copilot-sdk wrapper with audit logging
│   ├── github.ts            # Octokit: branches, PRs, @copilot assign, default branch
│   ├── openapi.ts           # NSwag invocation + codegen consistency validation
│   └── pageClassifier.ts    # .aspx discovery + heuristic classification
├── prompts/
│   ├── 00-bootstrap-solution.md   # scaffold host, API, React, NSwag, YARP
│   ├── 01-bootstrap-identity.md   # Entra ID + MSAL wiring
│   ├── 02-bootstrap-data.md       # EF Core + Azure SQL + Managed Identity
│   ├── 03-bootstrap-secrets.md    # Key Vault config provider
│   ├── 04-bootstrap-storage.md    # Azure Blob + SAS helpers
│   ├── 05-bootstrap-adapters.md   # SystemWebAdapters bridge
│   ├── 10-page-contract.md        # generates YAML + DTOs + shells
│   └── 11-page-implementation.md  # instructions for @copilot on the PR
├── skills/
│   ├── webforms-patterns.md       # ViewState/postback → React mapping
│   ├── openapi-contract.md        # YAML conventions + NSwag rules
│   └── pwr-domain.md              # Domino's-specific (PowerMart, EIM, PDF export)
├── .github/workflows/
│   ├── migrate-loop.yml           # cron + workflow_dispatch entry point
│   ├── copilot-setup-steps.yml    # runner setup for Coding Agent
│   └── build.yml                  # CI for orchestrator itself
├── .migration/
│   ├── manifest.json              # THE state — pages, phases, attempts, budget
│   └── manifest.schema.json       # JSON Schema (draft-07)
├── package.json
├── tsconfig.json
└── README.md
```

## Quickstart

```bash
cd webforms-migration-agent
npm install

# Dry run locally (no commits / PRs):
MIGRATION_DRY_RUN=1 GITHUB_REPOSITORY=owner/repo npx tsx src/orchestrator.ts
```

In production the loop runs automatically via `.github/workflows/migrate-loop.yml`.

## Configuration

Environment variables consumed by the orchestrator:

| Var | Purpose |
|---|---|
| `COPILOT_GITHUB_TOKEN` | Auth for `@github/copilot-sdk` |
| `GH_TOKEN`             | Octokit auth (PRs, issues, assignments) |
| `GITHUB_REPOSITORY`    | `owner/repo` (provided by Actions) |
| `MIGRATION_BUDGET_MINUTES` | Wall-clock stop for the run (default 270) |
| `MIGRATION_MAX_OPEN_PRS`   | Governor — max concurrent PRs (default 3) |
| `MIGRATION_TARGET_REPO`    | Path to the WebForms repo root (default cwd) |
| `MIGRATION_DRY_RUN`        | `1` = plan only, no commits |

## Required Secrets

| Secret | Purpose |
|---|---|
| `MIGRATION_PAT` | GitHub PAT with `repo` + `workflow` scopes. Required for PR creation and triggering downstream workflows. |
| `COPILOT_PAT` | Token for Copilot SDK authentication (can be same as MIGRATION_PAT if scopes allow). |

## How It Works

1. **Inventory**: On first run, scans the target repo for `.aspx` files, classifies
   each by scenario + risk, auto-blocks auth pages, and opens an inventory PR.

2. **Bootstrap**: Six sequential phases scaffold the new stack (solution, identity,
   data, secrets, storage, SystemWebAdapters). Each runs as a Copilot SDK session,
   opens a PR, and waits for CI.

3. **Page Migration**: For each page (low-risk first), the orchestrator:
   - Runs a "contract" SDK session that edits `openapi.yaml`
   - Runs NSwag to regenerate .NET + TS artifacts
   - Opens a PR with the contract + generated code + implementation instructions
   - Assigns `@copilot` (Coding Agent) to implement the business logic

4. **Reconciliation + Review**: Every run checks all open PRs. When CI is green,
   the orchestrator runs a **Copilot SDK review session** that examines the PR diff
   for contract fidelity, security, data integrity, and React correctness. Only
   PRs that pass review get auto-merged. PRs that fail review get a
   `REQUEST_CHANGES` review posted — the Coding Agent can then push fixes, and the
   orchestrator re-reviews on the next cycle.

5. **Budget & Escalation**: Premium requests are tracked. Pages that fail 3 times
   are escalated to `needs-human`. The wall-clock governor prevents runaway jobs.

## Status

Production-ready scaffold. All `src/` files are wired end-to-end with proper error
handling, retry logic, budget tracking, and state machine transitions. Phase prompts
are comprehensive starter versions — tune them per codebase before running at scale.
