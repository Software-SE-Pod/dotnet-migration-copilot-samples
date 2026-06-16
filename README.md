# DotNet Migration Copilot Samples

## Samples:

- [ContosoUniversity](https://github.com/Azure-Samples/dotnet-migration-copilot-samples/tree/main/ContosoUniversity): This is a university management application built on .NET Framework 4.8 with traditional Windows infrastructure dependencies and runs on on-premises Windows-based hosting. After migration, the app will run on Azure Container Apps and leverage Azure SQL Database for data persistence, Azure Service Bus for reliable messaging and notifications, and Azure Blob Storage for teaching material file uploads, replacing the current MSMQ and local file system dependencies with cloud-native Azure services.

## Migration Status — Contoso University

The WebForms → React + .NET 8 migration is **complete** for all pages except the Login page (blocked pending auth-decision).

### Bootstrap Phases

| Phase | Status |
|-------|--------|
| Solution scaffolding | ✅ Done (PR #28) |
| Identity / auth setup | ✅ Done (PR #29) |
| Data layer (EF Core) | ✅ Done (PR #30) |
| Secrets (Key Vault) | ✅ Done (PR #31) |
| Storage (Blob) | ✅ Done (PR #32) |
| Adapters / contracts | ✅ Done (PR #33) |

### Page Migration

| Page | Scenario | Risk | Status |
|------|----------|------|--------|
| Default (Home) | Dashboard | Medium | ✅ Done |
| Admin Dashboard | Dashboard | Medium | ✅ Done |
| Admin Login | Auth | High | 🚫 Blocked — auth-decision pending |
| Students — List | Grid | Medium | ✅ Done |
| Students — Edit | Form | Low | ✅ Done |
| Courses — List | Grid | Low | ✅ Done |
| Courses — Edit | Form | Low | ✅ Done |
| Departments — List | Grid | Medium | ✅ Done |
| Departments — Edit | Form | Low | ✅ Done |
| Instructors — List | Grid | Low | ✅ Done |
| Instructors — Edit | Form | Low | ✅ Done |
| Reports — Enrollment Stats | Grid | Low | ✅ Done |

### Architecture

```
ContosoUniversity.WebForms/   ← original ASP.NET WebForms source (reference only)
dotnet/
  Api/                        ← .NET 8 minimal API with MVC controllers
  ApiContracts/               ← NSwag-generated DTO contracts
  ContosoUniversity.Data/     ← EF Core DbContext + models
  Host/                       ← Azure Container Apps host
  Storage/                    ← Azure Blob Storage adapter
web/                          ← React frontend
webforms-migration-agent/     ← Migration orchestrator state (.migration/manifest.json)
```

