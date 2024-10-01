// src/screens/MenuScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function MenuScreen({ navigation, route }) {
  const { token, customerId, loginResponse } = route.params; // Retrieve token, customerId and loginResponse from route parameters
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({}); // State to hold quantities for each product

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://192.168.0.4:3000/api/products/all', {
          headers: {
            Authorization: `Bearer ${token}` // Include the token in the request headers
          }
        });
        setProducts(response.data);
      } catch (error) {
        Alert.alert('Error', 'Could not fetch products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [token]); // Fetch products when token changes

  const renderItem = ({ item }) => {
    return (
      <View key={item.productId} style={{ marginBottom: 20, borderWidth: 1, padding: 10 }}>
        <Text style={{ fontWeight: 'bold' }}>{item.name} - ${item.price}</Text>
        <Text>{item.description}</Text>
        <TextInput
          keyboardType="numeric"
          value={String(quantities[item.productId] || 1)} // Display the correct quantity for this product
          onChangeText={(value) => setQuantities({ ...quantities, [item.productId]: Number(value) })} // Update the specific product quantity
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginVertical: 10 }}
        />
        <Button title="Select Product" onPress={() => {}} /> {/* Placeholder for product selection logic */}
      </View>
    );
  };

  const handleProceedToCheckout = () => {
    const basket = products.map(item => ({
      ...item,
      quantity: quantities[item.productId] || 1,
    }));
    navigation.navigate('CheckoutScreen', { basket, customerId, loginResponse }); // Pass basket, customerId and loginResponse to CheckoutScreen
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />; // Show a loading indicator while fetching data
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.productId.toString()} // Use productId as the key
      />
      <Button title="Proceed to Checkout" onPress={handleProceedToCheckout} />
    </ScrollView>
  );
}
