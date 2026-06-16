using Microsoft.AspNetCore.Mvc;
using ApiContracts.Generated;

// Abstract controller base classes used by the generated API controllers.
// These live in namespace Generated so controllers can reference them as
// Generated.<ClassName>ControllerBase while still importing ApiContracts.Generated for DTOs.
namespace Generated
{
    [ApiController]
    [Route("api/contosouniversity-webforms-pages-students-studentlist")]
    public abstract class ContosouniversityWebformsPagesStudentsStudentlistControllerBase : ControllerBase
    {
        [HttpGet]
        public abstract Task<ActionResult<ContosouniversityWebformsPagesStudentsStudentlistViewModel>> GetContosouniversityWebformsPagesStudentsStudentlist();

        [HttpGet("items")]
        public abstract Task<ActionResult<PageContosouniversityWebformsPagesStudentsStudentlistPage>> ListContosouniversityWebformsPagesStudentsStudentlistItems(
            [FromQuery] int? page, [FromQuery] int? pageSize, [FromQuery] string? sort, [FromQuery] string? search);

        [HttpDelete("{id}")]
        public abstract Task<ActionResult<ContosouniversityWebformsPagesStudentsStudentlistDeleteResult>> DeleteContosouniversityWebformsPagesStudentsStudentlistItem(int id);
    }

    [ApiController]
    [Route("api/contosouniversity-webforms-pages-students-studentedit")]
    public abstract class ContosouniversityWebformsPagesStudentsStudenteditControllerBase : ControllerBase
    {
        [HttpGet]
        public abstract Task<ContosouniversityWebformsPagesStudentsStudenteditViewModel> GetContosouniversityWebformsPagesStudentsStudentedit([FromQuery] int? id, CancellationToken cancellationToken);

        [HttpPost]
        [IgnoreAntiforgeryToken]
        public abstract Task<ContosouniversityWebformsPagesStudentsStudenteditSubmitResult> SubmitContosouniversityWebformsPagesStudentsStudentedit([FromBody] ContosouniversityWebformsPagesStudentsStudenteditSubmitRequest body, CancellationToken cancellationToken);
    }

    [ApiController]
    [Route("api/contosouniversity-webforms-pages-courses-courselist")]
    public abstract class ContosouniversityWebformsPagesCoursesCourselistControllerBase : ControllerBase
    {
        [HttpGet]
        public abstract Task<ActionResult<ContosouniversityWebformsPagesCoursesCourselistViewModel>> GetContosouniversityWebformsPagesCoursesCourselist(
            [FromQuery] int? departmentId, [FromQuery] int? page, [FromQuery] int? pageSize);
    }

    [ApiController]
    [Route("api/contosouniversity-webforms-pages-courses-courseedit")]
    public abstract class ContosouniversityWebformsPagesCoursesCourseeditControllerBase : ControllerBase
    {
        [HttpGet]
        public abstract ActionResult<ContosouniversityWebformsPagesCoursesCourseeditViewModel> GetContosouniversityWebformsPagesCoursesCourseedit([FromQuery] int? id);

        [HttpPost]
        [IgnoreAntiforgeryToken]
        public abstract ActionResult<ContosouniversityWebformsPagesCoursesCourseeditSubmitResult> SubmitContosouniversityWebformsPagesCoursesCourseedit([FromBody] ContosouniversityWebformsPagesCoursesCourseeditSubmitRequest request);
    }

    [ApiController]
    [Route("api/contosouniversity-webforms-pages-departments-departmentlist")]
    public abstract class ContosouniversityWebformsPagesDepartmentsDepartmentlistControllerBase : ControllerBase
    {
        [HttpGet]
        public abstract IActionResult GetContosouniversityWebformsPagesDepartmentsDepartmentlist();

        [HttpGet("items")]
        public abstract IActionResult ListContosouniversityWebformsPagesDepartmentsDepartmentlistItems(
            [FromQuery] int? page, [FromQuery] int? pageSize, [FromQuery] string sort);
    }

    [ApiController]
    [Route("api/contosouniversity-webforms-pages-departments-departmentedit")]
    public abstract class ContosouniversityWebformsPagesDepartmentsDepartmenteditControllerBase : ControllerBase
    {
        [HttpGet]
        public abstract IActionResult GetContosouniversityWebformsPagesDepartmentsDepartmentedit([FromQuery] int? id);

        [HttpPost]
        [IgnoreAntiforgeryToken]
        public abstract IActionResult SubmitContosouniversityWebformsPagesDepartmentsDepartmentedit([FromBody] ContosouniversityWebformsPagesDepartmentsDepartmenteditSubmitRequest request);
    }

    [ApiController]
    [Route("api/contosouniversity-webforms-pages-instructors-instructorlist")]
    public abstract class ContosouniversityWebformsPagesInstructorsInstructorlistControllerBase : ControllerBase
    {
        [HttpGet]
        public abstract Task<ActionResult<ContosouniversityWebformsPagesInstructorsInstructorlistViewModel>> GetContosouniversityWebformsPagesInstructorsInstructorlist(
            [FromQuery] int? page, [FromQuery] int? pageSize, [FromQuery] string? sort);
    }

    [ApiController]
    [Route("api/contosouniversity-webforms-pages-instructors-instructoredit")]
    public abstract class ContosouniversityWebformsPagesInstructorsInstructoreditControllerBase : ControllerBase
    {
        [HttpGet]
        public abstract ActionResult<ContosouniversityWebformsPagesInstructorsInstructoreditViewModel> GetContosouniversityWebformsPagesInstructorsInstructoredit([FromQuery] int? id);

        [HttpPost]
        [IgnoreAntiforgeryToken]
        public abstract ActionResult<ContosouniversityWebformsPagesInstructorsInstructoreditSubmitResult> SubmitContosouniversityWebformsPagesInstructorsInstructoredit([FromBody] ContosouniversityWebformsPagesInstructorsInstructoreditSubmitRequest request);
    }

    [ApiController]
    [Route("api/contosouniversity-webforms-pages-reports-enrollmentstats")]
    public abstract class ContosouniversityWebformsPagesReportsEnrollmentstatsControllerBase : ControllerBase
    {
        [HttpGet]
        public abstract ActionResult<ContosouniversityWebformsPagesReportsEnrollmentstatsViewModel> GetContosouniversityWebformsPagesReportsEnrollmentstats([FromQuery] int? departmentId);

        [HttpPost("export")]
        [IgnoreAntiforgeryToken]
        public abstract ActionResult<ContosouniversityWebformsPagesReportsEnrollmentstatsExportCsvResult> ExportContosouniversityWebformsPagesReportsEnrollmentstats([FromBody] Body request);
    }

    [ApiController]
    [Route("api/contosouniversity-webforms-pages-default")]
    public abstract class ContosouniversityWebformsPagesDefaultControllerBase : ControllerBase
    {
        [HttpGet]
        public abstract Task<ActionResult<ContosouniversityWebformsPagesDefaultViewModel>> GetContosouniversityWebformsPagesDefault(CancellationToken cancellationToken);
    }

    [ApiController]
    [Route("api/contosouniversity-webforms-pages-admin-dashboard")]
    public abstract class ContosouniversityWebformsPagesAdminDashboardControllerBase : ControllerBase
    {
        [HttpGet]
        public abstract ActionResult<ContosouniversityWebformsPagesAdminDashboardViewModel> GetContosouniversityWebformsPagesAdminDashboard();

        [HttpGet("items")]
        public abstract ActionResult<IEnumerable<ContosouniversityWebformsPagesAdminDashboardRecentEnrollmentItem>> ListContosouniversityWebformsPagesAdminDashboardItems(
            [FromQuery] int? page, [FromQuery] int? pageSize, [FromQuery] string sort);
    }
}

