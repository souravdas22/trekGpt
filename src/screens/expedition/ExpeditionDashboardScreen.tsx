import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { endExpedition } from '../../store/slices/expeditionSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type CircularProgressProps = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
};

const CircularProgress = ({ progress, size = 64, strokeWidth = 4, color }: CircularProgressProps) => {
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
        <Text style={{ color: themeColors.text, fontSize: normalizeFont(14), fontWeight: '700' }}>{progress}%</Text>
      </View>
    </View>
  );
};

export const ExpeditionDashboardScreen = () => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const { activeTrek, currentDay, progress } = useSelector((state: RootState) => state.expedition);

  if (!activeTrek) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>No active expedition.</Text>
        <TouchableOpacity style={styles.endBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.endBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleEndExpedition = () => {
    dispatch(endExpedition());
    navigation.navigate('Tabs');
    // Here we can prompt the community share screen.
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['rgba(30, 41, 59, 1)', colors.background]}
        style={styles.headerGradient}
      />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expedition Dashboard</Text>
        <TouchableOpacity style={styles.sosBtn} onPress={() => navigation.navigate('Emergency')}>
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ── Daily Mission Card ── */}
        <View style={styles.missionCard}>
          <View style={styles.missionHeader}>
            <View style={styles.missionBadge}>
              <Text style={styles.missionBadgeText}>📍 Day {currentDay} Mission</Text>
            </View>
            <CircularProgress progress={progress || 38} size={48} strokeWidth={4} />
          </View>
          
          <Text style={styles.missionTitle}>Reach Kalkattiyadhar Camp</Text>
          <Text style={styles.trekNameSub}>{activeTrek.name}</Text>
          
          <View style={styles.missionDetailsGrid}>
            <View style={styles.missionDetailItem}>
              <Icon name="map-marker-distance" size={16} color={colors.muted} />
              <Text style={styles.missionDetailText}>Distance: 8 km</Text>
            </View>
            <View style={styles.missionDetailItem}>
              <Icon name="clock-outline" size={16} color={colors.muted} />
              <Text style={styles.missionDetailText}>Time: 4h 15m</Text>
            </View>
            <View style={styles.missionDetailItem}>
              <Icon name="chart-bell-curve-cumulative" size={16} color={colors.muted} />
              <Text style={styles.missionDetailText}>Difficulty: Moderate</Text>
            </View>
            <View style={styles.missionDetailItem}>
              <Icon name="gift-outline" size={16} color={colors.accent} />
              <Text style={[styles.missionDetailText, { color: colors.accent, fontWeight: '600' }]}>Reward: Summit tomorrow 🏔</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Trekking Tools</Text>
        <View style={styles.toolsGrid}>
          
          <TouchableOpacity style={styles.toolCard} onPress={() => navigation.navigate('MapRoute')}>
            <View style={[styles.toolIconBg, { backgroundColor: 'rgba(56,189,248,0.1)' }]}>
              <Icon name="map-legend" size={28} color="#38BDF8" />
            </View>
            <Text style={styles.toolTitle}>Today's Route</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolCard} onPress={() => navigation.navigate('OfflineMaps')}>
            <View style={[styles.toolIconBg, { backgroundColor: 'rgba(163,230,53,0.1)' }]}>
              <Icon name="map-marker-down" size={28} color={colors.accent} />
            </View>
            <Text style={styles.toolTitle}>Offline Map</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolCard} onPress={() => navigation.navigate('Weather')}>
            <View style={[styles.toolIconBg, { backgroundColor: 'rgba(251,191,36,0.1)' }]}>
              <Icon name="weather-partly-cloudy" size={28} color="#FBBF24" />
            </View>
            <Text style={styles.toolTitle}>Weather</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolCard} onPress={() => navigation.navigate('Gear')}>
            <View style={[styles.toolIconBg, { backgroundColor: 'rgba(168,85,247,0.1)' }]}>
              <Icon name="clipboard-check-outline" size={28} color="#A855F7" />
            </View>
            <Text style={styles.toolTitle}>Checklist</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolCard}>
            <View style={[styles.toolIconBg, { backgroundColor: 'rgba(244,63,94,0.1)' }]}>
              <Icon name="compass-outline" size={28} color="#F43F5E" />
            </View>
            <Text style={styles.toolTitle}>Compass</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolCard}>
            <View style={[styles.toolIconBg, { backgroundColor: 'rgba(99,102,241,0.1)' }]}>
              <Icon name="notebook-outline" size={28} color="#6366F1" />
            </View>
            <Text style={styles.toolTitle}>Journal</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolCard}>
            <View style={[styles.toolIconBg, { backgroundColor: 'rgba(14,165,233,0.1)' }]}>
              <Icon name="water-outline" size={28} color="#0EA5E9" />
            </View>
            <Text style={styles.toolTitle}>Water Reminder</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolCard}>
            <View style={[styles.toolIconBg, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
              <Icon name="tent" size={28} color="#EF4444" />
            </View>
            <Text style={styles.toolTitle}>Nearby Camps</Text>
          </TouchableOpacity>

        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Today's Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statBoxLabel}>Distance</Text>
            <Text style={styles.statBoxValue}>21 <Text style={styles.statBoxUnit}>/ 56 km</Text></Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxLabel}>Altitude</Text>
            <Text style={styles.statBoxValue}>3120 <Text style={styles.statBoxUnit}>m</Text></Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxLabel}>Avg Pace</Text>
            <Text style={styles.statBoxValue}>3.8 <Text style={styles.statBoxUnit}>km/h</Text></Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxLabel}>Calories</Text>
            <Text style={styles.statBoxValue}>640 <Text style={styles.statBoxUnit}>kcal</Text></Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.aiTipCard}>
          <View style={styles.aiTipHeader}>
            <Icon name="robot-outline" size={20} color={colors.accent} />
            <Text style={styles.aiTipTitle}>AI Trek Tip</Text>
          </View>
          <Text style={styles.aiTipText}>"Rain expected after 2 PM. Start early and pack your rain cover near the top of your bag."</Text>
        </View>

        <TouchableOpacity style={styles.endBtn} onPress={handleEndExpedition}>
          <Icon name="flag-checkered" size={20} color="#000" style={{ marginRight: 8 }} />
          <Text style={styles.endBtnText}>Finish Expedition</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const getStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: normalize(200),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingTop: Platform.OS === 'ios' ? normalize(60) : normalize(50),
    paddingBottom: normalize(16),
  },
  backBtn: {
    padding: normalize(4),
  },
  headerTitle: {
    fontSize: normalizeFont(18),
    fontWeight: '700',
    color: colors.text,
  },
  sosBtn: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  sosText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: normalizeFont(14),
  },
  scrollContent: {
    padding: normalize(20),
    paddingBottom: normalize(40),
  },
  // Mission Card
  missionCard: {
    backgroundColor: colors.surface,
    borderRadius: normalize(20),
    padding: normalize(20),
    marginBottom: normalize(24),
    borderWidth: 1,
    borderColor: colors.outline,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(12),
  },
  missionBadge: {
    backgroundColor: 'rgba(30, 41, 59, 1)',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: 'rgba(163, 230, 53, 0.4)',
  },
  missionBadgeText: {
    color: colors.accent,
    fontSize: normalizeFont(12),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  missionTitle: {
    fontSize: normalizeFont(24),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: normalize(4),
  },
  trekNameSub: {
    fontSize: normalizeFont(14),
    color: colors.muted,
    marginBottom: normalize(16),
  },
  missionDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(12),
    marginTop: normalize(8),
  },
  missionDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
    gap: normalize(6),
  },
  missionDetailText: {
    color: colors.text,
    fontSize: normalizeFont(13),
  },

  divider: {
    height: 1,
    backgroundColor: colors.outline,
    marginVertical: normalize(24),
    marginHorizontal: normalize(10),
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: normalize(12),
  },
  statBox: {
    width: (SCREEN_WIDTH - 40 - 12) / 2,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: normalize(16),
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: colors.outline,
  },
  statBoxLabel: {
    color: colors.muted,
    fontSize: normalizeFont(13),
    marginBottom: normalize(4),
    fontWeight: '500',
  },
  statBoxValue: {
    color: colors.text,
    fontSize: normalizeFont(20),
    fontWeight: 'bold',
  },
  statBoxUnit: {
    fontSize: normalizeFont(12),
    color: colors.muted,
    fontWeight: 'normal',
  },

  // AI Tip
  aiTipCard: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: normalize(16),
    padding: normalize(20),
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    marginBottom: normalize(20),
  },
  aiTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
    marginBottom: normalize(8),
  },
  aiTipTitle: {
    color: colors.accent,
    fontSize: normalizeFont(15),
    fontWeight: '700',
  },
  aiTipText: {
    color: colors.text,
    fontSize: normalizeFont(15),
    lineHeight: normalize(22),
    fontStyle: 'italic',
  },

  // Tools
  sectionTitle: {
    fontSize: normalizeFont(18),
    fontWeight: '700',
    color: colors.text,
    marginBottom: normalize(16),
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: normalize(16),
  },
  toolCard: {
    width: (SCREEN_WIDTH - 40 - 16) / 2, // 2 columns
    backgroundColor: colors.surface,
    borderRadius: normalize(16),
    padding: normalize(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outline,
  },
  toolIconBg: {
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(28),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(12),
  },
  toolTitle: {
    fontSize: normalizeFont(14),
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  endBtn: {
    marginTop: normalize(20),
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(16),
    borderRadius: normalize(16),
  },
  endBtnText: {
    color: '#000',
    fontSize: normalizeFont(16),
    fontWeight: 'bold',
  },
});
