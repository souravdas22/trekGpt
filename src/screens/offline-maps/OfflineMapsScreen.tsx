import { useMemo } from 'react';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Switch,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';

interface MapRegion {
  id: string;
  name: string;
  size: string;
  downloaded: boolean;
  downloading: boolean;
  progress: number;
  image: any;
}

const MAP_REGIONS: MapRegion[] = [
  {
    id: '1',
    name: 'Chamonix Area',
    size: '245 MB',
    downloaded: false,
    downloading: false,
    progress: 0,
    image: require('@assets/images/fallback_trek.jpg'),
  },
  {
    id: '2',
    name: 'Mont Blanc Region',
    size: '912 MB',
    downloaded: false,
    downloading: false,
    progress: 0,
    image: require('@assets/images/fallback_trek.jpg'),
  },
  {
    id: '3',
    name: 'Swiss Alps',
    size: '389 MB',
    downloaded: false,
    downloading: false,
    progress: 0,
    image: require('@assets/images/fallback_trek.jpg'),
  },
  {
    id: '4',
    name: 'French Alps',
    size: '415 MB',
    downloaded: false,
    downloading: false,
    progress: 0,
    image: require('@assets/images/fallback_trek.jpg'),
  },
];

interface OfflineMapsScreenProps {
  navigation?: any;
}

export const OfflineMapsScreen = ({ navigation }: OfflineMapsScreenProps) => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [regions, setRegions] = useState<MapRegion[]>(MAP_REGIONS);
  const [autoUpdate, setAutoUpdate] = useState(true);

  const handleDownload = (id: string) => {
    setRegions(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        if (r.downloaded) return { ...r, downloaded: false, progress: 0 };
        return { ...r, downloading: true, progress: 0 };
      }),
    );

    // Simulate download progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setRegions(prev =>
        prev.map(r => {
          if (r.id !== id) return r;
          if (progress >= 100) {
            clearInterval(interval);
            return { ...r, downloading: false, downloaded: true, progress: 100 };
          }
          return { ...r, progress };
        }),
      );
    }, 200);
  };

  const downloadedCount = regions.filter(r => r.downloaded).length;
  const totalSize = regions
    .filter(r => r.downloaded)
    .reduce((acc, r) => acc + parseFloat(r.size), 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}
        >
          <Icon name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offline Maps</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Subtitle ── */}
        <Text style={styles.subtitle}>Download maps for offline use</Text>

        {/* ── Storage Info ── */}
        {downloadedCount > 0 && (
          <View style={styles.storageCard}>
            <View style={styles.storageIconWrap}>
              <Icon name="map-outline" size={20} color={colors.accent} />
            </View>
            <View style={styles.storageInfo}>
              <Text style={styles.storageTitle}>
                {downloadedCount} region{downloadedCount > 1 ? 's' : ''} downloaded
              </Text>
              <Text style={styles.storageSub}>
                {totalSize.toFixed(0)} MB used
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                setRegions(prev =>
                  prev.map(r => ({ ...r, downloaded: false, progress: 0 })),
                )
              }
              activeOpacity={0.8}
            >
              <Text style={styles.clearText}>Clear all</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Map List ── */}
        <View style={styles.listContainer}>
          {regions.map((region) => {
            return (
              <TouchableOpacity 
                key={region.id}
                style={styles.regionCard}
                activeOpacity={0.9}
                onPress={() => handleDownload(region.id)}
              >
                <View style={styles.regionRow}>
                  {/* Thumbnail */}
                  <View style={styles.thumbnailWrap}>
                    <Image source={region.image} style={styles.thumbnail} />
                  </View>

                  {/* Info */}
                  <View style={styles.regionInfo}>
                    <Text style={styles.regionName}>{region.name}</Text>
                    <Text style={styles.regionSize}>{region.size}</Text>
                    {region.downloading && (
                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${region.progress}%` },
                          ]}
                        />
                      </View>
                    )}
                  </View>

                  {/* Action */}
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      region.downloaded && styles.actionBtnDownloaded,
                      region.downloading && styles.actionBtnDownloading,
                    ]}
                    onPress={() => handleDownload(region.id)}
                    activeOpacity={0.8}
                  >
                    {region.downloaded ? (
                      <Icon name="check" size={18} color={colors.accent} />
                    ) : region.downloading ? (
                      <Icon name="dots-horizontal" size={18} color={colors.accent} />
                    ) : (
                      <Icon name="download-outline" size={18} color={colors.accent} />
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Auto Update Toggle ── */}
        <View style={styles.toggleCard}>
          <Text style={styles.toggleLabel}>Auto Update Maps</Text>
          <Switch
            value={autoUpdate}
            onValueChange={setAutoUpdate}
            trackColor={{ false: '#2D333B', true: colors.accent }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#2D333B"
          />
        </View>
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
  headerRightPlaceholder: {
    width: normalize(44),
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: normalize(22),
    paddingBottom: normalize(40),
  },

  // Subtitle
  subtitle: {
    color: colors.muted,
    fontSize: normalizeFont(14),
    fontWeight: '500',
    marginBottom: normalize(20),
  },

  // Storage Card
  storageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: '#2A3520',
    padding: normalize(14),
    marginBottom: normalize(20),
    gap: normalize(12),
  },
  storageIconWrap: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(12),
    backgroundColor: '#1C2A1C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storageInfo: {
    flex: 1,
    gap: normalize(2),
  },
  storageTitle: {
    color: colors.text,
    fontSize: normalizeFont(14),
    fontWeight: '700',
  },
  storageSub: {
    color: colors.muted,
    fontSize: normalizeFont(12),
  },
  clearText: {
    color: '#EF4444',
    fontSize: normalizeFont(13),
    fontWeight: '700',
  },

  // List
  listContainer: {
    gap: normalize(16),
    marginBottom: normalize(24),
  },
  regionCard: {
    backgroundColor: colors.surface,
    borderRadius: normalize(20),
    paddingHorizontal: normalize(16),
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(16),
    gap: normalize(14),
  },

  // Thumbnail
  thumbnailWrap: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    resizeMode: 'cover',
  },

  // Region Info
  regionInfo: {
    flex: 1,
    gap: normalize(4),
  },
  regionName: {
    color: colors.text,
    fontSize: normalizeFont(15),
    fontWeight: '700',
  },
  regionSize: {
    color: colors.muted,
    fontSize: normalizeFont(13),
  },

  // Progress Bar
  progressBarBg: {
    height: normalize(3),
    borderRadius: normalize(2),
    backgroundColor: colors.outline,
    marginTop: normalize(4),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: normalize(3),
    borderRadius: normalize(2),
    backgroundColor: colors.accent,
  },

  // Action Button
  actionBtn: {
    width: normalize(38),
    height: normalize(38),
    borderRadius: normalize(19),
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: '#1C2A1C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnDownloaded: {
    backgroundColor: '#1C2A1C',
    borderColor: colors.accent,
  },
  actionBtnDownloading: {
    borderColor: '#484F58',
    backgroundColor: 'transparent',
  },

  // Toggle
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: normalize(20),
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(18),
  },
  toggleLabel: {
    color: colors.text,
    fontSize: normalizeFont(15),
    fontWeight: '700',
  },
});
