# Acceptance Checklist: Student Edit Page API Contract

## Scenarios
- Fetching an existing student for edit (GET)
- Creating a new student (GET with no id)
- Submitting changes to an existing student (POST)
- Submitting a new student (POST)
- Handling validation errors (400)
- Handling DB errors (500)
- Redirect to StudentList on success

## Required Tests
- GET returns correct model for existing and new
- POST creates/updates student, returns success and redirectUrl
- POST with invalid data returns 400
- POST with DB error returns 500

## UX Parity
- All fields present: LastName, FirstName, EnrollmentDate
- Validation matches legacy (required fields)
- Redirect on save matches legacy

## Callouts
- Any direct SQL in code-behind must be refactored to repository
- Any Response.Redirect must be mapped to redirectUrl in result
- No use of Session, ViewState, or Application state
