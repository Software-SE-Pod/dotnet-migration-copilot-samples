using ContosoUniversity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiContracts.Generated;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/contosouniversity-webforms-pages-courses-courseedit")]
    public class ContosouniversityWebformsPagesCoursesCourseeditController : Generated.ContosouniversityWebformsPagesCoursesCourseeditControllerBase
    {
        private readonly SchoolContext _db;

        public ContosouniversityWebformsPagesCoursesCourseeditController(SchoolContext db)
        {
            _db = db;
        }

        public override ActionResult<ContosouniversityWebformsPagesCoursesCourseeditViewModel> GetContosouniversityWebformsPagesCoursesCourseedit(int? id)
        {
            var deptOptions = _db.Departments
                .OrderBy(d => d.Name)
                .Select(d => new ContosouniversityWebformsPagesCoursesCourseeditDepartmentOption { Id = d.DepartmentID, Name = d.Name })
                .ToList();

            var vm = new ContosouniversityWebformsPagesCoursesCourseeditViewModel
            {
                DepartmentOptions = deptOptions
            };

            if (id.HasValue)
            {
                var course = _db.Courses.Find(id.Value);
                if (course == null) return NotFound();
                vm.CourseId = course.CourseID;
                vm.Title = course.Title;
                vm.Credits = course.Credits;
                vm.DepartmentId = course.DepartmentID;
            }

            return Ok(vm);
        }

        public override ActionResult<ContosouniversityWebformsPagesCoursesCourseeditSubmitResult> SubmitContosouniversityWebformsPagesCoursesCourseedit(
            ContosouniversityWebformsPagesCoursesCourseeditSubmitRequest request)
        {
            ContosoUniversity.Models.Course course;
            if (request.CourseId > 0)
            {
                course = _db.Courses.Find(request.CourseId);
                if (course == null) return NotFound();
            }
            else
            {
                course = new ContosoUniversity.Models.Course { CourseID = request.CourseId };
                _db.Courses.Add(course);
            }

            course.Title = request.Title?.Trim() ?? string.Empty;
            course.Credits = request.Credits;
            course.DepartmentID = request.DepartmentId;
            _db.SaveChanges();

            return Ok(new ContosouniversityWebformsPagesCoursesCourseeditSubmitResult
            {
                Success = true,
                RedirectUrl = "/api/contosouniversity-webforms-pages-courses-courselist"
            });
        }
    }
}
