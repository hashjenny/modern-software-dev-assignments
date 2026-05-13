using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using notehub_blazor.Models;
using Xunit;

namespace notehub_blazor.Tests;

public class SearchHelpersTests
{
    [Fact]
    public void Tokenize_TrimsSplitsAndLowercases()
    {
        var tokens = Invoke("Tokenize", "  Hello   World hello ") as IEnumerable<string>;
        Assert.NotNull(tokens);
        Assert.Equal(new[] { "hello", "world" }, tokens!.ToArray());
    }

    [Fact]
    public void Score_WeightsTitleHigherThanContent()
    {
        var note = new Note { Title = "Alpha", Content = "beta" };
        var tokens = new[] { "alpha", "beta" };

        var score = (int)Invoke("Score", note, tokens)!;
        Assert.Equal(3, score);
    }

    [Fact]
    public void BuildSnippet_ReturnsWindowAroundMatch()
    {
        var content = "This is a long body with keyword in the middle of the text.";
        var snippet = (string)Invoke("BuildSnippet", content, new[] { "keyword" }, 30)!;

        Assert.Contains("keyword", snippet, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Highlight_EncodesAndMarksTokens()
    {
        var highlighted = (string)Invoke("Highlight", "<b>alpha</b>", new[] { "alpha" })!;

        Assert.Contains("&lt;b&gt;", highlighted);
        Assert.Contains("<mark>alpha</mark>", highlighted, StringComparison.OrdinalIgnoreCase);
    }

    private static object? Invoke(string methodName, params object[] args)
    {
        var type = Type.GetType("notehub_blazor.Services.SearchHelpers, notehub-blazor");
        Assert.NotNull(type);

        var method = type!.GetMethod(methodName, BindingFlags.Public | BindingFlags.Static);
        Assert.NotNull(method);

        return method!.Invoke(null, args);
    }
}
