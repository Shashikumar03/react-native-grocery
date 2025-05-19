import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { searchProduct } from '../../service/product/SearchProduct';
import { addProductToCart } from '../../service/cart/AddProductToCart';
import { getCartItems } from '../../service/cart/GetCartItems';
import { getCurrentUserId } from '../../utils/token';

const Loader = () => {
  const rotate = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.loaderWrapper}>
      <Animated.View
        style={[
          styles.loader,
          {
            transform: [{ rotate: rotateInterpolate }],
          },
        ]}
      />
    </View>
  );
};

export default function SearchScreen() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [addingToCartProductId, setAddingToCartProductId] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      await fetchCartItems();
      if (searchTerm.trim()) {
        fetchResults();
      } else {
        fetchAllProducts();
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      fetchResults();
    } else {
      fetchAllProducts();
    }
  }, [searchTerm]);

  const fetchCartItems = async () => {
    try {
      const userId = await getCurrentUserId();
      const res = await getCartItems(userId);
      if (res.success && res.data?.cartItemsDto) {
        let count = 0;
        res.data.cartItemsDto.forEach((item) => {
          count += item.quantity;
        });
        setCartCount(count);
      }
    } catch (err) {
      console.error('Error fetching cart items', err);
    }
  };

  const fetchAllProducts = async () => {
    setLoading(true);
    const res = await searchProduct('');
    if (res.success) {
      setResults(res.data);
      const updatedQuantities = { ...quantities };
      res.data.forEach((item) => {
        if (updatedQuantities[item.id] === undefined) {
          updatedQuantities[item.id] = 0;
        }
      });
      setQuantities(updatedQuantities);
    }
    setLoading(false);
  };

  const fetchResults = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    const res = await searchProduct(searchTerm);
    if (res.success) {
      setResults(res.data);
      const updatedQuantities = { ...quantities };
      res.data.forEach((item) => {
        if (updatedQuantities[item.id] === undefined) {
          updatedQuantities[item.id] = 0;
        }
      });
      setQuantities(updatedQuantities);
    }
    setLoading(false);
  };

  const handleAddToCart = async (productId) => {
    setAddingToCartProductId(productId);
    const userId = await getCurrentUserId();
    try {
      await addProductToCart(userId, productId, 1);
      setSuccessMessage('Item added to cart successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchCartItems();
    } catch (err) {
      console.error('Error adding product to cart', err);
    } finally {
      setAddingToCartProductId(null);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchResults();
    await fetchCartItems();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    const originalPrice = item.price + Math.ceil(item.price * 0.1);
    const discountVal = Math.ceil(item.price * 0.1);
    const isLoading = addingToCartProductId === item.id;

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.category}>{item.description}</Text>
          <Text style={styles.extraChargeText}>-₹{discountVal} (10% off)</Text>
          <View style={styles.priceWrapper}>
            <Text style={styles.price}>₹{item.price}</Text>
            <Text style={styles.originalPrice}>{originalPrice} ₹</Text>
          </View>

          {item.available ? (
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={() => handleAddToCart(item.id)}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              {isLoading ? <Loader /> : <Text style={styles.buttonText}>Add to Cart</Text>}
            </TouchableOpacity>
          ) : (
            <Text style={styles.outOfStockText}>Out of stock</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search products..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.input}
          onSubmitEditing={fetchResults}
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.cartIconContainer} onPress={() => router.push('/cart')}>
          <Ionicons name="cart-outline" size={28} color="#007AFF" />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {successMessage ? (
        <View style={styles.successMessage}>
          <Text style={styles.successMessageText}>{successMessage}</Text>
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id?.toString() || item._id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.noResults}>No results found.</Text>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    flex: 1,
    color: '#333',
  },
  cartIconContainer: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 10,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  productImage: {
    width: 110,
    height: 110,
    borderRadius: 12,
    marginRight: 14,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  extraChargeText: {
    fontSize: 13,
    color: 'green',
    marginTop: 6,
  },
  priceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
    color: '#111',
  },
  originalPrice: {
    fontSize: 15,
    color: '#aaa',
    textDecorationLine: 'line-through',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    alignSelf: 'flex-start',
  },
  buttonDisabled: {
    backgroundColor: '#9acaff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noResults: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
  successMessage: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  successMessageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loaderWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    width: 20,
    height: 20,
    borderWidth: 3,
    borderColor: '#fff',
    borderTopColor: '#007AFF',
    borderRadius: 50,
  },
  outOfStockText: {
    color: 'red',
    fontWeight: '700',
    fontSize: 16,
    marginTop: 14,
  },
});
