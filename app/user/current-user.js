import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getToken, removeToken, clearSession } from '../../utils/token';
import { getLoginUserDetails } from '../../service/Login/GetLoginUserDetails';
import { getUserById } from '../../service/Login/userUserById';

const { width } = Dimensions.get('window');

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong.</Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false })}
            style={styles.retryButton}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Retry</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function CurrentUser() {
  console.log('CurrentUser: Mounting');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoutScale = useRef(new Animated.Value(1)).current;
  const aboutScale = useRef(new Animated.Value(1)).current;
  const closeScale = useRef(new Animated.Value(1)).current;

  const animateButtonPress = (scaleAnim) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    console.log('CurrentUser: useEffect ran');
    setTimeout(() => setIsReady(true), 100);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const fetchUser = async () => {
      try {
        const token = await getToken();
        if (!token) {
          Alert.alert('Error', 'No token found');
          router.replace('/login');
          return;
        }

        const response = await getLoginUserDetails(token);
        if (response.success) {
          const userId = response.data.userId;
          const currentUser = await getUserById(userId);
          setUserData(currentUser.data);
        } else {
          if (response.data === 'Given jwt token is expired !!') {
            router.push('/login');
          }
          Alert.alert('Failed', 'Could not fetch user details');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    return () => console.log('CurrentUser: Unmounting');
  }, []);

  const handleLogout = () => {
    animateButtonPress(logoutScale);
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeToken();
            await clearSession();
            router.replace('/login');
          } catch {
            Alert.alert('Error', 'Something went wrong during logout.');
          }
        },
      },
    ]);
  };

  const handleAboutPress = () => {
    animateButtonPress(aboutScale);
    setShowAboutModal(true);
  };

  const handleCloseModal = () => {
    animateButtonPress(closeScale);
    setShowAboutModal(false);
  };

  if (!isReady) {
    return null;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1E3A8A', '#3B82F6']}
          style={styles.background}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading Profile...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1E3A8A', '#3B82F6']}
          style={styles.background}
        >
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error loading user details</Text>
            <TouchableOpacity
              onPress={() => router.push('/login')}
              style={styles.retryButton}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Go to Login</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1E3A8A', '#3B82F6']}
          style={styles.background}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
              <Text style={styles.heading}>Your Profile</Text>
              <View style={styles.detailRow}>
                <Ionicons name="person-outline" size={20} color="#10B981" style={styles.icon} />
                <Text style={styles.label}>Name: {userData.name || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="mail-outline" size={20} color="#10B981" style={styles.icon} />
                <Text style={styles.label}>Email: {userData.email || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={20} color="#10B981" style={styles.icon} />
                <Text style={styles.label}>Mobile: {userData.phoneNumber || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="shield-outline" size={20} color="#10B981" style={styles.icon} />
                <Text style={styles.label}>Role: {userData.role || 'N/A'}</Text>
              </View>
              <Animated.View style={[styles.logoutButton, { transform: [{ scale: logoutScale }] }]}>
                <TouchableOpacity
                  onPress={handleLogout}
                  accessibilityLabel="Logout button"
                  accessibilityHint="Logs out of your account"
                  accessibilityRole="button"
                >
                  <LinearGradient
                    colors={['#EF4444', '#B91C1C']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>Logout</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
              <Animated.View style={[styles.aboutButton, { transform: [{ scale: aboutScale }] }]}>
                <TouchableOpacity
                  onPress={handleAboutPress}
                  accessibilityLabel="About the App button"
                  accessibilityHint="Opens information about the BAZZARIO app"
                  accessibilityRole="button"
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>About the App</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </ScrollView>

          <Modal
            visible={showAboutModal}
            animationType="slide"
            onRequestClose={handleCloseModal}
            transparent={false}
          >
            <SafeAreaView style={styles.modalContainer}>
              <LinearGradient
                colors={['#1E3A8A', '#3B82F6']}
                style={styles.modalBackground}
              >
                <ScrollView contentContainerStyle={styles.modalScrollContainer}>
                  <Text style={styles.modalHeading}>About BAZZARIO</Text>
                  <View style={styles.modalSection}>
                    <Ionicons name="information-circle-outline" size={24} color="#10B981" style={styles.modalIcon} />
                    <Text style={styles.modalText}>
                      BAZZARIO is your go-to mobile app for seamless shopping and personalized services. Explore a wide range of products, manage your profile, and enjoy a tailored user experience designed to make your life easier.
                    </Text>
                  </View>
                  <View style={styles.modalDivider} />
                  <Text style={styles.modalSubHeading}>App Policy</Text>
                  <View style={styles.modalSection}>
                    <Ionicons name="lock-closed-outline" size={24} color="#10B981" style={styles.modalIcon} />
                    <Text style={styles.modalText}>
                      By using BAZZARIO, you agree to use the app responsibly and in compliance with all applicable laws. We collect and process personal data (e.g., name, email, phone) to provide and improve our services, as outlined in our Privacy Policy. Unauthorized use, including sharing accounts or engaging in fraudulent activities, may result in account suspension. For full terms, please visit our website at bazzario.com.
                    </Text>
                  </View>
                  <View style={styles.modalDivider} />
                  <Text style={styles.modalSubHeading}>Copyright</Text>
                  <View style={styles.modalSection}>
                    <Ionicons name="document-text-outline" size={24} color="#10B981" style={styles.modalIcon} />
                    <Text style={styles.modalText}>
                      © 2025 BAZZARIO Inc. All rights reserved. The BAZZARIO app, its content, and design are protected by copyright and trademark laws. Unauthorized reproduction or distribution is prohibited.
                    </Text>
                  </View>
                  <View style={styles.modalDivider} />
                  <Text style={styles.modalSubHeading}>Customer Support</Text>
                  <View style={styles.modalSection}>
                    <Ionicons name="headset-outline" size={24} color="#10B981" style={styles.modalIcon} />
                    <Text style={styles.modalText}>
                      For assistance, contact our support team:{'\n'}
                      - Phone: +919341285445 (9 AM–6 PM IST, Everyday){'\n'}
                      - Email: support@bazzario.com{'\n'}
                      - In-App Chat: Available via the app’s Help Center
                    </Text>
                  </View>
                  <Animated.View style={[styles.modalButton, { transform: [{ scale: closeScale }] }]}>
                    <TouchableOpacity
                      onPress={handleCloseModal}
                      accessibilityLabel="Close About modal"
                      accessibilityHint="Closes the About information modal"
                      accessibilityRole="button"
                    >
                      <LinearGradient
                        colors={['#EF4444', '#B91C1C']}
                        style={styles.buttonGradient}
                      >
                        <Text style={styles.buttonText}>Close</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                </ScrollView>
              </LinearGradient>
            </SafeAreaView>
          </Modal>
        </LinearGradient>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 18,
    color: '#F9FAFB',
    flex: 1,
  },
  logoutButton: {
    marginTop: 24,
    width: '100%',
    borderRadius: 12,
  },
  aboutButton: {
    marginTop: 12,
    width: '100%',
    borderRadius: 12,
  },
  buttonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 12,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    width: '60%',
    borderRadius: 12,
  },
  modalContainer: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
  },
  modalScrollContainer: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 48,
  },
  modalHeading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSubHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginTop: 24,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#F9FAFB',
    lineHeight: 24,
  },
  modalSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  modalDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 16,
  },
  modalButton: {
    marginTop: 24,
    width: '100%',
    borderRadius: 12,
  },
});
