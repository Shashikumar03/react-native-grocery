import { Redirect } from "expo-router";
import { useAuth } from "../service/Login/UseAuth";
// import { useUser } from "@clerk/clerk-expo"; // or your own auth hook

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;
  console.log(`shashi is checking ${isSignedIn}`)
  console.log(`Checking isSignedIn in Index: ${isSignedIn}`);

  return <Redirect href={isSignedIn ? '/home' : '/login'} />;
}
