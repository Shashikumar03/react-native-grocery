import React from 'react';
import { Stack } from "expo-router";
import { NavigationContainer } from '@react-navigation/native';

export default function RootLayout() {
  
  isAuthenticated= true
  return (
    <>
    <NavigationContainer>
      
      <Stack screenOptions={{
        headerShown: false,
      }}>
        {isAuthenticated ? (
          
          <Stack.Screen name="(tabs)" />
        ) : (
  
          <Stack.Screen name="(public)" />
        )}
      </Stack>
      </NavigationContainer>
    </>
  );
}
