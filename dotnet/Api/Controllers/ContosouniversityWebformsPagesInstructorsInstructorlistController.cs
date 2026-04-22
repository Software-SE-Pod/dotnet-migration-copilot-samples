using Microsoft.AspNetCore.Mvc;
using ApiContracts.Generated;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/contosouniversity-webforms-pages-instructors-instructorlist")]
    public class ContosouniversityWebformsPagesInstructorsInstructorlistController : Generated.ContosouniversityWebformsPagesInstructorsInstructorlistControllerBase
    {
        public override Task<ActionResult<ContosouniversityWebformsPagesInstructorsInstructorlistViewModel>> GetContosouniversityWebformsPagesInstructorsInstructorlist(int? page, int? pageSize, string? sort)
        {
            // TODO(coding-agent): port GetContosouniversityWebformsPagesInstructorsInstructorlist from ContosoUniversity.WebForms/Pages/Instructors/InstructorList.aspx.cs
            throw new NotImplementedException();
        }
    }
}
