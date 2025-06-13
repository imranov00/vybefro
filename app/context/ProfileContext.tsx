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
    profileImage: data.profileImageUrl || 'https://picsum.photos/400', // Default profil resmi
    bio: data.bio || 'Kullanıcı biyografisi burada görünecek.', // API'den gelen biyografi
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
    
    // Cache kontrolü - son 5 dakika içinde güncelleme yapıldıysa ve force false ise güncelleme yapma
    if (!force && now - lastFetchTime.current < CACHE_DURATION) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userApi.getProfile();
      
      if (response) {
        const mappedProfile = mapApiResponseToUserProfile(response);
        setUserProfile(mappedProfile);
        lastFetchTime.current = now;
      } else {
        setError('Profil bilgileri alınamadı');
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
    await fetchProfile(false); // Cache kontrolü ile güncelleme
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
      return payload.sub || payload.userId || payload.id || null;
    } catch (error) {
      console.error('Token parse hatası:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    await fetchProfile(true); // Force ile güncelleme
  };

  useEffect(() => {
    const checkUserChange = async () => {
      const newUserId = await getCurrentUserId();
      
      if (newUserId !== currentUserId) {
        console.log('Kullanıcı değişti:', { eski: currentUserId, yeni: newUserId });
        setCurrentUserId(newUserId);
        
        if (newUserId) {
          // Yeni kullanıcı için profil getir
          await fetchProfile();
        } else {
          // Logout durumu
          setUserProfile(defaultUserProfile);
          setError(null);
        }
      }
    };

    let interval: ReturnType<typeof setInterval> | null = null;
    
    const startChecking = async () => {
      await checkUserChange(); // İlk kontrol
      
      // Her 3 saniyede bir kontrol et (performans için)
      interval = setInterval(checkUserChange, 3000);
    };

    startChecking();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

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

