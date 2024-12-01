import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';

import Home from './pages/Home';
import Profile from './pages/profile.jsx';
import Product from './pages/product.jsx';
import Bid from './pages/Bid.jsx';
import Login from './pages/login.jsx';

import { LoginStatus } from './globals';
import TrackMe from './pages/trackme.jsx';
import MapScreen from './pages/Map.jsx';
import MyOrder from './pages/myorder.jsx';
import PreOrder from './pages/preorder.jsx';

const Tab = createBottomTabNavigator();
const ProductStack = createStackNavigator();
const HomeStack = createStackNavigator();

function ProductStackNavigator() {
  return (
    <ProductStack.Navigator screenOptions={{ headerShown: false }}>
      <ProductStack.Screen name="Product" component={Product} />
      <ProductStack.Screen name="Bid" component={Bid} />
    </ProductStack.Navigator>
  );
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={Home} />
      <HomeStack.Screen name="TrackMe" component={TrackMe} />
      <HomeStack.Screen name="Map" component={MapScreen} />
      <HomeStack.Screen name="MyOrder" component={MyOrder}/> 
      <HomeStack.Screen name="PreOrder" component={PreOrder}/> 
    </HomeStack.Navigator>
  );
}

export default function App() {

  // ++++++++++ TESTING AREA +++++++++++++++


  // +++++++++++++++++++++++++++++++++++++++
  const [isLoggedIn, setIsLoggedIn] = useState(LoginStatus.Login);
  const [watcher, setWatcher] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLoggedIn(LoginStatus.Login);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Start location tracking when role is 'driver' and status is 'start'
    const startWatchingLocation = async () => {
      console.log("Started Tracking...")
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission denied');
        return;
      }

      const watcherId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // 5 seconds
          distanceInterval: 10, // 10 meters
        },
        async (loc) => {
          const { latitude, longitude } = loc.coords;
          console.log('Updated location:', { latitude, longitude });

          // Post location to the server
          try {
            const response = await fetch('http://192.168.32.222:8000/api/routes/1/', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                current_location: {
                  lat: latitude.toString(),
                  lon: longitude.toString(),
                },
              }),
            });
            console.log('Location posted !');
          } catch (error) {
            console.error('Failed to post location:', error);
          }
        }
      );

      setWatcher(watcherId);
    };
    const stopWatchingLocation = () => {
      if (watcher) {
        watcher.remove();
        setWatcher(null);
        console.log('Location tracking stopped');
      }
    };

    if (LoginStatus.Data.role === 'driver') {
      startWatchingLocation();
    } else {
      stopWatchingLocation();
    }

    return () => stopWatchingLocation();
  }, [LoginStatus]);

  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: '#007bff' },
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#ccc',
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Product') {
              iconName = focused ? 'cart' : 'cart-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStackNavigator} />
        <Tab.Screen name="Product" component={ProductStackNavigator} />
        <Tab.Screen name="Profile" component={Profile} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
