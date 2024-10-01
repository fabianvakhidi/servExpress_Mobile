// src/screens/CheckoutScreen.js
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CheckoutScreen({ route, navigation }) {
  const { selectedProducts } = route.params; // Retrieve the selected products from route parameters
  const totalAmount = selectedProducts.reduce((total, item) => total + (item.priceAtOrder * item.quantity), 0); // Calculate total amount

  // State to hold IP information
  const [ipInfo, setIpInfo] = useState({ city: '', country: '', currency: '' });
  const [stripeUrl, setStripeUrl] = useState(''); // State to hold Stripe session URL

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

      // Fetch IP information after order creation
      const ipResponse = await axios.get('http://192.168.0.4:3000/api/ipinfo', {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request headers
        },
      });

      // Extract required details and set IP info
      const { city, country, currency } = ipResponse.data;
      setIpInfo({ city, country, currency });

      // Prepare the Stripe session request body
      const stripeRequestBody = {
        city: city,
        country: country,
        email: "aasmund.ivarjord@example.com", // Replace with actual email
        name: "Aasmund Ivarjord", // Replace with actual name
        success_url: "https://example.com/success",
        cancel_url: "https://example.com/cancel",
        payment_method_types: ['card'],
        currency: currency,
        product_name: selectedProducts[0].name, // Assuming the first product is chosen
        unit_amount: totalAmount * 100, // Amount in cents
        internalCustomerId: customerId,
      };

      // Call the Stripe API to create a session
      const createSessionResponse = await axios.post('http://192.168.0.4:3000/api/stripe/create-session', stripeRequestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Extract the URL from the Stripe session response
      const stripeSessionUrl = createSessionResponse.data.session.url;
      setStripeUrl(stripeSessionUrl); // Set the Stripe session URL in the state

      // Payment logic can follow here
      Alert.alert('Success', 'Order created successfully!');

      // Navigate to the Stripe checkout page
      // This can be opened in a web view or redirect to an external browser
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

      {/* Display IP information */}
      <Text style={styles.ipInfo}>City: {ipInfo.city}</Text>
      <Text style={styles.ipInfo}>Country: {ipInfo.country}</Text>
      <Text style={styles.ipInfo}>Currency: {ipInfo.currency}</Text>

      {/* Display Stripe session URL if available */}
      {stripeUrl ? (
        <Text style={styles.stripeUrl}>Stripe Checkout URL: {stripeUrl}</Text>
      ) : null}

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
  ipInfo: {
    marginVertical: 5,
    fontSize: 16,
  },
  stripeUrl: {
    marginVertical: 10,
    fontSize: 16,
    color: 'blue',
  },
});
