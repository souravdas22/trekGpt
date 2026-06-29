import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Based on iPhone 11 Pro scale (375x812)
const wscale = SCREEN_WIDTH / 375;
const hscale = SCREEN_HEIGHT / 812;

export function normalize(size: number, based: 'width' | 'height' = 'width') {
  const newSize = based === 'height' ? size * hscale : size * wscale;
  if (Platform.OS === 'ios') {
    return Math.max(1, Math.round(PixelRatio.roundToNearestPixel(newSize)));
  } else {
    return Math.max(1, Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2);
  }
}

export function normalizeFont(size: number) {
  const newSize = size * wscale;
  if (Platform.OS === 'ios') {
    return Math.max(1, Math.round(PixelRatio.roundToNearestPixel(newSize)));
  } else {
    return Math.max(1, Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1);
  }
}
