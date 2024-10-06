// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BACKEND_API_URL } from '@env';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both fields.');
      return;
    }

    setLoading(true); // Set loading to true when the request starts

    try {
      const response = await axios.post(`${BACKEND_API_URL}/auth/login`, {
        email,
        password,
      });

      console.log('Login response:', response.data);

      await AsyncStorage.setItem('email', email);



      if (response && response.data) {
        if (response.data.message === 'Login successful') {
          const token = response.data.token;
          const customerId = response.data.customerId;
          
          console.log('Login successful:', { token, customerId });
          
          await AsyncStorage.setItem('authToken', token);
          await AsyncStorage.setItem('customerId', customerId);
          
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
