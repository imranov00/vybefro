import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { userApi, UserProfileResponse } from '../services/api';
import { ZodiacSign } from '../types/zodiac';
import { getToken, hasToken } from '../utils/tokenStorage';

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
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Cache süresi (5 dakika)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Profil drawer'ını göster
  const showProfile = () => {
    setIsProfileVisible(true);
    // Drawer açıldığında profili kontrol et (cache'e göre)
    checkAndFetchProfile();
  };

  // Profil drawer'ını gizle
  const hideProfile = () => {
    setIsProfileVisible(false);
  };

  // Kullanıcı profilini güncelle
  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile(prevProfile => ({ ...prevProfile, ...profile }));
  };

  // Mevcut kullanıcı ID'sini kontrol et
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

  // Cache kontrolü ile profil getir
  const checkAndFetchProfile = async (force = false) => {
    const now = Date.now();
    const cacheValid = (now - lastFetchTime) < CACHE_DURATION;
    
    if (!force && cacheValid && userProfile.id) {
      console.log('Profil cache\'den alındı');
      return;
    }
    
    await fetchUserProfile();
  };

  // Kullanıcı profilini API'den çek
  const fetchUserProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Token kontrolü
      const isLoggedIn = await hasToken();
      
      if (!isLoggedIn) {
        setError('Oturum açık değil');
        setUserProfile(defaultUserProfile);
        setCurrentUserId(null);
        setIsLoading(false);
        return;
      }
      
      console.log('Profil bilgileri getiriliyor...');
      // Önce profil bilgilerini çek
      const profileData = await userApi.getProfile();
      console.log('API profil yanıtı:', JSON.stringify(profileData, null, 2));
      const mappedProfile = mapApiResponseToUserProfile(profileData);
      
      // Sonra kullanıcı fotoğraflarını çek
      try {
        console.log('Kullanıcı fotoğrafları getiriliyor...');
        const userPhotos = await userApi.getPhotos();
        console.log('API fotoğraf yanıtı:', JSON.stringify(userPhotos, null, 2));
        
        // Profil fotoğrafı varsa, profil bilgisini güncelle
        if (userPhotos && userPhotos.length > 0) {
          console.log('Toplam fotoğraf sayısı:', userPhotos.length);
          
          const profilePhoto = userPhotos.find(photo => photo.isProfilePhoto);
          
          if (profilePhoto) {
            console.log('Profil fotoğrafı bulundu:', profilePhoto.url);
            mappedProfile.profileImage = profilePhoto.url;
          } else if (userPhotos.length > 0) {
            // Profil fotoğrafı olarak işaretlenmiş bir fotoğraf yoksa, ilk fotoğrafı kullan
            console.log('Profil fotoğrafı bulunamadı, ilk fotoğraf kullanılıyor:', userPhotos[0].url);
            mappedProfile.profileImage = userPhotos[0].url;
          }
        } else {
          console.log('Kullanıcı fotoğrafı bulunamadı, varsayılan profil resmi kullanılıyor');
        }
      } catch (photoError: any) {
        console.error('Fotoğrafları getirme hatası:', photoError);
        if (photoError.response) {
          console.error('API fotoğraf hata yanıtı:', photoError.response.data);
          console.error('API fotoğraf hata durumu:', photoError.response.status);
        }
        // Fotoğraf getirme hatası olsa bile profil bilgilerini göster
      }
      
      console.log('Güncellenmiş profil bilgisi:', JSON.stringify(mappedProfile, null, 2));
      // Güncellenen profil bilgisini state'e kaydet
      setUserProfile(mappedProfile);
      setLastFetchTime(Date.now());
      
      // Kullanıcı ID'sini güncelle
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
      
    } catch (error: any) {
      console.error('Profil çekme hatası:', error);
      if (error.response) {
        console.error('API profil hata yanıtı:', error.response.data);
        console.error('API profil hata durumu:', error.response.status);
      }
      setError(error.message || 'Profil yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  // Zorla profil yenile (cache'i bypass et)
  const refreshProfile = async () => {
    setLastFetchTime(0); // Cache'i invalidate et
    await fetchUserProfile();
  };

  // Kullanıcı değişikliğini kontrol et
  useEffect(() => {
    const checkUserChange = async () => {
      const newUserId = await getCurrentUserId();
      
      if (newUserId !== currentUserId) {
        console.log('Kullanıcı değişti:', { eski: currentUserId, yeni: newUserId });
        setCurrentUserId(newUserId);
        
        if (newUserId) {
          // Yeni kullanıcı için profil getir
          await fetchUserProfile();
        } else {
          // Logout durumu
          setUserProfile(defaultUserProfile);
          setError(null);
        }
      }
    };

    // Sadece giriş durumu kontrol edilmesi gereken durumlarda çalıştır
    let interval: NodeJS.Timeout | null = null;
    
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
        fetchUserProfile,
        refreshProfile,
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

