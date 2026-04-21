# Skill: WebForms → React + API patterns

Authoritative mapping rules used by every phase. If something in the source
page doesn't match a rule here, flag it in the acceptance checklist rather
than inventing a new pattern.

## Event model

| WebForms | API / React |
|---|---|
| `Page_Load(!IsPostBack)` | `GET /api/{page}` → `{page}ViewModel`; `useQuery` on mount |
| `Page_Load(IsPostBack)` | Do nothing; React holds state locally |
| `Button_Click` | `POST /api/{page}/action-{name}`; `useMutation` onClick |
| `GridView_RowCommand` | `POST /api/{page}/items/{id}/{command}` |
| `GridView_Sorting` | Query param `?sort=field:asc` |
| `GridView_PageIndexChanging` | Query params `?page=&size=` |
| `DropDownList_SelectedIndexChanged` + AutoPostBack | Client-side state change; if it triggers data, issue a new query |
| `TextBox_TextChanged` + AutoPostBack | Debounced client-side state; mutation on blur or explicit save |
| `Wizard.NextButtonClick` | Multi-step form in React, one `POST /api/{page}/complete` at end |

## State model

| WebForms | Replacement |
|---|---|
| `ViewState["x"]` | React component state (`useState`) |
| `Session["x"]` (user-scoped) | JWT claims or server-side session via SystemWebAdapters for the transition period |
| `Session["x"]` (cart-like) | Dedicated API resource + client query cache |
| `Application["x"]` | Memory/distributed cache in API |
| `Cache["x"]` | `IMemoryCache` / `IDistributedCache` in API |
| Hidden fields (ViewState surrogate) | Zustand/context or React Hook Form field array |

## Control translation

| WebForms | React equivalent |
|---|---|
| `<asp:TextBox>` | `<input>` via React Hook Form |
| `<asp:DropDownList DataSource>` | `<select>` fed by `useQuery` |
| `<asp:GridView>` | TanStack Table |
| `<asp:Repeater>` | `.map()` |
| `<asp:UpdatePanel>` | Isolated component with own `useQuery` / `useMutation` |
| `<asp:Validator>` | Zod schema on the form |
| `<asp:LinkButton>` | `<button>` or `<Link>` depending on nav vs action |
| `<asp:Wizard>` | Small state machine (XState or useReducer) |
| `<asp:ReportViewer>` | `POST /api/{page}/export` returns a blob URL; `<a download>` |

## Things that MUST be called out in the acceptance checklist

- Any use of `Request.ServerVariables` — these don't cleanly map.
- Any direct SQL in code-behind — must become a repository method.
- Any `Server.Transfer` or `Response.Redirect` to another `.aspx`.
- Any page that both reads **and writes** `Session` heavily — call for human review.
- Any client-side JavaScript already present — check whether it duplicates the event model.
