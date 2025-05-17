import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { userLogin } from '../../service/Login/Login';
import { saveTokenForUser, getToken } from '../../utils/token';
import { router } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    if (!email || !password) {
      Alert.alert('Missing Credentials', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await userLogin(email, password);
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
      <Text style={styles.welcome}>{isLoggedIn ? 'Welcome TO BAZZARIO' : 'Please login to continue'}</Text>

      <TextInput
        placeholder="Email"
        value={email}
        style={styles.input}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        value={password}
        style={styles.input}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.register}>New user? Register here</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  welcome: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 5,
    padding: 10, marginBottom: 15
  },
  register: { color: '#007bff', marginTop: 15, textAlign: 'center' },
});
