import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from './context/AuthContext';

export default function Index() {
  const { isLoggedIn, isLoading } = useAuth();
  const [forceRedirect, setForceRedirect] = useState(false);
  
  // 5 saniye sonra zorla yönlendir (iOS için güvenlik)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('⚠️ Loading timeout - zorla yönlendiriliyor');
        setForceRedirect(true);
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [isLoading]);
  
  // Zorla yönlendirme veya loading tamamlandıysa
  if (!isLoading || forceRedirect) {
    // Token varsa ana sayfaya, yoksa splash sayfasına yönlendir
    if (isLoggedIn) {
      return <Redirect href="/(tabs)" />;
    } else {
      return <Redirect href="/(auth)/splash" />;
    }
  }
  
  // AuthContext yükleniyor durumunda loading göster
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#9733EE" />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
}); 