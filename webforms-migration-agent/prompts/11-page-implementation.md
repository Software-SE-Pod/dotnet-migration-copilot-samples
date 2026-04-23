# Phase 11 — Page Implementation

You are implementing the real business logic and React UI for a migrated page.
The contract (OpenAPI spec, generated types, stub controllers, stub React pages)
has already been merged. Your job is to **replace every stub with working code**.

## Target page

- Page id: **{{PAGE_ID}}** (PascalCase: **{{PASCAL_PAGE_ID}}**)
- Legacy source: **{{ASPX_PATH}}** (+ `.cs` code-behind)
- Scenario: **{{SCENARIO}}**

## Mandatory steps — do ALL of these, in order

1. **Read the acceptance checklist** at
   `dotnet/Api/Controllers/{{PASCAL_PAGE_ID}}Controller.ACCEPTANCE.md`.
   This file lists the exact scenarios and tests you must implement.

2. **Read the legacy source** at `{{ASPX_PATH}}` and `{{ASPX_PATH}}.cs`.
   Map every event handler to its corresponding controller method. Understand
   the data flow: what the page reads, writes, and renders.

3. **Implement EVERY controller method** in
   `dotnet/Api/Controllers/{{PASCAL_PAGE_ID}}Controller.cs`.
   - Replace every `throw new NotImplementedException()` with real EF Core logic.
   - Use the injected `AppDbContext` for database operations.
   - Use the storage service for any file I/O.
   - Handle validation, error cases, and edge conditions from the legacy code.
   - Do NOT leave any `NotImplementedException` — every method must have real logic.

4. **Build the real React UI** in `web/src/pages/{{PASCAL_PAGE_ID}}/index.tsx`.
   - Replace the `<pre>{JSON.stringify(data)}</pre>` placeholder with a proper UI.
   - Match the legacy page's UX: field labels, validation, grid columns, pagination,
     filters, buttons, and navigation.
   - Use `@tanstack/react-query` for server state management.
   - Use React Hook Form + Zod for form validation (derive schemas from generated types).
   - Use the generated API client from `web/src/api/generated/`.

5. **Write unit tests**:
   - At least one test per controller method in `dotnet/Api/Controllers/` test project.
   - At least one React component test per major UX flow in
     `web/src/pages/{{PASCAL_PAGE_ID}}/__tests__/index.test.tsx`.

6. **Verify builds pass**: Run `dotnet build` and `npm run build`. Fix any errors.

## Rules

- **NEVER** regenerate NSwag outputs. The generated types are fixed.
- **NEVER** add new API endpoints. If you need one, note it in a code comment.
- **NEVER** modify `contracts/openapi.yaml`.
- **ALWAYS** keep the legacy `.aspx` files in place.
- If a dependency on another page exists, stub the link using YARP passthrough.
- Focus on correctness and completeness over polish.
