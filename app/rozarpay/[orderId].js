import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Buffer } from 'buffer';

import { getPaymentOrder } from '../../service/rozarpay/rozerpay';
import { updatePayment } from '../../service/payment/UpdatePayment';
import { getCurrentUserId, getUserId } from '../../utils/token';

export default function RazorpayPaymentScreen() {
  const router = useRouter();
  const razorpayKey = 'rzp_live_UDn0rqtiftjbPd';

  const [paymentUrl, setPaymentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [rozerpayId, setRozerpayId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [deliveryAddressId, setDeliveryAddressId] = useState(null);
  const { orderId } = useLocalSearchParams();

  // Step 1: Fetch IDs and then create order
  useEffect(() => {
    console.log("shashi address id", orderId)
    const init = async () => {
      try {
        const addressId = orderId;
        const storedUserId = await getCurrentUserId();

        if (!addressId || !storedUserId) {
          if (!addressId) {
            Alert.alert("Failed", "Please select the Address  from user profile");
            router.replace("/current-user");
          } else {
            Alert.alert("Failed", "Please login");
            router.replace("/login");
          }
          return;
        }

        setDeliveryAddressId(addressId);
        setUserId(storedUserId);

        // Step 2: Once IDs are available, create order
        const response = await getPaymentOrder(storedUserId, addressId, "ONLINE");

        if (response.success) {
          const { rozerpayId, paymentAmount } = response.data.paymentDto;
          const amount = paymentAmount * 100;
          setRozerpayId(rozerpayId);

          const razorpayHTML = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>Razorpay Payment</title>
                <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
                <script>
                  function initiatePayment() {
                    var options = {
                      key: "${razorpayKey}",
                      amount: "${amount}",
                      currency: "INR",
                      name: "Bazzario",
                      description: "Purchase Order #${response.data.orderId}",
                      image: "https://firebasestorage.googleapis.com/v0/b/grocery-app-6fe52.appspot.com/o/images%2F35992.jpg?alt=media&token=61f73fcb-c97e-4bbb-8002-a2d2217f459d",
                      order_id: "${rozerpayId}",
                      prefill: {
                        name: "Shashi Kushwaha",
                        email: "shashikumarkushwaha3@gmail.com",
                        contact: "7073052300"
                      },
                      theme: {
                        color: "#53a20e"
                      },
                      handler: function (response) {
                        window.ReactNativeWebView.postMessage(
                          JSON.stringify({
                            success: true,
                            payment_id: response.razorpay_payment_id,
                            order_id: response.razorpay_order_id,
                            signature: response.razorpay_signature
                          })
                        );
                      },
                      modal: {
                        ondismiss: function () {
                          window.ReactNativeWebView.postMessage(
                            JSON.stringify({
                              success: false,
                              error: "Payment Cancelled by User"
                            })
                          );
                        }
                      }
                    };
                    var rzp1 = new Razorpay(options);
                    rzp1.open();
                  }
                </script>
              </head>
              <body onload="initiatePayment()" style="display: flex; justify-content: center; align-items: center; height: 100vh;">
                <h3>Loading Razorpay Payment...</h3>
              </body>
            </html>
          `;

          const base64Html = Buffer.from(razorpayHTML).toString('base64');
          setPaymentUrl(`data:text/html;base64,${base64Html}`);
        } else {
          console.error('Failed to create order check:', response.data.message);
          Alert.alert("error",response.data.message);
          router.replace("/cart");
        }
      } catch (error) {
        console.error('Error sha:', error);
        Alert.alert('Error', response.data || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Step 3: Update backend with payment result
  const updatePaymentMethod = async (paymentId, paymentStatus) => {
    try {
      if (!rozerpayId || !paymentId) return;
      await updatePayment(rozerpayId, paymentStatus, paymentId);

    } catch (err) {
      console.error("Error updating payment status:", err);
    }
  };

  // Step 4: Handle WebView messages
  const handleWebViewMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.success) {
        console.log("Payment successful:", data);
        await updatePaymentMethod(data.payment_id, "COMPLETED");
        Alert.alert('Payment Successful', `Payment ID: ${data.payment_id}`, [
          { text: 'OK', onPress: () => router.push('/home') },
        ]);
      } else {
        console.log("Payment failed or cancelled:", data);
        if (data.payment_id) {
          await updatePaymentMethod(data.payment_id, "FAILED");
        }
        const message = data.error || 'Payment was cancelled or failed.';
        Alert.alert('Payment Failed', message, [
          { text: 'OK', onPress: () => router.push('/home') },
        ]);
      }
    } catch (e) {
      console.error('Failed to handle WebView message:', e);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#53a20e" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: paymentUrl }}
      javaScriptEnabled={true}
      onMessage={handleWebViewMessage}
      style={styles.webview}
    />
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    flex: 1,
  },
});