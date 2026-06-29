import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  SharedValue,
} from 'react-native-reanimated';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize } from '@theme/normalize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const TypingIndicator: React.FC = () => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const startAnimation = (sharedValue: SharedValue<number>, delay: number) => {
      sharedValue.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0, { duration: 400 })
          ),
          -1,
          false
        )
      );
    };

    startAnimation(dot1, 0);
    startAnimation(dot2, 200);
    startAnimation(dot3, 400);
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: -dot1.value * 6 }],
    opacity: 0.5 + dot1.value * 0.5,
  }));
  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: -dot2.value * 6 }],
    opacity: 0.5 + dot2.value * 0.5,
  }));
  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateY: -dot3.value * 6 }],
    opacity: 0.5 + dot3.value * 0.5,
  }));

  return (
    <View style={styles.botMessageWrapper}>
      <View style={styles.botAvatar}>
        <Icon name="robot-outline" size={20} color={colors.accent} />
      </View>
      <View style={styles.typingBubble}>
        <Animated.View style={[styles.dot, animatedStyle1]} />
        <Animated.View style={[styles.dot, animatedStyle2]} />
        <Animated.View style={[styles.dot, animatedStyle3]} />
      </View>
    </View>
  );
};

const getStyles = (colors: ColorsType) => StyleSheet.create({
  botMessageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: normalize(20),
  },
  botAvatar: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
    borderWidth: 1,
    borderColor: colors.outline,
  },
  typingBubble: {
    backgroundColor: colors.surface,
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(16),
    borderRadius: normalize(20),
    borderTopLeftRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  dot: {
    width: normalize(6),
    height: normalize(6),
    borderRadius: normalize(3),
    backgroundColor: colors.accent,
    marginHorizontal: normalize(3),
  },
});
