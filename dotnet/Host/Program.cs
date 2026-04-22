using Microsoft.AspNetCore.SystemWebAdapters;
using Yarp.ReverseProxy;

var builder = WebApplication.CreateBuilder(args);

// Add SystemWebAdapters for incremental migration
builder.Services.AddSystemWebAdapters();

// Add YARP reverse proxy
builder.Services.AddReverseProxy()
    .LoadFromMemory(new[]
    {
        new Yarp.ReverseProxy.Configuration.RouteConfig
        {
            RouteId = "catchall",
            Match = new Yarp.ReverseProxy.Configuration.RouteMatch
            {
                Path = "/{**catchAll}"
            },
            ClusterId = "webforms"
        }
    },
    new[]
    {
        new Yarp.ReverseProxy.Configuration.ClusterConfig
        {
            ClusterId = "webforms",
            Destinations = new Dictionary<string, Yarp.ReverseProxy.Configuration.DestinationConfig>
            {
                ["webforms"] = new Yarp.ReverseProxy.Configuration.DestinationConfig
                {
                    Address = "http://localhost:8080/" // WebForms app URL
                }
            }
        }
    });

var app = builder.Build();

// Use SystemWebAdapters
app.UseSystemWebAdapters();

// Use YARP proxy
app.MapReverseProxy();

app.Run();
