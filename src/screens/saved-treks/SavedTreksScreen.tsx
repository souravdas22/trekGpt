import { useMemo } from 'react';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, FlatList, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Trek } from '../../store/slices/savedTreksSlice';
import { normalize, normalizeFont } from '@theme/normalize';

type RootStackParamList = {
  TrekDetails: { trek: Trek };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SavedTreksScreen = () => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const navigation = useNavigation<NavigationProp>();
  const savedTreks = useSelector((state: RootState) => state.savedTreks.savedTreks);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Icon name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Treks</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      {savedTreks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.iconCircle}>
            <Icon name="bookmark-outline" size={48} color="#8B949E" />
          </View>
          <Text style={styles.emptyTitle}>No Saved Treks</Text>
          <Text style={styles.emptySubtitle}>
            Treks you save will appear here for easy access later.
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedTreks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.card}
              onPress={() => navigation.navigate('TrekDetails', { trek: item })}
            >
              <ImageBackground
                source={item.image || require('../../assets/images/fallback_trek.jpg')}
                style={styles.cardBg}
                imageStyle={{ borderRadius: 16 }}
              >
                <View style={styles.cardOverlay}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const getStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28) + 12,
    paddingBottom: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: '#21262D',
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
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: normalize(40),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(40),
  },
  iconCircle: {
    width: normalize(96),
    height: normalize(96),
    borderRadius: normalize(48),
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(24),
    borderWidth: 1,
    borderColor: colors.outline,
  },
  emptyTitle: {
    fontSize: normalizeFont(20),
    fontWeight: '700',
    color: colors.text,
    marginBottom: normalize(12),
  },
  emptySubtitle: {
    fontSize: normalizeFont(15),
    color: colors.muted,
    textAlign: 'center',
    lineHeight: normalizeFont(22),
  },
  listContent: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(16),
    paddingBottom: normalize(32),
  },
  card: {
    height: normalize(180),
    borderRadius: normalize(16),
    marginBottom: normalize(16),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    overflow: 'hidden',
  },
  cardBg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardOverlay: {
    padding: normalize(16),
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  cardTitle: {
    fontSize: normalizeFont(18),
    fontWeight: '700',
    color: colors.text,
    marginBottom: normalize(4),
  },
  cardSubtitle: {
    fontSize: normalizeFont(14),
    color: '#A3E635',
  },
});
