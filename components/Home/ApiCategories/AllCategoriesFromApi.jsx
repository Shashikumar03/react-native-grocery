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
import React, { useEffect, useState } from 'react';
import { getAllCategories } from '../../../service/category/GetAllCategories';
import { addProductToCart } from '../../../service/cart/AddProductToCart';
import { getUserId } from '../../../utils/token';

export default function AllCategoriesFromApi() {
  const [allCategories, setAllCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    getAllCategory();
  }, []);

  const getAllCategory = async () => {
    setIsLoading(true);
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
    }
  };

  const addProductToCartHandler = (itemId) => {
    const selectedItem = allCategories
      .flatMap((category) => category.productsDto)
      .find((product) => product.id === itemId);

    if (!selectedItem?.available) {
      Alert.alert('Out of Stock', 'This item is currently not available.');
      return;
    }

    Alert.alert(
      'Add to Cart',
      'Are you sure you want to add this item to the cart?',
      [
        { text: 'No', onPress: () => console.log('User cancelled'), style: 'cancel' },
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

  const handleAddToCart = async () => {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid quantity', 'Please enter a valid quantity.');
      return;
    }

    setIsAddingToCart(true);

    try {
      const userId = await getUserId();
      const response = await addProductToCart(userId, selectedProductId, qty);
      if (response.success) {
        Alert.alert('Success', 'Item added to cart successfully.');
        setModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to add item to cart.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('addProductToCart error:', error);
    } finally {
      setIsAddingToCart(false);
      setQuantity('');
    }
  };

  const renderProduct = ({ item }) => (
    <View style={[styles.productCard, !item.available && { opacity: 0.5 }]}> 
      <TouchableOpacity
        onPress={() => addProductToCartHandler(item.id)}
        style={styles.productCardContent}
        disabled={!item.available}
        accessibilityLabel={`Add ${item.name} to cart`}
        accessibilityRole="button"
      >
        <Image
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/80' }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={[styles.productPrice, { color: item.available ? '#2e7d32' : 'red' }]}> 
            {item.available ? 'Available' : 'Out of Stock'}
          </Text>

          <View style={styles.priceContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ textDecorationLine: 'line-through', color: '#888', fontSize: 12, marginRight: 6 }}>
                ₹{(item.price * 1.1).toFixed(0)}
              </Text>
              <Text style={{ color: '#2e7d32', fontSize: 12, fontWeight: 'bold' }}>
                10% OFF
              </Text>
            </View>
            <Text style={styles.finalPrice}>₹{item.price.toFixed(0)} / {item.unit || 'unit'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

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
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.loadingText}>Loading Categories...</Text>
        </View>
      ) : (
        <FlatList
          data={allCategories}
          keyExtractor={(category) => category.id.toString()}
          renderItem={renderCategory}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      )}
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
                    setQuantity('');
                  }
                }}
              />
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
    backgroundColor: '#f5f5f5',
  },
  categoryList: {
    paddingBottom: 20,
  },
  categoryContainer: {
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#fafafa',
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
    backgroundColor: '#ffffff',
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
  productPrice: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 3,
  },
  priceContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  strikeThroughPrice: {
    fontSize: 13,
    color: 'gray',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  finalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
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
    backgroundColor: '#ffffff',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2e7d32',
  },
});
