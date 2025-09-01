import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { showSessionTimeoutAlert } from '../components/CustomAlert';
import { authApi } from '../services/api';
import { removeAllTokens } from '../utils/tokenStorage';
import { useProfile } from './ProfileContext';

// Context değer tipi
type AuthContextType = {
  isLoggedIn: boolean;
  login: (mode?: 'astrology' | 'music') => void;
  logout: (clearCacheCallback?: () => void) => void;
  forceLogout: (reason?: string, clearCacheCallback?: () => void) => void;
  isLoading: boolean;
  currentMode: 'astrology' | 'music';
  switchMode: (mode: 'astrology' | 'music') => void;
  isPremium: boolean;
  setPremium: (premium: boolean) => void;
  shouldShowLogoutAlert: boolean;
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
  const [isLoading, setIsLoading] = useState<boolean>(false); // Başlangıçta false
  const [currentMode, setCurrentMode] = useState<'astrology' | 'music'>('astrology');
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [shouldShowLogoutAlert, setShouldShowLogoutAlert] = useState<boolean>(false);
  const router = useRouter();
  
  // ProfileContext'ten premium durumunu al
  const { userProfile, clearCache: clearProfileCache } = useProfile();

  // Kapsamlı cache temizleme fonksiyonu
  const clearAllCaches = async () => {
    try {
      console.log('🗑️ [AUTH] Tüm cache\'ler temizleniyor...');
      
      // ProfileContext cache'ini temizle
      if (clearProfileCache) {
        clearProfileCache();
      }
      
      // AsyncStorage'dan tüm kullanıcı verilerini temizle
      const keysToRemove = [
        'user_mode',
        'user_premium', 
        'logout_alert_needed',
        'chat_cache',
        'astrology_matches_cache',
        'music_matches_cache',
        'user_zodiac_selection',
        'last_chat_refresh',
        'private_chat_cache'
      ];
      
      await Promise.all(keysToRemove.map(key => AsyncStorage.removeItem(key)));
      
      console.log('✅ [AUTH] Tüm cache\'ler temizlendi');
    } catch (error) {
      console.error('❌ [AUTH] Cache temizleme hatası:', error);
    }
  };

  // Zorunlu çıkış fonksiyonu (token geçersizse)
  const forceLogout = async (reason?: string, clearCacheCallback?: () => void) => {
    try {
      console.log('🔓 [AUTH] Force logout:', reason || 'Token geçersiz');
      
      // Kapsamlı cache temizleme
      await clearAllCaches();
      
      // Diğer context'lere logout event'i gönder
      DeviceEventEmitter.emit('user_logout', { reason: 'force_logout' });
      
      // Cache temizleme callback'ini çağır (eğer verilmişse)
      if (clearCacheCallback) {
        console.log('🗑️ [AUTH] Ek context cacheleri temizleniyor...');
        clearCacheCallback();
      }
      
      // Token'ları temizle
      await removeAllTokens();
      
      // State'i güncelle
      setIsLoggedIn(false);
      setCurrentMode('astrology');
      setIsPremium(false);
      setShouldShowLogoutAlert(true); // Alert gösterilmesi gerektiğini işaretle
      
      // Login ekranına yönlendir
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('❌ [AUTH] Force logout hatası:', error);
    }
  };

  // Oturum durumunu koruma
  useProtectedRoute(isLoggedIn);

  // Giriş yapma fonksiyonu
  const login = async (mode: 'astrology' | 'music' = 'astrology') => {
    setIsLoggedIn(true);
    setCurrentMode(mode);
    setShouldShowLogoutAlert(false); // Login yapınca alert'i sıfırla
    // Mode'u AsyncStorage'a kaydet
    await AsyncStorage.setItem('user_mode', mode);
  };

  // Mod değiştirme fonksiyonu
  const switchMode = async (mode: 'astrology' | 'music') => {
    setCurrentMode(mode);
    await AsyncStorage.setItem('user_mode', mode);
  };

  // Premium durum güncelleme
  const setPremium = async (premium: boolean) => {
    setIsPremium(premium);
    await AsyncStorage.setItem('user_premium', premium.toString());
  };
  
  // ProfileContext'ten premium durumunu güncelle
  useEffect(() => {
    if (userProfile?.isPremium !== undefined) {
      setIsPremium(userProfile.isPremium);
      console.log('👑 [AUTH] Premium durumu güncellendi:', userProfile.isPremium);
    }
  }, [userProfile?.isPremium]);

  // Normal çıkış yapma fonksiyonu
  const logout = async (clearCacheCallback?: () => void) => {
    try {
      // Backend'e logout isteği gönder
      await authApi.logout();
      console.log('🔓 [AUTH] Backend logout başarılı');
    } catch (error) {
      console.error('❌ [AUTH] Backend logout hatası:', error);
      // Hata olsa bile devam et
    }
    
    // Kapsamlı cache temizleme
    await clearAllCaches();
    
    // Diğer context'lere logout event'i gönder
    DeviceEventEmitter.emit('user_logout', { reason: 'normal_logout' });
    
    // Cache temizleme callback'ini çağır (eğer verilmişse)
    if (clearCacheCallback) {
      console.log('🗑️ [AUTH] Ek context cacheleri temizleniyor...');
      clearCacheCallback();
    }
    
    // Token'ları temizle
    await removeAllTokens();
    
    // State'i güncelle
    setIsLoggedIn(false);
    setCurrentMode('astrology');
    setIsPremium(false);
    setShouldShowLogoutAlert(false); // Normal çıkışta alert gösterme
    
    // Login ekranına yönlendir
    router.replace('/(auth)/login');
  };

  // Uygulama başlangıcında persistent login dene
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        // Logout alert flag'ini kontrol et
        const logoutAlertNeeded = await AsyncStorage.getItem('logout_alert_needed');
        if (logoutAlertNeeded === 'true') {
          console.log('🚨 [AUTH] Logout alert flag found - showing alert');
          setShouldShowLogoutAlert(true);
          await AsyncStorage.removeItem('logout_alert_needed'); // Flag'i temizle
          setIsLoggedIn(false);
          return; // Alert göster
        }
        
        // Persistent login dene (refresh token ile) - 3 saniye timeout
        console.log('🔄 [AUTH] Persistent login deneniyor...');
        
        // 3 saniye timeout ile persistent login dene
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        );
        
        try {
          const response = await Promise.race([
            authApi.persistentLogin(),
            timeoutPromise
          ]) as any;
          
          if (response.success && response.token) {
            console.log('✅ [AUTH] Persistent login başarılı');
            
            // Mode'u yükle
            const savedMode = await AsyncStorage.getItem('user_mode') as 'astrology' | 'music' | null;
            const savedPremium = await AsyncStorage.getItem('user_premium');
            
            setIsLoggedIn(true);
            setCurrentMode(savedMode || 'astrology');
            setIsPremium(savedPremium === 'true');
            
            console.log('✅ [AUTH] Kullanıcı otomatik giriş yaptı');
          } else {
            console.log('❌ [AUTH] Persistent login başarısız - token yok');
            setIsLoggedIn(false);
          }
        } catch (persistentError: any) {
          console.log('❌ [AUTH] Persistent login hatası:', persistentError.message);
          
          // Herhangi bir hata durumunda (timeout dahil) logout yap
          console.log('🗑️ [AUTH] Persistent login başarısız, token\'lar temizleniyor');
          await removeAllTokens();
          
          // Timeout dışındaki hatalar için alert göster
          if (persistentError.message !== 'Timeout') {
            setShouldShowLogoutAlert(true);
          }
          
          setIsLoggedIn(false);
        }
        
      } catch (error) {
        console.error('❌ [AUTH] App initialization hatası:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Çıkış uyarısını göstermek için ayrı useEffect
  useEffect(() => {
    if (shouldShowLogoutAlert && !isLoading) {
      console.log('🚨 [AUTH] Session timeout alert showing');
      showSessionTimeoutAlert(() => {
        setShouldShowLogoutAlert(false);
        router.replace('/(auth)/login');
      });
      setShouldShowLogoutAlert(false);
    }
  }, [shouldShowLogoutAlert, isLoading, router]);

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
        setPremium,
        forceLogout,
        shouldShowLogoutAlert
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

// Expo Router uyumluluğu için default export
export default function AuthContextPage() {
  return null;
} 