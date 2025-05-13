import { View, StyleSheet, StatusBar, SafeAreaView, ScrollView } from 'react-native';
import React from 'react';
import CustomHeader from '../../components/Header/CustomHeader';
import HomeCategory from '../../components/Home/HomeCategory';
import AllCategoriesFromApi from '../../components/Home/ApiCategories/AllCategoriesFromApi';

export default function Home() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f2f2" />
      
      {/* Fixed Header & Category */}
      <View style={styles.fixedTop}>
        <CustomHeader />
        <HomeCategory />
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <AllCategoriesFromApi />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  fixedTop: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  scrollContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
});
