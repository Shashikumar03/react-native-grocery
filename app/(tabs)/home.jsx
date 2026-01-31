// Home.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView, Alert, Platform, TouchableOpacity, Text } from 'react-native';
import * as Notifications from 'expo-notifications';

import CustomHeader from '../../components/Header/CustomHeader';
import HomeCategory from '../../components/Home/HomeCategory';
import AllCategoriesFromApi from '../../components/Home/ApiCategories/AllCategoriesFromApi';
import { getCartItems } from '../../service/cart/GetCartItems';
import { getCurrentUserId } from '../../utils/token';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { registerForPushNotificationsAsync } from '../../components/Push';
import { requestLocationPermission, sendLocationToBackend, requestBackgroundLocationPermission, startBackgroundLocationTracking } from '../../service/location/requestLocationPermission';
import { useRouter } from 'expo-router';

// ✅ Set up notification handler globally
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Home() {
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = useCallback(async () => {
    try {
      const userId = await getCurrentUserId();
      const res = await getCartItems(userId);
      if (res.success && res.data?.cartItemsDto) {
        let count = 0;
        res.data.cartItemsDto.forEach((it) => { count += it.quantity || 0; });
        setCartCount(count);
      }
    } catch (err) {
      console.error('Error fetching cart count', err);
    }
  }, []);

  useEffect(() => {
    const setupPushNotifications = async () => {
      try {
        const currentUserId = await getCurrentUserId();
        console.log('👤 Current user ID:', currentUserId);
        await registerForPushNotificationsAsync(currentUserId);
      } catch (err) {
        console.error('Push registration error:', err);
      }
    };

    const setupLocationPermission = async () => {
      try {
        const { granted } = await requestLocationPermission();
        if (granted) {
          console.log('📍 Location permission granted');
          await sendLocationToBackend();

          // Request background permission and start background location tracking
          const { granted: bgGranted } = await requestBackgroundLocationPermission();
          if (bgGranted) {
            await startBackgroundLocationTracking();
            console.log('📍 Background location tracking started');
          }
        }
      } catch (err) {
        console.error('Location permission error:', err);
      }
    };

    setupPushNotifications();
    setupLocationPermission();
    fetchCartCount();

    // Listen for notifications received in foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received (foreground):', notification);
    });

    // Listen for when user taps on notification
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped (response):', response);
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, [fetchCartCount]);

  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f2f2" />
      <View style={styles.fixedTop}>
        <CustomHeader />
      </View>

      <View style={styles.contentContainer}>
        <AllCategoriesFromApi onCartUpdated={fetchCartCount} />
      </View>

      {/* Floating cart popup — visible when cart has items */}
      {cartCount > 0 && (
        <TouchableOpacity style={styles.cartPopup} onPress={() => router.push('/cart')}>
          <Icon name="shopping-cart" size={20} color="#fff" />
          <Text style={styles.cartPopupText}>{cartCount}</Text>
        </TouchableOpacity>
      )}
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
  cartPopup: {
    position: 'absolute',
    right: 16,
    bottom: 22,
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
  },
  cartPopupText: { color: '#fff', fontWeight: '700', marginLeft: 8 },
});
