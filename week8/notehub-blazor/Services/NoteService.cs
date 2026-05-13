using notehub_blazor.Data;
using notehub_blazor.Models;

namespace notehub_blazor.Services;

public class NoteService : INoteService
{
    private readonly LiteDbContext _context;

    public NoteService(LiteDbContext context)
    {
        _context = context;
    }

    public Task<IEnumerable<Note>> GetAllAsync(string userId)
    {
        var notes = _context.Notes.Find(n => n.UserId == userId).ToList();
        return Task.FromResult<IEnumerable<Note>>(notes);
    }

    public Task<Note?> GetByIdAsync(int id, string userId)
    {
        var note = _context.Notes.FindOne(n => n.Id == id && n.UserId == userId);
        return Task.FromResult<Note?>(note);
    }

    public Task<Note> CreateAsync(Note note)
    {
        var maxId = _context.Notes.FindAll().Any()
            ? _context.Notes.FindAll().Max(n => n.Id) + 1
            : 1;
        note.Id = maxId;
        note.CreatedAt = DateTime.UtcNow;
        note.UpdatedAt = DateTime.UtcNow;
        _context.Notes.Insert(note);
        return Task.FromResult(note);
    }

    public Task<Note> UpdateAsync(Note note)
    {
        note.UpdatedAt = DateTime.UtcNow;
        _context.Notes.Update(note);
        return Task.FromResult(note);
    }

    public Task DeleteAsync(int id, string userId)
    {
        _context.Notes.DeleteMany(n => n.Id == id && n.UserId == userId);
        return Task.CompletedTask;
    }

    public Task<IEnumerable<Note>> SearchAsync(string query, string userId)
    {
        var notes = _context.Notes
            .Find(n => n.UserId == userId &&
                (n.Title.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                 n.Content.Contains(query, StringComparison.OrdinalIgnoreCase)))
            .ToList();
        return Task.FromResult<IEnumerable<Note>>(notes);
    }
}
