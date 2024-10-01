// src/screens/PaymentScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const PaymentScreen = ({ route }) => {
  const { customerId, selectedProduct, quantity, totalAmount, stripeSessionId } = route.params;
  const [orderId, setOrderId] = useState(null);
  const navigation = useNavigation();

  // Create order
  const handleOrderCreation = async () => {
    try {
      const orderResponse = await axios.post('http://192.168.0.235:3000/api/orders', {
        customerId: customerId,
        orderDate: new Date().toISOString(),
        totalAmount: totalAmount,
        status: 0, // "unpaid"
        stripeSessionId: stripeSessionId
      });

      const newOrderId = orderResponse.data.orderId;
      setOrderId(newOrderId);

      // Once order is created, trigger OrderProduct API
      await handleOrderProductCreation(newOrderId);
    } catch (error) {
      console.error('Order creation failed:', error);
    }
  };

  // Create entry in OrderProducts
  const handleOrderProductCreation = async (orderId) => {
    try {
      await axios.post('http://192.168.0.235:3000/api/order-products', {
        orderId: orderId,
        productId: selectedProduct.id, // Assuming product object contains 'id'
        quantity: quantity,
        priceAtOrder: selectedProduct.price * quantity // Calculate price based on quantity
      });

      // After the order product is created, submit payment
      await handlePaymentSubmission(orderId);
    } catch (error) {
      console.error('Order product creation failed:', error);
    }
  };

  // Submit payment
  const handlePaymentSubmission = async (orderId) => {
    try {
      await axios.post('http://192.168.0.235:3000/api/payments', {
        orderId: orderId,
        amount: totalAmount, // Total amount of the order
        paymentMethod: 'card', // Payment method used
        paymentStatus: 'Paid' 
      });

      // Finally, update the order status to "paid"
      await handleOrderUpdate(orderId);
    } catch (error) {
      console.error('Payment submission failed:', error);
    }
  };

  // Update order status to "paid"
  const handleOrderUpdate = async (orderId) => {
    try {
      await axios.put(`http://192.168.0.235:3000/api/orders/${orderId}`, {
        customerId: customerId,
        orderDate: new Date().toISOString(),
        totalAmount: totalAmount,
        status: 1, // "paid"
        stripeSessionId: stripeSessionId
      });

      // Navigate to success screen or return to home
      navigation.navigate('Home');
    } catch (error) {
      console.error('Order update failed:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Order Summary</Text>
      <Text>Product: {selectedProduct.name}</Text>
      <Text>Quantity: {quantity}</Text>
      <Text>Total: ${totalAmount}</Text>
      <Button title="Pay Now" onPress={handleOrderCreation} />
    </ScrollView>
  );
};

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
});

export default PaymentScreen;
