namespace notehub_blazor.Services;

public interface IAuthService
{
    Task<string?> GetUserIdAsync();
    Task<string?> GetUserNameAsync();
}

public class AuthService : IAuthService
{
    private readonly Data.LiteDbContext _context;

    public AuthService(Data.LiteDbContext context)
    {
        _context = context;
    }

    public Task<string?> GetUserIdAsync()
    {
        return Task.FromResult<string?>("default-user");
    }

    public Task<string?> GetUserNameAsync()
    {
        return Task.FromResult<string?>("默认用户");
    }
}