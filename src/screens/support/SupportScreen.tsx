import { useMemo } from 'react';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { useNavigation } from '@react-navigation/native';
import { normalize, normalizeFont } from '@theme/normalize';

export const SupportScreen = () => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const navigation = useNavigation();

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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Empty State */}
      <View style={styles.emptyContainer}>
        <View style={styles.iconCircle}>
          <Icon name="lifebuoy" size={48} color="#8B949E" />
        </View>
        <Text style={styles.emptyTitle}>How can we help?</Text>
        <Text style={styles.emptySubtitle}>
          Check our FAQs or reach out to our team if you need assistance on your journey.
        </Text>
      </View>
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
});
