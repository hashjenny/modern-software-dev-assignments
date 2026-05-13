using System.Net;
using System.Text.RegularExpressions;
using notehub_blazor.Models;

namespace notehub_blazor.Services;

public static class SearchHelpers
{
    public static IReadOnlyList<string> Tokenize(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Array.Empty<string>();
        }

        return query
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(token => token.ToLowerInvariant())
            .Distinct()
            .ToList();
    }

    public static int Score(Note note, IReadOnlyList<string> tokens)
    {
        if (tokens.Count == 0)
        {
            return 0;
        }

        var title = note.Title.ToLowerInvariant();
        var content = note.Content.ToLowerInvariant();
        var score = 0;

        foreach (var token in tokens)
        {
            if (title.Contains(token))
            {
                score += 2;
            }

            if (content.Contains(token))
            {
                score += 1;
            }
        }

        return score;
    }

    public static string BuildSnippet(string content, IReadOnlyList<string> tokens, int length = 120)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return string.Empty;
        }

        if (tokens.Count == 0)
        {
            return Truncate(content, length);
        }

        var lower = content.ToLowerInvariant();
        var matchIndex = tokens
            .Select(token => lower.IndexOf(token, StringComparison.OrdinalIgnoreCase))
            .Where(index => index >= 0)
            .DefaultIfEmpty(0)
            .Min();

        var start = Math.Max(0, matchIndex - length / 4);
        var sliceLength = Math.Min(length, content.Length - start);
        var snippet = content.Substring(start, sliceLength);

        if (start > 0)
        {
            snippet = "..." + snippet;
        }

        if (start + sliceLength < content.Length)
        {
            snippet += "...";
        }

        return snippet;
    }

    public static string Highlight(string text, IReadOnlyList<string> tokens)
    {
        var encoded = WebUtility.HtmlEncode(text);
        if (tokens.Count == 0)
        {
            return encoded;
        }

        var pattern = string.Join("|", tokens.Select(Regex.Escape));
        return Regex.Replace(encoded, pattern, "<mark>$0</mark>", RegexOptions.IgnoreCase);
    }

    private static string Truncate(string text, int length)
    {
        if (text.Length <= length)
        {
            return text;
        }

        return text.Substring(0, length) + "...";
    }
}
