import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { resendOtp, verifyOtp } from '../../service/sms/Sms';
import { createUser } from '../../service/User/CreateUser';

export default function OtpVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();
  const { formData } = useLocalSearchParams();
  const parsedFormData = formData ? JSON.parse(formData) : {};

  const otpRefs = useRef([]);
  otpRefs.current = new Array(6)
    .fill(null)
    .map((_, i) => otpRefs.current[i] ?? React.createRef());

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1].current.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (!otpString || otpString.length !== 6) {
      Alert.alert('Validation Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setVerifying(true);
      const result = await verifyOtp(parsedFormData?.phoneNumber, otpString);
      if (result.success) {
        Alert.alert('Success', 'OTP verified successfully and customer registered');
        const response = await createUser(parsedFormData);
        if (response.success) {
          Alert.alert('Success', 'New User is created successfully');
          router.replace('/login');
        } else {
          Alert.alert('Failed', 'New User is not created: ' + response.data.message);
          router.replace('/register');
        }
      } else {
        Alert.alert('Verification Failed', result.data.message || 'Failed to verify OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while verifying OTP');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResending) return;

    setIsResending(true);
    try {
      const result = await resendOtp(parsedFormData?.phoneNumber);
      if (result.success) {
        Alert.alert('Success', 'OTP sent again!');
      } else {
        Alert.alert('Failed', result.data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while resending OTP');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>OTP Verification</Text>
      <Text style={styles.subtitle}>An OTP was sent to {parsedFormData?.phoneNumber}</Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.otpInput}
            placeholder="●"
            maxLength={1}
            keyboardType="numeric"
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            ref={otpRefs.current[index]}
            autoFocus={index === 0}
          />
        ))}
      </View>

      <TouchableOpacity
        onPress={handleVerify}
        style={[styles.verifyButton, verifying && styles.disabledButton]}
        disabled={verifying}
      >
        <Text style={styles.buttonText}>
          {verifying ? 'Verifying...' : 'Verify OTP'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleResendOtp}
        style={[styles.resendButton, isResending && styles.disabledButton]}
        disabled={isResending}
      >
        <Text style={styles.resendText}>
          {isResending ? 'Resending...' : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    marginHorizontal: 5,
  },
  verifyButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  resendText: {
    fontSize: 16,
    color: '#0066cc',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  backText: {
    fontSize: 18,
    color: '#0066cc',
  },
});
