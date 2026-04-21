# Phase 10 — Page Contract

You are converting a single legacy ASP.NET WebForms page into an **API-first
contract**. You **do not implement the business logic** in this phase — you
only produce the contract (OpenAPI YAML), regenerate the NSwag outputs, and
drop empty shells for controller + React page. A subsequent PR (handled by
the GitHub Copilot Coding Agent) will fill in the implementation.

## Inputs

- Page id: **{{PAGE_ID}}**
- Legacy markup + code-behind: **{{ASPX_PATH}}** (+ `.cs`)
- Pre-classified scenario: **{{SCENARIO}}**
- Pre-classified risk: **{{RISK}}**
- Classifier notes: {{NOTES}}

## Deliverables (in this order)

### 1. Analyze the legacy page

Open `{{ASPX_PATH}}` and its code-behind. Produce a terse analysis covering:
- Data in: form fields, query string, route, session keys used
- Data out: what the page renders / navigates to
- Side effects: DB writes, file I/O, email, 3rd-party calls
- Events wired (`Button1_Click`, `GridView1_RowCommand`, etc.)

### 2. Extend `contracts/openapi.yaml`

Add operations that express the above in REST terms. Conventions:

| Legacy shape | OpenAPI operation |
|---|---|
| `Page_Load` reading data | `GET /api/{pageId}`  → returns `{pageId}ViewModel` |
| `Button_Click` submit | `POST /api/{pageId}/submit` → accepts `{pageId}SubmitRequest`, returns `{pageId}SubmitResult` |
| Grid row edit | `PUT /api/{pageId}/items/{id}` |
| Grid row delete | `DELETE /api/{pageId}/items/{id}` |
| Paged grid read | `GET /api/{pageId}/items?page=&size=&sort=` |

Rules:
- Every schema MUST have a `description`.
- NO `additionalProperties: true` on response schemas.
- All monetary values use `type: string, format: decimal`.
- All dates use `type: string, format: date-time`.
- OperationIds follow `<verb><PascalPageId>[Suffix]`.

### 3. Run NSwag

Invoke `nswag run tools/nswag.json`. This must regenerate:
- `/dotnet/ApiContracts/Generated/*.cs` (DTOs + abstract controller bases)
- `/web/src/api/generated/*.ts` (types + fetch client)

If the command fails, fix the YAML until it passes. Do not hand-edit the
generated files.

### 4. Create empty shells

- `/dotnet/Api/Controllers/{PascalPageId}Controller.cs` — derives from the
  generated abstract base, every method body is `throw new NotImplementedException();`
  with a `// TODO(coding-agent): port <MethodName> from {{ASPX_PATH}}.cs` comment.
- `/web/src/pages/{PascalPageId}/index.tsx` — a minimal React component that
  calls the generated client's `get{PascalPageId}()` once on mount and renders
  `<pre>{JSON.stringify(data, null, 2)}</pre>`. This is intentionally ugly —
  the coding agent will replace it.
- `/web/src/pages/{PascalPageId}/__tests__/index.test.tsx` — stub test that
  asserts the component calls the API.

### 5. Add an acceptance checklist file

`/dotnet/Api/Controllers/{PascalPageId}Controller.ACCEPTANCE.md` with the
scenarios, required tests, and UX parity requirements that the implementation
PR must satisfy. This file is what @copilot reads first.

## Rules

- **DO NOT** implement controller bodies beyond `NotImplementedException`.
- **DO NOT** write meaningful React UI. Placeholder only.
- **DO NOT** delete the original `.aspx` / `.aspx.cs` — cutover happens in a
  later phase, only when the new page passes smoke tests.
- The contract PR must be small and mostly generated code.
