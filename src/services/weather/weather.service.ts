import env from '@config/env';
import { WeatherData, HourlyForecast, DailyForecast, WeatherAlert } from './types';

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface CacheEntry {
  timestamp: number;
  data: WeatherData;
}

export class WeatherService {
  private static instance: WeatherService;
  private cache: Map<string, CacheEntry> = new Map();

  private constructor() {}

  public static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  private getCacheKey(lat: number, lon: number): string {
    // Round to 3 decimal places to increase cache hits for nearby coordinates
    return `${lat.toFixed(3)},${lon.toFixed(3)}`;
  }

  public async getWeatherForLocation(lat: number, lon: number): Promise<WeatherData> {
    const cacheKey = this.getCacheKey(lat, lon);
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return cached.data;
    }

    const apiKey = env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENWEATHER_API_KEY is missing from environment variables.');
    }

    try {
      // Using One Call 3.0 API to get everything in one request
      const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`OpenWeather API failed with status: ${response.status}`);
      }

      const rawData = await response.json();

      const weatherData: WeatherData = {
        current: {
          temperature: rawData.current.temp,
          humidity: rawData.current.humidity,
          windSpeed: rawData.current.wind_speed,
          uvIndex: rawData.current.uvi,
          description: rawData.current.weather[0]?.description || 'Unknown',
          icon: rawData.current.weather[0]?.icon || '',
          timestamp: rawData.current.dt,
        },
        hourly: rawData.hourly.map((h: any): HourlyForecast => ({
          timestamp: h.dt,
          temperature: h.temp,
          rainProbability: h.pop || 0,
          description: h.weather[0]?.description || 'Unknown',
          icon: h.weather[0]?.icon || '',
        })),
        daily: rawData.daily.map((d: any): DailyForecast => ({
          timestamp: d.dt,
          minTemp: d.temp.min,
          maxTemp: d.temp.max,
          rainProbability: d.pop || 0,
          description: d.weather[0]?.description || 'Unknown',
          icon: d.weather[0]?.icon || '',
        })),
        alerts: rawData.alerts?.map((a: any): WeatherAlert => ({
          event: a.event,
          description: a.description,
          startTime: a.start,
          endTime: a.end,
        })) || [],
      };

      this.cache.set(cacheKey, {
        timestamp: Date.now(),
        data: weatherData,
      });

      return weatherData;
    } catch (error: any) {
      console.error('Failed to fetch weather data:', error);
      throw new Error('Could not retrieve weather data. Please try again later.');
    }
  }
}

export const weatherService = WeatherService.getInstance();
