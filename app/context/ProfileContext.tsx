import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { userApi, UserProfileResponse } from '../services/api';
import { ZodiacSign } from '../types/zodiac';
import { getToken } from '../utils/tokenStorage';

// User profili için tip tanımı
export type UserProfile = {
  id?: number;
  name: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
  zodiacSign?: ZodiacSign | string; // Enum veya string
  zodiacSignEmoji?: string; // Legacy destek
  zodiacSignTurkish?: string; // Legacy destek
  profileImage: string;
  bio: string;
  isPremium?: boolean; // Premium durumu
};

// Context'in değer tipi
type ProfileContextType = {
  isProfileVisible: boolean;
  showProfile: () => void;
  hideProfile: () => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  fetchUserProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  currentUserId: string | null;
  clearCache: () => void;
  updatePremiumStatus: (isPremium: boolean) => void; // Premium durumu güncelleme
};

// Varsayılan değerler
const defaultUserProfile: UserProfile = {
  name: 'İsim Soyisim',
  username: 'kullaniciadi',
  profileImage: 'https://picsum.photos/400',
  bio: 'Kullanıcı biyografisi burada görünecek.',
};

// API yanıtını UserProfile formatına dönüştürür
const mapApiResponseToUserProfile = (data: UserProfileResponse): UserProfile => {
  // Profil fotoğrafına timestamp ekleyerek cache sorununu çöz
  const profileImageUrl = data.profileImageUrl 
    ? `${data.profileImageUrl}?t=${Date.now()}` 
    : `https://picsum.photos/400?t=${Date.now()}`;
    
  return {
    id: data.id,
    name: `${data.firstName} ${data.lastName}`,
    username: data.username,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    birthDate: data.birthDate,
    gender: data.gender,
    zodiacSign: data.zodiacSign,
    zodiacSignEmoji: data.zodiacSignEmoji,
    zodiacSignTurkish: data.zodiacSignTurkish,
    profileImage: profileImageUrl,
    bio: data.bio || 'Kullanıcı biyografisi burada görünecek.', // API'den gelen biyografi
    isPremium: data.isPremium || false, // Premium durumu
  };
};

// Context'i oluştur
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Context provider bileşeni
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const lastFetchTime = useRef<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika cache süresi

  const fetchProfile = async (force = false) => {
    const now = Date.now();
    
    // Her seferinde token'dan currentUserId'yi kontrol et
    const tokenUserId = await getCurrentUserId();
    if (tokenUserId !== currentUserId) {
      console.log('🔄 [PROFILE CONTEXT] Token değişimi tespit edildi:', {
        oldUserId: currentUserId,
        newUserId: tokenUserId
      });
      setCurrentUserId(tokenUserId);
    }
    
    // Cache kontrolü - son 5 dakika içinde güncelleme yapıldıysa ve force false ise güncelleme yapma
    if (!force && now - lastFetchTime.current < CACHE_DURATION) {
      console.log('Cache\'den profil bilgileri kullanılıyor');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Profil bilgileri API\'den getiriliyor...');
      const response = await userApi.getProfile();
      
      if (response) {
        const mappedProfile = mapApiResponseToUserProfile(response);
        
        // Token'dan ID'yi kontrol et ve set et
        if (tokenUserId && mappedProfile.id !== parseInt(tokenUserId)) {
          console.log('🔄 [PROFILE CONTEXT] Token ID ile API ID uyumsuz, token ID kullanılıyor:', {
            apiId: mappedProfile.id,
            tokenId: tokenUserId
          });
          mappedProfile.id = parseInt(tokenUserId);
        }

        setUserProfile(mappedProfile);
        lastFetchTime.current = now;
        console.log('Profil başarıyla güncellendi:', mappedProfile.name, 'ID:', mappedProfile.id);
      } else {
        setError('Profil bilgileri alınamadı');
        console.warn('API yanıtı boş');
      }
    } catch (err) {
      setError('Profil yüklenirken bir hata oluştu');
      console.error('Profil yükleme hatası:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showProfile = async () => {
    setIsProfileVisible(true); // Drawer'ı aç
    await fetchProfile(true); // Her drawer açılışında güncel veri getir
  };

  const hideProfile = () => {
    setIsProfileVisible(false);
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile(prevProfile => ({ ...prevProfile, ...profile }));
  };

  const getCurrentUserId = async (): Promise<string | null> => {
    try {
      const token = await getToken();
      if (!token) return null;
      
      // JWT token'dan kullanıcı ID'sini parse et (basit yöntem)
      // Gerçek uygulamada daha güvenli bir yöntem kullanılmalı
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Tüm olası field'ları kontrol et (log'da userId: 24 görüldü)
      const userId = payload.userId || payload.sub || payload.id || payload.user_id || null;
      
      return userId ? String(userId) : null;
    } catch (error) {
      console.error('Token parse hatası:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    await fetchProfile(true); // Force ile güncelleme
  };

  // Cache temizleme fonksiyonu
  const clearCache = () => {
    console.log('🗑️ [PROFILE CONTEXT] Cache temizleniyor...');
    
    // Profil bilgilerini varsayılana döndür
    setUserProfile(defaultUserProfile);
    
    // CurrentUserId'yi temizle
    setCurrentUserId(null);
    
    // Hata durumunu temizle
    setError(null);
    
    // Loading durumunu sıfırla
    setIsLoading(false);
    
    // Profile drawer'ı kapat
    setIsProfileVisible(false);
    
    // Cache zamanını sıfırla
    lastFetchTime.current = 0;
    
    console.log('✅ [PROFILE CONTEXT] Cache temizlendi');
  };

  // Premium durumu güncelleme fonksiyonu
  const updatePremiumStatus = (isPremium: boolean) => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      isPremium: isPremium
    }));
    console.log('👑 [PROFILE CONTEXT] Premium durumu güncellendi:', isPremium);
  };

  useEffect(() => {
    // Sadece ilk yüklemede kullanıcı bilgilerini kontrol et
    const initializeUser = async () => {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
      
      if (userId) {
        // İlk kez profil bilgilerini getir
        await fetchProfile();
      } else {
        // Logout durumu
        setUserProfile(defaultUserProfile);
        setError(null);
      }
    };

    initializeUser();
  }, []); // Sadece component mount olduğunda çalışır

  return (
    <ProfileContext.Provider
      value={{
        isProfileVisible,
        showProfile,
        hideProfile,
        userProfile,
        updateUserProfile,
        fetchUserProfile: fetchProfile,
        refreshProfile: refreshProfile,
        isLoading,
        error,
        currentUserId,
        clearCache,
        updatePremiumStatus,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

// Context'i kullanmak için hook
export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

// ProfileDrawer component'ini yeniden export et
export { default as ProfileDrawer } from '../components/profile/ProfileDrawer';

