import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { normalize, normalizeFont } from '@theme/normalize';
import { GalleryImage } from './TrekGalleryViewer';

const { width: W, height: H } = Dimensions.get('window');
const HERO_HEIGHT = H * 0.46 + 75;

const THUMB_GAP = normalize(8);
const THUMB_COUNT = 4;
const THUMB_W = (W - normalize(14) * 2 - THUMB_GAP * (THUMB_COUNT - 1)) / THUMB_COUNT;
const THUMB_H = (THUMB_W * 0.68) * 0.96;

interface TrekGalleryPreviewProps {
  images: GalleryImage[];
  photoCount: number;
  isSaved: boolean;
  onBack: () => void;
  onSave: () => void;
  onOpenGallery: () => void;
  accentColor?: string;
}

const ImageWithSkeleton = ({ uri, style, resizeMode, priority }: any) => {
  const [loading, setLoading] = useState(true);
  const anim = React.useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 0.8, duration: 800, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      anim.stopAnimation();
    }
  }, [loading, anim]);

  return (
    <View style={[style, { backgroundColor: '#1a1a2e' }]}>
      <FastImage
        source={{ uri, priority }}
        style={StyleSheet.absoluteFill}
        resizeMode={resizeMode}
        onLoad={() => setLoading(false)}
      />
      {loading && (
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#334155', opacity: anim }]} />
      )}
    </View>
  );
};

export const TrekGalleryPreview: React.FC<TrekGalleryPreviewProps> = ({
  images,
  photoCount,
  isSaved,
  onBack,
  onSave,
  onOpenGallery,
  accentColor = '#A3E635',
}) => {
  const [activeImage, setActiveImage] = useState<GalleryImage>(images[0]);

  const thumbImages = images.slice(1, THUMB_COUNT + 1);
  const remaining = Math.max(0, photoCount - THUMB_COUNT - 1);

  return (
    <TouchableOpacity
      activeOpacity={0.96}
      onPress={onOpenGallery}
      style={styles.hero}
    >
      {/* Background image — changes on thumb tap */}
      {activeImage ? (
        <ImageWithSkeleton
          uri={activeImage.imageUrl}
          priority={FastImage.priority.high}
          style={StyleSheet.absoluteFill}
          resizeMode={FastImage.resizeMode.cover}
        />
      ) : null}

      {/* Gradient */}
      <LinearGradient
        colors={['rgba(0,0,0,0.35)', 'transparent', 'rgba(0,0,0,0.85)', '#0D1117']}
        locations={[0, 0.4, 0.85, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* ── Top: back + save ── */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.circleBtn} onPress={onBack} activeOpacity={0.8}>
          <Icon name="chevron-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleBtn} onPress={onSave} activeOpacity={0.8}>
          <Icon
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? accentColor : '#FFF'}
          />
        </TouchableOpacity>
      </View>

      {/* ── Bottom: thumbnail strip ── */}
      {thumbImages.length > 0 && (
        <View style={styles.thumbsRow}>
          {thumbImages.map((img, idx) => {
            const isLast = idx === thumbImages.length - 1 && remaining > 0;
            const isActive = activeImage?.id === img.id;
            return (
              <TouchableOpacity
                key={img.id || idx}
                style={[styles.thumbCell, isActive && styles.thumbCellActive]}
                activeOpacity={0.8}
                onPress={e => {
                  e.stopPropagation?.();
                  if (isLast) {
                    onOpenGallery();
                  } else {
                    setActiveImage(img);
                  }
                }}
              >
                <ImageWithSkeleton
                  uri={img.imageUrl}
                  priority={FastImage.priority.normal}
                  style={StyleSheet.absoluteFill}
                  resizeMode={FastImage.resizeMode.cover}
                />
                {isLast && (
                  <View style={styles.seeAllOverlay}>
                    <Icon name="camera-outline" size={18} color="#FFF" style={{ marginBottom: normalize(4) }} />
                    <Text style={styles.seeAllCount}>+{remaining} Photos</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  hero: {
    width: W,
    height: HERO_HEIGHT,
    overflow: 'hidden',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? normalize(54) : normalize(36),
    paddingBottom: normalize(26),
    paddingHorizontal: normalize(14),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Thumbnail strip
  thumbsRow: {
    flexDirection: 'row',
    gap: THUMB_GAP,
  },
  thumbCell: {
    width: THUMB_W,
    height: THUMB_H,
    borderRadius: normalize(14),
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  thumbCellActive: {
    borderColor: '#A3E635',
  },
  seeAllOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.62)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeAllCount: {
    color: '#FFF',
    fontSize: normalizeFont(12),
    fontWeight: '700',
  },
  circleBtn: {
    width: normalize(38),
    height: normalize(38),
    borderRadius: normalize(19),
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
