import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';

export default function HomeCategory() {
  // State to track the selected category
  const [selectedCategory, setSelectedCategory] = useState('All'); // Default selected category

  // Array of categories with image URLs and titles
  const categories = [
    {
      title: 'All',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grocery-app-6fe52.appspot.com/o/images%2Fall.png?alt=media&token=d935eb4d-b79a-48c6-9ad4-eadfd17923e0',
    },
    {
        title:"Money Converter",
        imageUrl:"https://firebasestorage.googleapis.com/v0/b/grocery-app-6fe52.appspot.com/o/images%2Fcurrency-exchange.png?alt=media&token=3a48eab1-d7b2-4c08-b8cb-a1d4a9899e35"

    },
    {
        title:"Online money Transfer",
        imageUrl:"https://firebasestorage.googleapis.com/v0/b/grocery-app-6fe52.appspot.com/o/images%2Fmoney-transfer.png?alt=media&token=eed6bb16-f8dd-4c48-837a-280290577efe"
    },
    {
      title: 'Electronics',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grocery-app-6fe52.appspot.com/o/images%2Fgadgets.png?alt=media&token=bb16d675-721e-47dd-bedc-f551036f5bf7',
    },
    {
      title: 'Beauty',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grocery-app-6fe52.appspot.com/o/images%2Fmakeover.png?alt=media&token=181ad124-b9cf-4ad0-9212-d143a60f2ee2',
    },
    {
      title: 'Kids',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grocery-app-6fe52.appspot.com/o/images%2Ftoys.png?alt=media&token=d672905c-88c4-4a72-88eb-9155f95d4660',
    },
    {
      title: 'Gifts',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grocery-app-6fe52.appspot.com/o/images%2Fgift-box.png?alt=media&token=04bd62df-6f4d-4283-85c5-1274f13a0f6e',
    },
    {
        title:"Fast foods",
        imageUrl:"https://firebasestorage.googleapis.com/v0/b/grocery-app-6fe52.appspot.com/o/images%2Ffast-food.png?alt=media&token=2cbfe6a8-9a9a-4406-8a3e-3ddb8ca5c145"
    },
    {
        title:"Chicken",
        imageUrl:"https://firebasestorage.googleapis.com/v0/b/grocery-app-6fe52.appspot.com/o/images%2Fchicken.png?alt=media&token=4164db18-572e-49a6-9fef-b8147db807ab"
    },
    {
        title:"Vegetables",
        imageUrl:"https://firebasestorage.googleapis.com/v0/b/grocery-app-6fe52.appspot.com/o/images%2Fcornucopia.png?alt=media&token=b40f5bf7-3571-4358-8288-8ee3582de397"
    },
    {
        title:"Ice cream",
        imageUrl:"https://firebasestorage.googleapis.com/v0/b/grocery-app-6fe52.appspot.com/o/images%2Fice-cream-cone.png?alt=media&token=93d2e789-9e72-4d17-ad63-c556b1780809"
    },
    {
        title:"Sport",
        imageUrl:"https://firebasestorage.googleapis.com/v0/b/grocery-app-6fe52.appspot.com/o/images%2Fcricket.png?alt=media&token=6bea8f27-74b1-4a40-8add-c3adfad9d1f7"
    },
    {
        title:"Grocery Items",
        imageUrl:"https://firebasestorage.googleapis.com/v0/b/grocery-app-6fe52.appspot.com/o/images%2Fsupermarket.png?alt=media&token=269a674d-90d7-4e3d-a568-9b9711f8ca3d"
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity 
            key={category.title} 
            style={styles.card} 
            onPress={() => setSelectedCategory(category.title)} // Update selected category on press
          >
            <Image 
              source={{ uri: category.imageUrl }} 
              style={styles.image} 
              resizeMode="cover" // Adjusts the image display mode
            />
            <Text style={styles.title}>{category.title}</Text>
            {/* Underline for selected category */}
            {selectedCategory === category.title && <View style={styles.underline} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Partition line */}
      <View style={styles.partition} />

      {/* You can add more content below the partition line here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  card: {
    alignItems: 'center', // Center align items in the card
    marginRight: 15,
  },
  title: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2, // Space between the image and title
  },
  image: {
    width: 25, // Set a fixed width for the image
    height:25, // Set a fixed height for the image
    borderRadius: 10,
  },
  underline: {
    marginTop: 5, // Space above the underline
    width: 40, // Width of the underline
    height: 2, // Height of the underline
    backgroundColor: 'blue', // Color of the underline
    borderRadius: 1, // Rounded corners for the underline
  },
  partition: {
    height: 1, // Height of the partition line
    backgroundColor: 'gray', // Color of the partition line
    // marginTop: 10, // Space above the partition
  },
});
