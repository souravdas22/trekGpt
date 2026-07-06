import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  ImageBackground,
  Platform,
  Image,
  RefreshControl,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import LinearGradient from 'react-native-linear-gradient';
import { normalize, normalizeFont } from '@theme/normalize';
import Svg, { Circle } from 'react-native-svg';
import { trekService, TrekDocument } from '../../services/firebase/trek.service';
import { weatherService } from '../../services/weather/weather.service';
import { mapService } from '../../services/maps/map.service';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../../services/firebase/collections';

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

const { width: SCREEN_WIDTH } = Dimensions.get('window');


type CircularProgressProps = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
};

const CircularProgress = ({ progress, size = 46, strokeWidth = 3, color }: CircularProgressProps) => {
  const themeColors = useAppTheme();
  const activeColor = color || themeColors.accent;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          stroke="rgba(255,255,255,0.15)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={activeColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: themeColors.text, fontSize: normalizeFont(12), fontWeight: '700' }}>{progress}%</Text>
      </View>
    </View>
  );
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

export const HomeScreen = () => {
  const colors = useAppTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [aiPicks, setAiPicks] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [upcomingTreks, setUpcomingTreks] = useState<any[]>([]);
  const [activeUpcomingIndex, setActiveUpcomingIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weatherTemp, setWeatherTemp] = useState<number | null>(null);
  const [weatherIcon, setWeatherIcon] = useState<string>('weather-partly-cloudy');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);

  const expedition = useSelector((state: RootState) => state.expedition);
  const savedTreks = useSelector((state: RootState) => state.savedTreks.savedTreks);

  const onUpcomingScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const itemWidth = SCREEN_WIDTH - normalize(40);
    const index = Math.round(x / itemWidth);
    if (index !== activeUpcomingIndex) setActiveUpcomingIndex(index);
  };

  const fetchHomeData = React.useCallback(async () => {
    try {
      const dbTreks = await trekService.getAllTreks(true);
      
      const picks = dbTreks.filter(t => t.isFeatured).slice(0, 4).map((t, i) => ({
        id: t.id,
        name: t.name || 'Unknown',
        location: t.location || 'Unknown',
        rating: '4.5',
        price: t.estimatedCost ? `₹${t.estimatedCost}` : 'Contact',
        image: t.imageUrl ? { uri: t.imageUrl } : require('../../assets/images/fallback_trek.jpg'),
      }));
      
      const trendingList = dbTreks.filter(t => t.isPopular).slice(0, 3).map((t, i) => ({
        id: t.id,
        name: t.name?.split(' ')[0] || 'Unknown',
        trend: `${Math.floor(Math.random() * 20 + 10)}%`,
        icon: i % 2 === 0 ? 'leaf' : 'fire',
        color: i % 2 === 0 ? '#4ADE80' : '#F97316',
      }));

      const upcomingList = dbTreks.filter(t => t.isUpcoming).slice(0, 5).map(t => ({
        id: t.id,
        name: t.name || 'Unknown',
        location: t.location || 'Unknown',
        daysLeft: Math.floor(Math.random() * 14) + 2,
        progress: Math.floor(Math.random() * 40) + 40,
        image: t.imageUrl ? { uri: t.imageUrl } : require('../../assets/images/fallback_trek.jpg'),
      }));

      setAiPicks(picks);
      setTrending(trendingList);
      setUpcomingTreks(upcomingList.length > 0 ? upcomingList : picks.map(p => ({ ...p, daysLeft: Math.floor(Math.random() * 14) + 2, progress: Math.floor(Math.random() * 40) + 40 })));

      // Fetch Weather
      try {
        let weatherLocationString = null;
        if (expedition.isActive && expedition.activeTrek?.location) {
          weatherLocationString = expedition.activeTrek.location;
        } else if (savedTreks.length > 0 && savedTreks[0].location) {
          weatherLocationString = savedTreks[0].location;
        } else if (picks.length > 0 && picks[0].location) {
          weatherLocationString = picks[0].location;
        }

        let lat = 22.5726; // Default to Kolkata
        let lon = 88.3639;

        if (weatherLocationString) {
          const coords = await weatherService.getCoordinatesForCity(weatherLocationString.split(',')[0]);
          if (coords) {
            lat = coords.lat;
            lon = coords.lon;
          }
        } else {
          try {
            const loc = await mapService.getCurrentLocation();
            lat = loc.latitude;
            lon = loc.longitude;
          } catch (e) {
            // keep defaults
          }
        }
        const weather = await weatherService.getWeatherForLocation(lat, lon);
        setWeatherTemp(weather.current.temperature);
        setWeatherIcon(getWeatherIconName(weather.current.icon));
      } catch (err) {
        console.error(err);
      }
    } catch (error) {
      console.error('Error fetching home data', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData, expedition.isActive, savedTreks.length]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchUserProfile = async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          setIsProfileLoading(true);
          const db = getFirestore();
          try {
            const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              if (data?.avatarUrl) {
                setUserAvatar(data.avatarUrl);
              }
              if (data?.fullName) {
                const firstName = data.fullName.split(' ')[0];
                setUserName(firstName);
              } else if (user.displayName) {
                setUserName(user.displayName.split(' ')[0]);
              }
            }
          } catch (e) {
            console.error('Error fetching user profile:', e);
          } finally {
            setIsProfileLoading(false);
          }
        } else {
          setIsProfileLoading(false);
        }
      };
      fetchUserProfile();
    }, [])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchHomeData();
    setRefreshing(false);
  }, [fetchHomeData]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />
        }
      >
        
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {isProfileLoading ? (
              <SkeletonItem style={{ width: normalize(140), height: normalize(28), backgroundColor: colors.surface, borderRadius: normalize(6), marginBottom: normalize(4) }} />
            ) : (
              <Text style={styles.greeting}>Hello, {userName || 'Explorer'} <Text style={{fontSize: normalizeFont(24)}}>👋</Text></Text>
            )}
            <Text style={styles.subGreeting}>Where will your next adventure be?</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.bellIcon} activeOpacity={0.8} onPress={() => navigation.navigate('Search')}>
              <Icon name="magnify" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bellIcon} activeOpacity={0.8}>
              <Icon name="bell-outline" size={24} color={colors.text} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarContainer} activeOpacity={0.8} onPress={() => navigation.navigate('Profile')}>
              {userAvatar ? (
                <Image 
                  source={{ uri: userAvatar }} 
                  style={styles.avatarImage} 
                />
              ) : (
                <View style={[styles.avatarImage, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
                  <Icon name="account" size={24} color={colors.muted} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Current Expedition Card (Persistent) ── */}
        {expedition.isActive && expedition.activeTrek && (
          <View style={styles.expeditionContainer}>
            <View style={styles.expeditionCard}>
              <View style={styles.expeditionHeaderRow}>
                <View style={styles.expeditionHeaderLeft}>
                  <Icon name="image-filter-hdr" size={20} color={colors.accent} />
                  <Text style={styles.expeditionHeaderTitle}>Current Expedition</Text>
                </View>
              </View>
              <View style={styles.expeditionDetailsRow}>
                <Text style={styles.expeditionTrekName}>{expedition.activeTrek.name}</Text>
                <Text style={styles.expeditionDayText}>Day {expedition.currentDay}</Text>
              </View>
              <View style={styles.expeditionProgressRow}>
                <Text style={styles.expeditionProgressText}>Progress: {expedition.progress}%</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${expedition.progress}%` }]} />
                </View>
              </View>
              <TouchableOpacity style={styles.continueExpeditionBtn} onPress={() => navigation.navigate('ExpeditionDashboard')}>
                <Text style={styles.continueExpeditionBtnText}>Continue Trek</Text>
                <Icon name="arrow-right" size={16} color="#000" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Search Bar ── */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="magnify" size={20} color={colors.muted} style={styles.searchIconLeft} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search treks, places or ask anything..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              selectionColor={colors.accent}
            />
            <Icon name="creation" size={20} color={colors.accent} style={styles.searchIconRight} />
          </View>
        </View>

        {/* ── Upcoming Treks Carousel ── */}
        <View style={styles.featuredContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onUpcomingScroll}
            scrollEventThrottle={16}
          >
            {isLoading ? (
              <View style={[styles.featuredImage, { width: SCREEN_WIDTH - normalize(40), backgroundColor: colors.surface, borderRadius: normalize(16), justifyContent: 'flex-end', padding: normalize(16) }]}>
                <SkeletonItem style={{ width: normalize(100), height: normalize(26), backgroundColor: colors.outline, borderRadius: normalize(6), marginBottom: normalize(35) }} />
                <View style={styles.featuredBottomRow}>
                  <View style={styles.featuredBottomLeft}>
                    <SkeletonItem style={{ width: '70%', height: normalize(24), backgroundColor: colors.outline, borderRadius: normalize(4), marginBottom: normalize(8) }} />
                    <SkeletonItem style={{ width: '50%', height: normalize(16), backgroundColor: colors.outline, borderRadius: normalize(4), marginBottom: normalize(8) }} />
                  </View>
                  <SkeletonItem style={{ width: normalize(54), height: normalize(54), borderRadius: normalize(27), backgroundColor: colors.outline, marginBottom: normalize(4) }} />
                </View>
              </View>
            ) : upcomingTreks.map((item) => (
              <TouchableOpacity key={item.id} activeOpacity={0.95} onPress={() => navigation.navigate('TrekDetails', { trekId: item.id })}>
                <ImageBackground
                  source={item.image}
                  style={[styles.featuredImage, { width: SCREEN_WIDTH - normalize(40) }]}
                  imageStyle={styles.featuredImageStyle}
                >
                  <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
                    locations={[0, 0.4, 1]}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.featuredContent}>
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>Upcoming Trek</Text>
                    </View>
                    
                    <View style={styles.featuredBottomRow}>
                      <View style={styles.featuredBottomLeft}>
                        <Text style={styles.featuredTitle} numberOfLines={1}>{item.name}</Text>
                        <View style={styles.locationRow}>
                          <Icon name="map-marker-outline" size={14} color={colors.muted} />
                          <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
                        </View>
                        <View style={styles.countdownContainer}>
                          <Text style={styles.countdownDays}>{item.daysLeft} Days Left</Text>
                          <Text style={styles.countdownSub}>to your adventure</Text>
                        </View>
                      </View>
                      
                      <View style={styles.featuredBottomRight}>
                        <CircularProgress progress={item.progress} size={54} strokeWidth={4} />
                      </View>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.paginationDots}>
            {upcomingTreks.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeUpcomingIndex === index && styles.dotActive
                ]}
              />
            ))}
          </View>
        </View>

        {/* ── AI Picks For You ── */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Picks For You</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.aiPicksScroll}>
            {isLoading ? (
              [1, 2, 3].map(key => (
                <View key={key} style={[styles.aiPickCard, { backgroundColor: colors.surface, padding: normalize(12), justifyContent: 'flex-end', borderWidth: 1, borderColor: colors.outline }]}>
                  <SkeletonItem style={{ width: '90%', height: normalize(16), backgroundColor: colors.outline, borderRadius: normalize(4), marginBottom: normalize(8) }} />
                  <SkeletonItem style={{ width: '60%', height: normalize(12), backgroundColor: colors.outline, borderRadius: normalize(4), marginBottom: normalize(12) }} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <SkeletonItem style={{ width: '30%', height: normalize(14), backgroundColor: colors.outline, borderRadius: normalize(4) }} />
                    <SkeletonItem style={{ width: '40%', height: normalize(14), backgroundColor: colors.outline, borderRadius: normalize(4) }} />
                  </View>
                </View>
              ))
            ) : aiPicks.map((item) => (
              <TouchableOpacity key={item.id} style={styles.aiPickCard} activeOpacity={0.9} onPress={() => navigation.navigate('TrekDetails', { trekId: item.id })}>
                <ImageBackground source={item.image} style={styles.aiPickImage} imageStyle={styles.aiPickImageStyle}>
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.aiPickContent}>
                    <Text style={styles.aiPickName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.aiPickLocationRow}>
                      <Icon name="map-marker-outline" size={12} color={colors.muted} />
                      <Text style={styles.aiPickLocationText}>{item.location}</Text>
                    </View>
                    <View style={styles.aiPickStatsRow}>
                      <View style={styles.ratingRow}>
                        <Icon name="star" size={14} color="#FBBF24" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                      </View>
                      <Text style={styles.priceText}>{item.price}</Text>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Trending This Month ── */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending This Month</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
            {isLoading ? (
              [1, 2, 3].map(key => (
                <View key={key} style={styles.trendingCard}>
                  <SkeletonItem style={{ width: normalize(28), height: normalize(28), borderRadius: normalize(14), backgroundColor: colors.surface, opacity: 0.5 }} />
                  <View style={styles.trendingTextCol}>
                    <SkeletonItem style={{ width: normalize(80), height: normalize(14), backgroundColor: colors.surface, borderRadius: normalize(4), marginBottom: normalize(6), opacity: 0.5 }} />
                    <SkeletonItem style={{ width: normalize(50), height: normalize(12), backgroundColor: colors.surface, borderRadius: normalize(4), opacity: 0.5 }} />
                  </View>
                </View>
              ))
            ) : trending.map((item) => (
              <TouchableOpacity key={item.id} style={styles.trendingCard} activeOpacity={0.9} onPress={() => navigation.navigate('TrekDetails', { trekId: item.id })}>
                <Icon name={item.icon} size={28} color={item.color} />
                <View style={styles.trendingTextCol}>
                  <Text style={styles.trendingName}>{item.name}</Text>
                  <Text style={styles.trendingTrend}>↑ {item.trend}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Continue Planning ── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Continue Planning</Text>
          <TouchableOpacity style={styles.continueCard} activeOpacity={0.9}>
            <View style={styles.continueIconBg}>
              <Icon name="clipboard-check-outline" size={24} color={colors.accent} />
            </View>
            <View style={styles.continueTextCol}>
              <Text style={styles.continueTitle}>Sandakphu Trek</Text>
              <Text style={styles.continueSub}>6 Days · Moderate</Text>
            </View>
            <View style={styles.continueRight}>
              <CircularProgress progress={64} size={42} />
              <Icon name="chevron-right" size={24} color={colors.muted} style={{ marginLeft: normalize(10) }} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Essential Quick Access ── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Essential Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('AI Planner')}>
              <Icon name="robot-outline" size={32} color={colors.accent} />
              <Text style={styles.quickActionText}>AI Planner</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('Budget')}>
              <Icon name="wallet-outline" size={32} color={colors.accent} />
              <Text style={styles.quickActionText}>Budget{'\n'}Planner</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('Gear')}>
              <Icon name="bag-personal-outline" size={32} color={colors.accent} />
              <Text style={styles.quickActionText}>Gear{'\n'}Checklist</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('Weather')}>
              <Icon name={weatherIcon} size={32} color={colors.accent} />
              <Text style={styles.quickActionText}>{weatherTemp !== null ? `${Math.round(weatherTemp)}°C` : 'Weather'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Bottom spacer for tab bar */}
        <View style={{ height: normalize(40) }} />
      </ScrollView>
    </View>
  );
};

const getStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Forcing dark background as per screenshot
  },
  scrollContent: {
    paddingBottom: normalize(20),
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingTop: Platform.OS === 'ios' ? normalize(60) : normalize(50),
    paddingBottom: normalize(20),
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: normalizeFont(24),
    fontWeight: '700',
    color: colors.text,
    marginBottom: normalize(4),
  },
  subGreeting: {
    fontSize: normalizeFont(14),
    color: colors.muted,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(16),
  },
  bellIcon: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    borderWidth: 1.5,
    borderColor: colors.outline,
  },
  avatarContainer: {
    width: normalize(38),
    height: normalize(38),
    borderRadius: normalize(19),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },

  // Search
  searchContainer: {
    paddingHorizontal: normalize(20),
    marginBottom: normalize(24),
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

  // Expedition
  expeditionContainer: {
    paddingHorizontal: normalize(20),
    marginBottom: normalize(24),
  },
  expeditionCard: {
    backgroundColor: 'rgba(30, 41, 59, 1)',
    borderRadius: normalize(16),
    padding: normalize(16),
    borderWidth: 1,
    borderColor: 'rgba(163, 230, 53, 0.4)',
  },
  expeditionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(12),
  },
  expeditionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  expeditionHeaderTitle: {
    color: colors.accent,
    fontSize: normalizeFont(14),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  expeditionDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(12),
  },
  expeditionTrekName: {
    color: colors.text,
    fontSize: normalizeFont(20),
    fontWeight: 'bold',
  },
  expeditionDayText: {
    color: colors.muted,
    fontSize: normalizeFont(14),
    fontWeight: '600',
  },
  expeditionProgressRow: {
    marginBottom: normalize(16),
  },
  expeditionProgressText: {
    color: colors.text,
    fontSize: normalizeFont(12),
    marginBottom: normalize(6),
  },
  progressBarBg: {
    height: normalize(6),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: normalize(3),
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: normalize(3),
  },
  continueExpeditionBtn: {
    backgroundColor: colors.accent,
    borderRadius: normalize(10),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: normalize(12),
  },
  continueExpeditionBtnText: {
    color: '#000',
    fontSize: normalizeFont(15),
    fontWeight: '700',
  },

  // Featured Trek
  featuredContainer: {
    paddingHorizontal: normalize(20),
    marginBottom: normalize(24),
  },
  featuredImage: {
    width: '100%',
    height: normalize(200),
    justifyContent: 'flex-end',
  },
  featuredImageStyle: {
    borderRadius: normalize(16),
  },
  featuredContent: {
    padding: normalize(16),
  },
  badgeContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4),
    borderRadius: normalize(6),
    alignSelf: 'flex-start',
    marginBottom: normalize(35),
    borderWidth: 1,
    borderColor: 'rgba(163, 230, 53, 0.3)',
  },
  badgeText: {
    color: colors.accent,
    fontSize: normalizeFont(11),
    fontWeight: '600',
  },
  featuredBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  featuredBottomLeft: {
    flex: 1,
  },
  featuredTitle: {
    color: colors.text,
    fontSize: normalizeFont(22),
    fontWeight: 'bold',
    marginBottom: normalize(4),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(12),
  },
  locationText: {
    color: colors.muted,
    fontSize: normalizeFont(13),
    marginLeft: normalize(4),
  },
  countdownContainer: {
    marginTop: normalize(4),
  },
  countdownDays: {
    color: colors.text,
    fontSize: normalizeFont(14),
    fontWeight: 'bold',
  },
  countdownSub: {
    color: colors.muted,
    fontSize: normalizeFont(12),
  },
  featuredBottomRight: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(4),
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(12),
    gap: normalize(6),
  },
  dot: {
    width: normalize(6),
    height: normalize(6),
    borderRadius: normalize(3),
    backgroundColor: colors.outline,
  },
  dotActive: {
    backgroundColor: colors.accent,
    width: normalize(16),
  },

  // Sections Common
  sectionContainer: {
    marginBottom: normalize(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    marginBottom: normalize(14),
  },
  sectionTitle: {
    color: colors.text,
    fontSize: normalizeFont(16),
    fontWeight: '700',
    paddingHorizontal: normalize(20),
    marginBottom: normalize(14),
  },
  viewAllText: {
    color: colors.accent,
    fontSize: normalizeFont(13),
    fontWeight: '600',
  },

  // AI Picks
  aiPicksScroll: {
    paddingHorizontal: normalize(20),
    gap: normalize(12),
  },
  aiPickCard: {
    width: normalize(140),
    height: normalize(180),
    borderRadius: normalize(16),
    overflow: 'hidden',
  },
  aiPickImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  aiPickImageStyle: {
    borderRadius: normalize(16),
  },
  aiPickContent: {
    padding: normalize(12),
  },
  aiPickName: {
    color: colors.text,
    fontSize: normalizeFont(14),
    fontWeight: '700',
    marginBottom: normalize(2),
  },
  aiPickLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(8),
  },
  aiPickLocationText: {
    color: colors.muted,
    fontSize: normalizeFont(11),
    marginLeft: normalize(2),
  },
  aiPickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: colors.text,
    fontSize: normalizeFont(12),
    fontWeight: '600',
    marginLeft: normalize(4),
  },
  priceText: {
    color: colors.text,
    fontSize: normalizeFont(13),
    fontWeight: '700',
  },

  // Trending
  trendingScroll: {
    paddingHorizontal: normalize(20),
    gap: normalize(12),
  },
  trendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: normalize(12),
    padding: normalize(14),
    minWidth: normalize(150),
    borderWidth: 1,
    borderColor: colors.outline,
  },
  trendingTextCol: {
    marginLeft: normalize(12),
  },
  trendingName: {
    color: colors.text,
    fontSize: normalizeFont(14),
    fontWeight: '600',
    marginBottom: normalize(4),
  },
  trendingTrend: {
    color: colors.accent,
    fontSize: normalizeFont(12),
    fontWeight: '600',
  },

  // Continue Planning
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: normalize(20),
    borderRadius: normalize(16),
    padding: normalize(16),
    borderWidth: 1,
    borderColor: colors.outline,
  },
  continueIconBg: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(12),
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueTextCol: {
    flex: 1,
    marginLeft: normalize(14),
  },
  continueTitle: {
    color: colors.text,
    fontSize: normalizeFont(16),
    fontWeight: '600',
    marginBottom: normalize(4),
  },
  continueSub: {
    color: colors.muted,
    fontSize: normalizeFont(13),
  },
  continueRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Quick Access
  quickAccessGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(20),
  },
  quickActionCard: {
    width: (SCREEN_WIDTH - normalize(40) - normalize(30)) / 4, // 4 items, 3 gaps
    aspectRatio: 0.85,
    backgroundColor: colors.surface,
    borderRadius: normalize(14),
    borderWidth: 1,
    borderColor: colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(8),
  },
  quickActionText: {
    color: colors.text,
    fontSize: normalizeFont(10),
    fontWeight: '600',
    textAlign: 'center',
    marginTop: normalize(8),
  },
});
