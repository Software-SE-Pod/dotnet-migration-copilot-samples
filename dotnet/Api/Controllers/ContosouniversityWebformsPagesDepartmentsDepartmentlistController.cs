using ContosoUniversity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiContracts.Generated;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/contosouniversity-webforms-pages-departments-departmentlist")]
    public class ContosouniversityWebformsPagesDepartmentsDepartmentlistController : Generated.ContosouniversityWebformsPagesDepartmentsDepartmentlistControllerBase
    {
        private readonly SchoolContext _db;

        public ContosouniversityWebformsPagesDepartmentsDepartmentlistController(SchoolContext db)
        {
            _db = db;
        }

        public override IActionResult GetContosouniversityWebformsPagesDepartmentsDepartmentlist()
        {
            var total = _db.Departments.Count();
            return Ok(new ContosouniversityWebformsPagesDepartmentsDepartmentlistViewModel
            {
                TotalCount = total,
                Items = new List<ContosouniversityWebformsPagesDepartmentsDepartmentlistDepartmentItem>()
            });
        }

        public override IActionResult ListContosouniversityWebformsPagesDepartmentsDepartmentlistItems(int? page, int? pageSize, string sort)
        {
            var pageIndex = page ?? 0;
            var size = pageSize ?? 20;

            var query = _db.Departments.Include(d => d.Administrator).AsQueryable();

            query = sort switch
            {
                "Name_desc" => query.OrderByDescending(d => d.Name),
                "Budget" => query.OrderBy(d => d.Budget),
                "Budget_desc" => query.OrderByDescending(d => d.Budget),
                "StartDate" => query.OrderBy(d => d.StartDate),
                "StartDate_desc" => query.OrderByDescending(d => d.StartDate),
                _ => query.OrderBy(d => d.Name)
            };

            var total = query.Count();
            var depts = query.Skip(pageIndex * size).Take(size).ToList();

            return Ok(new PageContosouniversityWebformsPagesDepartmentsDepartmentlistPage
            {
                TotalCount = total,
                Items = depts.Select(d => new ContosouniversityWebformsPagesDepartmentsDepartmentlistDepartmentItem
                {
                    DepartmentId = d.DepartmentID,
                    Name = d.Name,
                    Budget = d.Budget.ToString("F0"),
                    StartDate = d.StartDate,
                    Administrator = d.Administrator?.FullName ?? string.Empty
                }).ToList()
            });
        }
    }
}
