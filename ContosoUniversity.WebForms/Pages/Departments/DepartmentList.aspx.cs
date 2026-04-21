using System;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using ContosoUniversity.WebForms.Data;

namespace ContosoUniversity.WebForms.Pages.Departments
{
    public partial class DepartmentListPage : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack) BindGrid();
        }

        private void BindGrid()
        {
            using (var db = new SchoolContext())
            {
                gvDepartments.DataSource = db.Departments
                    .Include("Administrator")
                    .OrderBy(d => d.Name)
                    .ToList();
                gvDepartments.DataBind();
            }
        }

        protected void gvDepartments_Sorting(object sender, GridViewSortEventArgs e)
        {
            // Simplified — production would track direction in ViewState
            BindGrid();
        }
    }
}
