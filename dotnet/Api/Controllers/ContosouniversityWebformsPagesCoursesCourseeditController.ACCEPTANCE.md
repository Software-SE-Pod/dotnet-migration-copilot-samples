# Acceptance Checklist: ContosouniversityWebformsPagesCoursesCourseeditController

## Scenarios
- GET returns course data for edit (existing) or blank for new
- POST creates or updates course, then returns redirect URL
- Department dropdown is populated
- Validation errors are surfaced as ProblemDetails
- Redirect to CourseList on success

## Required Tests
- GET with id returns correct course
- GET without id returns blank model
- POST with valid data creates/updates
- POST with invalid data returns error
- Department list is always present

## UX Parity
- All fields present: CourseID, Title, Credits, Department
- Validation matches legacy (required, range)
- Redirect matches legacy navigation

## Callouts
- Response.Redirect to CourseList.aspx must be mapped to redirectUrl in result
- No direct SQL in code-behind (uses EF)
- No Session, Application, or Cache usage
- No client-side JS in legacy
- No file I/O, email, or 3rd-party calls
