// src/screens/CheckoutScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CheckoutScreen({ route, navigation }) {
  const { basket, customerId } = route.params; // Retrieve basket and customerId from route parameters
  const [token, setToken] = useState(null); // State to hold the token

  // Calculate total price
  const totalPrice = basket.reduce((total, item) => {
    return total + (item.price * item.quantity); // Assuming item.price is a number
  }, 0);

  // Fetch the token from AsyncStorage
  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('authToken');
      setToken(storedToken);
    };

    fetchToken();
  }, []);

  // Prepare the order request body
  const orderRequestBody = {
    customerId: customerId,
    orderDate: new Date().toISOString(), // Current date in ISO format
    totalAmount: totalPrice.toFixed(2), // Total amount formatted as string
    status: 0, // Unpaid status
    stripeSessionId: 'your-stripe-session-id', // Example Stripe session ID
  };

  const handlePayment = async () => {
    if (!token) {
      Alert.alert('Error', 'Authentication token not found.');
      return;
    }

    try {
      // Send the order request to the Order API with the token in the headers
      const orderResponse = await axios.post('http://192.168.0.4:3000/api/orders', orderRequestBody, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request headers
        },
      });
      
      // Check for successful response
      if (orderResponse.status === 201) {
        const orderId = orderResponse.data.orderId; // Get the orderId from the response
        await handleOrderProductsCreation(orderId); // Call function to create order products
        Alert.alert('Success', 'Order created successfully!');
        navigation.navigate('Home'); // Navigate to Home after successful order creation
      } else {
        Alert.alert('Error', 'Failed to create order.');
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      Alert.alert('Error', 'An error occurred while creating the order. Please try again.');
    }
  };

  // Function to create entries in Order-Products API
  const handleOrderProductsCreation = async (orderId) => {
    try {
      const promises = basket.map(async (item) => {
        await axios.post('http://192.168.0.4:3000/api/order-products', {
          orderId: orderId,
          productId: item.productId, // Use the productId from the basket
          quantity: item.quantity, // Use the quantity from the basket
          priceAtOrder: item.price // Use the price at order
        }, {
          headers: {
            Authorization: `Bearer ${token}` // Include the token in the request headers
          }
        });
      });

      // Wait for all promises to resolve
      await Promise.all(promises);
      Alert.alert('Success', 'Order products created successfully!');
    } catch (error) {
      console.error('Order products creation failed:', error);
      Alert.alert('Error', 'An error occurred while creating order products. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>

      <Text style={styles.total}>Total: ${totalPrice.toFixed(2)}</Text>

      {basket.map((item) => (
        <View key={item.productId} style={{ marginVertical: 10 }}>
          <Text>{item.name} - ${item.price} x {item.quantity}</Text>
        </View>
      ))}

      <Button title="Pay Now" onPress={handlePayment} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});
