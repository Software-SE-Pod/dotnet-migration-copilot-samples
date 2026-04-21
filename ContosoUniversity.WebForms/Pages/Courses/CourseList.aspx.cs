using System;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using ContosoUniversity.WebForms.Data;

namespace ContosoUniversity.WebForms.Pages.Courses
{
    public partial class CourseListPage : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                LoadDepartments();
                BindGrid();
            }
        }

        private void LoadDepartments()
        {
            using (var db = new SchoolContext())
            {
                ddlDepartment.DataSource = db.Departments.OrderBy(d => d.Name).ToList();
                ddlDepartment.DataTextField = "Name";
                ddlDepartment.DataValueField = "DepartmentID";
                ddlDepartment.DataBind();
            }
        }

        private void BindGrid()
        {
            using (var db = new SchoolContext())
            {
                var query = db.Courses.Include("Department").Include("Enrollments").AsQueryable();

                if (!string.IsNullOrEmpty(ddlDepartment.SelectedValue))
                {
                    var deptId = int.Parse(ddlDepartment.SelectedValue);
                    query = query.Where(c => c.DepartmentID == deptId);
                }

                gvCourses.DataSource = query.OrderBy(c => c.Title).ToList();
                gvCourses.DataBind();
            }
        }

        protected void ddlDepartment_SelectedIndexChanged(object sender, EventArgs e)
        {
            gvCourses.PageIndex = 0;
            BindGrid();
        }

        protected void gvCourses_PageIndexChanging(object sender, GridViewPageEventArgs e)
        {
            gvCourses.PageIndex = e.NewPageIndex;
            BindGrid();
        }
    }
}
