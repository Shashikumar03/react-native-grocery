import { View, Text, StyleSheet, StatusBar } from 'react-native'
import React from 'react'
import CustomHeader from '../../components/Header/CustomHeader';
import HomeCategory from '../../components/Home/HomeCategory';
import AllCategoriesFromApi from '../../components/Home/ApiCategories/AllCategoriesFromApi';

export default function home() {

  return (
    <View style={styles.center}>
      {/* <Text>home</Text> */}
      <CustomHeader/>
      <HomeCategory/>
      <AllCategoriesFromApi/>
    </View>
  )
}

const styles = StyleSheet.create({
    center: {
      flex: 1,
      marginTop:StatusBar.currentHeight, 
      marginLeft:10,
      marginRight:10
    }
   
  });