using ContosoUniversity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiContracts.Generated;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/contosouniversity-webforms-pages-instructors-instructorlist")]
    public class ContosouniversityWebformsPagesInstructorsInstructorlistController : Generated.ContosouniversityWebformsPagesInstructorsInstructorlistControllerBase
    {
        private readonly SchoolContext _db;

        public ContosouniversityWebformsPagesInstructorsInstructorlistController(SchoolContext db)
        {
            _db = db;
        }

        public override async Task<ActionResult<ContosouniversityWebformsPagesInstructorsInstructorlistViewModel>> GetContosouniversityWebformsPagesInstructorsInstructorlist(
            int? page, int? pageSize, string? sort)
        {
            var pageIndex = page ?? 0;
            var size = pageSize ?? 20;

            var query = _db.Instructors
                .Include(i => i.OfficeAssignment)
                .Include(i => i.CourseAssignments).ThenInclude(ca => ca.Course)
                .AsQueryable();

            query = sort switch
            {
                "FirstName" => query.OrderBy(i => i.FirstMidName),
                "FirstName_desc" => query.OrderByDescending(i => i.FirstMidName),
                "HireDate" => query.OrderBy(i => i.HireDate),
                "HireDate_desc" => query.OrderByDescending(i => i.HireDate),
                "LastName_desc" => query.OrderByDescending(i => i.LastName),
                _ => query.OrderBy(i => i.LastName)
            };

            var total = await query.CountAsync();
            var instructors = await query.Skip(pageIndex * size).Take(size).ToListAsync();

            return Ok(new ContosouniversityWebformsPagesInstructorsInstructorlistViewModel
            {
                Page = pageIndex,
                PageSize = size,
                TotalCount = total,
                Instructors = instructors.Select(i => new ContosouniversityWebformsPagesInstructorsInstructorlistInstructorItem
                {
                    InstructorId = i.ID,
                    LastName = i.LastName,
                    FirstName = i.FirstMidName,
                    HireDate = new DateTimeOffset(i.HireDate, TimeSpan.Zero),
                    OfficeLocation = i.OfficeAssignment?.Location ?? string.Empty,
                    Courses = i.CourseAssignments?.Select(ca => new ContosouniversityWebformsPagesInstructorsInstructorlistCourseItem
                    {
                        CourseId = ca.Course.CourseID,
                        Title = ca.Course.Title
                    }).ToList() ?? new List<ContosouniversityWebformsPagesInstructorsInstructorlistCourseItem>()
                }).ToList()
            });
        }
    }
}
