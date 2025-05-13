import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

export default function AllCategoriesFromApi() {
  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.text}>In developinh Phase</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // Light gray background
  },
  box: {
    backgroundColor: '#ffffff', // White box background
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});