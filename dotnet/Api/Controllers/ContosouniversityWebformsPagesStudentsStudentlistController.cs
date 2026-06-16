using ContosoUniversity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiContracts.Generated;

namespace Api.Controllers
{
    public class ContosouniversityWebformsPagesStudentsStudentlistController : Generated.ContosouniversityWebformsPagesStudentsStudentlistControllerBase
    {
        private readonly SchoolContext _db;

        public ContosouniversityWebformsPagesStudentsStudentlistController(SchoolContext db)
        {
            _db = db;
        }

        public override async Task<ActionResult<ContosouniversityWebformsPagesStudentsStudentlistViewModel>> GetContosouniversityWebformsPagesStudentsStudentlist()
        {
            var totalCount = await _db.Students.CountAsync();
            return Ok(new ContosouniversityWebformsPagesStudentsStudentlistViewModel
            {
                TotalCount = totalCount,
                Items = new List<ContosouniversityWebformsPagesStudentsStudentlistStudentItem>()
            });
        }

        public override async Task<ActionResult<PageContosouniversityWebformsPagesStudentsStudentlistPage>> ListContosouniversityWebformsPagesStudentsStudentlistItems(
            int? page, int? pageSize, string? sort, string? search)
        {
            var pageIndex = page ?? 0;
            var size = pageSize ?? 20;
            sort ??= "LastName";

            var query = _db.Students.Include(s => s.Enrollments).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(s => s.LastName.Contains(search) || s.FirstMidName.Contains(search));

            query = sort switch
            {
                "FirstMidName" => query.OrderBy(s => s.FirstMidName),
                "FirstMidName_desc" => query.OrderByDescending(s => s.FirstMidName),
                "EnrollmentDate" => query.OrderBy(s => s.EnrollmentDate),
                "EnrollmentDate_desc" => query.OrderByDescending(s => s.EnrollmentDate),
                "LastName_desc" => query.OrderByDescending(s => s.LastName),
                _ => query.OrderBy(s => s.LastName)
            };

            var total = await query.CountAsync();
            var items = await query.Skip(pageIndex * size).Take(size).ToListAsync();

            return Ok(new PageContosouniversityWebformsPagesStudentsStudentlistPage
            {
                TotalCount = total,
                Items = items.Select(s => new ContosouniversityWebformsPagesStudentsStudentlistStudentItem
                {
                    StudentId = s.ID,
                    LastName = s.LastName,
                    FirstMidName = s.FirstMidName,
                    EnrollmentDate = s.EnrollmentDate,
                    EnrollmentsCount = s.Enrollments?.Count ?? 0
                }).ToList()
            });
        }

        public override async Task<ActionResult<ContosouniversityWebformsPagesStudentsStudentlistDeleteResult>> DeleteContosouniversityWebformsPagesStudentsStudentlistItem(int id)
        {
            var student = await _db.Students.FindAsync(id);
            if (student == null)
                return Ok(new ContosouniversityWebformsPagesStudentsStudentlistDeleteResult { Success = false, ErrorMessage = "Student not found." });

            _db.Students.Remove(student);
            await _db.SaveChangesAsync();
            return Ok(new ContosouniversityWebformsPagesStudentsStudentlistDeleteResult { Success = true });
        }
    }
}
