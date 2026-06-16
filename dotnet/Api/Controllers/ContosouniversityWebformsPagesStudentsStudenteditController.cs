using ContosoUniversity.Data;
using Microsoft.AspNetCore.Mvc;
using ApiContracts.Generated;

namespace Api.Controllers
{
    public class ContosouniversityWebformsPagesStudentsStudenteditController : Generated.ContosouniversityWebformsPagesStudentsStudenteditControllerBase
    {
        private readonly SchoolContext _db;

        public ContosouniversityWebformsPagesStudentsStudenteditController(SchoolContext db)
        {
            _db = db;
        }

        public override async Task<ContosouniversityWebformsPagesStudentsStudenteditViewModel> GetContosouniversityWebformsPagesStudentsStudentedit(int? id, CancellationToken cancellationToken)
        {
            if (id.HasValue)
            {
                var student = await _db.Students.FindAsync(new object[] { id.Value }, cancellationToken);
                if (student != null)
                {
                    return new ContosouniversityWebformsPagesStudentsStudenteditViewModel
                    {
                        StudentId = student.ID,
                        LastName = student.LastName,
                        FirstName = student.FirstMidName,
                        EnrollmentDate = student.EnrollmentDate
                    };
                }
            }
            return new ContosouniversityWebformsPagesStudentsStudenteditViewModel
            {
                EnrollmentDate = DateTimeOffset.UtcNow
            };
        }

        public override async Task<ContosouniversityWebformsPagesStudentsStudenteditSubmitResult> SubmitContosouniversityWebformsPagesStudentsStudentedit(
            ContosouniversityWebformsPagesStudentsStudenteditSubmitRequest body, CancellationToken cancellationToken)
        {
            try
            {
                ContosoUniversity.Models.Student student;
                if (body.StudentId > 0)
                {
                    student = await _db.Students.FindAsync(new object[] { body.StudentId }, cancellationToken);
                    if (student == null)
                        return new ContosouniversityWebformsPagesStudentsStudenteditSubmitResult { Success = false, ErrorMessage = "Student not found." };
                }
                else
                {
                    student = new ContosoUniversity.Models.Student();
                    _db.Students.Add(student);
                }

                student.LastName = body.LastName?.Trim() ?? string.Empty;
                student.FirstMidName = body.FirstName?.Trim() ?? string.Empty;
                student.EnrollmentDate = body.EnrollmentDate.UtcDateTime;
                await _db.SaveChangesAsync(cancellationToken);

                return new ContosouniversityWebformsPagesStudentsStudenteditSubmitResult
                {
                    Success = true,
                    RedirectUrl = "/api/contosouniversity-webforms-pages-students-studentlist"
                };
            }
            catch (Exception ex)
            {
                return new ContosouniversityWebformsPagesStudentsStudenteditSubmitResult { Success = false, ErrorMessage = ex.Message };
            }
        }
    }
}
