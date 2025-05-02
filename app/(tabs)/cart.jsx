import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  ToastAndroid,
  Alert,
  RefreshControl,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import { getCartItems } from '../../service/cart/GetCartItems';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { removeItemFromCart } from '../../service/cart/RemoveItemFromCart';
import { increaseOrDecreaseCartItem } from '../../service/cart/IncreaseOrDecreaseCartItems';
import { useRouter } from 'expo-router';
import { getUserId } from '../../utils/token';

export default function Cart() {
  const [allCartItems, setAllCartItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false); // State to manage the refresh indicator
  const router = useRouter();

  const getCartItemMethod = async () => {
    const response = await getCartItems();
    if (response.success) {
      const sortedItems = response.data.cartItemsDto.sort((a, b) => a.cartItemId - b.cartItemId);
      setAllCartItems({
        ...response.data,
        cartItemsDto: sortedItems,
      });
    } else {
      console.log(response.data.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused");
      getCartItemMethod();
      return () => {
        console.log("Screen unfocused");
      };
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true); // Show the refresh indicator
    await getCartItemMethod(); // Fetch new cart data
    setRefreshing(false); // Hide the refresh indicator
  };

  const confirmDeleteItem = (productId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from the cart?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => handleDeleteItem(productId),
        },
      ]
    );
  };

  const handleDeleteItem = async (productId) => {
    const userId=getUserId()

    const response = await removeItemFromCart(userId, productId);
    if (response.success) {
      getCartItemMethod();
    } else {
      console.log('Failed to delete item');
      ToastAndroid.show(
        `Error message ${response.data.message}`,
        ToastAndroid.BOTTOM
      );
    }
  };

  const updateQuantity = async (item, newQuantity) => {
    const cartItemId = item.cartItemId;
    const itemQuantity = item.quantity;

    if (newQuantity < 1) {
      Alert.alert("Invalid Quantity", "Quantity can't be less than 1");
      return;
    }

    let response;
    if (newQuantity > itemQuantity) {
      response = await increaseOrDecreaseCartItem(cartItemId, "add");
    } else {
      response = await increaseOrDecreaseCartItem(cartItemId, "dec");
    }

    if (response.success) {
      getCartItemMethod();
    } else {
      console.log('Failed to update quantity');
      ToastAndroid.show(
        `Error message ${response.data.message}`,
        ToastAndroid.BOTTOM
      );
    }
  };

  const doPayment = async () => {
    const orderId = "order_PMSNen1QWtsEPD";
    console.log("payment start");
    router.push(`/rozarpay/${orderId}`);
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItemContainer}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.detailsContainer}>
        <Text style={styles.productName}>{item.productName}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item, item.quantity - 1)}
          >
            <Icon name="remove" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item, item.quantity + 1)}
          >
            <Icon name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.price}>Price: RS {item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity onPress={() => confirmDeleteItem(item.productId)}>
        <Icon name="delete" size={30} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.cartTitle}>Cart Items </Text>
      <Text style={{marginBottom:10}}> pull down to refresh cart item</Text>
      {allCartItems.cartItemsDto && allCartItems.cartItemsDto.length === 0 ? (
        <Text style={styles.emptyCartText}>No items in the cart</Text>
      ) : (
        <FlatList
          data={allCartItems.cartItemsDto}
          keyExtractor={(item) => item.cartItemId.toString()}
          renderItem={renderCartItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh} // Link the refresh control to the onRefresh function
            />
          }
        />
      )}
      <View style={styles.totalContainer}>
        <TouchableOpacity
          onPress={() => doPayment()}
          disabled={allCartItems.cartItemsDto && allCartItems.cartItemsDto.length === 0}
        >
          <Text style={[styles.totalText, { opacity: allCartItems.cartItemsDto && allCartItems.cartItemsDto.length === 0 ? 0.5 : 1 }]}>
            Place Order: RS {allCartItems.cartTotalPrice?.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: StatusBar.currentHeight,
  },
  cartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
  cartItemContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  quantity: {
    fontSize: 16,
    marginHorizontal: 10,
    color: '#555',
  },
  price: {
    fontSize: 16,
    color: '#333',
  },
  totalContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: 'blue',
    borderRadius: 10,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  quantityButton: {
    backgroundColor: "blue",
    borderRadius: 3,
    padding: 2,
  },
});
