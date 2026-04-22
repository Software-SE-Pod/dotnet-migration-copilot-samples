# Acceptance Checklist: ContosouniversityWebformsPagesStudentsStudentlist

## Scenarios
- Student grid displays with paging, sorting, and search
- Student can be deleted from the grid

## Required tests
- GET returns correct grid data with paging, sorting, and search
- DELETE removes student and returns success
- Error handling returns ProblemDetails envelope

## UX parity requirements
- Grid columns: ID, Last Name, First Name, Enrollment Date, Enrollments count
- Paging, sorting, and search must match legacy
- Deletion shows confirmation and error messages

## Migration gotchas
- No direct SQL in controller (must use repository)
- No use of Request.ServerVariables
- No client-side JS in legacy
- No heavy session usage
- No Response.Redirect to other .aspx
- If any of these are found in future, escalate for review
