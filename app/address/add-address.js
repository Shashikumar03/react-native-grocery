import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ToastAndroid,
    Alert,
  } from 'react-native';
  import React, { useState } from 'react';
  import { useRouter } from 'expo-router';
  import { getCurrentUserId } from '../../utils/token';
import { addNewDeliveryAddress } from '../../service/deliveryAddress/AddNewDeliveryAddress';
  
  // Placeholder for the API service (implement as needed)
  const createDeliveryAddress = async (addressData) => {
    try {
      // Simulate API call (replace with actual API implementation)
      console.log("Sending address data:", addressData);
      // Example: const response = await fetch('your-api-endpoint', { method: 'POST', body: JSON.stringify(addressData) });
      return { success: true, data: { deliveryAddressId: Math.random() } }; // Mock response
    } catch (error) {
      console.error("Error creating address:", error);
      return { success: false, message: error.message };
    }
  };
  
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
        const response = await addNewDeliveryAddress(userId,addressData);
  
        if (response.success) {
          ToastAndroid.show('Address added successfully!', ToastAndroid.SHORT);
          router.push('/cart'); // Navigate back to Cart
        } else {
          Alert.alert('Error', response.data || 'Failed to add address.');
        }
      } catch (error) {
        Alert.alert('Error', 'Something went wrong while adding the address.');
        console.error("Submit error:", error);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <View style={styles.container}>
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
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Address'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#ffffff',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 20,
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      padding: 12,
      borderRadius: 8,
      marginBottom: 15,
      backgroundColor: '#f8f9fa',
      fontSize: 16,
    },
    saveButton: {
      backgroundColor: '#28a745',
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 10,
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
    },
    disabledButton: {
      backgroundColor: '#ccc',
    },
  });