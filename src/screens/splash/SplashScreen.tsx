import { useMemo } from 'react';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';

export const SplashScreen = () => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  // Simple animation for the progress bar
  const progress = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();
  }, []);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <ImageBackground
      source={require('@assets/images/splash_bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.centerContainer}>
          <Icon name="terrain" size={80} color={colors.primary} />
          <Text style={styles.title}>TrekGPT</Text>
          <Text style={styles.subtitle}>AI Powered Trek Planner</Text>
        </View>

        <View style={styles.bottomContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[styles.progressBarFill, { width: progressWidth }]}
            />
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const getStyles = (colors: ColorsType) => StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // Darken the image slightly for text readability
    justifyContent: 'flex-end',
    paddingBottom: normalize(80),
  },
  centerContainer: {
    alignItems: 'center',
    marginBottom: normalize(180),
  },
  title: {
    fontSize: normalizeFont(42),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: normalize(10),
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: normalizeFont(16),
    color: '#E2E8F0',
    marginTop: normalize(8),
    fontWeight: '500',
  },
  bottomContainer: {
    alignItems: 'center',
    paddingHorizontal: normalize(40),
  },
  progressBarBackground: {
    height: normalize(4),
    width: normalize(120),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: normalize(2),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: normalize(2),
  },
});
