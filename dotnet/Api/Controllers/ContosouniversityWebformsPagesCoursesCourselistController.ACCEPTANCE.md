# Acceptance Checklist: ContosouniversityWebformsPagesCoursesCourselistController

## Scenarios
- List courses with/without department filter
- Paging and sorting
- Department dropdown populates correctly
- Handles empty state (no courses)

## Required Tests
- Returns correct data for GET with/without departmentId
- Pagination works (page, pageSize)
- Returns department options
- Handles invalid departmentId gracefully
- Returns ProblemDetails for errors

## UX Parity
- Grid columns: Number, Title, Credits, Department, Enrolled
- Department filter dropdown
- Paging controls
- "Edit" and "Add New Course" links (API contract only; navigation handled in React)

## Special Review
- No direct SQL in code-behind
- No use of Request.ServerVariables
- No heavy Session usage
- No client-side JS in legacy page
