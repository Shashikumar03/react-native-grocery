// hooks/useAuth.js
import { useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode';
import { getToken } from '../../utils/token';

export function useAuth() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function checkToken() {
      const token = await getToken();
      console.log("🔐 Retrieved token:", token); // Debugging token

      if (token) {
        try {
          const decoded = jwtDecode(token);
          console.log("🧠 Decoded token:", decoded); // Debugging decoded token

          const isExpired = decoded.exp * 1000 < Date.now();
          console.log("⏳ Is token expired?", isExpired); // Debugging expiry check

          setIsSignedIn(!isExpired);
        } catch (err) {
          console.error("❌ Error decoding token", err);
          setIsSignedIn(false);
        }
      } else {
        console.warn("⚠️ No token found");
        setIsSignedIn(false);
      }

      setIsLoaded(true);
    }

    checkToken();
  }, []);

  return { isSignedIn, isLoaded };
}
