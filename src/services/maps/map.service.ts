import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationCoordinate {
  latitude: number;
  longitude: number;
}

export interface CachedRouteData {
  routeCoordinates: LocationCoordinate[];
  baseCamp: LocationCoordinate;
  markers?: { coordinate: LocationCoordinate; title: string; description?: string }[];
}

const ROUTE_CACHE_PREFIX = '@trek_route_cache_';

export class MapService {
  private static instance: MapService;

  private constructor() {}

  public static getInstance(): MapService {
    if (!MapService.instance) {
      MapService.instance = new MapService();
    }
    return MapService.instance;
  }

  /**
   * Request location permission from the user based on platform.
   */
  public async requestLocationPermission(): Promise<boolean> {
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    });

    if (!permission) return false;

    try {
      const currentStatus = await check(permission);
      
      if (currentStatus === RESULTS.GRANTED) {
        return true;
      }

      const requestStatus = await request(permission);
      return requestStatus === RESULTS.GRANTED;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  /**
   * Get the current device location using Geolocation API.
   * Prompts for permissions if not already granted.
   */
  public async getCurrentLocation(): Promise<LocationCoordinate> {
    const hasPermission = await this.requestLocationPermission();
    
    if (!hasPermission) {
      throw new Error('Location permission not granted.');
    }

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Failed to get location: ${error.message}`));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  }

  /**
   * Cache route data to AsyncStorage for offline preparation.
   */
  public async cacheRouteData(routeId: string, data: CachedRouteData): Promise<void> {
    try {
      const key = `${ROUTE_CACHE_PREFIX}${routeId}`;
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching route data:', error);
      throw new Error('Failed to cache route data for offline use.');
    }
  }

  /**
   * Retrieve cached route data from AsyncStorage.
   */
  public async getCachedRouteData(routeId: string): Promise<CachedRouteData | null> {
    try {
      const key = `${ROUTE_CACHE_PREFIX}${routeId}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        return JSON.parse(data) as CachedRouteData;
      }
      return null;
    } catch (error) {
      console.error('Error retrieving cached route data:', error);
      return null;
    }
  }
}

export const mapService = MapService.getInstance();
