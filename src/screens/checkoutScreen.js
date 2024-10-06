// src/screens/CheckoutScreen.js
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_API_URL } from '@env';


export default function CheckoutScreen({ route, navigation }) {
  const { selectedProducts } = route.params; // Retrieve the selected products from route parameters
  const totalAmount = selectedProducts.reduce((total, item) => total + (item.priceAtOrder * item.quantity), 0); // Calculate total amount

  // State to hold information:
  const [ipInfo, setIpInfo] = useState({ city: '', country: '', currency: '' });
  const [stripeUrl, setStripeUrl] = useState('');
  const [stripeSessionId, setStripeSessionId] = useState('')
  const [name, setName] = useState('');



  const handlePayment = async () => {
    try {

      //Fetching from AsyncStorage:

      //JWT Token
      const token = await AsyncStorage.getItem('authToken'); // Fetch the token
      //Customer ID from loginScreen:
      const customerId = await AsyncStorage.getItem('customerId');
      //email from loginScreen:
      const email = await AsyncStorage.getItem('email');


      // Prepare the order request body:
      const orderRequestBody = {
        customerId: customerId,
        orderDate: new Date().toISOString(),
        totalAmount: totalAmount.toFixed(2), 
        status: 0, // Unpaid status
        stripeSessionId: 'your-stripe-session-id',
      };

      // Send the order request to the Order API with authorization:
      const orderResponse = await axios.post(`${BACKEND_API_URL}/orders`, orderRequestBody, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });

      // Get the order ID from the response:
      const orderId = orderResponse.data.orderId; 

      // Prepare the order products request body:
      const orderProductsRequests = selectedProducts.map(product => ({
        orderId: orderId,
        productId: product.productId,
        quantity: product.quantity,
        priceAtOrder: product.priceAtOrder,
      }));

      // Send each product to the Order-Products API
      for (const orderProduct of orderProductsRequests) {
        await axios.post(`${BACKEND_API_URL}/order-products`, orderProduct, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Fetch IP information after order creation:
      const ipResponse = await axios.get(`${BACKEND_API_URL}/ipinfo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Extract required details and set IP info
      const { city, country, currency } = ipResponse.data;
      setIpInfo({ city, country, currency });




      // Fetch name from Customer API:
      const customerInformation = await axios.get(`${BACKEND_API_URL}/customers/bulk-fetch?customerIds[]=${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });

      if (customerInformation.data && customerInformation.data.length > 0) {
        const { name } = customerInformation.data[0];
        setName(name); 
      }


      // Prepare the Stripe session request body
      const stripeRequestBody = {
        city: city,
        country: country,
        email: email,
        name: name,
        success_url: "https://example.com/success",
        cancel_url: "https://example.com/cancel",
        payment_method_types: ['card'],
        currency: currency,
        product_name: selectedProducts[0].name, // Assuming the first product is chosen
        unit_amount: totalAmount * 100,
        internalCustomerId: customerId,
      };




      // Call the Stripe API to create a checkout-session:
      const createSessionResponse = await axios.post(`${BACKEND_API_URL}/stripe/create-session`, stripeRequestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const stripeSessionUrl = createSessionResponse.data.session.url;
      const stripeSessionId = createSessionResponse.data.session.id;
      setStripeUrl(stripeSessionUrl);
      setStripeSessionId(stripeSessionId);


      await axios.put(`${BACKEND_API_URL}/orders/${orderId}`, { stripeSessionId: stripeSessionId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Navigate to paymentScreen and pass the Stripe URL
      navigation.navigate('paymentScreen', { stripeUrl: stripeSessionUrl });


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

      <Text style={styles.name}>Name: {name}</Text>


      {stripeUrl ? (
        <Text style={styles.stripeUrl}>Stripe Checkout URL: {stripeUrl}</Text>
      ) : null}

      

      {stripeSessionId ? (
        <Text style={styles.stripeSessionId}>stripeSessionId: {stripeSessionId}</Text>
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
