import React, { useState, useMemo, useEffect } from 'react';
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
  Modal,
  Animated,
  RefreshControl,
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
import { trekService, TrekDocument } from '../../services/firebase/trek.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');


type Trek = TrekDocument & {
  price: string | number;
  rating: number;
  category: string;
  duration: string;
  distance: string;
  description: string;
  image: any;
  badge?: string;
  badgeColor?: string;
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: '#A3E635',
  Moderate: '#F59E0B',
  Hard: '#EF4444',
  Expert: '#8B5CF6',
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

export const ExploreScreen = () => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const likedTrekIds = useSelector((state: RootState) => state.likedTreks.likedTrekIds);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [featuredTreks, setFeaturedTreks] = useState<Trek[]>([]);
  const [popularTreks, setPopularTreks] = useState<Trek[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [themes, setThemes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string[]>([]);
  const [filterDuration, setFilterDuration] = useState<string[]>([]);
  const [filterPrice, setFilterPrice] = useState<string | null>(null);

  const fetchExploreData = React.useCallback(async () => {
    try {
      const [dbTreks, dbCategories, dbThemes] = await Promise.all([
        trekService.getAllTreks(true),
        trekService.getCategories(),
        trekService.getThemes()
      ]);
    
      const mapTrek = (t: TrekDocument, index: number, type: 'featured' | 'popular'): Trek => {
        const badgeColors = [colors.accent, '#60A5FA', '#A3E635', '#F59E0B'];
        return {
          ...t,
          id: t.id,
          name: t.name || 'Unknown Trek',
          location: t.location || 'Unknown Location',
          price: t.estimatedCost || 'Contact for price',
          difficulty: t.difficulty || 'Moderate',
          rating: 4.5, // Fallback
          category: t.category || (t.keywords && t.keywords.length > 0 ? t.keywords[0] : 'Mountain'),
          duration: t.durationDays ? `${t.durationDays} Days` : 'Unknown Duration',
          distance: t.distanceKm ? `${t.distanceKm} km` : 'Unknown km',
          description: t.description || '', 
          image: t.imageUrl ? { uri: t.imageUrl } : { uri: 'https://images.unsplash.com/photo-1544644181-1484b3f8c8b0?w=400&q=80' }, // Fallback generic image
          badge: type === 'featured' ? (index === 0 ? 'Best for Beginners' : 'Great Views') : undefined,
          badgeColor: type === 'featured' ? badgeColors[index % badgeColors.length] : undefined,
        };
      };

      const featured = dbTreks.filter(t => t.isFeatured).map((t, i) => mapTrek(t, i, 'featured'));
      const popular = dbTreks.filter(t => t.isPopular).map((t, i) => mapTrek(t, i, 'popular'));

      setFeaturedTreks(featured);
      setPopularTreks(popular);
      
      if (dbCategories.length > 0) {
        const sortedNames = dbCategories.sort((a, b) => (a.order || 0) - (b.order || 0)).map(c => c.name);
        setCategories(Array.from(new Set(['All', ...sortedNames])));
      } else {
        setCategories(['All', 'Mountain', 'Forest', 'Winter', 'Lakes']); // Fallback
      }
      
      if (dbThemes.length > 0) {
        setThemes(dbThemes.filter(t => t.isActive !== false));
      } else {
        // Fallback themes if DB is empty
        setThemes([
          { id: 't1', title: 'Weekend Treks', subtitle: 'Short & Sweet', icon: 'tent', imageUrl: '' },
          { id: 't2', title: 'Budget Treks', subtitle: 'Under ₹10,000', icon: 'wallet-outline', imageUrl: '' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching explore data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [colors.accent]);

  useEffect(() => {
    fetchExploreData();
  }, [fetchExploreData]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchExploreData();
    setRefreshing(false);
  }, [fetchExploreData]);

  const renderFeatured = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Treks</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
        {isLoading ? (
          [1, 2, 3].map((key) => (
            <View key={key} style={[styles.featuredCard, { backgroundColor: colors.surface }]}>
              <View style={{ flex: 1 }} />
              <View style={{ padding: normalize(16), gap: normalize(8) }}>
                <SkeletonItem style={{ width: '60%', height: normalize(20), backgroundColor: colors.outline, borderRadius: normalize(4) }} />
                <SkeletonItem style={{ width: '40%', height: normalize(14), backgroundColor: colors.outline, borderRadius: normalize(4) }} />
              </View>
            </View>
          ))
        ) : (
          featuredTreks.map((trek) => (
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
                    <Text style={[styles.metaText, { color: DIFFICULTY_COLOR[trek.difficulty] || '#F59E0B' }]}>{trek.difficulty}</Text>
                    <Text style={styles.metaText}> · </Text>
                    <Icon name="star" size={14} color="#F59E0B" />
                    <Text style={styles.metaText}> {trek.rating}</Text>
                  </View>
                  <Text style={styles.featuredPrice}>{typeof trek.price === 'number' ? `₹${trek.price.toLocaleString('en-IN')}` : trek.price}</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )))}
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
        {isLoading ? (
          [1, 2, 3].map((key) => (
            <View key={key} style={[styles.popularCard, { borderColor: 'transparent' }]}>
              <SkeletonItem style={[styles.popularImage, { backgroundColor: colors.surface }]} />
              <View style={[styles.popularInfo, { gap: normalize(8) }]}>
                <SkeletonItem style={{ width: '80%', height: normalize(16), backgroundColor: colors.surface, borderRadius: normalize(4) }} />
                <SkeletonItem style={{ width: '50%', height: normalize(12), backgroundColor: colors.surface, borderRadius: normalize(4) }} />
                <SkeletonItem style={{ width: '30%', height: normalize(12), backgroundColor: colors.surface, borderRadius: normalize(4) }} />
              </View>
            </View>
          ))
        ) : (
          popularTreks.map((trek) => (
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
                  <Text style={[styles.popularMetaText, { color: DIFFICULTY_COLOR[trek.difficulty] || '#F59E0B' }]}>{trek.difficulty}</Text>
                  <Text style={styles.popularMetaText}> · </Text>
                  <Icon name="star" size={12} color="#F59E0B" />
                  <Text style={styles.popularMetaText}> {trek.rating}</Text>
                </View>
                <Text style={styles.popularPrice}>{typeof trek.price === 'number' ? `₹${trek.price.toLocaleString('en-IN')}` : trek.price}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )))}
      </View>
    </View>
  );

  const renderThemes = () => (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { paddingHorizontal: normalize(20), marginBottom: normalize(14) }]}>Explore by Theme</Text>
      <View style={styles.themeGrid}>
        {themes.map((theme) => (
          <TouchableOpacity key={theme.id} style={styles.themeCard} activeOpacity={0.9}>
            <ImageBackground 
              source={theme.imageUrl ? { uri: theme.imageUrl } : require('../../assets/images/fallback_trek.jpg')} 
              style={styles.themeImage} 
              imageStyle={styles.themeImageStyle}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.themeContent}>
                <Icon name={theme.icon || 'tent'} size={24} color={colors.text} style={styles.themeIcon} />
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
            <Text style={styles.headerTitle}>Explore Treks</Text>
            <Text style={styles.headerSubtitle}>Discover your next adventure</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8} onPress={() => setIsFilterVisible(true)}>
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
            {categories.map(cat => (
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

      {/* ── Filter Modal ── */}
      <Modal
        visible={isFilterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsFilterVisible(false)} />
          <View style={styles.filterSheet}>
            <View style={styles.filterDragHandle} />
            
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filters</Text>
              <TouchableOpacity onPress={() => {
                setFilterDifficulty([]);
                setFilterDuration([]);
                setFilterPrice(null);
              }}>
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              
              {/* Difficulty Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Difficulty</Text>
                <View style={styles.filterOptionsGrid}>
                  {['Easy', 'Moderate', 'Hard', 'Expert'].map(diff => {
                    const isSelected = filterDifficulty.includes(diff);
                    return (
                      <TouchableOpacity 
                        key={diff}
                        style={[styles.filterOptionChip, isSelected && styles.filterOptionChipSelected]}
                        onPress={() => {
                          if (isSelected) setFilterDifficulty(prev => prev.filter(d => d !== diff));
                          else setFilterDifficulty(prev => [...prev, diff]);
                        }}
                      >
                        <Text style={[styles.filterOptionText, isSelected && styles.filterOptionTextSelected]}>{diff}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Duration Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Duration</Text>
                <View style={styles.filterOptionsGrid}>
                  {['1-3 Days', '4-7 Days', '8+ Days'].map(dur => {
                    const isSelected = filterDuration.includes(dur);
                    return (
                      <TouchableOpacity 
                        key={dur}
                        style={[styles.filterOptionChip, isSelected && styles.filterOptionChipSelected]}
                        onPress={() => {
                          if (isSelected) setFilterDuration(prev => prev.filter(d => d !== dur));
                          else setFilterDuration(prev => [...prev, dur]);
                        }}
                      >
                        <Text style={[styles.filterOptionText, isSelected && styles.filterOptionTextSelected]}>{dur}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Price Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Price Range</Text>
                <View style={styles.filterOptionsGrid}>
                  {['Under ₹5,000', '₹5,000 - ₹15,000', 'Above ₹15,000'].map(price => {
                    const isSelected = filterPrice === price;
                    return (
                      <TouchableOpacity 
                        key={price}
                        style={[styles.filterOptionChip, isSelected && styles.filterOptionChipSelected]}
                        onPress={() => setFilterPrice(isSelected ? null : price)}
                      >
                        <Text style={[styles.filterOptionText, isSelected && styles.filterOptionTextSelected]}>{price}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={{ height: normalize(20) }} />
            </ScrollView>
            
            <View style={styles.filterFooter}>
              <TouchableOpacity style={styles.applyFilterBtn} onPress={() => setIsFilterVisible(false)}>
                <Text style={styles.applyFilterText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

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

  // Filter Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  filterSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: normalize(24),
    borderTopRightRadius: normalize(24),
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? normalize(40) : normalize(20),
  },
  filterDragHandle: {
    width: normalize(40),
    height: normalize(4),
    backgroundColor: colors.outline,
    borderRadius: normalize(2),
    alignSelf: 'center',
    marginTop: normalize(12),
    marginBottom: normalize(8),
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  filterTitle: {
    fontSize: normalizeFont(20),
    fontWeight: 'bold',
    color: colors.text,
  },
  resetText: {
    fontSize: normalizeFont(14),
    fontWeight: '600',
    color: colors.accent,
  },
  filterScroll: {
    paddingHorizontal: normalize(20),
    paddingTop: normalize(16),
  },
  filterSection: {
    marginBottom: normalize(24),
  },
  filterSectionTitle: {
    fontSize: normalizeFont(16),
    fontWeight: '600',
    color: colors.text,
    marginBottom: normalize(12),
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(10),
  },
  filterOptionChip: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(10),
    borderRadius: normalize(12),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  filterOptionChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterOptionText: {
    fontSize: normalizeFont(13),
    fontWeight: '500',
    color: colors.muted,
  },
  filterOptionTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
  filterFooter: {
    paddingHorizontal: normalize(20),
    paddingTop: normalize(16),
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  applyFilterBtn: {
    backgroundColor: colors.accent,
    borderRadius: normalize(16),
    paddingVertical: normalize(16),
    alignItems: 'center',
  },
  applyFilterText: {
    color: '#000',
    fontSize: normalizeFont(16),
    fontWeight: 'bold',
  },
});
