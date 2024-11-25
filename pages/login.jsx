import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { setLoginStatus, LoginStatus } from '../globals';


export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [id, setId] = useState(0);

  const validateInputs = () => {
    // Common validations
    if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      Alert.alert('Invalid Phone Number', 'Phone number must be 10 digits.');
      return false;
    }
    if (!password || password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters.');
      return false;
    }

    // Additional validation for signup
    if (!isLogin && (!name || name.trim().length === 0)) {
      Alert.alert('Invalid Name', 'Name cannot be empty.');
      return false;
    }

    return true;
  };

  const handleLogin = () => {
    if (!validateInputs()) return;

    setLoginStatus({ Login: 1, Data: { id: id, user: 'John Doe', phone: phone } });
    Alert.alert('Login Successful', `Welcome back, ${phone}!`);
    console.log(LoginStatus);
  };

  const handleSignup = () => {
    if (!validateInputs()) return;

    Alert.alert('Signup Successful', `Account created for ${name}!`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</Text>

      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={isLogin ? handleLogin : handleSignup}>
        <Text style={styles.buttonText}>{isLogin ? 'Log In' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
        <Text style={styles.switchText}>
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 15,
  },
  switchText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
