# Phase 02 — Bootstrap Data (Azure SQL + EF Core + Managed Identity)

Add the data access layer to the API. This phase introduces EF Core pointed
at Azure SQL using **Managed Identity** (no passwords, no connection strings
with secrets) and scaffolds the DbContext from the existing EIM / Power Mart
schema.

## Goal

1. `/dotnet/Data` project: EF Core 8, `DbContext` with one `DbSet<>` per
   existing table reachable from the WebForms app (use `Scaffold-DbContext`
   against a provided connection string, then commit the generated types).
2. API uses DI-registered `DbContext` via `AddDbContextPool`.
3. Production connection uses `Active Directory Default` auth (Managed
   Identity in Azure, developer's token locally).
4. Local dev uses LocalDB with a seed script.

## Non-negotiable rules

1. **No raw secrets in any `appsettings*.json` checked in.** Only the server
   name and database name.
2. Do not move EIM/PowerMart business logic into EF yet — we are only adding
   read capability. Writes must throw `NotImplementedException` with a TODO
   comment so the page phases explicitly migrate them.
3. Generated entities live under `/dotnet/Data/Entities/` and are partial
   classes so later phases can extend without regenerating conflicts.
4. Domino's-specific: tables in the `power_mart` schema and tables prefixed
   `EIM_` are read-only from this app. Enforce via an EF Core interceptor.

## Acceptance

- `dotnet build` passes.
- `dotnet ef dbcontext info` works against a local LocalDB.
- A single `GET /api/diagnostics/db-check` endpoint returns `{ ok: true,
  server: "...", tables: <count> }` when hit with a valid token.
