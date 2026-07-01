import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  ListRenderItemInfo,
  Animated,
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import ImageViewing from 'react-native-image-viewing';
import { normalize, normalizeFont } from '@theme/normalize';

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

const { width: W } = Dimensions.get('window');
const GRID_COLS = 3;
const GRID_GAP = normalize(8);
const CELL_SIZE = (W - GRID_GAP * (GRID_COLS + 1)) / GRID_COLS;

// ── Data model ───────────────────────────────────────────────────────────────
export interface GalleryImage {
  id: string;
  imageUrl: string;
  category?: string;
  uploadedBy?: string;
  isOfficial?: boolean;
  location?: string;
  caption?: string;
  createdAt?: string;
  likeCount?: number;
  userAvatar?: string;
}

// ── Grid view (3-column) ──────────────────────────────────────────────────────
interface GridViewProps {
  images: GalleryImage[];
  trekName: string;
  onClose: () => void;
  onImagePress: (index: number) => void;
}

const GridView: React.FC<GridViewProps> = ({ images, trekName, onClose, onImagePress }) => {
  const renderCell = useCallback(
    ({ item, index }: ListRenderItemInfo<GalleryImage>) => {
      const col = index % GRID_COLS;
      return (
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() => onImagePress(index)}
          style={[
            styles.gridCell,
            { marginBottom: GRID_GAP },
            col < GRID_COLS - 1 && { marginRight: GRID_GAP },
          ]}
        >
          <ImageWithSkeleton
            uri={item.imageUrl}
            priority={FastImage.priority.normal}
            style={styles.gridCellImage}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>
      );
    },
    [onImagePress],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: CELL_SIZE + GRID_GAP,
      offset: Math.floor(index / GRID_COLS) * (CELL_SIZE + GRID_GAP),
      index,
    }),
    [],
  );

  return (
    <View style={styles.gvContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />

      {/* Header */}
      <View style={styles.gvHeader}>
        <TouchableOpacity style={styles.gvCloseBtn} onPress={onClose} activeOpacity={0.8}>
          <Icon name="close" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.gvHeaderCenter}>
          {trekName ? (
            <Text style={styles.gvTitle} numberOfLines={1}>{trekName}</Text>
          ) : null}
          <Text style={styles.gvCount}>{images.length} Photos</Text>
        </View>
        <View style={{ width: normalize(40) }} />
      </View>

      {/* 3-column grid */}
      <FlatList
        data={images}
        keyExtractor={(item, i) => item.id || String(i)}
        renderItem={renderCell}
        numColumns={GRID_COLS}
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={styles.gvGrid}
        getItemLayout={getItemLayout}
      />
    </View>
  );
};

// ── Main exported viewer ──────────────────────────────────────────────────────
interface TrekGalleryViewerProps {
  images: GalleryImage[];
  isVisible: boolean;
  onClose: () => void;
  trekName?: string;
}

export const TrekGalleryViewer: React.FC<TrekGalleryViewerProps> = ({
  images,
  isVisible,
  onClose,
  trekName = '',
}) => {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const openViewer = useCallback((idx: number) => setViewerIndex(idx), []);
  const closeViewer = useCallback(() => {
    setViewerIndex(null);
    onClose(); // As requested: "Don't open grid again."
  }, [onClose]);

  // Map images for react-native-image-viewing
  const formattedImages = images.map(img => ({ uri: img.imageUrl }));

  return (
    <>
      <Modal
        isVisible={isVisible && viewerIndex === null}
        onBackdropPress={onClose}
        onBackButtonPress={onClose}
        swipeDirection="down"
        onSwipeComplete={onClose}
        propagateSwipe={true}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={300}
        animationOutTiming={250}
        backdropOpacity={1}
        backdropColor="#0D1117"
        style={{ margin: 0 }}
        statusBarTranslucent
        useNativeDriver
        hideModalContentWhileAnimating
      >
        <GridView
          images={images}
          trekName={trekName}
          onClose={onClose}
          onImagePress={openViewer}
        />
      </Modal>

      <ImageViewing
        images={formattedImages}
        imageIndex={viewerIndex || 0}
        visible={viewerIndex !== null}
        onRequestClose={closeViewer}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
        animationType="fade"
        HeaderComponent={({ imageIndex }) => (
          <View style={styles.fsHeader}>
            <TouchableOpacity style={styles.fsIconBtn} onPress={closeViewer} activeOpacity={0.8}>
              <Icon name="close" size={22} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.fsHeaderCenter}>
              <Text style={styles.fsCounter}>
                {imageIndex + 1}
                <Text style={styles.fsCounterMuted}> / {images.length}</Text>
              </Text>
              {trekName ? (
                <Text style={styles.fsTrekName} numberOfLines={1}>{trekName}</Text>
              ) : null}
            </View>
            <View style={{ width: normalize(40) }} />
          </View>
        )}
      />
    </>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Full-screen custom header
  fsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? normalize(54) : normalize(36),
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(12),
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  fsIconBtn: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fsHeaderCenter: {
    flex: 1,
    alignItems: 'center',
  },
  fsCounter: {
    color: '#FFF',
    fontSize: normalizeFont(16),
    fontWeight: '700',
  },
  fsCounterMuted: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '400',
  },
  fsTrekName: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: normalizeFont(11),
    marginTop: normalize(2),
  },

  // Grid view
  gvContainer: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  gvHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? normalize(54) : normalize(46),
    paddingBottom: normalize(20),
    paddingHorizontal: normalize(16),
    backgroundColor: '#0D1117',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  gvCloseBtn: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gvHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: normalize(8),
  },
  gvTitle: {
    color: '#FFF',
    fontSize: normalizeFont(16),
    fontWeight: '700',
    marginBottom: normalize(8),
  },
  gvCount: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: normalizeFont(9),
    fontWeight: '500',
  },
  gvGrid: {
    padding: GRID_GAP,
    paddingBottom: normalize(32),
  },
  gridCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: '#1a1a2e',
    borderRadius: normalize(14),
    overflow: 'hidden',
  },
  gridCellImage: {
    width: '100%',
    height: '100%',
  },
});
