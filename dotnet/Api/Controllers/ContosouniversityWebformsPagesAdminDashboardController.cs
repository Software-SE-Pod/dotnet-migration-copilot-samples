using ContosoUniversity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiContracts.Generated;

namespace Api.Controllers
{
    public class ContosouniversityWebformsPagesAdminDashboardController : Generated.ContosouniversityWebformsPagesAdminDashboardControllerBase
    {
        private readonly SchoolContext _db;

        public ContosouniversityWebformsPagesAdminDashboardController(SchoolContext db)
        {
            _db = db;
        }

        public override ActionResult<ContosouniversityWebformsPagesAdminDashboardViewModel> GetContosouniversityWebformsPagesAdminDashboard()
        {
            var recent = _db.Enrollments
                .Include(e => e.Student)
                .Include(e => e.Course)
                .OrderByDescending(e => e.EnrollmentID)
                .Take(10)
                .ToList();

            return Ok(new ContosouniversityWebformsPagesAdminDashboardViewModel
            {
                TotalStudents = _db.Students.Count(),
                TotalCourses = _db.Courses.Count(),
                TotalDepartments = _db.Departments.Count(),
                TotalInstructors = _db.Instructors.Count(),
                TotalEnrollments = _db.Enrollments.Count(),
                RecentEnrollments = recent.Select(e => new ContosouniversityWebformsPagesAdminDashboardRecentEnrollmentItem
                {
                    StudentFullName = e.Student?.FullName ?? string.Empty,
                    CourseTitle = e.Course?.Title ?? string.Empty,
                    Grade = e.Grade?.ToString() ?? "No grade"
                }).ToList(),
                DashboardVisits = 1,
                SessionId = string.Empty,
                Server = Environment.MachineName,
                DotnetVersion = System.Runtime.InteropServices.RuntimeInformation.FrameworkDescription
            });
        }

        public override ActionResult<IEnumerable<ContosouniversityWebformsPagesAdminDashboardRecentEnrollmentItem>> ListContosouniversityWebformsPagesAdminDashboardItems(
            int? page, int? pageSize, string sort)
        {
            var pageIndex = page ?? 0;
            var size = pageSize ?? 10;

            var query = _db.Enrollments
                .Include(e => e.Student)
                .Include(e => e.Course)
                .AsQueryable();

            query = sort switch
            {
                "StudentFullName" => query.OrderBy(e => e.Student.LastName),
                "StudentFullName_desc" => query.OrderByDescending(e => e.Student.LastName),
                "CourseTitle" => query.OrderBy(e => e.Course.Title),
                "CourseTitle_desc" => query.OrderByDescending(e => e.Course.Title),
                _ => query.OrderByDescending(e => e.EnrollmentID)
            };

            var items = query.Skip(pageIndex * size).Take(size).ToList();

            return Ok(items.Select(e => new ContosouniversityWebformsPagesAdminDashboardRecentEnrollmentItem
            {
                StudentFullName = e.Student?.FullName ?? string.Empty,
                CourseTitle = e.Course?.Title ?? string.Empty,
                Grade = e.Grade?.ToString() ?? "No grade"
            }));
        }
    }
}
