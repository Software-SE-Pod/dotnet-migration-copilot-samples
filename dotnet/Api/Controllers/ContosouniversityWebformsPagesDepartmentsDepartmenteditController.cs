using System;
using Microsoft.AspNetCore.Mvc;
using ApiContracts.Generated;

namespace Api.Controllers
{
    public class ContosouniversityWebformsPagesDepartmentsDepartmenteditController : Generated.ContosouniversityWebformsPagesDepartmentsDepartmenteditControllerBase
    {
        public override IActionResult GetContosouniversityWebformsPagesDepartmentsDepartmentedit(int? id)
        {
            // Load instructors for dropdown
            var instructors = _db.Instructors
                .OrderBy(i => i.LastName)
                .Select(i => new ContosouniversityWebformsPagesDepartmentsDepartmenteditInstructor
                {
                    InstructorId = i.InstructorId.ToString(),
                    FullName = i.FirstName + " " + i.LastName
                })
                .ToList();

            ContosouniversityWebformsPagesDepartmentsDepartmenteditViewModel model;
            if (id.HasValue)
            {
                var dept = _db.Departments.Find(id.Value);
                if (dept == null)
                {
                    return Ok(new ContosouniversityWebformsPagesDepartmentsDepartmenteditViewModel
                    {
                        RedirectUrl = "/departments"
                    });
                }
                model = new ContosouniversityWebformsPagesDepartmentsDepartmenteditViewModel
                {
                    Id = dept.DepartmentId.ToString(),
                    Name = dept.Name,
                    Budget = dept.Budget.ToString("F0"),
                    StartDate = dept.StartDate.ToString("yyyy-MM-dd"),
                    InstructorId = dept.InstructorId?.ToString(),
                    RowVersion = dept.RowVersion != null ? Convert.ToBase64String(dept.RowVersion) : null,
                    Instructors = instructors
                };
            }
            else
            {
                model = new ContosouniversityWebformsPagesDepartmentsDepartmenteditViewModel
                {
                    Instructors = instructors
                };
            }
            return Ok(model);
        }

        public override IActionResult SubmitContosouniversityWebformsPagesDepartmentsDepartmentedit([FromBody] ContosouniversityWebformsPagesDepartmentsDepartmenteditSubmitRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                Department dept;
                if (!string.IsNullOrEmpty(request.Id))
                {
                    var id = int.Parse(request.Id);
                    dept = _db.Departments.Find(id);
                    if (dept == null)
                    {
                        return NotFound();
                    }
                    if (!string.IsNullOrEmpty(request.RowVersion))
                    {
                        _db.Entry(dept).OriginalValues["RowVersion"] = Convert.FromBase64String(request.RowVersion);
                    }
                }
                else
                {
                    dept = new Department();
                    _db.Departments.Add(dept);
                }
                dept.Name = request.Name?.Trim();
                dept.Budget = decimal.Parse(request.Budget);
                dept.StartDate = DateTime.Parse(request.StartDate);
                dept.InstructorId = string.IsNullOrEmpty(request.InstructorId) ? (int?)null : int.Parse(request.InstructorId);
                _db.SaveChanges();
                return Ok(new { redirectUrl = "/departments" });
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new { concurrencyError = "The record was modified by another user. Please reload and try again." });
            }
        }
    }
}
