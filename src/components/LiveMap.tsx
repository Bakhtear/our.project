import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity 
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Navigation, Plus, Minus } from 'lucide-react-native';

interface FleetVehicle {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface LiveMapProps {
  userRole: 'customer' | 'driver' | 'fleet_owner' | 'mechanic';
  targetLocation?: { latitude: number; longitude: number } | null;
  fleetVehiclesArray?: FleetVehicle[];
  currentLocation?: { latitude: number; longitude: number }; 
}

export default function LiveMap({ userRole, targetLocation, fleetVehiclesArray, currentLocation: propCurrentLocation }: LiveMapProps) {
  
  const mapRef = useRef<MapView | null>(null);
  const [internalCurrentLocation, setInternalCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(propCurrentLocation || null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [mapRegion, setMapRegion] = useState({
    latitude: propCurrentLocation?.latitude || 23.8103, 
    longitude: propCurrentLocation?.longitude || 90.4125, 
    latitudeDelta: 0.015,
    longitudeDelta: 0.012,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('লোকেশন পারমিশন দেওয়া হয়নি!');
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const coords = { 
        latitude: location.coords.latitude, 
        longitude: location.coords.longitude 
      };

      setInternalCurrentLocation(coords);
      setMapRegion(prev => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
    })();
  }, []);

  const handleZoom = (isZoomIn: boolean) => {
    if (mapRef.current) {
      const newLatitudeDelta = isZoomIn ? mapRegion.latitudeDelta / 2 : mapRegion.latitudeDelta * 2;
      const newLongitudeDelta = isZoomIn ? mapRegion.longitudeDelta / 2 : mapRegion.longitudeDelta * 2;
      
      const updatedRegion = {
        ...mapRegion,
        latitudeDelta: newLatitudeDelta,
        longitudeDelta: newLongitudeDelta,
      };

      setMapRegion(updatedRegion);
      mapRef.current.animateToRegion(updatedRegion, 400);
    }
  };

  const currentLoc = internalCurrentLocation || propCurrentLocation;

  return (
    <View style={styles.cardContainer}>
      {mapRegion.latitude && mapRegion.longitude ? ( 
        <View style={styles.mapWrapper}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            customMapStyle={darkMapStyle}
            initialRegion={mapRegion}
            onRegionChangeComplete={(region) => setMapRegion(region)}
            showsUserLocation={true}
          >
            {currentLoc && (
              <Marker
                coordinate={{ latitude: currentLoc.latitude, longitude: currentLoc.longitude }}
                title="আপনার অবস্থান"
                pinColor="#38BDF8"
              />
            )}

            {targetLocation && currentLoc && (
              <>
                <Marker coordinate={targetLocation} title="গন্তব্য স্থান" pinColor="#EF4444" />
                <Polyline
                  coordinates={[
                    { latitude: currentLoc.latitude, longitude: currentLoc.longitude },
                    targetLocation
                  ]}
                  strokeColor="#38BDF8"
                  strokeWidth={4}
                />
              </>
            )}

            {userRole === 'fleet_owner' && fleetVehiclesArray && fleetVehiclesArray.map((vehicle) => (
              <Marker
                key={vehicle.id}
                coordinate={{ latitude: vehicle.latitude, longitude: vehicle.longitude }}
                title={vehicle.name}
              >
                <Navigation size={26} color="#10B981" style={{ transform: [{ rotate: '45deg' }] }} />
              </Marker>
            ))}
          </MapView>

          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.controlButton} onPress={() => handleZoom(true)}>
              <Plus size={18} color="#38BDF8" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlButton, { marginTop: 8 }]} onPress={() => handleZoom(false)}>
              <Minus size={18} color="#38BDF8" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.loadingBox}>
          <Text style={{ color: '#38BDF8', fontWeight: 'bold' }}>ম্যাপ লোড হচ্ছে...</Text>
          {errorMsg && <Text style={{ color: '#EF4444', marginTop: 10 }}>{errorMsg}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: { height: 300, borderRadius: 24, overflow: 'hidden', backgroundColor: '#0B0F19', marginHorizontal: 16, marginTop: 10, borderWidth: 1, borderColor: '#1E293B' },
  mapWrapper: { flex: 1, position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },
  loadingBox: { height: 300, justifyContent: 'center', alignItems: 'center' },
  zoomControls: { position: 'absolute', left: 15, top: 15 },
  controlButton: { backgroundColor: '#1E293B', padding: 8, borderRadius: 20, borderWidth: 1, borderColor: '#38BDF8', alignItems: 'center', justifyContent: 'center' },
});

const darkMapStyle: any[] = [
  { "elementType": "geometry", "stylers": [{ "color": "#0B0F19" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1F2937" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#111827" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9CA3AF" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#111E2E" }] }
];