using notehub_blazor.Data;
using notehub_blazor.Models;

namespace notehub_blazor.Services;

public class CategoryService : ICategoryService
{
    private readonly LiteDbContext _context;

    public CategoryService(LiteDbContext context)
    {
        _context = context;
    }

    public Task<IEnumerable<Category>> GetAllAsync(string userId)
    {
        var categories = _context.Categories.Find(c => c.UserId == userId).ToList();
        return Task.FromResult<IEnumerable<Category>>(categories);
    }

    public Task<Category?> GetByIdAsync(int id, string userId)
    {
        var category = _context.Categories.FindOne(c => c.Id == id && c.UserId == userId);
        return Task.FromResult<Category?>(category);
    }

    public Task<Category> CreateAsync(Category category)
    {
        var maxId = _context.Categories.FindAll().Any()
            ? _context.Categories.FindAll().Max(c => c.Id) + 1
            : 1;
        category.Id = maxId;
        category.CreatedAt = DateTime.UtcNow;
        _context.Categories.Insert(category);
        return Task.FromResult(category);
    }

    public Task<Category> UpdateAsync(Category category)
    {
        _context.Categories.Update(category);
        return Task.FromResult(category);
    }

    public Task DeleteAsync(int id, string userId)
    {
        _context.Categories.DeleteMany(c => c.Id == id && c.UserId == userId);
        return Task.CompletedTask;
    }
}
