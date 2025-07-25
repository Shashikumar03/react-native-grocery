
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { userLogin } from '../../service/Login/Login';
import { saveTokenForUser, getToken } from '../../utils/token';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade-in animation on mount
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Check login status
    const checkLogin = async () => {
      const token = await getToken();
      if (token) setIsLoggedIn(true);
    };
    checkLogin();
  }, []);

  const handleLogin = async () => {
    if (!identifier) {
      Alert.alert('Missing Input', 'Please enter email or mobile number.');
      return;
    }

    const isMobile = /^[6-9]\d{9}$/.test(identifier.trim());
    const formattedIdentifier = isMobile ? `+91${identifier.trim()}` : identifier.trim();

    setLoading(true);
    try {
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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1E3A8A', '#3B82F6']}
        style={styles.background}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
            <Text style={styles.title}>Bazzario</Text>
            <Text style={styles.subtitle}>
              {isLoggedIn ? 'Welcome Back!' : 'Login to Continue'}
            </Text>

            <TextInput
              placeholder="Email or Mobile Number"
              value={identifier}
              style={[styles.input, isFocused && styles.inputFocused]}
              onChangeText={setIdentifier}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#6B7280"
              accessibilityLabel="Email or mobile number input"
              accessibilityHint="Enter your email address or mobile number to login"
            />

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={styles.loginButton}
              accessibilityLabel="Login button"
              accessibilityHint="Submits your login credentials"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/register')}
              accessibilityLabel="Register link"
              accessibilityHint="Navigates to the registration page"
              accessibilityRole="button"
            >
              <Text style={styles.registerText}>New user? Register here</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    marginHorizontal: 16,
    paddingVertical: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#F9FAFB',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputFocused: {
    borderColor: '#10B981',
    shadowOpacity: 0.2,
  },
  loginButton: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonGradient: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});