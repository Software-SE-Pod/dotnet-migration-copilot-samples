using System;
using Microsoft.AspNetCore.Mvc;
using ApiContracts.Generated;

namespace Api.Controllers
{
    public class ContosouniversityWebformsPagesDepartmentsDepartmenteditController : Generated.ContosouniversityWebformsPagesDepartmentsDepartmenteditControllerBase
    {
        public override IActionResult GetContosouniversityWebformsPagesDepartmentsDepartmentedit(int? id)
        {
            // Use EF Core to load instructors and department (if id provided)
            var instructors = _db.Instructors
                .OrderBy(i => i.LastName)
                .Select(i => new ContosouniversityWebformsPagesDepartmentsDepartmenteditInstructor
                {
                    InstructorId = i.InstructorId.ToString(),
                    FullName = i.FirstName + " " + i.LastName
                })
                .ToList();

            ContosouniversityWebformsPagesDepartmentsDepartmenteditViewModel model = new ContosouniversityWebformsPagesDepartmentsDepartmenteditViewModel
            {
                Instructors = instructors,
                Department = null
            };

            if (id.HasValue)
            {
                var dept = _db.Departments.Find(id.Value);
                if (dept == null)
                {
                    return Ok(new ContosouniversityWebformsPagesDepartmentsDepartmenteditViewModel
                    {
                        RedirectUrl = "/departments/list"
                    });
                }
                model.Department = new ContosouniversityWebformsPagesDepartmentsDepartmenteditDepartment
                {
                    Id = dept.DepartmentId.ToString(),
                    Name = dept.Name,
                    Budget = dept.Budget.ToString("F0"),
                    StartDate = dept.StartDate.ToString("yyyy-MM-dd"),
                    InstructorId = dept.InstructorId?.ToString(),
                    RowVersion = dept.RowVersion != null ? Convert.ToBase64String(dept.RowVersion) : null
                };
            }
            return Ok(model);
        }

        public override IActionResult SubmitContosouniversityWebformsPagesDepartmentsDepartmentedit([FromBody] ContosouniversityWebformsPagesDepartmentsDepartmenteditSubmitRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Budget) || string.IsNullOrWhiteSpace(request.StartDate))
            {
                return BadRequest(new ProblemDetails { Title = "Missing required fields." });
            }
            try
            {
                Department dept;
                if (!string.IsNullOrEmpty(request.Id))
                {
                    var id = int.Parse(request.Id);
                    dept = _db.Departments.Find(id);
                    if (dept == null)
                        return NotFound();
                    if (!string.IsNullOrEmpty(request.RowVersion))
                        _db.Entry(dept).Property("RowVersion").OriginalValue = Convert.FromBase64String(request.RowVersion);
                }
                else
                {
                    dept = new Department();
                    _db.Departments.Add(dept);
                }
                dept.Name = request.Name.Trim();
                dept.Budget = decimal.Parse(request.Budget);
                dept.StartDate = DateTime.Parse(request.StartDate);
                dept.InstructorId = string.IsNullOrEmpty(request.InstructorId) ? (int?)null : int.Parse(request.InstructorId);
                _db.SaveChanges();
                return Ok(new ContosouniversityWebformsPagesDepartmentsDepartmenteditSubmitResponse
                {
                    RedirectUrl = "/departments/list"
                });
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(409, new ContosouniversityWebformsPagesDepartmentsDepartmenteditSubmitResponse
                {
                    ConcurrencyError = "The record was modified by another user. Please reload and try again."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ProblemDetails { Title = ex.Message });
            }
        }
    }
}
