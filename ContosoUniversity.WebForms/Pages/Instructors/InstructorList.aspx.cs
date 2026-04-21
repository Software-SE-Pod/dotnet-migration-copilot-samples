using System;
using System.Linq;
using System.Web.UI;
using ContosoUniversity.WebForms.Data;

namespace ContosoUniversity.WebForms.Pages.Instructors
{
    public partial class InstructorListPage : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack) BindGrid();
        }

        private void BindGrid()
        {
            using (var db = new SchoolContext())
            {
                gvInstructors.DataSource = db.Instructors
                    .Include("OfficeAssignment")
                    .Include("Courses")
                    .OrderBy(i => i.LastName)
                    .ToList();
                gvInstructors.DataBind();
            }
        }

        protected void gvInstructors_SelectedIndexChanged(object sender, EventArgs e)
        {
            var id = (int)gvInstructors.SelectedDataKey.Value;
            using (var db = new SchoolContext())
            {
                var enrollments = db.Enrollments
                    .Include("Student")
                    .Where(en => en.Course.Instructors.Any(i => i.InstructorID == id))
                    .ToList();

                pnlDetails.Visible = true;
                dvStudents.DataSource = new[] { new { Enrollments = enrollments } };
                dvStudents.DataBind();
            }
        }
    }
}
