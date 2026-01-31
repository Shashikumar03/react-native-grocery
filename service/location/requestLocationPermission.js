import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { getBaseUrl } from '../../constants/Baseurl';
import { getToken } from '../../utils/token';
import { BACKGROUND_LOCATION_TASK_NAME } from './backgroundLocationTask';

/**
 * Request foreground location permission from the user.
 * @returns {{ granted: boolean, status: string }}
 */
export async function requestLocationPermission() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return {
      granted: status === 'granted',
      status,
    };
  } catch (error) {
    console.error('Location permission request failed:', error);
    return { granted: false, status: 'error' };
  }
}

/**
 * Check current location permission status without prompting.
 * @returns {{ granted: boolean, status: string }}
 */
export async function getLocationPermissionStatus() {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return {
      granted: status === 'granted',
      status,
    };
  } catch (error) {
    console.error('Location permission check failed:', error);
    return { granted: false, status: 'error' };
  }
}

/**
 * Get the user's current position (only call after permission is granted).
 * @returns {{ coords: { latitude: number, longitude: number } } | null}
 */
export async function getCurrentPosition() {
  try {
    const { granted } = await getLocationPermissionStatus();
    if (!granted) return null;
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return location;
  } catch (error) {
    console.error('Get current position failed:', error);
    return null;
  }
}

/**
 * Send current location to the backend.
 * Gets position (if permission granted), then POSTs to /api/location.
 */
export async function sendLocationToBackend() {
  try {
    const { granted } = await getLocationPermissionStatus();
    if (!granted) return;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;

    const token = await getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    await fetch(`${getBaseUrl()}/api/location`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        latitude,
        longitude,
        time: new Date().toISOString(),
      }),
    }).catch(() => {});
  } catch (error) {
    console.error('Send location to backend failed:', error);
  }
}

/**
 * Request background location permission.
 * Call after foreground permission is granted.
 * On Android 11+: may open system settings; on iOS asks for "Always" if not already granted.
 * @returns {{ granted: boolean, status: string }}
 */
export async function requestBackgroundLocationPermission() {
  try {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    return {
      granted: status === 'granted',
      status,
    };
  } catch (error) {
    console.error('Background location permission request failed:', error);
    return { granted: false, status: 'error' };
  }
}

/**
 * Start background location updates. Location updates will be delivered to the
 * BACKGROUND_LOCATION_TASK_NAME task and sent to the backend.
 * Requires foreground + background location permission.
 * On Android: shows a persistent notification while tracking (required by OS).
 * Note: Background location stops if the user force-closes the app (Android) or terminates it (iOS).
 */
export async function startBackgroundLocationTracking() {
  try {
    const started = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME);
    if (started) return;

    const foreground = await Location.getForegroundPermissionsAsync();
    if (foreground.status !== 'granted') return;

    const background = await Location.getBackgroundPermissionsAsync();
    if (background.status !== 'granted') return;

    // How often the backend is updated (OS may batch/defer; these are minimums):
    // - timeInterval: min ms between updates (e.g. 60_000 = 1 min)
    // - distanceInterval: min meters moved before update (e.g. 50 = ~50 m)
    const LOCATION_UPDATE_INTERVAL_MS = 60 * 1000;   // 1 minute
    const LOCATION_UPDATE_DISTANCE_M = 50;            // 50 meters

    const options = {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: LOCATION_UPDATE_INTERVAL_MS,
      distanceInterval: LOCATION_UPDATE_DISTANCE_M,
      ...(Platform.OS === 'android' && {
        foregroundService: {
          notificationTitle: 'Grocery App',
          notificationBody: 'Location is used to improve delivery.',
          notificationColor: '#007bff',
        },
      }),
    };

    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME, options);
  } catch (error) {
    console.error('Start background location tracking failed:', error);
  }
}

/**
 * Stop background location updates.
 */
export async function stopBackgroundLocationTracking() {
  try {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME);
  } catch (error) {
    console.error('Stop background location tracking failed:', error);
  }
}
