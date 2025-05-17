
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert, Modal, ScrollView } from 'react-native';
import { getToken, removeToken, clearSession } from '../../utils/token';
import { useRouter } from 'expo-router';
import { getLoginUserDetails } from '../../service/Login/GetLoginUserDetails';
import { getUserById } from '../../service/Login/userUserById';

export default function CurrentUser() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const router = useRouter();

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
            await clearSession();
            router.replace('/login');
          } catch {
            Alert.alert('Error', 'Something went wrong during logout.');
          }
        },
      },
    ]);
  };

  const handleAboutPress = () => {
    setShowAboutModal(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Error loading user details</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>User Details</Text>
      <Text style={styles.label}>👤 Name: {userData.name || 'N/A'}</Text>
      <Text style={styles.label}>📧 Email: {userData.email || 'N/A'}</Text>
      <Text style={styles.label}>📱 Mobile: {userData.phoneNumber || 'N/A'}</Text>
      <Text style={styles.label}>👤 Role: {userData.role || 'N/A'}</Text>
      <View style={styles.logoutButton}>
        <Button title="Logout" color="red" onPress={handleLogout} />
      </View>
      <View style={styles.aboutButton}>
        <Button title="About the App" onPress={handleAboutPress} />
      </View>

      {/* Modal for About the App */}
      <Modal
        visible={showAboutModal}
        animationType="slide"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalHeading}>About BAZZARIO</Text>
          <Text style={styles.modalText}>
            BAZZARIO is your go-to mobile app for seamless shopping and personalized services. 
            Explore a wide range of products, manage your profile, and enjoy a tailored user 
            experience designed to make your life easier.
          </Text>

          <Text style={styles.modalSubHeading}>App Policy</Text>
          <Text style={styles.modalText}>
            By using BAZZARIO, you agree to use the app responsibly and in compliance with 
            all applicable laws. We collect and process personal data (e.g., name, email, phone) 
            to provide and improve our services, as outlined in our Privacy Policy. Unauthorized 
            use, including sharing accounts or engaging in fraudulent activities, may result in 
            account suspension. For full terms, please visit our website.
          </Text>

          <Text style={styles.modalSubHeading}>Copyright</Text>
          <Text style={styles.modalText}>
            © 2025 BAZZARIO Inc. All rights reserved. The BAZZARIO app, its content, and design 
            are protected by copyright and trademark laws. Unauthorized reproduction or 
            distribution is prohibited.
          </Text>

          <Text style={styles.modalSubHeading}>Customer Support</Text>
          <Text style={styles.modalText}>
            For assistance, contact our support team:{'\n'}
            - Phone: 919341285445 (Toll-free, 9 AM–6 PM EST, EVERYDAY){'\n'}
            - Email: support@bazzario.com{'\n'}
           
          </Text>

          <View style={styles.modalButton}>
            <Button
              title="Close"
              color="red"
              onPress={() => setShowAboutModal(false)}
            />
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 50 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  label: { fontSize: 16, marginVertical: 6 },
  logoutButton: { marginTop: 30 },
  aboutButton: { marginTop: 15 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContainer: { 
    flexGrow: 1, 
    padding: 20, 
    backgroundColor: '#fff',
    marginTop: 30,
  },
  modalHeading: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 15,
    textAlign: 'center',
  },
  modalSubHeading: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginTop: 20, 
    marginBottom: 10,
  },
  modalText: { 
    fontSize: 14, 
    color: '#333', 
    lineHeight: 22,
  },
  modalButton: { 
    marginTop: 30, 
    marginBottom: 20,
  },
});

// // xaiArtifact for App Policy and Copyright
// <xaiArtifact artifact_id="67a158d0-24a2-4dab-a222-aa3f06185d3a" artifact_version_id="177c3327-01d6-45ad-90d5-1cd2c4eb29ae" title="BAZZARIO App Policy and Copyright" contentType="text/markdown">
// ### App Policy
// By using BAZZARIO, you agree to use the app responsibly and in compliance with all applicable laws. We collect and process personal data (e.g., name, email, phone) to provide and improve our services, as outlined in our Privacy Policy. Unauthorized use, including sharing accounts or engaging in fraudulent activities, may result in account suspension. For full terms, please visit our website.

// ### Copyright
// © 2025 BAZZARIO Inc. All rights reserved. The BAZZARIO app, its content, and design are protected by copyright and trademark laws. Unauthorized reproduction or distribution is prohibited.

// ### Customer Support
// For assistance, contact our support team:
// - **Phone**: 1-800-229-9274 (Toll-free, 9 AM–6 PM EST, Mon–Fri)
// - **Email**: support@bazzario.com
// - **In-App Chat**: Available via the app’s Help Center