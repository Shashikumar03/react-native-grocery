// import React, { useState } from 'react';
// import { View, Button, StyleSheet, Alert } from 'react-native';
// import { WebView } from 'react-native-webview';

// export default function RazorpayPaymentScreen() {
//   const [showWebView, setShowWebView] = useState(false);
//   const [paymentUrl, setPaymentUrl] = useState('');

//   // Replace this with your dynamic Razorpay Order ID
//   const orderId = 'order_PDb2seFXIpX7JF'; // Static order ID for testing
//   const keyId = 'rzp_test_E3jdBfkpQyI0n6'; // Replace with your Razorpay key ID

//   const createRazorpayOrder = async () => {
//     try {
//       // Constructing the payment URL for Razorpay
//       const paymentUrl = `https://checkout.razorpay.com/v1/checkout.js?order_id=${orderId}&key=${keyId}`;
//       setPaymentUrl(paymentUrl); // Set the URL for the WebView
//       setShowWebView(true); // Show WebView
//     } catch (error) {
//       console.error('Error creating order:', error);
//       Alert.alert('Error', 'Error creating order');
//     }
//   };

//   // Handle response from Razorpay
//   const handlePaymentResponse = (event) => {
//     const paymentResponse = event.nativeEvent.data;
//     console.log('Payment Response:', paymentResponse);
//     // Handle the payment response (success or failure)
//     Alert.alert('Payment Response', paymentResponse);
//   };

//   return (
//     <View style={styles.container}>
//       {!showWebView ? (
//         <Button title="Pay with Razorpay" onPress={createRazorpayOrder} />
//       ) : (
//         <WebView
//           source={{
//             uri: paymentUrl,
//           }}
//           javaScriptEnabled={true}
//           domStorageEnabled={true}
//           onMessage={handlePaymentResponse} // Handle Razorpay response here
//           onError={(error) => {
//             console.log('Error loading WebView:', error);
//             Alert.alert('Error', 'Error loading payment page');
//           }}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
// });
