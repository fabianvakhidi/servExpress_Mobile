import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/loginScreen'; // Adjust the path as necessary
import MenuScreen from './src/screens/menuScreen'; // Adjust the path as necessary
import CheckoutScreen from './src/screens/checkoutScreen';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="loginScreen">
        <Stack.Screen name="loginScreen" component={LoginScreen} />
        <Stack.Screen name="menuScreen" component={MenuScreen} />
        <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}