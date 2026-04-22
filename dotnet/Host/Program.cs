using Azure.Identity;
using Azure.Extensions.AspNetCore.Configuration.Secrets;
using Microsoft.AspNetCore.SystemWebAdapters;
using Microsoft.AspNetCore.DataProtection;

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

builder.Services.AddSystemWebAdapters();
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(builder.Configuration["SystemWebAdapters:DataProtection:KeyRingPath"]!));

var app = builder.Build();

app.UseSystemWebAdapters();
app.UseRouting();
app.UseAuthorization();

app.MapGet("/", () => "Hello World!");

app.Run();
