using System;
using Microsoft.AspNetCore.Mvc;
using ApiContracts.Generated;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/contosouniversity-webforms-pages-reports-enrollmentstats")]
    public class ContosouniversityWebformsPagesReportsEnrollmentstatsController : Generated.ContosouniversityWebformsPagesReportsEnrollmentstatsControllerBase
    {
        public override ActionResult<ContosouniversityWebformsPagesReportsEnrollmentstatsViewModel> GetContosouniversityWebformsPagesReportsEnrollmentstats(int? departmentId)
        {
            // TODO(coding-agent): port GetContosouniversityWebformsPagesReportsEnrollmentstats from ContosoUniversity.WebForms/Pages/Reports/EnrollmentStats.aspx.cs
            throw new NotImplementedException();
        }

        public override ActionResult<ContosouniversityWebformsPagesReportsEnrollmentstatsExportCsvResult> ExportContosouniversityWebformsPagesReportsEnrollmentstats([FromBody] ContosouniversityWebformsPagesReportsEnrollmentstatsExportCsvRequest request)
        {
            // TODO(coding-agent): port ExportContosouniversityWebformsPagesReportsEnrollmentstats from ContosoUniversity.WebForms/Pages/Reports/EnrollmentStats.aspx.cs
            throw new NotImplementedException();
        }
    }
}
