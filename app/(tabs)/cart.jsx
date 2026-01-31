
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
  ActivityIndicator,
} from 'react-native';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
// removed CustomHeader as per request to remove headers
// import CustomHeader from '../../components/Header/CustomHeader';
import { Modal } from 'react-native';
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
import { getDeliveryCharge } from '../../service/fee/deliveryCharge';

export default function Cart() {
  const [allCartItems, setAllCartItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [idOfCart, setIdOfCart] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [paymentMode, setPaymentMode] = useState('online');
  const [userAddresses, setUserAddresses] = useState([]);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [loadingButton, setLoadingButton] = useState({ cartItemId: null, type: null });
  const [isPlaceOrderLoading, setIsPlaceOrderLoading] = useState(false);

  const router = useRouter();
  
  // global processing flag: if any per-item button or place-order is loading, freeze other buttons
  const anyProcessing = isPlaceOrderLoading || (loadingButton && loadingButton.cartItemId !== null);
  useEffect(() => {
    const fetchDeliveryCharge = async () => {
      const response = await getDeliveryCharge();
      if (response.success) {
        setDeliveryCharge(paymentMode === 'cod' ? response.data.deliveryChargesOnCashOnDelivery : response.data.deliveryChargesOnOnlineDelivery);
      } else {
        console.log('Failed to fetch delivery charges:', response.data.message);
      }
    };
    fetchDeliveryCharge();
  }, []);

  useEffect(() => {
    const updateDeliveryCharge = async () => {
      const response = await getDeliveryCharge();
      if (response.success) {
        setDeliveryCharge(paymentMode === 'cod' ? response.data.deliveryChargesOnCashOnDelivery : response.data.deliveryChargesOnOnlineDelivery);
      }
    };
    updateDeliveryCharge();
  }, [paymentMode]);

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
        console.log('Cart fetch error:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const getAllDeliveryAddressOfUser1 = async () => {
    try {
      const userId = await getCurrentUserId();
      const response = await getAllDeliveryAddressOfUser(userId);
      if (response.success) {
        setUserAddresses(response.data);
      } else {
        Alert.alert('Failed', 'Failed to fetch addresses');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while fetching addresses');
    }
  };

  // data loader will fetch both cart items and addresses together

  const [isLoading, setIsLoading] = useState(true);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([getCartItemMethod(), getAllDeliveryAddressOfUser1()]);
    } catch (e) {
      console.error('Error loading cart or addresses', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [loadAllData])
  );

  // Reset isPlaceOrderLoading when returning to the cart screen (e.g., after canceling online payment)
  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsPlaceOrderLoading(false); // Reset loading state when navigating back to cart
      };
    }, [])
  );

  // Ensure user selects an address when opening the cart
  useFocusEffect(
    useCallback(() => {
      if (!selectedAddress) {
        openAddressModal();
      }
    }, [selectedAddress, userAddresses])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  // skeleton pulse animation
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

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
      ToastAndroid.show('Delete failed', ToastAndroid.BOTTOM);
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
      ToastAndroid.show('Something went wrong', ToastAndroid.BOTTOM);
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

  const handleSelectAddress = (address) => setSelectedAddress(address);
  const handleAddNewAddress = () => router.push('/address/add-address');

  const openAddressModal = () => setAddressModalVisible(true);
  const closeAddressModal = () => setAddressModalVisible(false);
  const handleChooseAddress = (address) => {
    setSelectedAddress(address);
    closeAddressModal();
  };

  const doPayment = async () => {
    if (!selectedAddress) {
      Alert.alert('No Address Selected', 'कृपया delivery address चुनें.');
      return;
    }

    if (isPlaceOrderLoading) return;
    setIsPlaceOrderLoading(true);

    const orderAmount = totalAmount.toFixed(2);
    try {
      if (paymentMode === 'online') {
        const orderId = selectedAddress.deliveryAddressId;
        router.push(`/rozarpay/${orderId}`);
        // isPlaceOrderLoading remains true until handled by useFocusEffect or Razorpay callback
      } else {
        const userId = await getCurrentUserId();
        const response = await getPaymentOrder(userId, selectedAddress.deliveryAddressId, 'CASH_ON_DELIVERY');
        if (response.success) {
          Alert.alert('Payment Successful', `Payment ID: ${response.data?.paymentDto.id}`, [
            {
              text: 'OK',
              onPress: async () => {
                await getCartItemMethod(); // Refresh cart data after successful order
                setSelectedAddress(null); // Reset address
                setPromoCode(''); // Reset promo code
                setDiscount(0); // Reset discount
                setAppliedPromo(null); // Reset applied promo
                router.push('/home'); // Navigate to home
                setIsPlaceOrderLoading(false); // Reset loading state after navigation
              },
            },
          ]);
        } else {
          Alert.alert(`Order Failed: ${response.data?.message}`);
          setIsPlaceOrderLoading(false);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong during payment');
      setIsPlaceOrderLoading(false);
    }
  };

  const totalAmount = Math.max(0, (allCartItems.cartTotalPrice || 0) - discount + (allCartItems.cartItemsDto?.length > 0 ? deliveryCharge : 0));

  const subtotal = allCartItems.cartItemsDto?.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0) || 0;
  return (
    <>
    {/* Fixed top header with selected address */}
    <View style={styles.topHeader} pointerEvents="box-none">
      <View style={styles.topHeaderInner}>
        {selectedAddress ? (
          <View style={styles.selectedAddressBox}>
            <Text style={styles.selectedAddressText}>{selectedAddress.address}, {selectedAddress.landmark}, {selectedAddress.city} - {selectedAddress.pin}</Text>
            <View style={styles.topAddressActions}>
              <TouchableOpacity style={styles.selectAddressButton} onPress={openAddressModal} disabled={anyProcessing}>
                <Text style={styles.selectAddressText}>Change</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addAddressButton} onPress={handleAddNewAddress} disabled={anyProcessing}>
                <Text style={styles.addAddressText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.needAddressBox} onPress={openAddressModal} disabled={anyProcessing}>
            <Text style={styles.needAddressText}>Please select a delivery address to continue</Text>
            <Text style={styles.selectAddressText}>Select Address</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>

    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 160, paddingTop: 92 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} enabled={!anyProcessing} />}
    >
      <View style={styles.container}>
        <Text style={{ marginBottom: 10 }}>Pull down to refresh cart items</Text>

        {isLoading ? (
          <View>
            <Animated.View style={[styles.skeletonHeader, { opacity: pulse }]} />
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.skeletonItem}>
                <Animated.View style={[styles.skeletonLine, { opacity: pulse }]} />
                <Animated.View style={[styles.skeletonLineShort, { opacity: pulse }]} />
              </View>
            ))}
            <Animated.View style={[styles.skeletonBreakdown, { opacity: pulse }]} />
          </View>
        ) : null}
        {!isLoading && allCartItems.cartItemsDto && allCartItems.cartItemsDto.length === 0 ? (
          <View style={styles.emptyWrapper}>
            {/* fallback image — ensure file exists or replace with a local asset */}
            {/* If asset missing, image will be ignored; keeps UI pleasant for empty state */}
            <Image source={require('../../assets/images/empty-cart.png')} style={styles.emptyImage} />
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
            <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/home')}>
              <Text style={styles.shopButtonText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
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
              <TouchableOpacity onPress={handleRemovePromoCode} style={styles.removePromoButton} disabled={anyProcessing}>
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
              <TouchableOpacity style={styles.applyButton} onPress={handleApplyPromoCode} disabled={anyProcessing}>
                <Text style={{ color: 'white' }}>Apply</Text>
              </TouchableOpacity>
            </View>
          )
        )}

        <View style={styles.paymentModeContainer}>
            <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMode === 'online' && styles.paymentOptionSelected]}
              onPress={() => setPaymentMode('online')}
              disabled={anyProcessing}
            >
              <Text style={paymentMode === 'online' ? styles.selectedText : styles.optionText}>Online</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMode === 'cod' && styles.paymentOptionSelected]}
              onPress={() => setPaymentMode('cod')}
              disabled={anyProcessing}
            >
              <Text style={paymentMode === 'cod' ? styles.selectedText : styles.optionText}>Cash on Delivery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {allCartItems.cartItemsDto && allCartItems.cartItemsDto.length > 0 && selectedAddress && (
          <View style={[styles.breakdownBox, { marginBottom: 140 }]}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Subtotal</Text>
              <Text style={styles.breakdownValue}>₹{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Discount</Text>
              <Text style={styles.breakdownValue}>-₹{discount.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Delivery</Text>
              <Text style={styles.breakdownValue}>₹{deliveryCharge.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownTotalLabel}>Total</Text>
              <Text style={styles.breakdownTotalValue}>₹{totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        )}

        {/* address list removed — selection happens via top selector and modal */}

        {/* Address selection modal (dropdown-like) */}
        <Modal visible={addressModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Delivery Address</Text>
              <FlatList
                data={userAddresses}
                keyExtractor={(item) => item.deliveryAddressId.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.modalAddressItem} onPress={() => handleChooseAddress(item)} disabled={anyProcessing}>
                    <Text style={styles.addressText}>{item.address}, {item.landmark}</Text>
                    <Text style={styles.addressText}>{item.city}, {item.state} - {item.pin}</Text>
                    <Text style={styles.addressText}>Mobile: {item.mobile}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.modalCloseButton} onPress={closeAddressModal} disabled={anyProcessing}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {allCartItems.cartItemsDto && allCartItems.cartItemsDto.length > 0 && (
          <></>
        )}
      </View>
    </ScrollView>

    {allCartItems.cartItemsDto && allCartItems.cartItemsDto.length > 0 && selectedAddress && (
      <View style={styles.checkoutBar}>
        <View style={styles.checkoutInfo}>
          <Text style={styles.checkoutAmount}>₹{totalAmount.toFixed(2)}</Text>
          <Text style={styles.checkoutLabel}>Total</Text>
        </View>
        <TouchableOpacity style={styles.addMoreButton} onPress={() => router.push('/home')} disabled={anyProcessing}>
          <Icon name="add-shopping-cart" size={22} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.checkoutButton} onPress={doPayment} disabled={anyProcessing || isPlaceOrderLoading}>
          {isPlaceOrderLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          )}
        </TouchableOpacity>
      </View>
    )}
    </>
  );

  function renderCartItem({ item }) {
    const isProcessing = loadingButton.cartItemId === item.cartItemId;
    return (
        <View style={[styles.cartItemContainer, isProcessing ? styles.itemDisabled : null]}>
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
                disabled={anyProcessing || item.quantity <= 1 || (loadingButton.cartItemId === item.cartItemId && loadingButton.type === 'dec')}
              >
              {loadingButton.cartItemId === item.cartItemId && loadingButton.type === 'dec' ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Icon name="remove" size={20} color="white" />
              )}
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                (loadingButton.cartItemId === item.cartItemId && loadingButton.type === 'add') ? { backgroundColor: '#ccc' } : null,
              ]}
              onPress={() => updateQuantity(item, item.quantity + 1, 'add')}
                disabled={anyProcessing || (loadingButton.cartItemId === item.cartItemId && loadingButton.type === 'add')}
            >
              {loadingButton.cartItemId === item.cartItemId && loadingButton.type === 'add' ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Icon name="add" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.price}>Price: ₹{item.price.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          onPress={() => confirmDeleteItem(item.productId, item.cartItemId)}
           disabled={anyProcessing || (loadingButton.cartItemId === item.cartItemId && loadingButton.type === 'delete')}
        >
          {loadingButton.cartItemId === item.cartItemId && loadingButton.type === 'delete' ? (
            <ActivityIndicator size="small" color="red" />
          ) : (
            <Icon name="delete" size={30} color="red" />
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // address list renderer removed; modal's inline renderer is used for selection
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, marginTop: StatusBar.currentHeight, backgroundColor: '#ffffff' },
  cartTitle: { fontSize: 26, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  emptyCartText: { fontSize: 18, color: '#888', textAlign: 'center', marginTop: 30 },
  cartItemContainer: { flexDirection: 'row', backgroundColor: '#f8f9fa', padding: 12, borderRadius: 12, marginBottom: 15, alignItems: 'center', elevation: 2 },
  productImage: { width: 80, height: 80, borderRadius: 10, marginRight: 12 },
  detailsContainer: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '600', color: '#333' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  quantityButton: { backgroundColor: '#007bff', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3 },
  quantity: { fontSize: 16, marginHorizontal: 10, color: '#000', fontWeight: '500' },
  price: { fontSize: 15, color: '#555' },
  emptyWrapper: { alignItems: 'center', marginTop: 30 },
  emptyImage: { width: 140, height: 140, marginBottom: 12, opacity: 0.85 },
  shopButton: { marginTop: 12, backgroundColor: '#007bff', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
  shopButtonText: { color: '#fff', fontWeight: '700' },
  promoContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  promoInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginRight: 10, backgroundColor: '#f9f9f9' },
  applyButton: { backgroundColor: '#28a745', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  appliedPromoContainer: { backgroundColor: '#d4edda', padding: 12, borderRadius: 8, marginTop: 10 },
  appliedText: { fontWeight: 'bold', color: '#155724' },
  removePromoButton: { marginTop: 8, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#c82333', borderRadius: 5, alignSelf: 'flex-start' },
  removePromoText: { color: '#fff', fontWeight: 'bold' },
  paymentModeContainer: { marginTop: 20, padding: 15, backgroundColor: '#f8f8f8', borderRadius: 10 },
  paymentOptions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  paymentOption: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
  paymentOptionSelected: { backgroundColor: '#007bff', borderColor: '#007bff' },
  optionText: { color: '#000', fontWeight: '500' },
  selectedText: { color: '#fff', fontWeight: '700' },
  addressListContainer: { marginTop: 20 },
  addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addressTitle: { fontSize: 18, fontWeight: 'bold' },
  addAddressButton: { backgroundColor: '#007bff', padding: 8, borderRadius: 6 },
  addAddressText: { color: '#fff', fontWeight: 'bold' },
  addressList: { marginTop: 10 },
  addressItem: { width: 250, padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginRight: 10, backgroundColor: '#fff' },
  selectedAddressItem: { borderColor: '#007bff', borderWidth: 2 },
  addressText: { fontSize: 14, color: '#333' },
  emptyAddressText: { fontSize: 16, color: '#999', marginTop: 10 },
  totalContainer: { marginTop: 20, alignItems: 'center' },
  totalTextContainer: { 
    backgroundColor: '#007bff', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  totalText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  amountBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  breakdownBox: { marginTop: 12, padding: 12, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  breakdownLabel: { color: '#555' },
  breakdownValue: { color: '#555', fontWeight: '700' },
  breakdownDivider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  breakdownTotalLabel: { fontWeight: '700', fontSize: 16 },
  breakdownTotalValue: { fontWeight: '800', fontSize: 16 },
  checkoutBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee', alignItems: 'center' },
  checkoutInfo: { flex: 1 },
  checkoutAmount: { fontSize: 18, fontWeight: '800' },
  checkoutLabel: { color: '#666', fontSize: 12 },
  checkoutButton: { backgroundColor: '#007bff', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  checkoutButtonText: { color: '#fff', fontWeight: '800' },
  addMoreButton: { marginRight: 12, padding: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  addressActions: { flexDirection: 'row', alignItems: 'center' },
  selectAddressButton: { marginRight: 8, backgroundColor: '#6c757d', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  selectAddressText: { color: '#fff', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 8, maxHeight: '80%', padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  modalAddressItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalCloseButton: { marginTop: 12, alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 14 },
  modalCloseText: { color: '#007bff', fontWeight: '700' },
  topAddressContainer: { marginTop: 12, marginBottom: 8 },
  selectedAddressBox: { padding: 12, backgroundColor: '#f1f5f9', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  selectedAddressText: { fontSize: 14, color: '#111', marginBottom: 8 },
  topAddressActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  needAddressBox: { padding: 12, backgroundColor: '#fff3cd', borderRadius: 8, borderWidth: 1, borderColor: '#ffeeba', alignItems: 'center' },
  needAddressText: { color: '#856404', fontWeight: '600', marginBottom: 6 },
  topHeader: { position: 'absolute', left: 0, right: 0, top: StatusBar.currentHeight || 0, zIndex: 20, elevation: 8, paddingHorizontal: 12 },
  topHeaderInner: { backgroundColor: '#ffffff', borderRadius: 8, padding: 10, marginHorizontal: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 4 },
  skeletonHeader: { height: 44, borderRadius: 8, backgroundColor: '#eef2f6', marginVertical: 8 },
  skeletonItem: { paddingVertical: 12 },
  skeletonLine: { height: 16, backgroundColor: '#eef2f6', borderRadius: 6, marginBottom: 8 },
  skeletonLineShort: { width: '50%', height: 12, backgroundColor: '#eef2f6', borderRadius: 6 },
  skeletonBreakdown: { height: 80, backgroundColor: '#eef2f6', borderRadius: 8, marginTop: 12 },
  itemDisabled: { opacity: 0.6 },
});
