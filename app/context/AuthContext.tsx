import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { hasToken, removeToken } from '../utils/tokenStorage';

// Context değer tipi
type AuthContextType = {
  isLoggedIn: boolean;
  login: (mode?: 'astrology' | 'music') => void;
  logout: () => void;
  isLoading: boolean;
  currentMode: 'astrology' | 'music';
  switchMode: (mode: 'astrology' | 'music') => void;
};

// Context oluştur
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Koruma için useProtectedRoute hook'u
function useProtectedRoute(isLoggedIn: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn === undefined) return;

    const inAuthGroup = segments[0] === '(auth)';
    const currentRoute = segments.join('/');
    
    if (!isLoggedIn && !inAuthGroup) {
      // Kullanıcı giriş yapmamış ve auth dışındaysa giriş ekranına yönlendir
      // Varsayılan olarak normal login'e yönlendir
      router.replace('/(auth)/login');
    } else if (isLoggedIn && inAuthGroup) {
      // Kullanıcı giriş yapmış ve auth içindeyse ana ekrana yönlendir
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, segments, router]);
}

// Context Provider bileşeni
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentMode, setCurrentMode] = useState<'astrology' | 'music'>('astrology');
  const router = useRouter();

  // Oturum durumunu koruma
  useProtectedRoute(isLoggedIn);

  // Giriş yapma fonksiyonu
  const login = async (mode: 'astrology' | 'music' = 'astrology') => {
    setIsLoggedIn(true);
    setCurrentMode(mode);
    // Mode'u AsyncStorage'a kaydet
    await AsyncStorage.setItem('user_mode', mode);
  };

  // Mod değiştirme fonksiyonu
  const switchMode = async (mode: 'astrology' | 'music') => {
    setCurrentMode(mode);
    // Mode'u AsyncStorage'a kaydet
    await AsyncStorage.setItem('user_mode', mode);
  };

  // Çıkış yapma fonksiyonu
  const logout = async () => {
    await removeToken();
    await AsyncStorage.removeItem('user_mode');
    setIsLoggedIn(false);
    setCurrentMode('astrology');
    router.replace('/(auth)/login');
  };

  // Uygulama başlangıcında token ve mode kontrolü
  useEffect(() => {
    const checkToken = async () => {
      setIsLoading(true);
      try {
        const hasStoredToken = await hasToken();
        setIsLoggedIn(hasStoredToken);
        
        // Kaydedilmiş mod'u kontrol et
        const savedMode = await AsyncStorage.getItem('user_mode');
        if (savedMode === 'music' || savedMode === 'astrology') {
          setCurrentMode(savedMode);
        }
      } catch (error) {
        console.error('Token kontrolü sırasında hata:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
        isLoading,
        currentMode,
        switchMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Context'i kullanmak için hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 