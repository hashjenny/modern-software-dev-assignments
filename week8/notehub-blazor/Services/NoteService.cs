using Microsoft.EntityFrameworkCore;
using notehub_blazor.Data;
using notehub_blazor.Models;

namespace notehub_blazor.Services;

public class NoteService : INoteService
{
    private readonly AppDbContext _context;

    public NoteService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Note>> GetAllAsync()
    {
        return await _context.Notes
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<Note?> GetByIdAsync(int id)
    {
        return await _context.Notes
            .FirstOrDefaultAsync(n => n.Id == id);
    }

    public async Task<Note> CreateAsync(Note note)
    {
        note.CreatedAt = DateTime.UtcNow;
        note.UpdatedAt = DateTime.UtcNow;
        _context.Notes.Add(note);
        await _context.SaveChangesAsync();
        return note;
    }

    public async Task<Note> UpdateAsync(Note note)
    {
        note.UpdatedAt = DateTime.UtcNow;
        _context.Notes.Update(note);
        await _context.SaveChangesAsync();
        return note;
    }

    public async Task DeleteAsync(int id)
    {
        var note = await _context.Notes
            .FirstOrDefaultAsync(n => n.Id == id);
        if (note != null)
        {
            _context.Notes.Remove(note);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Note>> SearchAsync(string query)
    {
        var tokens = SearchHelpers.Tokenize(query);
        if (tokens.Count == 0)
        {
            return Array.Empty<Note>();
        }

        IQueryable<Note> queryable = _context.Notes;
        foreach (var token in tokens)
        {
            var pattern = $"%{token}%";
            queryable = queryable.Where(n =>
                EF.Functions.Like(n.Title.ToLower(), pattern) ||
                EF.Functions.Like(n.Content.ToLower(), pattern));
        }

        var results = await queryable.ToListAsync();

        return results
            .Select(note => new { Note = note, Score = SearchHelpers.Score(note, tokens) })
            .OrderByDescending(item => item.Score)
            .ThenByDescending(item => item.Note.UpdatedAt)
            .Select(item => item.Note)
            .ToList();
    }
}
