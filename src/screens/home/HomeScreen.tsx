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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import LinearGradient from 'react-native-linear-gradient';
import { normalize, normalizeFont } from '@theme/normalize';
import Svg, { Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AI_PICKS = [
  { id: '1', name: 'Kedarkantha', location: 'Uttarakhand', rating: '4.6', price: '₹6,500', image: require('../../assets/images/trek-images/Kedarkantha.jpg') },
  { id: '2', name: 'Har Ki Dun', location: 'Uttarakhand', rating: '4.8', price: '₹9,800', image: require('../../assets/images/trek-images/Har Ki Dun.jpg') },
  { id: '3', name: 'Dayara Bugyal', location: 'Uttarakhand', rating: '4.5', price: '₹6,500', image: require('../../assets/images/trek-images/Dayara Bugyal.jpeg') },
  { id: '4', name: 'Sandakphu', location: 'West Bengal', rating: '4.7', price: '₹7,900', image: require('../../assets/images/trek-images/Sandakphu Phalut.jpg') },
];

const TRENDING = [
  { id: 't1', name: 'Sandakphu', trend: '28%', icon: 'leaf', color: '#4ADE80' },
  { id: 't2', name: 'Kedarkantha', trend: '21%', icon: 'fire', color: '#F97316' },
  { id: 't3', name: 'Valley of\nFlowers', trend: '17%', icon: 'leaf', color: '#4ADE80' },
];

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

export const HomeScreen = () => {
  const colors = useAppTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Hello, Agnes <Text style={{fontSize: normalizeFont(24)}}>👋</Text></Text>
            <Text style={styles.subGreeting}>Where will your next adventure be?</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.bellIcon} activeOpacity={0.8}>
              <Icon name="bell-outline" size={24} color={colors.text} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarContainer} activeOpacity={0.8} onPress={() => navigation.navigate('Profile')}>
              <Image 
                source={{ uri: 'https://i.pravatar.cc/150?img=47' }} 
                style={styles.avatarImage} 
              />
            </TouchableOpacity>
          </View>
        </View>

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

        {/* ── Featured Trek ── */}
        <View style={styles.featuredContainer}>
          <TouchableOpacity activeOpacity={0.95} onPress={() => {}}>
            <ImageBackground
              source={require('../../assets/images/trek-images/Roopkund Trek.jpg')}
              style={styles.featuredImage}
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
                    <Text style={styles.featuredTitle}>Roopkund Trek</Text>
                    <View style={styles.locationRow}>
                      <Icon name="map-marker-outline" size={14} color={colors.muted} />
                      <Text style={styles.locationText}>Uttarakhand, India</Text>
                    </View>
                    <View style={styles.countdownContainer}>
                      <Text style={styles.countdownDays}>8 Days Left</Text>
                      <Text style={styles.countdownSub}>to your adventure</Text>
                    </View>
                  </View>
                  
                  <View style={styles.featuredBottomRight}>
                    <CircularProgress progress={72} size={54} strokeWidth={4} />
                  </View>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
          <View style={styles.paginationDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
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
            {AI_PICKS.map((item) => (
              <TouchableOpacity key={item.id} style={styles.aiPickCard} activeOpacity={0.9}>
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
            {TRENDING.map((item) => (
              <View key={item.id} style={styles.trendingCard}>
                <Icon name={item.icon} size={28} color={item.color} />
                <View style={styles.trendingTextCol}>
                  <Text style={styles.trendingName}>{item.name}</Text>
                  <Text style={styles.trendingTrend}>↑ {item.trend}</Text>
                </View>
              </View>
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
            <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('AIPlanner')}>
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
              <Icon name="weather-partly-cloudy" size={32} color={colors.accent} />
              <Text style={styles.quickActionText}>Weather</Text>
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
