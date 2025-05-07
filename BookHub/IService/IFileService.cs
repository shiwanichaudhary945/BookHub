namespace BookHub.IService
{
    public interface IFileService
    {
        Task<string> SaveFileAsync(IFormFile file, string path);
    }
}
