// src/screens/menuScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function MenuScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken'); // Fetch the token
        const response = await axios.get('http://192.168.0.4:3000/api/products/all', {
          headers: {
            Authorization: `Bearer ${token}` // Include the token in the request headers
          }
        });
        setProducts(response.data); // Set the products from the response
      } catch (error) {
        console.error(error); // Log the error
        Alert.alert('Error', 'Could not fetch products.');
      } finally {
        setLoading(false); // Ensure loading state is set to false
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />; // Show a loading indicator while fetching data
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {products.length === 0 ? (
        <Text>No products available.</Text> // Show a message if no products
      ) : (
        products.map((item) => (
          <View key={item.productId} style={{ marginBottom: 20, borderWidth: 1, padding: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text>{item.description}</Text>
            <Text style={{ fontWeight: 'bold' }}>${item.price}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
