using System;
using Microsoft.AspNetCore.Mvc;
using ApiContracts.Generated;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/contosouniversity-webforms-pages-departments-departmentlist")]
    public class ContosouniversityWebformsPagesDepartmentsDepartmentlistController : Generated.ContosouniversityWebformsPagesDepartmentsDepartmentlistControllerBase
    {
        public override IActionResult GetContosouniversityWebformsPagesDepartmentsDepartmentlist()
            => throw new NotImplementedException(); // TODO(coding-agent): port GetContosouniversityWebformsPagesDepartmentsDepartmentlist from ContosoUniversity.WebForms/Pages/Departments/DepartmentList.aspx.cs

        public override IActionResult ListContosouniversityWebformsPagesDepartmentsDepartmentlistItems(int? page, int? pageSize, string sort)
            => throw new NotImplementedException(); // TODO(coding-agent): port ListContosouniversityWebformsPagesDepartmentsDepartmentlistItems from ContosoUniversity.WebForms/Pages/Departments/DepartmentList.aspx.cs
    }
}
