using System;
using System.Linq;
using System.Web.UI;
using ContosoUniversity.WebForms.Data;
using ContosoUniversity.WebForms.Models;

namespace ContosoUniversity.WebForms.Pages.Courses
{
    public partial class CourseEditPage : Page
    {
        private int? CourseId => int.TryParse(Request.QueryString["id"], out var id) ? id : (int?)null;

        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                LoadDepartments();
                if (CourseId.HasValue)
                {
                    litTitle.Text = "Edit Course";
                    txtCourseID.Enabled = false;
                    LoadCourse(CourseId.Value);
                }
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

        private void LoadCourse(int id)
        {
            using (var db = new SchoolContext())
            {
                var course = db.Courses.Find(id);
                if (course == null) { Response.Redirect("CourseList.aspx"); return; }
                txtCourseID.Text = course.CourseID.ToString();
                txtTitle.Text = course.Title;
                txtCredits.Text = course.Credits.ToString();
                ddlDepartment.SelectedValue = course.DepartmentID.ToString();
            }
        }

        protected void btnSave_Click(object sender, EventArgs e)
        {
            if (!Page.IsValid) return;
            using (var db = new SchoolContext())
            {
                Course course;
                if (CourseId.HasValue)
                {
                    course = db.Courses.Find(CourseId.Value);
                }
                else
                {
                    course = new Course { CourseID = int.Parse(txtCourseID.Text) };
                    db.Courses.Add(course);
                }
                course.Title = txtTitle.Text.Trim();
                course.Credits = int.Parse(txtCredits.Text);
                course.DepartmentID = int.Parse(ddlDepartment.SelectedValue);
                db.SaveChanges();
            }
            Response.Redirect("CourseList.aspx");
        }
    }
}
