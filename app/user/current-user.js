import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert } from 'react-native';
import { getToken, removeToken } from '../../utils/token';
import { useRouter } from 'expo-router';
import { getLoginUserDetails } from '../../service/Login/GetLoginUserDetails';
import { getUserById } from '../../service/Login/userUserById';

export default function CurrentUser() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch the user details when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await getToken();
        if (!token) {
          Alert.alert("Error", "No token found");
          router.replace("/login"); // Redirect to login if token doesn't exist
          return;
        }

        // Call API to get user details
        const response = await getLoginUserDetails(token);
        if (response.success) {
          const userId=response.data.userId;
          const currentUser= await getUserById(userId)
          setUserData(currentUser.data)
        } else {
          console.log(response.data)
          if(response.data==="Given jwt token is expired !!"){
            router.push("/login")
          }
          Alert.alert("Failed", "Could not fetch user details");
         
        }
      } catch (error) {
        // Error handling for any unexpected failures (e.g., network issues)
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Something went wrong. Please try again.");
      } finally {
        setLoading(false); // Set loading to false once the request is complete
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await removeToken(); // Remove token to log out
      router.replace("/login"); // Redirect to login screen
    } catch (error) {
      Alert.alert("Error", "Something went wrong during logout.");
    }
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
      <Text style={styles.label}>👤 Name: {userData?.name || "N/A"}</Text>
      <Text style={styles.label}>📧 Email: {userData?.email || "N/A"}</Text>
      <Text style={styles.label}>📱 Mobile: {userData?.phoneNumber || "N/A"}</Text>
      <Text style={styles.label}>👤 ROLE: {userData?.role || "N/A"}</Text>

      <View style={styles.logoutButton}>
        <Button title="Logout" color="red" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 50,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginVertical: 10,
  },
  logoutButton: {
    marginTop: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
