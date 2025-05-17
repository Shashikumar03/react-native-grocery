import * as SecureStore from 'expo-secure-store';

// Save current logged-in userId
export async function saveCurrentUserId(userId) {
  try {
    await SecureStore.setItemAsync('currentUserId', userId.toString());
  } catch (error) {
    console.error('Error saving current userId:', error);
  }
}

// Get current logged-in userId
export async function getCurrentUserId() {
  try {
    return await SecureStore.getItemAsync('currentUserId');
  } catch (error) {
    console.error('Error getting current userId:', error);
    return null;
  }
}

// Remove current logged-in userId
export async function removeCurrentUserId() {
  try {
    await SecureStore.deleteItemAsync('currentUserId');
  } catch (error) {
    console.error('Error removing current userId:', error);
  }
}

// Save token for a specific userId
export async function saveTokenForUser(userId, token) {
  try {
    await SecureStore.setItemAsync(`token_${userId}`, token);
    // Optionally save this userId as current logged-in user
    await saveCurrentUserId(userId);
    console.log(`Token saved for user ${userId}`);
  } catch (error) {
    console.error(`Error saving token for user ${userId}:`, error);
  }
}

// Get token for a specific userId
export async function getTokenForUser(userId) {
  try {
    return await SecureStore.getItemAsync(`token_${userId}`);
  } catch (error) {
    console.error(`Error getting token for user ${userId}:`, error);
    return null;
  }
}

// Get token for current logged-in user
export async function getToken() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn('No current user logged in');
      return null;
    }
    return await getTokenForUser(userId);
  } catch (error) {
    console.error('Error getting token for current user:', error);
    return null;
  }
}

// Remove token for specific userId
export async function removeTokenForUser(userId) {
  try {
    await SecureStore.deleteItemAsync(`token_${userId}`);
  } catch (error) {
    console.error(`Error removing token for user ${userId}:`, error);
  }
}

// Remove token for current logged-in user
export async function removeToken() {
  try {
    const userId = await getCurrentUserId();
    if (userId) {
      await removeTokenForUser(userId);
    }
    await removeCurrentUserId();
  } catch (error) {
    console.error('Error removing token for current user:', error);
  }
}

// Clear all saved data (tokens for all users + current userId)
export async function clearSession() {
  try {
    // You might want to keep track of all userIds you saved tokens for,
    // but if not, you can only clear current user token here:
    await removeToken();
    // Add other keys to clear if needed
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}
