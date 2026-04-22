# Acceptance Checklist for ContosouniversityWebformsPagesDefaultController

## Scenarios
- Dashboard stats (students, courses, departments) are returned via GET /api/contosouniversity-webforms-pages-default
- Timer-based refresh is handled by React polling (not implemented here)

## Required Tests
- API returns correct counts for students, courses, departments
- Error handling returns ProblemDetails
- React page displays data from API

## UX Parity
- Numbers match legacy page
- No missing dashboard stats

## Callouts
- No direct SQL in code-behind (uses EF)
- No Session, Application, or Cache usage
- No redirects or server variables
- No client-side JS in legacy
- Timer event is mapped to polling
