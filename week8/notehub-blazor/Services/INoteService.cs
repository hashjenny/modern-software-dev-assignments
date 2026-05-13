using notehub_blazor.Models;

namespace notehub_blazor.Services;

public interface INoteService
{
    Task<IEnumerable<Note>> GetAllAsync();
    Task<Note?> GetByIdAsync(int id);
    Task<Note> CreateAsync(Note note);
    Task<Note> UpdateAsync(Note note);
    Task DeleteAsync(int id);
    Task<IEnumerable<Note>> SearchAsync(string query);
}
