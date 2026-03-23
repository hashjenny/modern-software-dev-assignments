export interface WeatherResult {
  tempMax: number;
  tempMin: number;
  date: string;
}

export interface ClothingAdviceResult {
  suggestion: string;
  diff: number;
}

export interface ToolError {
  error: string;
  code?: string;
}
