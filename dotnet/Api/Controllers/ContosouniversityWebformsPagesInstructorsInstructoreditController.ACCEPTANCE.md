# Acceptance Checklist: Instructor Edit API/Page

## Scenarios
- Load for edit (GET with id)
- Load for create (GET without id)
- Submit create (POST with no id)
- Submit update (POST with id)
- Validation errors (missing/invalid fields)
- Course assignment (checkbox list)
- Office assignment logic (add/remove)
- Redirect to InstructorList on success

## Required Tests
- GET returns correct model for existing instructor
- GET returns empty model for new
- POST creates instructor
- POST updates instructor
- POST handles office assignment add/remove
- POST assigns courses
- POST validation errors
- POST redirects to InstructorList

## UX Parity
- All fields present: Last Name, First Name, Hire Date, Office Location, Courses
- Validation matches legacy (required fields)
- Checkbox list for courses
- Office assignment logic matches legacy
- Redirect on save

## Special Notes
- If any direct SQL, Response.Redirect, or Session usage is found, escalate for review.
- No direct SQL or session usage found in code-behind.
- Response.Redirect to InstructorList is mapped to redirectUrl in result.
