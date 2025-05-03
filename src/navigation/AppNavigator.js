import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import HomeScreen from '../screens/home/HomeScreen';
import BookDetailScreen from '../screens/book/BookDetailScreen';
import BestSellerScreen from '../screens/book/BestSellerScreen';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import AddBookScreen from '../screens/admin/AddBookScreen';
import EditBookScreen from '../screens/admin/EditBookScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'white' },
          animation: 'none',
        }}>
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
        />
        <Stack.Screen 
          name="OTP" 
          component={OTPScreen}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
        />
        <Stack.Screen 
          name="AdminHome" 
          component={AdminHomeScreen}
        />
        <Stack.Screen 
          name="BookDetail" 
          component={BookDetailScreen}
        />
        <Stack.Screen 
          name="BestSeller" 
          component={BestSellerScreen}
        />
        <Stack.Screen 
          name="AddBook" 
          component={AddBookScreen}
        />
        <Stack.Screen 
          name="EditBook" 
          component={EditBookScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 