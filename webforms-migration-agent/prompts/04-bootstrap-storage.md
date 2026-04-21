# Phase 04 — Bootstrap Storage (Azure Blob)

Add Azure Blob Storage with Managed Identity for any file I/O the WebForms
app currently does via disk or SMB shares.

## Goal

1. `/dotnet/Storage` project wrapping `BlobServiceClient` via DI.
2. Configured containers (Key Vault driven): `uploads`, `reports`, `exports`.
3. Sas-link helper for client-direct upload from the React app.
4. Replace all `Server.MapPath` / `File.WriteAllBytes` references in the
   existing WebForms app **with a compile-time error shim** that instructs
   the future page phase to migrate to the new API.

## Non-negotiable rules

1. No connection strings — Managed Identity only.
2. No anonymous blob access. All public reads must be via time-limited SAS.
3. Preserve existing folder structure when migrating disk paths to container
   prefixes (e.g. `C:\Reports\2024\` → `reports/2024/`).

## Acceptance

- A round-trip upload/download test passes in the API.
- The WebForms app still builds, but references to file APIs produce a
  clear compile-time obsolete warning pointing to the migration guide.
