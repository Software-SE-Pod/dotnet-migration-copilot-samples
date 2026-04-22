using Azure.Identity;
using Azure.Storage.Blobs;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

namespace Storage
{
    public static class StorageServiceCollectionExtensions
    {
        public static IServiceCollection AddBlobStorage(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton(provider =>
            {
                var blobServiceUri = new Uri(configuration["BlobServiceUri"] ?? throw new InvalidOperationException("BlobServiceUri not configured"));
                return new BlobServiceClient(blobServiceUri, new DefaultAzureCredential());
            });
            return services;
        }
    }
}
