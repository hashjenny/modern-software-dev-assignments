using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace notehub_blazor.Services;

public interface IAuthService
{
    Task<bool> RegisterAsync(string userName, string email, string password);
    Task<bool> LoginAsync(string userName, string password);
    Task LogoutAsync();
    Task<string?> GetUserIdAsync();
    Task<string?> GetUserNameAsync();
}

public class AuthService : IAuthService
{
    private readonly Data.LiteDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuthService(Data.LiteDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    public Task<bool> RegisterAsync(string userName, string email, string password)
    {
        var existingUser = _context.Users.FindOne(u => u.UserName == userName);
        if (existingUser != null)
            return Task.FromResult(false);

        var user = new Data.UserRecord
        {
            UserName = userName,
            Email = email,
            PasswordHash = HashPassword(password)
        };

        var maxId = _context.Users.FindAll().Any()
            ? _context.Users.FindAll().Max(u => u.Id) + 1
            : 1;
        user.Id = maxId;

        _context.Users.Insert(user);
        return Task.FromResult(true);
    }

    public async Task<bool> LoginAsync(string userName, string password)
    {
        var user = _context.Users.FindOne(u => u.UserName == userName);
        if (user == null || !VerifyPassword(password, user.PasswordHash))
            return false;

        var claims = new List<System.Security.Claims.Claim>
        {
            new(System.Security.Claims.ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(System.Security.Claims.ClaimTypes.Name, user.UserName)
        };

        var identity = new System.Security.Claims.ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new System.Security.Claims.ClaimsPrincipal(identity);

        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
            return false;

        await httpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);
        return true;
    }

    public async Task LogoutAsync()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext != null)
        {
            await httpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        }
    }

    public Task<string?> GetUserIdAsync()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        return Task.FromResult(user?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
    }

    public Task<string?> GetUserNameAsync()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        return Task.FromResult(user?.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value);
    }

    private static string HashPassword(string password)
    {
        return Convert.ToBase64String(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(password)));
    }

    private static bool VerifyPassword(string password, string hash)
    {
        return HashPassword(password) == hash;
    }
}
