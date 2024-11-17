import { View, Text, StyleSheet, Animated } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Octicons from '@expo/vector-icons/Octicons';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CustomHeader() {
  const [placeholderIndex, setPlaceholderIndex] = useState(0); // Tracks the index of the current placeholder
  const translateYAnim = useRef(new Animated.Value(0)).current; // Animation for sliding up and down

  const placeholderOptions = [
    "Search sweets",
    "Search eggs",
    "Search paneer",
    "Search oil",
    "Search apples"
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Start slide-up animation
      Animated.timing(translateYAnim, {
        toValue: -20, // Move the text up by 50 pixels
        duration: 500, // Duration of the slide-up
        useNativeDriver: true,
      }).start(() => {
        // Once the first text slides up, update the placeholder
        setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholderOptions.length);

        // Reset the position of the text for the slide-in effect
        translateYAnim.setValue(15); // Start the next text from below (50 pixels down)

        // Start slide-in animation
        Animated.timing(translateYAnim, {
          toValue: 0, // Slide the new text up to its original position
          duration: 500, // Duration of the slide-in
          useNativeDriver: true,
        }).start();
      });
    }, 3000); // Update placeholder every 3 seconds

    // Cleanup the interval when component unmounts
    return () => clearInterval(intervalId);
  }, [translateYAnim]);

  return (
    <View>
      <View style={styles.mainContainer}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text>Grocery app</Text>
            <Text style={{ fontWeight: "bold" }}>Delivery in 20 Min</Text>
          </View>

          <Octicons name="feed-person" size={30} color="black" />
        </View>

        {/* Search Bar Section */}
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={24} color="black" />
          
          {/* Animated Text with Slide-Up and Slide-Down Effect */}
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
    marginLeft: 10, // Spacing between the icon and the text
    fontSize: 16, // Adjust text size
    color: "gray", // Placeholder-like color for the text
  },
});
