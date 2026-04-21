# Phase 01 — Bootstrap Identity (Entra ID)

Wire **Microsoft Entra ID** authentication into both the API and the React app.
This phase is additive; it must not break the YARP passthrough to the legacy
WebForms app.

## Goal

1. API (`/dotnet/Api`) accepts JWT bearer tokens from Entra ID.
2. React (`/web`) uses `@azure/msal-browser` + `@azure/msal-react` to sign in
   and acquire tokens for the API.
3. The Host project validates tokens before forwarding authenticated routes;
   anonymous routes still proxy through to WebForms (for login continuity).

## Non-negotiable rules

1. **Zero secrets in source.** All tenant/client ids come from config
   (`appsettings.json` keys, later bound to Key Vault in phase 03).
2. Use `Microsoft.Identity.Web` on the .NET side (NOT raw JwtBearer).
3. Expose a single API scope: `api://<client-id>/access_as_user`.
4. The React app MUST use the `loginRedirect` flow by default; popup only for
   token refresh. This matches Domino's franchisee-compatible browsers.
5. Add a single React `<RequireAuth>` wrapper and an `<UnauthenticatedTemplate>`
   fallback that redirects to the Entra login page.
6. **Do not touch** the WebForms auth pages. A later page-level phase will
   convert franchisee-specific auth flows.

## Acceptance

- `dotnet build` and `npm run build` both pass.
- A basic protected `GET /api/whoami` returns the authenticated user's upn.
- The React app's `/me` route shows the signed-in user's display name.
- Anonymous request to the WebForms app still succeeds via Host proxy.
