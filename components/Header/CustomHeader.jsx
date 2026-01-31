import { View, Text, StyleSheet, Animated, TouchableOpacity, Image } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Octicons from '@expo/vector-icons/Octicons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import InfoBanner from './InfoBanner';

export default function CustomHeader() {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;
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
        <View style={styles.headerLeft}>
          {/* <Image source={require('../../assets/images/icon.png')} style={styles.logo} /> */}
          <View>
            <Text style={styles.appName}>Bazzario</Text>
            <Text style={styles.deliveryInfo}>Delivery in 20 Min</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleFetchUserDetails} style={styles.iconBtn}>
            <Octicons name="feed-person" size={36} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSearchPress} style={styles.iconBtn}>
            <Ionicons name="search" size={28} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <InfoBanner id="release-2026-01-30" message="New: Faster checkout and improved cart UX — tap the cart to view items." type="info" duration={0} />
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
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 48, height: 48, marginRight: 12, borderRadius: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { marginLeft: 8, padding: 6 },
});
