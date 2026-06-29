export interface CurrentWeather {
  temperature: number; // Celsius
  humidity: number; // %
  windSpeed: number; // m/s
  uvIndex: number;
  description: string;
  icon: string;
  timestamp: number;
}

export interface HourlyForecast {
  timestamp: number;
  temperature: number;
  rainProbability: number; // 0 to 1
  description: string;
  icon: string;
}

export interface DailyForecast {
  timestamp: number;
  minTemp: number;
  maxTemp: number;
  rainProbability: number; // 0 to 1
  description: string;
  icon: string;
}

export interface WeatherAlert {
  event: string;
  description: string;
  startTime: number;
  endTime: number;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[]; 
  daily: DailyForecast[]; 
  alerts?: WeatherAlert[];
}
