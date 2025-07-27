import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { userLogin } from '../../service/Login/Login';
import { saveTokenForUser, getToken } from '../../utils/token';
import { router } from 'expo-router';

export default function Login() {
  const [identifier, setIdentifier] = useState(''); // Can hold email or mobile
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await getToken();
      if (token) setIsLoggedIn(true);
    };
    checkLogin();
  }, []);

  const handleLogin = async () => {
    if (!identifier) {
      Alert.alert('Missing Info', 'Please enter your email or mobile number.');
      return;
    }

    // If identifier is mobile number, prepend +91
    let formattedIdentifier = identifier;
    const isMobile = /^[0-9]{10}$/.test(identifier);
    if (isMobile) {
      formattedIdentifier = `+91${identifier}`;
    }

    setLoading(true);
    try {
      // Updated userLogin to send identifier without password
      const res = await userLogin(formattedIdentifier); 
      const token = res.data.jwtToken;
      const userId = res.data.user.id;

      if (token && userId) {
        await saveTokenForUser(userId, token);
        router.push('/home');
      } else {
        Alert.alert('Login Failed', 'Invalid credentials received.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        {isLoggedIn ? 'Welcome TO BAZZARIO' : 'Please login to continue'}
      </Text>

      <TextInput
        placeholder="Email or Mobile Number"
        value={identifier}
        style={styles.input}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        keyboardType="email-address" // allows email but you may change to 'phone-pad'
        placeholderTextColor="#000"
      />

      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.register}>New user? Register here</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f0f8ff', // ✅ Custom background color
  },
  welcome: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    color: '#000',
    backgroundColor: '#fff', // ✅ Input background
  },
  register: {
    color: '#007bff',
    marginTop: 15,
    textAlign: 'center',
  },
});
