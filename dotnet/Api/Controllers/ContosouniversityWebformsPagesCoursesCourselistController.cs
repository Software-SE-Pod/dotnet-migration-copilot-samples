using Microsoft.AspNetCore.Mvc;
using ApiContracts.Generated;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/contosouniversity-webforms-pages-courses-courselist")]
    public class ContosouniversityWebformsPagesCoursesCourselistController : Generated.ContosouniversityWebformsPagesCoursesCourselistControllerBase
    {
        public override Task<ActionResult<ContosouniversityWebformsPagesCoursesCourselistViewModel>> GetContosouniversityWebformsPagesCoursesCourselist(int? departmentId, int? page, int? pageSize)
        {
            // TODO(coding-agent): port GetContosouniversityWebformsPagesCoursesCourselist from ContosoUniversity.WebForms/Pages/Courses/CourseList.aspx.cs
            throw new NotImplementedException();
        }
    }
}
