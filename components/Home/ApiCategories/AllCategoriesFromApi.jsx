import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { getAllCategories } from '../../../service/category/GetAllCategories';
import { addProductToCart } from '../../../service/cart/AddProductToCart';

export default function AllCategoriesFromApi() {
  const [allCategories, setAllCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    getAllCategory();
  }, []);

  const getAllCategory = async () => {
    const response = await getAllCategories();
    if (response.success) {
      setAllCategories(response.data);
      console.log(response.data); // Log the data directly
    } else {
      console.log('Error occurred');
    }
  };

  const addProductToCartHandler = (itemId) => {
    // Show confirmation dialog
    Alert.alert(
      'Add to Cart',
      'Are you sure you want to add this item to the cart?',
      [
        {
          text: 'No',
          onPress: () => console.log('User cancelled'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            setSelectedProductId(itemId); // Set the selected product ID
            setModalVisible(true); // Show the modal for quantity input
          },
        },
      ]
    );
  };

  const handleAddToCart = async () => {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid quantity', 'Please enter a valid quantity.');
      return;
    }

    const response = await addProductToCart(selectedProductId, qty); // Add to cart
    if (response.success) {
      Alert.alert('Success', 'Item added to cart successfully.');
    } else {
      Alert.alert('Error', 'Failed to add item to cart.');
    }
    setQuantity(''); // Clear quantity
    setModalVisible(false); // Hide the modal
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <TouchableOpacity onPress={() => addProductToCartHandler(item.id)} style={styles.productCardContent}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>RS {item.price.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderCategory = ({ item }) => (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{item.name}</Text>
      <Text style={styles.categoryDescription}>{item.description}</Text>

      <FlatList
        data={item.productsDto} // Access the products for the category
        keyExtractor={(product) => product.id.toString()}
        renderItem={renderProduct}
        horizontal // Display products horizontally
        showsHorizontalScrollIndicator={false} // Hide scroll indicator
        contentContainerStyle={styles.productList} // Style for the horizontal product list
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={allCategories}
        keyExtractor={(category) => category.id.toString()}
        renderItem={renderCategory}
        showsVerticalScrollIndicator={false} // Hide vertical scroll indicator
      />

      {/* Modal for Quantity Input */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="Quantity"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />
            <Button title="Add to Cart" onPress={handleAddToCart} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure container takes full height
    padding: 20,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10,
  },
  productList: {
    paddingVertical: 10, // Add vertical padding for better spacing
  },
  productCard: {
    backgroundColor: '#fff', // White background for the card
    borderRadius: 10, // Rounded corners
    padding: 10, // Padding inside the card
    marginRight: 15, // Space between cards in the horizontal list
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
    shadowOpacity: 0.1, // Shadow opacity for iOS
    shadowRadius: 5, // Shadow blur radius for iOS
    elevation: 3, // Shadow for Android
    borderWidth: 1, // Add a border
    borderColor: '#e0e0e0', // Light gray border color
    width: 130, // Set a fixed width for product cards
  },
  productCardContent: {
    alignItems: 'center',
  },
  productImage: {
    width: 60, // Image width
    height: 60, // Image height
    borderRadius: 8, // Rounded corners for the image
    marginBottom: 10, // Space between the image and product details
  },
  productDetails: {
    alignItems: 'center', // Center the text inside the card
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5, // Space between name and price
  },
  productPrice: {
    fontSize: 12,
    color: 'green',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Background overlay
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 10,
  },
});
