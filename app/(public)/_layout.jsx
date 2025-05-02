import React from 'react';
import { Redirect, Stack } from 'expo-router';
// import { useAuth } from '@clerk/clerk-expo';

const PublicLayout = () => {
//   const { isSignedIn } = useAuth()
// isSignedIn=true

  // console.log("shashi", isSignedIn)
  // if (isSignedIn) {
  //   return <Redirect href={'/home'} />
  //   // <Redirect
  // }
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6c47ff',
        },
        headerTintColor: '#fff',
        headerBackTitle: 'Back',
      }}>
      <Stack.Screen
        name="login"
        options={{
          headerTitle: 'Login Here',
        }}></Stack.Screen>
      <Stack.Screen
        name="register"
        options={{
          headerTitle: 'Create Account',
        }}></Stack.Screen>
      <Stack.Screen
        name="reset"
        options={{
          headerTitle: 'Reset Password',
        }}></Stack.Screen>
    </Stack>
  );
};

export default PublicLayout;