import { View, Text, StyleSheet, FlatList, StatusBar, RefreshControl } from 'react-native';
import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getOrderHistory } from '../../service/order/OrderHistory';
import { getUserId } from '../../utils/token';

export default function Order() {
  const [orderHistory, setOrderHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const getUserOrderHistory = async () => {
    setRefreshing(true);
    const userId = await getUserId();
    const response = await getOrderHistory(userId);
    if (response.success) {
      const sortedOrders = response.data.sort((a, b) => b.orderId - a.orderId);
      setOrderHistory(sortedOrders);
    }
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      getUserOrderHistory();
    }, [])
  );

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderContainer}>
      <Text style={styles.orderIdText}>Order NO: {item.orderId}</Text>
      <Text style={styles.orderStatus}>Status: {item.orderStatus}</Text>
      <Text style={styles.orderTime}>Order Time: {new Date(item.orderTime).toLocaleString()}</Text>

      <Text style={styles.sectionHeader}>Items:</Text>
      {item.cartItemDto.map((cartItem, index) => (
        <View key={index} style={styles.cartItemContainer}>
          <Text style={styles.productName}>Product: {cartItem.productName}</Text>
          <Text style={styles.productPrice}>Price: ₹ {cartItem.price.toFixed(2)}</Text>
          <Text style={styles.productQuantity}>Quantity: {cartItem.quantity}</Text>
        </View>
      ))}

      <Text style={styles.sectionHeader}>Payment:</Text>
      <Text style={styles.paymentStatus}>Payment Mode: {item.paymentDto?.paymentMode}</Text>
      <Text style={styles.paymentStatus}>Payment Status: {item.paymentDto?.paymentStatus}</Text>
      <Text style={styles.paymentAmount}>Payment Amount: ₹ {item.paymentDto?.paymentAmount?.toFixed(2)}</Text>
      {item.paymentDto?.refundAmount > 0 && (
        <>
          <Text style={styles.paymentAmount}>
            Refund Amount: ₹ {item.paymentDto.refundAmount.toFixed(2)}
          </Text>
          <Text style={styles.deductionNote}>
            Note: 10% of your total amount has been deducted as per refund policy.
          </Text>
        </>
      )}

      <Text style={styles.sectionHeader}>Delivery:</Text>
      <Text style={styles.deliveryStatus}>Delivery Status: {item.deliveryDto?.deliveryStatus}</Text>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.title}>Order History</Text>
      <FlatList
        data={orderHistory}
        keyExtractor={(item) => item.orderId.toString()}
        renderItem={renderOrderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={getUserOrderHistory} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  orderContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  orderIdText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  orderStatus: {
    fontSize: 16,
    color: 'blue',
    marginBottom: 5,
  },
  orderTime: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  cartItemContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 14,
    color: 'green',
  },
  productQuantity: {
    fontSize: 14,
    color: '#555',
  },
  paymentStatus: {
    fontSize: 14,
    color: 'red',
  },
  paymentAmount: {
    fontSize: 14,
    color: 'green',
  },
  deliveryStatus: {
    fontSize: 14,
    color: 'orange',
  },
  deductionNote: {
    fontSize: 12,
    color: 'gray',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
