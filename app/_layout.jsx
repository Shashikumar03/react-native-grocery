// Register background location task before any other app code (required by TaskManager)
import '../service/location/backgroundLocationTask';

import React, { useEffect } from 'react';
import { AppState, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../service/Login/UseAuth';
import { clearSession } from '../utils/token';
import { checkSimChange, clearStoredSimFingerprint } from '../service/sim/SimChangeDetection';
import { notifySimChangeToBackend } from '../service/sim/notifySimChangeToBackend';

export default function RootLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) return;

    const lockDueToSimChange = async () => {
      const { changed, storedFingerprint, currentFingerprint } = await checkSimChange();
      if (!changed) return;

      await notifySimChangeToBackend(storedFingerprint, currentFingerprint);
      await clearSession();
      await clearStoredSimFingerprint();

      Alert.alert(
        'SIM change detected',
        'For your security, you have been signed out. Please sign in again.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    };

    lockDueToSimChange();

    const handleAppStateChange = (nextState) => {
      if (nextState === 'active') lockDueToSimChange();
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isSignedIn, router]);

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
