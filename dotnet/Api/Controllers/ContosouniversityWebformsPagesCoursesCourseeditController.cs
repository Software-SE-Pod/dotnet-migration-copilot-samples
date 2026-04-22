using System;
using Microsoft.AspNetCore.Mvc;
using ApiContracts.Generated;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/contosouniversity-webforms-pages-courses-courseedit")]
    public class ContosouniversityWebformsPagesCoursesCourseeditController : Generated.ContosouniversityWebformsPagesCoursesCourseeditControllerBase
    {
        public override ActionResult<ContosouniversityWebformsPagesCoursesCourseeditViewModel> GetContosouniversityWebformsPagesCoursesCourseedit(int? id)
        {
            // TODO(coding-agent): port GetContosouniversityWebformsPagesCoursesCourseedit from ContosoUniversity.WebForms/Pages/Courses/CourseEdit.aspx.cs
            throw new NotImplementedException();
        }

        public override ActionResult<ContosouniversityWebformsPagesCoursesCourseeditSubmitResult> SubmitContosouniversityWebformsPagesCoursesCourseedit(ContosouniversityWebformsPagesCoursesCourseeditSubmitRequest request)
        {
            // TODO(coding-agent): port SubmitContosouniversityWebformsPagesCoursesCourseedit from ContosoUniversity.WebForms/Pages/Courses/CourseEdit.aspx.cs
            throw new NotImplementedException();
        }
    }
}
