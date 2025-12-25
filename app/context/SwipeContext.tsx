import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { SwipeLimitInfo as ApiSwipeLimitInfo, swipeApi } from '../services/api';

// Types
export interface DiscoverUserDTO {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate: string;
  age: number;
  gender: string;
  bio: string | null;
  zodiacSign: string;
  zodiacSignDisplay: string;
  compatibilityScore: number;
  compatibilityMessage: string;
  profileImageUrl: string | null;
  photos: Array<{
    id: number;
    imageUrl: string;
    isProfilePhoto: boolean;
    uploadedAt: string;
    displayOrder: number;
  }>;
  photoCount: number;
  isPremium: boolean;
  lastActiveTime: string | null;
  activityStatus: string;
  location: string | null;
  activities: string[];
  isVerified: boolean;
  isNewUser: boolean;
  hasLikedCurrentUser: boolean;
  profileCompleteness: string;
}

export interface SwipeLimitInfo extends ApiSwipeLimitInfo {
  isLimitReached: boolean;
  limitMessage: string;
}

interface SwipeContextType {
  // State
  currentUser: DiscoverUserDTO | null;
  userBatch: DiscoverUserDTO[];
  seenUsers: Set<number>;
  hasMoreUsers: boolean;
  isLoading: boolean;
  isSwipeInProgress: boolean;
  swipeLimitInfo: SwipeLimitInfo | null;
  
  // Actions
  loadUserBatch: (refresh: boolean) => Promise<void>;
  performSwipe: (action: 'LIKE' | 'DISLIKE') => Promise<{ isMatch: boolean; matchedUser?: DiscoverUserDTO }>;
  showNextUser: () => void;
  resetSwipeSession: () => void;
  fetchSwipeLimitInfo: () => Promise<void>;
}

const SwipeContext = createContext<SwipeContextType | undefined>(undefined);

export const useSwipe = () => {
  const context = useContext(SwipeContext);
  if (!context) {
    throw new Error('useSwipe must be used within SwipeProvider');
  }
  return context;
};

interface SwipeProviderProps {
  children: React.ReactNode;
}

export const SwipeProvider: React.FC<SwipeProviderProps> = ({ children }) => {
  // State
  const [currentUser, setCurrentUser] = useState<DiscoverUserDTO | null>(null);
  const [userBatch, setUserBatch] = useState<DiscoverUserDTO[]>([]);
  const [seenUsers, setSeenUsers] = useState<Set<number>>(new Set());
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwipeInProgress, setIsSwipeInProgress] = useState(false);
  const [swipeLimitInfo, setSwipeLimitInfo] = useState<SwipeLimitInfo | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);

  // Refs
  const batchIndexRef = useRef(0);
  const preloadThreshold = 3; // Son 3 kullanıcıda preload başlat

  // Swipe limit bilgilerini getir
  const fetchSwipeLimitInfo = useCallback(async () => {
    try {
      const data = await swipeApi.getSwipeLimitInfo();
      setSwipeLimitInfo({
        ...data,
        isLimitReached: (data.remainingSwipes || 0) <= 0 || data.isLimitReached || false,
        limitMessage: data.limitMessage || ((data.remainingSwipes || 0) <= 0 
          ? 'Günlük swipe limitiniz doldu!' 
          : `${data.remainingSwipes} swipe hakkınız kaldı`)
      });
    } catch (error: any) {
      console.error('❌ [SWIPE] Swipe limit bilgisi alınamadı:', error);
    }
  }, []);

  // Kullanıcı batch'ini yükle
  const loadUserBatch = useCallback(async (refresh: boolean = false) => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      console.log(`🔄 [SWIPE] Batch yükleniyor (refresh: ${refresh})...`);

      const data = await swipeApi.getDiscoverUsers(refresh, false, 1, 15);

      if (data.success && data.users && data.users.length > 0) {
        // Daha önce görülmemiş kullanıcıları filtrele
        const filteredUsers = data.users.filter(user => !seenUsers.has(user.id));

        if (filteredUsers.length > 0) {
          const batchUsers: DiscoverUserDTO[] = filteredUsers.map(user => ({
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            birthDate: user.birthDate,
            age: user.age,
            gender: user.gender,
            bio: user.bio,
            zodiacSign: user.zodiacSign,
            zodiacSignDisplay: user.zodiacSign,
            compatibilityScore: user.compatibilityScore || 0,
            compatibilityMessage: user.compatibilityMessage || 'Uyumluluk hesaplanıyor...',
            profileImageUrl: user.profileImageUrl,
            photos: user.photos.map(photo => ({
              id: photo.id,
              imageUrl: photo.imageUrl,
              isProfilePhoto: photo.isProfilePhoto,
              uploadedAt: new Date().toISOString(),
              displayOrder: photo.displayOrder
            })),
            photoCount: user.photoCount,
            isPremium: user.isPremium,
            lastActiveTime: user.lastActiveTime,
            activityStatus: user.activityStatus || 'offline',
            location: user.location,
            activities: [],
            isVerified: user.isVerified,
            isNewUser: false,
            hasLikedCurrentUser: false,
            profileCompleteness: '100%'
          }));

          setUserBatch(batchUsers);
          setCurrentUser(batchUsers[0]);
          batchIndexRef.current = 0;
          setHasMoreUsers(data.hasMore || false);

          console.log(`✅ [SWIPE] ${batchUsers.length} kullanıcı yüklendi`);
        } else {
          setUserBatch([]);
          setHasMoreUsers(false);
        }
      } else {
        setUserBatch([]);
        setHasMoreUsers(false);
      }
    } catch (error: any) {
      console.error('❌ [SWIPE] Batch yükleme hatası:', error);
      
      if (error.isSwipeLimitError) {
        setSwipeLimitInfo(error.swipeLimitInfo);
      }
    } finally {
      setIsLoading(false);
    }
  }, [seenUsers, isLoading]);

  // Preload: Son 3 kullanıcıda yeni batch'i önceden yükle
  const preloadNextBatch = useCallback(async () => {
    if (isPreloading || !hasMoreUsers) return;

    try {
      setIsPreloading(true);
      console.log('🔄 [SWIPE] Preload başlıyor...');

      const data = await swipeApi.getDiscoverUsers(false, false, 1, 15);

      if (data.success && data.users && data.users.length > 0) {
        const filteredUsers = data.users.filter(user => !seenUsers.has(user.id));

        if (filteredUsers.length > 0) {
          const batchUsers: DiscoverUserDTO[] = filteredUsers.map(user => ({
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            birthDate: user.birthDate,
            age: user.age,
            gender: user.gender,
            bio: user.bio,
            zodiacSign: user.zodiacSign,
            zodiacSignDisplay: user.zodiacSign,
            compatibilityScore: user.compatibilityScore || 0,
            compatibilityMessage: user.compatibilityMessage || 'Uyumluluk hesaplanıyor...',
            profileImageUrl: user.profileImageUrl,
            photos: user.photos.map(photo => ({
              id: photo.id,
              imageUrl: photo.imageUrl,
              isProfilePhoto: photo.isProfilePhoto,
              uploadedAt: new Date().toISOString(),
              displayOrder: photo.displayOrder
            })),
            photoCount: user.photoCount,
            isPremium: user.isPremium,
            lastActiveTime: user.lastActiveTime,
            activityStatus: user.activityStatus || 'offline',
            location: user.location,
            activities: [],
            isVerified: user.isVerified,
            isNewUser: false,
            hasLikedCurrentUser: false,
            profileCompleteness: '100%'
          }));

          // Mevcut batch'e ekle
          setUserBatch(prev => [...prev, ...batchUsers]);
          setHasMoreUsers(data.hasMore || false);

          console.log(`✅ [SWIPE] ${batchUsers.length} kullanıcı preload edildi`);
        }
      }
    } catch (error: any) {
      console.error('❌ [SWIPE] Preload hatası:', error);
    } finally {
      setIsPreloading(false);
    }
  }, [seenUsers, hasMoreUsers, isPreloading]);

  // Sonraki kullanıcıya geç
  const showNextUser = useCallback(() => {
    const nextIndex = batchIndexRef.current + 1;

    if (nextIndex < userBatch.length) {
      setCurrentUser(userBatch[nextIndex]);
      batchIndexRef.current = nextIndex;

      // Preload threshold'a ulaştık mı?
      const remainingUsers = userBatch.length - nextIndex;
      if (remainingUsers <= preloadThreshold && hasMoreUsers && !isPreloading) {
        console.log(`🔄 [SWIPE] ${remainingUsers} kullanıcı kaldı, preload başlatılıyor...`);
        preloadNextBatch();
      }
    } else {
      // Batch bitti, yeni batch yükle
      console.log('📭 [SWIPE] Batch tükendi, yeni batch yükleniyor...');
      setCurrentUser(null);
      loadUserBatch(false);
    }
  }, [userBatch, hasMoreUsers, isPreloading, preloadNextBatch, loadUserBatch]);

  // Swipe işlemi
  const performSwipe = useCallback(async (action: 'LIKE' | 'DISLIKE'): Promise<{ isMatch: boolean; matchedUser?: DiscoverUserDTO }> => {
    if (!currentUser || isSwipeInProgress) {
      return { isMatch: false };
    }

    try {
      setIsSwipeInProgress(true);

      const swipeData = {
        toUserId: currentUser.id,
        action: action
      };

      const data = await swipeApi.swipe(swipeData);

      if (data.success) {
        // Kullanıcıyı görüldü olarak işaretle
        setSeenUsers(prev => new Set([...prev, currentUser.id]));

        // Swipe limit bilgilerini güncelle
        if (data.swipeLimitInfo) {
          setSwipeLimitInfo({
            ...data.swipeLimitInfo,
            isLimitReached: (data.swipeLimitInfo.remainingSwipes || 0) <= 0,
            limitMessage: (data.swipeLimitInfo.remainingSwipes || 0) <= 0 
              ? 'Günlük swipe limitiniz doldu!' 
              : `${data.swipeLimitInfo.remainingSwipes} swipe hakkınız kaldı`
          });
        }

        if (data.isMatch) {
          return { isMatch: true, matchedUser: currentUser };
        } else {
          showNextUser();
          return { isMatch: false };
        }
      }

      return { isMatch: false };
    } catch (error: any) {
      console.error('❌ [SWIPE] Swipe hatası:', error);

      if (error.isSwipeLimitError) {
        setSwipeLimitInfo(error.swipeLimitInfo);
        throw error;
      }

      // Duplicate swipe hatası - sessizce geç
      if (error.message && error.message.includes('zaten bir swipe kaydınız var')) {
        console.log('⚠️ [SWIPE] Duplicate swipe, sıradakine geçiliyor...');
        setSeenUsers(prev => new Set([...prev, currentUser.id]));
        showNextUser();
        return { isMatch: false };
      }

      Alert.alert('Hata', error.message || 'Swipe işlemi sırasında bir hata oluştu');
      throw error;
    } finally {
      setIsSwipeInProgress(false);
    }
  }, [currentUser, isSwipeInProgress, showNextUser]);

  // Swipe session'ını sıfırla
  const resetSwipeSession = useCallback(() => {
    setSeenUsers(new Set());
    setUserBatch([]);
    setCurrentUser(null);
    batchIndexRef.current = 0;
    setHasMoreUsers(true);
    loadUserBatch(false);
  }, [loadUserBatch]);

  // İlk yüklemede batch'i getir
  useEffect(() => {
    if (userBatch.length === 0 && !isLoading) {
      loadUserBatch(false);
    }
    fetchSwipeLimitInfo();
  }, []);

  const value: SwipeContextType = {
    currentUser,
    userBatch,
    seenUsers,
    hasMoreUsers,
    isLoading,
    isSwipeInProgress,
    swipeLimitInfo,
    loadUserBatch,
    performSwipe,
    showNextUser,
    resetSwipeSession,
    fetchSwipeLimitInfo
  };

  return (
    <SwipeContext.Provider value={value}>
      {children}
    </SwipeContext.Provider>
  );
};
