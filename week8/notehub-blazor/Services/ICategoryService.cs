using notehub_blazor.Models;

namespace notehub_blazor.Services;

public interface ICategoryService
{
    Task<IEnumerable<Category>> GetAllAsync(string userId);
    Task<Category?> GetByIdAsync(int id, string userId);
    Task<Category> CreateAsync(Category category);
    Task<Category> UpdateAsync(Category category);
    Task DeleteAsync(int id, string userId);
}
