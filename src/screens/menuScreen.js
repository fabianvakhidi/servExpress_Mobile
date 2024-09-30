import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function MenuScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [basket, setBasket] = useState([]);
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

  const addToBasket = (productId) => {
    const quantity = quantities[productId] || 1; // Default to 1 if not set
    const product = products.find((item) => item.productId === productId);
    if (product) {
      const newItem = { ...product, quantity };
      setBasket((prevBasket) => [...prevBasket, newItem]);
      Alert.alert(`${quantity} x ${product.name} added to basket`);
    }
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
          value={String(quantities[item.productId] || 1)} // Display the correct quantity for this product
          onChangeText={(value) => setQuantities({ ...quantities, [item.productId]: Number(value) })} // Update the specific product quantity
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginVertical: 10 }}
        />
        <Button title="Select Product" onPress={() => addToBasket(item.productId)} />
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
      <Button title="Proceed to Checkout" onPress={() => navigation.navigate('CheckoutScreen', { basket })} />
    </ScrollView>
  );
}
