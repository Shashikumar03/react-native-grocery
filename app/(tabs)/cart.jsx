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
  TouchableHighlight,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import { getCartItems } from '../../service/cart/GetCartItems';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { removeItemFromCart } from '../../service/cart/RemoveItemFromCart';
import { increaseOrDecreaseCartItem } from '../../service/cart/IncreaseOrDecreaseCartItems';
import { handlePayment } from '../../service/rozarpay/rozerpay';

export default function Cart() {
  const [allCartItems, setAllCartItems] = useState([]);

  const getCartItemMethod = async () => {
    const response = await getCartItems();
    if (response.success) {
      // Sort the cart items based on the cartItemId
      const sortedItems = response.data.cartItemsDto.sort((a, b) => a.cartItemId - b.cartItemId);

      // Update the state with the sorted cart items and total price
      setAllCartItems({
        ...response.data,
        cartItemsDto: sortedItems,  // Store the sorted cart items
      });
    } else {
      console.log(response.data.message);
    }
  };

  // Use useFocusEffect to refetch data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      getCartItemMethod();  // Fetch the cart items when the screen is focused
    }, []) // Empty dependency array means it runs when the screen is focused
  );

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
          onPress: () => handleDeleteItem(productId),  // Proceed with deletion if confirmed
        },
      ]
    );
  };

  // Handle deleting an item
  const handleDeleteItem = async (productId) => {
    const response = await removeItemFromCart(1, productId);  // Assuming userId is 1 for now
    if (response.success) {
      getCartItemMethod();  // Refresh the cart after deletion
    } else {
      console.log('Failed to delete item');
      ToastAndroid.show(
        `Error message ${response.data.message}`,
        ToastAndroid.BOTTOM
      );
    }
  };

  // Handle quantity change
  const updateQuantity = async (item, newQuantity) => {
    const cartItemId = item.cartItemId;
    const itemQuantity = item.quantity;

    if (newQuantity < 1) {
      Alert.alert("Invalid Quantity", "Quantity can't be less than 1");
      return;
    }

    let response;
    if (newQuantity > itemQuantity) {
      console.log("Increasing quantity");
      response = await increaseOrDecreaseCartItem(cartItemId, "add");  // Increase quantity
    } else {
      console.log("Decreasing quantity");
      response = await increaseOrDecreaseCartItem(cartItemId, "dec");  // Decrease quantity
    }

    if (response.success) {
      getCartItemMethod();  // Refresh the cart with updated data
    } else {
      console.log('Failed to update quantity');
      ToastAndroid.show(
        `Error message ${response.data.message}`,
        ToastAndroid.BOTTOM
      );
    }
  };

  // Payment handler
  const doPayment = async () => {
    const a = await handlePayment();
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItemContainer}>
      {/* Display product image */}
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.productImage}
        resizeMode="cover"
      />

      {/* Display product details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.productName}>{item.productName}</Text>

        {/* Quantity Management */}
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

      {/* Delete icon */}
      <TouchableOpacity onPress={() => confirmDeleteItem(item.productId)}>
        <Icon name="delete" size={30} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.cartTitle}>Cart Items</Text>

      {/* Display Cart Items */}
      <FlatList
        data={allCartItems.cartItemsDto}
        keyExtractor={(item) => item.cartItemId.toString()}
        renderItem={renderCartItem}
      />

      {/* Display Total Price */}
      <View style={styles.totalContainer}>
        <TouchableOpacity onPress={() => doPayment()}>
          <Text style={styles.totalText}>
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
  paymentButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'green',
    borderRadius: 10,
    alignItems: 'center',
  },
  paymentText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
