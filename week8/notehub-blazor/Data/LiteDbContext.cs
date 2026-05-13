using LiteDB;

namespace notehub_blazor.Data;

public class LiteDbContext : IDisposable
{
    private readonly LiteDatabase _database;

    public LiteDbContext(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("LiteDb")
            ?? "App_Data/notehub.db";
        _database = new LiteDatabase(connectionString);
    }

    public ILiteCollection<Models.Note> Notes => _database.GetCollection<Models.Note>("notes");
    public ILiteCollection<Models.Category> Categories => _database.GetCollection<Models.Category>("categories");
    public ILiteCollection<UserRecord> Users => _database.GetCollection<UserRecord>("users");

    public void Dispose()
    {
        _database?.Dispose();
    }
}

public class UserRecord
{
    public int Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
}
