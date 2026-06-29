import { useMemo } from 'react';
import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type BookingStatus = 'Upcoming' | 'Completed' | 'Cancelled';

interface Booking {
  id: string;
  name: string;
  dateRange: string;
  days: number;
  status: BookingStatus;
  image: any;
}

const BOOKINGS: Booking[] = [
  {
    id: '1',
    name: 'Har Ki Dun Trek',
    dateRange: 'May 15 - May 22, 2025',
    days: 7,
    status: 'Upcoming',
    image: require('@assets/images/splash_bg.png'),
  },
  {
    id: '2',
    name: 'Kedarkantha Trek',
    dateRange: 'Mar 10 - Mar 16, 2025',
    days: 6,
    status: 'Completed',
    image: require('@assets/images/splash_bg.png'),
  },
  {
    id: '3',
    name: 'Sandakphu Trek',
    dateRange: 'Feb 05 - Feb 11, 2025',
    days: 6,
    status: 'Completed',
    image: require('@assets/images/splash_bg.png'),
  },
  {
    id: '4',
    name: 'Valley of Flowers',
    dateRange: 'Aug 01 - Aug 07, 2025',
    days: 7,
    status: 'Cancelled',
    image: require('@assets/images/splash_bg.png'),
  },
];

const STATUS_COLOR: Record<BookingStatus, string> = {
  Upcoming: '#A3E635',
  Completed: '#22C55E',
  Cancelled: '#EF4444',
};

interface BookingsScreenProps {
  navigation?: any;
}

export const BookingsScreen = ({ navigation }: BookingsScreenProps) => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [activeTab, setActiveTab] = useState<BookingStatus>('Upcoming');

  const filtered = BOOKINGS.filter(b => b.status === activeTab);

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
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* ── Tab Bar ── */}
      <View style={styles.tabBar}>
        {(['Upcoming', 'Completed', 'Cancelled'] as BookingStatus[]).map(tab => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Booking List ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="calendar-remove-outline" size={52} color="#2D333B" />
            <Text style={styles.emptyText}>No {activeTab} bookings</Text>
          </View>
        ) : (
          filtered.map(booking => (
            <TouchableOpacity
              key={booking.id}
              style={styles.card}
              activeOpacity={0.85}
            >
              {/* Trek Image */}
              <Image source={booking.image} style={styles.cardImage} resizeMode="cover" />

              {/* Card Info */}
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {booking.name}
                </Text>
                <Text style={styles.cardDate}>{booking.dateRange}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardDays}>{booking.days} Days</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { borderColor: STATUS_COLOR[booking.status] },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: STATUS_COLOR[booking.status] }]}>
                      {booking.status}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* ── New Booking Button ── */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.newBookingBtn} activeOpacity={0.85}>
          <Icon name="plus" size={20} color="#0D1117" style={{ marginRight: 8 }} />
          <Text style={styles.newBookingText}>New Booking</Text>
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
  headerPlaceholder: {
    width: normalize(44),
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: normalize(22),
    backgroundColor: colors.surface,
    borderRadius: normalize(30),
    borderWidth: 1,
    borderColor: colors.outline,
    padding: normalize(4),
    marginBottom: normalize(20),
  },
  tab: {
    flex: 1,
    height: normalize(36),
    borderRadius: normalize(26),
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#A3E635',
  },
  tabText: {
    fontSize: normalizeFont(13),
    fontWeight: '600',
    color: colors.muted,
  },
  tabTextActive: {
    color: '#0D1117',
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
    backgroundColor: colors.surface,
    borderRadius: normalize(18),
    borderWidth: 1,
    borderColor: colors.outline,
    overflow: 'hidden',
    alignItems: 'center',
  },
  cardImage: {
    width: normalize(88),
    height: normalize(88),
  },
  cardInfo: {
    flex: 1,
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(12),
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: normalizeFont(16),
    fontWeight: '700',
    color: colors.text,
    marginBottom: normalize(4),
  },
  cardDate: {
    fontSize: normalizeFont(12),
    color: colors.muted,
    fontWeight: '400',
    marginBottom: normalize(10),
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDays: {
    fontSize: normalizeFont(12),
    fontWeight: '500',
    color: colors.muted,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: normalize(20),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(3),
  },
  statusText: {
    fontSize: normalizeFont(11),
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: normalize(80),
    gap: normalize(12),
  },
  emptyText: {
    fontSize: normalizeFont(16),
    color: '#484F58',
    fontWeight: '500',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: normalize(0),
    left: normalize(0),
    right: normalize(0),
    paddingHorizontal: normalize(22),
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    paddingTop: normalize(16),
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: '#161B22',
  },
  newBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A3E635',
    height: normalize(54),
    borderRadius: normalize(27),
  },
  newBookingText: {
    fontSize: normalizeFont(16),
    fontWeight: '800',
    color: '#0D1117',
  },
});
