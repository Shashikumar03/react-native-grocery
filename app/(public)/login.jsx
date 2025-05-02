// app/(public)/login.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Use navigation from react-navigation
import { saveToken, getToken, saveUserId } from '../../utils/token';  // Utility functions for token handling
import { userLogin } from '../../service/Login/Login';  // Login service
import { router } from 'expo-router';
import {Register} from "./register"

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const {router}=useRouter()

  const navigation = useNavigation(); // Initialize the navigation hook

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await getToken();  // Check if the token is available
      if (token) {
        setIsLoggedIn(true);  // If a token is found, set the user as logged in
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const loginResponse = await userLogin(email, password);  // Call your login function
      const token = loginResponse.data.jwtToken;  // Get the JWT token from the response
      await saveUserId(loginResponse.data.user.id)
      

      if (token) {
        await saveToken(token);  // Save the token securely
        router.push("/home");  // Replace current screen with Home (ensure 'Home' is correct)
      } else {
        Alert.alert('Error', 'Invalid login credentials.');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please check your credentials or try again later.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push("/register") // Navigate to the Register screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeMessage}>
        {isLoggedIn ? 'Welcome back!' : 'Welcome! Please login to continue'}
      </Text>

      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title={loading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        disabled={loading}
      />

      <TouchableOpacity onPress={navigateToRegister}>
        <Text style={styles.registerLink}>New User? Click here to Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeMessage: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  registerLink: {
    color: '#1E90FF',
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});
