
import { Redirect } from "expo-router";


export default function Index() {
  // const { isLoaded, isSignedIn } = useUser();
  // console.log(isSignedIn)
  isSignedIn=true
  return (
   
    <Redirect href={isSignedIn ? '/login' : '/home'} />
  );
}