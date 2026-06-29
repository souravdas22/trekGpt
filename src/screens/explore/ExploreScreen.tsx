import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
  Image,
  Dimensions,
  ScrollView,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toggleLikeTrek } from '../../store/slices/likedTreksSlice';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType, colors } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Data ─────────────────────────────────────────────────────────────────────

type Category = 'All' | 'Mountain' | 'Forest' | 'Winter' | 'Lakes' | 'Weekend' | 'Adventure';

interface Trek {
  id: string;
  name: string;
  location: string;
  price: number;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Expert';
  rating: number;
  category: string;
  duration: string;
  distance: string;
  description: string;
  image: any;
  badge?: string;
  badgeColor?: string;
}

const CATEGORIES: Category[] = ['All', 'Mountain', 'Forest', 'Winter', 'Lakes', 'Weekend', 'Adventure'];

const FEATURED_TREKS: Trek[] = [
  {
    id: 'f1',
    name: 'Kedarkantha',
    location: 'Uttarakhand, India',
    price: 6500,
    difficulty: 'Easy',
    rating: 4.6,
    category: 'Winter',
    duration: '6 Days',
    distance: '20km',
    description: 'One of India\'s most popular winter treks.',
    image: require('../../assets/images/trek-images/Kedarkantha.jpg'),
    badge: 'Best for Beginners',
    badgeColor: colors.accent,
  },
  {
    id: 'f2',
    name: 'Sandakphu',
    location: 'West Bengal, India',
    price: 7900,
    difficulty: 'Moderate',
    rating: 4.7,
    category: 'Mountain',
    duration: '6 Days',
    distance: '57km',
    description: 'Trek to the highest peak in West Bengal.',
    image: require('../../assets/images/trek-images/Sandakphu Phalut.jpg'),
    badge: 'Great Views',
    badgeColor: '#60A5FA',
  },
];

const POPULAR_TREKS: Trek[] = [
  {
    id: 'p1',
    name: 'Har Ki Dun',
    location: 'Uttarakhand, India',
    price: 9800,
    difficulty: 'Moderate',
    rating: 4.8,
    category: 'Mountain',
    duration: '7 Days',
    distance: '50km',
    description: 'A stunning valley trek in the Garhwal Himalayas.',
    image: require('../../assets/images/trek-images/Har Ki Dun.jpg'),
  },
  {
    id: 'p2',
    name: 'Sandakphu',
    location: 'West Bengal, India',
    price: 7900,
    difficulty: 'Moderate',
    rating: 4.7,
    category: 'Mountain',
    duration: '6 Days',
    distance: '57km',
    description: 'Trek to the highest peak in West Bengal.',
    image: require('../../assets/images/trek-images/Sandakphu Phalut.jpg'),
  },
  {
    id: 'p3',
    name: 'Dayara Bugyal',
    location: 'Uttarakhand, India',
    price: 6500,
    difficulty: 'Easy',
    rating: 4.5,
    category: 'Forest',
    duration: '5 Days',
    distance: '22km',
    description: 'A beautiful high-altitude meadow trek.',
    image: require('../../assets/images/trek-images/Dayara Bugyal.jpeg'),
  },
  {
    id: 'p4',
    name: 'Roopkund',
    location: 'Uttarakhand, India',
    price: 8200,
    difficulty: 'Hard',
    rating: 4.9,
    category: 'Mountain',
    duration: '8 Days',
    distance: '53km',
    description: 'The mysterious skeleton lake trek.',
    image: require('../../assets/images/trek-images/Roopkund Trek.jpg'),
  },
];

const THEMES = [
  { id: 't1', title: 'Weekend Treks', subtitle: 'Short & Sweet', icon: 'tent', image: require('../../assets/images/trek-images/Dayara Bugyal.jpeg') },
  { id: 't2', title: 'Budget Treks', subtitle: 'Under ₹10,000', icon: 'wallet-outline', image: require('../../assets/images/trek-images/Sandakphu Phalut.jpg') },
  { id: 't3', title: 'Winter Treks', subtitle: 'Snow Adventures', icon: 'snowflake', image: require('../../assets/images/trek-images/Kedarkantha.jpg') },
  { id: 't4', title: 'Challenging Treks', subtitle: 'For Experienced', icon: 'image-filter-hdr', image: require('../../assets/images/trek-images/Roopkund Trek.jpg') },
];

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: '#A3E635',
  Moderate: '#F59E0B',
  Hard: '#EF4444',
  Expert: '#8B5CF6',
};

// ── Component ─────────────────────────────────────────────────────────────────

export const ExploreScreen = () => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const likedTrekIds = useSelector((state: RootState) => state.likedTreks.likedTrekIds);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const renderFeatured = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Treks</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
        {FEATURED_TREKS.map((trek) => (
          <TouchableOpacity 
            key={trek.id} 
            style={styles.featuredCard} 
            activeOpacity={0.9}
            onPress={() => navigation.navigate('TrekDetails', { trek })}
          >
            <ImageBackground source={trek.image} style={styles.featuredImage} imageStyle={styles.featuredImageStyle}>
              <LinearGradient
                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.featuredTopRow}>
                <View style={styles.badgeContainer}>
                  <Text style={[styles.badgeText, { color: trek.badgeColor }]}>{trek.badge}</Text>
                </View>
                <TouchableOpacity style={styles.heartBtn} onPress={() => dispatch(toggleLikeTrek(trek.id))}>
                  <Icon name={likedTrekIds.includes(trek.id) ? "heart" : "heart-outline"} size={20} color={likedTrekIds.includes(trek.id) ? "#EF4444" : colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.featuredBottomContent}>
                <Text style={styles.featuredName}>{trek.name}</Text>
                <View style={styles.locationRow}>
                  <Icon name="map-marker-outline" size={14} color={colors.muted} />
                  <Text style={styles.locationText}>{trek.location}</Text>
                </View>
                
                <View style={styles.featuredMetaRow}>
                  <View style={styles.featuredMetaLeft}>
                    <Text style={styles.metaText}>{trek.duration} · </Text>
                    <Text style={[styles.metaText, { color: DIFFICULTY_COLOR[trek.difficulty] }]}>{trek.difficulty}</Text>
                    <Text style={styles.metaText}> · </Text>
                    <Icon name="star" size={14} color="#F59E0B" />
                    <Text style={styles.metaText}> {trek.rating}</Text>
                  </View>
                  <Text style={styles.featuredPrice}>₹{trek.price.toLocaleString('en-IN')}</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.paginationDots}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );

  const renderPopular = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular Treks</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.popularList}>
        {POPULAR_TREKS.map((trek) => (
          <TouchableOpacity 
            key={trek.id} 
            style={styles.popularCard}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('TrekDetails', { trek })}
          >
            <Image source={trek.image} style={styles.popularImage} resizeMode="cover" />
            <View style={styles.popularInfo}>
              <View style={styles.popularTitleRow}>
                <Text style={styles.popularName} numberOfLines={1}>{trek.name}</Text>
                <TouchableOpacity onPress={() => dispatch(toggleLikeTrek(trek.id))}>
                  <Icon name={likedTrekIds.includes(trek.id) ? "heart" : "heart-outline"} size={20} color={likedTrekIds.includes(trek.id) ? "#EF4444" : colors.muted} />
                </TouchableOpacity>
              </View>
              <View style={styles.locationRow}>
                <Icon name="map-marker-outline" size={12} color={colors.muted} />
                <Text style={styles.popularLocationText}>{trek.location}</Text>
              </View>
              <View style={styles.popularMetaRow}>
                <View style={styles.popularMetaLeft}>
                  <Text style={styles.popularMetaText}>{trek.duration} · </Text>
                  <Text style={[styles.popularMetaText, { color: DIFFICULTY_COLOR[trek.difficulty] }]}>{trek.difficulty}</Text>
                  <Text style={styles.popularMetaText}> · </Text>
                  <Icon name="star" size={12} color="#F59E0B" />
                  <Text style={styles.popularMetaText}> {trek.rating}</Text>
                </View>
                <Text style={styles.popularPrice}>₹{trek.price.toLocaleString('en-IN')}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderThemes = () => (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { paddingHorizontal: normalize(20), marginBottom: normalize(14) }]}>Explore by Theme</Text>
      <View style={styles.themeGrid}>
        {THEMES.map((theme) => (
          <TouchableOpacity key={theme.id} style={styles.themeCard} activeOpacity={0.9}>
            <ImageBackground source={theme.image} style={styles.themeImage} imageStyle={styles.themeImageStyle}>
              <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.themeContent}>
                <Icon name={theme.icon} size={24} color={colors.text} style={styles.themeIcon} />
                <View>
                  <Text style={styles.themeTitle}>{theme.title}</Text>
                  <Text style={styles.themeSubtitle}>{theme.subtitle}</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Explore Treks</Text>
            <Text style={styles.headerSubtitle}>Discover your next adventure</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
            <Icon name="tune-variant" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* ── Search Bar ── */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="magnify" size={20} color={colors.muted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search treks, places, regions..."
              placeholderTextColor={colors.muted}
              value={query}
              onChangeText={setQuery}
              selectionColor={colors.accent}
            />
          </View>
        </View>

        {/* ── Category Chips ── */}
        <View style={styles.chipsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, activeCategory === cat && styles.chipActive]}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {renderFeatured()}
        {renderPopular()}
        {renderThemes()}
        
        <View style={{ height: normalize(40) }} />
      </ScrollView>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const getStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: normalize(20),
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(20),
    paddingTop: Platform.OS === 'ios' ? normalize(60) : normalize(50),
    paddingBottom: normalize(20),
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: normalizeFont(26),
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.2,
    marginBottom: normalize(4),
  },
  headerSubtitle: {
    fontSize: normalizeFont(14),
    color: colors.muted,
  },
  filterBtn: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(12),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Search
  searchContainer: {
    paddingHorizontal: normalize(20),
    marginBottom: normalize(20),
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
  searchIcon: {
    marginRight: normalize(10),
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: normalizeFont(14),
  },

  // Category chips
  chipsContainer: {
    marginBottom: normalize(24),
  },
  chipsScroll: {
    paddingHorizontal: normalize(20),
    gap: normalize(10),
  },
  chip: {
    height: normalize(36),
    paddingHorizontal: normalize(18),
    borderRadius: normalize(18),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    fontSize: normalizeFont(13),
    color: colors.muted,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#000000',
    fontWeight: '700',
  },

  // Sections Common
  sectionContainer: {
    marginBottom: normalize(28),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    marginBottom: normalize(16),
  },
  sectionTitle: {
    color: colors.text,
    fontSize: normalizeFont(18),
    fontWeight: '700',
  },
  viewAllText: {
    color: colors.accent,
    fontSize: normalizeFont(13),
    fontWeight: '600',
  },

  // Featured Treks
  featuredScroll: {
    paddingHorizontal: normalize(20),
    gap: normalize(16),
  },
  featuredCard: {
    width: SCREEN_WIDTH - normalize(60),
    height: normalize(220),
    borderRadius: normalize(16),
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  featuredImageStyle: {
    borderRadius: normalize(16),
  },
  featuredTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: normalize(16),
  },
  badgeContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4),
    borderRadius: normalize(6),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeText: {
    fontSize: normalizeFont(11),
    fontWeight: '600',
  },
  heartBtn: {
    width: normalize(32),
    height: normalize(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredBottomContent: {
    padding: normalize(16),
  },
  featuredName: {
    color: colors.text,
    fontSize: normalizeFont(20),
    fontWeight: 'bold',
    marginBottom: normalize(4),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(8),
  },
  locationText: {
    color: colors.muted,
    fontSize: normalizeFont(13),
    marginLeft: normalize(4),
  },
  featuredMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: colors.muted,
    fontSize: normalizeFont(13),
    fontWeight: '500',
  },
  featuredPrice: {
    color: colors.text,
    fontSize: normalizeFont(16),
    fontWeight: 'bold',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(16),
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

  // Popular Treks
  popularList: {
    paddingHorizontal: normalize(20),
    gap: normalize(12),
  },
  popularCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: colors.outline,
    padding: normalize(12),
    gap: normalize(14),
  },
  popularImage: {
    width: normalize(86),
    height: normalize(86),
    borderRadius: normalize(12),
  },
  popularInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  popularTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: normalize(2),
  },
  popularName: {
    flex: 1,
    fontSize: normalizeFont(16),
    fontWeight: '700',
    color: colors.text,
    marginRight: normalize(10),
  },
  popularLocationText: {
    color: colors.muted,
    fontSize: normalizeFont(12),
    marginLeft: normalize(4),
  },
  popularMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: normalize(4),
  },
  popularMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularMetaText: {
    color: colors.muted,
    fontSize: normalizeFont(12),
    fontWeight: '500',
  },
  popularPrice: {
    fontSize: normalizeFont(14),
    fontWeight: '700',
    color: colors.text,
  },

  // Explore by Theme
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: normalize(20),
    gap: normalize(12),
    justifyContent: 'space-between',
  },
  themeCard: {
    width: (SCREEN_WIDTH - normalize(52)) / 2,
    height: normalize(80),
    borderRadius: normalize(12),
    overflow: 'hidden',
  },
  themeImage: {
    width: '100%',
    height: '100%',
  },
  themeImageStyle: {
    borderRadius: normalize(12),
  },
  themeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: normalize(12),
    gap: normalize(10),
  },
  themeIcon: {
    opacity: 0.9,
  },
  themeTitle: {
    color: colors.text,
    fontSize: normalizeFont(13),
    fontWeight: '600',
    marginBottom: normalize(2),
  },
  themeSubtitle: {
    color: colors.muted,
    fontSize: normalizeFont(10),
  },
});
