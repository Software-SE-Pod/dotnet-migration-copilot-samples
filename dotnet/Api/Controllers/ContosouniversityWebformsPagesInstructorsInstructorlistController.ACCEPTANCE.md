# Acceptance Checklist: ContosouniversityWebformsPagesInstructorsInstructorlistController

## Scenarios
- Instructor grid displays all instructors with last name, first name, hire date, office, and courses.
- Selecting an instructor shows their students and grades.

## Required Tests
- GET returns correct paged/sorted instructor data.
- Grid data matches legacy page.
- Selecting an instructor returns correct student list.
- Error handling for invalid page/sort params.

## UX Parity
- Grid columns and details match legacy.
- Sorting and paging work as in WebForms.

## Callouts
- No direct SQL in code-behind (uses EF context).
- No Session, Application, or Cache usage.
- No client-side JS in legacy page.
- No writes to EIM/Power Mart.
- No redirects or server variables.
