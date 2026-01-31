import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getCurrentUserId } from '../../utils/token';
import { addNewDeliveryAddress } from '../../service/deliveryAddress/AddNewDeliveryAddress';
import { requestLocationPermission, getCurrentAddress } from '../../service/location/requestLocationPermission';

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
  const [locationLoading, setLocationLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const router = useRouter();

  useEffect(() => {
    const prefillWithCurrentLocation = async () => {
      setLocationLoading(true);
      try {
        const { granted } = await requestLocationPermission();
        if (!granted) {
          setLocationLoading(false);
          return;
        }
        const addr = await getCurrentAddress();
        if (addr) {
          setFormData((prev) => ({
            ...prev,
            address: addr.address || prev.address,
            landmark: addr.landmark || prev.landmark,
            city: addr.city || prev.city,
            state: addr.state || prev.state,
            pin: addr.pin || prev.pin,
          }));
        }
      } catch (e) {
        console.error('Prefill address failed:', e);
      } finally {
        setLocationLoading(false);
      }
    };
    prefillWithCurrentLocation();
  }, []);

  const handleUseCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { granted } = await requestLocationPermission();
      if (!granted) {
        Alert.alert('Location', 'Allow location access to use current address.');
        setLocationLoading(false);
        return;
      }
      const addr = await getCurrentAddress();
      if (addr) {
        setFormData((prev) => ({
          ...prev,
          address: addr.address || prev.address,
          landmark: addr.landmark || prev.landmark,
          city: addr.city || prev.city,
          state: addr.state || prev.state,
          pin: addr.pin || prev.pin,
        }));
        ToastAndroid.show('Address filled from current location', ToastAndroid.SHORT);
      } else {
        ToastAndroid.show('Could not get current address', ToastAndroid.SHORT);
      }
    } catch (e) {
      ToastAndroid.show('Failed to get location', ToastAndroid.SHORT);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const { address, landmark, mobile, city, state, pin } = formData;
    const newErrors = {};

    if (!address?.trim()) newErrors.address = 'Please fill the details';
    if (!landmark?.trim()) newErrors.landmark = 'Please fill the details';
    if (!mobile?.trim()) newErrors.mobile = 'Please fill the details';
    else if (!/^\d{10}$/.test(mobile.trim())) newErrors.mobile = 'Mobile number must be 10 digits';
    if (!city?.trim()) newErrors.city = 'Please fill the details';
    if (!state?.trim()) newErrors.state = 'Please fill the details';
    if (!pin?.trim()) newErrors.pin = 'Please fill the details';
    else if (!/^\d{6}$/.test(pin.trim())) newErrors.pin = 'PIN code must be 6 digits';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

        <TouchableOpacity
          style={styles.useLocationButton}
          onPress={handleUseCurrentLocation}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="my-location" size={20} color="#fff" />
          )}
          <Text style={styles.useLocationButtonText}>
            {locationLoading ? 'Getting location...' : 'Use current location'}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={[styles.input, errors.address && styles.inputError]}
          placeholder="Address"
          value={formData.address}
          onChangeText={(text) => handleInputChange('address', text)}
        />
        {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}

        <TextInput
          style={[styles.input, errors.landmark && styles.inputError]}
          placeholder="Landmark"
          value={formData.landmark}
          onChangeText={(text) => handleInputChange('landmark', text)}
        />
        {errors.landmark ? <Text style={styles.errorText}>{errors.landmark}</Text> : null}

        <TextInput
          style={[styles.input, errors.mobile && styles.inputError]}
          placeholder="Mobile Number"
          value={formData.mobile}
          onChangeText={(text) => handleInputChange('mobile', text)}
          keyboardType="numeric"
          maxLength={10}
        />
        {errors.mobile ? <Text style={styles.errorText}>{errors.mobile}</Text> : null}

        <TextInput
          style={[styles.input, errors.city && styles.inputError]}
          placeholder="City"
          value={formData.city}
          onChangeText={(text) => handleInputChange('city', text)}
        />
        {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}

        <TextInput
          style={[styles.input, errors.state && styles.inputError]}
          placeholder="State"
          value={formData.state}
          onChangeText={(text) => handleInputChange('state', text)}
        />
        {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}

        <TextInput
          style={[styles.input, errors.pin && styles.inputError]}
          placeholder="PIN Code"
          value={formData.pin}
          onChangeText={(text) => handleInputChange('pin', text)}
          keyboardType="numeric"
          maxLength={6}
        />
        {errors.pin ? <Text style={styles.errorText}>{errors.pin}</Text> : null}

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
  useLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 20,
    gap: 8,
  },
  useLocationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 14,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: '#fafafa',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 4,
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
