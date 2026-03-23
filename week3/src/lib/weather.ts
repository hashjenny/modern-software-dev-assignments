import dotenv from "dotenv";

dotenv.config({ path: ".env", quiet: true, debug: false });

const HOST = process.env.WEATHER_HOST;
const LOC = process.env.LOC;
const KEY = process.env.WEATHER_KEY;

const REQUEST_TIMEOUT_MS = 10000; // 10 second timeout
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export class WeatherAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isRateLimited: boolean = false
  ) {
    super(message);
    this.name = "WeatherAPIError";
  }
}

export class NetworkTimeoutError extends Error {
  constructor() {
    super("Request timed out");
    this.name = "NetworkTimeoutError";
  }
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new NetworkTimeoutError();
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, REQUEST_TIMEOUT_MS);

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : RETRY_DELAY_MS * Math.pow(2, attempt);

        if (attempt < MAX_RETRIES - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new WeatherAPIError("API rate limit exceeded. Please try again later.", 429, true);
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (lastError instanceof WeatherAPIError) {
        throw lastError;
      }

      if (attempt < MAX_RETRIES - 1) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError || new Error("Request failed after retries");
}

interface DailyWeather {
  tempMax: string;
  tempMin: string;
  fxDate: string;
}

interface WeatherAPIResponse {
  daily?: DailyWeather[];
  code?: string;
  message?: string;
}

export async function getWeather(): Promise<{ tempMax: number; tempMin: number; date: string }> {
  if (!HOST || !LOC || !KEY) {
    throw new WeatherAPIError("Missing WEATHER_HOST, LOC or WEATHER_KEY in environment");
  }

  const url = `${HOST}/v7/weather/3d?location=${LOC}`;
  const response = await fetchWithRetry(url, {
    method: "GET",
    headers: {
      "X-QW-Api-Key": KEY,
    },
  });

  if (!response.ok) {
    throw new WeatherAPIError(`HTTP error! status: ${response.status}`, response.status);
  }

  const data = await response.json() as WeatherAPIResponse;

  if (!data.daily || !Array.isArray(data.daily) || data.daily.length === 0) {
    throw new WeatherAPIError("Empty weather data received from API");
  }

  if (data.code && data.code !== "200") {
    throw new WeatherAPIError(`API error: ${data.message || data.code}`, undefined);
  }

  const daily = data.daily[0];
  const tempMax = Number(daily["tempMax"]);
  const tempMin = Number(daily["tempMin"]);
  const date = daily["fxDate"];

  if (isNaN(tempMax) || isNaN(tempMin)) {
    throw new WeatherAPIError("Invalid temperature data received from API");
  }

  return { tempMax, tempMin, date };
}

export function getClothingAdvice(temperature: number): { suggestion: string; diff: number } {
  const BASE_TEMP = 26;
  const diff = temperature - BASE_TEMP;

  let suggestion = "";

  if (diff >= 5) {
    suggestion = "天气较热：建议短袖 + 短裤，注意防晒。";
  } else if (diff >= 2) {
    suggestion = "天气偏暖：建议短袖或薄衬衫，搭配轻薄长裤。";
  } else if (diff >= -2) {
    suggestion = "体感舒适：短袖 + 长裤即可。";
  } else if (diff >= -5) {
    suggestion = "稍微偏凉：建议薄外套。";
  } else if (diff >= -8) {
    suggestion = "天气较凉：建议卫衣 / 薄毛衣 / 外套。";
  } else {
    suggestion = "天气较冷：建议厚外套或羽绒服。";
  }

  return { suggestion, diff };
}
