import Loader from './components/Loader';  // Import the loader component

const handleAddToCart = async (productId) => {
  setIsAddingToCart(true); // Set loading state to true
  const userId = await getUserId();
  try {
    await addProductToCart(userId, productId, 1); // Add one item
    setSuccessMessage('Item added to cart successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);  // Hide the message after 3 seconds
    fetchCartItems(); // Update the cart count after adding item
  } catch (err) {
    console.error('Error adding product to cart', err);
  } finally {
    setIsAddingToCart(false); // Set loading state to false once the operation is complete
  }
};

const renderItem = ({ item }) => {
  const originalPrice = item.price + Math.ceil(item.price * 0.10);
  const discountVal = Math.ceil(item.price * 0.10);

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.category}>{item.categoryDto?.name}</Text>
      <Text style={styles.extraChargeText}>-₹{discountVal} (10% off)</Text>
      <View style={styles.priceWrapper}>
        <Text style={styles.price}>₹{item.price}</Text>
        <Text style={styles.originalPrice}>{originalPrice} ₹</Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleAddToCart(item.id)}
        disabled={isAddingToCart} // Disable the button while adding to cart
      >
        {isAddingToCart ? (
          <Loader /> // Custom Loader instead of ActivityIndicator
        ) : (
          <Text style={styles.buttonText}>Add to Cart</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
