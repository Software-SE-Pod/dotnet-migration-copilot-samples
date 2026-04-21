# Skill: PWR (Domino's Power) domain rules

Project-specific constraints that override generic WebForms migration advice.
If a rule here conflicts with `webforms-patterns.md`, this file wins.

## Data estate

- **EIM** (SQL Server) is **read-only** from Power. Any WebForms code that
  writes to an `EIM_*` table must be flagged and escalated — do not migrate it.
- **Power Mart** is the authoritative write store for Power-owned data. The
  schema prefix is `power_mart.`.
- **PeopleSoft** links are read-only via views in Power Mart. Never query
  PeopleSoft databases directly from the API.
- Long-term, EIM is moving to Databricks. Do not tightly couple queries to
  physical column names — route through repository methods so the Databricks
  cutover is a later, isolated change.

## Identity

- Corporate users: Entra ID via Microsoft tenant.
- Franchisee users: Entra ID via the dedicated franchisee tenant + B2B guest.
  Some franchisees still use on-prem AD-backed accounts; these authenticate
  through the existing on-prem federation and appear as regular Entra users.
- **Do not** migrate any authentication-flavoured `.aspx` page until the
  Entra bootstrap phase is complete AND the franchisee tenant decision is
  captured in the PR description as a comment. Mark such pages as `blocked:auth-decision`.

## Deployment constraints

- Target infrastructure must be migratable off the current estate **before 2027**.
- The pipeline is moving from TFS → GitHub Actions. Until that is complete,
  any new workflows live alongside TFS and must NOT reference TFS-only
  variables (`$(Build.BuildId)` etc.).

## Page-specific gotchas

- **PDF export pages** rely on a legacy server-rendered library. Migrate these
  to **QuestPDF** on the API side; serve via `POST /api/{page}/export` →
  `application/pdf` blob. Do NOT try to reimplement in the browser.
- **Store dashboards** have a 30-second SLA. Keep these server-rendered on the
  React side (use React Server Components via a Node adapter, OR fall back to
  server-side cached JSON with SWR).
- **Franchisee-uploaded files** must go to Blob `uploads/<franchisee-id>/`.
  The SAS-link helper is in phase 04.

## Cutover

Pages are never "flipped over" during the page phase. There is a dedicated
cutover phase (not yet scaffolded) that:
1. Routes `/oldpath` through YARP to the new React page.
2. Monitors error rate + latency for 72h.
3. Deletes the `.aspx` + code-behind.

Do not delete legacy files early.
