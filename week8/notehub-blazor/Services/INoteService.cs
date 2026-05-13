using notehub_blazor.Models;

namespace notehub_blazor.Services;

public interface INoteService
{
    Task<IEnumerable<Note>> GetAllAsync(string userId);
    Task<Note?> GetByIdAsync(int id, string userId);
    Task<Note> CreateAsync(Note note);
    Task<Note> UpdateAsync(Note note);
    Task DeleteAsync(int id, string userId);
    Task<IEnumerable<Note>> SearchAsync(string query, string userId);
}
