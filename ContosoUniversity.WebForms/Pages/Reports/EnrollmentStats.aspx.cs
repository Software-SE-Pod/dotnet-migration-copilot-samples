using System;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using ContosoUniversity.WebForms.Data;

namespace ContosoUniversity.WebForms.Pages.Reports
{
    public partial class EnrollmentStatsPage : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                LoadDepartments();
                LoadReport();
            }
        }

        private void LoadDepartments()
        {
            using (var db = new SchoolContext())
            {
                ddlDept.DataSource = db.Departments.OrderBy(d => d.Name).ToList();
                ddlDept.DataTextField = "Name";
                ddlDept.DataValueField = "DepartmentID";
                ddlDept.DataBind();
            }
        }

        private void LoadReport()
        {
            using (var db = new SchoolContext())
            {
                var query = db.Courses
                    .Include("Department").Include("Enrollments")
                    .AsQueryable();

                if (!string.IsNullOrEmpty(ddlDept.SelectedValue))
                {
                    var deptId = int.Parse(ddlDept.SelectedValue);
                    query = query.Where(c => c.DepartmentID == deptId);
                }

                var stats = query.Select(c => new
                {
                    CourseTitle = c.Title,
                    DepartmentName = c.Department.Name,
                    EnrollmentCount = c.Enrollments.Count,
                    AverageGrade = c.Enrollments.Where(en => en.Grade.HasValue)
                        .Average(en => (double?)en.Grade.Value)
                }).OrderByDescending(x => x.EnrollmentCount).ToList();

                rptEnrollments.DataSource = stats;
                rptEnrollments.DataBind();

                // Yearly enrollment counts
                var yearly = db.Students
                    .GroupBy(s => s.EnrollmentDate.Year)
                    .Select(g => new { Year = g.Key, Count = g.Count() })
                    .OrderBy(x => x.Year).ToList();

                dlYearly.DataSource = yearly;
                dlYearly.DataBind();
            }
        }

        protected void ddlDept_SelectedIndexChanged(object sender, EventArgs e)
        {
            LoadReport();
        }

        protected void btnExportCsv_Click(object sender, EventArgs e)
        {
            using (var db = new SchoolContext())
            {
                var courses = db.Courses.Include("Department").Include("Enrollments")
                    .OrderBy(c => c.Title).ToList();

                Response.Clear();
                Response.ContentType = "text/csv";
                Response.AddHeader("Content-Disposition", "attachment; filename=enrollment-stats.csv");
                Response.Write("Course,Department,Enrolled\r\n");
                foreach (var c in courses)
                {
                    Response.Write($"\"{c.Title}\",\"{c.Department?.Name}\",{c.Enrollments.Count}\r\n");
                }
                Response.End();
            }
        }
    }
}
