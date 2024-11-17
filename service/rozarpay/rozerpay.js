import RazorpayCheckout from 'react-native-razorpay';



// Function to handle payment
export const handlePayment = async () => {
    console.log("payment hona chahiye")
  try {
    // Create order and get order details
    // const orderResponse = await createOrder(amount);

    const options = {
      description: 'Payment for your cart items',
      image: 'https://i.imgur.com/3g7nmJC.jpg',
      currency: 'INR',
      key: 'rzp_test_E3jdBfkpQyI0n6', // Your Razorpay API key
      amount: 100, // Amount from the order response (in paisa)
      name: 'Your Grocery Store',
      order_id: 'order_PDb2seFXIpX7JF', // Use the dynamically generated order ID
      prefill: {
        email: 'user@example.com',
        contact: '9191919191',
        name: 'User Name',
      },
      theme: { color: '#53a20e' },
    };

    RazorpayCheckout.open(options)
      .then((data) => {
        // Handle success
        console.log(data);
        alert(`Payment Successful: ${data.razorpay_payment_id}`);
        // Optionally update your order status here
      })
      .catch((error) => {
        // Handle failure
        console.error("Payment Error:", error);
        alert(`Payment Error: ${error.code} | ${error.description}`);
      });

  } catch (error) {
    console.error("Error during payment process:", error);
    alert(`Error: ${error.message}`);
  }
};
