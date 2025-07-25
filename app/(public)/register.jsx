
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated, // Ensure Animated is imported
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sendOtp } from '../../service/sms/Sms';

const { width } = Dimensions.get('window');

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong.</Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false })}
            style={styles.retryButton}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Retry</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function Register() {
  console.log('Register: Mounting');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
    phoneNumber: '',
  });
  console.log('Register: useState initialized');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('Register: useEffect ran');
    // Delay rendering to stabilize navigation
    setTimeout(() => setIsReady(true), 100);
    // Fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    return () => console.log('Register: Unmounting');
  }, []);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async () => {
    const { name, email, password, phoneNumber } = form;

    if (!name || !email || !password || !phoneNumber) {
      Alert.alert('Validation Error', 'All fields are required');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Validation Error', 'Invalid email format');
      return;
    }

    if (password.length < 3) {
      Alert.alert('Validation Error', 'Password must be at least 3 characters');
      return;
    }

    const formattedPhoneNumber = phoneNumber.startsWith('+91')
      ? phoneNumber
      : `+91${phoneNumber}`;
    const updatedForm = { ...form, phoneNumber: formattedPhoneNumber };

    try {
      setLoading(true);
      const result = await sendOtp(formattedPhoneNumber);
      console.log('result of send otp: ', result.data);

      if (result.success) {
        setForm({
          name: '',
          email: '',
          password: '',
          role: 'CUSTOMER',
          phoneNumber: '',
        });
        router.push({
          pathname: '/otp-verification',
          params: { formData: JSON.stringify(updatedForm) },
        });
      } else {
        Alert.alert('OTP Error', result.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) {
    return null; // Delay rendering to avoid navigation conflicts
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1E3A8A', '#3B82F6']}
          style={styles.background}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
                <Text style={styles.title}>Bazzario</Text>
                <Text style={styles.subtitle}>Create Your Account</Text>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={focusedField === 'name' ? '#10B981' : '#6B7280'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Name"
                    style={[styles.input, focusedField === 'name' && styles.inputFocused]}
                    onChangeText={(val) => handleChange('name', val)}
                    value={form.name}
                    placeholderTextColor="#6B7280"
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    accessibilityLabel="Name input"
                    accessibilityHint="Enter your full name"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={focusedField === 'email' ? '#10B981' : '#6B7280'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Email"
                    keyboardType="email-address"
                    style={[styles.input, focusedField === 'email' && styles.inputFocused]}
                    onChangeText={(val) => handleChange('email', val)}
                    value={form.email}
                    placeholderTextColor="#6B7280"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                    accessibilityLabel="Email input"
                    accessibilityHint="Enter your email address"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={focusedField === 'password' ? '#10B981' : '#6B7280'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Password"
                    secureTextEntry
                    style={[styles.input, focusedField === 'password' && styles.inputFocused]}
                    onChangeText={(val) => handleChange('password', val)}
                    value={form.password}
                    placeholderTextColor="#6B7280"
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    accessibilityLabel="Password input"
                    accessibilityHint="Enter your password (minimum 3 characters)"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={focusedField === 'phoneNumber' ? '#10B981' : '#6B7280'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                    style={[styles.input, focusedField === 'phoneNumber' && styles.inputFocused]}
                    onChangeText={(val) => handleChange('phoneNumber', val)}
                    value={form.phoneNumber}
                    placeholderTextColor="#6B7280"
                    onFocus={() => setFocusedField('phoneNumber')}
                    onBlur={() => setFocusedField(null)}
                    accessibilityLabel="Phone number input"
                    accessibilityHint="Enter your mobile number (e.g., 9876543210)"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  style={styles.registerButton}
                  accessibilityLabel="Register button"
                  accessibilityHint="Submits your registration details and sends OTP"
                  accessibilityRole="button"
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.buttonText}>Register</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/login')}
                  accessibilityLabel="Login link"
                  accessibilityHint="Navigates to the login page"
                  accessibilityRole="button"
                >
                  <Text style={styles.loginText}>Already have an account? Login</Text>
                </TouchableOpacity>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    </ErrorBoundary>
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
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    paddingLeft: 40,
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
  registerButton: {
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
  loginText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    width: '50%',
    borderRadius: 12,
  },
});
