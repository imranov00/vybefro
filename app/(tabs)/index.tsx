import { useAuth } from '@/app/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { isLoading, currentMode, isLoggedIn } = useAuth();
  const router = useRouter();
  
  // Direkt yönlendirme - loading bekleme
  useEffect(() => {
    console.log('🏠 [HOME] State değişikliği:', { isLoading, isLoggedIn, currentMode });
    
    // Loading durumunda bile direkt yönlendir
    if (!isLoggedIn) {
      // Giriş yapılmamışsa login ekranına yönlendir
      console.log('🏠 [HOME] Login ekranına yönlendiriliyor');
      router.replace('/(auth)/login');
      return;
    }
    
    if (currentMode === 'music') {
      console.log('🏠 [HOME] Music tab\'ına yönlendiriliyor');
      router.replace('/(tabs)/music');
    } else {
      console.log('🏠 [HOME] Astrology tab\'ına yönlendiriliyor');
      router.replace('/(tabs)/astrology');
    }
  }, [isLoading, currentMode, isLoggedIn]);
  
  // Loading durumunda bile boş ekran gösterme
  if (isLoading) {
    console.log('🏠 [HOME] Loading durumunda - boş ekran');
    return null; // Hiçbir şey gösterme
  }
  
  // Bu noktaya gelirse bir sorun var, boş ekran göster
  return null;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
