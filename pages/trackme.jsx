import React, { useState } from 'react';
import { LoginStatus,setLoginStatus } from '../globals';
import { View, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';


export default function TrackMe() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState(1);
  const [productName, setProductName] = useState('');
  const [productDetails, setProductDetails] = useState('');
  const [productQuality, setProductQuality] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [driverId, setDriverId] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [driverInfo, setDriverInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);

  // =========== POST ============

  const postProductDetails = async () => {
    try {
      const payload = {
        name: productName,
        details: productDetails,
        quality: parseInt(productQuality),
        quantity: parseInt(productQuantity),
        driver_id: driverId,
        device_id: deviceId,
        seller_id: LoginStatus.Data.id,
      };
  
      const response = await fetch('http://192.168.32.222:8000/api/products/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        Alert.alert('Success', 'Product details submitted successfully!');
        navigation.navigate('Home'); // Navigate to Home after successful submission
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        Alert.alert('Error', 'Failed to submit product details.');
      }
    } catch (error) {
      console.error('Error posting product details:', error);
      Alert.alert('Error', 'An error occurred while submitting product details.');
    }
  };

  const updateDeviceStatus = async () => {
    try {
      const payload = {
        status: 'set',
      };
  
      const response = await fetch(`http://192.168.32.222:8000/api/devices/${deviceId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        Alert.alert('Success', 'Device status updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        Alert.alert('Error', 'Failed to update device status.');
      }
    } catch (error) {
      console.error('Error updating device status:', error);
      Alert.alert('Error', 'An error occurred while updating device status.');
    }
  };

  const updateDriverStatus = async () => {
    try {
      const payload = {
        status: 'assigned',
      };
  
      const response = await fetch(`http://192.168.32.222:8000/api/drivers/${driverId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        Alert.alert('Success', 'Driver status updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        Alert.alert('Error', 'Failed to update driver status.');
      }
    } catch (error) {
      console.error('Error updating driver status:', error);
      Alert.alert('Error', 'An error occurred while updating driver status.');
    }
  };
  const updateUserStatus = async () => {
    try {
      const payload = {
        role: 'seller',
      };
  
      const response = await fetch(`http://192.168.32.222:8000/api/users/${LoginStatus.Data.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        setLoginStatus((prevStatus) => ({
          ...prevStatus,
          Data: {
            ...prevStatus.Data,
            role: 'seller',
          },
        }));
        Alert.alert('Success', 'User status updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        Alert.alert('Error', 'Failed to update User status.');
      }
    } catch (error) {
      console.error('Error updating User status:', error);
      Alert.alert('Error', 'An error occurred while updating User status.');
    }
  };
  
  

  // =========== FETCH ============

  const fetchDriverInfo = async (id) => {
    try {
      const response = await fetch(`http://192.168.32.222:8000/api/drivers/${id}/`);
      const driverData = await response.json();
      const userResponse = await fetch(`http://192.168.32.222:8000/api/getoneuser/${driverData.user_id}/`);
      const userData = await userResponse.json();
      setDriverInfo(driverData); // Update state
      setUserInfo(userData); // Update state
      return driverData; // Return fetched driver data
    } catch (error) {
      console.error('Error fetching driver/user info:', error);
      Alert.alert('Error', 'Unable to fetch driver/user info');
      throw error; // Propagate the error to `handleConfirm`
    }
  };
  
  const fetchDeviceInfo = async (id) => {
    try {
      const response = await fetch(`http://192.168.32.222:8000/api/devices/${id}/`);
      const data = await response.json();
      setDeviceInfo(data); // Update state
      return data; // Return fetched device data
    } catch (error) {
      console.error('Error fetching device info:', error);
      Alert.alert('Error', 'Unable to fetch device info');
      throw error; // Propagate the error to `handleConfirm`
    }
  };
  

  // ========= PAGE 1 BUTTON ==========

  const handleContinue = () => {
    if (!productName || !productDetails || !productQuality || !productQuantity) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (isNaN(productQuality) || isNaN(productQuantity)) {
      Alert.alert('Error', 'Quality and Quantity should be numbers');
      return;
    }
    if (productQuality < 1 || productQuality > 10) {
      Alert.alert('Error', 'Product Quality should be between 1 and 10');
      return;
    }
    setStep(2);
  };

  // ========== PAGE 2 BUTTON ===========

  const handleConfirm = async () => {
    if (!driverId || !deviceId) {
      Alert.alert('Error', 'Please fill in Driver ID and Device ID');
      return;
    }
  
    setLoading(true); // Start loading
  
    try {
      // Fetch driver and device info sequentially
      const driverData = await fetchDriverInfo(driverId);
      const deviceData = await fetchDeviceInfo(deviceId);
  
      // Validate driver and device status
      if (driverData.status !== 'available') {
        Alert.alert('Error', 'Driver is not available. Please choose another driver.');
        setLoading(false); // Stop loading
        return;
      }
  
      if (deviceData.status !== 'stop') {
        Alert.alert('Error', 'Device is not stopped. Please choose another device.');
        setLoading(false); // Stop loading
        return;
      }
  
      // Proceed to next step if all conditions are met
      setStep(3);
    } catch (error) {
      console.error('Error during confirmation:', error);
      Alert.alert('Error', 'An error occurred during confirmation.');
    } finally {
      setLoading(false); // Stop loading
    }
  };
  
  

  // ======== PAGE 3 BUTTON =============

  const handleSubmit = async () => {
    setLoading(true); // Start loading
  
    try {
      // Post product details
      await postProductDetails();
  
      // Update device status
      await updateDeviceStatus();
  
      // Update driver status
      await updateDriverStatus();

      await updateUserStatus();
  
      Alert.alert('Success', 'All operations completed successfully!');
      navigation.navigate('Home'); // Redirect to Home after completion
    } catch (error) {
      console.error('Error during submission:', error);
      Alert.alert('Error', 'An error occurred during submission.');
    } finally {
      setLoading(false); // Stop loading
    }
  };
  


  return (
    
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {step === 1 && (
        <>
          <Text style={styles.title}>Track Your Item</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Product Name"
            value={productName}
            onChangeText={setProductName}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter Product Details"
            value={productDetails}
            onChangeText={setProductDetails}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter Initial Product Quality Out Of 10"
            value={productQuality}
            keyboardType="numeric"
            onChangeText={setProductQuality}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter Product Quantity In KG"
            value={productQuantity}
            keyboardType="numeric"
            onChangeText={setProductQuantity}
          />
          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.title}>Driver and Device Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Driver ID"
            value={driverId}
            onChangeText={setDriverId}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter Device ID"
            value={deviceId}
            onChangeText={setDeviceId}
          />
          <TouchableOpacity style={styles.button} onPress={handleConfirm}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 3 && driverInfo && deviceInfo && userInfo && (
        <>
        <Text style={styles.s3title}>Tracking Information</Text>
        <ScrollView contentContainerStyle={styles.mainBox}>
          <View style={styles.infoBox}>
            <Text style={styles.titText}>Product Details</Text>
            <Text style={styles.infoText}>Name: {productName}</Text>
            <Text style={styles.infoText}>Details: {productDetails}</Text>
            <Text style={styles.infoText}>Quality: {productQuality}/10</Text>
            <Text style={styles.infoText}>Quantity: {productQuantity} KG</Text>
          </View>
          
          <View style={styles.infoBox}>
            <Text style={styles.titText}>Driver Details</Text>
            <Text style={styles.infoText}>ID: {driverInfo.id}</Text>
            <Text style={styles.infoText}>User ID: {userInfo.id}</Text>
            <Text style={styles.infoText}>Name: {userInfo.name}</Text>
            <Text style={styles.infoText}>Contact: {userInfo.phone}</Text>
            <Text style={styles.infoText}>Experience: {driverInfo.experience} Year</Text>
            <Text style={styles.infoText}>Licence Number: {driverInfo.license_number}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.titText}>Device Details</Text>
            <Text style={styles.infoText}>ID: {deviceInfo.id}</Text>
            <Text style={styles.infoText}>Name: {deviceInfo.name}</Text>
            <Text style={styles.infoText}>Status: {deviceInfo.status}</Text>
            <Text style={styles.infoText}>Maintain Temperature: {deviceInfo.maintain_temperature} C</Text>
            <Text style={styles.infoText}>Maintain Humidity: {deviceInfo.maintain_humidity}%</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.titText}>Seller Details</Text>
            <Text style={styles.infoText}>ID: {LoginStatus.Data.id}</Text>
            <Text style={styles.infoText}>Name: {LoginStatus.Data.name}</Text>
            <Text style={styles.infoText}>Contact: {LoginStatus.Data.phone}</Text>
          </View>
        </ScrollView>
        <TouchableOpacity
          style={[styles.submitbutton, loading && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  s3title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  submitbutton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop:20
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 16,
    marginVertical: 5,
    textAlign:'center'
  },
  titText:{
    textAlign:'center',
    paddingBottom:10,
    fontSize:18,
    color:'#007bff'
  },
  infoBox:{
    width:'100%',
    marginTop:30,
    backgroundColor:'lightgrey',
    padding:20,
    borderRadius:10
  },
  mainBox:{
    width:'100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Optional dim background
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
});
