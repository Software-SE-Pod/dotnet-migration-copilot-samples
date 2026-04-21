using System;
using System.Linq;
using System.Web.UI;
using ContosoUniversity.WebForms.Data;

namespace ContosoUniversity.WebForms.Pages
{
    public partial class DefaultPage : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                LoadStats();
            }
        }

        protected void RefreshTimer_Tick(object sender, EventArgs e)
        {
            LoadStats();
        }

        private void LoadStats()
        {
            using (var db = new SchoolContext())
            {
                lblStudentCount.Text = db.Students.Count().ToString();
                lblCourseCount.Text = db.Courses.Count().ToString();
                lblDeptCount.Text = db.Departments.Count().ToString();
            }
        }
    }
}
