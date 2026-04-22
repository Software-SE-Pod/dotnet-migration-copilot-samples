using Microsoft.AspNetCore.Mvc;
using ApiContracts.Generated;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/contosouniversity-webforms-pages-default")]
    public class ContosouniversityWebformsPagesDefaultController : Generated.ContosouniversityWebformsPagesDefaultControllerBase
    {
        // TODO(coding-agent): port GetContosouniversityWebformsPagesDefault from ContosoUniversity.WebForms/Pages/Default.aspx.cs
        public override Task<ActionResult<ContosouniversityWebformsPagesDefaultViewModel>> GetContosouniversityWebformsPagesDefault(CancellationToken cancellationToken)
            => throw new NotImplementedException();
    }
}
