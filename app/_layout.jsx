import React from 'react';
import { Stack } from "expo-router";
import { useAuth } from '../service/Login/UseAuth';

export default function RootLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isSignedIn ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(public)" />
      )}
    </Stack>
  );
}
