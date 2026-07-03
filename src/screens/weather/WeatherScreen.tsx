import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  TextInput,
  ActivityIndicator,
  Keyboard,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';
import { weatherService } from '../../services/weather/weather.service';
import { mapService } from '../../services/maps/map.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getWeatherIconName = (code: string) => {
  switch (code) {
    case '01d': return 'weather-sunny';
    case '01n': return 'weather-night';
    case '02d': return 'weather-partly-cloudy';
    case '02n': return 'weather-night-partly-cloudy';
    case '03d': case '03n': return 'weather-cloudy';
    case '04d': case '04n': return 'weather-cloudy';
    case '09d': case '09n': return 'weather-pouring';
    case '10d': return 'weather-partly-rainy';
    case '10n': return 'weather-rainy';
    case '11d': case '11n': return 'weather-lightning';
    case '13d': case '13n': return 'weather-snowy';
    case '50d': case '50n': return 'weather-fog';
    default: return 'weather-partly-cloudy';
  }
};

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}${ampm}`;
};

const formatDay = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();
  if (date.getDay() === today) return 'Today';
  return days[date.getDay()];
};

const SkeletonItem = ({ style }: { style: any }) => {
  const pulseAnim = React.useRef(new Animated.Value(0.5)).current;

  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, useNativeDriver: true })
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulseAnim]);

  return (
    <Animated.View style={[style, { opacity: pulseAnim }]} />
  );
};

export const WeatherScreen = ({ navigation }: any) => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [searchQuery, setSearchQuery] = useState('');
  const [locationName, setLocationName] = useState('Current Location');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchWeather = async (lat: number, lon: number, name: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await weatherService.getWeatherForLocation(lat, lon);
      setWeatherData(data);
      setLocationName(name);
    } catch (err: any) {
      setErrorMsg('Failed to fetch weather');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentLocationWeather = async () => {
    try {
      setIsLoading(true);
      const loc = await mapService.getCurrentLocation();
      await fetchWeather(loc.latitude, loc.longitude, 'Current Location');
    } catch (e) {
      // Fallback
      await fetchWeather(22.5726, 88.3639, 'Kolkata');
    }
  };

  useEffect(() => {
    loadCurrentLocationWeather();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    Keyboard.dismiss();
    setShowSuggestions(false);
    setIsLoading(true);
    setErrorMsg(null);
    const coords = await weatherService.getCoordinatesForCity(searchQuery.trim());
    if (coords) {
      await fetchWeather(coords.lat, coords.lon, coords.name);
    } else {
      setIsLoading(false);
      setErrorMsg('Location not found');
    }
    setSearchQuery('');
  };

  const onSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text.trim().length > 2) {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(async () => {
        const res = await weatherService.searchCitySuggestions(text.trim());
        if (res) {
          setSuggestions(res);
          setShowSuggestions(true);
        }
      }, 500);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const onSelectSuggestion = async (item: any) => {
    Keyboard.dismiss();
    setShowSuggestions(false);
    setSearchQuery('');
    setSuggestions([]);
    await fetchWeather(item.lat, item.lon, item.name);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}
        >
          <Icon name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Weather Forecast</Text>
          <View style={styles.locationContainer}>
            <Icon name="map-marker-outline" size={14} color={colors.muted} />
            <Text style={styles.locationText}>{locationName}</Text>
          </View>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={20} color={colors.muted} style={styles.searchIconLeft} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search location..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={onSearchChange}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            selectionColor={colors.accent}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setSuggestions([]);
              setShowSuggestions(false);
            }}>
              <Icon name="close-circle" size={20} color={colors.muted} style={styles.searchIconRight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((item, index) => (
            <TouchableOpacity 
              key={`${item.lat}-${item.lon}-${index}`} 
              style={[styles.suggestionItem, index === suggestions.length - 1 && { borderBottomWidth: 0 }]} 
              onPress={() => onSelectSuggestion(item)}
            >
              <Icon name="map-marker" size={18} color={colors.muted} style={{ marginRight: 10 }} />
              <View>
                <Text style={styles.suggestionTitle}>{item.name}</Text>
                <Text style={styles.suggestionSub}>{item.state ? `${item.state}, ` : ''}{item.country}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {isLoading ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* ── Current Weather Skeleton ── */}
          <View style={styles.currentWeatherContainer}>
            <View style={styles.currentTempContainer}>
              <SkeletonItem style={{ width: normalize(120), height: normalize(100), backgroundColor: colors.outline, borderRadius: normalize(12) }} />
            </View>
            <SkeletonItem style={{ width: normalize(100), height: normalize(100), backgroundColor: colors.outline, borderRadius: normalize(50) }} />
          </View>
          
          <SkeletonItem style={{ width: normalize(150), height: normalize(24), backgroundColor: colors.outline, borderRadius: normalize(8), marginBottom: normalize(6) }} />
          <View style={styles.highLowContainer}>
            <SkeletonItem style={{ width: normalize(100), height: normalize(18), backgroundColor: colors.outline, borderRadius: normalize(8) }} />
          </View>

          {/* ── Hourly Forecast Skeleton ── */}
          <View style={styles.glassCard}>
            <View style={[styles.hourlyScroll, { flexDirection: 'row', paddingHorizontal: normalize(20) }]}>
              {[1, 2, 3, 4, 5].map((key) => (
                <View key={key} style={styles.hourlyItem}>
                  <SkeletonItem style={{ width: normalize(30), height: normalize(14), backgroundColor: colors.outline, borderRadius: normalize(4), marginBottom: normalize(12) }} />
                  <SkeletonItem style={{ width: normalize(32), height: normalize(32), backgroundColor: colors.outline, borderRadius: normalize(16), marginBottom: normalize(12) }} />
                  <SkeletonItem style={{ width: normalize(24), height: normalize(16), backgroundColor: colors.outline, borderRadius: normalize(4) }} />
                </View>
              ))}
            </View>
          </View>

          {/* ── Daily Forecast Skeleton ── */}
          <View style={[styles.glassCard, styles.dailyCard]}>
            {[1, 2, 3, 4, 5].map((key) => (
              <View key={key} style={styles.dailyItem}>
                <SkeletonItem style={{ width: normalize(50), height: normalize(16), backgroundColor: colors.outline, borderRadius: normalize(4) }} />
                <View style={styles.dailyIconContainer}>
                  <SkeletonItem style={{ width: normalize(24), height: normalize(24), backgroundColor: colors.outline, borderRadius: normalize(12) }} />
                </View>
                <View style={styles.dailyTempContainer}>
                  <SkeletonItem style={{ width: normalize(30), height: normalize(16), backgroundColor: colors.outline, borderRadius: normalize(4), marginRight: normalize(16) }} />
                  <SkeletonItem style={{ width: normalize(30), height: normalize(16), backgroundColor: colors.outline, borderRadius: normalize(4) }} />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : errorMsg ? (
        <View style={styles.centerContainer}>
          <Icon name="alert-circle-outline" size={48} color={colors.muted} style={{ marginBottom: 12 }} />
          <Text style={{ color: colors.text }}>{errorMsg}</Text>
          <TouchableOpacity onPress={loadCurrentLocationWeather} style={{ marginTop: 20 }}>
            <Text style={{ color: colors.accent }}>Use Current Location</Text>
          </TouchableOpacity>
        </View>
      ) : weatherData && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* ── Current Weather ── */}
          <View style={styles.currentWeatherContainer}>
            <View style={styles.currentTempContainer}>
              <Text style={styles.currentTemp}>{Math.round(weatherData.current.temperature)}</Text>
              <Text style={styles.currentTempDegree}>°</Text>
            </View>
            
            <Icon name={getWeatherIconName(weatherData.current.icon)} size={120} color={colors.text} style={styles.currentWeatherIcon} />
          </View>
          
          <Text style={styles.weatherCondition}>{weatherData.current.description}</Text>
          {weatherData.daily && weatherData.daily.length > 0 && (
            <View style={styles.highLowContainer}>
              <Text style={styles.highLowText}>H: {Math.round(weatherData.daily[0].maxTemp)}°</Text>
              <Text style={styles.highLowText}>  L: {Math.round(weatherData.daily[0].minTemp)}°</Text>
            </View>
          )}

          {/* ── Hourly Forecast ── */}
          <View style={styles.glassCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourlyScroll}>
              {weatherData.hourly?.slice(0, 9).map((item: any, index: number) => (
                <View key={index} style={styles.hourlyItem}>
                  <Text style={[styles.hourlyTime, index === 0 && styles.hourlyTimeNow]}>
                    {index === 0 ? 'Now' : formatTime(item.timestamp)}
                  </Text>
                  <Icon name={getWeatherIconName(item.icon)} size={28} color={colors.text} style={styles.hourlyIcon} />
                  <Text style={styles.hourlyTemp}>{Math.round(item.temperature)}°</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* ── Daily Forecast ── */}
          <View style={[styles.glassCard, styles.dailyCard]}>
            {weatherData.daily?.slice(0, 7).map((item: any, index: number) => (
              <View key={index} style={styles.dailyItem}>
                <Text style={styles.dailyDay}>{formatDay(item.timestamp)}</Text>
                
                <View style={styles.dailyIconContainer}>
                  <Icon name={getWeatherIconName(item.icon)} size={24} color={colors.text} />
                </View>
                
                <View style={styles.dailyTempContainer}>
                  <Text style={styles.dailyHigh}>{Math.round(item.maxTemp)}°</Text>
                  <Text style={styles.dailyLow}>{Math.round(item.minTemp)}°</Text>
                </View>
              </View>
            ))}
          </View>

        </ScrollView>
      )}
    </View>
  );
};

const getStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(22),
    paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28) + 12,
    paddingBottom: normalize(12),
  },
  backBtn: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(22),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: colors.text,
    fontSize: normalizeFont(18),
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: normalize(4),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: colors.muted,
    fontSize: normalizeFont(13),
    fontWeight: '500',
    marginLeft: normalize(4),
  },
  headerRightPlaceholder: {
    width: normalize(44),
  },

  // Search
  searchContainer: {
    paddingHorizontal: normalize(22),
    marginBottom: normalize(16),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: normalize(12),
    height: normalize(48),
    paddingHorizontal: normalize(16),
    borderWidth: 1,
    borderColor: colors.outline,
  },
  searchIconLeft: {
    marginRight: normalize(10),
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: normalizeFont(14),
  },
  searchIconRight: {
    marginLeft: normalize(10),
  },

  // Suggestions
  suggestionsContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: normalize(22),
    borderRadius: normalize(12),
    paddingVertical: normalize(8),
    borderWidth: 1,
    borderColor: colors.outline,
    marginBottom: normalize(16),
    marginTop: normalize(-8),
    elevation: 5,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
  },
  suggestionTitle: {
    color: colors.text,
    fontSize: normalizeFont(14),
    fontWeight: '600',
  },
  suggestionSub: {
    color: colors.muted,
    fontSize: normalizeFont(12),
    marginTop: normalize(2),
  },

  // Content Scroll
  scrollContent: {
    paddingHorizontal: normalize(22),
    paddingBottom: normalize(100),
  },

  // Current Weather
  currentWeatherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: normalize(10),
    marginBottom: normalize(10),
  },
  currentTempContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currentTemp: {
    fontSize: normalizeFont(84),
    fontWeight: '300',
    color: colors.text,
    letterSpacing: -2,
  },
  currentTempDegree: {
    fontSize: normalizeFont(48),
    fontWeight: '300',
    color: colors.text,
    marginTop: normalize(8),
  },
  currentWeatherIcon: {
    marginRight: normalize(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  weatherCondition: {
    fontSize: normalizeFont(22),
    fontWeight: '500',
    color: colors.text,
    marginBottom: normalize(6),
    textTransform: 'capitalize',
  },
  highLowContainer: {
    flexDirection: 'row',
    marginBottom: normalize(40),
  },
  highLowText: {
    fontSize: normalizeFont(16),
    fontWeight: '600',
    color: colors.muted,
  },

  // Glass Card
  glassCard: {
    backgroundColor: colors.surface,
    borderRadius: normalize(24),
    borderWidth: 1,
    borderColor: colors.outline,
    paddingVertical: normalize(20),
    marginBottom: normalize(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  // Hourly Forecast
  hourlyScroll: {
    paddingHorizontal: normalize(20),
    gap: normalize(30),
  },
  hourlyItem: {
    alignItems: 'center',
  },
  hourlyTime: {
    fontSize: normalizeFont(14),
    color: colors.muted,
    fontWeight: '600',
    marginBottom: normalize(12),
  },
  hourlyTimeNow: {
    color: colors.text,
  },
  hourlyIcon: {
    marginBottom: normalize(12),
  },
  hourlyTemp: {
    fontSize: normalizeFont(16),
    color: colors.text,
    fontWeight: '600',
  },

  // Daily Forecast
  dailyCard: {
    paddingHorizontal: normalize(20),
    paddingTop: normalize(10),
    paddingBottom: normalize(10),
  },
  dailyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: normalize(16),
  },
  dailyDay: {
    fontSize: normalizeFont(16),
    color: colors.text,
    fontWeight: '500',
    width: normalize(60),
  },
  dailyIconContainer: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: normalize(40),
  },
  dailyTempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: normalize(80),
    justifyContent: 'flex-end',
  },
  dailyHigh: {
    fontSize: normalizeFont(16),
    color: colors.text,
    fontWeight: '600',
    width: normalize(36),
    textAlign: 'right',
  },
  dailyLow: {
    fontSize: normalizeFont(16),
    color: colors.muted,
    fontWeight: '600',
    width: normalize(36),
    textAlign: 'right',
  },
});
