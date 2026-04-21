# Skill: OpenAPI contract conventions

`contracts/openapi.yaml` is the **single source of truth**. Both the .NET DTOs
and the TypeScript client are generated from it by NSwag. Agents must never
edit generated code directly; they change the YAML and re-run NSwag.

## Structural rules

- `openapi: 3.0.3` (NSwag-friendly).
- Single file. No `$ref` to external files.
- Schemas live under `components.schemas`. One schema per DTO; never inline
  response or request bodies.
- Every operation has: `operationId`, `summary`, `tags: [<page-id>]`,
  `x-page-id: <page-id>` extension (used by CI to scope drift checks).

## Naming

- OperationId: `<verb><PascalPageId>[Suffix]`
  - `getOrders`, `submitOrders`, `updateOrdersItem`, `deleteOrdersItem`, `listOrdersItems`
- Schemas: `<PascalPageId><Purpose>` → `OrdersViewModel`, `OrdersSubmitRequest`, `OrdersItem`
- Enum values: `PascalCase`.

## Type rules

- Money → `{ type: string, format: decimal, pattern: "^-?\\d+(\\.\\d{1,4})?$" }`.
- Dates → `{ type: string, format: date-time }` (UTC, ISO-8601).
- Durations → `{ type: string, format: duration }` (ISO-8601).
- IDs → `{ type: string }` (never int unless the legacy DB forces it).
- Pagination response envelope: reuse `components.schemas.Page<T>` pattern.
- Error envelope: every error response references `components.schemas.ProblemDetails`.

## Discriminated unions

When a page has multiple submit modes (e.g. "save draft" vs "submit"), use:

```yaml
OrdersSubmitRequest:
  oneOf:
    - $ref: '#/components/schemas/OrdersSaveDraftRequest'
    - $ref: '#/components/schemas/OrdersSubmitFinalRequest'
  discriminator:
    propertyName: kind
    mapping:
      draft: '#/components/schemas/OrdersSaveDraftRequest'
      final: '#/components/schemas/OrdersSubmitFinalRequest'
```

This gives us exhaustive `switch (req.kind)` checks in C# AND exhaustive
TypeScript narrowing.

## Forbidden

- `additionalProperties: true` on any response schema.
- `type: object` with no properties.
- Inline anonymous schemas more than two levels deep.
- Reusing one DTO as both request and response (creates nullable churn).
