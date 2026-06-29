import { useMemo } from 'react';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  badgeBg: string;
  borderColor: string;
  current: number;
  total: number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'Peak Conqueror',
    description: 'Reach 10 peaks',
    icon: 'shield-star',
    iconColor: '#60A5FA',
    badgeBg: '#0D2240',
    borderColor: '#2563EB',
    current: 10,
    total: 10,
  },
  {
    id: '2',
    title: 'Trail Blazer',
    description: 'Hike 100 km',
    icon: 'shield-crown',
    iconColor: '#FBBF24',
    badgeBg: '#2A1F00',
    borderColor: '#D97706',
    current: 80,
    total: 100,
  },
  {
    id: '3',
    title: 'Early Bird',
    description: 'Book 5 treks early',
    icon: 'shield-crown-outline',
    iconColor: '#F97316',
    badgeBg: '#2A1200',
    borderColor: '#EA580C',
    current: 3,
    total: 5,
  },
  {
    id: '4',
    title: 'Weather Watcher',
    description: 'Check weather 30 times',
    icon: 'shield-half-full',
    iconColor: '#A78BFA',
    badgeBg: '#1A0D2E',
    borderColor: '#7C3AED',
    current: 15,
    total: 30,
  },
  {
    id: '5',
    title: 'Gear Master',
    description: 'Complete 5 checklists',
    icon: 'shield-check',
    iconColor: '#A3E635',
    badgeBg: '#0D1F05',
    borderColor: '#65A30D',
    current: 5,
    total: 5,
  },
];

interface AchievementsScreenProps {
  navigation?: any;
}

export const AchievementsScreen = ({ navigation }: AchievementsScreenProps) => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const completed = ACHIEVEMENTS.filter(a => a.current >= a.total).length;

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
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* ── Summary Pill ── */}
      <View style={styles.summaryPill}>
        <Icon name="trophy-outline" size={16} color={colors.accent} />
        <Text style={styles.summaryText}>
          {completed}/{ACHIEVEMENTS.length} Unlocked
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ACHIEVEMENTS.map(achievement => {
          const progress = Math.min(achievement.current / achievement.total, 1);
          const isComplete = achievement.current >= achievement.total;

          return (
            <View key={achievement.id} style={styles.card}>
              {/* Badge Icon */}
              <View
                style={[
                  styles.badgeWrap,
                  {
                    backgroundColor: achievement.badgeBg,
                    borderColor: achievement.borderColor,
                  },
                ]}
              >
                <Icon
                  name={achievement.icon}
                  size={30}
                  color={achievement.iconColor}
                />
              </View>

              {/* Info */}
              <View style={styles.cardInfo}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle}>{achievement.title}</Text>
                  <Text
                    style={[
                      styles.cardCount,
                      isComplete && styles.cardCountComplete,
                    ]}
                  >
                    {achievement.current}/{achievement.total}
                  </Text>
                </View>

                <Text style={styles.cardDescription}>{achievement.description}</Text>

                {/* Progress Bar */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progress * 100}%` as any,
                        backgroundColor: isComplete
                          ? colors.accent
                          : achievement.iconColor,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          );
        })}
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

  // Summary Pill
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: normalize(6),
    backgroundColor: colors.surface,
    borderRadius: normalize(20),
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    marginBottom: normalize(20),
  },
  summaryText: {
    color: colors.accent,
    fontSize: normalizeFont(13),
    fontWeight: '700',
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: normalize(22),
    paddingBottom: normalize(110),
    gap: normalize(14),
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: normalize(20),
    borderWidth: 1,
    borderColor: colors.outline,
    padding: normalize(16),
    gap: normalize(16),
  },
  badgeWrap: {
    width: normalize(58),
    height: normalize(58),
    borderRadius: normalize(16),
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  // Card Info
  cardInfo: {
    flex: 1,
    gap: normalize(4),
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: colors.text,
    fontSize: normalizeFont(15),
    fontWeight: '700',
  },
  cardCount: {
    color: colors.muted,
    fontSize: normalizeFont(13),
    fontWeight: '700',
  },
  cardCountComplete: {
    color: colors.accent,
  },
  cardDescription: {
    color: colors.muted,
    fontSize: normalizeFont(12),
    marginBottom: normalize(8),
  },

  // Progress
  progressTrack: {
    height: normalize(5),
    borderRadius: normalize(3),
    backgroundColor: colors.outline,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: normalize(3),
  },
});
