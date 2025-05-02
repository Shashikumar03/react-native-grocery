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

export async function saveUserId(userId) {
  try {
    await SecureStore.setItemAsync('userId', userId.toString());
    console.log("User ID saved successfully");
  } catch (error) {
    console.error("Error saving user ID:", error);
  }
}

// Retrieve user ID securely
export async function getUserId() {
  try {
    const userId = await SecureStore.getItemAsync('userId');
    console.log("Retrieved user ID:", userId);
    return userId;
  } catch (error) {
    console.error("Error retrieving user ID:", error);
    return null;
  }
}

// Remove user ID securely (optional for logout)
export async function removeUserId() {
  try {
    await SecureStore.deleteItemAsync('userId');
    console.log("User ID removed successfully");
  } catch (error) {
    console.error("Error removing user ID:", error);
  }
}