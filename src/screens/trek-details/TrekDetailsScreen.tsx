import React, { useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toggleSaveTrek } from '../../store/slices/savedTreksSlice';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ImageBackground,
  Platform,
  Animated,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { trekService } from '../../services/firebase/trek.service';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.48;

type Tab = 'Overview' | 'Itinerary' | 'Inclusions' | 'Reviews';

// Static fallback data removed, fetching dynamically from Firestore

interface TrekDetailsScreenProps {
  navigation?: any;
  route?: any;
}

export const TrekDetailsScreen = ({ navigation, route }: TrekDetailsScreenProps) => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const scrollY = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();

  const passedTrek = route?.params?.trek || {};
  
  const [reviews, setReviews] = useState<any[]>([]);

  React.useEffect(() => {
    if (passedTrek.id) {
       trekService.getTrekReviews(passedTrek.id).then(dbReviews => {
          setReviews(dbReviews);
       });
    }
  }, [passedTrek.id]);

  const trek = {
    id: passedTrek.id || 'unknown',
    name: passedTrek.name || 'Unknown Trek',
    location: passedTrek.location || 'Unknown Location',
    rating: passedTrek.rating || 4.5,
    reviewCount: passedTrek.reviewCount || 0,
    tags: passedTrek.tags || ['Adventure'],
    duration: passedTrek.durationDays ? `${passedTrek.durationDays} Days` : (passedTrek.duration || 'Unknown'),
    distance: passedTrek.distanceKm ? `${passedTrek.distanceKm} km` : (passedTrek.distance || '-'),
    difficulty: passedTrek.difficulty || 'Moderate',
    maxAltitude: passedTrek.maxAltitudeFt ? `${passedTrek.maxAltitudeFt} ft` : '-',
    image: passedTrek.imageUrl ? { uri: passedTrek.imageUrl } : (passedTrek.image || { uri: 'https://images.unsplash.com/photo-1544644181-1484b3f8c8b0?w=400&q=80' }),
    photoCount: 1,
    price: passedTrek.estimatedCost || passedTrek.price || '-',
    description: passedTrek.description || 'No description available for this trek.',
    highlights: passedTrek.highlights || [],
    bestTime: passedTrek.bestTime || [],
    inclusions: passedTrek.inclusions || [],
    essentials: passedTrek.essentials || [],
    itinerary: passedTrek.itinerary || [],
    provider: passedTrek.provider || {
      name: 'Local Guides',
      rating: 4.5,
      reviewCount: 0,
      logoUrl: undefined
    }
  };

  const isSaved = useSelector((state: RootState) => state.savedTreks.savedTreks.some(t => t.id === trek.id));

  const handleToggleSave = () => {
    dispatch(toggleSaveTrek(trek));
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [HERO_HEIGHT - 100, HERO_HEIGHT - 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Floating animated header ── */}
      <Animated.View style={[styles.floatingHeader, { opacity: headerOpacity }]}>
        <TouchableOpacity
          style={styles.backBtnSmall}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}
        >
          <Icon name="chevron-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.floatingTitle} numberOfLines={1}>
          {trek.name}
        </Text>
        <TouchableOpacity 
          style={styles.backBtnSmall} 
          activeOpacity={0.8}
          onPress={handleToggleSave}
        >
          <Icon name={isSaved ? "bookmark" : "bookmark-outline"} size={20} color={isSaved ? colors.accent : colors.text} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      >
        {/* ── Hero Image ── */}
        <View style={styles.heroContainer}>
          <ImageBackground
            source={trek.image}
            style={styles.hero}
            resizeMode="cover"
          >
            {/* Gradient overlay */}
            <LinearGradient
              colors={[
                'rgba(0,0,0,0)',
                'rgba(0,0,0,0.08)',
                'rgba(0,0,0,0.6)',
              ]}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
            />

            {/* Top buttons */}
            <View style={styles.heroTopRow}>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={() => navigation?.goBack()}
                activeOpacity={0.8}
              >
                <Icon name="chevron-left" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.heroBtn} 
                activeOpacity={0.8}
                onPress={handleToggleSave}
              >
                <Icon name={isSaved ? "bookmark" : "bookmark-outline"} size={20} color={isSaved ? colors.accent : "#FFFFFF"} />
              </TouchableOpacity>
            </View>

            {/* Photo Count */}
            <View style={styles.photoCountContainer}>
               <Icon name="image-multiple-outline" size={14} color="#FFF" />
               <Text style={styles.photoCountText}>{trek.photoCount} Photos</Text>
            </View>
          </ImageBackground>
        </View>

        {/* ── Content Sheet ── */}
        <View style={styles.sheet}>
          {/* Trek name & location */}
          <View style={styles.titleBlock}>
            <Text style={styles.trekName}>{trek.name}</Text>
            
            <View style={styles.locationRatingRow}>
               <View style={styles.locationContainer}>
                 <Icon name="map-marker-outline" size={16} color={colors.accent} />
                 <Text style={styles.locationText}>{trek.location}</Text>
               </View>
               <View style={styles.ratingContainer}>
                 <Icon name="star" size={16} color="#FBBF24" />
                 <Text style={styles.ratingText}>{trek.rating} <Text style={styles.reviewCountText}>({trek.reviewCount} reviews)</Text></Text>
               </View>
            </View>

            <Text style={styles.shortDescText}>
              A classic valley trek with breathtaking views of Swargarohini and Bandarpoonch peaks.
            </Text>

            <View style={styles.tagsRow}>
              {trek.tags.map((tag: any, index: number) => (
                <View key={index} style={[styles.tagBadge, index === 0 && { borderColor: 'rgba(163,230,53,0.3)', backgroundColor: 'rgba(163,230,53,0.05)' }, index === 1 && { borderColor: 'rgba(56,189,248,0.3)', backgroundColor: 'rgba(56,189,248,0.05)' }, index === 2 && { borderColor: 'rgba(168,85,247,0.3)', backgroundColor: 'rgba(168,85,247,0.05)' }]}>
                  <Text style={[styles.tagBadgeText, index === 0 && { color: colors.accent }, index === 1 && { color: '#38BDF8' }, index === 2 && { color: '#A855F7' }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="clock-outline" size={22} color={colors.accent} />
              <Text style={styles.statValue}>{trek.duration}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="map-marker-distance" size={22} color={colors.accent} />
              <Text style={styles.statValue}>{trek.distance}</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="signal-cellular-2" size={22} color={colors.accent} />
              <Text style={styles.statValue}>{trek.difficulty}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="image-filter-hdr" size={22} color={colors.accent} />
              <Text style={styles.statValue}>{trek.maxAltitude}</Text>
              <Text style={styles.statLabel}>Max Altitude</Text>
            </View>
          </View>

          {/* ── Tabs ── */}
          <View style={styles.tabsRow}>
            {(['Overview', 'Itinerary', 'Inclusions', 'Reviews'] as Tab[]).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Tab Content ── */}
          {activeTab === 'Overview' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>About the Trek</Text>
              <Text style={styles.description}>{trek.description}</Text>
              <TouchableOpacity style={styles.readMoreBtn}>
                <Text style={styles.readMoreText}>Read more</Text>
                <Icon name="chevron-down" size={16} color={colors.accent} />
              </TouchableOpacity>

              {/* Highlights */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Highlights</Text>
                <View style={styles.highlightsList}>
                  {trek.highlights.map((h: any, i: number) => (
                    <View key={i} style={styles.highlightRow}>
                      <Icon name={h.icon} size={20} color={colors.accent} style={styles.highlightIcon} />
                      <Text style={styles.highlightText}>{h.text}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Best Time to Visit */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Best Time to Visit</Text>
                <View style={styles.bestTimeGrid}>
                   {trek.bestTime.map((bt: any, i: number) => (
                     <View key={i} style={[styles.bestTimeCard, bt.active && styles.bestTimeCardActive]}>
                        <Icon name={bt.icon} size={24} color={bt.active ? colors.accent : '#38BDF8'} />
                        <Text style={styles.bestTimeMonths}>{bt.months}</Text>
                        <Text style={styles.bestTimeSeason}>{bt.season}</Text>
                     </View>
                   ))}
                </View>
              </View>
            </View>
          )}

          {activeTab === 'Itinerary' && (
            <View style={styles.tabContent}>
              <View style={styles.itineraryHeader}>
                 <Text style={styles.sectionTitle}>Trek Itinerary</Text>
                 <TouchableOpacity>
                   <Text style={styles.viewAllText}>View full itinerary</Text>
                 </TouchableOpacity>
              </View>

              <View style={styles.timelineContainer}>
                 {trek.itinerary.map((wp: any, index: number) => (
                   <View key={wp.dayNumber || index} style={styles.waypointRow}>
                     {/* Timeline */}
                     <View style={styles.timelineCol}>
                       <View style={styles.timelineDot} />
                       {index < trek.itinerary.length - 1 && (
                         <View style={styles.timelineLine} />
                       )}
                     </View>
                     {/* Info */}
                     <View style={styles.waypointInfo}>
                       <Text style={styles.waypointDay}>Day {wp.dayNumber}</Text>
                       <Text style={styles.waypointTitle}>{wp.title}</Text>
                       {wp.distanceStr ? (
                         <Text style={styles.waypointMetaText}>{wp.distanceStr} • {wp.timeStr}</Text>
                       ) : null}
                     </View>
                     {/* Image */}
                     {wp.imageUrl && (
                        <Image source={{ uri: wp.imageUrl }} style={styles.waypointImage} />
                     )}
                   </View>
                 ))}
              </View>
            </View>
          )}

          {activeTab === 'Inclusions' && (
            <View style={styles.tabContent}>
               <Text style={styles.sectionTitle}>Inclusions</Text>
               <View style={styles.inclusionsList}>
                 {trek.inclusions.map((inc: any, i: number) => (
                    <View key={i} style={styles.inclusionRow}>
                       <Icon name="check-circle-outline" size={20} color={colors.accent} />
                       <Text style={styles.inclusionText}>{inc}</Text>
                    </View>
                 ))}
               </View>

               <View style={[styles.sectionContainer, { marginTop: normalize(32) }]}>
                 <Text style={styles.sectionTitle}>Trek Essentials</Text>
                 <View style={styles.essentialsGrid}>
                    {trek.essentials.map((ess: any, i: number) => (
                       <View key={i} style={styles.essentialCard}>
                          <View style={styles.essentialIconWrap}>
                             <Icon name={ess.icon} size={24} color="#38BDF8" />
                          </View>
                          <Text style={styles.essentialTitle}>{ess.title}</Text>
                          <Text style={styles.essentialSubtitle}>{ess.subtitle}</Text>
                       </View>
                    ))}
                 </View>
               </View>
            </View>
          )}

          {activeTab === 'Reviews' && (
            <View style={styles.tabContent}>
              <View style={styles.itineraryHeader}>
                 <Text style={styles.sectionTitle}>Reviews</Text>
                 <TouchableOpacity>
                   <Text style={styles.viewAllText}>View all</Text>
                 </TouchableOpacity>
              </View>

              {reviews.length === 0 ? (
                 <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 20 }}>No reviews yet.</Text>
              ) : (
                reviews.map(r => (
                  <View key={r.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAvatar}>
                        <Icon name={'account-circle'} size={28} color={colors.muted} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.reviewAuthorRow}>
                           <Text style={styles.reviewAuthor}>{r.authorName}</Text>
                           <Icon name="check-decagram" size={14} color={colors.accent} style={{marginLeft: 4, marginRight: 2}} />
                           <Text style={styles.verifiedText}>Verified Buyer</Text>
                        </View>
                        <Text style={styles.reviewDate}>{r.date}</Text>
                      </View>
                    </View>
                    <View style={styles.starsRow}>
                      {Array.from({ length: Math.floor(r.rating) }).map((_: any, i: number) => (
                        <Icon key={i} name="star" size={16} color={colors.accent} />
                      ))}
                      <Text style={styles.ratingNumber}>{Number(r.rating).toFixed(1)}</Text>
                    </View>
                    <Text style={styles.reviewText}>{r.text}</Text>
                    {r.imageUrls && r.imageUrls.length > 0 && (
                      <View style={styles.reviewImagesGrid}>
                         {r.imageUrls.map((img: string, i: number) => (
                            <Image key={i} source={{ uri: img }} style={styles.reviewImage} />
                         ))}
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          )}

          {/* Trek Provider (visible on all tabs or specific tabs based on design, we'll place it at the bottom of the scroll view content) */}
          <View style={styles.providerSection}>
             <Text style={styles.sectionTitle}>Trek Provider</Text>
             <View style={styles.providerCard}>
                <View style={styles.providerAvatar}>
                   <Icon name="image-outline" size={24} color="#0D1117" />
                </View>
                <View style={{ flex: 1, paddingLeft: 12 }}>
                   <Text style={styles.providerName}>{trek.provider.name}</Text>
                   <View style={styles.providerRatingRow}>
                      <Icon name="star" size={14} color="#FBBF24" />
                      <Text style={styles.providerRatingText}>{trek.provider.rating} <Text style={{color: colors.muted}}>({trek.provider.reviewCount} reviews)</Text></Text>
                   </View>
                </View>
                <TouchableOpacity style={styles.viewProfileBtn}>
                   <Text style={styles.viewProfileText}>View profile</Text>
                </TouchableOpacity>
             </View>
          </View>

          {/* ── Bottom spacer for CTA ── */}
          <View style={{ height: 110 }} />
        </View>
      </Animated.ScrollView>

      {/* ── Fixed Bottom Bar ── */}
      <View style={styles.bottomBar}>
         <View style={styles.priceContainer}>
            <Text style={styles.priceValue}>₹{trek.price}</Text>
            <Text style={styles.priceLabel}>Starting from</Text>
         </View>
        <TouchableOpacity
          style={styles.ctaBtn}
          activeOpacity={0.88}
        >
          <Text style={styles.ctaBtnText}>Start your trip</Text>
          <Icon name="arrow-right" size={20} color="#0D1117" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Floating header
  floatingHeader: {
    position: 'absolute',
    top: normalize(0),
    left: normalize(0),
    right: normalize(0),
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(20),
    paddingTop: Platform.OS === 'ios' ? normalize(54) : normalize(42),
    paddingBottom: normalize(12),
    backgroundColor: colors.background,
  },
  floatingTitle: {
    flex: 1,
    color: colors.text,
    fontSize: normalizeFont(17),
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: normalize(8),
  },
  backBtnSmall: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Hero
  heroContainer: {
    height: HERO_HEIGHT,
  },
  hero: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? normalize(54) : normalize(42),
    paddingHorizontal: normalize(20),
    paddingBottom: normalize(20),
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBtn: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoCountContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6),
    borderRadius: normalize(12),
    gap: normalize(6),
    marginBottom: normalize(16),
  },
  photoCountText: {
    color: '#FFF',
    fontSize: normalizeFont(12),
    fontWeight: '500',
  },

  // Sheet
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    paddingHorizontal: normalize(22),
    paddingTop: normalize(26),
    minHeight: SCREEN_HEIGHT * 0.6,
  },

  // Title block
  titleBlock: {
    marginBottom: normalize(24),
  },
  trekName: {
    fontSize: normalizeFont(28),
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.2,
    marginBottom: normalize(8),
  },
  locationRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(16),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  locationText: {
    color: colors.accent,
    fontSize: normalizeFont(13),
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  ratingText: {
    color: '#FBBF24',
    fontSize: normalizeFont(13),
    fontWeight: '700',
  },
  reviewCountText: {
    color: colors.muted,
    fontWeight: '400',
  },
  shortDescText: {
    color: colors.text,
    fontSize: normalizeFont(14),
    lineHeight: normalizeFont(22),
    marginBottom: normalize(16),
  },
  tagsRow: {
    flexDirection: 'row',
    gap: normalize(8),
  },
  tagBadge: {
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6),
    borderRadius: normalize(8),
    borderWidth: 1,
  },
  tagBadgeText: {
    fontSize: normalizeFont(11),
    fontWeight: '600',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(28),
  },
  statItem: {
    alignItems: 'center',
    gap: normalize(6),
  },
  statValue: {
    color: colors.text,
    fontSize: normalizeFont(14),
    fontWeight: '700',
  },
  statLabel: {
    color: colors.muted,
    fontSize: normalizeFont(11),
  },

  // Tabs
  tabsRow: {
    flexDirection: 'row',
    marginBottom: normalize(24),
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: normalize(14),
    padding: normalize(4),
  },
  tab: {
    flex: 1,
    height: normalize(36),
    borderRadius: normalize(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(163,230,53,0.1)',
  },
  tabText: {
    fontSize: normalizeFont(12),
    color: colors.muted,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },

  // Tab content general
  tabContent: {
    paddingBottom: normalize(20),
  },
  sectionTitle: {
    fontSize: normalizeFont(18),
    fontWeight: '700',
    color: colors.text,
    marginBottom: normalize(12),
  },
  description: {
    fontSize: normalizeFont(14),
    color: colors.muted,
    lineHeight: normalizeFont(22),
    marginBottom: normalize(8),
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  readMoreText: {
    color: colors.accent,
    fontSize: normalizeFont(14),
    fontWeight: '500',
  },
  sectionContainer: {
    marginTop: normalize(28),
  },

  // Highlights
  highlightsList: {
    backgroundColor: colors.surface,
    borderRadius: normalize(16),
    padding: normalize(16),
    borderWidth: 1,
    borderColor: colors.outline,
    gap: normalize(16),
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: normalize(12),
  },
  highlightIcon: {
    marginTop: normalize(2),
  },
  highlightText: {
    flex: 1,
    color: colors.text,
    fontSize: normalizeFont(14),
    lineHeight: normalizeFont(20),
  },

  // Best Time to Visit
  bestTimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: normalize(10),
  },
  bestTimeCard: {
    width: (SCREEN_WIDTH - 44 - 10) / 2, // 44 is total horizontal padding, 10 is gap
    backgroundColor: colors.surface,
    borderRadius: normalize(16),
    padding: normalize(16),
    borderWidth: 1,
    borderColor: colors.outline,
    alignItems: 'center',
    gap: normalize(8),
  },
  bestTimeCardActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(163,230,53,0.05)',
  },
  bestTimeMonths: {
    color: colors.text,
    fontSize: normalizeFont(14),
    fontWeight: '700',
    marginTop: normalize(4),
  },
  bestTimeSeason: {
    color: colors.muted,
    fontSize: normalizeFont(11),
  },

  // Itinerary
  itineraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(20),
  },
  viewAllText: {
    color: colors.accent,
    fontSize: normalizeFont(13),
    fontWeight: '500',
  },
  timelineContainer: {
    paddingLeft: normalize(4),
  },
  waypointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: normalize(0),
  },
  timelineCol: {
    width: normalize(24),
    alignItems: 'center',
  },
  timelineDot: {
    width: normalize(10),
    height: normalize(10),
    borderRadius: normalize(5),
    backgroundColor: colors.accent,
    marginTop: normalize(6),
  },
  timelineLine: {
    width: normalize(1),
    flex: 1,
    minHeight: normalize(60),
    backgroundColor: colors.accent,
    marginVertical: normalize(4),
  },
  waypointInfo: {
    flex: 1,
    paddingLeft: normalize(12),
    paddingBottom: normalize(28),
    justifyContent: 'flex-start',
  },
  waypointDay: {
    fontSize: normalizeFont(11),
    color: colors.muted,
    marginBottom: normalize(4),
  },
  waypointTitle: {
    fontSize: normalizeFont(15),
    fontWeight: '700',
    color: colors.text,
    marginBottom: normalize(6),
  },
  waypointMetaText: {
    fontSize: normalizeFont(13),
    color: colors.muted,
  },
  waypointImage: {
    width: normalize(60),
    height: normalize(44),
    borderRadius: normalize(8),
    marginTop: normalize(4),
  },

  // Inclusions
  inclusionsList: {
    backgroundColor: colors.surface,
    borderRadius: normalize(16),
    padding: normalize(16),
    borderWidth: 1,
    borderColor: colors.outline,
    gap: normalize(16),
  },
  inclusionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(12),
  },
  inclusionText: {
    color: colors.muted,
    fontSize: normalizeFont(14),
  },
  essentialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(12),
    justifyContent: 'space-between',
  },
  essentialCard: {
    width: (SCREEN_WIDTH - 44 - 36) / 4,
    alignItems: 'center',
  },
  essentialIconWrap: {
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(16),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(8),
  },
  essentialTitle: {
    color: colors.text,
    fontSize: normalizeFont(12),
    fontWeight: '700',
    textAlign: 'center',
  },
  essentialSubtitle: {
    color: colors.muted,
    fontSize: normalizeFont(10),
    textAlign: 'center',
    marginTop: normalize(2),
  },

  // Reviews
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: normalize(16),
    padding: normalize(16),
    borderWidth: 1,
    borderColor: colors.outline,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(12),
    gap: normalize(12),
  },
  reviewAvatar: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(2),
  },
  reviewAuthor: {
    fontSize: normalizeFont(14),
    fontWeight: '700',
    color: colors.text,
  },
  verifiedText: {
    fontSize: normalizeFont(10),
    color: colors.accent,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: normalizeFont(11),
    color: colors.muted,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(2),
    marginBottom: normalize(12),
  },
  ratingNumber: {
    color: colors.text,
    fontSize: normalizeFont(13),
    fontWeight: '700',
    marginLeft: normalize(4),
  },
  reviewText: {
    fontSize: normalizeFont(13),
    color: colors.muted,
    lineHeight: normalizeFont(20),
    marginBottom: normalize(16),
  },
  reviewImagesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: normalize(8),
    marginBottom: normalize(16),
  },
  reviewImage: {
    width: (SCREEN_WIDTH - 44 - 32 - 24) / 4,
    height: normalize(48),
    borderRadius: normalize(8),
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: normalize(6),
  },
  dot: {
    width: normalize(4),
    height: normalize(4),
    borderRadius: normalize(2),
    backgroundColor: colors.outline,
  },
  dotActive: {
    width: normalize(16),
    backgroundColor: colors.accent,
  },

  // Provider
  providerSection: {
    marginTop: normalize(20),
    paddingTop: normalize(20),
    borderTopWidth: 1,
    borderTopColor: colors.outline,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerName: {
    color: colors.text,
    fontSize: normalizeFont(15),
    fontWeight: '700',
    marginBottom: normalize(4),
  },
  providerRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  providerRatingText: {
    color: '#FBBF24',
    fontSize: normalizeFont(12),
    fontWeight: '700',
  },
  viewProfileBtn: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: colors.outline,
  },
  viewProfileText: {
    color: colors.text,
    fontSize: normalizeFont(12),
    fontWeight: '500',
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: normalize(0),
    left: normalize(0),
    right: normalize(0),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(22),
    paddingBottom: Platform.OS === 'ios' ? normalize(36) : normalize(24),
    paddingTop: normalize(16),
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.outline,
  },
  priceContainer: {
    justifyContent: 'center',
  },
  priceValue: {
    color: colors.text,
    fontSize: normalizeFont(18),
    fontWeight: '800',
  },
  priceLabel: {
    color: colors.muted,
    fontSize: normalizeFont(11),
    marginTop: normalize(2),
  },
  ctaBtn: {
    height: normalize(46),
    paddingHorizontal: normalize(20),
    borderRadius: normalize(23),
    backgroundColor: '#A3E635',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: {
    color: '#0D1117',
    fontSize: normalizeFont(14),
    fontWeight: '800',
  },
});
