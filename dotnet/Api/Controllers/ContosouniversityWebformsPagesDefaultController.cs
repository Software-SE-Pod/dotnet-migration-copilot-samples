using ContosoUniversity.Data;
using Microsoft.AspNetCore.Mvc;
using ApiContracts.Generated;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/contosouniversity-webforms-pages-default")]
    public class ContosouniversityWebformsPagesDefaultController : Generated.ContosouniversityWebformsPagesDefaultControllerBase
    {
        private readonly SchoolContext _db;

        public ContosouniversityWebformsPagesDefaultController(SchoolContext db)
        {
            _db = db;
        }

        public override async Task<ActionResult<ContosouniversityWebformsPagesDefaultViewModel>> GetContosouniversityWebformsPagesDefault(CancellationToken cancellationToken)
        {
            var studentCount = await System.Threading.Tasks.Task.FromResult(_db.Students.Count());
            var courseCount = _db.Courses.Count();
            var deptCount = _db.Departments.Count();

            return Ok(new ContosouniversityWebformsPagesDefaultViewModel
            {
                StudentCount = studentCount,
                CourseCount = courseCount,
                DepartmentCount = deptCount
            });
        }
    }
}
