using System;
using Microsoft.AspNetCore.Mvc;
using ApiContracts.Generated;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/contosouniversity-webforms-pages-courses-courseedit")]
    public class ContosouniversityWebformsPagesCoursesCourseeditController : Generated.ContosouniversityWebformsPagesCoursesCourseeditControllerBase
    {
        public override ActionResult<ContosouniversityWebformsPagesCoursesCourseeditViewModel> GetContosouniversityWebformsPagesCoursesCourseedit(int? id)
        {
            // Load departments
            var departments = _db.Departments.OrderBy(d => d.Name).Select(d => new ContosouniversityWebformsPagesCoursesCourseeditDepartment
            {
                DepartmentID = d.DepartmentID,
                Name = d.Name
            }).ToList();

            if (id.HasValue)
            {
                var course = _db.Courses.Find(id.Value);
                if (course == null)
                {
                    return NotFound();
                }
                return new ContosouniversityWebformsPagesCoursesCourseeditViewModel
                {
                    CourseID = course.CourseID,
                    Title = course.Title,
                    Credits = course.Credits,
                    DepartmentID = course.DepartmentID,
                    Departments = departments
                };
            }
            else
            {
                return new ContosouniversityWebformsPagesCoursesCourseeditViewModel
                {
                    Departments = departments
                };
            }
        }

        public override ActionResult<ContosouniversityWebformsPagesCoursesCourseeditSubmitResult> SubmitContosouniversityWebformsPagesCoursesCourseedit(ContosouniversityWebformsPagesCoursesCourseeditSubmitRequest request)
        {
            // TODO(coding-agent): port SubmitContosouniversityWebformsPagesCoursesCourseedit from ContosoUniversity.WebForms/Pages/Courses/CourseEdit.aspx.cs
            throw new NotImplementedException();
        }
    }
}
