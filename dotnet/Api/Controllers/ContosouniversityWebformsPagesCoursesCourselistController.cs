using ContosoUniversity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiContracts.Generated;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/contosouniversity-webforms-pages-courses-courselist")]
    public class ContosouniversityWebformsPagesCoursesCourselistController : Generated.ContosouniversityWebformsPagesCoursesCourselistControllerBase
    {
        private readonly SchoolContext _db;

        public ContosouniversityWebformsPagesCoursesCourselistController(SchoolContext db)
        {
            _db = db;
        }

        public override async Task<ActionResult<ContosouniversityWebformsPagesCoursesCourselistViewModel>> GetContosouniversityWebformsPagesCoursesCourselist(
            int? departmentId, int? page, int? pageSize)
        {
            var pageIndex = page ?? 0;
            var size = pageSize ?? 20;

            var deptOptions = await _db.Departments
                .OrderBy(d => d.Name)
                .Select(d => new ContosouniversityWebformsPagesCoursesCourselistDepartmentOption { Id = d.DepartmentID, Name = d.Name })
                .ToListAsync();

            var query = _db.Courses.Include(c => c.Department).Include(c => c.Enrollments).AsQueryable();
            if (departmentId.HasValue && departmentId.Value > 0)
                query = query.Where(c => c.DepartmentID == departmentId.Value);

            var total = await query.CountAsync();
            var courses = await query.OrderBy(c => c.Title).Skip(pageIndex * size).Take(size).ToListAsync();

            return Ok(new ContosouniversityWebformsPagesCoursesCourselistViewModel
            {
                DepartmentOptions = deptOptions,
                SelectedDepartmentId = departmentId ?? 0,
                Page = pageIndex,
                PageSize = size,
                TotalCount = total,
                Courses = courses.Select(c => new ContosouniversityWebformsPagesCoursesCourselistCourseItem
                {
                    CourseId = c.CourseID,
                    Title = c.Title,
                    Credits = c.Credits,
                    DepartmentName = c.Department?.Name ?? string.Empty,
                    EnrolledCount = c.Enrollments?.Count ?? 0
                }).ToList()
            });
        }
    }
}
