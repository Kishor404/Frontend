import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LoginStatus,setLoginStatus } from '../globals';

export default function Profile() {
  const profileData = LoginStatus.Data;

  const handleLogout = () => {
    setLoginStatus({ Login: 0, Data: {} });
    alert('You have been logged out.');
  };

  return (
    <View style={styles.container}>
      {/* Profile Details */}
      <Text style={styles.title}>Profile</Text>

      <View style={styles.profileDetails}>
        <Text style={styles.profileText}><Text style={styles.label}>Name:</Text> {profileData.name
        }</Text>
        <Text style={styles.profileText}><Text style={styles.label}>Phone:</Text> {profileData.phone}</Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  profileDetails: {
    width: '100%',
    marginBottom: 40,
    padding: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  profileText: {
    fontSize: 16,
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    width: '80%',
    height: 50,
    backgroundColor: '#ff4d4d',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
