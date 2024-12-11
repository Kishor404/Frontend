import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';
import apiData from './data.json';
import { LoginStatus } from "../globals";

const { width, height } = Dimensions.get('window');

// Replace with your OpenRouteService API key
const OPENROUTESERVICE_API_KEY = '5b3ce3597851110001cf62487243b358f4c9427986c9ac997c5c079c';
// Replace with your OpenWeatherMap API key
const OPENWEATHERMAP_API_KEY = '93bbcc818bb29ee5096c30520e99e127';

const MapScreen = () => {
  const [routeData, setRouteData] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routeId, setRouteId] = useState(null);
  const [remainingDistance, setRemainingDistance] = useState(0);
  const [weather, setWeather] = useState(null);

  const fetchShipments = async () => {
    try {
      const response = await axios.get(`${apiData.api}/api/shipment/`);
      const shipments = response.data;

      const filteredShipments = shipments.filter(
        shipment =>
          ['seller_id', 'driver_id', 'buyer_id'].some(
            role => shipment[role] === LoginStatus.Data.id.toString()
          ) && shipment.status === 'OP'
      );

      if (filteredShipments.length) {
        setRouteId(filteredShipments[0].route_id);
      } else {
        setError('The Shipment Was Not Begin');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to fetch shipments.');
      setLoading(false);
    }
  };

  const fetchRouteData = async () => {
    if (!routeId) return;

    try {
      const response = await axios.get(`${apiData.api}/api/routes/${routeId}/`);
      const data = response.data;

      setRouteData(data);
      setCurrentLocation(data.current_location);
      await fetchOptimalPath(data.current_location, data.destination);
    } catch (err) {
      setError('Failed to fetch route data.');
    }
  };

  const fetchOptimalPath = async (source, destination) => {
    if (!source || !destination) {
      setError('Source or destination coordinates are missing.');
      return;
    }

    try {
      const response = await axios.get(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${OPENROUTESERVICE_API_KEY}&start=${source.lon},${source.lat}&end=${destination.lon},${destination.lat}`
      );

      const coordinates = response.data.features[0].geometry.coordinates.map(coord => ({
        latitude: coord[1],
        longitude: coord[0],
      }));

      setRouteCoordinates(coordinates);
      setRemainingDistance(response.data.features[0].properties.segments[0].distance);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch optimal path.');
      console.log(err);
      setLoading(false);
    }
  };

  const fetchWeatherData = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`
      );
      setWeather(response.data);
    } catch (err) {
      console.log('Failed to fetch weather data:', err);
    }
  };

  const patchRemainingDistance = async () => {
    if (remainingDistance <= 0) {
      console.log('Remaining distance is zero or negative, no need to update');
      return;
    }

    try {
      const response = await axios.patch(`${apiData.api}/api/devices/1/`, {
        remaining_distance: remainingDistance,
      });

      console.log('Remaining distance updated successfully:', response.data);
    } catch (err) {
      console.log('Error updating remaining distance:', err);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  useEffect(() => {
    if (routeId) fetchRouteData();
  }, [routeId]);

  useEffect(() => {
    if (currentLocation) {
      fetchWeatherData(currentLocation.lat, currentLocation.lon);
    }
  }, [currentLocation]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchShipments();
      fetchRouteData();
      patchRemainingDistance();
    }, 5000);

    return () => clearInterval(interval);
  }, [routeId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: Number(currentLocation.lat),
          longitude: Number(currentLocation.lon),
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{
            latitude: Number(routeData.source.lat),
            longitude: Number(routeData.source.lon),
          }}
          title="Source"
        />
        <Marker
          coordinate={{
            latitude: Number(routeData.destination.lat),
            longitude: Number(routeData.destination.lon),
          }}
          title="Destination"
        />
        <Marker
          coordinate={{
            latitude: Number(currentLocation.lat),
            longitude: Number(currentLocation.lon),
          }}
          title="Current Location"
          pinColor="blue"
        />
        <Polyline coordinates={routeCoordinates} strokeColor="blue" strokeWidth={4} />
      </MapView>
      <View style={styles.infoContainer}>
        <Text style={styles.distanceText}>
          Remaining Distance: {(remainingDistance.toFixed(2) / 1000)} KM
        </Text>
        {weather && (
          <Text style={styles.weatherText}>
            Weather: {weather.weather[0].description}, {weather.main.temp}°C
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    width,
    height: height - 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 75,
    left: 10,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 5,
    borderLeftWidth: 6,
    borderColor: "#08B69D",
  },
  distanceText: {
    color: 'white',
    fontSize: 16,
  },
  weatherText: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
});

export default MapScreen;
