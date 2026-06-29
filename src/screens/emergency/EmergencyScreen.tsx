import { useMemo } from 'react';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';

export const EmergencyScreen = () => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const navigation = useNavigation();
  const [shareLocation, setShareLocation] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Icon name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        {/* SOS Button Area */}
        <View style={styles.sosContainer}>
          <View style={styles.rippleOuter}>
            <View style={styles.rippleInner}>
              <TouchableOpacity
                style={styles.sosButton}
                activeOpacity={0.9}
                onLongPress={() => console.log('Emergency Alert Triggered')}
              >
                <Text style={styles.sosText}>SOS</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.instructionText}>
            Tap and hold to send{'\n'}emergency alert
          </Text>
        </View>

        {/* Settings Area */}
        <View style={styles.settingsCard}>
          {/* Share Live Location */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Share Live Location</Text>
              <Text style={styles.settingSubtitle}>
                Share your live location with{'\n'}emergency contacts.
              </Text>
            </View>
            <Switch
              value={shareLocation}
              onValueChange={setShareLocation}
              trackColor={{ false: '#3E3E3E', true: colors.accent }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#3E3E3E"
            />
          </View>

          <View style={styles.divider} />

          {/* Emergency Contacts */}
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.8}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Emergency Contacts</Text>
              <Text style={styles.settingSubtitle}>3 Contacts Added</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
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
    paddingHorizontal: normalize(20),
    paddingTop: Platform.OS === 'android' ? normalize(20) : normalize(10),
    paddingBottom: normalize(20),
  },
  backButton: {
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
    fontWeight: '600',
    color: colors.text,
  },
  headerRight: {
    width: normalize(40),
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: normalize(20),
  },
  sosContainer: {
    alignItems: 'center',
    marginTop: normalize(40),
    marginBottom: normalize(60),
  },
  rippleOuter: {
    width: normalize(280),
    height: normalize(280),
    borderRadius: normalize(140),
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rippleInner: {
    width: normalize(220),
    height: normalize(220),
    borderRadius: normalize(110),
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosButton: {
    width: normalize(160),
    height: normalize(160),
    borderRadius: normalize(80),
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  sosText: {
    color: colors.text,
    fontSize: normalizeFont(42),
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  instructionText: {
    marginTop: normalize(30),
    color: colors.muted,
    fontSize: normalizeFont(15),
    textAlign: 'center',
    lineHeight: normalize(22),
  },
  settingsCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: normalize(20),
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(10),
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(16),
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: normalize(10),
  },
  settingTitle: {
    color: colors.text,
    fontSize: normalizeFont(16),
    fontWeight: '500',
    marginBottom: normalize(4),
  },
  settingSubtitle: {
    color: colors.muted,
    fontSize: normalizeFont(13),
    lineHeight: normalize(18),
  },
  divider: {
    height: 1,
    backgroundColor: colors.outline,
    width: '100%',
  },
});
