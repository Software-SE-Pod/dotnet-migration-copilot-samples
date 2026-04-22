# Analysis: CourseEdit.aspx

## Data In
- Query string: id (CourseId)
- Form fields: CourseID, Title, Credits, Department
- No session or application state

## Data Out
- Renders course fields for edit or blank for new
- Populates department dropdown
- Redirects to CourseList.aspx on save

## Side Effects
- DB write: creates or updates Course via EF
- No file I/O, email, or 3rd-party calls

## Events
- Page_Load (loads data, populates dropdown)
- btnSave_Click (handles save)
