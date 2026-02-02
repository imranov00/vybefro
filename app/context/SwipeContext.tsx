import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import SwipeLimitModal from '../components/SwipeLimitModal';
import { SwipeLimitInfo as ApiSwipeLimitInfo, swipeApi } from '../services/api';
import { useAuth } from './AuthContext';
import { useLoading } from './LoadingContext';

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
  // Auth context'ten isLoggedIn durumunu al
  const { isLoggedIn } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  
  // State
  const [currentUser, setCurrentUser] = useState<DiscoverUserDTO | null>(null);
  const [userBatch, setUserBatch] = useState<DiscoverUserDTO[]>([]);
  const [seenUsers, setSeenUsers] = useState<Set<number>>(new Set());
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwipeInProgress, setIsSwipeInProgress] = useState(false);
  const [swipeLimitInfo, setSwipeLimitInfo] = useState<SwipeLimitInfo | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);
  
  // Modal state
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalMessage, setLimitModalMessage] = useState('');

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
    
    // Eğer daha fazla kullanıcı yoksa ve refresh değilse, yükleme yapma
    // Ama refresh=true ise her zaman dene (yeni kullanıcılar için)
    if (!hasMoreUsers && !refresh) {
      console.log('ℹ️ [SWIPE] Daha fazla kullanıcı yok, yükleme atlandı');
      return;
    }

    try {
      showLoading('Eşleşmeler yükleniyor...');
      console.log(`🔄 [SWIPE] Batch yükleniyor (refresh: ${refresh})...`);

      // Refresh ise hasMoreUsers'ı sıfırla (yeni kullanıcılar gelebilir)
      if (refresh) {
        setHasMoreUsers(true);
      }

      const data = await swipeApi.getDiscoverUsers(refresh, false, 1, 15);

      if (data.success && data.users && data.users.length > 0) {
        // Refresh modunda seenUsers'ı temizle
        if (refresh) {
          setSeenUsers(new Set());
        }
        
        // Daha önce görülmemiş kullanıcıları filtrele (refresh değilse)
        const filteredUsers = refresh ? data.users : data.users.filter(user => !seenUsers.has(user.id));

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
          setHasMoreUsers(data.hasMore !== false); // undefined veya true ise true
          hideLoading();

          console.log(`✅ [SWIPE] ${batchUsers.length} kullanıcı yüklendi`);
        } else {
          // Filtrelenmiş kullanıcı yok ama belki daha sonra gelir
          setUserBatch([]);
          setCurrentUser(null);
          // hasMoreUsers'ı backend'den gelen değere göre ayarla
          setHasMoreUsers(data.hasMore !== false);
          hideLoading();
          console.log('⚠️ [SWIPE] Filtrelenmiş kullanıcı yok');
        }
      } else {
        // Hiç kullanıcı gelmedi - yeni kullanıcılar için true tut
        setUserBatch([]);
        setCurrentUser(null);
        hideLoading();
        // İlk yüklemede bile kullanıcı yoksa, yine de true tut (yeni kullanıcılar eklenebilir)
        setHasMoreUsers(true);
        console.log('⚠️ [SWIPE] Henüz kullanıcı yok, daha sonra tekrar denenebilir');
      }
    } catch (error: any) {
      console.error('❌ [SWIPE] Batch yükleme hatası:', error);
      
      if (error.isSwipeLimitError) {
        setSwipeLimitInfo(error.swipeLimitInfo);
      }
      
      // Hata durumunda da hasMoreUsers'ı true tut (tekrar deneme imkanı)
      setHasMoreUsers(true);
    } finally {
      setIsLoading(false);
    }
  }, [seenUsers, isLoading, hasMoreUsers]);

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
      // Batch bitti
      if (hasMoreUsers) {
        // Daha fazla kullanıcı var, yeni batch yükle
        console.log('📭 [SWIPE] Batch tükendi, yeni batch yükleniyor...');
        setCurrentUser(null);
        loadUserBatch(false);
      } else {
        // Daha fazla kullanıcı yok
        console.log('🚫 [SWIPE] Tüm kullanıcılar gösterildi');
        setCurrentUser(null);
      }
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
        
        // Swipe limit modal'ı göster
        setLimitModalMessage(error.message || 'Günlük swipe limitiniz doldu!');
        setShowLimitModal(true);
        
        throw error;
      }
      
      // 400 hatası - Backend'den gelen swipe limit hatası
      if (error.response?.status === 400 && error.response?.data?.message?.includes('limit')) {
        const message = error.response.data.message || 'Günlük swipe limitiniz doldu!';
        setLimitModalMessage(message);
        setShowLimitModal(true);
        throw new Error(message);
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
    // Sadece kullanıcı giriş yaptıktan sonra limit bilgilerini ve batch'i yükle
    if (!isLoggedIn) {
      console.log('⏸️ [SWIPE] Kullanıcı giriş yapmamış, swipe limit ve batch yüklenmesi ertelendi');
      return;
    }

    console.log('🔄 [SWIPE] Kullanıcı giriş yaptı, swipe limit bilgileri getiriliyor...');
    fetchSwipeLimitInfo();
    
    // İlk açılışta refresh: true ile kullanıcıları yükle
    if (userBatch.length === 0 && !isLoading) {
      console.log('🔄 [SWIPE] Kullanıcı giriş yaptı, batch yükleniyor (refresh: true)...');
      loadUserBatch(true);
    }
  }, [isLoggedIn]); // Sadece isLoggedIn değiştiğinde çalış

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
      
      {/* Swipe Limit Modal */}
      <SwipeLimitModal
        visible={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        remainingSwipes={swipeLimitInfo?.remainingSwipes || 0}
        message={limitModalMessage}
      />
    </SwipeContext.Provider>
  );
};
