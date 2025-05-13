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
import { getUserId } from '../../utils/token';

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
      const userId = await getUserId();
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
    const userId = await getUserId();
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
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.category}>{item.categoryDto?.name}</Text>
        <Text style={styles.extraChargeText}>-₹{discountVal} (10% off)</Text>
        <View style={styles.priceWrapper}>
          <Text style={styles.price}>₹{item.price}</Text>
          <Text style={styles.originalPrice}>{originalPrice} ₹</Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleAddToCart(item.id)}
          disabled={isLoading}
        >
          {isLoading ? <Loader /> : <Text style={styles.buttonText}>Add to Cart</Text>}
        </TouchableOpacity>
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
          <Ionicons name="cart-outline" size={24} color="#007AFF" />
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
        <ActivityIndicator size="large" color="#007AFF" />
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
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    flex: 1,
  },
  cartIconContainer: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'red',
    borderRadius: 50,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 14,
    color: '#888',
    marginVertical: 4,
  },
  extraChargeText: {
    fontSize: 14,
    color: 'green',
    marginBottom: 4,
  },
  priceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#333',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'center',
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noResults: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  successMessage: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  successMessageText: {
    color: '#fff',
    fontSize: 16,
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
});
