import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { hasToken } from './utils/tokenStorage';

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Token kontrolü yaparak kullanıcının oturum durumunu belirle
    const checkLoginStatus = async () => {
      const hasValidToken = await hasToken();
      setIsLoggedIn(hasValidToken);
    };
    
    checkLoginStatus();
  }, []);
  
  // Yükleniyor durumu
  if (isLoggedIn === null) {
    return null;
  }
  
  // Token varsa ana sayfaya, yoksa login sayfasına yönlendir
  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
} 