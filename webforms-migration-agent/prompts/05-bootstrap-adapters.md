# Phase 05 — Bootstrap SystemWebAdapters

Enable **incremental migration** by configuring the
`Microsoft.AspNetCore.SystemWebAdapters` bridge between the .NET Core Host
and the legacy ASP.NET WebForms application. After this phase, the two apps
share session + auth cookies and the Host can selectively handle routes
(e.g. `/pages/orders`) that future phases have migrated.

## Goal

1. Host project references the Adapters remote-app NuGet.
2. WebForms app exposes the adapter remote endpoint (small config-only change).
3. Both apps agree on a shared data-protection key ring (stored as a Key Vault
   secret established in phase 03) so session + auth cookies round-trip.
4. A routing convention: anything under `/next/*` is handled by the new stack
   (React SPA or .NET Core API); everything else falls through YARP to WebForms.

## Non-negotiable rules

1. Changes to the WebForms app in this phase MUST be limited to web.config
   and a single session/auth bridge file. No code-behind edits.
2. The adapter session store uses SQL Server (via EF Core from phase 02),
   NOT in-memory — franchisee deployments may run multiple instances.
3. A canary page `/next/_adapter-check.aspx` (actually served from the new
   Razor host) proves session sharing: it displays the user id and a session
   counter that increments when you load a WebForms page and come back.

## Acceptance

- `dotnet build` passes.
- Canary page demonstrates session continuity both directions.
- YARP still proxies all unconverted routes — no 404 regressions.
