import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Home from './pages/Home';
import Profile from './pages/profile.jsx';
import Product from './pages/product.jsx';
import Bid from './pages/Bid.jsx';
import Login from './pages/login.jsx';

import { LoginStatus } from './globals';

const Tab = createBottomTabNavigator();
const ProductStack = createStackNavigator();

function ProductStackNavigator() {
  return (
    <ProductStack.Navigator screenOptions={{ headerShown: false }}>
      <ProductStack.Screen name="Product" component={Product} />
      <ProductStack.Screen name="Bid" component={Bid} />
    </ProductStack.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(LoginStatus.Login);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLoggedIn(LoginStatus.Login);
    }, 100);
    return () => clearInterval(interval);
  }, []);

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
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Product" component={ProductStackNavigator} />
        <Tab.Screen name="Profile" component={Profile} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
