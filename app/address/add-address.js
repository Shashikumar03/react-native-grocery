import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getCurrentUserId } from '../../utils/token';
import { addNewDeliveryAddress } from '../../service/deliveryAddress/AddNewDeliveryAddress';

export default function AddAddress() {
  const [formData, setFormData] = useState({
    address: '',
    landmark: '',
    mobile: '',
    city: '',
    state: '',
    pin: '',
  });
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { address, landmark, mobile, city, state, pin } = formData;

    if (!address || !landmark || !mobile || !city || !state || !pin) {
      Alert.alert('Validation Error', 'All fields are required.');
      return false;
    }

    if (!/^\d{10}$/.test(mobile)) {
      Alert.alert('Validation Error', 'Mobile number must be 10 digits.');
      return false;
    }

    if (!/^\d{6}$/.test(pin)) {
      Alert.alert('Validation Error', 'PIN code must be 6 digits.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userId = await getCurrentUserId();
      const addressData = { ...formData, userId };

      const response = await addNewDeliveryAddress(userId, addressData);

      if (response.success) {
        ToastAndroid.show('Address added successfully!', ToastAndroid.SHORT);
        router.push('/cart'); // Navigate back to Cart
      } else {
        Alert.alert('Error', response.data || 'Failed to add address.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while adding the address.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Add New Address</Text>

        <TextInput
          style={styles.input}
          placeholder="Address"
          value={formData.address}
          onChangeText={(text) => handleInputChange('address', text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Landmark"
          value={formData.landmark}
          onChangeText={(text) => handleInputChange('landmark', text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          value={formData.mobile}
          onChangeText={(text) => handleInputChange('mobile', text)}
          keyboardType="numeric"
          maxLength={10}
        />

        <TextInput
          style={styles.input}
          placeholder="City"
          value={formData.city}
          onChangeText={(text) => handleInputChange('city', text)}
        />

        <TextInput
          style={styles.input}
          placeholder="State"
          value={formData.state}
          onChangeText={(text) => handleInputChange('state', text)}
        />

        <TextInput
          style={styles.input}
          placeholder="PIN Code"
          value={formData.pin}
          onChangeText={(text) => handleInputChange('pin', text)}
          keyboardType="numeric"
          maxLength={6}
        />

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Address'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 16,
    paddingBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
    backgroundColor: '#fafafa',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
  },
});
