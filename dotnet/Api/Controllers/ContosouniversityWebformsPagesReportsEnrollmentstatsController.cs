using ContosoUniversity.Data;
using ContosoUniversity.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using ApiContracts.Generated;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/contosouniversity-webforms-pages-reports-enrollmentstats")]
    public class ContosouniversityWebformsPagesReportsEnrollmentstatsController : Generated.ContosouniversityWebformsPagesReportsEnrollmentstatsControllerBase
    {
        private readonly SchoolContext _db;

        public ContosouniversityWebformsPagesReportsEnrollmentstatsController(SchoolContext db)
        {
            _db = db;
        }

        public override ActionResult<ContosouniversityWebformsPagesReportsEnrollmentstatsViewModel> GetContosouniversityWebformsPagesReportsEnrollmentstats(int? departmentId)
        {
            var deptOptions = _db.Departments
                .OrderBy(d => d.Name)
                .Select(d => new ContosouniversityWebformsPagesReportsEnrollmentstatsDepartmentOption
                {
                    Id = d.DepartmentID,
                    Name = d.Name
                })
                .ToList();

            var courseQuery = _db.Courses
                .Include(c => c.Department)
                .Include(c => c.Enrollments)
                .AsQueryable();

            if (departmentId.HasValue && departmentId.Value > 0)
                courseQuery = courseQuery.Where(c => c.DepartmentID == departmentId.Value);

            var courses = courseQuery.OrderBy(c => c.Title).ToList();

            var enrollments = courses.Select(c => new ContosouniversityWebformsPagesReportsEnrollmentstatsEnrollmentItem
            {
                CourseTitle = c.Title,
                DepartmentName = c.Department?.Name ?? string.Empty,
                EnrollmentCount = c.Enrollments?.Count ?? 0,
                AverageGrade = c.Enrollments != null && c.Enrollments.Any(e => e.Grade.HasValue)
                    ? (float)c.Enrollments.Where(e => e.Grade.HasValue).Average(e => (double)e.Grade!.Value)
                    : 0f
            }).ToList();

            var yearlyStats = _db.Students
                .GroupBy(s => s.EnrollmentDate.Year)
                .OrderBy(g => g.Key)
                .Select(g => new ContosouniversityWebformsPagesReportsEnrollmentstatsYearlyStat
                {
                    Year = g.Key,
                    Count = g.Count()
                })
                .ToList();

            return Ok(new ContosouniversityWebformsPagesReportsEnrollmentstatsViewModel
            {
                DepartmentOptions = deptOptions,
                SelectedDepartmentId = departmentId ?? 0,
                Enrollments = enrollments,
                YearlyStats = yearlyStats
            });
        }

        public override ActionResult<ContosouniversityWebformsPagesReportsEnrollmentstatsExportCsvResult> ExportContosouniversityWebformsPagesReportsEnrollmentstats([FromBody] Body request)
        {
            var courseQuery = _db.Courses
                .Include(c => c.Department)
                .Include(c => c.Enrollments)
                .AsQueryable();

            if (request?.DepartmentId > 0)
                courseQuery = courseQuery.Where(c => c.DepartmentID == request.DepartmentId);

            var courses = courseQuery.OrderBy(c => c.Title).ToList();

            var sb = new StringBuilder();
            sb.AppendLine("CourseTitle,DepartmentName,EnrollmentCount,AverageGrade");
            foreach (var c in courses)
            {
                var avg = c.Enrollments != null && c.Enrollments.Any(e => e.Grade.HasValue)
                    ? c.Enrollments.Where(e => e.Grade.HasValue).Average(e => (double)e.Grade!.Value).ToString("F2")
                    : "0";
                sb.AppendLine($"\"{c.Title}\",\"{c.Department?.Name ?? ""}\",{c.Enrollments?.Count ?? 0},{avg}");
            }

            var bytes = Encoding.UTF8.GetBytes(sb.ToString());
            var base64 = Convert.ToBase64String(bytes);
            var dataUrl = $"data:text/csv;base64,{base64}";

            return Ok(new ContosouniversityWebformsPagesReportsEnrollmentstatsExportCsvResult { Url = dataUrl });
        }
    }
}
