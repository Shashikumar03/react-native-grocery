import React from 'react';
import { Stack } from "expo-router";
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../service/Login/UseAuth';
// import { useUser } from "@clerk/clerk-expo";

export default function RootLayout() {
  
  // const { isSignedIn, isLoaded } = useAuth();
  // useAuth
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  console.log( `Checking isSignedIn in RootLayout :${isSignedIn}`)


  // if (!isLoaded) return null;
    // isAuthenticated=false
  return (
    <>
    <NavigationContainer>
      
      <Stack screenOptions={{
        headerShown: false,
      }}>
        {isSignedIn ? (
          
          <Stack.Screen name="(tabs)" />
        ) : (
  
          <Stack.Screen name="(public)" />
        )}
      </Stack>
      </NavigationContainer>
    </>
  );
}