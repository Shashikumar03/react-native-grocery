import { View, Text } from 'react-native'
import React from 'react'
import {Tabs} from "expo-router"
// import { Colors } from 'react-native/Libraries/NewAppScreen'
import Ionicons from '@expo/vector-icons/Ionicons';
import {Colors} from "./../../constants/Colors"

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
        headerShown:false,
        tabBarActiveTintColor:Colors.PRIMARY
    }}>
        <Tabs.Screen name='home'
        options={{
            tabBarLabel:"home",
            tabBarIcon:({colors})=><Ionicons name="home" size={24} color= {colors}/>
        }}/>
        <Tabs.Screen name='order'
          options={{
            tabBarLabel:"order again",
            tabBarIcon:({colors})=><Ionicons name="bag-handle-sharp" size={24} color="black" />
        }}/>
        <Tabs.Screen name='categories'
          options={{
            tabBarLabel:"categories",
            tabBarIcon:({colors})=><Ionicons name="apps" size={24} color="black" />
        }}/>
         <Tabs.Screen name='cart'
          options={{
            tabBarLabel:"cart",
            tabBarIcon:({colors})=><Ionicons name="cart" size={24} color="black" /> 
        }}/>
    </Tabs>
  )
}