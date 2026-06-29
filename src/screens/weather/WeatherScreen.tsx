import { useMemo } from 'react';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HourlyForecast {
  time: string;
  temp: number;
  icon: string;
  isNow?: boolean;
}

interface DailyForecast {
  day: string;
  high: number;
  low: number;
  icon: string;
}

const hourlyData: HourlyForecast[] = [
  { time: 'Now', temp: 12, icon: 'weather-cloudy', isNow: true },
  { time: '11AM', temp: 13, icon: 'weather-cloudy' },
  { time: '12PM', temp: 14, icon: 'weather-cloudy' },
  { time: '1PM', temp: 14, icon: 'weather-cloudy' },
  { time: '2PM', temp: 15, icon: 'weather-cloudy' },
  { time: '3PM', temp: 15, icon: 'weather-partly-cloudy' },
];

const dailyData: DailyForecast[] = [
  { day: 'Today', high: 15, low: 7, icon: 'weather-partly-cloudy' },
  { day: 'Sat', high: 16, low: 8, icon: 'weather-partly-cloudy' },
  { day: 'Sun', high: 18, low: 9, icon: 'weather-sunny' },
  { day: 'Mon', high: 17, low: 8, icon: 'weather-pouring' },
  { day: 'Tue', high: 16, low: 7, icon: 'weather-pouring' },
];

export const WeatherScreen = ({ navigation }: any) => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

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
            <Text style={styles.locationText}>Chamonix, France</Text>
          </View>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ── Current Weather ── */}
        <View style={styles.currentWeatherContainer}>
          <View style={styles.currentTempContainer}>
            <Text style={styles.currentTemp}>12</Text>
            <Text style={styles.currentTempDegree}>°</Text>
          </View>
          
          <Icon name="weather-cloudy" size={120} color={colors.text} style={styles.currentWeatherIcon} />
        </View>
        
        <Text style={styles.weatherCondition}>Cloudy</Text>
        <View style={styles.highLowContainer}>
          <Text style={styles.highLowText}>H: 15°</Text>
          <Text style={styles.highLowText}>  L: 7°</Text>
        </View>

        {/* ── Hourly Forecast ── */}
        <View style={styles.glassCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourlyScroll}>
            {hourlyData.map((item, index) => (
              <View key={index} style={styles.hourlyItem}>
                <Text style={[styles.hourlyTime, item.isNow && styles.hourlyTimeNow]}>
                  {item.time}
                </Text>
                <Icon name={item.icon} size={28} color={colors.text} style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>{item.temp}°</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Daily Forecast ── */}
        <View style={[styles.glassCard, styles.dailyCard]}>
          {dailyData.map((item, index) => (
            <View key={index} style={styles.dailyItem}>
              <Text style={styles.dailyDay}>{item.day}</Text>
              
              <View style={styles.dailyIconContainer}>
                <Icon name={item.icon} size={24} color={colors.text} />
              </View>
              
              <View style={styles.dailyTempContainer}>
                <Text style={styles.dailyHigh}>{item.high}°</Text>
                <Text style={styles.dailyLow}>{item.low}°</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
};

const getStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(22),
    paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28) + 12,
    paddingBottom: normalize(24),
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
