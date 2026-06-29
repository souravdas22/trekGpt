import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LocationCoordinate } from '../../services/maps/map.service';

interface TrekMapProps {
  routeCoordinates?: LocationCoordinate[];
  baseCamp?: LocationCoordinate;
  markers?: { coordinate: LocationCoordinate; title: string; description?: string }[];
  style?: ViewStyle;
  strokeColor?: string;
  strokeWidth?: number;
}

export const TrekMap: React.FC<TrekMapProps> = ({
  routeCoordinates = [],
  baseCamp,
  markers = [],
  style,
  strokeColor = '#FF5722', // Deep orange for visibility
  strokeWidth = 4,
}) => {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    // Automatically fit the map to the route coordinates when they change
    if (routeCoordinates && routeCoordinates.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(routeCoordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    } else if (baseCamp && mapRef.current) {
      // If no route but base camp exists, center on base camp
      mapRef.current.animateToRegion({
        latitude: baseCamp.latitude,
        longitude: baseCamp.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [routeCoordinates, baseCamp]);

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: baseCamp ? baseCamp.latitude : (routeCoordinates[0]?.latitude || 27.7172), // Default to Kathmandu if nothing
          longitude: baseCamp ? baseCamp.longitude : (routeCoordinates[0]?.longitude || 85.3240),
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            lineDashPattern={[1]} // solid line, but helps rendering in some versions
          />
        )}

        {baseCamp && (
          <Marker
            coordinate={baseCamp}
            title="Base Camp"
            description="Starting point of the trek"
            pinColor="green" // Distinct color for base camp
          />
        )}

        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            pinColor="red"
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12, // Nice rounded corners for UI integration
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
});
