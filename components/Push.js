// components/Push.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import axios from 'axios';
import { getBaseUrl } from '../constants/Baseurl';

export async function registerForPushNotificationsAsync(userId) {
  if (!userId) {
    console.log('User ID is missing,cannot register push token.');
    return;
  }

  if (!Device.isDevice) {
    Alert.alert('Error', 'Must use a physical device for push notifications.');
    return;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      // Alert.alert('Permission Denied', 'Notification permissions were not granted!');
      return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    console.log('📱 Expo Push Token:', token);

    // Send token to your backend
    const response = await axios.post(
      `${getBaseUrl()}/api/user/device-token`,
      { userId, token },
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log('✅ Push token sent:', response.data);
    // Alert.alert('Success', 'Push token registered successfully.');

    // Android: create channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  } catch (error) {
    console.error('❌ Failed to register token:', error?.response?.data || error.message);
    // Alert.alert('Error', `Failed to send push token:\n${error?.message || 'Unknown error'}`);
  }
}
