import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';

export default function Bid({ route, navigation }) {
  const { product } = route.params; // Product details passed from product.jsx
  const [bidAmount, setBidAmount] = useState('');

  const handleBidSubmit = async () => {
    if (!bidAmount || isNaN(bidAmount) || parseFloat(bidAmount) <= product.current_bid) {
      Alert.alert('Invalid Bid', 'Please enter a valid bid amount higher than the current bid.');
      return;
    }

    try {
      const response = await fetch('http://192.168.132.222:8000/api/bids/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          bid_amount: parseFloat(bidAmount),
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Your bid has been placed!');
        navigation.goBack(); // Navigate back to Product screen
      } else {
        Alert.alert('Error', 'Failed to place the bid. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting bid:', error);
      Alert.alert('Error', 'Failed to place the bid. Please check your connection.');
    }
  };

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.titletext}>Bidding Place</Text>
        </View>
      <Text style={styles.title}>{product.name.toUpperCase()}</Text>
      <Text style={styles.detail}>Current Bid: {product.current_bid} INR</Text>
      <Text style={styles.detail}>Details: {product.details}</Text>
      <Text style={styles.detail}>Quality: {product.quality} / 10</Text>
      <Text style={styles.detail}>Quantity: {product.quantity} KG</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your bid amount"
        keyboardType="numeric"
        value={bidAmount}
        onChangeText={setBidAmount}
      />

      <TouchableOpacity style={styles.button} onPress={handleBidSubmit}>
        <Text style={styles.buttonText}>Submit Bid</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header:{
    width:'100%',
    height:20,
    backgroundColor:'red',
  },
  titletext:{
    color:'black',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detail: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
