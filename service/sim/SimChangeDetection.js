/**
 * SIM change detection (Android + iOS via expo-cellular).
 * Builds a "SIM fingerprint" from carrier + MCC + MNC. When it changes, we treat it as a different SIM
 * (e.g. phone stolen and new SIM inserted) and can lock the app for security.
 */
import * as Cellular from 'expo-cellular';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SIM_FINGERPRINT_KEY = 'sim_fingerprint_secure';

/**
 * Request permission to read phone/cellular state (needed on Android for carrier info).
 * @returns {{ granted: boolean }}
 */
export async function requestCellularPermission() {
  try {
    if (Platform.OS !== 'android') return { granted: true };
    const { status } = await Cellular.getPermissionsAsync();
    if (status === 'granted') return { granted: true };
    const { status: newStatus } = await Cellular.requestPermissionsAsync();
    return { granted: newStatus === 'granted' };
  } catch (error) {
    console.error('Cellular permission error:', error);
    return { granted: false };
  }
}

/**
 * Build a fingerprint string from current SIM/carrier info.
 * Returns null if no SIM, no permission, or unavailable.
 * @returns {Promise<string|null>}
 */
export async function getSimFingerprint() {
  try {
    if (Platform.OS === 'android') {
      const { granted } = await requestCellularPermission();
      if (!granted) return null;
    }

    const [carrier, mcc, mnc] = await Promise.all([
      Cellular.getCarrierNameAsync(),
      Cellular.getMobileCountryCodeAsync(),
      Cellular.getMobileNetworkCodeAsync(),
    ]);

    // No SIM or not ready
    if (carrier == null && mcc == null && mnc == null) return null;

    const parts = [carrier ?? '', mcc ?? '', mnc ?? ''];
    return parts.join('|').trim() || null;
  } catch (error) {
    console.error('getSimFingerprint error:', error);
    return null;
  }
}

/**
 * Save current SIM fingerprint to secure storage (call after successful login).
 */
export async function saveSimFingerprint() {
  try {
    const fingerprint = await getSimFingerprint();
    if (fingerprint) {
      await SecureStore.setItemAsync(SIM_FINGERPRINT_KEY, fingerprint);
    }
  } catch (error) {
    console.error('saveSimFingerprint error:', error);
  }
}

/**
 * Get the stored SIM fingerprint (from last login / trusted SIM).
 * @returns {Promise<string|null>}
 */
export async function getStoredSimFingerprint() {
  try {
    return await SecureStore.getItemAsync(SIM_FINGERPRINT_KEY);
  } catch (error) {
    console.error('getStoredSimFingerprint error:', error);
    return null;
  }
}

/**
 * Check if SIM has changed since last stored fingerprint.
 * - If no stored fingerprint (e.g. first login), returns { changed: false } and does not lock.
 * - If stored exists and current differs, returns { changed: true }.
 * - If current fingerprint unavailable (no SIM / no permission), returns { changed: false } to avoid false lock.
 * @returns {Promise<{ changed: boolean, currentFingerprint?: string, storedFingerprint?: string }>}
 */
export async function checkSimChange() {
  try {
    const stored = await getStoredSimFingerprint();
    const current = await getSimFingerprint();

    // First time: no stored fingerprint → don't treat as "change", caller can save after login
    if (!stored) {
      return { changed: false };
    }

    // Can't read current (no SIM / permission) → don't lock, might be temporary
    if (current == null || current === '') {
      return { changed: false };
    }

    if (stored !== current) {
      return { changed: true, currentFingerprint: current, storedFingerprint: stored };
    }

    return { changed: false };
  } catch (error) {
    console.error('checkSimChange error:', error);
    return { changed: false };
  }
}

/**
 * Clear stored SIM fingerprint (e.g. on logout or after locking due to SIM change).
 */
export async function clearStoredSimFingerprint() {
  try {
    await SecureStore.deleteItemAsync(SIM_FINGERPRINT_KEY);
  } catch (error) {
    console.error('clearStoredSimFingerprint error:', error);
  }
}

