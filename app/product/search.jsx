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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { searchProduct } from '../../service/product/SearchProduct';
import { addProductToCart } from '../../service/cart/AddProductToCart';
import { getCartItems } from '../../service/cart/GetCartItems';
import { getUserId } from '../../utils/token';

export default function SearchScreen() {
  const { query } = useLocalSearchParams();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState(query || '');
  const [results, setResults] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await fetchCartItems();
      if (searchTerm) fetchResults();
    };
    initialize();
  }, []);

  useEffect(() => {
    if (searchTerm) fetchResults();
  }, [searchTerm]);

  const fetchCartItems = async () => {
    try {
      const userId = await getUserId();
      const res = await getCartItems(userId);
      if (res.success && res.data?.cartItemsDto) {
        const initialQuantities = {};
        let count = 0;
        res.data.cartItemsDto.forEach((item) => {
          initialQuantities[item.productId] = item.quantity;
          count += item.quantity;
        });
        setQuantities(initialQuantities);
        setCartCount(count);
      }
    } catch (err) {
      console.error("Error fetching cart items", err);
    }
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

  const updateCart = async (productId, newQty) => {
    const userId = await getUserId();
    const response = await addProductToCart(userId, productId, newQty);
    if (response.success) {
      fetchCartItems();
    } else {
      console.error("Failed to update cart", response.data);
    }
  };

  const handleQuantityChange = (productId, delta) => {
    setQuantities((prev) => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      updateCart(productId, newQty);

      const newQuantities = { ...prev, [productId]: newQty };
      const totalItems = Object.values(newQuantities).reduce((sum, val) => sum + val, 0);
      setCartCount(totalItems);

      return newQuantities;
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchResults();
    await fetchCartItems();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    const originalPrice = item.price + Math.ceil(item.price * 0.10);
    const discountVal = Math.ceil(item.price * 0.10);
    const qty = quantities?.[item.id] ?? 0;

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

        {qty > 0 ? (
          <View style={styles.cartControls}>
            <TouchableOpacity
              style={[styles.button, qty <= 0 && styles.disabledButton]}
              disabled={qty <= 0}
              onPress={() => handleQuantityChange(item.id, -1)}
            >
              <Text style={styles.buttonText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.quantityText}>{qty}</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => handleQuantityChange(item.id, 1)}
            >
              <Text style={styles.buttonText}>＋</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.button, { alignSelf: 'flex-start', marginTop: 10 }]}
            onPress={() => handleQuantityChange(item.id, 1)}
          >
            <Text style={styles.buttonText}>Add</Text>
          </TouchableOpacity>
        )}
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

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id?.toString() || item._id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.noResults}>No results found.</Text>}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
    backgroundColor: "#f5f7fa",
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    flex: 1,
  },
  cartIconContainer: {
    position: 'absolute',
    right: 16,
    top: 8,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  productName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  extraChargeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#007AFF",
    marginBottom: 4,
  },
  priceWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  originalPrice: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: "line-through",
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  cartControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    justifyContent: 'space-between',
    width: 120,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: '600',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "500",
    marginHorizontal: 8,
  },
});
