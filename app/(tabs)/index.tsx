import { useAuth } from '@/app/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { isLoading, currentMode, isLoggedIn } = useAuth();
  const router = useRouter();
  
  // CurrentMode'a göre doğru tab'a yönlendir
  useEffect(() => {
    console.log('🏠 [HOME] State değişikliği:', { isLoading, isLoggedIn, currentMode });
    
    if (!isLoading) {
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
    }
  }, [isLoading, currentMode, isLoggedIn]);
  
  if (isLoading) {
    console.log('🏠 [HOME] Loading durumunda...');
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff' }]}>
        <ActivityIndicator 
          size="large" 
          color={colorScheme === 'dark' ? '#ffffff' : '#000000'} 
        />
      </View>
    );
  }
  
  // Loading bittiyse ama hala bu ekrandaysak, yönlendirme yap
  return (
    <View style={[styles.loadingContainer, { backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff' }]}>
      <ActivityIndicator 
        size="large" 
        color={colorScheme === 'dark' ? '#ffffff' : '#000000'} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
