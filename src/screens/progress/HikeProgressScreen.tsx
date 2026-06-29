import { useMemo } from 'react';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';

interface Participant {
  id: string;
  rank: number;
  name: string;
  distance: string;
  avatarIcon: string;
  isCurrentUser?: boolean;
}

const PARTICIPANTS: Participant[] = [
  { id: '1', rank: 1, name: 'James Carter', distance: '18.2km', avatarIcon: 'account-circle' },
  { id: '2', rank: 2, name: 'William Brooks', distance: '15.4km', avatarIcon: 'account-circle' },
  { id: '3', rank: 3, name: 'Olivia Johnson', distance: '17.9km', avatarIcon: 'account-circle' },
  { id: '4', rank: 4, name: 'Mike Welsley', distance: '17.6km', avatarIcon: 'account-circle' },
  { id: '5', rank: 5, name: 'Isabella Hayes', distance: '17.6km', avatarIcon: 'account-circle' },
  { id: '6', rank: 6, name: 'Charlotte Brown', distance: '15.2km', avatarIcon: 'account-circle' },
  { id: '7', rank: 7, name: 'Lucas Mitchell', distance: '11.8km', avatarIcon: 'account-circle' },
  { id: '8', rank: 8, name: 'Ethan Foster', distance: '8.6km', avatarIcon: 'account-circle' },
];

const MY_RANK = 4;
const MY_NAME = 'You';

interface HikeProgressScreenProps {
  navigation?: any;
}

const RankBadge = ({ rank, styles, colors }: { rank: number, styles: any, colors: ColorsType }) => {

  if (rank === 1) return <Icon name="trophy" size={16} color="#F59E0B" />;
  if (rank === 2) return <Icon name="trophy" size={16} color="#94A3B8" />;
  if (rank === 3) return <Icon name="trophy" size={16} color="#CD7C3F" />;
  return (
    <Text style={styles.rankNumber}>
      {String(rank).padStart(2, '0')}
    </Text>
  );
};

export const HikeProgressScreen = ({ navigation }: HikeProgressScreenProps) => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Friends'>('All');

  const renderItem = ({ item }: { item: Participant }) => {
    const isMe = item.rank === MY_RANK;
    return (
      <View style={[styles.row, isMe && styles.rowHighlighted]}>
        <View style={styles.rankCol}>
          <RankBadge rank={item.rank} styles={styles} colors={colors} />
        </View>

        <View style={styles.avatarWrap}>
          <Icon
            name={item.avatarIcon}
            size={34}
            color={isMe ? colors.accent : colors.muted}
            style={styles.avatarIcon}
          />
        </View>

        <Text style={[styles.nameText, isMe && styles.nameTextMe]} numberOfLines={1}>
          {item.name}
        </Text>

        <View style={[styles.distancePill, isMe && styles.distancePillMe]}>
          <Text style={[styles.distanceText, isMe && styles.distanceTextMe]}>
            {item.distance}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}
        >
          <Icon name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hike Progress</Text>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.8}>
          <Icon name="magnify" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* My Rank Banner */}
      <View style={styles.myRankBanner}>
        <View style={styles.myRankLeft}>
          <View style={styles.myAvatarWrap}>
            <Icon name="account-circle" size={36} color={colors.accent} />
          </View>
          <View style={styles.myRankTextCol}>
            <Text style={styles.myRankTitle}>
              You are in the <Text style={styles.myRankHighlight}>{MY_RANK} place</Text>
            </Text>
            <Text style={styles.myRankSub}>Keep it up 🔥</Text>
          </View>
        </View>
        <Icon name="chevron-right" size={20} color={colors.muted} />
      </View>

      {/* Leaderboard */}
      <FlatList
        data={PARTICIPANTS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
    paddingHorizontal: normalize(20),
    paddingTop: Platform.OS === 'ios' ? 58 : 46,
    paddingBottom: normalize(14),
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
    fontSize: normalizeFont(18),
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.2,
  },

  // My rank banner
  myRankBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: normalize(16),
    marginHorizontal: normalize(20),
    marginBottom: normalize(18),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    borderWidth: 1,
    borderColor: colors.outline,
  },
  myRankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(12),
    flex: 1,
  },
  myAvatarWrap: {
    width: normalize(42),
    height: normalize(42),
    borderRadius: normalize(21),
    backgroundColor: 'rgba(163,230,53,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(163,230,53,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  myRankTextCol: {
    flex: 1,
  },
  myRankTitle: {
    fontSize: normalizeFont(13),
    color: colors.text,
    fontWeight: '500',
  },
  myRankHighlight: {
    color: colors.accent,
    fontWeight: '700',
  },
  myRankSub: {
    fontSize: normalizeFont(12),
    color: colors.muted,
    marginTop: normalize(2),
  },

  // List
  listContent: {
    paddingHorizontal: normalize(20),
    paddingBottom: normalize(100),
  },
  separator: {
    height: normalize(2),
    backgroundColor: colors.surface,
    marginHorizontal: normalize(4),
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(4),
    borderRadius: normalize(12),
  },
  rowHighlighted: {
    backgroundColor: 'rgba(163,230,53,0.06)',
  },
  rankCol: {
    width: normalize(36),
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: normalizeFont(13),
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 0.5,
  },
  avatarWrap: {
    width: normalize(42),
    height: normalize(42),
    borderRadius: normalize(21),
    backgroundColor: '#1C2128',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
    overflow: 'hidden',
  },
  avatarIcon: {},
  nameText: {
    flex: 1,
    fontSize: normalizeFont(14),
    fontWeight: '500',
    color: colors.text,
  },
  nameTextMe: {
    color: colors.accent,
    fontWeight: '700',
  },
  distancePill: {
    backgroundColor: '#1C2128',
    borderRadius: normalize(20),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(5),
    borderWidth: 1,
    borderColor: colors.outline,
  },
  distancePillMe: {
    backgroundColor: 'rgba(163,230,53,0.12)',
    borderColor: 'rgba(163,230,53,0.5)',
  },
  distanceText: {
    fontSize: normalizeFont(12),
    fontWeight: '700',
    color: colors.muted,
  },
  distanceTextMe: {
    color: colors.accent,
  },
});
