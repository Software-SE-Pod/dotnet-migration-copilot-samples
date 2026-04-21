using System;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using ContosoUniversity.WebForms.Data;

namespace ContosoUniversity.WebForms.Pages.Students
{
    public partial class StudentListPage : Page
    {
        private string SortExpression
        {
            get => ViewState["SortExpression"] as string ?? "LastName";
            set => ViewState["SortExpression"] = value;
        }

        private string SortDirection
        {
            get => ViewState["SortDirection"] as string ?? "ASC";
            set => ViewState["SortDirection"] = value;
        }

        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                BindGrid();
            }
        }

        private void BindGrid()
        {
            using (var db = new SchoolContext())
            {
                var query = db.Students.Include("Enrollments").AsQueryable();

                // Search filter
                var search = txtSearch.Text.Trim();
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(s =>
                        s.LastName.Contains(search) || s.FirstMidName.Contains(search));
                }

                // Sorting
                switch (SortExpression)
                {
                    case "StudentID":
                        query = SortDirection == "ASC"
                            ? query.OrderBy(s => s.StudentID)
                            : query.OrderByDescending(s => s.StudentID);
                        break;
                    case "FirstMidName":
                        query = SortDirection == "ASC"
                            ? query.OrderBy(s => s.FirstMidName)
                            : query.OrderByDescending(s => s.FirstMidName);
                        break;
                    case "EnrollmentDate":
                        query = SortDirection == "ASC"
                            ? query.OrderBy(s => s.EnrollmentDate)
                            : query.OrderByDescending(s => s.EnrollmentDate);
                        break;
                    default:
                        query = SortDirection == "ASC"
                            ? query.OrderBy(s => s.LastName)
                            : query.OrderByDescending(s => s.LastName);
                        break;
                }

                gvStudents.DataSource = query.ToList();
                gvStudents.DataBind();
            }
        }

        protected void btnSearch_Click(object sender, EventArgs e)
        {
            gvStudents.PageIndex = 0;
            BindGrid();
        }

        protected void btnClear_Click(object sender, EventArgs e)
        {
            txtSearch.Text = "";
            gvStudents.PageIndex = 0;
            BindGrid();
        }

        protected void gvStudents_PageIndexChanging(object sender, GridViewPageEventArgs e)
        {
            gvStudents.PageIndex = e.NewPageIndex;
            BindGrid();
        }

        protected void gvStudents_Sorting(object sender, GridViewSortEventArgs e)
        {
            if (SortExpression == e.SortExpression)
                SortDirection = SortDirection == "ASC" ? "DESC" : "ASC";
            else
                SortDirection = "ASC";

            SortExpression = e.SortExpression;
            BindGrid();
        }

        protected void gvStudents_RowDeleting(object sender, GridViewDeleteEventArgs e)
        {
            var id = (int)gvStudents.DataKeys[e.RowIndex].Value;
            using (var db = new SchoolContext())
            {
                var student = db.Students.Find(id);
                if (student != null)
                {
                    db.Students.Remove(student);
                    db.SaveChanges();
                }
            }
            BindGrid();
            lblMessage.Text = "Student deleted.";
            lblMessage.Visible = true;
        }
    }
}
