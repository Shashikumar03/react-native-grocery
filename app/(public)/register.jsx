import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { sendOtp } from '../../service/sms/Sms';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'CUSTOMER',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async () => {
    const { name, email, password, address, phoneNumber } = form;

    if (!name || !email || !password || !address || !phoneNumber) {
      Alert.alert('Validation Error', 'All fields are required');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Validation Error', 'Invalid email format');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return;
    }

    const formattedPhoneNumber = phoneNumber.startsWith('+91')
      ? phoneNumber
      : `+91${phoneNumber}`;
    const updatedForm = { ...form, phoneNumber: formattedPhoneNumber };

    try {
      setLoading(true);
      const result = await sendOtp(formattedPhoneNumber);
      console.log("result of send otp: ", result.data);

      if (result.success) {
        setForm({
          name: '',
          email: '',
          password: '',
          address: '',
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        placeholder="Name"
        style={styles.input}
        onChangeText={(val) => handleChange('name', val)}
        value={form.name}
        placeholderTextColor="#000"
      />

      <TextInput
        placeholder="Email"
        keyboardType="email-address"
        style={styles.input}
        onChangeText={(val) => handleChange('email', val)}
        value={form.email}
        placeholderTextColor="#000"
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        onChangeText={(val) => handleChange('password', val)}
        value={form.password}
        placeholderTextColor="#000"
      />

      <TextInput
        placeholder="Address"
        style={styles.input}
        onChangeText={(val) => handleChange('address', val)}
        value={form.address}
        placeholderTextColor="#000"
      />

      <TextInput
        placeholder="Phone Number"
        keyboardType="phone-pad"
        style={styles.input}
        onChangeText={(val) => handleChange('phoneNumber', val)}
        value={form.phoneNumber}
        placeholderTextColor="#000"
      />

      <View style={styles.button}>
        {loading ? (
          <ActivityIndicator size="large" color="#0066cc" />
        ) : (
          <Button title="Register" onPress={handleSubmit} disabled={loading} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    color: '#000', // ensures text color is black
  },
  button: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
  },
});
