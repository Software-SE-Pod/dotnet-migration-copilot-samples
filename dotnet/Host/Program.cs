using Yarp.ReverseProxy;

var builder = WebApplication.CreateBuilder(args);

// Add YARP reverse proxy
builder.Services.AddReverseProxy()
    .LoadFromMemory(new[]
    {
        new Yarp.ReverseProxy.Configuration.RouteConfig
        {
            RouteId = "catchAll",
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
                    Address = "http://localhost:8080/" // TODO: Update to actual WebForms app URL
                }
            }
        }
    });

var app = builder.Build();

app.MapReverseProxy();

app.Run();
