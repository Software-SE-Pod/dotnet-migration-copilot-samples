# Phase 03 — Bootstrap Secrets (Azure Key Vault)

Wire Azure Key Vault as the configuration secret backend for both Host and API.
Remove any remaining secrets from `appsettings.*.json` files.

## Goal

1. Both apps load configuration via `AddAzureKeyVault` using the Managed
   Identity already established in phase 01.
2. `appsettings.Production.json` references secret *names* only; values come
   from Key Vault at startup.
3. A small `SecretsHealthCheck` pings Key Vault at `/health/secrets`.
4. The React app DOES NOT talk to Key Vault — it reads a small public config
   JSON served by the API (`GET /api/public-config`) that contains only
   non-sensitive values (Entra client id, API base URL, feature flags).

## Non-negotiable rules

1. **No access keys.** Only Managed Identity.
2. Log statements MUST never echo secret values, even in Development.
3. Developers without Azure access get a `dotnet user-secrets` fallback that
   only works when `ASPNETCORE_ENVIRONMENT=Development`.

## Acceptance

- Startup succeeds with an empty `appsettings.*.json` `"ConnectionStrings"`
  section — all values come from Key Vault.
- `/health/secrets` returns 200 when Key Vault is reachable.
