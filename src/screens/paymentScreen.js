import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Linking } from 'react-native';

export default function PaymentScreen({ route }) {
  const { stripeUrl } = route.params; // Retrieve the Stripe URL from route params

  useEffect(() => {
    const openStripeUrl = async () => {
      try {
        if (stripeUrl) {
          // Open the Stripe Checkout URL
          await Linking.openURL(stripeUrl);
        }
      } catch (error) {
        console.error('Failed to open Stripe URL:', error);
        Alert.alert('Error', 'Unable to open the payment page.');
      }
    };

    openStripeUrl(); // Trigger the Stripe URL opening when component mounts
  }, [stripeUrl]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Redirecting to payment page...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
