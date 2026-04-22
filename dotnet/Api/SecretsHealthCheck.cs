using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Azure.Security.KeyVault.Secrets;

public class SecretsHealthCheck : IHealthCheck
{
    private readonly SecretClient _secretClient;
    public SecretsHealthCheck(SecretClient secretClient)
    {
        _secretClient = secretClient;
    }
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            await _secretClient.GetPropertiesOfSecretsAsync(cancellationToken: cancellationToken).GetAsyncEnumerator().MoveNextAsync();
            return HealthCheckResult.Healthy();
        }
        catch
        {
            return HealthCheckResult.Unhealthy();
        }
    }
}