using System;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Web.UI;
using ContosoUniversity.WebForms.Data;
using ContosoUniversity.WebForms.Models;

namespace ContosoUniversity.WebForms.Pages.Departments
{
    public partial class DepartmentEditPage : Page
    {
        private int? DeptId => int.TryParse(Request.QueryString["id"], out var id) ? id : (int?)null;

        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                LoadInstructors();
                if (DeptId.HasValue)
                {
                    litTitle.Text = "Edit Department";
                    LoadDepartment(DeptId.Value);
                }
            }
        }

        private void LoadInstructors()
        {
            using (var db = new SchoolContext())
            {
                ddlAdmin.DataSource = db.Instructors.OrderBy(i => i.LastName).ToList();
                ddlAdmin.DataTextField = "FullName";
                ddlAdmin.DataValueField = "InstructorID";
                ddlAdmin.DataBind();
            }
        }

        private void LoadDepartment(int id)
        {
            using (var db = new SchoolContext())
            {
                var dept = db.Departments.Find(id);
                if (dept == null) { Response.Redirect("DepartmentList.aspx"); return; }
                txtName.Text = dept.Name;
                txtBudget.Text = dept.Budget.ToString("F0");
                txtStartDate.Text = dept.StartDate.ToString("yyyy-MM-dd");
                if (dept.InstructorID.HasValue)
                    ddlAdmin.SelectedValue = dept.InstructorID.Value.ToString();
                if (dept.RowVersion != null)
                    hfRowVersion.Value = Convert.ToBase64String(dept.RowVersion);
            }
        }

        protected void btnSave_Click(object sender, EventArgs e)
        {
            if (!Page.IsValid) return;
            try
            {
                using (var db = new SchoolContext())
                {
                    Department dept;
                    if (DeptId.HasValue)
                    {
                        dept = db.Departments.Find(DeptId.Value);
                        // Optimistic concurrency check
                        if (!string.IsNullOrEmpty(hfRowVersion.Value))
                            db.Entry(dept).OriginalValues["RowVersion"] =
                                Convert.FromBase64String(hfRowVersion.Value);
                    }
                    else
                    {
                        dept = new Department();
                        db.Departments.Add(dept);
                    }

                    dept.Name = txtName.Text.Trim();
                    dept.Budget = decimal.Parse(txtBudget.Text);
                    dept.StartDate = DateTime.Parse(txtStartDate.Text);
                    dept.InstructorID = string.IsNullOrEmpty(ddlAdmin.SelectedValue)
                        ? (int?)null : int.Parse(ddlAdmin.SelectedValue);

                    db.SaveChanges();
                }
                Response.Redirect("DepartmentList.aspx");
            }
            catch (DbUpdateConcurrencyException)
            {
                lblConcurrency.Text = "The record was modified by another user. Please reload and try again.";
                lblConcurrency.Visible = true;
            }
        }
    }
}
