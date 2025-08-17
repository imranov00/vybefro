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
    if (!isLoading) {
      if (!isLoggedIn) {
        // Giriş yapılmamışsa login ekranına yönlendir
        router.replace('/(auth)/login');
        return;
      }
      
      if (currentMode === 'music') {
        router.replace('/(tabs)/music');
      } else {
        router.replace('/(tabs)/astrology');
      }
    }
  }, [isLoading, currentMode, isLoggedIn]);
  
  if (isLoading) {
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
