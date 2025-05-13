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
import { getDeliveryAddressId, getUserId } from '../../utils/token';
import { applyPromoCode } from '../../service/promoCode/applyPromoCode';
import { getDeliveryAddressByItsId } from '../../service/deliveryAddress/GetDeliveryAddressByDeliveryId';
import { getPaymentOrder } from '../../service/rozarpay/rozerpay';
import { applyPromoCodeDiscount } from '../../service/promoCode/applyPromoCodeDiscount';

export default function Cart() {
  const [allCartItems, setAllCartItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [idOfCart, setIdOfCart]= useState(null)
  const [selectedAddress, setSelectedAddresss] = useState();
  const [paymentMode, setPaymentMode] = useState('online'); // 'online' or 'cod'
  const router = useRouter();

  const getCartItemMethod = async () => {
    const userId = await getUserId();
    const response = await getCartItems(userId);
    if (response.success) {
      const sortedItems = response.data.cartItemsDto.sort((a, b) => a.cartItemId - b.cartItemId);
      const cartIdOfUser=response.data.cartId
      setIdOfCart(cartIdOfUser)
      setAllCartItems({
        ...response.data,
        cartItemsDto: sortedItems,
      });
    } else {
      console.log(response.data.message);
    }
  };

  useEffect(() => {
    const getSelectedAddress = async () => {
      const addressId = await getDeliveryAddressId();
      if (addressId == null) {
        alert('please choose one address');
      } else {
        const response = await getDeliveryAddressByItsId(addressId);
        if (response.success) {
          setSelectedAddresss(response.data);
        }
      }
    };
    getSelectedAddress();
  }, []);

  useFocusEffect(
    useCallback(() => {
      getCartItemMethod();
      return () => {};
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await getCartItemMethod();
    setRefreshing(false);
  };

  const confirmDeleteItem = (productId) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item from the cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: () => handleDeleteItem(productId) },
    ]);
  };

  const handleDeleteItem = async (productId) => {
    const userId = await getUserId();
    const response = await removeItemFromCart(userId, productId);
    if (response.success) {
      getCartItemMethod();
    } else {
      ToastAndroid.show(`Error: ${response.data.message}`, ToastAndroid.BOTTOM);
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
      response = await increaseOrDecreaseCartItem(cartItemId, 'add');
    } else {
      response = await increaseOrDecreaseCartItem(cartItemId, 'dec');
    }

    if (response.success) {
      getCartItemMethod();
    } else {
      ToastAndroid.show(`Error: ${response.data.message}`, ToastAndroid.BOTTOM);
    }
  };

  const handleApplyPromoCode = async () => {
    const userId = await getUserId();
    if (!promoCode) return;

    const response = await applyPromoCode(userId, promoCode);
    if (response.success) {
      ToastAndroid.show(response.data.message, ToastAndroid.SHORT);
      setDiscount(response.data.discountAmount);
      setAppliedPromo(response.data.promoCode);
      await applyPromoCodeDiscount(idOfCart, response.data.discountAmount)
    } else {
      ToastAndroid.show(response.data.message, ToastAndroid.LONG);
    }
  };
  const handleRevomePromoCode= async()=>{

      setPromoCode('');
      setDiscount(0);
      setAppliedPromo(null);
      await applyPromoCodeDiscount(idOfCart, 0)

    
  };

  const doPayment = async () => {
    console.log("payment mode", paymentMode)
    const orderAmount = totalAmount.toFixed(2);
    if (paymentMode === 'online') {
      const orderId = 'order_PMSNen1QWtsEPD';
      router.push(`/rozarpay/${orderId}`);
    } else {
      console.log("shashi")
      const addressId = await getDeliveryAddressId();
      const storedUserId = await getUserId();
       const response = await getPaymentOrder(storedUserId, addressId, "CASH_ON_DELIVERY");
       console.log(response.data)
       if(response.success){
         Alert.alert('Payment Successful', `Payment ID: ${1}`, [
                  { text: 'OK', onPress: () => router.push('/home') },
                ]);
       }else{
        console.log("cash on delivery response :", response.data)
        Alert.alert("Delivery failed");
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
        <Text style={styles.price}>Price: ₹{item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity onPress={() => confirmDeleteItem(item.productId)}>
        <Icon name="delete" size={30} color="red" />
      </TouchableOpacity>
    </View>
  );

  const totalAmount = (allCartItems.cartTotalPrice || 0) - discount;

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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      {/* Promo Code Section */}
      {appliedPromo ? (
        <View style={styles.appliedPromoContainer}>
          <Text style={styles.appliedText}>
            Applied "{appliedPromo}" - Discount ₹{discount.toFixed(2)}
          </Text>
          <TouchableOpacity
            onPress={handleRevomePromoCode}
            style={styles.removePromoButton}
          >
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
      )}

      {selectedAddress && (
        <View style={styles.addressContainer}>
          <Text style={styles.addressTitle}>Delivery Address</Text>
          <Text>
            {selectedAddress.address}, {selectedAddress.landmark}
          </Text>
          <Text>
            {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pin}
          </Text>
          <Text>Mobile: {selectedAddress.mobile}</Text>
        </View>
      )}

      {/* Payment Mode Selection */}
      <View style={styles.paymentModeContainer}>
        <Text style={styles.addressTitle}>Choose Payment Mode</Text>
        <View style={styles.paymentOptions}>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMode === 'online' && styles.paymentOptionSelected]}
            onPress={() => setPaymentMode('online')}
          >
            <Text style={paymentMode === 'online' ? styles.selectedText : styles.optionText}>
              Online
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMode === 'cod' && styles.paymentOptionSelected]}
            onPress={() => setPaymentMode('cod')}
          >
            <Text style={paymentMode === 'cod' ? styles.selectedText : styles.optionText}>
              Cash on Delivery
            </Text>
          </TouchableOpacity>
        </View>
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
                opacity:
                  allCartItems.cartItemsDto && allCartItems.cartItemsDto.length === 0 ? 0.5 : 1,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
  addressContainer: {
    padding: 15,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    marginTop: 20,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
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
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 15,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  // container: {
  //   flex: 1,
  //   backgroundColor: '#ffffff',
  // },
  
  // scrollContent: {
  //   padding: 16,
  //   paddingBottom: 30,
  // },
});

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, marginTop: StatusBar.currentHeight },
//   cartTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   emptyCartText: {
//     fontSize: 18, fontWeight: 'bold', color: 'gray', textAlign: 'center', marginTop: 20,
//   },
//   cartItemContainer: {
//     flexDirection: 'row', backgroundColor: '#f9f9f9',
//     padding: 15, marginBottom: 15, borderRadius: 8,
//     shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
//   },
//   productImage: { width: 80, height: 80, borderRadius: 10, marginRight: 15 },
//   detailsContainer: { flex: 1, justifyContent: 'center' },
//   productName: { fontSize: 18, fontWeight: 'bold' },
//   quantityContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
//   quantity: { fontSize: 16, marginHorizontal: 10, color: '#555' },
//   price: { fontSize: 16, color: '#333' },
//   quantityButton: { backgroundColor: "blue", borderRadius: 3, padding: 2 },
//   promoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
//   promoInput: {
//     flex: 1, borderWidth: 1, borderColor: 'gray', padding: 10,
//     borderRadius: 5, marginRight: 10,
//   },
//   applyButton: {
//     backgroundColor: 'blue', paddingVertical: 10, paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   appliedPromoContainer: {
//     backgroundColor: '#e0ffe0', padding: 12, borderRadius: 6, marginTop: 20,
//   },
//   appliedText: { fontWeight: 'bold', color: 'green' },
//   removePromoButton: {
//     marginTop: 8, padding: 6, backgroundColor: '#ff6666',
//     borderRadius: 4, alignSelf: 'flex-start',
//   },
//   removePromoText: { color: 'white', fontWeight: 'bold' },
 
//   addressContainer: {
//     padding: 15,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 10,
//     marginTop: 10,
//   },
//   addressTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   totalContainer: {
//     padding: 15,
//     backgroundColor: 'black',
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   totalText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: 'white',
//   },
//   paymentModeContainer: {
//     marginTop: 20,
//     padding: 15,
//     backgroundColor: '#f4f4f4',
//     borderRadius: 10,
//   },
//   paymentOptions: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginTop: 10,
//   },
//   paymentOption: {
//     padding: 10,
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: 'gray',
//   },
//   paymentOptionSelected: {
//     backgroundColor: 'blue',
//     borderColor: 'blue',
//   },
//   optionText: {
//     color: 'black',
//     fontWeight: '500',
//   },
//   selectedText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
// });
