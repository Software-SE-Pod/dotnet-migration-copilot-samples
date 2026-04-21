# Phase 11 — Page Implementation (Coding Agent)

> This prompt is **not** executed by the orchestrator. It lives on the PR body
> that the orchestrator opens after Phase 10, and it is read by the GitHub
> Copilot Coding Agent when the PR is assigned to `@copilot`.

## Your job

Fill in the controller bodies and the React page for the page described by
this PR's contract. **Do not** change `contracts/openapi.yaml` — it is fixed.

## Workflow

1. Read `dotnet/Api/Controllers/{PascalPageId}Controller.ACCEPTANCE.md`.
2. Read `{{ASPX_PATH}}` and `{{ASPX_PATH}}.cs`. Mentally map every event
   handler → an operation on the controller.
3. Replace every `NotImplementedException` with the real logic. Use EF Core
   via the injected DbContext. Use the storage service for any file I/O.
4. Build the real React UI against the generated client. Match the legacy
   page's UX: field labels, validation behaviour, grid columns, pagination,
   filters. Use `@tanstack/react-query` for server state and React Hook Form
   + Zod (derived from the generated types) for forms.
5. Write unit tests: at least one per controller method + one React component
   test per major UX flow.
6. Run `dotnet build`, `npm run build`, `dotnet test`, `npm test`. All green
   before you request review.
7. Add a smoke test entry to `tests/smoke/pages.yaml` so CI covers the new
   route end-to-end.

## Rules

- **NEVER** regenerate NSwag outputs in this PR. They are fixed.
- **NEVER** add new endpoints. If you need one, open an issue instead.
- **ALWAYS** keep the legacy `.aspx` in place — a later cutover phase will
  delete it once the smoke test has passed in production.
- If the page depends on an unmigrated page, stub the link to it using YARP
  passthrough (`/webforms/<old-path>`). Do not block on the dependency.
