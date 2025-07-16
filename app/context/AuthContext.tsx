import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authApi, premiumApi } from '../services/api';
import { hasRefreshToken, hasToken, removeAllTokens } from '../utils/tokenStorage';

// Context değer tipi
type AuthContextType = {
  isLoggedIn: boolean;
  login: (mode?: 'astrology' | 'music') => void;
  logout: () => void;
  isLoading: boolean;
  currentMode: 'astrology' | 'music';
  switchMode: (mode: 'astrology' | 'music') => void;
  isPremium: boolean;
  setPremium: (premium: boolean) => void;
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
  const [isPremium, setIsPremium] = useState<boolean>(false);
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
    try {
      // Backend'e logout isteği gönder
      await authApi.logout();
      console.log('🔓 [AUTH] Backend logout başarılı');
    } catch (error) {
      console.error('❌ [AUTH] Backend logout hatası:', error);
      // Hata olsa bile devam et
    }
    
    // Local storage'ı temizle
    await removeAllTokens();
    await AsyncStorage.removeItem('user_mode');
    await AsyncStorage.removeItem('user_premium');
    
    // State'i güncelle
    setIsLoggedIn(false);
    setCurrentMode('astrology');
    setIsPremium(false);
    
    // Login ekranına yönlendir
    router.replace('/(auth)/login');
  };

  // Uygulama başlangıcında token ve mode kontrolü
  useEffect(() => {
    const checkToken = async () => {
      setIsLoading(true);
      try {
        const hasStoredToken = await hasToken();
        const hasStoredRefreshToken = await hasRefreshToken();
        
        // Access token veya refresh token varsa oturum açık sayılır
        const isUserLoggedIn = hasStoredToken || hasStoredRefreshToken;
        setIsLoggedIn(isUserLoggedIn);
        
        console.log('🔐 [AUTH] Token kontrol:', {
          hasAccessToken: hasStoredToken,
          hasRefreshToken: hasStoredRefreshToken,
          isLoggedIn: isUserLoggedIn
        });
        
        // Kaydedilmiş mod'u kontrol et
        const savedMode = await AsyncStorage.getItem('user_mode');
        if (savedMode === 'music' || savedMode === 'astrology') {
          setCurrentMode(savedMode);
        }

        // Premium durumunu kontrol et
        const savedPremium = await AsyncStorage.getItem('user_premium');
        if (savedPremium === 'true') {
          setIsPremium(true);
        }

        // Eğer kullanıcı giriş yapmışsa, sunucudan premium durumunu da kontrol et
        if (isUserLoggedIn) {
          try {
            const premiumStatus = await premiumApi.getFeatures();
            setIsPremium(premiumStatus.isPremium);
            // Güncel durumu storage'a kaydet
            await AsyncStorage.setItem('user_premium', premiumStatus.isPremium.toString());
          } catch (error) {
            console.error('Premium durum kontrolü sırasında hata:', error);
            // API hatası varsa, local storage'daki değeri kullan
          }
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

  const setPremium = async (premium: boolean) => {
    setIsPremium(premium);
    // Premium durumunu AsyncStorage'a kaydet
    await AsyncStorage.setItem('user_premium', premium.toString());
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
        isLoading,
        currentMode,
        switchMode,
        isPremium,
        setPremium
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