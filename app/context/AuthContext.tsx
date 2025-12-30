import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, DeviceEventEmitter } from 'react-native';
import { showSessionTimeoutAlert } from '../components/CustomAlert';
import { authApi, checkAndRefreshTokenIfNeeded, startAutoTokenRefresh, stopAutoTokenRefresh, swipeCleanupApi } from '../services/api';
import { removeAllTokens } from '../utils/tokenStorage';
import { useProfile } from './ProfileContext';

// Context değer tipi
type AuthContextType = {
  isLoggedIn: boolean | undefined; // undefined = henüz kontrol edilmedi
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
function useProtectedRoute(isLoggedIn: boolean | undefined, isLoading: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Henüz yükleniyor veya kontrol edilmediyse hiçbir şey yapma
    if (isLoading || isLoggedIn === undefined) return;

    const inAuthGroup = segments[0] === '(auth)';
    const currentRoute = segments.join('/');
    
    console.log('🛡️ [AUTH] Route koruması:', {
      isLoggedIn,
      isLoading,
      inAuthGroup,
      currentRoute,
      segments: segments.join('/')
    });
    
    if (!isLoggedIn && !inAuthGroup) {
      // Kullanıcı giriş yapmamış ve auth dışındaysa giriş ekranına yönlendir
      console.log('🔄 [AUTH] Kullanıcı giriş yapmamış, login ekranına yönlendiriliyor');
      router.replace('/(auth)/login');
    } else if (isLoggedIn && inAuthGroup) {
      // Kullanıcı giriş yapmış ve auth içindeyse ana ekrana yönlendir
      console.log('🔄 [AUTH] Kullanıcı giriş yapmış, ana ekrana yönlendiriliyor');
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, isLoading, segments, router]);
}

// Context Provider bileşeni
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined); // undefined = henüz kontrol edilmedi
  const [isLoading, setIsLoading] = useState<boolean>(true); // Başlangıçta true - persistent login kontrol ediliyor
  const [currentMode, setCurrentMode] = useState<'astrology' | 'music'>('astrology');
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [shouldShowLogoutAlert, setShouldShowLogoutAlert] = useState<boolean>(false);
  const router = useRouter();
  
  // AppState tracking için ref
  const appState = useRef<AppStateStatus>(AppState.currentState);
  
  // ProfileContext'ten premium durumunu al
  const { userProfile, clearCache: clearProfileCache } = useProfile();
  
  // App foreground'a geldiğinde token kontrolü
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // App arka plandan ön plana geldiğinde
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 [AUTH] App foreground\'a geldi, token kontrolü yapılıyor...');
        
        // Eğer kullanıcı giriş yapmışsa token kontrolü yap
        if (isLoggedIn) {
          try {
            await checkAndRefreshTokenIfNeeded();
            console.log('✅ [AUTH] Foreground token kontrolü tamamlandı');
          } catch (error) {
            console.error('❌ [AUTH] Foreground token kontrolü hatası:', error);
          }
        }
      }
      
      appState.current = nextAppState;
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [isLoggedIn]);

  // Kapsamlı cache temizleme fonksiyonu
  const clearAllCaches = async (isNormalLogout: boolean = false) => {
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
      
      // Normal logout ise özel flag set et (oturum sonlandı uyarısı gösterme)
      if (isNormalLogout) {
        await AsyncStorage.setItem('normal_logout', 'true');
        console.log('🚦 [AUTH] Normal logout flag set edildi');
      }
      
      console.log('✅ [AUTH] Tüm cache\'ler temizlendi');
    } catch (error) {
      console.error('❌ [AUTH] Cache temizleme hatası:', error);
    }
  };

  // Swipe cleanup işlemi için yardımcı fonksiyon
  const performSwipeCleanup = async (context: string = 'login') => {
    try {
      console.log(`🧹 [AUTH] ${context} sonrası swipe kayıtları temizleniyor (2 günlük)...`);
      
      // Önce kaç kayıt silineceğini kontrol et
      const stats = await swipeCleanupApi.getCleanupStats(2);
      console.log(`📊 [AUTH] ${stats.oldSwipesCount} eski kayıt bulundu`);
      
      if (stats.oldSwipesCount > 0) {
        // Cleanup işlemini gerçekleştir
        const cleanupResult = await swipeCleanupApi.cleanupSwipes();
        console.log(`✅ [AUTH] Swipe cleanup başarılı (${context}):`, {
          deletedCount: cleanupResult.deletedCount,
          message: cleanupResult.message
        });
        
        // Başarılı cleanup için ek log
        if (cleanupResult.deletedCount > 0) {
          console.log(`🎉 [AUTH] ${cleanupResult.deletedCount} eski swipe kaydı temizlendi`);
        }
      } else {
        console.log(`✅ [AUTH] Temizlenecek eski kayıt bulunamadı (${context})`);
      }
    } catch (cleanupError: any) {
      console.error(`❌ [AUTH] Swipe cleanup hatası (${context}):`, {
        message: cleanupError.message,
        status: cleanupError.response?.status,
        data: cleanupError.response?.data
      });
      
      // Cleanup hatası login işlemini engellemez, sadece log'la
      // İsteğe bağlı: Kullanıcıya bilgi verebilirsiniz
      // console.warn('⚠️ [AUTH] Eski kayıtlar temizlenemedi, ancak giriş devam ediyor');
    }
  };

  // Zorunlu çıkış fonksiyonu (token geçersizse)
  const forceLogout = async (reason?: string, clearCacheCallback?: () => void) => {
    try {
      console.log('🔓 [AUTH] Force logout:', reason || 'Token geçersiz');
      
      // Otomatik token yenilemeyi durdur
      stopAutoTokenRefresh();
      console.log('🛑 [AUTH] Force logout - otomatik token yenileme durduruldu');
      
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
  useProtectedRoute(isLoggedIn, isLoading);

  // Giriş yapma fonksiyonu
  const login = async (mode: 'astrology' | 'music' = 'astrology') => {
    setIsLoggedIn(true);
    setCurrentMode(mode);
    setShouldShowLogoutAlert(false); // Login yapınca alert'i sıfırla
    // Mode'u AsyncStorage'a kaydet
    await AsyncStorage.setItem('user_mode', mode);
    
    // Otomatik token yenilemeyi başlat
    startAutoTokenRefresh();
    console.log('🔄 [AUTH] Login sonrası otomatik token yenileme başlatıldı');
    
    // Login sonrası swipe kayıtlarını temizle (2 günlük)
    await performSwipeCleanup('login');
    
    // Login sonrası profil bilgilerini çek (burç bilgisi için)
    try {
      console.log('🔄 [AUTH] Login sonrası profil bilgileri çekiliyor...');
      // ProfileContext'e event gönder
      DeviceEventEmitter.emit('fetch_profile_after_login');
      console.log('📡 [AUTH] Profil çekme eventi gönderildi');
    } catch (error) {
      console.error('❌ [AUTH] Profil bilgileri çekme hatası:', error);
      // Hata olsa bile login işlemini engelleme
    }
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
    
    // Otomatik token yenilemeyi durdur
    stopAutoTokenRefresh();
    console.log('🛑 [AUTH] Otomatik token yenileme durduruldu');
    
    // Kapsamlı cache temizleme (normal logout olduğunu işaretle)
    await clearAllCaches(true);
    
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
        
        // Persistent login dene (refresh token ile) - 10 saniye timeout
        console.log('🔄 [AUTH] Persistent login deneniyor...');
        
        // 10 saniye timeout ile persistent login dene
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        );
        
        try {
          const response = await Promise.race([
            authApi.persistentLogin(),
            timeoutPromise
          ]) as any;
          
          if (response.success && response.token) {
            console.log('✅ [AUTH] Persistent login başarılı');
            
            // Logout alert flag'ini temizle (başarılı giriş varsa)
            await AsyncStorage.removeItem('logout_alert_needed');
            console.log('🧹 [AUTH] Logout alert flag temizlendi');
            
            // Mode'u yükle
            const savedMode = await AsyncStorage.getItem('user_mode') as 'astrology' | 'music' | null;
            const savedPremium = await AsyncStorage.getItem('user_premium');
            
            setIsLoggedIn(true);
            setCurrentMode(savedMode || 'astrology');
            setIsPremium(savedPremium === 'true');
            setShouldShowLogoutAlert(false); // Alert'i sıfırla
            
            // Otomatik token yenilemeyi başlat
            startAutoTokenRefresh();
            console.log('🔄 [AUTH] Otomatik token yenileme başlatıldı');
            
            // Persistent login sonrası swipe kayıtlarını temizle (2 günlük)
            await performSwipeCleanup('persistent login');
            
            console.log('✅ [AUTH] Kullanıcı otomatik giriş yaptı');
          } else {
            console.log('❌ [AUTH] Persistent login başarısız - token yok');
            setIsLoggedIn(false);
            
            // Normal logout yapıldı mı kontrol et
            const normalLogout = await AsyncStorage.getItem('normal_logout');
            if (normalLogout === 'true') {
              console.log('🚦 [AUTH] Normal logout tespit edildi - alert gösterilmeyecek');
              await AsyncStorage.removeItem('normal_logout');
              // Alert gösterme
            } else {
              // Logout alert flag'ini kontrol et
              const logoutAlertNeeded = await AsyncStorage.getItem('logout_alert_needed');
              if (logoutAlertNeeded === 'true') {
                console.log('🚨 [AUTH] Logout alert flag found - showing alert');
                setShouldShowLogoutAlert(true);
                await AsyncStorage.removeItem('logout_alert_needed'); // Flag'i temizle
              }
            }
          }
        } catch (persistentError: any) {
          console.log('❌ [AUTH] Persistent login hatası:', persistentError.message);
          
          // Timeout durumunda token'ları temizleme
          if (persistentError.message === 'Timeout') {
            console.log('⏰ [AUTH] Persistent login timeout - token\'lar temizleniyor');
            await removeAllTokens();
            setIsLoggedIn(false);
          } else {
            console.log('❌ [AUTH] Persistent login hatası - token\'lar korunuyor');
            // Hata durumunda token'ları silme, sadece login false yap
            setIsLoggedIn(false);
            
            // Normal logout yapıldı mı kontrol et
            const normalLogout = await AsyncStorage.getItem('normal_logout');
            if (normalLogout === 'true') {
              console.log('🚦 [AUTH] Normal logout tespit edildi - alert gösterilmeyecek');
              await AsyncStorage.removeItem('normal_logout');
              // Alert gösterme
            } else {
              // Logout alert flag'ini kontrol et ve göster
              const logoutAlertNeeded = await AsyncStorage.getItem('logout_alert_needed');
              if (logoutAlertNeeded === 'true') {
                console.log('🚨 [AUTH] Logout alert flag found - showing alert');
                setShouldShowLogoutAlert(true);
                await AsyncStorage.removeItem('logout_alert_needed'); // Flag'i temizle
              }
            }
          }
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