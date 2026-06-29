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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';

type FilterTab = 'All' | 'Bookings' | 'Community' | 'Alerts';

type NotificationType = 'booking' | 'message' | 'weather' | 'achievement';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timeAgo: string;
  read: boolean;
  avatar?: any;
}

const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'Booking Confirmed',
    body: 'Your booking for Har Ki Dun is confirmed.',
    timeAgo: '2m ago',
    read: false,
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message',
    body: 'Mike Weisky sent you a message.',
    timeAgo: '1h ago',
    read: false,
    avatar: require('@assets/images/splash_bg.png'),
  },
  {
    id: '3',
    type: 'weather',
    title: 'Weather Alert',
    body: 'Heavy snowfall expected tomorrow.',
    timeAgo: '3h ago',
    read: true,
  },
  {
    id: '4',
    type: 'achievement',
    title: 'New Achievement',
    body: 'Congratulations! You earned Trail Blazer badge.',
    timeAgo: '1d ago',
    read: true,
  },
  {
    id: '5',
    type: 'booking',
    title: 'Booking Reminder',
    body: 'Your Kedarkantha trek starts in 3 days.',
    timeAgo: '2d ago',
    read: true,
  },
  {
    id: '6',
    type: 'weather',
    title: 'Weather Alert',
    body: 'Clear skies expected on your trek day. Perfect conditions!',
    timeAgo: '3d ago',
    read: true,
  },
];

const TAB_FILTERS: FilterTab[] = ['All', 'Bookings', 'Community', 'Alerts'];

const TYPE_TO_TAB: Record<NotificationType, FilterTab> = {
  booking: 'Bookings',
  message: 'Community',
  weather: 'Alerts',
  achievement: 'Alerts',
};

const getIconConfig = (type: NotificationType): { name: string; color: string; bg: string } => {
  switch (type) {
    case 'booking':
      return { name: 'map-marker', color: '#A3E635', bg: '#1C2A1C' };
    case 'weather':
      return { name: 'weather-snowy-rainy', color: '#A3E635', bg: '#1C2A1C' };
    case 'achievement':
      return { name: 'trophy-variant', color: '#A3E635', bg: '#1C2A1C' };
    default:
      return { name: 'bell', color: '#A3E635', bg: '#1C2A1C' };
  }
};

interface NotificationsScreenProps {
  navigation?: any;
}

export const NotificationsScreen = ({ navigation }: NotificationsScreenProps) => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);

  const filtered = activeTab === 'All'
    ? notifications
    : notifications.filter(n => TYPE_TO_TAB[n.type] === activeTab);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderIcon = (item: Notification) => {
    if (item.type === 'message' && item.avatar) {
      return (
        <View style={styles.avatarWrap}>
          <Image source={item.avatar} style={styles.avatarImage} />
          <View style={styles.messageDot} />
        </View>
      );
    }
    const { name, color, bg } = getIconConfig(item.type);
    return (
      <View style={[styles.iconWrap, { backgroundColor: bg }]}>
        <Icon name={name} size={22} color={color} />
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead} activeOpacity={0.8}>
            <Text style={styles.markAllText}>Mark all</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.markAllBtn} />
        )}
      </View>

      {/* ── Filter Tabs ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}
        style={styles.tabScrollView}
      >
        {TAB_FILTERS.map(tab => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
              <View style={[styles.tabIndicator, !isActive && { opacity: 0 }]} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Notification List ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="bell-off-outline" size={48} color="#30363D" />
            <Text style={styles.emptyText}>No notifications here</Text>
          </View>
        ) : (
          filtered.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, !item.read && styles.cardUnread]}
              onPress={() => markRead(item.id)}
              activeOpacity={0.85}
            >
              {renderIcon(item)}

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.body}</Text>
              </View>

              <View style={styles.cardRight}>
                <Text style={styles.timeAgo}>{item.timeAgo}</Text>
                {!item.read && <View style={styles.unreadDot} />}
              </View>
            </TouchableOpacity>
          ))
        )}
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
  markAllBtn: {
    width: normalize(64),
    height: normalize(34),
    borderRadius: normalize(17),
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  markAllText: {
    color: '#A3E635',
    fontSize: normalizeFont(13),
    fontWeight: '700',
  },

  // Filter Tabs
  tabScrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: normalize(22),
    paddingBottom: normalize(16),
    gap: normalize(8),
  },
  tab: {
    paddingHorizontal: normalize(18),
    paddingVertical: normalize(8),
    alignItems: 'center',
  },
  tabIndicator: {
    marginTop: normalize(4),
    height: normalize(2),
    width: '60%',
    borderRadius: normalize(2),
    backgroundColor: '#A3E635',
  },
  tabText: {
    color: colors.muted,
    fontSize: normalizeFont(14),
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.text,
    fontWeight: '700',
  },

  // List
  listContent: {
    paddingHorizontal: normalize(22),
    paddingBottom: normalize(40),
    gap: normalize(12),
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: normalize(18),
    borderWidth: 1,
    borderColor: colors.outline,
    padding: normalize(14),
    gap: normalize(14),
  },
  cardUnread: {
    borderColor: '#2A3520',
    backgroundColor: '#181F12',
  },

  // Icon
  iconWrap: {
    width: normalize(50),
    height: normalize(50),
    borderRadius: normalize(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrap: {
    width: normalize(50),
    height: normalize(50),
    borderRadius: normalize(25),
    overflow: 'visible',
  },
  avatarImage: {
    width: normalize(50),
    height: normalize(50),
    borderRadius: normalize(25),
  },
  messageDot: {
    position: 'absolute',
    bottom: normalize(1),
    right: normalize(1),
    width: normalize(12),
    height: normalize(12),
    borderRadius: normalize(6),
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: colors.background,
  },

  // Body
  cardBody: {
    flex: 1,
    gap: normalize(4),
  },
  cardTitle: {
    color: colors.text,
    fontSize: normalizeFont(14),
    fontWeight: '700',
  },
  cardDesc: {
    color: colors.muted,
    fontSize: normalizeFont(13),
    lineHeight: normalizeFont(18),
  },

  // Right
  cardRight: {
    alignItems: 'flex-end',
    gap: normalize(8),
  },
  timeAgo: {
    color: colors.muted,
    fontSize: normalizeFont(11),
    fontWeight: '500',
  },
  unreadDot: {
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
    backgroundColor: '#A3E635',
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingTop: normalize(80),
    gap: normalize(14),
  },
  emptyText: {
    color: '#30363D',
    fontSize: normalizeFont(15),
    fontWeight: '600',
  },
});
