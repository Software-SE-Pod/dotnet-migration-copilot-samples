using System;
using System.Web.UI;
using ContosoUniversity.WebForms.Data;
using ContosoUniversity.WebForms.Models;

namespace ContosoUniversity.WebForms.Pages.Students
{
    public partial class StudentEditPage : Page
    {
        private int? StudentId => int.TryParse(Request.QueryString["id"], out var id) ? id : (int?)null;

        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack && StudentId.HasValue)
            {
                litTitle.Text = "Edit Student";
                LoadStudent(StudentId.Value);
            }
        }

        private void LoadStudent(int id)
        {
            using (var db = new SchoolContext())
            {
                var student = db.Students.Find(id);
                if (student == null)
                {
                    Response.Redirect("StudentList.aspx");
                    return;
                }
                txtLastName.Text = student.LastName;
                txtFirstName.Text = student.FirstMidName;
                txtEnrollmentDate.Text = student.EnrollmentDate.ToString("yyyy-MM-dd");
            }
        }

        protected void btnSave_Click(object sender, EventArgs e)
        {
            if (!Page.IsValid) return;

            try
            {
                using (var db = new SchoolContext())
                {
                    Student student;
                    if (StudentId.HasValue)
                    {
                        student = db.Students.Find(StudentId.Value);
                        if (student == null) { Response.Redirect("StudentList.aspx"); return; }
                    }
                    else
                    {
                        student = new Student();
                        db.Students.Add(student);
                    }

                    student.LastName = txtLastName.Text.Trim();
                    student.FirstMidName = txtFirstName.Text.Trim();
                    student.EnrollmentDate = DateTime.Parse(txtEnrollmentDate.Text);
                    db.SaveChanges();
                }
                Response.Redirect("StudentList.aspx");
            }
            catch (Exception ex)
            {
                lblError.Text = "Error saving: " + ex.Message;
                lblError.Visible = true;
            }
        }
    }
}
