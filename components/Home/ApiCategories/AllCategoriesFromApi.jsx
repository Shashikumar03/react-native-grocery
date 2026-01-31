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
// not using focus-triggered refetch; component uses an in-memory cache and pull-to-refresh

import { getAllCategories } from '../../../service/category/GetAllCategories';
import { addProductToCart } from '../../../service/cart/AddProductToCart';
import { getCurrentUserId } from '../../../utils/token';

// simple in-memory cache for categories to avoid refetching on every mount/focus
let categoriesCache = null;

export default function AllCategoriesFromApi({ onCartUpdated } = {}) {
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
      // If cached, use it and avoid network
      if (categoriesCache && !refreshing) {
        setAllCategories(categoriesCache);
        return;
      }

      const response = await getAllCategories();
      if (response.success) {
        categoriesCache = response.data;
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

  // Initial fetch on component mount — will use cache if available
  useEffect(() => {
    getAllCategory();
  }, []);

  // NOTE: we intentionally do NOT refetch on focus to avoid repeated loads.
  // Pull-to-refresh will force a network fetch via setting `refreshing`.

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
        // notify parent (Home) so it can refresh cart count / show popup
        if (typeof onCartUpdated === 'function') onCartUpdated();
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
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/120' }}
          style={styles.productImage}
          resizeMode="cover"
        />
        {item.available ? (
          <View style={styles.availableBadge}><Text style={styles.badgeText}>In stock</Text></View>
        ) : (
          <View style={styles.outBadge}><Text style={styles.badgeText}>Out</Text></View>
        )}
      </View>
      <View style={styles.productBody}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.categorySmall} numberOfLines={1}>{item.unit || 'Unit'}</Text>
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.finalPrice}>₹{item.price.toFixed(0)}</Text>
            <Text style={styles.originalPrice}>₹{(item.price * 1.1).toFixed(0)}</Text>
          </View>
          <View style={styles.discountPill}><Text style={styles.discountText}>10% OFF</Text></View>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.addToCartButton, !item.available && styles.addButtonDisabled]}
        disabled={!item.available || isAddingToCart}
        onPress={() => addProductToCartHandler(item.id)}
        accessibilityLabel={`Add ${item.name} to cart`}
      >
        {isAddingToCart ? <ActivityIndicator color="#fff" /> : <Text style={styles.addToCartText}>Add</Text>}
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
      <View style={styles.productsGrid}>
        {item.productsDto.map((prod) => (
          <View key={prod.id} style={styles.productWrapper}>
            {renderProduct({ item: prod })}
          </View>
        ))}
      </View>
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
    borderRadius: 12,
    width: '100%',
    padding: 12,
    marginRight: 12,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  productWrapper: { width: '48%', marginBottom: 12 },
  outOfStockCard: {
    opacity: 0.6,
  },
  productTouchable: {
    alignItems: 'center',
  },
  imageWrap: { alignItems: 'center', marginBottom: 8, position: 'relative' },
  productImage: {
    width: 120,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  availableBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#e6ffed', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  outBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#ffecec', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  badgeText: { fontSize: 11, color: '#0b6b2b', fontWeight: '700' },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'left',
    marginBottom: 6,
    color: '#222',
  },
  categorySmall: { fontSize: 12, color: '#666', marginBottom: 6 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  originalPrice: { fontSize: 12, color: '#888', textDecorationLine: 'line-through' },
  discountPill: { backgroundColor: '#fff6f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  discountText: { fontSize: 11, color: '#d35400', fontWeight: '700' },
  finalPrice: { fontSize: 16, fontWeight: '800', color: '#111' },
  addToCartButton: { marginTop: 10, backgroundColor: '#28a745', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  addToCartText: { color: '#fff', fontWeight: '800' },
  addButtonDisabled: { backgroundColor: '#9bd1a6' },
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
