// src/screens/CheckoutScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CheckoutScreen({ route, navigation }) {
  const { selectedProducts } = route.params; // Retrieve the selected products from route parameters
  const totalAmount = selectedProducts.reduce((total, item) => total + (item.priceAtOrder * item.quantity), 0); // Calculate total amount

  const handlePayment = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken'); // Fetch the token
      const customerId = 8; // Replace with the logic to retrieve the actual customerId if needed

      // Prepare the order request body
      const orderRequestBody = {
        customerId: customerId,
        orderDate: new Date().toISOString(), // Current date in ISO format
        totalAmount: totalAmount.toFixed(2), // Total amount formatted as string
        status: 0, // Unpaid status
        stripeSessionId: 'your-stripe-session-id', // Example Stripe session ID
      };

      // Send the order request to the Order API with authorization
      const orderResponse = await axios.post('http://192.168.0.4:3000/api/orders', orderRequestBody, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request headers
        },
      });

      const orderId = orderResponse.data.orderId; // Get the order ID from the response

      // Prepare the order products request body
      const orderProductsRequests = selectedProducts.map(product => ({
        orderId: orderId,
        productId: product.productId,
        quantity: product.quantity,
        priceAtOrder: product.priceAtOrder,
      }));

      // Send each product to the Order-Products API
      for (const orderProduct of orderProductsRequests) {
        await axios.post('http://192.168.0.4:3000/api/order-products', orderProduct, {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request headers
          },
        });
      }

      // Payment logic can follow here
      Alert.alert('Success', 'Order created successfully!');
      navigation.navigate('Home'); // Navigate to Home after successful order creation
    } catch (error) {
      console.error('Payment submission failed:', error);
      Alert.alert('Error', 'An error occurred while creating the order. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.total}>Total: ${totalAmount.toFixed(2)}</Text>

      {selectedProducts.map((item) => (
        <View key={item.productId} style={{ marginVertical: 10 }}>
          <Text>{item.productId} - ${item.priceAtOrder} x {item.quantity}</Text>
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
