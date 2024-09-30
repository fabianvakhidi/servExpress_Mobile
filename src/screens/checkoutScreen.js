// src/screens/checkoutScreen.js
import React from 'react';
import { View, Text, Button } from 'react-native';

export default function CheckoutScreen({ route, navigation }) {
  const { basket } = route.params; // Retrieve the basket from route parameters

  // Calculate total price
  const totalPrice = basket.reduce((total, item) => {
    return total + item.price * item.quantity; // Assuming item.price is a number
  }, 0);

  const handlePayment = () => {
    // Implement payment logic here, possibly redirect to a payment screen
    Alert.alert('Proceeding to payment...');
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Checkout</Text>
      {basket.map((item) => (
        <View key={item.productId} style={{ marginVertical: 10 }}>
          <Text>{item.name} - ${item.price} x {item.quantity}</Text>
        </View>
      ))}
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Total: ${totalPrice.toFixed(2)}</Text>
      <Button title="Pay Now" onPress={handlePayment} />
    </View>
  );
}
