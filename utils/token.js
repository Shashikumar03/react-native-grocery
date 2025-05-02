// utils/token.js
import * as SecureStore from 'expo-secure-store';

// Save the JWT token securely
export async function saveToken(token) {
  try {
    await SecureStore.setItemAsync('jwt', token);
    console.log("Token saved successfully");
  } catch (error) {
    console.error("Error saving token:", error);
  }
}

// Retrieve the JWT token securely
export async function getToken() {
  try {
    const token = await SecureStore.getItemAsync('jwt');
    console.log("Retrieved token:", token);
    return token;
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
}

// Remove the token securely (for logout)
export async function removeToken() {
  try {
    await SecureStore.deleteItemAsync('jwt');
    console.log("Token removed successfully");
  } catch (error) {
    console.error("Error removing token:", error);
  }
}
