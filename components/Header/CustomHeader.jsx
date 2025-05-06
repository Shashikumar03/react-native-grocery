import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Octicons from '@expo/vector-icons/Octicons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

export default function CustomHeader() {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const placeholderOptions = [
    "sweet",
    "egg",
    "paneer",
    "oil",
    "apples"
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

  const handleFetchUserDetails = () => {
    router.push("/user/current-user");
  };

  const handleSearchPress = () => {
    const query = placeholderOptions[placeholderIndex];
    router.push({ pathname: "/product//search", params: { query } });
  };

  return (
    <View>
      <View style={styles.mainContainer}>
        {/* Top Header */}
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.appName}>Grocery app</Text>
            <Text style={styles.deliveryInfo}>Delivery in 20 Min</Text>
          </View>

          <TouchableOpacity onPress={handleFetchUserDetails}>
            <Octicons name="feed-person" size={30} color="black" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity onPress={handleSearchPress}>
          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={24} color="black" />
            <Animated.Text style={[styles.searchText, { transform: [{ translateY: translateYAnim }] }]}>
              {placeholderOptions[placeholderIndex]}
            </Animated.Text>
          </View>
        </TouchableOpacity>
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
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appName: {
    fontSize: 18,
    fontWeight: "600",
  },
  deliveryInfo: {
    fontWeight: "bold",
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
