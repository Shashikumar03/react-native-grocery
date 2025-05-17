import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Octicons from '@expo/vector-icons/Octicons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

export default function CustomHeader() {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  const placeholderOptions = ["onion", "egg", "milk", "paneer", "oil", "apple"];

  const backgroundColors = ['#add8e6', '#90ee90', '#ffcccb', '#d3d3d3', '#f0e68c'];

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
  }, []);

  // Animate background color loop
  useEffect(() => {
    let index = 0;
    const animateBackground = () => {
      Animated.timing(backgroundAnim, {
        toValue: index + 1,
        duration: 2000,
        useNativeDriver: false,
      }).start(() => {
        index = (index + 1) % backgroundColors.length;
        backgroundAnim.setValue(index);
        animateBackground();
      });
    };
    animateBackground();
  }, []);

  const backgroundColor = backgroundAnim.interpolate({
    inputRange: backgroundColors.map((_, i) => i),
    outputRange: backgroundColors,
  });

  // Blinking delivery text
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleFetchUserDetails = () => {
    router.push("/user/current-user");
  };

  const handleSearchPress = () => {
    const query = placeholderOptions[placeholderIndex];
    router.push({ pathname: "/product/search", params: { query } });
  };

  return (
    <Animated.View style={[styles.mainContainer, { backgroundColor }]}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.appName}>Bazaario app</Text>
          <Animated.Text style={[styles.deliveryInfo, { opacity: blinkAnim }]}>
            Delivery in 20 Min
          </Animated.Text>
        </View>
        <TouchableOpacity onPress={handleFetchUserDetails}>
          <Octicons name="feed-person" size={38} color="black" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleSearchPress}>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={24} color="black" />
          <Animated.Text style={[styles.searchText, { transform: [{ translateY: translateYAnim }] }]}>
            {placeholderOptions[placeholderIndex]}
          </Animated.Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
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
    color: 'darkred',
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
