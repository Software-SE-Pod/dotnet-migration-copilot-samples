using System;
using System.Linq;
using System.Web.UI;
using ContosoUniversity.WebForms.Data;
using ContosoUniversity.WebForms.Models;

namespace ContosoUniversity.WebForms.Pages.Instructors
{
    public partial class InstructorEditPage : Page
    {
        private int? InstructorId => int.TryParse(Request.QueryString["id"], out var id) ? id : (int?)null;

        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                LoadCourses();
                if (InstructorId.HasValue)
                {
                    litTitle.Text = "Edit Instructor";
                    LoadInstructor(InstructorId.Value);
                }
            }
        }

        private void LoadCourses()
        {
            using (var db = new SchoolContext())
            {
                cblCourses.DataSource = db.Courses.OrderBy(c => c.Title).ToList();
                cblCourses.DataBind();
            }
        }

        private void LoadInstructor(int id)
        {
            using (var db = new SchoolContext())
            {
                var instructor = db.Instructors
                    .Include("OfficeAssignment").Include("Courses")
                    .FirstOrDefault(i => i.InstructorID == id);
                if (instructor == null) { Response.Redirect("InstructorList.aspx"); return; }

                txtLastName.Text = instructor.LastName;
                txtFirstName.Text = instructor.FirstMidName;
                txtHireDate.Text = instructor.HireDate.ToString("yyyy-MM-dd");
                txtOffice.Text = instructor.OfficeAssignment?.Location ?? "";

                var assignedCourseIds = instructor.Courses.Select(c => c.CourseID.ToString()).ToList();
                foreach (System.Web.UI.WebControls.ListItem item in cblCourses.Items)
                    item.Selected = assignedCourseIds.Contains(item.Value);
            }
        }

        protected void btnSave_Click(object sender, EventArgs e)
        {
            if (!Page.IsValid) return;
            using (var db = new SchoolContext())
            {
                Instructor instructor;
                if (InstructorId.HasValue)
                {
                    instructor = db.Instructors
                        .Include("OfficeAssignment").Include("Courses")
                        .FirstOrDefault(i => i.InstructorID == InstructorId.Value);
                }
                else
                {
                    instructor = new Instructor();
                    db.Instructors.Add(instructor);
                }

                instructor.LastName = txtLastName.Text.Trim();
                instructor.FirstMidName = txtFirstName.Text.Trim();
                instructor.HireDate = DateTime.Parse(txtHireDate.Text);

                // Office assignment
                var office = txtOffice.Text.Trim();
                if (!string.IsNullOrEmpty(office))
                {
                    if (instructor.OfficeAssignment == null)
                        instructor.OfficeAssignment = new OfficeAssignment();
                    instructor.OfficeAssignment.Location = office;
                }
                else if (instructor.OfficeAssignment != null)
                {
                    db.OfficeAssignments.Remove(instructor.OfficeAssignment);
                }

                // Course assignments
                instructor.Courses.Clear();
                var selectedIds = cblCourses.Items.Cast<System.Web.UI.WebControls.ListItem>()
                    .Where(i => i.Selected).Select(i => int.Parse(i.Value)).ToList();
                var courses = db.Courses.Where(c => selectedIds.Contains(c.CourseID)).ToList();
                foreach (var c in courses) instructor.Courses.Add(c);

                db.SaveChanges();
            }
            Response.Redirect("InstructorList.aspx");
        }
    }
}
