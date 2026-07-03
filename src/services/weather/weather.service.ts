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

  public async getCoordinatesForCity(city: string): Promise<{ lat: number; lon: number; name: string } | null> {
    const suggestions = await this.searchCitySuggestions(city, 1);
    return suggestions && suggestions.length > 0 ? suggestions[0] : null;
  }

  public async searchCitySuggestions(query: string, limit: number = 5): Promise<{ lat: number; lon: number; name: string; state?: string; country?: string }[] | null> {
    const apiKey = env.OPENWEATHER_API_KEY;
    if (!apiKey) return null;

    try {
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) return null;
      const data = (await response.json()) as any[];
      if (data && data.length > 0) {
        const unique = new Map<string, any>();
        data.forEach(item => {
          const key = `${item.name}-${item.state || ''}-${item.country || ''}`;
          if (!unique.has(key)) {
            unique.set(key, {
              lat: item.lat,
              lon: item.lon,
              name: item.name,
              state: item.state,
              country: item.country,
            });
          }
        });
        return Array.from(unique.values());
      }
      return null;
    } catch (e) {
      console.error('Failed to get coordinates', e);
      return null;
    }
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
      const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
      
      const [currentRes, forecastRes] = await Promise.all([
        fetch(currentUrl),
        fetch(forecastUrl)
      ]);
      
      if (!currentRes.ok) {
        throw new Error(`OpenWeather API failed with status: ${currentRes.status}`);
      }

      const currentData = (await currentRes.json()) as any;
      const forecastData = forecastRes.ok ? (await forecastRes.json()) as any : { list: [] };

      // Compute true daily forecast by grouping 3-hour blocks
      const dailyMap = new Map<string, any>();
      if (forecastData.list) {
        forecastData.list.forEach((item: any) => {
          const dateStr = new Date(item.dt * 1000).toDateString();
          if (!dailyMap.has(dateStr)) {
            dailyMap.set(dateStr, {
              timestamp: item.dt,
              minTemp: item.main.temp_min,
              maxTemp: item.main.temp_max,
              rainProbability: item.pop || 0,
              description: item.weather[0]?.description || 'Unknown',
              icon: item.weather[0]?.icon || '',
            });
          } else {
            const existing = dailyMap.get(dateStr);
            existing.minTemp = Math.min(existing.minTemp, item.main.temp_min);
            existing.maxTemp = Math.max(existing.maxTemp, item.main.temp_max);
            existing.rainProbability = Math.max(existing.rainProbability, item.pop || 0);
            
            // Prefer icon from middle of the day (around 12 PM - 3 PM)
            const hour = new Date(item.dt * 1000).getHours();
            if (hour >= 11 && hour <= 15) {
              existing.description = item.weather[0]?.description || 'Unknown';
              existing.icon = item.weather[0]?.icon || '';
            }
          }
        });
      }
      const daily: DailyForecast[] = Array.from(dailyMap.values()).slice(0, 6); // Up to 6 days depending on current time

      const weatherData: WeatherData = {
        current: {
          temperature: currentData.main.temp,
          humidity: currentData.main.humidity,
          windSpeed: currentData.wind.speed,
          uvIndex: 0,
          description: currentData.weather[0]?.description || 'Unknown',
          icon: currentData.weather[0]?.icon || '',
          timestamp: currentData.dt,
        },
        hourly: [
          {
            timestamp: currentData.dt,
            temperature: currentData.main.temp,
            rainProbability: 0,
            description: currentData.weather[0]?.description || 'Unknown',
            icon: currentData.weather[0]?.icon || '',
          },
          ...forecastData.list
            .filter((h: any) => h.dt > currentData.dt)
            .map((h: any): HourlyForecast => ({
              timestamp: h.dt,
              temperature: h.main.temp,
              rainProbability: h.pop || 0,
              description: h.weather[0]?.description || 'Unknown',
              icon: h.weather[0]?.icon || '',
            }))
        ],
        daily: daily,
        alerts: [],
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
