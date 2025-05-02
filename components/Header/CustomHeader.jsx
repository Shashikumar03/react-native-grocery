import { View, Text, StyleSheet, Animated, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Octicons from '@expo/vector-icons/Octicons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getToken } from '../../utils/token';
import { useRouter } from 'expo-router'; // Import the router for navigation

export default function CustomHeader() {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter(); // Initialize the router for navigation

  const placeholderOptions = [
    "Search sweets",
    "Search eggs",
    "Search paneer",
    "Search oil",
    "Search apples"
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      Animated.timing(translateYAnim, {
        toValue: -20,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholderOptions.length);
        translateYAnim.setValue(15);
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [translateYAnim]);

  const handleFetchUserDetails = async () => {
    
    router.push("/user/current-user"); // Navigate to the user details page using router.push
  };

  return (
    <View>
      <View style={styles.mainContainer}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text>Grocery app</Text>
            <Text style={{ fontWeight: "bold" }}>Delivery in 20 Min</Text>
          </View>

          {/* ✅ Make top-right person icon clickable */}
          <TouchableOpacity onPress={handleFetchUserDetails}>
            <Octicons name="feed-person" size={30} color="black" />
          </TouchableOpacity>
        </View>

        {/* Search Bar Section */}
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={24} color="black" />
          <Animated.Text style={[styles.searchText, { transform: [{ translateY: translateYAnim }] }]}>
            {placeholderOptions[placeholderIndex]}
          </Animated.Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: "lightblue",
    padding: 10,
    borderRadius: 10,
  },
  searchBarContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
  },
  searchText: {
    marginLeft: 10,
    fontSize: 16,
    color: "gray",
  },
});
