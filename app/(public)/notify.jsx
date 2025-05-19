import React, { useEffect, useRef, useState } from 'react';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Alert, Platform } from 'react-native';
import {getBaseUrl} from "../../constants/Baseurl"
import { useAuth } from '../../service/Login/UseAuth';

// Show notifications when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),

});
// useAuth

export default function RootLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        sendTokenToBackend(token);
        
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Foreground notification:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('User interacted with notification:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  async function sendTokenToBackend(token) {
    try {
      await fetch(`${getBaseUrl()}/api/notifications/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      
    } catch (error) {
      console.error('Failed to send token to backend:', error);
    }
  }
  

  async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) {
      Alert.alert('Must use physical device for push notifications');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Permission denied for notifications');
      return null;
    }

    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenData.data;
  }

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
