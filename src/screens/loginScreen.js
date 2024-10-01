// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both fields.');
      return;
    }

    try {
      const response = await axios.post('http://192.168.0.4:3000/api/auth/login', {
        email,
        password,
      });

      if (response && response.data) {
        if (response.data.message === 'Login successful') {
          const token = response.data.token;
          const customerId = response.data.customerId;
          await AsyncStorage.setItem('authToken', token);
          
          // Navigate to MenuScreen and pass token and customerId
          navigation.navigate('menuScreen', { token, customerId });
        } else {
          Alert.alert('Error', response.data.message || 'Login failed');
        }
      } else {
        Alert.alert('Error', 'Invalid response from server.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
