import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setTheme } from '../../store/slices/settingsSlice';
import { logout as reduxLogout } from '../../store/slices/authSlice';
import { logout as firebaseLogout } from '../../services/firebase/auth.service';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ColorsType } from '../../theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';

interface SettingsScreenProps {
  navigation?: any;
}

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  styles: any;
  currentColors: ColorsType;
}

const SettingRow = ({ icon, label, value, onPress, showChevron = true, styles, currentColors }: SettingRowProps) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.rowLeft}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={20} color={currentColors.text} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <View style={styles.rowRight}>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {showChevron && (
        <Icon name="chevron-right" size={20} color={currentColors.muted} />
      )}
    </View>
  </TouchableOpacity>
);

export const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.settings.theme);
  const currentColors = useAppTheme();
  const styles = useMemo(() => getStyles(currentColors), [currentColors]);
  
  const [unit, setUnit] = useState<'Metric' | 'Imperial'>('Metric');

  const unitLabel = unit === 'Metric' ? 'Metric (km, °C)' : 'Imperial (mi, °F)';

  const handleLogout = () => {
    dispatch(reduxLogout());
    firebaseLogout().catch(console.error);
  };

  const handleUnitToggle = () => {
    setUnit(prev => (prev === 'Metric' ? 'Imperial' : 'Metric'));
  };

  const handleThemeToggle = () => {
    dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}
        >
          <Icon name="chevron-left" size={24} color={currentColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Section Card ── */}
        <View style={styles.card}>
          <SettingRow
            icon="account-outline"
            label="Account Settings"
            onPress={() => {}}
            styles={styles}
            currentColors={currentColors}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="tune-variant"
            label="Preferences"
            onPress={() => {}}
            styles={styles}
            currentColors={currentColors}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="shield-lock-outline"
            label="Privacy & Security"
            onPress={() => {}}
            styles={styles}
            currentColors={currentColors}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="download-outline"
            label="Offline Maps"
            onPress={() => navigation?.navigate('OfflineMaps')}
            styles={styles}
            currentColors={currentColors}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="dots-grid"
            label="Units"
            value={unitLabel}
            onPress={handleUnitToggle}
            styles={styles}
            currentColors={currentColors}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="theme-light-dark"
            label="Theme"
            value={theme.charAt(0).toUpperCase() + theme.slice(1)}
            onPress={handleThemeToggle}
            styles={styles}
            currentColors={currentColors}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="shield-alert-outline"
            label="Emergency SOS"
            onPress={() => navigation?.navigate('Emergency')}
            styles={styles}
            currentColors={currentColors}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="information-outline"
            label="About TrekGPT"
            value="v1.0.0"
            onPress={() => {}}
            styles={styles}
            currentColors={currentColors}
          />
        </View>

        {/* ── Logout Button ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>Logout</Text>
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

  scrollContent: {
    paddingHorizontal: normalize(22),
    paddingBottom: normalize(48),
    gap: normalize(20),
  },

  // Settings Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: normalize(20),
    borderWidth: 1,
    borderColor: colors.outline,
    overflow: 'hidden',
    marginTop: normalize(8),
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(18),
    paddingVertical: normalize(16),
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(14),
  },
  iconWrap: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(10),
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLabel: {
    color: colors.text,
    fontSize: normalizeFont(15),
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  rowValue: {
    color: colors.primary,
    fontSize: normalizeFont(13),
    fontWeight: '600',
  },

  divider: {
    height: normalize(1),
    backgroundColor: colors.outline,
    marginHorizontal: normalize(18),
  },

  // Logout
  logoutBtn: {
    backgroundColor: colors.surface,
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: colors.error,
    paddingVertical: normalize(16),
    alignItems: 'center',
    marginTop: normalize(8),
  },
  logoutText: {
    color: colors.error,
    fontSize: normalizeFont(16),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
