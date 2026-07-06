import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, PanResponder, Animated, Text, LayoutChangeEvent } from 'react-native';
import { useAppTheme } from '@hooks/useAppTheme';
import { normalize, normalizeFont } from '@theme/normalize';

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  initialLow?: number;
  initialHigh?: number;
  onValueChanged?: (low: number, high: number) => void;
  formatLabel?: (val: number) => string;
}

const THUMB_RADIUS = normalize(14);

export const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step = 1,
  initialLow,
  initialHigh,
  onValueChanged,
  formatLabel = (v) => `${v}`
}) => {
  const colors = useAppTheme();
  
  const [trackWidth, setTrackWidth] = useState(0);
  
  const lowValue = useRef(initialLow !== undefined ? initialLow : min);
  const highValue = useRef(initialHigh !== undefined ? initialHigh : max);
  
  const lowAnim = useRef(new Animated.Value(0)).current;
  const highAnim = useRef(new Animated.Value(0)).current;

  // State to re-render tooltip values
  const [currentLow, setCurrentLow] = useState(lowValue.current);
  const [currentHigh, setCurrentHigh] = useState(highValue.current);

  const lowStartPx = useRef(0);
  const highStartPx = useRef(0);

  const valueToPx = (val: number, width: number) => {
    return ((val - min) / (max - min)) * width;
  };

  const pxToValue = (px: number, width: number) => {
    const rawVal = (px / width) * (max - min) + min;
    const stepped = Math.round(rawVal / step) * step;
    return Math.min(Math.max(stepped, min), max);
  };

  useEffect(() => {
    if (trackWidth > 0) {
      lowAnim.setValue(valueToPx(lowValue.current, trackWidth));
      highAnim.setValue(valueToPx(highValue.current, trackWidth));
    }
  }, [trackWidth, min, max, step]);

  const updateLow = (newPx: number) => {
    const maxPx = valueToPx(highValue.current, trackWidth) - THUMB_RADIUS;
    const boundedPx = Math.max(0, Math.min(newPx, maxPx));
    const newVal = pxToValue(boundedPx, trackWidth);
    
    if (newVal !== lowValue.current) {
      lowValue.current = newVal;
      setCurrentLow(newVal);
      lowAnim.setValue(valueToPx(newVal, trackWidth));
    } else {
      // Just visually move thumb smoothly
      lowAnim.setValue(boundedPx);
    }
  };

  const updateHigh = (newPx: number) => {
    const minPx = valueToPx(lowValue.current, trackWidth) + THUMB_RADIUS;
    const boundedPx = Math.max(minPx, Math.min(newPx, trackWidth));
    const newVal = pxToValue(boundedPx, trackWidth);
    
    if (newVal !== highValue.current) {
      highValue.current = newVal;
      setCurrentHigh(newVal);
      highAnim.setValue(valueToPx(newVal, trackWidth));
    } else {
      highAnim.setValue(boundedPx);
    }
  };

  const lowPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        lowStartPx.current = valueToPx(lowValue.current, trackWidth);
      },
      onPanResponderMove: (e, gestureState) => {
        if (trackWidth === 0) return;
        updateLow(lowStartPx.current + gestureState.dx);
      },
      onPanResponderRelease: () => {
        lowAnim.setValue(valueToPx(lowValue.current, trackWidth));
        onValueChanged?.(lowValue.current, highValue.current);
      }
    })
  ).current;

  const highPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        highStartPx.current = valueToPx(highValue.current, trackWidth);
      },
      onPanResponderMove: (e, gestureState) => {
        if (trackWidth === 0) return;
        updateHigh(highStartPx.current + gestureState.dx);
      },
      onPanResponderRelease: () => {
        highAnim.setValue(valueToPx(highValue.current, trackWidth));
        onValueChanged?.(lowValue.current, highValue.current);
      }
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* Tooltip Row */}
      <View style={styles.tooltipRow}>
        <Text style={[styles.tooltipText, { color: colors.text }]}>{formatLabel(currentLow)}</Text>
        <Text style={[styles.tooltipText, { color: colors.text }]}>{formatLabel(currentHigh)}</Text>
      </View>

      {/* Slider Track Container */}
      <View 
        style={styles.trackContainer} 
        onLayout={(e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        <View style={[styles.backgroundTrack, { backgroundColor: colors.outline }]} />
        
        {/* Active Track */}
        {trackWidth > 0 && (
          <Animated.View
            style={[
              styles.activeTrack,
              {
                backgroundColor: colors.accent,
                left: lowAnim,
                width: Animated.subtract(highAnim, lowAnim),
              }
            ]}
          />
        )}

        {/* Thumbs */}
        {trackWidth > 0 && (
          <>
            <Animated.View
              {...lowPan.panHandlers}
              style={[
                styles.thumb,
                {
                  borderColor: colors.accent,
                  transform: [{ translateX: lowAnim }],
                }
              ]}
            >
              <View style={[styles.innerThumb, { backgroundColor: colors.accent }]} />
            </Animated.View>

            <Animated.View
              {...highPan.panHandlers}
              style={[
                styles.thumb,
                {
                  borderColor: colors.accent,
                  transform: [{ translateX: highAnim }],
                }
              ]}
            >
              <View style={[styles.innerThumb, { backgroundColor: colors.accent }]} />
            </Animated.View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: normalize(10),
  },
  tooltipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalize(16),
  },
  tooltipText: {
    fontSize: normalizeFont(14),
    fontWeight: '700',
  },
  trackContainer: {
    height: normalize(40),
    justifyContent: 'center',
    position: 'relative',
  },
  backgroundTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: normalize(6),
    borderRadius: normalize(3),
  },
  activeTrack: {
    position: 'absolute',
    height: normalize(6),
    borderRadius: normalize(3),
  },
  thumb: {
    position: 'absolute',
    width: THUMB_RADIUS * 2,
    height: THUMB_RADIUS * 2,
    borderRadius: THUMB_RADIUS,
    backgroundColor: '#fff',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    left: -THUMB_RADIUS, // Offset center
  },
  innerThumb: {
    width: THUMB_RADIUS,
    height: THUMB_RADIUS,
    borderRadius: THUMB_RADIUS / 2,
  },
});
