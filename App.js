import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/loginScreen'; // Adjust the path as necessary
import HomeScreen from './src/screens/homeScreen'; // Adjust the path as necessary

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="loginScreen">
        <Stack.Screen name="loginScreen" component={LoginScreen} />
        <Stack.Screen name="homeScreen" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
