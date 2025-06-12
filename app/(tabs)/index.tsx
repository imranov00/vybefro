import { useAuth } from '@/app/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { isLoading, currentMode } = useAuth();
  const router = useRouter();
  
  // CurrentMode'a göre doğru tab'a yönlendir
  useEffect(() => {
    if (!isLoading) {
      if (currentMode === 'music') {
        router.replace('/(tabs)/music');
      } else {
        router.replace('/(tabs)/astrology');
      }
    }
  }, [isLoading, currentMode]);
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator 
          size="large" 
          color={colorScheme === 'dark' ? '#ffffff' : '#000000'} 
        />
      </View>
    );
  }
  
  return (
    <View style={styles.loadingContainer}>
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
    backgroundColor: '#f5f5f5',
  },
});
