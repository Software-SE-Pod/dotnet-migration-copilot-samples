using Microsoft.AspNetCore.Mvc;
using ApiContracts.Generated;

namespace Api.Controllers
{
    public class ContosouniversityWebformsPagesStudentsStudentlistController : Generated.ContosouniversityWebformsPagesStudentsStudentlistControllerBase
    {
        public override Task<ActionResult<ContosouniversityWebformsPagesStudentsStudentlistViewModel>> GetContosouniversityWebformsPagesStudentsStudentlist()
            => throw new NotImplementedException(); // TODO(coding-agent): port GetContosouniversityWebformsPagesStudentsStudentlist from ContosoUniversity.WebForms/Pages/Students/StudentList.aspx.cs

        public override Task<ActionResult<PageContosouniversityWebformsPagesStudentsStudentlistPage>> ListContosouniversityWebformsPagesStudentsStudentlistItems(int? page, int? pageSize, string? sort, string? search)
            => throw new NotImplementedException(); // TODO(coding-agent): port ListContosouniversityWebformsPagesStudentsStudentlistItems from ContosoUniversity.WebForms/Pages/Students/StudentList.aspx.cs

        public override Task<ActionResult<ContosouniversityWebformsPagesStudentsStudentlistDeleteResult>> DeleteContosouniversityWebformsPagesStudentsStudentlistItem(int id)
            => throw new NotImplementedException(); // TODO(coding-agent): port DeleteContosouniversityWebformsPagesStudentsStudentlistItem from ContosoUniversity.WebForms/Pages/Students/StudentList.aspx.cs
    }
}
