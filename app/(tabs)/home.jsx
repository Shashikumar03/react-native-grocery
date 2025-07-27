// Home.js
import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView, Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import CustomHeader from '../../components/Header/CustomHeader';
import HomeCategory from '../../components/Home/HomeCategory';
import AllCategoriesFromApi from '../../components/Home/ApiCategories/AllCategoriesFromApi';
import { registerForPushNotificationsAsync } from '../../components/Push';
import { getCurrentUserId } from '../../utils/token';

// ✅ Set up notification handler globally
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Home() {
  useEffect(() => {
    const setupPushNotifications = async () => {
      try {
        const currentUserId = await getCurrentUserId();
        console.log('👤 Current user ID:', currentUserId);
        await registerForPushNotificationsAsync(currentUserId);
      } catch (err) {
        console.error('Push registration error:', err);
        // Alert.alert('Error', `Push registration failed:\n${err?.message || err}`);
      }
    };

    setupPushNotifications();

    // Listen for notifications received in foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received (foreground):', notification);
    });

    // Listen for when user taps on notification
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped (response):', response);
      // Add logic here to navigate or handle data
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f2f2" />
      <View style={styles.fixedTop}>
        <CustomHeader />
        {/* <HomeCategory /> */}
      </View>
      <View style={styles.contentContainer}>
        <AllCategoriesFromApi />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  fixedTop: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
});
