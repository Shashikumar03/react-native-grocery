import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Button, ActivityIndicator,
  Alert, Modal, FlatList
} from 'react-native';
import { clearSession, getDeliveryAddressId, getToken, removeToken, saveDeliveryAddressId } from '../../utils/token';
import { useRouter } from 'expo-router';
import { getLoginUserDetails } from '../../service/Login/GetLoginUserDetails';
import { getUserById } from '../../service/Login/userUserById';
import { addNewDeliveryAddress } from '../../service/deliveryAddress/AddNewDeliveryAddress';
import { getAllDeliveryAddressOfUser } from '../../service/deliveryAddress/GetAllDeliveryAddressOfUser';
import AddressForm from '../../components/AddressForm';
import { getDeliveryAddressByItsId } from '../../service/deliveryAddress/GetDeliveryAddressByDeliveryId';
// import { deleteDeliveryAddress } from '../../service/deliveryAddress/DeleteDeliveryAddress';
// import AddressForm from './components/AddressForm'; // create this component

export default function CurrentUser() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editAddressIndex, setEditAddressIndex] = useState(null);
  const [addressForm, setAddressForm] = useState({
    address: '', landmark: '', mobile: '',
    city: '', state: '', pin: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const handleSelectInitalAddressId = async()=>{
    const deliveryAddressId=await getDeliveryAddressId()

   const response= await getDeliveryAddressByItsId(deliveryAddressId);
   if(response.success){
     setSelectedAddress(response.data)
   }else{
    Alert.alert('EMPTY', 'Initally address in not selected');
   }

   
   getDeliver
  }
  // AddressFormr
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await getToken();
        if (!token) {
          Alert.alert('Error', 'No token found');
          router.replace('/login');
          return;
        }

        const response = await getLoginUserDetails(token);
        if (response.success) {
          const userId = response.data.userId;
          const currentUser = await getUserById(userId);
          setUserData(currentUser.data);
        } else {
          if (response.data === 'Given jwt token is expired !!') {
            router.push('/login');
          }
          Alert.alert('Failed', 'Could not fetch user details');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    handleSelectInitalAddressId();
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeToken();
            await clearSession()
            router.replace('/login');
          } catch {
            Alert.alert('Error', 'Something went wrong during logout.');
          }
        }
      }
    ]);
  };

  const handleOpenAddressModal = async () => {
    try {
      const userId = userData?.id || userData?.userId;
      if (!userId) {
        Alert.alert('Error', 'User ID not found');
        return;
      }

      const response = await getAllDeliveryAddressOfUser(userId);
      if (response.success) {
        setAddresses(response.data);
        setShowAddressModal(true);
      } else {
        Alert.alert('Failed', response.data?.message || 'Failed to fetch addresses');
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      Alert.alert('Error', 'Something went wrong while loading addresses.');
    }
  };

  const handleSaveAddress = async () => {
    const errors = {};
    const { address, mobile, city, state, pin } = addressForm;

    if (!address.trim()) errors.address = 'Address is required';
    if (!mobile || !/^\d{10}$/.test(mobile)) errors.mobile = 'Enter a valid 10-digit mobile number';
    if (!city.trim()) errors.city = 'City is required';
    if (!state.trim()) errors.state = 'State is required';
    if (!/^\d{6}$/.test(pin)) errors.pin = 'Enter a valid 6-digit pin';

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    try {
      setSaving(true);
      const userId = userData?.id || userData?.userId;
      const response = await addNewDeliveryAddress(userId, addressForm);

      if (response.success) {
        const newAddress = response.data;

        if (editAddressIndex !== null) {
          const updated = [...addresses];
          updated[editAddressIndex] = newAddress;
          setAddresses(updated);
        } else {
          setAddresses([...addresses, newAddress]);
        }

        setAddressForm({ address: '', landmark: '', mobile: '', city: '', state: '', pin: '' });
        setEditAddressIndex(null);
        setFormErrors({});
        setShowFormModal(false);
        Alert.alert('Success', 'Address saved');
      } else {
        if (response.data.errors) {
          setFormErrors(response.data.errors);
          Alert.alert('Validation Failed', Object.values(response.data.errors).join('\n'));
        } else {
          Alert.alert('Failed', 'An unknown error occurred');
        }
      }
    } catch (error) {
      console.error('Save address error:', error);
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = (addressId) => {
    Alert.alert('Delete', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            // const response = await deleteDeliveryAddress(addressId);
            const response= null;
            if (response.success) {
              setAddresses(prev => prev.filter(addr => addr.deliveryAddressId !== addressId));
              Alert.alert('Success', 'Address deleted');
            } else {
              Alert.alert('Failed', 'Could not delete address');
            }
          } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Error deleting address');
          }
        }
      }
    ]);
  };

  const openEditForm = (address, index) => {
    setAddressForm(address);
    setEditAddressIndex(index);
    setShowAddressModal(false);
    setShowFormModal(true);
  };

  const openAddForm = () => {
    setAddressForm({
      address: '', landmark: '', mobile: '',
      city: '', state: '', pin: ''
    });
    setEditAddressIndex(null);
    setShowAddressModal(false);
    setShowFormModal(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Current User Info</Text>
      <Text style={styles.label}>👤 Name: {userData?.name}</Text>
      <Text style={styles.label}>📧 Email: {userData?.email}</Text>
      <Text style={styles.label}>📱 Mobile: {userData?.phoneNumber}</Text>
      <Text style={styles.label}>👤 Role: {userData?.role}</Text>

      <Button title="Manage Delivery Addresses" onPress={handleOpenAddressModal} />

      {selectedAddress && (
        <Text style={styles.label}>
          🚚 Selected: {selectedAddress.address}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pin}
        </Text>
      )}

      <View style={styles.logoutButton}>
        <Button title="Logout" color="red" onPress={handleLogout} />
      </View>

      {/* Address Modal */}
      <Modal visible={showAddressModal} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.heading}>Select Delivery Address</Text>
          <FlatList
            data={addresses}
            keyExtractor={(item) => item.deliveryAddressId.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.addressCard}>
                <Text>{item.address}, {item.city}, {item.state} - {item.pin}</Text>
                <Text>📞 {item.mobile}</Text>
                <Text>📍 {item.landmark}</Text>
                <View style={styles.buttonRow}>
                  <Button title="Select" onPress={async () => {
                    setSelectedAddress(item);
                    await saveDeliveryAddressId(item.deliveryAddressId);
                    setShowAddressModal(false);
                  }} />
                  <Button title="Edit" onPress={() => openEditForm(item, index)} />
                  <Button title="Delete" color="red" onPress={() => handleDeleteAddress(item.deliveryAddressId)} />
                </View>
              </View>
            )}
          />
          <Button title="Add New Address" onPress={openAddForm} />
          <Button title="Close" color="red" onPress={() => setShowAddressModal(false)} />
        </View>
      </Modal>

      {/* Address Form Modal */}
      <Modal visible={showFormModal} animationType="slide">
        <AddressForm
          formData={addressForm}
          onChange={setAddressForm}
          onSave={handleSaveAddress}
          onCancel={() => setShowFormModal(false)}
          errors={formErrors}
          saving={saving}
          isEdit={editAddressIndex !== null}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 50 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  label: { fontSize: 16, marginVertical: 6 },
  logoutButton: { marginTop: 30 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContainer: { flex: 1, padding: 20, marginTop: 30, backgroundColor: '#fff' },
  addressCard: { padding: 12, borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});
