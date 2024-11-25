import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';  // Use this for icons
import { useNavigation } from '@react-navigation/native';


export default function Product() {

  const navigation = useNavigation();

  const [products, setProducts] = useState([]);
  const [Bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [BidList, setBidList] = useState([]);

  useEffect(() => {
    setLoading(true); // Reset loading state before fetching data
    fetchBids();
    fetchProducts();

    const intervalId = setInterval(() => {
      fetchBids();
      fetchProducts();
    }, 5000); // Fetch data every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []); // Empty dependency array to run once when component mounts

  useEffect(() => {
    // Only run this after both Bids and Products are fetched
    if (Bids.length > 0 && products.length > 0) {
      BidListFunc();
    }
  }, [Bids, products]); // Runs when Bids or Products state changes

  const fetchBids = async () => {
    try {
      const response = await fetch('http://192.168.132.222:8000/api/bids/');
      const data = await response.json();
      setBids(data); // Update Bids state
    } catch (error) {
      console.error('Error fetching Bids:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://192.168.132.222:8000/api/products/');
      const data = await response.json();
      setProducts(data); // Update Products state
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false); // Ensure loading is reset after fetching data
    }
  };

  const BidListFunc = () => {
    let pro_lis = [];
    for (let i = 0; i < Bids.length; i++) {
      const pro_id = parseInt(Bids[i].product_id);
      for (let j = 0; j < products.length; j++) {
        if (products[j].id === pro_id) {
          pro_lis.push({
            ...products[j],
            current_bid: Bids[i].current_bid,
          });
        }
      }
    }
    setBidList(pro_lis);
  };

  const renderItem = ({ item }) => (
    <View style={styles.productContainer}>
      <Text style={styles.productName}>{item.name.toUpperCase()}</Text>
      <Text style={styles.productDetails}>{item.details}</Text>
      <Text style={styles.productQuality}>Quality: {item.quality + ' / 10'}</Text>
      <Text style={styles.productQuantity}>Quantity: {item.quantity + ' KG'}</Text>
      <Text style={styles.productBid}>Current Bid: {item.current_bid} INR</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Bid', { product: item })}>
        <Text style={styles.buttonText}>Bid Now</Text>
      </TouchableOpacity>
    </View>
  );

  const handleRefresh = () => {
    setLoading(true); // Set loading state when refreshing
    fetchBids();
    fetchProducts();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Products</Text>

      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <View style={styles.refreshIconContainer}>
          <Icon name="refresh-outline" size={18} color="#fff" />
        </View>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={BidList}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    marginTop: 70,
  },
  productContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productDetails: {
    fontSize: 16,
    marginTop: 5,
    color: '#555',
  },
  productQuality: {
    fontSize: 14,
    marginTop: 5,
    color: '#777',
  },
  productQuantity: {
    fontSize: 14,
    marginTop: 5,
    color: '#777',
  },
  productBid: {
    fontSize: 16,
    marginTop: 5,
    fontWeight: 'bold',
    color: 'green',
  },
  button: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  refreshButton: {
    position: 'absolute',
    top: 85,
    right: 20,
    backgroundColor: '#007bff',
    padding: 10,
    paddingTop: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  refreshIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
