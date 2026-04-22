## Instructor Edit Page Contract Analysis

### Data in
- Query string: id (for edit)
- Form fields: Last Name, First Name, Hire Date, Office Location, Courses (checkbox list)

### Data out
- Renders form for instructor (edit or create)
- Redirects to InstructorList.aspx on save

### Side effects
- DB writes: Instructor, OfficeAssignment, Courses
- No file I/O, email, or 3rd-party calls

### Events wired
- btnSave_Click (form submit)

---

All deliverables for contract phase implemented. See acceptance checklist for required tests and parity.
