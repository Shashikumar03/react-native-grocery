import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { getBaseUrl } from '../../constants/Baseurl';
import { getPaymentOrder } from '../../service/rozarpay/rozerpay';
import { useRouter } from 'expo-router'; // Importing useRouter from expo-router

export default function RazorpayPaymentScreen({ route }) {
    const router = useRouter();
    const backendUrl = `${getBaseUrl()}/api/place-order/1`;  // Assuming this endpoint creates an order
    const razorpayKey = 'rzp_test_O8N5m4YSInMmSC'; // Your Razorpay test key

    const [paymentUrl, setPaymentUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch order details from backend
        const createOrder = async () => {
            try {
                const response = await getPaymentOrder();  // Assuming getPaymentOrder() makes a call to backend
                if (response.status) {
                    console.log("Successfully order ID is created:", response.data);

                    // Extract Razorpay Order ID and Payment Amount
                    const { rozerpayId, paymentAmount } = response.data.paymentDto;
                    const amount = paymentAmount * 100;  // Convert to paise (smallest currency unit)

                    // Generate Razorpay checkout options HTML
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
                                  name: "Acme Corp",
                                  description: "Purchase Order #${response.data.orderId}",
                                  image: "https://i.imgur.com/3g7nmJC.jpg",
                                  order_id: "${rozerpayId}",
                                  prefill: {
                                    name: "John Doe",
                                    email: "john.doe@example.com",
                                    contact: "9999999999"
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
                                        JSON.stringify({ success: false, error: "Payment Cancelled by User" })
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

                    // Set the Razorpay checkout HTML to be loaded in the WebView
                    setPaymentUrl(`data:text/html;base64,${btoa(razorpayHTML)}`);
                    setIsLoading(false);
                } else {
                    console.log(response.data);
                    Alert.alert('Error', 'Failed to create order. Please try again.');
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error creating order:', error);
                Alert.alert('Error', 'Failed to create order. Please try again.');
                setIsLoading(false);
            }
        };

        createOrder();
    }, [backendUrl]);

    const handleWebViewMessage = (event) => {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.success) {
            Alert.alert('Payment Successful', `Payment ID: ${data.payment_id}`, [
                {
                    text: 'OK',
                    onPress: () => {
                        // Navigate to the home page after payment success
                        router.push('/home'); // Replace 'Home' with your home screen's name
                    }
                }
            ]);
        } else {
            Alert.alert('Payment Failed', data.error || 'Unknown error occurred.');
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
