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
import { getUserId } from '../../../utils/token';

export default function AllCategoriesFromApi() {
  const [allCategories, setAllCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [quantity, setQuantity] = useState('');

  // Fetch categories on component mount
  useEffect(() => {
    getAllCategory();
  }, []);

  // Fetch all categories from API
  const getAllCategory = async () => {
    try {
      const response = await getAllCategories();
      if (response.success) {
        setAllCategories(response.data);
        console.log(response.data);
      } else {
        Alert.alert('Error', 'Failed to load categories. Please try again.');
        console.log('Error occurred:', response.error);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('getAllCategory error:', error);
    }
  };

  // Show confirmation alert before adding to cart
  const addProductToCartHandler = (itemId) => {
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
            setSelectedProductId(itemId);
            setModalVisible(true);
          },
        },
      ]
    );
  };

  // Handle adding product to cart
  const handleAddToCart = async () => {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid quantity', 'Please enter a valid quantity.');
      return;
    }
    try {
      const userId = await getUserId();
      const response = await addProductToCart(userId, selectedProductId, qty);
      if (response.success) {
        Alert.alert('Success', 'Item added to cart successfully.');
      } else {
        Alert.alert('Error', 'Failed to add item to cart.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('addProductToCart error:', error);
    }
    setQuantity('');
    setModalVisible(false);
  };

  // Render individual product card
  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <TouchableOpacity
        onPress={() => addProductToCartHandler(item.id)}
        style={styles.productCardContent}
        accessibilityLabel={`Add ${item.name} to cart`}
        accessibilityRole="button"
      >
        <Image
          source={{ uri: item.imageUrl ||"www.modi.com" }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>Rs {item.price.toFixed(2)}</Text>
            <Text style={styles.productUnit}>/{item?.unit || 'unit'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Render category with products
  const renderCategory = ({ item }) => (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{item.name}</Text>
      <Text style={styles.categoryDescription} numberOfLines={2}>
        {item.description || 'No description available'}
      </Text>
      <FlatList
        data={item.productsDto}
        keyExtractor={(product) => product.id.toString()}
        renderItem={renderProduct}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productList}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={allCategories}
        keyExtractor={(category) => category.id.toString()}
        renderItem={renderCategory}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />
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
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={quantity}
              onChangeText={(text) => {
                if (/^\d*$/.test(text)) setQuantity(text);
              }}
              accessibilityLabel="Quantity input"
            />
            <View style={styles.modalButtonContainer}>
              <Button title="Add to Cart" onPress={handleAddToCart} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 2,
    backgroundColor: '#f5f5f5', // Light gray background for main container
  },
  categoryList: {
    paddingBottom: 20,
  },
  categoryContainer: {
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#fafafa', // Off-white for category box
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  productList: {
    paddingVertical: 5,
  },
  productCard: {
    backgroundColor: '#ffffff', // Pure white for product box
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    width: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  productCardContent: {
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 70,
    borderRadius: 6,
    marginBottom: 5,
    backgroundColor: '#f0f0f0',
  },
  productDetails: {
    alignItems: 'center',
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 3,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2e7d32',
  },
  productUnit: {
    fontSize: 10,
    color: '#666',
    marginLeft: 3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 280,
    padding: 20,
    backgroundColor: '#ffffff', // White for modal box
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 14,
    color: '#333',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
});