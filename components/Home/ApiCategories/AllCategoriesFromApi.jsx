import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getAllCategories } from '../../../service/category/GetAllCategories';
import { addProductToCart } from '../../../service/cart/AddProductToCart';
import { getCurrentUserId } from '../../../utils/token';

export default function AllCategoriesFromApi() {
  // State variables
  const [allCategories, setAllCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [quantity, setQuantity] = useState('1'); // default quantity as string
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch categories from API
  const getAllCategory = async () => {
    if (!refreshing) setIsLoading(true);
    try {
      const response = await getAllCategories();
      if (response.success) {
        setAllCategories(response.data);
      } else {
        Alert.alert('Error', 'Failed to load categories. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('getAllCategory error:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    getAllCategory();
  }, []);

  // Refresh data when screen gains focus
  useFocusEffect(
    useCallback(() => {
      getAllCategory();
    }, [])
  );

  // Pull-to-refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    getAllCategory();
  };

  // Handler to start adding product to cart (shows modal)
  const addProductToCartHandler = (productId) => {
    // Find product details
    const product = allCategories
      .flatMap(category => category.productsDto)
      .find(p => p.id === productId);

    if (!product?.available) {
      Alert.alert('Out of Stock', 'This product is currently unavailable.');
      return;
    }

    // Confirm before showing quantity modal
    Alert.alert(
      'Add to Cart',
      `Do you want to add "${product.name}" to the cart?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            setSelectedProductId(productId);
            setModalVisible(true);
          },
        },
      ]
    );
  };

  // Handle adding product with quantity to cart
  const handleAddToCart = async () => {
    const qty = parseInt(quantity, 10);

    if (!quantity || isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity (positive number).');
      return;
    }

    setIsAddingToCart(true);

    try {
      const userId = await getCurrentUserId();
      const response = await addProductToCart(userId, selectedProductId, qty);

      if (response.success) {
        Alert.alert('Success', 'Product added to cart successfully!');
        setModalVisible(false);
        setQuantity('1'); // reset quantity
        getAllCategory(); // refresh categories for stock update
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to add product to cart.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('addProductToCart error:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Render each product card
  const renderProduct = ({ item }) => (
    <View style={[styles.productCard, !item.available && styles.outOfStockCard]}>
      <TouchableOpacity
        disabled={!item.available}
        onPress={() => addProductToCartHandler(item.id)}
        accessibilityLabel={`Add ${item.name} to cart`}
        accessibilityRole="button"
        style={styles.productTouchable}
      >
        <Image
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/80' }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.productAvailability, !item.available && styles.outOfStockText]}>
          {item.available ? 'Available' : 'Out of Stock'}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.originalPrice}>₹{(item.price * 1.1).toFixed(0)}</Text>
          <Text style={styles.discountText}>10% OFF</Text>
        </View>
        <Text style={styles.finalPrice}>
          ₹{item.price.toFixed(0)} / {item.unit || 'unit'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render each category block
  const renderCategory = ({ item }) => (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{item.name}</Text>
      <Text style={styles.categoryDescription} numberOfLines={2}>
        {item.description || 'No description available.'}
      </Text>
      <FlatList
        data={item.productsDto}
        keyExtractor={(product) => product.id.toString()}
        renderItem={renderProduct}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsList}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.loadingText}>Loading Categories...</Text>
        </View>
      ) : (
        <FlatList
          data={allCategories}
          keyExtractor={(category) => category.id.toString()}
          renderItem={renderCategory}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      )}

      {/* Modal for quantity input */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!isAddingToCart) {
            setModalVisible(false);
            setQuantity('1');
          }
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Enter Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="Quantity"
              keyboardType="numeric"
              value={quantity}
              onChangeText={(text) => {
                if (/^\d*$/.test(text)) setQuantity(text);
              }}
              editable={!isAddingToCart}
              accessibilityLabel="Quantity input"
            />

            <View style={styles.modalButtons}>
              <Button
                title={isAddingToCart ? 'Adding...' : 'Add to Cart'}
                onPress={handleAddToCart}
                disabled={isAddingToCart}
              />
              <Button
                title="Cancel"
                onPress={() => {
                  if (!isAddingToCart) {
                    setModalVisible(false);
                    setQuantity('1');
                  }
                }}
                color="gray"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 4,
  },
  categoryList: {
    paddingBottom: 20,
  },
  categoryContainer: {
    marginBottom: 10,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryDescription: {
    fontSize: 13,
    color: '#666',
    marginVertical: 6,
  },
  productsList: {
    paddingVertical: 5,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: 140,
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  outOfStockCard: {
    opacity: 0.5,
  },
  productTouchable: {
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 70,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    color: '#333',
  },
  productAvailability: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
  },
  outOfStockText: {
    color: 'red',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    justifyContent: 'center',
  },
  originalPrice: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  discountText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  finalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#2e7d32',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#2e7d32',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
