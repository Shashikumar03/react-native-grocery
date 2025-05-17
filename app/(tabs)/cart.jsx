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
  TextInput,
  ScrollView,
} from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import { getCartItems } from '../../service/cart/GetCartItems';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { removeItemFromCart } from '../../service/cart/RemoveItemFromCart';
import { increaseOrDecreaseCartItem } from '../../service/cart/IncreaseOrDecreaseCartItems';
import { useRouter } from 'expo-router';
import { getCurrentUserId } from '../../utils/token';
import { applyPromoCode } from '../../service/promoCode/applyPromoCode';
import { getPaymentOrder } from '../../service/rozarpay/rozerpay';
import { applyPromoCodeDiscount } from '../../service/promoCode/applyPromoCodeDiscount';
import { getAllDeliveryAddressOfUser } from '../../service/deliveryAddress/GetAllDeliveryAddressOfUser';

export default function Cart() {
  const [allCartItems, setAllCartItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [idOfCart, setIdOfCart] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMode, setPaymentMode] = useState('online');
  const [userAddresses, setUserAddresses] = useState([]);
  const [loadingButton, setLoadingButton] = useState({ cartItemId: null, type: null });

  const router = useRouter();

  const getCartItemMethod = async () => {
    try {
      const userId = await getCurrentUserId();
      const response = await getCartItems(userId);
      if (response.success) {
        const sortedItems = response.data.cartItemsDto.sort((a, b) => a.cartItemId - b.cartItemId);
        setIdOfCart(response.data.cartId);
        setAllCartItems({
          ...response.data,
          cartItemsDto: sortedItems,
        });
      } else {
        console.log("Cart fetch error:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const getAllDeliveryAddressOfUser1 = async () => {
    try {
      const userId = await getCurrentUserId();
      const response = await getAllDeliveryAddressOfUser(userId);
      console.log("address response:", response.data);
      if (response.success) {
        setUserAddresses(response.data);
        console.log("Updated userAddresses:", response.data);
      } else {
        Alert.alert("Failed", "Failed to fetch addresses");
        console.error("Error response:", response.data);
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong while fetching addresses");
      console.error("Fetch addresses error:", error);
    }
  };

  useEffect(() => {
    getAllDeliveryAddressOfUser1();
  }, []);

  useFocusEffect(
    useCallback(() => {
      getCartItemMethod();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await getCartItemMethod();
    await getAllDeliveryAddressOfUser();
    setRefreshing(false);
  };

  const confirmDeleteItem = (productId, cartItemId) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: () => handleDeleteItem(productId, cartItemId) },
    ]);
  };

  const handleDeleteItem = async (productId, cartItemId) => {
    if (loadingButton.cartItemId === cartItemId) return;
    setLoadingButton({ cartItemId, type: 'delete' });
    try {
      const userId = await getCurrentUserId();
      const response = await removeItemFromCart(userId, productId);
      if (response.success) await getCartItemMethod();
      else ToastAndroid.show(`Error: ${response.data.message}`, ToastAndroid.BOTTOM);
    } catch (e) {
      ToastAndroid.show("Delete failed", ToastAndroid.BOTTOM);
    } finally {
      setLoadingButton({ cartItemId: null, type: null });
    }
  };

  const updateQuantity = async (item, newQuantity, actionType) => {
    const cartItemId = item.cartItemId;
    if (loadingButton.cartItemId === cartItemId && loadingButton.type === actionType) return;
    setLoadingButton({ cartItemId, type: actionType });

    if (newQuantity < 1) {
      Alert.alert("Invalid Quantity", "Quantity can't be less than 1");
      setLoadingButton({ cartItemId: null, type: null });
      return;
    }

    try {
      const response = await increaseOrDecreaseCartItem(cartItemId, actionType === 'add' ? 'add' : 'dec');
      if (response.success) await getCartItemMethod();
      else ToastAndroid.show(`Error: ${response.data.message}`, ToastAndroid.BOTTOM);
    } catch (err) {
      ToastAndroid.show("Something went wrong", ToastAndroid.BOTTOM);
    } finally {
      setLoadingButton({ cartItemId: null, type: null });
    }
  };

  const handleApplyPromoCode = async () => {
    const userId = await getCurrentUserId();
    if (!promoCode) return;
    const response = await applyPromoCode(userId, promoCode);
    if (response.success) {
      ToastAndroid.show(response.data.message, ToastAndroid.SHORT);
      setDiscount(response.data.discountAmount);
      setAppliedPromo(response.data.promoCode);
      await applyPromoCodeDiscount(idOfCart, response.data.discountAmount);
    } else {
      ToastAndroid.show(response.data.message, ToastAndroid.LONG);
    }
  };

  const handleRemovePromoCode = async () => {
    setPromoCode('');
    setDiscount(0);
    setAppliedPromo(null);
    await applyPromoCodeDiscount(idOfCart, 0);
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    console.log("Selected address updated:", address);
  };

  const handleAddNewAddress = () => {
    router.push('/address/add-address');
  };

  const doPayment = async () => {
    if (!selectedAddress) {
      Alert.alert('No Address Selected', 'Please select a delivery address before placing the order.');
      return;
    }

    const orderAmount = totalAmount.toFixed(2);
    if (paymentMode === 'online') {
      const orderId = selectedAddress.deliveryAddressId;
      router.push(`/rozarpay/${orderId}`);
    } else {
      const userId = await getCurrentUserId();
      const response = await getPaymentOrder(userId, selectedAddress.deliveryAddressId, "CASH_ON_DELIVERY");
      console.log("response of order place", response.data);
      if (response.success) {
        Alert.alert('Payment Successful', `Payment ID: ${response.data?.paymentDto.id}`, [
          { text: 'OK', onPress: () => router.push('/home') },
        ]);
      } else {
        Alert.alert(`Order Failed: ${response.data?.message}`);
      }
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItemContainer}>
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="cover" />
      <View style={styles.detailsContainer}>
        <Text style={styles.productName}>{item.productName}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              (item.quantity <= 1 || (loadingButton.cartItemId === item.cartItemId && loadingButton.type === 'dec'))
                ? { backgroundColor: '#ccc' }
                : null,
            ]}
            onPress={() => updateQuantity(item, item.quantity - 1, 'dec')}
            disabled={item.quantity <= 1 || (loadingButton.cartItemId === item.cartItemId && loadingButton.type === 'dec')}
          >
            <Icon name="remove" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              (loadingButton.cartItemId === item.cartItemId && loadingButton.type === 'add') ? { backgroundColor: '#ccc' } : null,
            ]}
            onPress={() => updateQuantity(item, item.quantity + 1, 'add')}
            disabled={loadingButton.cartItemId === item.cartItemId && loadingButton.type === 'add'}
          >
            <Icon name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.price}>Price: ₹{item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        onPress={() => confirmDeleteItem(item.productId, item.cartItemId)}
        disabled={loadingButton.cartItemId === item.cartItemId && loadingButton.type === 'delete'}
      >
        <Icon name="delete" size={30} color="red" />
      </TouchableOpacity>
    </View>
  );

  const renderAddressItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.addressItem,
        selectedAddress?.deliveryAddressId === item.deliveryAddressId && styles.selectedAddressItem,
      ]}
      onPress={() => handleSelectAddress(item)}
    >
      <Text style={styles.addressText}>{item.address}, {item.landmark}</Text>
      <Text style={styles.addressText}>{item.city}, {item.state} - {item.pin}</Text>
      <Text style={styles.addressText}>Mobile: {item.mobile}</Text>
    </TouchableOpacity>
  );

  const totalAmount = Math.max(0, (allCartItems.cartTotalPrice || 0) - discount);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.container}>
        <Text style={styles.cartTitle}>Cart Items</Text>
        <Text style={{ marginBottom: 10 }}>Pull down to refresh cart items</Text>

        {allCartItems.cartItemsDto && allCartItems.cartItemsDto.length === 0 ? (
          <Text style={styles.emptyCartText}>No items in the cart</Text>
        ) : (
          <FlatList
            data={allCartItems.cartItemsDto}
            keyExtractor={(item) => item.cartItemId.toString()}
            renderItem={renderCartItem}
            scrollEnabled={false}
          />
        )}

        {allCartItems.cartItemsDto && allCartItems.cartItemsDto.length > 0 && (
          appliedPromo ? (
            <View style={styles.appliedPromoContainer}>
              <Text style={styles.appliedText}>
                Applied "{appliedPromo}" - Discount ₹{discount.toFixed(2)}
              </Text>
              <TouchableOpacity onPress={handleRemovePromoCode} style={styles.removePromoButton}>
                <Text style={styles.removePromoText}>Remove Promo Code</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.promoContainer}>
              <TextInput
                style={styles.promoInput}
                placeholder="Enter Promo Code"
                value={promoCode}
                onChangeText={setPromoCode}
              />
              <TouchableOpacity style={styles.applyButton} onPress={handleApplyPromoCode}>
                <Text style={{ color: 'white' }}>Apply</Text>
              </TouchableOpacity>
            </View>
          )
        )}

        <View style={styles.paymentModeContainer}>
          <Text style={styles.addressTitle}>Choose Payment Mode</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMode === 'online' && styles.paymentOptionSelected]}
              onPress={() => setPaymentMode('online')}
            >
              <Text style={paymentMode === 'online' ? styles.selectedText : styles.optionText}>Online</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMode === 'cod' && styles.paymentOptionSelected]}
              onPress={() => setPaymentMode('cod')}
            >
              <Text style={paymentMode === 'cod' ? styles.selectedText : styles.optionText}>Cash on Delivery</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.addressListContainer}>
          <View style={styles.addressHeader}>
            <Text style={styles.addressTitle}>Choose Delivery Address</Text>
            <TouchableOpacity style={styles.addAddressButton} onPress={handleAddNewAddress}>
              <Text style={styles.addAddressText}>Add Address</Text>
            </TouchableOpacity>
          </View>
          {userAddresses.length > 0 ? (
            <FlatList
              data={userAddresses}
              renderItem={renderAddressItem}
              keyExtractor={(item) => item.deliveryAddressId.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.addressList}
            />
          ) : (
            <Text style={styles.emptyAddressText}>No addresses available</Text>
          )}
        </View>

        <View style={styles.totalContainer}>
          <TouchableOpacity
            onPress={doPayment}
            disabled={allCartItems.cartItemsDto && allCartItems.cartItemsDto.length === 0}
          >
            <Text
              style={[
                styles.totalText,
                {
                  opacity: allCartItems.cartItemsDto && allCartItems.cartItemsDto.length === 0 ? 0.5 : 1,
                },
              ]}
            >
              Place Order: ₹{totalAmount.toFixed(2)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: StatusBar.currentHeight,
    backgroundColor: '#ffffff',
  },
  cartTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 30,
  },
  cartItemContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  quantityButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  quantity: {
    fontSize: 16,
    marginHorizontal: 10,
    color: '#000',
    fontWeight: '500',
  },
  price: {
    fontSize: 15,
    color: '#555',
  },
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
  applyButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  appliedPromoContainer: {
    backgroundColor: '#d4edda',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  appliedText: {
    fontWeight: 'bold',
    color: '#155724',
  },
  removePromoButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#c82333',
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  removePromoText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  paymentModeContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  paymentOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  paymentOptionSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  optionText: {
    color: '#000',
    fontWeight: '500',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  totalContainer: {
    padding: 16,
    backgroundColor: '#343a40',
    borderRadius: 12,
    marginTop: 30,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addressListContainer: {
    marginTop: 20,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginBottom: 15,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addAddressButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: 130,
    alignItems: 'center',
  },
  addAddressText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addressList: {
    paddingVertical: 10,
  },
  addressItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginRight: 15,
    width: 250,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedAddressItem: {
    borderColor: '#007bff',
    borderWidth: 2,
    backgroundColor: '#e7f1ff',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  emptyAddressText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    paddingVertical: 10,
  },
});