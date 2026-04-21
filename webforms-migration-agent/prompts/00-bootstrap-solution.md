# Phase 00 — Bootstrap Solution

You are the **modernization orchestrator agent**. You are running headless in a
GitHub Actions Windows runner. **Do not ask questions; make decisions.** Follow
this phase end-to-end in one session.

## Goal

Create the skeleton of the target solution **next to** the existing WebForms
app, without touching the WebForms app yet. At the end of this phase the repo
must contain:

```
/WebApp              (existing ASP.NET WebForms, untouched)
/dotnet
  /Api               ASP.NET Core 8 Web API project (empty controllers folder)
  /ApiContracts      .NET class library (NSwag output target — empty /Generated)
  /Host              ASP.NET Core Web host using SystemWebAdapters, proxies
                     everything to /WebApp via YARP until pages are migrated
/web
  /src
    /api/generated   (empty placeholder)
    /pages           (empty placeholder)
  package.json       (Vite + React 18 + TypeScript)
/contracts
  openapi.yaml       (empty-ish stub: info, servers, empty paths)
/tools
  nswag.json         (driver targeting contracts/openapi.yaml →
                     ApiContracts/Generated AND web/src/api/generated)
/.github/workflows
  build.yml          (runs dotnet build + npm run build + nswag drift check)
```

## Non-negotiable rules

1. **Do NOT modify the existing `/WebApp` project** in this phase.
2. The `Host` project MUST use `Microsoft.AspNetCore.SystemWebAdapters` so that
   incremental migration works later.
3. The YARP forward rule is `/{**catchAll}` → the WebForms app. Later phases
   will carve routes out of this.
4. The API project uses **.NET 8**. Do not target preview frameworks.
5. React uses **Vite + TypeScript + React 18** — no Next.js, no frameworks.
6. `contracts/openapi.yaml` must declare `openapi: 3.0.3`, one `info.title`,
   servers for `http://localhost:5000` (API) and `http://localhost:5173` (web),
   and at least one dummy `GET /health` operation so NSwag has something to emit.
7. `tools/nswag.json` must produce **both** outputs from the single YAML file
   in a single run.
8. The `build.yml` workflow MUST fail if `nswag run` produces a diff — this is
   the contract-drift gate.

## Acceptance

At the end of this phase:

- `dotnet build` succeeds for the whole solution
- `npm install && npm run build` succeeds in `/web`
- `nswag run tools/nswag.json` produces no diff on a clean checkout
- The Host, when run locally, starts and proxies `/` to the WebForms app

## Output

Commit everything on the current branch. Do not open a PR — the orchestrator
will do that. Do not create additional branches.
