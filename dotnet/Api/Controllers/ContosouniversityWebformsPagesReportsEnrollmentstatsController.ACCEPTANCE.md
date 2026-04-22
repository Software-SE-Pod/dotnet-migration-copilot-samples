# Acceptance Checklist: EnrollmentStats API Contract

## Scenarios
- Fetch Enrollment Stats grid, filtered by department
- Export Enrollment Stats as CSV

## Required Tests
- GET returns correct data for all and filtered departments
- POST /export returns a valid CSV download URL
- Error handling: invalid departmentId, server errors

## UX Parity
- Department dropdown matches legacy
- Grid columns: Course, Department, Enrolled, Avg Grade
- Yearly stats match legacy

## Callouts
- No direct SQL in code-behind (uses EF)
- No Session, ViewState, or Application state
- No Response.Redirect or Server.Transfer
- No client-side JS in legacy
- No writes to EIM/Power Mart
- No authentication logic
