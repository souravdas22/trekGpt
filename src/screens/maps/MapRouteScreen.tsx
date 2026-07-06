import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker, Polyline, UrlTile, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';

const { width: W, height: H } = Dimensions.get('window');



interface MapRouteScreenProps {
  navigation?: any;
  route?: any;
}

// Map style for dark/terrain look
const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] }
];

const SANDAKPHU_ROUTE = [
  { latitude: 27.0504, longitude: 88.1340 }, // Manebhanjan
  { latitude: 27.0371, longitude: 88.1215 }, // Chitrey
  { latitude: 27.0298, longitude: 88.0935 }, // Meghma
  { latitude: 27.0345, longitude: 88.0772 }, // Tonglu
  { latitude: 27.0270, longitude: 88.0827 }, // Tumling
  { latitude: 27.0514, longitude: 88.0375 }, // Gairibas
  { latitude: 27.0858, longitude: 88.0163 }, // Kalipokhri
  { latitude: 27.1049, longitude: 88.0016 }, // Sandakphu
  { latitude: 27.1706, longitude: 88.0202 }, // Phalut
  { latitude: 27.1592, longitude: 88.0436 }, // Gorkhey
  { latitude: 27.1264, longitude: 88.0829 }, // Srikhola
  { latitude: 27.1146, longitude: 88.1065 }, // Rimbick
];

const DEFAULT_REGION = {
  latitude: 27.1049,
  longitude: 88.0016,
  latitudeDelta: 0.25,
  longitudeDelta: 0.25,
};

const DEFAULT_TREKKERS = [
  { id: '1', isUser: true, coordIdx: 6, bg: '#A3E635' },
  { id: '2', isUser: false, coordIdx: 8, bg: '#EAB308' },
  { id: '3', isUser: false, coordIdx: 4, bg: '#3B82F6' },
];

const DEFAULT_CHECKPOINTS = [
  { id: 'cp-0', coordIdx: 0, title: 'Start', day: 'Day 1' },
  { id: 'cp-1', coordIdx: 4, title: 'Tumling', day: 'Day 1' },
  { id: 'cp-2', coordIdx: 6, title: 'Kalipokhri', day: 'Day 2' },
  { id: 'cp-3', coordIdx: 7, title: 'Sandakphu', day: 'Day 3' },
  { id: 'cp-4', coordIdx: 8, title: 'Phalut', day: 'Day 4' },
  { id: 'cp-5', coordIdx: 9, title: 'Gorkhey', day: 'Day 5' },
  { id: 'cp-6', coordIdx: 10, title: 'Srikhola', day: 'Day 6' },
];

export const MapRouteScreen = ({ navigation, route }: MapRouteScreenProps) => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const { trekRoute = SANDAKPHU_ROUTE, trekkers = DEFAULT_TREKKERS, checkpoints = DEFAULT_CHECKPOINTS, initialRegion = null } = route?.params || {};

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  // Default region if not passed
  const mapRegion = initialRegion || DEFAULT_REGION;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── React Native MapView ── */}
      <MapView
        style={styles.mapBg}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyle}
        initialRegion={mapRegion}
        showsUserLocation={false}
        showsCompass={false}
      >
        {/* Dotted Route Line */}
        <Polyline
          coordinates={trekRoute}
          strokeColor="#EAB308"
          strokeWidth={4}
          lineDashPattern={[6, 8]}
        />

        {/* ── Checkpoints ── */}
        {checkpoints.map((cp: any) => {
          const coord = trekRoute[cp.coordIdx];
          if (!coord) return null;
          return (
            <Marker key={cp.id} coordinate={coord} anchor={{ x: 0.5, y: 1 }} zIndex={2}>
              <View style={styles.checkpointMarker}>
                <View style={styles.checkpointLabel}>
                  <Text style={styles.checkpointDay}>{cp.day}</Text>
                  <Text style={styles.checkpointTitle}>{cp.title}</Text>
                </View>
                <View style={styles.checkpointDot} />
              </View>
            </Marker>
          );
        })}

        {/* ── Trekker Avatar Pins ── */}
        {trekkers.map((trekker: any) => {
          const coord = trekRoute[trekker.coordIdx];
          if (!coord) return null;
          
          if (trekker.isUser) {
            return (
              <Marker key={trekker.id} coordinate={coord} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={styles.youMarkerWrapper}>
                  <Animated.View style={[styles.youPulse, { transform: [{ scale: pulseAnim }] }]} />
                  <View style={styles.youPin}>
                    <View style={styles.youDot} />
                  </View>
                </View>
              </Marker>
            );
          }

          return (
            <Marker key={trekker.id} coordinate={coord} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.avatarPin}>
                <View style={[styles.avatarBubble, { backgroundColor: trekker.bg }]}>
                  <Icon name="account" size={20} color="#FFF" style={{ opacity: 0.8 }} />
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Optional: Tint overlay to dim the map slightly behind the UI */}
      <View style={styles.mapTint} pointerEvents="none" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}
        >
          <Icon name="chevron-left" size={24} color="#EAB308" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Route Map</Text>

        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
          <Icon name="magnify" size={22} color="#EAB308" />
        </TouchableOpacity>
      </View>

      {/* ── Right Floating Controls ── */}
      <View style={styles.sideControls}>
        <TouchableOpacity style={styles.sideBtn} activeOpacity={0.8}>
          <Icon name="layers-outline" size={22} color="#EAB308" />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSideControls}>
        <TouchableOpacity style={styles.sideBtn} activeOpacity={0.8}>
          <Text style={styles.sideBtnText}>3D</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sideBtn} activeOpacity={0.8}>
          <Icon name="image-filter-center-focus" size={22} color="#EAB308" />
        </TouchableOpacity>
      </View>

      {/* ── Bottom Info Panel ── */}
      <View style={styles.infoPanel}>
        <View style={styles.cardsRow}>
          {/* Card 1: Next Checkpoint */}
          <View style={styles.infoCard}>
            <View style={styles.cardLeftIcon}>
              <Icon name="target" size={16} color="#0D1117" />
            </View>
            <View style={styles.cardTextCol}>
              <Text style={styles.cardSub}>Next Checkpoint</Text>
              <Text style={styles.cardValue}>2.4 km</Text>
              <Text style={styles.cardSub}>Charlie's Camp</Text>
            </View>
          </View>

          {/* Card 2: Altitude */}
          <View style={styles.infoCard}>
            <View style={[styles.cardTextCol, { alignItems: 'center', width: '100%' }]}>
              <Text style={styles.cardSub}>Altitude</Text>
              <Text style={styles.cardValue}>2,600</Text>
              <Text style={styles.cardSub}>2,860 m</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const getStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Map
  mapBg: {
    width: W,
    height: H * 0.75,
  },
  mapTint: {
    ...StyleSheet.absoluteFill,
    height: H * 0.75,
    backgroundColor: 'rgba(0,10,0,0.15)', // Very light tint so it doesn't obscure the real map too much
  },

  // Header
  header: {
    position: 'absolute',
    top: normalize(0),
    left: normalize(0),
    right: normalize(0),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(20),
    paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28) + 10,
    zIndex: 10,
    elevation: 10,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: normalizeFont(18),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerBtn: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(22),
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Side controls
  sideControls: {
    position: 'absolute',
    right: normalize(20),
    top: H * 0.75 * 0.25,
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
  },
  bottomSideControls: {
    position: 'absolute',
    right: normalize(20),
    bottom: H * 0.25 + 40,
    alignItems: 'center',
    gap: normalize(12),
    zIndex: 10,
    elevation: 10,
  },
  sideBtn: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(22),
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideBtnText: {
    color: '#EAB308',
    fontSize: normalizeFont(15),
    fontWeight: '800',
  },

  // Avatar pins
  avatarPin: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    backgroundColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBubble: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    borderWidth: 2,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  // Checkpoints
  checkpointMarker: {
    alignItems: 'center',
    marginBottom: normalize(4),
  },
  checkpointLabel: {
    backgroundColor: 'rgba(13, 17, 23, 0.85)',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    marginBottom: normalize(4),
  },
  checkpointDay: {
    color: '#EAB308',
    fontSize: normalizeFont(10),
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  checkpointTitle: {
    color: '#FFF',
    fontSize: normalizeFont(12),
    fontWeight: '600',
  },
  checkpointDot: {
    width: normalize(12),
    height: normalize(12),
    borderRadius: normalize(6),
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#EAB308',
  },

  // You marker
  youMarkerWrapper: {
    width: normalize(60),
    height: normalize(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
  youPulse: {
    position: 'absolute',
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    backgroundColor: 'rgba(163,230,53,0.3)',
  },
  youPin: {
    width: normalize(28),
    height: normalize(28),
    backgroundColor: 'rgba(255,255,255,0.2)', // glow
    borderRadius: normalize(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  youDot: {
    width: normalize(20),
    height: normalize(20),
    borderRadius: normalize(10),
    backgroundColor: '#A3E635',
    borderWidth: 3,
    borderColor: '#0D1117',
  },

  // Info panel
  infoPanel: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: normalize(20),
    paddingTop: normalize(24),
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    zIndex: 5,
    elevation: 5,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: normalize(16),
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: normalize(20),
    padding: normalize(16),
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLeftIcon: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    backgroundColor: '#A3E635',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
  },
  cardTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  cardSub: {
    color: colors.muted,
    fontSize: normalizeFont(12),
    fontWeight: '500',
    marginBottom: normalize(2),
  },
  cardValue: {
    color: colors.text,
    fontSize: normalizeFont(22),
    fontWeight: '800',
    marginBottom: normalize(2),
  },
});
