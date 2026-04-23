# Phase 11 — Page Implementation

You MUST implement real business logic NOW. Do NOT plan, summarize, or describe.
Open files, edit them, save them. Every instruction below is an ACTION to execute.

## Target page

- Page id: **{{PAGE_ID}}** (PascalCase: **{{PASCAL_PAGE_ID}}**)
- Legacy source: **{{ASPX_PATH}}** (+ `.cs` code-behind)
- Scenario: **{{SCENARIO}}**

## Step 1 — Read these files NOW

Open and read ALL of these files:
- `dotnet/Api/Controllers/{{PASCAL_PAGE_ID}}Controller.ACCEPTANCE.md`
- `dotnet/Api/Controllers/{{PASCAL_PAGE_ID}}Controller.cs`
- `{{ASPX_PATH}}`
- `{{ASPX_PATH}}.cs`
- `web/src/pages/{{PASCAL_PAGE_ID}}/index.tsx`

## Step 2 — Implement the controller

Open `dotnet/Api/Controllers/{{PASCAL_PAGE_ID}}Controller.cs` and REPLACE every
`throw new NotImplementedException();` with real C# code that:
- Uses EF Core via the injected `AppDbContext` for database operations
- Implements the same logic as the legacy `.aspx.cs` code-behind
- Maps legacy event handlers to REST controller methods
- Handles validation and error cases

Write the complete file. Do NOT leave any `NotImplementedException`.

## Step 3 — Build the React page

Open `web/src/pages/{{PASCAL_PAGE_ID}}/index.tsx` and REPLACE the entire
`<pre>{JSON.stringify(data, null, 2)}</pre>` placeholder with a real React UI:
- Use the generated API client from `../api/generated/`
- Create proper form fields, data grids, buttons matching the legacy page
- Use `@tanstack/react-query` for data fetching
- Use React Hook Form for form handling
- Include proper validation, loading states, and error handling

Write the complete file. Do NOT leave any `JSON.stringify(data` placeholder.

## Step 4 — Write tests

Create/update `web/src/pages/{{PASCAL_PAGE_ID}}/__tests__/index.test.tsx` with at
least one meaningful test for the main UI flow.

## Rules

- NEVER modify `contracts/openapi.yaml` or regenerate NSwag outputs
- NEVER add new API endpoints
- ALWAYS keep the legacy `.aspx` files in place
- Focus on correctness — make the code compile and work
