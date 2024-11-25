import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 

export default function Home() {
    const navigation = useNavigation();
    const navigateToProduct = () => {
        navigation.navigate('Product'); // Navigating to Product screen
      };
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image 
        source={require('../assets/logo.png')}
        style={styles.logo}
      />

      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Welcome to Our App!</Text>
      </View>

      {/* Two Square Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.squareButton} onPress={navigateToProduct}>
          <Text style={styles.buttonText}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.squareButton}>
          <Text style={styles.buttonText}>Button 2</Text>
        </TouchableOpacity>
      </View>

      {/* Track Me Button */}
      <TouchableOpacity style={styles.singleButton}>
        <Text style={styles.singleButtonText}>Track Me</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100, 
    marginTop: 20,
    marginBottom: 20,
  },
  banner: {
    width: '100%',
    padding: 20,
    backgroundColor: '#007bff',
    borderRadius: 10,
    marginBottom: 30,
  },
  bannerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  squareButton: {
    width: '45%',
    height: 150,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  singleButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  singleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
