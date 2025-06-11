import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function AuthLayout() {
  const { isLoading } = useAuth();

  // Uygulama başlangıcında token kontrolü yapılırken yükleme ekranı göster
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2c2c54" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="login" 
        options={{ 
          // Geri dönüş tuşunu gizle (bu ekranda geri dönmesin)
          headerLeft: () => null,
          gestureEnabled: false 
        }}
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          headerTitle: 'Kayıt Ol'
        }}
      />
      <Stack.Screen 
        name="login-music" 
        options={{ 
          headerTitle: 'Müzik Modu ile Giriş'
        }}
      />
      <Stack.Screen 
        name="register-music" 
        options={{ 
          headerTitle: 'Müzik Modu ile Kayıt Ol'
        }}
      />
    </Stack>
  );
} 