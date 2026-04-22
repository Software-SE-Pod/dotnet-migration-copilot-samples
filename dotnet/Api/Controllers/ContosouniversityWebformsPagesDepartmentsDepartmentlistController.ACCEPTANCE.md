# Acceptance Checklist for ContosouniversityWebformsPagesDepartmentsDepartmentlistController

## Scenarios
- Department grid displays all departments with columns: Name, Budget, Start Date, Administrator
- Supports paging and sorting by Name and Budget
- "Edit" link navigates to DepartmentEdit page
- "Add New Department" link present

## Required Tests
- API returns correct data shape for grid
- Sorting and paging parameters are honored
- All monetary values are strings with decimal format
- All dates are ISO-8601 strings
- No direct SQL in controller (must use repository)
- No use of Request.ServerVariables
- No direct session writes/reads

## UX Parity
- Grid columns match legacy
- Edit/Add links function
- Sorting and paging work as in legacy

## Callouts
- If any direct SQL or session usage is found, escalate for review
- Any deviation from grid pattern must be flagged
