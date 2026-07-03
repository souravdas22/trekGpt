import { useMemo, useState } from 'react';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  Dimensions,
  RefreshControl,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';
import { communityService } from '../../services/firebase/community.service';
import { StoryDocument, JourneyDocument, CircleDocument, EventDocument } from '../../repositories/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

type Tab = 'Feed' | 'Circles' | 'Events' | 'Journeys';

const TABS: { id: Tab; icon: string }[] = [
  { id: 'Feed', icon: 'view-dashboard-outline' },
  { id: 'Circles', icon: 'account-group' },
  { id: 'Events', icon: 'calendar-blank' },
  { id: 'Journeys', icon: 'compass-outline' },
];


interface CommunityScreenProps {
  navigation?: any;
}

export const CommunityScreen = ({ navigation }: CommunityScreenProps) => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const formatNum = (num?: number | string) => {
    if (num === undefined || num === null) return '0';
    if (typeof num === 'number') return num.toLocaleString();
    const parsed = parseInt(String(num).replace(/,/g, ''), 10);
    return isNaN(parsed) ? String(num) : parsed.toLocaleString();
  };

  const [activeTab, setActiveTab] = useState<Tab>('Feed');
  
  const [stories, setStories] = useState<StoryDocument[]>([]);
  const [trendingJourneys, setTrendingJourneys] = useState<JourneyDocument[]>([]);
  const [featuredJourneys, setFeaturedJourneys] = useState<JourneyDocument[]>([]);
  const [journeysList, setJourneysList] = useState<JourneyDocument[]>([]);
  const [popularCircles, setPopularCircles] = useState<CircleDocument[]>([]);
  const [myCircles, setMyCircles] = useState<CircleDocument[]>([]);
  const [discoverCircles, setDiscoverCircles] = useState<CircleDocument[]>([]);
  console.log(discoverCircles,'discover circles')
  const [upcomingEvents, setUpcomingEvents] = useState<EventDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCommunityData = async () => {
    try {
      const [storiesData, journeysData, circlesData, eventsData] = await Promise.all([
        communityService.getStories(),
        communityService.getJourneys(),
        communityService.getCircles(),
        communityService.getEvents(),
      ]);

      setStories(storiesData);
      setTrendingJourneys(journeysData.trending);
      setFeaturedJourneys(journeysData.featured);
      setJourneysList(journeysData.list);
      setPopularCircles(circlesData.popular);
      setMyCircles(circlesData.my);
      setDiscoverCircles(circlesData.discover);
      setUpcomingEvents(eventsData);
    } catch (e) {
      console.error('Error fetching community data', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(true);
      fetchCommunityData();
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchCommunityData();
  }, []);

  const renderImage = (src: any) => typeof src === 'string' ? { uri: src } : src;

  const renderFacepile = (size: number = 20, limit: number = 4) => (
    <View style={styles.facepileContainer}>
      {[...Array(limit)].map((_, i) => (
        <Image
          key={i}
          source={require('@assets/images/splash_bg.png')}
          style={[
            styles.facepileAvatar,
            { width: size, height: size, borderRadius: size / 2, marginLeft: i === 0 ? 0 : -size / 2.5 }
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()} activeOpacity={0.8}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>Community</Text>
            <Icon name="image-filter-hdr" size={24} color={colors.accent} />
          </View>
          <Text style={styles.headerSubtitle}>Connect. Share. Explore Together.</Text>
        </View>

        <TouchableOpacity style={styles.searchBtn} activeOpacity={0.8}>
          <Icon name="magnify" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsWrapper}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, isActive && styles.activeTab]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.8}
              >
                <Icon
                  name={tab.icon}
                  size={16}
                  color={isActive ? '#000' : '#8B949E'}
                  style={styles.tabIcon}
                />
                <Text style={[styles.tabText, isActive && styles.activeTabText]} numberOfLines={1}>{tab.id}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />
        }
      >
        {activeTab === 'Feed' ? (
          <>
        {/* ── Stories ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Stories from the trails</Text>
            <TouchableOpacity><Text style={styles.viewAllText}>View all</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            <View style={styles.storyItem}>
              <TouchableOpacity style={styles.addStoryBtn} activeOpacity={0.8}>
                <Icon name="plus" size={28} color={colors.muted} />
              </TouchableOpacity>
              <Text style={styles.storyName}>Your story</Text>
            </View>
            {isLoading ? (
              [1, 2, 3, 4].map((_, index) => (
                <View key={`skeleton-story-${index}`} style={styles.storyItem}>
                  <SkeletonItem style={[styles.storyAvatarWrap, { backgroundColor: colors.outline, borderWidth: 0 }]} />
                  <SkeletonItem style={{ width: '80%', height: normalize(12), backgroundColor: colors.outline, borderRadius: normalize(4) }} />
                </View>
              ))
            ) : stories.map(story => (
              <View key={story.id} style={styles.storyItem}>
                <View style={styles.storyAvatarWrap}>
                  <Image source={renderImage(story.avatar)} style={styles.storyAvatar} />
                  {story.isOnline && <View style={styles.onlineDot} />}
                </View>
                <Text style={styles.storyName}>{story.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Trending Journeys ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Trending Journeys</Text>
            <TouchableOpacity><Text style={styles.viewAllText}>See all</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {isLoading ? (
              [1, 2].map((_, index) => (
                <SkeletonItem key={`skeleton-trending-${index}`} style={[styles.journeyCard, { backgroundColor: colors.outline }]} />
              ))
            ) : trendingJourneys.map(journey => (
              <View key={journey.id} style={styles.journeyCard}>
                <Image source={renderImage(journey.image)} style={styles.journeyImage} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)', '#000']} style={styles.journeyGradient} />
                
                <View style={styles.journeyTopBadges}>
                  <View style={styles.trendingBadge}>
                    <Text style={styles.trendingText}>TRENDING</Text>
                  </View>
                  <View style={styles.imageCountBadge}>
                    <Text style={styles.imageCountText}>{formatNum(journey.imageCount)}</Text>
                  </View>
                </View>

                <View style={styles.journeyContent}>
                  <View style={styles.journeyAuthorRow}>
                    <Image source={renderImage(journey.authorAvatar)} style={styles.journeyAuthorAvatar} />
                    <View style={styles.journeyAuthorInfo}>
                      <Text style={styles.journeyTitle}>{journey.title}</Text>
                      <Text style={styles.journeyMeta}>By {journey.author} • {journey.duration} • {journey.location}</Text>
                    </View>
                  </View>
                  <Text style={styles.journeyDesc}>{journey.description}</Text>
                  
                  <View style={styles.journeyFooter}>
                    <View style={styles.journeyStats}>
                      <Icon name="heart" size={16} color={colors.accent} />
                      <Text style={styles.statText}>{formatNum(journey.likes)}</Text>
                      <Icon name="comment-outline" size={16} color={colors.muted} style={styles.statIcon} />
                      <Text style={styles.statText}>{formatNum(journey.comments)}</Text>
                      <Icon name="eye-outline" size={16} color={colors.muted} style={styles.statIcon} />
                      <Text style={styles.statText}>{formatNum(journey.views)}</Text>
                    </View>
                    <TouchableOpacity style={styles.viewJourneyBtn}>
                      <Text style={styles.viewJourneyBtnText}>View Journey</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Popular Circles ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Circles</Text>
            <TouchableOpacity><Text style={styles.viewAllText}>See all</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {isLoading ? (
              [1, 2, 3].map((_, index) => (
                <SkeletonItem key={`skeleton-popular-${index}`} style={[styles.circleCard, { backgroundColor: colors.outline }]} />
              ))
            ) : popularCircles.map(circle => (
              <View key={circle.id} style={styles.circleCard}>
                <Image source={renderImage(circle.image)} style={styles.circleImage} />
                <View style={styles.circleIconWrap}>
                  <Icon name="account-group" size={16} color={colors.accent} />
                </View>
                <View style={styles.circleContent}>
                  <Text style={styles.circleName}>{circle.name}</Text>
                  <Text style={styles.circleMembers}>{formatNum(circle.members)} Members</Text>
                  
                  <View style={styles.circleFooter}>
                    {renderFacepile(22)}
                  </View>
                  
                  <TouchableOpacity style={[styles.joinBtn, circle.joined && styles.joinedBtn]}>
                    <Text style={[styles.joinBtnText, circle.joined && styles.joinedBtnText]}>
                      {circle.joined ? 'Joined' : 'Join'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

          </>
        ) : activeTab === 'Events' ? (
          <View style={styles.eventsTabContainer}>
            <View style={styles.eventsHeaderRow}>
              <Text style={styles.eventsSectionTitle}>Upcoming Events</Text>
              <TouchableOpacity><Text style={styles.viewAllText}>See all</Text></TouchableOpacity>
            </View>

            <View style={styles.eventsList}>
              {isLoading ? (
                [1, 2, 3].map((_, index) => (
                  <SkeletonItem key={`skeleton-event-${index}`} style={[styles.eventCard, { backgroundColor: colors.outline }]} />
                ))
              ) : upcomingEvents.map(event => (
                <View key={event.id} style={styles.eventCard}>
                  <Image source={renderImage(event.image)} style={styles.eventImage} />
                  
                  <View style={styles.eventDateOverlay}>
                    <Text style={styles.eventMonth}>{event.month}</Text>
                    <Text style={styles.eventDay}>{event.day}</Text>
                    <Text style={styles.eventWeekday}>{event.weekday}</Text>
                  </View>
                  
                  <View style={styles.eventContent}>
                    <View>
                      <Text style={styles.eventType}>{event.type}</Text>
                      <Text style={styles.eventName} numberOfLines={1}>{event.title}</Text>
                      
                      <View style={styles.eventLocationRow}>
                        <Icon name="map-marker-outline" size={14} color={colors.muted} />
                        <Text style={styles.eventLocation}>{event.location}</Text>
                      </View>
                      
                      <View style={styles.eventAttendeesRow}>
                        <Icon name="account-group-outline" size={14} color={colors.muted} />
                        <Text style={styles.eventAttending}>{formatNum(event.attendees)} attending</Text>
                      </View>
                    </View>
                    
                    <View style={styles.eventFooter}>
                      <View style={styles.eventFacepileRow}>
                        {renderFacepile(20, 4)}
                        <Text style={styles.eventExtraText}>+{formatNum(event.extraAttendees)}</Text>
                      </View>
                      
                      <TouchableOpacity style={[styles.eventActionBtn, event.going && styles.eventGoingBtn]}>
                        <Text style={[styles.eventActionBtnText, event.going && styles.eventGoingBtnText]}>
                          {event.going ? 'Going ✓' : 'Join'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.hostEventCard}>
              <View style={styles.hostEventIconWrap}>
                <Icon name="calendar-plus" size={24} color={colors.accent} />
              </View>
              <View style={styles.hostEventContent}>
                <Text style={styles.hostEventTitle}>Host an event for the trekking community</Text>
                <View style={styles.hostEventSubtitleRow}>
                  <Text style={styles.hostEventSubtitle}>Organize treks, meetups, workshops{'\n'}and more.</Text>
                  <TouchableOpacity style={styles.createEventBtn}>
                    <Text style={styles.createEventBtnText}>Create Event</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ) : activeTab === 'Circles' ? (
          <View style={styles.circlesTabContainer}>
            {/* ── My Circles ── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Circles</Text>
              <View style={{ height: normalize(14) }} />
              {isLoading ? (
                [1].map((_, index) => (
                  <SkeletonItem key={`skeleton-mycircle-${index}`} style={[styles.myCircleCard, { backgroundColor: colors.outline }]} />
                ))
              ) : myCircles.map(circle => (
                <View key={circle.id} style={styles.myCircleCard}>
                  <Image source={renderImage(circle.image)} style={styles.myCircleImage} />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)', '#000']} style={styles.myCircleGradient} />
                  
                  <View style={styles.myCircleTopIcon}>
                    <Icon name="account-group" size={20} color={colors.accent} />
                  </View>

                  <View style={styles.myCircleContent}>
                    <Text style={styles.myCircleTitle}>{circle.name}</Text>
                    <Text style={styles.myCircleMeta}>{formatNum(circle.members)} Members • {circle.type}</Text>
                    
                    <View style={styles.myCircleFooter}>
                      <View style={styles.myCircleFacepileRow}>
                        {renderFacepile(28, 5)}
                        <Text style={styles.myCircleExtraText}>+{formatNum(circle.extraMembers)}</Text>
                      </View>
                      <TouchableOpacity style={styles.myCircleJoinedBtn}>
                        <Text style={styles.myCircleJoinedBtnText}>Joined</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* ── Discover Circles ── */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderDiscover}>
                <Text style={styles.sectionTitle}>Discover Circles</Text>
                <TouchableOpacity><Text style={styles.viewAllText}>All Circles {'>'}</Text></TouchableOpacity>
              </View>
              <View style={styles.discoverList}>
                {isLoading ? (
                  [1, 2, 3, 4].map((_, index) => (
                    <SkeletonItem key={`skeleton-discover-${index}`} style={[styles.discoverCard, { backgroundColor: colors.outline }]} />
                  ))
                ) : discoverCircles.map(circle => (
                  <View key={circle.id} style={styles.discoverCard}>
                    <View style={styles.discoverImageContainer}>
                      <Image source={renderImage(circle.image)} style={styles.discoverImage} />
                      <View style={styles.discoverImageOverlay}>
                        <View style={styles.discoverIconWrap}>
                          <Icon name="account-group" size={16} color={colors.accent} />
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.discoverContent}>
                      <View>
                        <Text style={styles.discoverTitle} numberOfLines={1}>{circle.name}</Text>
                        <Text style={styles.discoverMeta}>{formatNum(circle.members)} Members • {circle.type}</Text>
                        <Text style={styles.discoverDesc} numberOfLines={2}>{circle.description}</Text>
                      </View>
                      
                      <View style={styles.discoverFooter}>
                        <View style={styles.discoverFacepileRow}>
                          {renderFacepile(22, 4)}
                          <Text style={styles.discoverExtraText}>+{formatNum(circle.extraMembers)}</Text>
                        </View>
                        
                        <TouchableOpacity style={[styles.discoverJoinBtn, circle.joined && styles.discoverJoinedBtn]}>
                          <Text style={[styles.discoverJoinBtnText, circle.joined && styles.discoverJoinedBtnText]}>
                            {circle.joined ? 'Joined' : 'Join'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : activeTab === 'Journeys' ? (
          <View style={styles.journeysTabContainer}>
            {/* Featured Journeys Section */}
            <View style={styles.journeysSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Featured Journeys</Text>
                <TouchableOpacity><Text style={styles.viewAllText}>View all</Text></TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                {isLoading ? (
                  [1, 2].map((_, index) => (
                    <SkeletonItem key={`skeleton-featured-${index}`} style={[styles.featuredCard, { backgroundColor: colors.outline }]} />
                  ))
                ) : featuredJourneys.map((journey) => (
                  <View key={journey.id} style={styles.featuredCard}>
                    <View style={styles.featuredImageContainer}>
                      <Image source={renderImage(journey.image)} style={styles.featuredImage} />
                      
                      <View style={[styles.featuredBadge, (styles as any)[`badge_${journey.badgeType}`]]}>
                        {journey.badgeType === 'editor' && <Icon name="star" size={10} color="#B6FF42" />}
                        {journey.badgeType === 'trending' && <Icon name="fire" size={10} color="#FF8A00" />}
                        <Text style={[styles.featuredBadgeText, (styles as any)[`badgeText_${journey.badgeType}`]]}>
                          {journey.badgeText}
                        </Text>
                      </View>

                      <View style={styles.featuredImageCount}>
                        <Icon name="image-multiple" size={10} color={colors.text} />
                        <Text style={styles.featuredImageCountText}>{formatNum(journey.imageCount)}</Text>
                      </View>
                    </View>

                    <View style={styles.featuredContent}>
                      <View style={styles.featuredAuthorRow}>
                        <Image source={renderImage(journey.authorAvatar)} style={styles.featuredAuthorAvatar} />
                        <Text style={styles.featuredAuthorName} numberOfLines={1}>{journey.author}</Text>
                        <Icon name="dots-vertical" size={14} color={colors.muted} style={styles.featuredMoreIcon} />
                      </View>

                      <Text style={styles.featuredTitle} numberOfLines={1}>{journey.title}</Text>
                      <Text style={styles.featuredMeta}>{journey.duration} • {journey.location}</Text>
                      <Text style={styles.featuredDesc} numberOfLines={2}>{journey.description}</Text>

                      <View style={styles.featuredFooter}>
                        <View style={styles.featuredStats}>
                          <Icon name="heart" size={14} color={colors.accent} />
                          <Text style={styles.featuredStatText}>{formatNum(journey.likes)}</Text>
                          <Icon name="comment-text-outline" size={14} color={colors.muted} style={styles.featuredStatIcon} />
                          <Text style={styles.featuredStatText}>{formatNum(journey.comments)}</Text>
                        </View>
                        <TouchableOpacity>
                          <Icon name="bookmark-outline" size={16} color={colors.muted} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.paginationContainer}>
                <View style={[styles.paginationDot, styles.paginationDotActive]} />
                <View style={styles.paginationDot} />
                <View style={styles.paginationDot} />
                <View style={styles.paginationDot} />
                <View style={styles.paginationDot} />
              </View>
            </View>

            {/* Filters Section */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
              <TouchableOpacity style={[styles.filterPill, styles.filterPillActive]}>
                <Icon name="view-grid" size={14} color="#000" />
                <Text style={styles.filterPillTextActive}>All Journeys</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterPill}>
                <Icon name="hiking" size={14} color={colors.muted} />
                <Text style={styles.filterPillText}>Trekking</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterPill}>
                <Icon name="tent" size={14} color={colors.muted} />
                <Text style={styles.filterPillText}>Camping</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterPill}>
                <Icon name="bag-personal" size={14} color={colors.muted} />
                <Text style={styles.filterPillText}>Backpacking</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterPill}>
                <Icon name="filter-variant" size={14} color={colors.muted} />
                <Text style={styles.filterPillText}>Filter</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Journeys List Section */}
            <View style={styles.journeysList}>
              {isLoading ? (
                [1, 2, 3].map((_, index) => (
                  <SkeletonItem key={`skeleton-journey-${index}`} style={[styles.journeyListItem, { backgroundColor: colors.outline }]} />
                ))
              ) : journeysList.map((journey) => (
                <View key={journey.id} style={styles.journeyListItem}>
                  <View style={styles.journeyListImageContainer}>
                    <Image source={renderImage(journey.image)} style={styles.journeyListImage} />
                    <View style={styles.journeyListImageCount}>
                      <Icon name="image-multiple" size={10} color={colors.text} />
                      <Text style={styles.journeyListImageCountText}>{formatNum(journey.imageCount)}</Text>
                    </View>
                  </View>

                  <View style={styles.journeyListContent}>
                    <View style={styles.journeyListHeaderRow}>
                      <View style={styles.journeyListAuthorRow}>
                        <Image source={renderImage(journey.authorAvatar)} style={styles.journeyListAuthorAvatar} />
                        <Text style={styles.journeyListAuthorName} numberOfLines={1}>{journey.author}</Text>
                        {journey.isVerified && <Icon name="check-decagram" size={12} color={colors.accent} style={{ marginLeft: normalize(4) }} />}
                      </View>
                      <Icon name="dots-vertical" size={16} color={colors.muted} />
                    </View>

                    <View style={styles.journeyListBody}>
                      <View style={styles.journeyListMain}>
                        <Text style={styles.journeyListTitle} numberOfLines={1}>{journey.title}</Text>
                        <Text style={styles.journeyListMeta}>{journey.duration} • {journey.location}</Text>
                        <Text style={styles.journeyListDesc} numberOfLines={2}>{journey.description}</Text>
                        
                        <View style={styles.journeyListTags}>
                          {journey.tags?.map((tag: any, index: number) => (
                            <View key={index} style={[styles.journeyListTag, (styles as any)[`tag_${tag.type}_bg`]]}>
                              <Text style={[styles.journeyListTagText, (styles as any)[`tag_${tag.type}_text`]]}>{tag.text}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      <View style={styles.journeyListSide}>
                        <View style={styles.priceContainer}>
                          <Text style={styles.journeyListPrice}>{journey.price}</Text>
                          <Text style={styles.journeyListPriceLabel}>Total Budget</Text>
                        </View>
                        
                        <View style={styles.ratingContainer}>
                          <View style={styles.journeyListRatingRow}>
                            <Icon name="star" size={10} color="#FFC107" />
                            <Text style={styles.journeyListRating}>{journey.rating}</Text>
                          </View>
                          <Text style={styles.journeyListReviews}>({formatNum(journey.reviews)} reviews)</Text>
                        </View>
                        
                        <TouchableOpacity style={styles.journeyListBookmark}>
                          <Icon name="bookmark-outline" size={16} color={colors.accent} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity style={[styles.fab, activeTab === 'Journeys' && styles.fabJourneys]} activeOpacity={0.85}>
        {activeTab === 'Journeys' ? (
          <View style={styles.fabJourneysContent}>
            <Icon name="plus" size={20} color="#000" />
            <Text style={styles.fabJourneysText}>Share Journey</Text>
          </View>
        ) : (
          <Icon name={activeTab === 'Circles' ? "account-multiple-plus" : "plus"} size={26} color="#0D1117" />
        )}
      </TouchableOpacity>
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
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28) + 12,
    paddingBottom: normalize(16),
  },
  backBtn: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: normalize(16),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  headerTitle: {
    color: colors.text,
    fontSize: normalizeFont(20),
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: colors.muted,
    fontSize: normalizeFont(12),
    marginTop: normalize(2),
  },
  searchBtn: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tabs
  tabsContainer: {
    marginBottom: normalize(16),
    marginHorizontal: normalize(20),
  },
  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: normalize(24),
    padding: normalize(4),
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: normalize(8),
    borderRadius: normalize(20),
    gap: normalize(4),
  },
  activeTab: {
    backgroundColor: colors.accent,
  },
  tabIcon: {
    // marginBottom: 2
  },
  tabText: {
    color: colors.muted,
    fontSize: normalizeFont(12),
    fontWeight: '600',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '700',
  },

  // Common Section
  scrollContent: {
    paddingBottom: normalize(100),
  },
  section: {
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
  },
  viewAllText: {
    color: colors.accent,
    fontSize: normalizeFont(13),
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingHorizontal: normalize(20),
    gap: normalize(16),
  },

  // Stories
  storyItem: {
    alignItems: 'center',
    width: normalize(70),
  },
  addStoryBtn: {
    width: normalize(60),
    height: normalize(60),
    borderRadius: normalize(30),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(8),
  },
  storyAvatarWrap: {
    width: normalize(60),
    height: normalize(60),
    borderRadius: normalize(30),
    padding: normalize(2),
    borderWidth: 2,
    borderColor: colors.accent,
    marginBottom: normalize(8),
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: normalize(28),
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: normalize(14),
    height: normalize(14),
    borderRadius: normalize(7),
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: '#050505',
  },
  storyName: {
    color: colors.text,
    fontSize: normalizeFont(12),
    textAlign: 'center',
  },

  // Trending Journeys
  journeyCard: {
    width: SCREEN_WIDTH * 0.85,
    height: normalize(300),
    borderRadius: normalize(20),
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  journeyImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  journeyGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  journeyTopBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: normalize(16),
  },
  trendingBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4),
    borderRadius: normalize(6),
  },
  trendingText: {
    color: '#000',
    fontSize: normalizeFont(10),
    fontWeight: '800',
  },
  imageCountBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4),
    borderRadius: normalize(6),
  },
  imageCountText: {
    color: colors.text,
    fontSize: normalizeFont(11),
    fontWeight: '600',
  },
  journeyContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: normalize(16),
  },
  journeyAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(10),
  },
  journeyAuthorAvatar: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    marginRight: normalize(10),
    borderWidth: 1,
    borderColor: colors.accent,
  },
  journeyAuthorInfo: {
    flex: 1,
  },
  journeyTitle: {
    color: colors.text,
    fontSize: normalizeFont(16),
    fontWeight: '700',
    marginBottom: normalize(2),
  },
  journeyMeta: {
    color: colors.muted,
    fontSize: normalizeFont(11),
  },
  journeyDesc: {
    color: colors.muted,
    fontSize: normalizeFont(13),
    lineHeight: normalizeFont(18),
    marginBottom: normalize(16),
  },
  journeyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  journeyStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginLeft: normalize(14),
  },
  statText: {
    color: colors.text,
    fontSize: normalizeFont(12),
    marginLeft: normalize(6),
    fontWeight: '600',
  },
  viewJourneyBtn: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    borderRadius: normalize(20),
    borderWidth: 1,
    borderColor: colors.accent,
  },
  viewJourneyBtnText: {
    color: colors.accent,
    fontSize: normalizeFont(12),
    fontWeight: '600',
  },

  // Popular Circles
  circleCard: {
    width: normalize(160),
    backgroundColor: colors.surface,
    borderRadius: normalize(16),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.outline,
  },
  circleImage: {
    width: '100%',
    height: normalize(80),
  },
  circleIconWrap: {
    position: 'absolute',
    top: normalize(64),
    left: normalize(12),
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  circleContent: {
    padding: normalize(14),
    paddingTop: normalize(24),
  },
  circleName: {
    color: colors.text,
    fontSize: normalizeFont(14),
    fontWeight: '700',
    marginBottom: normalize(4),
  },
  circleMembers: {
    color: colors.muted,
    fontSize: normalizeFont(12),
    marginBottom: normalize(12),
  },
  circleFooter: {
    marginBottom: normalize(14),
  },
  facepileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  facepileAvatar: {
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  joinBtn: {
    width: '100%',
    paddingVertical: normalize(8),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: colors.outline,
    alignItems: 'center',
  },
  joinedBtn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  joinBtnText: {
    color: colors.text,
    fontSize: normalizeFont(13),
    fontWeight: '600',
  },
  joinedBtnText: {
    color: '#000',
  },

  // Events Tab
  eventsTabContainer: {
    paddingHorizontal: normalize(20),
    paddingTop: normalize(8),
  },
  eventsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  eventsSectionTitle: {
    color: colors.text,
    fontSize: normalizeFont(16),
    fontWeight: '700',
  },
  eventsList: {
    gap: normalize(12),
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: normalize(14),
    borderWidth: 1,
    borderColor: colors.outline,
    overflow: 'hidden',
    height: normalize(118),
  },
  eventImage: {
    width: '32%',
    height: '100%',
  },
  eventDateOverlay: {
    position: 'absolute',
    top: normalize(8),
    left: normalize(8),
    backgroundColor: 'rgba(17, 19, 21, 0.85)',
    borderRadius: normalize(8),
    paddingVertical: normalize(4),
    paddingHorizontal: normalize(6),
    alignItems: 'center',
  },
  eventMonth: {
    color: colors.accent,
    fontSize: normalizeFont(9),
    fontWeight: '800',
  },
  eventDay: {
    color: colors.text,
    fontSize: normalizeFont(14),
    fontWeight: '800',
    marginVertical: 1,
  },
  eventWeekday: {
    color: colors.muted,
    fontSize: normalizeFont(9),
    fontWeight: '600',
  },
  eventContent: {
    flex: 1,
    padding: normalize(10),
    paddingLeft: normalize(12),
    justifyContent: 'center',
  },
  eventType: {
    color: colors.accent,
    fontSize: normalizeFont(9),
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: normalize(2),
  },
  eventName: {
    color: colors.text,
    fontSize: normalizeFont(14),
    fontWeight: '700',
    marginBottom: normalize(2),
  },
  eventLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(2),
  },
  eventLocation: {
    color: colors.muted,
    fontSize: normalizeFont(10),
    marginLeft: normalize(4),
  },
  eventAttendeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventAttending: {
    color: colors.muted,
    fontSize: normalizeFont(10),
    marginLeft: normalize(4),
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: normalize(6),
  },
  eventFacepileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  eventExtraText: {
    color: colors.muted,
    fontSize: normalizeFont(10),
    fontWeight: '600',
  },
  eventActionBtn: {
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(5),
    borderRadius: normalize(14),
    borderWidth: 1,
    borderColor: colors.outline,
  },
  eventGoingBtn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  eventActionBtnText: {
    color: colors.text,
    fontSize: normalizeFont(11),
    fontWeight: '600',
  },
  eventGoingBtnText: {
    color: '#000',
  },
  hostEventCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: colors.outline,
    padding: normalize(16),
    alignItems: 'center',
    marginTop: normalize(20),
    marginBottom: normalize(20),
  },
  hostEventIconWrap: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(12),
    backgroundColor: 'rgba(182, 255, 66, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(16),
  },
  hostEventContent: {
    flex: 1,
  },
  hostEventTitle: {
    color: colors.text,
    fontSize: normalizeFont(14),
    fontWeight: '700',
    marginBottom: normalize(4),
  },
  hostEventSubtitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  hostEventSubtitle: {
    color: colors.muted,
    fontSize: normalizeFont(12),
    lineHeight: normalizeFont(16),
    flex: 1,
    marginRight: normalize(8),
  },
  createEventBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
    borderRadius: normalize(8),
  },
  createEventBtnText: {
    color: '#000',
    fontSize: normalizeFont(12),
    fontWeight: '700',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: normalize(32),
    right: normalize(24),
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(28),
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },

  // Circles Tab Styles
  circlesTabContainer: {
    paddingHorizontal: normalize(20),
    paddingBottom: normalize(20),
  },
  sectionHeaderDiscover: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(14),
  },
  myCircleCard: {
    width: '100%',
    height: normalize(160),
    borderRadius: normalize(16),
    overflow: 'hidden',
    marginBottom: normalize(8),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  myCircleImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  myCircleGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
  },
  myCircleTopIcon: {
    position: 'absolute',
    top: normalize(16),
    left: normalize(16),
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  myCircleContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: normalize(16),
  },
  myCircleTitle: {
    color: colors.text,
    fontSize: normalizeFont(18),
    fontWeight: '700',
    marginBottom: normalize(4),
  },
  myCircleMeta: {
    color: colors.muted,
    fontSize: normalizeFont(12),
    marginBottom: normalize(12),
  },
  myCircleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  myCircleFacepileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  myCircleExtraText: {
    color: colors.muted,
    fontSize: normalizeFont(12),
    fontWeight: '600',
  },
  myCircleJoinedBtn: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(6),
    borderRadius: normalize(20),
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  myCircleJoinedBtnText: {
    color: colors.accent,
    fontSize: normalizeFont(12),
    fontWeight: '600',
  },

  discoverList: {
    gap: normalize(16),
  },
  discoverCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: normalize(16),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.outline,
    height: normalize(120),
  },
  discoverImageContainer: {
    width: normalize(110),
    height: '100%',
  },
  discoverImage: {
    width: '100%',
    height: '100%',
  },
  discoverImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: normalize(50),
  },
  discoverIconWrap: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discoverContent: {
    flex: 1,
    padding: normalize(12),
    justifyContent: 'space-between',
  },
  discoverTitle: {
    color: colors.text,
    fontSize: normalizeFont(15),
    fontWeight: '700',
    marginBottom: normalize(2),
  },
  discoverMeta: {
    color: colors.muted,
    fontSize: normalizeFont(11),
    marginBottom: normalize(8),
  },
  discoverDesc: {
    color: colors.muted,
    fontSize: normalizeFont(12),
    lineHeight: normalizeFont(16),
    marginBottom: normalize(8),
  },
  discoverFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discoverFacepileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  discoverExtraText: {
    color: colors.muted,
    fontSize: normalizeFont(11),
    fontWeight: '600',
  },
  discoverJoinBtn: {
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(6),
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: colors.accent,
  },
  discoverJoinedBtn: {
    backgroundColor: colors.accent,
  },
  discoverJoinBtnText: {
    color: colors.accent,
    fontSize: normalizeFont(12),
    fontWeight: '600',
  },
  discoverJoinedBtnText: {
    color: '#000',
  },

  // Journeys Tab Styles
  journeysTabContainer: {
    paddingBottom: normalize(20),
  },
  journeysSection: {
    marginBottom: normalize(16),
  },
  featuredCard: {
    width: normalize(160),
    backgroundColor: colors.surface,
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: colors.outline,
    overflow: 'hidden',
  },
  featuredImageContainer: {
    height: normalize(130),
    width: '100%',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredBadge: {
    position: 'absolute',
    top: normalize(8),
    left: normalize(8),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(4),
    borderRadius: normalize(6),
    gap: normalize(4),
  },
  badge_editor: { backgroundColor: 'rgba(27, 54, 36, 0.9)' },
  badge_trending: { backgroundColor: 'rgba(62, 35, 22, 0.9)' },
  badge_new: { backgroundColor: 'rgba(26, 45, 79, 0.9)' },
  featuredBadgeText: {
    fontSize: normalizeFont(9),
    fontWeight: '700',
  },
  badgeText_editor: { color: '#B6FF42' },
  badgeText_trending: { color: '#FF8A00' },
  badgeText_new: { color: '#60A5FA' },
  featuredImageCount: {
    position: 'absolute',
    bottom: normalize(8),
    right: normalize(8),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(4),
    borderRadius: normalize(6),
    gap: normalize(4),
  },
  featuredImageCountText: {
    color: colors.text,
    fontSize: normalizeFont(9),
    fontWeight: '600',
  },
  featuredContent: {
    padding: normalize(12),
  },
  featuredAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(8),
  },
  featuredAuthorAvatar: {
    width: normalize(16),
    height: normalize(16),
    borderRadius: normalize(8),
    marginRight: normalize(6),
  },
  featuredAuthorName: {
    flex: 1,
    color: colors.muted,
    fontSize: normalizeFont(10),
  },
  featuredMoreIcon: {
    marginLeft: normalize(4),
  },
  featuredTitle: {
    color: colors.text,
    fontSize: normalizeFont(13),
    fontWeight: '700',
    marginBottom: normalize(2),
  },
  featuredMeta: {
    color: colors.muted,
    fontSize: normalizeFont(9),
    marginBottom: normalize(6),
  },
  featuredDesc: {
    color: colors.muted,
    fontSize: normalizeFont(10),
    lineHeight: normalizeFont(14),
    marginBottom: normalize(10),
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredStatIcon: {
    marginLeft: normalize(10),
  },
  featuredStatText: {
    color: colors.text,
    fontSize: normalizeFont(10),
    marginLeft: normalize(4),
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(16),
    gap: normalize(6),
  },
  paginationDot: {
    width: normalize(5),
    height: normalize(5),
    borderRadius: normalize(2.5),
    backgroundColor: colors.outline,
  },
  paginationDotActive: {
    backgroundColor: colors.accent,
  },
  filtersScroll: {
    paddingHorizontal: normalize(20),
    gap: normalize(8),
    marginBottom: normalize(20),
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(6),
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.surface,
    gap: normalize(6),
  },
  filterPillActive: {
    backgroundColor: 'rgba(182, 255, 66, 0.1)',
    borderColor: colors.accent,
  },
  filterPillText: {
    color: colors.muted,
    fontSize: normalizeFont(11),
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: colors.accent,
    fontSize: normalizeFont(11),
    fontWeight: '700',
  },
  journeysList: {
    paddingHorizontal: normalize(20),
    gap: normalize(12),
  },
  journeyListItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: colors.outline,
    padding: normalize(10),
    height: normalize(140),
  },
  journeyListImageContainer: {
    width: normalize(100),
    height: '100%',
    marginRight: normalize(10),
  },
  journeyListImage: {
    width: '100%',
    height: '100%',
    borderRadius: normalize(8),
  },
  journeyListImageCount: {
    position: 'absolute',
    bottom: normalize(6),
    left: normalize(6),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(4),
    borderRadius: normalize(6),
    gap: normalize(4),
  },
  journeyListImageCountText: {
    color: colors.text,
    fontSize: normalizeFont(9),
    fontWeight: '600',
  },
  journeyListContent: {
    flex: 1,
  },
  journeyListHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(4),
  },
  journeyListAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: normalize(8),
  },
  journeyListAuthorAvatar: {
    width: normalize(16),
    height: normalize(16),
    borderRadius: normalize(8),
    marginRight: normalize(6),
  },
  journeyListAuthorName: {
    color: colors.muted,
    fontSize: normalizeFont(10),
  },
  journeyListBody: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  journeyListMain: {
    flex: 1,
    paddingRight: normalize(8),
  },
  journeyListTitle: {
    color: colors.text,
    fontSize: normalizeFont(14),
    fontWeight: '700',
    marginBottom: normalize(2),
  },
  journeyListMeta: {
    color: colors.muted,
    fontSize: normalizeFont(9),
    marginBottom: normalize(4),
  },
  journeyListDesc: {
    color: colors.muted,
    fontSize: normalizeFont(10),
    lineHeight: normalizeFont(14),
    marginBottom: normalize(6),
  },
  journeyListTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(4),
  },
  journeyListTag: {
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(3),
    borderRadius: normalize(8),
  },
  journeyListTagText: {
    fontSize: normalizeFont(8),
    fontWeight: '600',
  },
  tag_beginner_bg: { backgroundColor: 'rgba(182, 255, 66, 0.1)' },
  tag_beginner_text: { color: colors.accent, fontSize: normalizeFont(8), fontWeight: '600' },
  tag_views_bg: { backgroundColor: 'rgba(96, 165, 250, 0.1)' },
  tag_views_text: { color: '#60A5FA', fontSize: normalizeFont(8), fontWeight: '600' },
  tag_moderate_bg: { backgroundColor: 'rgba(249, 115, 22, 0.1)' },
  tag_moderate_text: { color: '#F97316', fontSize: normalizeFont(8), fontWeight: '600' },
  tag_monsoon_bg: { backgroundColor: 'rgba(192, 132, 252, 0.1)' },
  tag_monsoon_text: { color: '#C084FC', fontSize: normalizeFont(8), fontWeight: '600' },
  tag_winter_bg: { backgroundColor: 'rgba(96, 165, 250, 0.1)' },
  tag_winter_text: { color: '#60A5FA', fontSize: normalizeFont(8), fontWeight: '600' },
  journeyListSide: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  journeyListPrice: {
    color: colors.accent,
    fontSize: normalizeFont(12),
    fontWeight: '700',
  },
  journeyListPriceLabel: {
    color: colors.muted,
    fontSize: normalizeFont(9),
    marginTop: normalize(1),
  },
  ratingContainer: {
    alignItems: 'flex-end',
    marginTop: normalize(4),
  },
  journeyListRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(2),
  },
  journeyListRating: {
    color: colors.text,
    fontSize: normalizeFont(11),
    fontWeight: '700',
  },
  journeyListReviews: {
    color: colors.muted,
    fontSize: normalizeFont(8),
    marginTop: normalize(1),
  },
  journeyListBookmark: {
    marginTop: 'auto',
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabJourneys: {
    width: 'auto',
    height: normalize(44),
    borderRadius: normalize(22),
    paddingHorizontal: normalize(16),
  },
  fabJourneysContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  fabJourneysText: {
    color: '#000',
    fontSize: normalizeFont(13),
    fontWeight: '700',
  },
});

