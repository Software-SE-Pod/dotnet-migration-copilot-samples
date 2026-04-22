# Acceptance Checklist: Admin Dashboard API Contract

## Scenarios
- Fetch dashboard summary (GET /api/contosouniversity-webforms-pages-admin-dashboard)
- Fetch paged recent enrollments (GET /api/contosouniversity-webforms-pages-admin-dashboard/items)

## Required Tests
- Returns correct counts for students, courses, departments, instructors, enrollments
- Returns recent enrollments grid (student, course, grade)
- Handles paging and sorting for grid
- Returns session ID, server, .NET version
- Returns dashboardVisits from session
- Error responses conform to ProblemDetails

## UX Parity
- All dashboard numbers match legacy page
- Grid matches legacy columns and order
- Session-based visit count is accurate
- System info (session, server, .NET) present

## Callouts
- Session["DashboardVisits"] is read and written (user-scoped session)
- No direct SQL in code-behind
- No Response.Redirect/Server.Transfer
- No client-side JS in legacy
- No file I/O, email, or 3rd-party calls
- No writes to EIM_* tables
- No authentication logic present
