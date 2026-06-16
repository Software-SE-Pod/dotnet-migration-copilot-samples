using ContosoUniversity.Data;
using ContosoUniversity.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiContracts.Generated;

namespace Api.Controllers
{
    public class ContosouniversityWebformsPagesDepartmentsDepartmenteditController : Generated.ContosouniversityWebformsPagesDepartmentsDepartmenteditControllerBase
    {
        private readonly SchoolContext _db;

        public ContosouniversityWebformsPagesDepartmentsDepartmenteditController(SchoolContext db)
        {
            _db = db;
        }

        public override IActionResult GetContosouniversityWebformsPagesDepartmentsDepartmentedit(int? id)
        {
            var instructorOptions = _db.Instructors
                .OrderBy(i => i.LastName)
                .Select(i => new ContosouniversityWebformsPagesDepartmentsDepartmenteditInstructorOption
                {
                    Id = i.ID,
                    Name = i.LastName + ", " + i.FirstMidName
                })
                .ToList();

            var vm = new ContosouniversityWebformsPagesDepartmentsDepartmenteditViewModel
            {
                InstructorOptions = instructorOptions,
                StartDate = DateTimeOffset.UtcNow,
                Budget = "0",
                RowVersion = string.Empty
            };

            if (id.HasValue)
            {
                var dept = _db.Departments.Find(id.Value);
                if (dept == null) return NotFound();
                vm.DepartmentId = dept.DepartmentID;
                vm.Name = dept.Name;
                vm.Budget = dept.Budget.ToString("F0");
                vm.StartDate = new DateTimeOffset(dept.StartDate, TimeSpan.Zero);
                vm.InstructorId = dept.InstructorID;
                vm.RowVersion = dept.RowVersion != null ? Convert.ToBase64String(dept.RowVersion) : string.Empty;
            }

            return Ok(vm);
        }

        public override IActionResult SubmitContosouniversityWebformsPagesDepartmentsDepartmentedit(
            [FromBody] ContosouniversityWebformsPagesDepartmentsDepartmenteditSubmitRequest request)
        {
            Department dept;
            if (request.DepartmentId > 0)
            {
                dept = _db.Departments.Find(request.DepartmentId);
                if (dept == null) return NotFound();

                if (!string.IsNullOrEmpty(request.RowVersion))
                {
                    var incoming = Convert.FromBase64String(request.RowVersion);
                    _db.Entry(dept).Property("RowVersion").OriginalValue = incoming;
                }
            }
            else
            {
                dept = new Department();
                _db.Departments.Add(dept);
            }

            dept.Name = request.Name?.Trim() ?? string.Empty;
            dept.Budget = decimal.TryParse(request.Budget, out var budget) ? budget : 0;
            dept.StartDate = request.StartDate.UtcDateTime;
            dept.InstructorID = request.InstructorId;

            try
            {
                _db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Ok(new ContosouniversityWebformsPagesDepartmentsDepartmenteditSubmitResult
                {
                    Success = false,
                    ConcurrencyError = true
                });
            }

            return Ok(new ContosouniversityWebformsPagesDepartmentsDepartmenteditSubmitResult
            {
                Success = true,
                RedirectUrl = "/api/contosouniversity-webforms-pages-departments-departmentlist"
            });
        }
    }
}
