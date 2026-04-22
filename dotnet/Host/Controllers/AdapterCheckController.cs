using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SystemWebAdapters;
using Microsoft.AspNetCore.SystemWebAdapters.SessionState;

[ApiController]
[Route("/next/_adapter-check.aspx")]
public class AdapterCheckController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        var session = HttpContext.Session;
        int counter = (session.GetInt32("AdapterCheckCounter") ?? 0) + 1;
        session.SetInt32("AdapterCheckCounter", counter);
        var userId = User.Identity?.Name ?? "anonymous";
        return Content($"User: {userId}\nSession Counter: {counter}", "text/plain");
    }
}
