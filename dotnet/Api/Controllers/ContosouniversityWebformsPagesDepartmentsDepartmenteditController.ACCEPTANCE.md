# Acceptance Checklist: Department Edit Page API Contract

## Scenarios
- Fetch department for edit (GET)
- Submit department changes (POST)
- Handle optimistic concurrency (row version)
- Create new department (POST with null id)
- Validation errors (missing/invalid fields)
- Concurrency conflict returns 409
- Redirect to department list on success

## Required Tests
- GET returns correct model for existing department
- POST creates/updates department as expected
- POST with stale rowVersion returns concurrencyError
- POST with invalid data returns 400
- All monetary values are strings (decimal)
- All dates are ISO-8601 strings

## UX Parity
- Instructor dropdown matches legacy
- All fields present: name, budget, startDate, admin
- Concurrency error message shown
- Redirect on save

## Callouts
- Response.Redirect to DepartmentList.aspx must be mapped to redirectUrl
- Any direct SQL must be replaced with repository method
- No use of Request.ServerVariables
- No heavy session usage
