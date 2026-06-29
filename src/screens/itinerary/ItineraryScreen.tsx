import { useMemo } from 'react';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Image,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  description: string;
  image: any;
  isSpecialNode?: boolean;
}

const ITINERARY_DATA: Record<string, ItineraryItem[]> = {
  'Day 1': [
    {
      id: 'd1_1',
      time: '08:00 AM',
      title: 'Start from Chamonix',
      description: 'Meet at the Chamonix center.',
      image: require('@assets/images/splash_bg.png'),
      isSpecialNode: true,
    },
    {
      id: 'd1_2',
      time: '09:30 AM',
      title: 'Reach Montenvers',
      description: 'Take the train to Montenvers.',
      image: require('@assets/images/treks/home-2.jpg'),
    },
    {
      id: 'd1_3',
      time: '12:00 PM',
      title: 'Lunch Break',
      description: 'Enjoy packed lunch with a view.',
      image: require('@assets/images/treks/home-3.jpg'),
    },
    {
      id: 'd1_4',
      time: '03:30 PM',
      title: 'Reach Aiguille du Midi',
      description: 'Explore and enjoy the panoramic views.',
      image: require('@assets/images/treks/home-1.jpg'),
    },
    {
      id: 'd1_5',
      time: '06:00 PM',
      title: 'Return to Chamonix',
      description: 'Take the train back.',
      image: require('@assets/images/splash_bg.png'),
    },
  ],
  'Day 2': [
    {
      id: 'd2_1',
      time: '08:00 AM',
      title: 'Breakfast at Hotel',
      description: 'Fuel up for the mountain hike.',
      image: require('@assets/images/treks/home-1.jpg'),
      isSpecialNode: true,
    },
    {
      id: 'd2_2',
      time: '09:00 AM',
      title: 'Depart for Lac Blanc',
      description: 'Steep ascent to the alpine lake.',
      image: require('@assets/images/treks/home-2.jpg'),
    },
    {
      id: 'd2_3',
      time: '12:30 PM',
      title: 'Picnic at Lac Blanc',
      description: 'Lunch by the crystal clear water.',
      image: require('@assets/images/treks/home-3.jpg'),
    },
    {
      id: 'd2_4',
      time: '03:00 PM',
      title: 'Hike to La Flégère',
      description: 'Scenic trail along the ridge.',
      image: require('@assets/images/splash_bg.png'),
    },
    {
      id: 'd2_5',
      time: '05:30 PM',
      title: 'Gondola back to Valley',
      description: 'Return to Chamonix for dinner.',
      image: require('@assets/images/treks/home-2.jpg'),
    },
  ],
  'Day 3': [
    {
      id: 'd3_1',
      time: '07:30 AM',
      title: 'Early start to Les Houches',
      description: 'Bus ride to the trailhead.',
      image: require('@assets/images/treks/home-3.jpg'),
      isSpecialNode: true,
    },
    {
      id: 'd3_2',
      time: '08:30 AM',
      title: 'Bellevue Cable Car',
      description: 'Take the lift to save elevation.',
      image: require('@assets/images/splash_bg.png'),
    },
    {
      id: 'd3_3',
      time: '11:00 AM',
      title: 'Bionnassay Glacier',
      description: 'Spectacular views of the glacier.',
      image: require('@assets/images/treks/home-1.jpg'),
    },
    {
      id: 'd3_4',
      time: '01:00 PM',
      title: 'Refuge de Miage',
      description: 'Traditional Savoyard lunch.',
      image: require('@assets/images/treks/home-2.jpg'),
    },
    {
      id: 'd3_5',
      time: '04:00 PM',
      title: 'Hike down to Les Contamines',
      description: 'End of the TMB stage 1.',
      image: require('@assets/images/treks/home-3.jpg'),
    },
  ],
  'Day 4': [
    {
      id: 'd4_1',
      time: '08:00 AM',
      title: 'Start from Les Contamines',
      description: 'Walk along the river bank.',
      image: require('@assets/images/treks/home-2.jpg'),
      isSpecialNode: true,
    },
    {
      id: 'd4_2',
      time: '10:30 AM',
      title: 'Notre Dame de la Gorge',
      description: 'Historic church at the trail gate.',
      image: require('@assets/images/treks/home-1.jpg'),
    },
    {
      id: 'd4_3',
      time: '01:00 PM',
      title: 'Refuge de la Balme',
      description: 'Lunch stop before the pass.',
      image: require('@assets/images/splash_bg.png'),
    },
    {
      id: 'd4_4',
      time: '04:00 PM',
      title: 'Col du Bonhomme',
      description: 'High mountain pass with stunning views.',
      image: require('@assets/images/treks/home-3.jpg'),
    },
    {
      id: 'd4_5',
      time: '06:30 PM',
      title: 'Reach Refuge des Mottets',
      description: 'Rest and warm dinner.',
      image: require('@assets/images/treks/home-2.jpg'),
    },
  ],
};

interface ItineraryScreenProps {
  navigation?: any;
}

export const ItineraryScreen = ({ navigation }: ItineraryScreenProps) => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [selectedDay, setSelectedDay] = useState<string>('Day 1');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleDayPress = (day: string) => {
    if (day === selectedDay) return;
    
    // Smooth transition between days
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.delay(50),
    ]).start(() => {
      setSelectedDay(day);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const items = ITINERARY_DATA[selectedDay] || [];

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

        <Text style={styles.headerTitle}>Itinerary</Text>

        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* ── Day Tabs ── */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {Object.keys(ITINERARY_DATA).map(day => {
            const isActive = selectedDay === day;
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.tabButton,
                  isActive && styles.tabButtonActive,
                ]}
                onPress={() => handleDayPress(day)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    isActive && styles.tabButtonTextActive,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Timeline List ── */}
      <Animated.View style={[styles.timelineWrapper, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.timelineScrollContent}
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <View key={item.id} style={styles.timelineRow}>
                {/* Left Timeline Line & Dot column */}
                <View style={styles.timelineCol}>
                  {/* Dashed Line */}
                  {!isLast && (
                    <View style={styles.dashedLineContainer}>
                      {/* We simulate a dashed line using multiple small vertical dash lines for exact styling cross-platform */}
                      <View style={styles.dashedLine} />
                    </View>
                  )}

                  {/* Node Circle */}
                  {item.isSpecialNode ? (
                    <View style={styles.specialNodeContainer}>
                      <View style={styles.specialNodeOuter}>
                        <Icon name="map-marker" size={14} color={colors.accent} />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.standardNodeContainer}>
                      <View style={styles.standardNodeOuter}>
                        <View style={styles.standardNodeInner} />
                      </View>
                    </View>
                  )}
                </View>

                {/* Middle Checkpoint Content */}
                <View style={styles.contentCol}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  <Text style={styles.titleText}>{item.title}</Text>
                  <Text style={styles.descriptionText}>{item.description}</Text>
                </View>

                {/* Right Image Thumbnail */}
                <View style={styles.imageCol}>
                  <Image source={item.image} style={styles.thumbnail} resizeMode="cover" />
                </View>
              </View>
            );
          })}
        </ScrollView>
      </Animated.View>
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
    justifyContent: 'space-between',
    paddingHorizontal: normalize(22),
    paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28) + 12,
    paddingBottom: normalize(16),
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
  headerTitle: {
    color: colors.text,
    fontSize: normalizeFont(20),
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerRightPlaceholder: {
    width: normalize(44),
  },

  // Tabs
  tabsContainer: {
    paddingHorizontal: normalize(22),
    paddingBottom: normalize(20),
    gap: normalize(12),
  },
  tabButton: {
    height: normalize(42),
    paddingHorizontal: normalize(22),
    borderRadius: normalize(21),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tabButtonText: {
    fontSize: normalizeFont(14),
    color: colors.muted,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#0D1117',
  },

  // Timeline list
  timelineWrapper: {
    flex: 1,
    paddingHorizontal: normalize(22),
  },
  timelineScrollContent: {
    paddingTop: normalize(10),
    paddingBottom: normalize(40),
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: normalize(0),
    minHeight: normalize(125),
  },
  timelineCol: {
    width: normalize(40),
    alignItems: 'center',
    position: 'relative',
    height: '100%',
  },

  // Node indicators
  specialNodeContainer: {
    width: normalize(32),
    height: normalize(32),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    backgroundColor: colors.background,
  },
  specialNodeOuter: {
    width: normalize(30),
    height: normalize(30),
    borderRadius: normalize(15),
    borderWidth: 2,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(163, 230, 53, 0.08)',
  },
  standardNodeContainer: {
    width: normalize(32),
    height: normalize(32),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    backgroundColor: colors.background,
  },
  standardNodeOuter: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    borderWidth: 2,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(163, 230, 53, 0.08)',
  },
  standardNodeInner: {
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
    backgroundColor: colors.accent,
  },

  // Dashed Line Simulation
  dashedLineContainer: {
    position: 'absolute',
    top: normalize(26),
    bottom: -10,
    left: normalize(19),
    width: normalize(2),
    zIndex: 1,
    overflow: 'hidden',
  },
  dashedLine: {
    width: normalize(2),
    height: '100%',
    borderColor: colors.accent,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: normalize(1),
  },

  // Middle content column
  contentCol: {
    flex: 1,
    paddingLeft: normalize(12),
    paddingRight: normalize(16),
    paddingTop: normalize(4),
  },
  timeText: {
    fontSize: normalizeFont(12),
    color: colors.muted,
    fontWeight: '500',
    marginBottom: normalize(4),
  },
  titleText: {
    fontSize: normalizeFont(16),
    color: colors.text,
    fontWeight: '700',
    marginBottom: normalize(4),
  },
  descriptionText: {
    fontSize: normalizeFont(13),
    color: colors.muted,
    lineHeight: normalizeFont(18),
  },

  // Right image column
  imageCol: {
    width: normalize(85),
    height: normalize(85),
    borderRadius: normalize(16),
    overflow: 'hidden',
    marginTop: normalize(4),
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
});
