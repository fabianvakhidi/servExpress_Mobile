// src/screens/MenuScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function MenuScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({}); // State to hold quantities for each product

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken'); // Fetch the token
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
  }, []);

  const proceedToCheckout = () => {
    const selectedProductIds = Object.keys(quantities).filter(id => quantities[id] > 0).map(id => {
      const product = products.find(product => product.productId === parseInt(id));
      return {
        productId: parseInt(id),
        quantity: quantities[id],
        priceAtOrder: product.price, // Get price for the selected product
        name: product.name // Get product name for the selected product
      };
    });

    navigation.navigate('CheckoutScreen', { selectedProducts: selectedProductIds });
  };

  const renderItem = ({ item }) => {
    return (
      <View
        key={item.productId}
        style={{ marginBottom: 20, borderWidth: 1, padding: 10 }}
      >
        <Text style={{ fontWeight: 'bold' }}>{item.name} - ${item.price}</Text>
        <Text>{item.description}</Text>
        <TextInput
          keyboardType="numeric"
          value={String(quantities[item.productId] || 0)} // Display the correct quantity for this product
          onChangeText={(value) => setQuantities({ ...quantities, [item.productId]: Number(value) })} // Update the specific product quantity
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginVertical: 10 }}
        />
      </View>
    );
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
      <Button title="Proceed to Checkout" onPress={proceedToCheckout} />
    </ScrollView>
  );
}
