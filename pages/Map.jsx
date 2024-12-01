import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';

const MapScreen = () => {
  const [routeData, setRouteData] = useState(null);
  const [haltPositions, setHaltPositions] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [decodedCoordinates, setDecodedCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null); // Reference to the MapView for centering

  const secondApiUrl = 'http://192.168.32.222:8000/api/routes/1/';
  const firstApiUrl = 'http://192.168.32.222:8000/routes/get-route/';

  const fetchRoute = async () => {
    try {
      setLoading(true);
      // Fetch source, destination, current location, and halt positions
      const response = await axios.get(secondApiUrl);
      const { source, destination, current_location, halt } = response.data;

      if (!source || !destination || !current_location || !halt) {
        throw new Error('Incomplete data from second API');
      }

      setCurrentLocation({
        latitude: parseFloat(current_location.lat),
        longitude: parseFloat(current_location.lon),
      });

      setHaltPositions(
        halt.data.map((h) => ({
          latitude: parseFloat(h.lat),
          longitude: parseFloat(h.lon),
        }))
      );

      // Fetch route data
      const routeResponse = await axios.post(firstApiUrl, {
        coordinates: [
          [parseFloat(current_location.lon), parseFloat(current_location.lat)],
          [parseFloat(destination.lon), parseFloat(destination.lat)],
        ],
      });

      const route = routeResponse.data.routes[0];
      if (!route) throw new Error('No route found');

      setRouteData(route);
      setDecodedCoordinates(decodePolyline(route.geometry));
    } catch (error) {
      console.error('Error fetching route data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeLocation = async () => {
    try {
      const response = await axios.get(secondApiUrl);
      const { current_location } = response.data;

      if (current_location) {
        const updatedLocation = {
          latitude: parseFloat(current_location.lat),
          longitude: parseFloat(current_location.lon),
        };

        setCurrentLocation(updatedLocation);

        // Center the map on the updated location
        mapRef.current.animateCamera({
          center: updatedLocation,
          zoom: 15,
        });
      }
    } catch (error) {
      console.error('Error fetching real-time location:', error);
    }
  };

  useEffect(() => {
    fetchRoute();

    // Polling for real-time location every 5 seconds
    const intervalId = setInterval(fetchRealTimeLocation, 5000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Current Location Marker */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Current Location"
            pinColor="blue"
          />
        )}
        {/* Route Line */}
        <Polyline coordinates={decodedCoordinates} strokeColor="blue" strokeWidth={4} />
        {/* Halt Markers */}
        {haltPositions.map((halt, index) => (
          <Marker
            key={index}
            coordinate={halt}
            title={`Halt ${index + 1}`}
            pinColor="orange"
          />
        ))}
      </MapView>
      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={fetchRoute}>
        <Text style={styles.refreshButtonText}>Refresh Route</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Helper function to decode polyline
const decodePolyline = (polyline) => {
  let points = [];
  let index = 0,
    len = polyline.length;
  let lat = 0,
    lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = polyline.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = polyline.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MapScreen;
