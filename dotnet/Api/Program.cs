using Azure.Identity;
using Azure.Extensions.AspNetCore.Configuration.Secrets;
using ContosoUniversity.Data;
using Microsoft.EntityFrameworkCore;
using Storage;

var builder = WebApplication.CreateBuilder(args);

// Azure Key Vault integration
if (!builder.Environment.IsDevelopment())
{
    var keyVaultName = builder.Configuration["KeyVaultName"];
    if (!string.IsNullOrEmpty(keyVaultName))
    {
        var keyVaultUri = new Uri($"https://{keyVaultName}.vault.azure.net/");
        builder.Configuration.AddAzureKeyVault(keyVaultUri, new DefaultAzureCredential());
    }
}

builder.Services.AddDbContext<SchoolContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
builder.Services.AddBlobStorage(builder.Configuration);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

if (!builder.Environment.IsDevelopment())
{
    builder.Services.AddSingleton(provider =>
    {
        var keyVaultName = builder.Configuration["KeyVaultName"];
        var keyVaultUri = new Uri($"https://{keyVaultName}.vault.azure.net/");
        return new Azure.Security.KeyVault.Secrets.SecretClient(keyVaultUri, new Azure.Identity.DefaultAzureCredential());
    });
    builder.Services.AddHealthChecks().AddCheck<SecretsHealthCheck>("secrets");
}

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();

if (!app.Environment.IsDevelopment())
{
    app.MapHealthChecks("/health/secrets");
}

app.Run();
