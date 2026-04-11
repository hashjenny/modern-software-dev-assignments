/**
 * Weather API tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WeatherAPIError, NetworkTimeoutError } from "./weather-api.js";

describe("WeatherAPIError", () => {
  let WeatherAPIErrorClass: any;

  beforeEach(async () => {
    const module = await import("./weather-api.js");
    WeatherAPIErrorClass = module.WeatherAPIError;
  });

  it("should set statusCode and isRateLimited", () => {
    const error = new WeatherAPIErrorClass("Rate limited", 429, true);
    expect(error.message).toBe("Rate limited");
    expect(error.statusCode).toBe(429);
    expect(error.isRateLimited).toBe(true);
    expect(error.name).toBe("WeatherAPIError");
  });

  it("should default isRateLimited to false", () => {
    const error = new WeatherAPIErrorClass("Some error", 500);
    expect(error.isRateLimited).toBe(false);
    expect(error.statusCode).toBe(500);
  });

  it("should work without arguments", () => {
    const error = new WeatherAPIErrorClass("Error");
    expect(error.message).toBe("Error");
    expect(error.statusCode).toBeUndefined();
    expect(error.isRateLimited).toBe(false);
  });
});

describe("NetworkTimeoutError", () => {
  let NetworkTimeoutErrorClass: any;

  beforeEach(async () => {
    const module = await import("./weather-api.js");
    NetworkTimeoutErrorClass = module.NetworkTimeoutError;
  });

  it("should set correct error message", () => {
    const error = new NetworkTimeoutErrorClass();
    expect(error.message).toBe("Request timed out");
    expect(error.name).toBe("NetworkTimeoutError");
  });
});

describe("getWeather API error handling", () => {
  beforeEach(() => {
    process.env.WEATHER_HOST = "https://api.qweather.com";
    process.env.WEATHER_KEY = "test-key";
    process.env.LOC = "Beijing";
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("HTTP 500 error should throw", async () => {
    const { getWeather } = await import("./weather-api.js");

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(getWeather()).rejects.toThrow("HTTP error! status: 500");
  });

  it("HTTP 404 error should throw", async () => {
    const { getWeather } = await import("./weather-api.js");

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(getWeather()).rejects.toThrow("HTTP error! status: 404");
  });

  it("empty data should throw Empty weather data", async () => {
    const { getWeather } = await import("./weather-api.js");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ daily: [], code: "200" }),
    });

    await expect(getWeather()).rejects.toThrow("Empty weather data");
  });

  it("undefined daily should throw Empty weather data", async () => {
    const { getWeather } = await import("./weather-api.js");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ code: "200" }),
    });

    await expect(getWeather()).rejects.toThrow("Empty weather data");
  });

  it("non-200 code should throw API error", async () => {
    const { getWeather } = await import("./weather-api.js");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        code: "401",
        message: "Invalid key",
        daily: [{ tempMax: "28", tempMin: "18", fxDate: "2026-03-31" }]
      }),
    });

    await expect(getWeather()).rejects.toThrow("API error");
  });

  it("invalid temperature data should throw", async () => {
    const { getWeather } = await import("./weather-api.js");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          daily: [{ tempMax: "invalid", tempMin: "18", fxDate: "2026-03-31" }],
          code: "200",
        }),
    });

    await expect(getWeather()).rejects.toThrow("Invalid temperature data");
  });

  it("successful call should return correct data", async () => {
    const { getWeather } = await import("./weather-api.js");

    const mockResponse = {
      daily: [{ tempMax: "28", tempMin: "18", fxDate: "2026-03-31" }],
      code: "200",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await getWeather();
    expect(result.tempMax).toBe(28);
    expect(result.tempMin).toBe(18);
    expect(result.date).toBe("2026-03-31");
  });

  it("请求头只应包含 X-QW-Api-Key（不透传 MCP 认证头）", async () => {
    const { getWeather } = await import("./weather-api.js");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          daily: [{ tempMax: "28", tempMin: "18", fxDate: "2026-03-31" }],
          code: "200",
        }),
    });

    await getWeather();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const fetchOptions = vi.mocked(global.fetch).mock.calls[0][1] as RequestInit;
    expect(fetchOptions?.headers).toEqual({
      "X-QW-Api-Key": "test-key",
    });
  });
});

describe("getWeather rate limit handling", () => {
  beforeEach(() => {
    process.env.WEATHER_HOST = "https://api.qweather.com";
    process.env.WEATHER_KEY = "test-key";
    process.env.LOC = "Beijing";
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("429 status should throw with rate limit info", async () => {
    const { getWeather } = await import("./weather-api.js");

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
    });

    await expect(getWeather()).rejects.toThrow();
  });
});
