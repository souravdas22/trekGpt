import { useMemo } from 'react';
import React, { useState, useRef, useEffect } from 'react';
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
import MapView, { Marker, Polyline, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';

const { width: W, height: H } = Dimensions.get('window');

// ── Real coordinates for a Trek Route (approx. Aiguille du Midi trail) ──
const ROUTE_COORDS = [
  { latitude: 45.9237, longitude: 6.8694 }, // Chamonix Start
  { latitude: 45.9180, longitude: 6.8720 },
  { latitude: 45.9120, longitude: 6.8760 },
  { latitude: 45.9050, longitude: 6.8820 }, // Checkpoint
  { latitude: 45.8980, longitude: 6.8840 },
  { latitude: 45.8900, longitude: 6.8850 },
  { latitude: 45.8820, longitude: 6.8860 },
  { latitude: 45.8790, longitude: 6.8870 }, // Aiguille du Midi
];

// ── Trekkers on route (mapping to route indices) ──
const TREKKERS = [
  { id: 'you', coordIdx: 7, isUser: true },
  { id: 't1', coordIdx: 1, bg: '#F97316' },
  { id: 't2', coordIdx: 3, bg: '#38BDF8' },
  { id: 't3', coordIdx: 5, bg: '#EF4444' },
  { id: 't4', coordIdx: 6, bg: '#A855F7' },
];

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

export const MapRouteScreen = ({ navigation }: MapRouteScreenProps) => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── React Native MapView ── */}
      <MapView
        style={styles.mapBg}
        provider={PROVIDER_DEFAULT}
        mapType="none"
        initialRegion={{
          latitude: 45.9050,
          longitude: 6.8780,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
        showsUserLocation={false}
        showsCompass={false}
      >
        <UrlTile
          urlTemplate="https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
          maximumZ={19}
          shouldReplaceMapContent={true}
        />
        {/* Dotted Route Line */}
        <Polyline
          coordinates={ROUTE_COORDS}
          strokeColor="#EAB308"
          strokeWidth={4}
          lineDashPattern={[6, 8]}
        />

        {/* ── Trekker Avatar Pins ── */}
        {TREKKERS.map(trekker => {
          const coord = ROUTE_COORDS[trekker.coordIdx];
          
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
