using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using notehub_blazor.Data;
using notehub_blazor.Models;
using notehub_blazor.Services;
using Xunit;

namespace notehub_blazor.Tests;

public class NoteServiceSearchTests
{
    [Fact]
    public async Task SearchAsync_MatchesAllTokens_CaseInsensitive()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;

        await using var context = new AppDbContext(options);
        await context.Database.EnsureCreatedAsync();

        var matching = new Note { Title = "Alpha Beta", Content = "content" };
        var nonMatching = new Note { Title = "Alpha", Content = "content" };
        context.Notes.AddRange(matching, nonMatching);
        await context.SaveChangesAsync();

        var service = new NoteService(context);
        var results = (await service.SearchAsync("alpha beta")).ToList();

        Assert.Single(results);
        Assert.Equal(matching.Id, results[0].Id);
    }

    [Fact]
    public async Task SearchAsync_OrdersByScoreThenUpdatedAt()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;

        await using var context = new AppDbContext(options);
        await context.Database.EnsureCreatedAsync();

        var olderTitleHit = new Note
        {
            Title = "Alpha",
            Content = "content",
            UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };
        var newerContentHit = new Note
        {
            Title = "Other",
            Content = "alpha appears here",
            UpdatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };

        context.Notes.AddRange(olderTitleHit, newerContentHit);
        await context.SaveChangesAsync();

        var service = new NoteService(context);
        var results = (await service.SearchAsync("alpha")).ToList();

        Assert.Equal(2, results.Count);
        Assert.Equal(olderTitleHit.Id, results[0].Id);
    }
}
