using ContosoUniversity.Data;
using ContosoUniversity.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiContracts.Generated;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/contosouniversity-webforms-pages-instructors-instructoredit")]
    public class ContosouniversityWebformsPagesInstructorsInstructoreditController : Generated.ContosouniversityWebformsPagesInstructorsInstructoreditControllerBase
    {
        private readonly SchoolContext _db;

        public ContosouniversityWebformsPagesInstructorsInstructoreditController(SchoolContext db)
        {
            _db = db;
        }

        public override ActionResult<ContosouniversityWebformsPagesInstructorsInstructoreditViewModel> GetContosouniversityWebformsPagesInstructorsInstructoredit(int? id)
        {
            var courseOptions = _db.Courses
                .OrderBy(c => c.Title)
                .Select(c => new ContosouniversityWebformsPagesInstructorsInstructoreditCourseOption
                {
                    Id = c.CourseID,
                    Title = c.Title
                })
                .ToList();

            var vm = new ContosouniversityWebformsPagesInstructorsInstructoreditViewModel
            {
                CourseOptions = courseOptions,
                AssignedCourseIds = new List<int>(),
                HireDate = DateTimeOffset.UtcNow,
                OfficeLocation = string.Empty
            };

            if (id.HasValue)
            {
                var instructor = _db.Instructors
                    .Include(i => i.OfficeAssignment)
                    .Include(i => i.CourseAssignments)
                    .FirstOrDefault(i => i.ID == id.Value);

                if (instructor == null) return NotFound();

                vm.InstructorId = instructor.ID;
                vm.LastName = instructor.LastName;
                vm.FirstName = instructor.FirstMidName;
                vm.HireDate = new DateTimeOffset(instructor.HireDate, TimeSpan.Zero);
                vm.OfficeLocation = instructor.OfficeAssignment?.Location ?? string.Empty;
                vm.AssignedCourseIds = instructor.CourseAssignments?.Select(ca => ca.CourseID).ToList()
                    ?? new List<int>();
            }

            return Ok(vm);
        }

        public override ActionResult<ContosouniversityWebformsPagesInstructorsInstructoreditSubmitResult> SubmitContosouniversityWebformsPagesInstructorsInstructoredit(
            ContosouniversityWebformsPagesInstructorsInstructoreditSubmitRequest request)
        {
            Instructor instructor;
            if (request.InstructorId > 0)
            {
                instructor = _db.Instructors
                    .Include(i => i.OfficeAssignment)
                    .Include(i => i.CourseAssignments)
                    .FirstOrDefault(i => i.ID == request.InstructorId);
                if (instructor == null) return NotFound();
            }
            else
            {
                instructor = new Instructor();
                _db.Instructors.Add(instructor);
            }

            instructor.LastName = request.LastName?.Trim() ?? string.Empty;
            instructor.FirstMidName = request.FirstName?.Trim() ?? string.Empty;
            instructor.HireDate = request.HireDate.UtcDateTime;

            // Update office assignment
            if (!string.IsNullOrWhiteSpace(request.OfficeLocation))
            {
                if (instructor.OfficeAssignment == null)
                    instructor.OfficeAssignment = new OfficeAssignment { InstructorID = instructor.ID };
                instructor.OfficeAssignment.Location = request.OfficeLocation.Trim();
            }
            else if (instructor.OfficeAssignment != null)
            {
                _db.OfficeAssignments.Remove(instructor.OfficeAssignment);
                instructor.OfficeAssignment = null;
            }

            // Update course assignments
            var requestedIds = request.AssignedCourseIds?.ToHashSet() ?? new HashSet<int>();
            var currentAssignments = instructor.CourseAssignments?.ToList() ?? new List<CourseAssignment>();

            foreach (var ca in currentAssignments.Where(ca => !requestedIds.Contains(ca.CourseID)))
                _db.CourseAssignments.Remove(ca);

            var existingIds = currentAssignments.Select(ca => ca.CourseID).ToHashSet();
            foreach (var courseId in requestedIds.Where(id => !existingIds.Contains(id)))
                _db.CourseAssignments.Add(new CourseAssignment { InstructorID = instructor.ID, CourseID = courseId });

            _db.SaveChanges();

            return Ok(new ContosouniversityWebformsPagesInstructorsInstructoreditSubmitResult
            {
                Success = true,
                RedirectUrl = "/api/contosouniversity-webforms-pages-instructors-instructorlist"
            });
        }
    }
}
