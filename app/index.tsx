import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { hasRefreshToken } from './utils/tokenStorage';

export default function Index() {
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 [INDEX] Token kontrolü yapılıyor...');
        const tokenExists = await hasRefreshToken();
        setHasToken(tokenExists);
        
        if (tokenExists) {
          console.log('✅ [INDEX] Token var - ana sayfaya yönlendiriliyor');
        } else {
          console.log('❌ [INDEX] Token yok - login sayfasına yönlendiriliyor');
        }
      } catch (error) {
        console.error('❌ [INDEX] Token kontrol hatası:', error);
        setHasToken(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Token kontrolü tamamlanana kadar bekle
  if (hasToken === null) {
    return null; // Çok kısa süre, kullanıcı fark etmez
  }
  
  // Token durumuna göre yönlendir
  return hasToken ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)/login" />;
} 