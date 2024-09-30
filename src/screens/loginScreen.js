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

      // Check the response
      if (response && response.data) {
        if (response.data.message === 'Login successful') {
          const token = response.data.token;
          await AsyncStorage.setItem('authToken', token);
          navigation.navigate('homeScreen'); // Navigate to homeScreen
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
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ marginBottom: 10 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ marginBottom: 10 }}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
