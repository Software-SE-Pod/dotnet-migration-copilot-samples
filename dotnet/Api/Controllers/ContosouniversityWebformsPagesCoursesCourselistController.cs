using Microsoft.AspNetCore.Mvc;
using ApiContracts.Generated;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/contosouniversity-webforms-pages-courses-courselist")]
    public class ContosouniversityWebformsPagesCoursesCourselistController : Generated.ContosouniversityWebformsPagesCoursesCourselistControllerBase
    {
        public override async Task<ActionResult<ContosouniversityWebformsPagesCoursesCourselistViewModel>> GetContosouniversityWebformsPagesCoursesCourselist(int? departmentId, int? page, int? pageSize)
        {
            // Use EF Core to fetch departments for dropdown
            var departments = await _dbContext.Departments
                .OrderBy(d => d.Name)
                .Select(d => new ContosouniversityWebformsPagesCoursesCourselistDepartmentOption {
                    DepartmentId = d.DepartmentID,
                    DepartmentName = d.Name
                })
                .ToListAsync();

            // Query courses
            var query = _dbContext.Courses
                .Include(c => c.Department)
                .Include(c => c.Enrollments)
                .AsQueryable();

            if (departmentId.HasValue)
            {
                query = query.Where(c => c.DepartmentID == departmentId.Value);
            }

            // Paging
            int pageIndex = page ?? 0;
            int pageSizeValue = pageSize ?? 15;
            int totalCourses = await query.CountAsync();

            var courses = await query
                .OrderBy(c => c.Title)
                .Skip(pageIndex * pageSizeValue)
                .Take(pageSizeValue)
                .Select(c => new ContosouniversityWebformsPagesCoursesCourselistCourseItem {
                    CourseId = c.CourseID,
                    Title = c.Title,
                    Credits = c.Credits,
                    DepartmentName = c.Department.Name,
                    Enrolled = c.Enrollments.Count
                })
                .ToListAsync();

            var viewModel = new ContosouniversityWebformsPagesCoursesCourselistViewModel
            {
                DepartmentOptions = departments,
                Courses = courses,
                SelectedDepartmentId = departmentId,
                TotalCourses = totalCourses,
                Page = pageIndex,
                PageSize = pageSizeValue
            };

            return Ok(viewModel);
        }
    }
}
