using System;
using System.Linq;
using System.Web.UI;
using ContosoUniversity.WebForms.Data;

namespace ContosoUniversity.WebForms.Pages.Admin
{
    public partial class DashboardPage : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                // Store visit count in session
                var visits = Session["DashboardVisits"] as int? ?? 0;
                Session["DashboardVisits"] = visits + 1;

                LoadDashboard();
            }
        }

        protected void RefreshTimer_Tick(object sender, EventArgs e)
        {
            LoadDashboard();
        }

        private void LoadDashboard()
        {
            using (var db = new SchoolContext())
            {
                lblStudents.Text = db.Students.Count().ToString();
                lblCourses.Text = db.Courses.Count().ToString();
                lblDepts.Text = db.Departments.Count().ToString();
                lblInstructors.Text = db.Instructors.Count().ToString();
                lblEnrollments.Text = db.Enrollments.Count().ToString();

                gvRecent.DataSource = db.Enrollments
                    .Include("Student").Include("Course")
                    .OrderByDescending(en => en.EnrollmentID)
                    .Take(10)
                    .ToList();
                gvRecent.DataBind();
            }
        }
    }
}
