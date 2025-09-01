import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { GestureHandlerRootView, PanGestureHandler as RNGHPanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import AstrologyMatchScreen from '../components/match/AstrologyMatchScreen';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { DiscoverResponse, DiscoverUser } from '../services/api';
import { getZodiacInfo, ZodiacSign } from '../types/zodiac';

// Yeni Tinder Mantığı API Types - API servis dosyasından import ediliyor

// Swipe edilen kullanıcıları cooldown süresi boyunca gizle
const DISLIKE_COOLDOWN = 10 * 60 * 1000; // 10 dakika (milisaniye)
const LIKE_COOLDOWN = 10 * 60 * 1000; // 10 dakika (milisaniye)
const MATCH_EXPIRY = 36 * 60 * 60 * 1000; // 36 saat (milisaniye)

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85; // Ekranı kaplamasın
const CARD_HEIGHT = height * 0.7; // Ekranı kaplamasın

// Swipe API Types
interface SwipeUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  age: number;
  gender: string;
  bio: string;
  zodiacSign: ZodiacSign;
  zodiacSignDisplay: string;
  compatibilityScore: number;
  compatibilityMessage: string;
  profileImageUrl: string;
  photos: Array<{
    id: number;
    photoUrl: string;
    isProfilePhoto: boolean;
    displayOrder: number;
  }>;
  photoCount: number;
  isPremium: boolean;
  lastActiveTime: string;
  activityStatus: string;
  location: string;
  distanceKm: number;
  isVerified: boolean;
  hasInstagram: boolean;
  hasSpotify: boolean;
  isNewUser: boolean;
  hasLikedCurrentUser?: boolean;
  profileCompleteness: string;
}



// Detaylı astrolojik veriler
const ASTROLOGY_DETAILS: Record<ZodiacSign, {
  sun: { positive: string[]; negative: string[] };
  moon: ZodiacSign;
  rising: ZodiacSign;  
  venus: ZodiacSign;
  mars: ZodiacSign;
  element: string;
  quality: string;
  rulingPlanet: string;
}> = {
  [ZodiacSign.ARIES]: {
    sun: { positive: ["Liderlik ruhu", "Cesur ve kararlı", "Enerjik yapı", "Girişimci ruh"], negative: ["Aceleci davranış", "Sabırsızlık", "Öfkeli anlar", "Dikkatli olmama"] },
    moon: ZodiacSign.SCORPIO, rising: ZodiacSign.LEO, venus: ZodiacSign.TAURUS, mars: ZodiacSign.ARIES,
    element: "Ateş", quality: "Kardinal", rulingPlanet: "Mars"
  },
  [ZodiacSign.TAURUS]: {
    sun: { positive: ["Kararlı yapı", "Güvenilir kişi", "Sanatsal yetenek", "Praktik zeka"], negative: ["İnatçı davranış", "Değişime direnç", "Maddi kaygılar", "Yavaş hareket"] },
    moon: ZodiacSign.CANCER, rising: ZodiacSign.VIRGO, venus: ZodiacSign.TAURUS, mars: ZodiacSign.CAPRICORN,
    element: "Toprak", quality: "Sabit", rulingPlanet: "Venüs"
  },
  [ZodiacSign.GEMINI]: {
    sun: { positive: ["İletişim becerisi", "Hızlı öğrenme", "Çok yönlülük", "Sosyal yapı"], negative: ["Kararsızlık", "Yüzeysellik", "Odaklanamama", "Değişkenlik"] },
    moon: ZodiacSign.AQUARIUS, rising: ZodiacSign.SAGITTARIUS, venus: ZodiacSign.GEMINI, mars: ZodiacSign.VIRGO,
    element: "Hava", quality: "Değişken", rulingPlanet: "Merkür"
  },
  [ZodiacSign.CANCER]: {
    sun: { positive: ["Duygusal zeka", "Koruyucu yapı", "Sezgisel güç", "Şefkatli ruh"], negative: ["Aşırı duyarlılık", "Geçmişe takılma", "Kaygı durumu", "Kapanık tavır"] },
    moon: ZodiacSign.PISCES, rising: ZodiacSign.SCORPIO, venus: ZodiacSign.CANCER, mars: ZodiacSign.TAURUS,
    element: "Su", quality: "Kardinal", rulingPlanet: "Ay"
  },
  [ZodiacSign.LEO]: {
    sun: { positive: ["Doğal liderlik", "Yaratıcılık", "Cömert kalp", "İlham verici"], negative: ["Egoist davranış", "Dikkat arayışı", "Kibirli tavır", "Eleştiriye tahammülsüzlük"] },
    moon: ZodiacSign.ARIES, rising: ZodiacSign.LEO, venus: ZodiacSign.LIBRA, mars: ZodiacSign.LEO,
    element: "Ateş", quality: "Sabit", rulingPlanet: "Güneş"
  },
  [ZodiacSign.VIRGO]: {
    sun: { positive: ["Detay odaklı", "Analitik zeka", "Yardımsever", "Mükemmeliyetçi"], negative: ["Aşırı eleştiri", "Endişeli yapı", "Takıntılı davranış", "Kendini suçlama"] },
    moon: ZodiacSign.TAURUS, rising: ZodiacSign.CAPRICORN, venus: ZodiacSign.VIRGO, mars: ZodiacSign.GEMINI,
    element: "Toprak", quality: "Değişken", rulingPlanet: "Merkür"
  },
  [ZodiacSign.LIBRA]: {
    sun: { positive: ["Adalet duygusu", "Estetik anlayış", "Diplomasi", "Uyumlu yapı"], negative: ["Kararsızlık", "Çelişkili tavır", "Çatışmadan kaçma", "Başkalarına bağımlılık"] },
    moon: ZodiacSign.GEMINI, rising: ZodiacSign.AQUARIUS, venus: ZodiacSign.LIBRA, mars: ZodiacSign.LIBRA,
    element: "Hava", quality: "Kardinal", rulingPlanet: "Venüs"
  },
  [ZodiacSign.SCORPIO]: {
    sun: { positive: ["Güçlü sezgi", "Derin analiz", "Sadakat", "Dönüşüm gücü"], negative: ["Kıskançlık", "İntikam alma", "Gizli saklama", "Aşırı şüphecilik"] },
    moon: ZodiacSign.CANCER, rising: ZodiacSign.SCORPIO, venus: ZodiacSign.SCORPIO, mars: ZodiacSign.SCORPIO,
    element: "Su", quality: "Sabit", rulingPlanet: "Plüton"
  },
  [ZodiacSign.SAGITTARIUS]: {
    sun: { positive: ["Özgürlük sevgisi", "Felsefik bakış", "İyimserlik", "Macera ruhu"], negative: ["Sorumsuz davranış", "Taktik eksikliği", "Kaba konuşma", "Sabırsızlık"] },
    moon: ZodiacSign.ARIES, rising: ZodiacSign.GEMINI, venus: ZodiacSign.SAGITTARIUS, mars: ZodiacSign.SAGITTARIUS,
    element: "Ateş", quality: "Değişken", rulingPlanet: "Jüpiter"
  },
  [ZodiacSign.CAPRICORN]: {
    sun: { positive: ["Disiplinli yapı", "Hedef odaklı", "Sorumluluk sahibi", "Dayanıklılık"], negative: ["Katı kurallar", "Pesimist bakış", "Duygusuz görünme", "Aşırı ciddiyet"] },
    moon: ZodiacSign.VIRGO, rising: ZodiacSign.TAURUS, venus: ZodiacSign.CAPRICORN, mars: ZodiacSign.CAPRICORN,
    element: "Toprak", quality: "Kardinal", rulingPlanet: "Satürn"
  },
  [ZodiacSign.AQUARIUS]: {
    sun: { positive: ["Özgün düşünce", "Yenilikçilik", "Hümanizm", "Bağımsızlık"], negative: ["Soğuk davranış", "İsyankarlık", "Öngörülemezlik", "Mesafeli tavır"] },
    moon: ZodiacSign.LIBRA, rising: ZodiacSign.AQUARIUS, venus: ZodiacSign.AQUARIUS, mars: ZodiacSign.AQUARIUS,
    element: "Hava", quality: "Sabit", rulingPlanet: "Uranüs"
  },
  [ZodiacSign.PISCES]: {
    sun: { positive: ["Empati yetisi", "Hayal gücü", "Spiritüel bağ", "Şefkat dolu"], negative: ["Aşırı duygusallık", "Kaçış eğilimi", "Sınır belirsizliği", "Mağduriyet"] },
    moon: ZodiacSign.SCORPIO, rising: ZodiacSign.CANCER, venus: ZodiacSign.PISCES, mars: ZodiacSign.CANCER,
    element: "Su", quality: "Değişken", rulingPlanet: "Neptün"
  }
};

export default function AstrologyMatchesScreen() {
  const colorScheme = useColorScheme();
  const { isPremium } = useAuth();
  const { userProfile } = useProfile();
  const router = useRouter();
  
  // State - Yeni Tinder Mantığı
  const [currentUser, setCurrentUser] = useState<DiscoverUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [swipeLimitInfo, setSwipeLimitInfo] = useState<DiscoverResponse['swipeLimitInfo'] | null>(null);
  const [isSwipeInProgress, setIsSwipeInProgress] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showNewUserOverlay, setShowNewUserOverlay] = useState(false);
  const [errorToast, setErrorToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  
  // Swipe edilmiş kullanıcıları timestamp ve action ile takip et
  const [swipedUsers, setSwipedUsers] = useState<Map<number, { timestamp: number; action: 'LIKE' | 'DISLIKE' | 'MATCH' }>>(new Map());
  
  // Match Screen State
  const [showMatchScreen, setShowMatchScreen] = useState(false);
  const [matchedUserData, setMatchedUserData] = useState<DiscoverUser | null>(null);
  const [matchResponse, setMatchResponse] = useState<any>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Logout event listener - cache temizleme
  useEffect(() => {
    const logoutListener = DeviceEventEmitter.addListener('user_logout', (data) => {
      console.log('🗑️ [ASTROLOGY MATCHES] Logout event alındı:', data.reason);
      
      // Tüm state'leri temizle
      setCurrentUser(null);
      setSwipedUsers(new Map());
      setCurrentPhotoIndex(0);
      setShowDetailView(false);
      setShowNewUserOverlay(false);
      setShowMatchScreen(false);
      setMatchedUserData(null);
      setMatchResponse(null);
      setIsClosing(false);
      setErrorToast({ show: false, message: '' });
      
      // AsyncStorage'dan swipe edilen kullanıcıları temizle
      clearSwipedUsersFromStorage();
      
      console.log('✅ [ASTROLOGY MATCHES] Tüm state\'ler ve storage temizlendi');
    });

    return () => {
      logoutListener.remove();
    };
  }, []);

  // Otomatik burç seçimi - kullanıcı profili yüklendiğinde
  useEffect(() => {
    const setAutoZodiacSelection = async () => {
      if (userProfile?.zodiacSign) {
        try {
          await AsyncStorage.setItem('user_zodiac_selection', userProfile.zodiacSign);
          console.log('✨ [ASTROLOGY MATCHES] Kullanıcının burcu otomatik seçildi:', userProfile.zodiacSign);
        } catch (error) {
          console.error('❌ [ASTROLOGY MATCHES] Burç seçimi kaydetme hatası:', error);
        }
      }
    };

    setAutoZodiacSelection();
  }, [userProfile?.zodiacSign]);

  // Debug: Match screen state'lerini takip et
  useEffect(() => {
    console.log('🎬 [RENDER] Match screen state değişimi:', {
      showMatchScreen,
      hasMatchedUserData: !!matchedUserData,
      hasUserProfile: !!userProfile,
      shouldRender: showMatchScreen && matchedUserData && userProfile,
      userProfileId: userProfile?.id,
      matchedUserId: matchedUserData?.id,
      currentTime: new Date().toLocaleTimeString()
    });
    
    if (showMatchScreen && matchedUserData && userProfile) {
      console.log('✅ [RENDER] Tüm koşullar sağlandı - AstrologyMatchScreen render edilmeli!');
    } else if (showMatchScreen) {
      console.log('❌ [RENDER] Match screen true ama veriler eksik:', {
        showMatchScreen,
        hasMatchedUserData: !!matchedUserData,
        hasUserProfile: !!userProfile,
        matchedUserData: matchedUserData,
        userProfile: userProfile
      });
    }
  }, [showMatchScreen, matchedUserData, userProfile]);

  // Swipe Animation Values - Tinder Tarzı
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const likeOpacity = useSharedValue(0);
  const dislikeOpacity = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  // Astroloji tema renkleri
  const astrologyTheme = {
    primary: '#8000FF',
    secondary: '#5B00B5',
    accent: '#FFD700',
    gradient: ['#8000FF', '#5B00B5', '#3D007A'],
    cardBg: 'rgba(128, 0, 255, 0.1)',
    likeColor: '#00FF7F',
    dislikeColor: '#FF4757',
    matchColor: '#FFD700',
  };

  // Toast notification göster - Kaldırıldı
  const showErrorToast = (message: string) => {
    // Hiçbir şey yapma - sessizce geç
    console.log('🔇 [TOAST] Toast gösterilmedi:', message);
  };

  // Yeni Tinder Mantığı: Tek kullanıcı getir
  const getNextUser = async (refresh: boolean = false) => {
    try {
      setIsLoading(true);
      console.log(`🔍 [DISCOVER] ${refresh ? 'Refresh' : 'Normal'} mod - API isteği yapılıyor`);
      
      // API servis dosyasındaki swipeApi.getDiscoverUsers kullan
      const { swipeApi } = await import('../services/api');
      const data = await swipeApi.getDiscoverUsers(1, 1, refresh);
      
      console.log(`📡 [API] Response alındı:`, data);
      
      if (data.success && data.user) {
        // API'den gelen tekil user'ı kullan
        const user = data.user;
        
        // Bu kullanıcı daha önce swipe edilmiş mi kontrol et
        if (isUserSwiped(user.id)) {
          console.log(`🔄 [DISCOVER] Kullanıcı ${user.firstName} (ID: ${user.id}) zaten swipe edilmiş, yeni kullanıcı getiriliyor`);
          // Recursive olarak yeni kullanıcı getir
          if (refresh) {
            // Refresh modunda ise tekrar dene
            setTimeout(() => getNextUser(true), 1000);
          } else {
            // Normal modda ise yeni kullanıcı getir
            setTimeout(() => getNextUser(false), 1000);
          }
          return;
        }
        
        // Match screen açıksa yeni kullanıcı getirme
        if (showMatchScreen) {
          console.log('💕 [DISCOVER] Match screen açık, yeni kullanıcı getirilmiyor');
          return;
        }
        
        // API servis dosyasındaki DiscoverUser tipine uygun hale getir
        const compatibleUser: DiscoverUser = {
          ...user,
          bio: user.bio || '',
          zodiacSign: user.zodiacSign as ZodiacSign
        };
        setCurrentUser(compatibleUser);
        
        // Swipe limit bilgisi varsa set et
        if (data.swipeLimitInfo) {
          setSwipeLimitInfo(data.swipeLimitInfo);
        }
        
        // Yeni kullanıcı geldiğinde animasyon değerlerini sıfırla
        translateX.value = 0;
        translateY.value = 0;
        rotate.value = 0;
        scale.value = 1;
        cardOpacity.value = 1;
        likeOpacity.value = 0;
        dislikeOpacity.value = 0;
        
        console.log(`✅ [DISCOVER] Kullanıcı bulundu: ${user.firstName} ${user.lastName} (${data.totalRemainingUsers || 0} kullanıcı kaldı)`);
        if (data.swipeLimitInfo) {
          console.log(`📊 [DISCOVER] Swipe limit: ${data.swipeLimitInfo.remainingSwipes} kaldı`);
        }
      } else {
        setCurrentUser(null);
        console.log('❌ [DISCOVER] Gösterilecek kullanıcı yok:', data.message);
      }
      
    } catch (error: any) {
      console.error('❌ [DISCOVER] API hatası:', error);
      
      // Network hatası durumunda kullanıcıyı bilgilendir
      if (error.message.includes('fetch')) {
        Alert.alert('Bağlantı Hatası', 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        Alert.alert('Hata', 'Kullanıcı yüklenirken bir hata oluştu: ' + error.message);
      }
      
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh fonksiyonu kaldırıldı - doğrudan getNextUser(true) kullanılıyor

  // AsyncStorage'a swipe edilen kullanıcıları kaydet
  const saveSwipedUsersToStorage = async (userId: number, timestamp: number, action: 'LIKE' | 'DISLIKE' | 'MATCH') => {
    try {
      const key = `swiped_user_${userId}`;
      const data = JSON.stringify({ timestamp, action });
      await AsyncStorage.setItem(key, data);
      console.log(`💾 [STORAGE] Kullanıcı ${userId} ${action} olarak kaydedildi`);
    } catch (error) {
      console.error(`❌ [STORAGE] Kullanıcı ${userId} kaydetme hatası:`, error);
    }
  };

  // AsyncStorage'dan swipe edilen kullanıcıları yükle
  const loadSwipedUsersFromStorage = async () => {
    try {
      const swipedUsersMap = new Map<number, { timestamp: number; action: 'LIKE' | 'DISLIKE' | 'MATCH' }>();
      
      // Tüm swipe edilen kullanıcıları AsyncStorage'dan al
      const keys = await AsyncStorage.getAllKeys();
      const swipedKeys = keys.filter(key => key.startsWith('swiped_user_'));
      
      for (const key of swipedKeys) {
        const userId = parseInt(key.replace('swiped_user_', ''));
        const dataStr = await AsyncStorage.getItem(key);
        
        if (dataStr) {
          try {
            const data = JSON.parse(dataStr);
            const { timestamp, action } = data;
            
            // Cooldown süresi geçmiş mi kontrol et
            const cooldownDuration = action === 'MATCH' ? MATCH_EXPIRY : 
                                   action === 'LIKE' ? LIKE_COOLDOWN : DISLIKE_COOLDOWN;
            
            if (Date.now() - timestamp <= cooldownDuration) {
              swipedUsersMap.set(userId, { timestamp, action });
            } else {
              // Süresi dolmuş, AsyncStorage'dan sil
              await AsyncStorage.removeItem(key);
              console.log(`🗑️ [STORAGE] Cooldown süresi dolmuş kullanıcı ${userId} silindi`);
            }
          } catch (parseError) {
            console.error(`❌ [STORAGE] Kullanıcı ${userId} veri parse hatası:`, parseError);
            // Eski format, sil
            await AsyncStorage.removeItem(key);
          }
        }
      }
      
      setSwipedUsers(swipedUsersMap);
      console.log(`📱 [STORAGE] ${swipedUsersMap.size} aktif swipe edilen kullanıcı yüklendi`);
    } catch (error) {
      console.error('❌ [STORAGE] Swipe edilen kullanıcıları yükleme hatası:', error);
    }
  };

  // AsyncStorage'dan swipe edilen kullanıcıları temizle
  const clearSwipedUsersFromStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const swipedKeys = keys.filter(key => key.startsWith('swiped_user_'));
      
      for (const key of swipedKeys) {
        await AsyncStorage.removeItem(key);
      }
      
      console.log(`🗑️ [STORAGE] ${swipedKeys.length} swipe edilen kullanıcı storage'dan temizlendi`);
    } catch (error) {
      console.error('❌ [STORAGE] Swipe edilen kullanıcıları temizleme hatası:', error);
    }
  };

  // Swipe edilmiş kullanıcı ID'sini timestamp ve action ile kaydet
  const markUserAsSwiped = (userId: number, action: 'LIKE' | 'DISLIKE' | 'MATCH') => {
    const timestamp = Date.now();
    setSwipedUsers(prev => new Map(prev).set(userId, { timestamp, action }));
    
    // AsyncStorage'a da kaydet
    saveSwipedUsersToStorage(userId, timestamp, action);
    
    console.log(`✅ [SWIPE_TRACK] Kullanıcı ${userId} ${action} olarak işaretlendi (timestamp: ${timestamp})`);
  };

  // Kullanıcının swipe edilip edilmediğini kontrol et (cooldown kontrolü ile)
  const isUserSwiped = (userId: number): boolean => {
    const swipeData = swipedUsers.get(userId);
    if (!swipeData) return false;
    
    const { timestamp, action } = swipeData;
    
    // Cooldown süresi geçmiş mi kontrol et
    const cooldownDuration = action === 'MATCH' ? MATCH_EXPIRY : 
                           action === 'LIKE' ? LIKE_COOLDOWN : DISLIKE_COOLDOWN;
    
    const isExpired = Date.now() - timestamp > cooldownDuration;
    if (isExpired) {
      // Süresi dolmuş, Map'ten kaldır
      setSwipedUsers(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
      return false;
    }
    
    return true;
  };

  // Swipe edilmemiş kullanıcıları filtrele - KALDIRILDI (Tinder mantığında gerekli değil)
  // const getUnswipedUsers = (): SwipeUser[] => {
  //   return users.filter(user => !isUserSwiped(user.id));
  // };

  // Swipe limit bilgisi getir - KALDIRILDI, Yeni API gelecek
  // const fetchSwipeLimitInfo = async () => {
  //   // TODO: Yeni API entegrasyonu gelecek
  // };

  // Premium sayfasına yönlendir
  const navigateToPremium = () => {
    console.log('🎖️ [PREMIUM] Premium sayfasına yönlendiriliyor');
    router.push('/(profile)/premiumScreen');
  };

  // Swipe işlemi - Yeni Tinder Mantığı
  const performSwipe = async (toUserId: number, action: 'LIKE' | 'DISLIKE') => {
    try {
      // Çift çağrım koruması
      if (isSwipeInProgress) {
        console.log('🚫 [SWIPE] Zaten swipe işlemi devam ediyor');
        return;
      }
      
      setIsSwipeInProgress(true);
      console.log(`🔄 [SWIPE] ${action} işlemi başlatılıyor - API isteği yapılıyor`);
      
      // API servis dosyasındaki swipeApi.swipe kullan
      const { swipeApi } = await import('../services/api');
      const swipeData = {
        toUserId,
        action: action as 'LIKE' | 'DISLIKE'
      };
      
      const swipeResult = await swipeApi.swipe(swipeData);
      console.log(`📡 [SWIPE] API response:`, swipeResult);
      
      // Match kontrolü yap
      if (swipeResult.success && swipeResult.isMatch) {
        console.log('💕 [MATCH] EŞLEŞME BULUNDU! Match screen açılıyor...');
        
        // Match data'sını set et
        setMatchedUserData(currentUser);
        setMatchResponse(swipeResult);
        
        // Match screen'i göster
        setShowMatchScreen(true);
        
        // Kullanıcıyı swipe edildi olarak işaretle
        markUserAsSwiped(toUserId, action);
        
        // Match screen'de kal, sonraki kullanıcıya geçme
        return;
      }
      
      // Match yoksa normal akış
      console.log('💔 [SWIPE] Match bulunamadı, sonraki kullanıcıya geçiliyor');
      
      // Kullanıcıyı swipe edildi olarak işaretle
      markUserAsSwiped(toUserId, action);
      
      // Sonraki kullanıcıya geç
      await nextUser();
      
    } catch (error: any) {
      console.error('❌ [SWIPE] API hatası:', error);
      
      // Duplicate swipe hatası - kullanıcıyı bilgilendir ve sonraki kullanıcıya geç
      if (error.message.includes('zaten bir swipe kaydınız var')) {
        console.log('🔄 [SWIPE] Kullanıcı zaten swipe edilmiş, sonraki kullanıcıya geçiliyor');
        
        // Kullanıcıyı swipe edildi olarak işaretle
        markUserAsSwiped(toUserId, action);
        
        // Sonraki kullanıcıya geç
        await nextUser();
        return;
      }
      
      // Network hatası durumunda kullanıcıyı bilgilendir
      if (error.message.includes('fetch')) {
        Alert.alert('Bağlantı Hatası', 'Swipe işlemi yapılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        Alert.alert('Hata', 'Swipe işlemi sırasında bir hata oluştu: ' + error.message);
      }
    } finally {
      setIsSwipeInProgress(false);
    }
  };

      // Eski performSwipe kodu kaldırıldı - Yeni API bekleniyor

  // Yeni Tinder Mantığı: Sonraki kullanıcıyı getir
  const nextUser = async () => {
    // Çift çağrım koruması
    if (isSwipeInProgress) {
      console.log('🚫 [NEXT] Swipe işlemi devam ediyor, nextUser iptal edildi');
      return;
    }
    
    // Match screen açıksa sonraki kullanıcıya geçme
    if (showMatchScreen) {
      console.log('💕 [NEXT] Match screen açık, sonraki kullanıcıya geçilmiyor');
      return;
    }
    
    console.log('🔄 [NEXT] Sonraki kullanıcı getiriliyor...');
    
    // Yeni kullanıcıyı getir
    await getNextUser(false);
    
    // Yeni kullanıcı overlay'ini kapat
    if (showNewUserOverlay) {
      setShowNewUserOverlay(false);
      console.log('🆕 [NEW_USER] Overlay otomatik kapatıldı - swipe yapıldı');
    }
  };

  // Animasyonları sıfırla - KALDIRILDI
  // const resetAnimations = () => {
  //   // Animasyon kodu kaldırıldı
  // };

  // Eşleşme animasyonu - KALDIRILDI
  // const showMatchAnimation = () => {
  //   // Animasyon kodu kaldırıldı
  // };

  // Swipe Gesture Handler - Tinder Tarzı
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
    },
    onActive: (event, context: any) => {
      translateX.value = context.startX + event.translationX;
      translateY.value = context.startY + event.translationY;
      
      // Rotasyon efekti
      rotate.value = interpolate(
        event.translationX,
        [-200, 0, 200],
        [-15, 0, 15],
        Extrapolate.CLAMP
      );
      
      // Scale efekti
      scale.value = interpolate(
        Math.abs(event.translationX),
        [0, 200],
        [1, 0.9],
        Extrapolate.CLAMP
      );
      
      // Like/Dislike overlay opacity
      if (event.translationX > 50) {
        likeOpacity.value = interpolate(
          event.translationX,
          [50, 150],
          [0, 1],
          Extrapolate.CLAMP
        );
        dislikeOpacity.value = 0;
      } else if (event.translationX < -50) {
        dislikeOpacity.value = interpolate(
          Math.abs(event.translationX),
          [50, 150],
          [0, 1],
          Extrapolate.CLAMP
        );
        likeOpacity.value = 0;
      } else {
        likeOpacity.value = 0;
        dislikeOpacity.value = 0;
      }
    },
    onEnd: (event) => {
      const shouldSwipeRight = event.translationX > 120;
      const shouldSwipeLeft = event.translationX < -120;
      
      if (shouldSwipeRight) {
        // Sağa swipe - LIKE
        translateX.value = withSpring(500);
        translateY.value = withSpring(0);
        rotate.value = withSpring(30);
        cardOpacity.value = withTiming(0, { duration: 300 });
        
        // LIKE işlemini yap
        runOnJS(performSwipe)(currentUser?.id || 0, 'LIKE');
      } else if (shouldSwipeLeft) {
        // Sola swipe - DISLIKE
        translateX.value = withSpring(-500);
        translateY.value = withSpring(0);
        rotate.value = withSpring(-30);
        cardOpacity.value = withTiming(0, { duration: 300 });
        
        // DISLIKE işlemini yap
        runOnJS(performSwipe)(currentUser?.id || 0, 'DISLIKE');
      } else {
        // Geri döndür
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
        scale.value = withSpring(1);
        likeOpacity.value = withTiming(0);
        dislikeOpacity.value = withTiming(0);
      }
    }
  });

  // Animated Styles - Tinder Tarzı
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: cardOpacity.value,
    backfaceVisibility: 'hidden',
  }));

  const likeStyle = useAnimatedStyle(() => ({
    opacity: likeOpacity.value,
  }));

  const dislikeStyle = useAnimatedStyle(() => ({
    opacity: dislikeOpacity.value,
  }));

  // Sayfa her fokuslandığında fresh data çek
  useFocusEffect(
    useCallback(() => {
      console.log('AstrologyMatches screen focused - refreshing data');
      
      // Match screen açıksa yeni kullanıcı getirme
      if (showMatchScreen) {
        console.log('💕 [FOCUS] Match screen açık, yeni kullanıcı getirilmiyor');
        return;
      }
      
      // Önce swipe edilen kullanıcıları yükle
      loadSwipedUsersFromStorage();
      
      // Sonra diğer verileri yükle
      getNextUser(false); // Normal mod - yeni kullanıcı getir
    }, [showMatchScreen])
  );

  // Tutorial overlay kontrolü - sadece uygulama kullanıcısı için tek seferlik
  useEffect(() => {
    const checkTutorialStatus = async () => {
      try {
        const tutorialShown = await AsyncStorage.getItem('astrology_tutorial_shown');
        if (!tutorialShown) {
          console.log('🎓 [TUTORIAL] İlk kez astrology-matches sayfası açılıyor, tutorial gösteriliyor');
          setShowNewUserOverlay(true);
          // Tutorial gösterildi olarak işaretle
          await AsyncStorage.setItem('astrology_tutorial_shown', 'true');
        } else {
          console.log('🎓 [TUTORIAL] Tutorial daha önce gösterilmiş, atlanıyor');
        }
      } catch (error) {
        console.error('❌ [TUTORIAL] Tutorial status kontrolü hatası:', error);
      }
    };

    // Sadece kullanıcı yüklendikten sonra tutorial'ı kontrol et
    if (currentUser && !isLoading) {
      checkTutorialStatus();
    }
  }, [currentUser, isLoading]);

  // Mevcut kullanıcı - Yeni Tinder Mantığı
  const zodiacInfo = currentUser ? getZodiacInfo(currentUser.zodiacSign as ZodiacSign) : null;
  const astrologyDetails = currentUser ? ASTROLOGY_DETAILS[currentUser.zodiacSign as ZodiacSign] : null;

  // Burç uyumluluk rengi
  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return '#00FF7F'; // Yeşil
    if (score >= 60) return '#FFD700'; // Altın
    if (score >= 40) return '#FF8C00'; // Turuncu
    return '#FF4757'; // Kırmızı
  };

  // Loading state
  if (isLoading) {
    return (
      <LinearGradient colors={['#8000FF', '#5B00B5', '#3D007A']} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8000FF" />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🌟 Astroloji Eşleşme</Text>
        </View>

        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>🌟</Text>
            <Text style={styles.loadingSubtext}>Yıldızlar senin için uyumlu kişileri arıyor...</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  // Swipe limit doldu - KALDIRILDI, Yeni API gelecek
  // if (swipeLimitInfo && !swipeLimitInfo.canSwipe && !swipeLimitInfo.isPremium) {
  //   // TODO: Yeni limit kontrolü gelecek
  // }

  // Mevcut kullanıcı swipe edilmiş mi kontrol et - Yeni Tinder Mantığı
  if (currentUser && isUserSwiped(currentUser.id)) {
    console.log(`🔄 [UI] Kullanıcı ${currentUser.firstName} (ID: ${currentUser.id}) zaten swipe edilmiş, yeni kullanıcı getiriliyor`);
    // Otomatik olarak yeni kullanıcı getir
    useEffect(() => {
      getNextUser(false);
    }, []);
    return (
      <View style={styles.container}>
        <LinearGradient colors={astrologyTheme.gradient as any} style={styles.background} />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>🌟</Text>
            <Text style={styles.loadingSubtext}>Yeni yıldızlar yükleniyor...</Text>
          </View>
        </View>
      </View>
    );
  }

  // Kullanıcı kalmadı - Yeni Tinder Mantığı
  if (!currentUser) {
    return (
      <View style={styles.emptyContainer}>
        <LinearGradient colors={astrologyTheme.gradient as any} style={styles.background} />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>✨ Astroloji Eşleşme</Text>
        </View>
        
        {/* Empty State Content */}
        <View style={styles.emptyContent}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>🌟</Text>
          </View>
          
          <Text style={styles.emptyTitle}>Yıldızlar Tükendi</Text>
          <Text style={styles.emptySubtitle}>
            Şu an için gösterilecek yeni profil yok.{'\n'}
            Biraz sonra tekrar deneyin veya refresh yapın!
          </Text>
          
          {/* Refresh Button */}
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={() => getNextUser(true)}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="refresh" 
              size={20} 
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.refreshButtonText}>Yenile</Text>
          </TouchableOpacity>
          
          {/* Info Text */}
          <Text style={styles.emptyInfoText}>
            💡 Yeni kullanıcılar sürekli ekleniyor
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Arka plan - Sabit tutarak siyah ekran sorununu önle */}
      <LinearGradient colors={astrologyTheme.gradient as any} style={styles.background} />
      
      {/* Ek arka plan koruması */}
      <View style={styles.backgroundProtection} />
      
      {/* Loading overlay - Siyah ekran yerine */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <Text style={styles.loadingEmoji}>🌟</Text>
            <Text style={styles.loadingText}>Yeni yıldızlar yükleniyor...</Text>
          </View>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✨ Astroloji Eşleşme</Text>
      </View>

      {/* Kart Stack - Tinder Tarzı Swipe */}
      <View style={styles.cardStack}>
        {/* Ana kart - Swipe Gesture ile */}
        <GestureHandlerRootView>
          <RNGHPanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.card, cardStyle]}>
              {/* Like Overlay - Sağa Swipe */}
              <Animated.View style={[styles.likeOverlay, likeStyle]}>
                <View style={styles.overlayContent}>
                  <Ionicons name="heart" size={60} color="#00FF7F" />
                  <Text style={styles.likeText}>BEĞEN</Text>
                </View>
              </Animated.View>

              {/* Dislike Overlay - Sola Swipe */}
              <Animated.View style={[styles.dislikeOverlay, dislikeStyle]}>
                <View style={styles.overlayContent}>
                  <Ionicons name="close" size={60} color="#FF4757" />
                  <Text style={styles.dislikeText}>GEÇ</Text>
                </View>
              </Animated.View>

              {/* Scrollable İçerik */}
              <ScrollView
                style={styles.cardScrollView}
                contentContainerStyle={styles.cardScrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
              >
              {/* Ana Fotoğraf ve Başlık */}
              <View style={styles.cardHeader}>
                <Image
                  source={{ 
                    uri: currentUser.profileImageUrl || currentUser.photos[0]?.photoUrl || `https://picsum.photos/400/600?random=${currentUser.id}` 
                  }}
                  style={styles.mainPhoto}
                  resizeMode="cover"
                />
                
                {/* Üst Bilgi Bandı */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.6)']}
                  style={styles.headerOverlay}
                >
                  <View style={styles.headerInfo}>
                    <View style={styles.nameSection}>
                      <Text style={styles.userName}>
                        {currentUser.firstName} {currentUser.lastName}, {currentUser.age}
                      </Text>
                      {zodiacInfo && (
                        <Text style={styles.zodiacName}>
                          {zodiacInfo.emoji} {zodiacInfo.turkishName}
                        </Text>
                      )}
                    </View>
                    
                    <View style={[
                      styles.compatibilityBadge,
                      { backgroundColor: getCompatibilityColor(currentUser.compatibilityScore) }
                    ]}>
                      <Text style={styles.compatibilityScore}>
                        %{currentUser.compatibilityScore}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              {/* Bio */}
              {currentUser.bio && (
                <View style={styles.bioSection}>
                  <Text style={styles.sectionTitle}>✨ Hakkımda</Text>
                  <Text style={styles.bioText}>{currentUser.bio}</Text>
                </View>
              )}

              {/* Astroloji Detayları - Güneş Burcu */}
              {astrologyDetails && (
                <View style={styles.astrologySection}>
                  <Text style={styles.sectionTitle}>🌟 Astroloji Haritası</Text>
                  
                  {/* Güneş Burcu */}
                  <View style={styles.zodiacCard}>
                    <View style={styles.zodiacHeader}>
                      <Text style={styles.zodiacIcon}>☀️</Text>
                      <Text style={styles.zodiacTitle}>Güneş Burcu</Text>
                      <Text style={styles.zodiacSubtitle}>{zodiacInfo?.turkishName}</Text>
                    </View>
                    
                    <View style={styles.traitsList}>
                      <Text style={styles.traitsTitle}>✅ Olumlu Özellikler:</Text>
                      {astrologyDetails.sun.positive.map((trait, index) => (
                        <Text key={index} style={styles.traitItem}>• {trait}</Text>
                      ))}
                      
                      <Text style={styles.traitsTitle}>⚠️ Dikkat Edilmesi Gerekenler:</Text>
                      {astrologyDetails.sun.negative.map((trait, index) => (
                        <Text key={index} style={styles.traitItem}>• {trait}</Text>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* 1. Ek Fotoğraf */}
              {currentUser.photos && currentUser.photos.length > 1 && currentUser.photos[1] && (
                <View style={styles.singlePhotoContainer}>
                  <Image
                    source={{ uri: currentUser.photos[1].photoUrl }}
                    style={styles.singlePhoto}
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* Astroloji Detayları - Ay ve Yükselen */}
              {astrologyDetails && (
                <View style={styles.astrologySection}>
                  {/* Ay Burcu */}
                  <View style={styles.zodiacCard}>
                    <View style={styles.zodiacHeader}>
                      <Text style={styles.zodiacIcon}>🌙</Text>
                      <Text style={styles.zodiacTitle}>Ay Burcu</Text>
                      <Text style={styles.zodiacSubtitle}>{getZodiacInfo(astrologyDetails.moon)?.turkishName}</Text>
                    </View>
                    <Text style={styles.zodiacDescription}>
                      Duygusal dünyasını ve iç dünyasını etkileyen burç
                    </Text>
                  </View>

                  {/* Yükselen Burcu */}
                  <View style={styles.zodiacCard}>
                    <View style={styles.zodiacHeader}>
                      <Text style={styles.zodiacIcon}>⬆️</Text>
                      <Text style={styles.zodiacTitle}>Yükselen Burcu</Text>
                      <Text style={styles.zodiacSubtitle}>{getZodiacInfo(astrologyDetails.rising)?.turkishName}</Text>
                    </View>
                    <Text style={styles.zodiacDescription}>
                      Dış dünyaya karşı sergilediği kişilik ve davranış tarzı
                    </Text>
                  </View>
                </View>
              )}

              {/* 2. Ek Fotoğraf */}
              {currentUser.photos && currentUser.photos.length > 2 && currentUser.photos[2] && (
                <View style={styles.singlePhotoContainer}>
                  <Image
                    source={{ uri: currentUser.photos[2].photoUrl }}
                    style={styles.singlePhoto}
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* Astroloji Detayları - Venüs, Mars, Element */}
              {astrologyDetails && (
                <View style={styles.astrologySection}>
                  {/* Venüs */}
                  <View style={styles.zodiacCard}>
                    <View style={styles.zodiacHeader}>
                      <Text style={styles.zodiacIcon}>💖</Text>
                      <Text style={styles.zodiacTitle}>Venüs</Text>
                      <Text style={styles.zodiacSubtitle}>{getZodiacInfo(astrologyDetails.venus)?.turkishName}</Text>
                    </View>
                    <Text style={styles.zodiacDescription}>
                      Aşk hayatı, estetik anlayışı ve ilişki tarzı
                    </Text>
                  </View>

                  {/* Mars */}
                  <View style={styles.zodiacCard}>
                    <View style={styles.zodiacHeader}>
                      <Text style={styles.zodiacIcon}>🔥</Text>
                      <Text style={styles.zodiacTitle}>Mars</Text>
                      <Text style={styles.zodiacSubtitle}>{getZodiacInfo(astrologyDetails.mars)?.turkishName}</Text>
                    </View>
                    <Text style={styles.zodiacDescription}>
                      Enerji kaynağı, motivasyon ve tutkulu yanları
                    </Text>
                  </View>

                  {/* Element ve Kalite */}
                  <View style={styles.elementCard}>
                    <Text style={styles.elementTitle}>🌟 Element ve Kalite</Text>
                    <View style={styles.elementRow}>
                      <Text style={styles.elementItem}>Element: {astrologyDetails.element}</Text>
                      <Text style={styles.elementItem}>Kalite: {astrologyDetails.quality}</Text>
                    </View>
                    <Text style={styles.elementItem}>Yönetici Gezegen: {astrologyDetails.rulingPlanet}</Text>
                  </View>
                </View>
              )}

              {/* Uyumluluk Mesajı */}
              <View style={styles.compatibilitySection}>
                <Text style={styles.sectionTitle}>💫 Uyumluluk Analizi</Text>
                <Text style={styles.compatibilityMessage}>
                  {currentUser.compatibilityMessage}
                </Text>
              </View>

                          {/* Alt Boşluk */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
            </Animated.View>
          </RNGHPanGestureHandler>
        </GestureHandlerRootView>
      </View>

      {/* Swipe Yönlendirme Metni - Tinder Tarzı */}
      <View style={styles.swipeHint}>
        <Text style={styles.swipeHintText}>
          💡 Kartı sağa kaydırarak beğen ❤️, sola kaydırarak geç ❌
        </Text>
      </View>



      {/* New User Overlay */}
      {showNewUserOverlay && (
        <View style={styles.newUserOverlay}>
          <View style={styles.overlayContent}>
            <Text style={styles.overlayTitle}>🌟 Astroloji Eşleşme'ye Hoş Geldiniz!</Text>
            <Text style={styles.overlayText}>
              Burç uyumluluğuna göre size en uygun eşleşmeleri buluyoruz
            </Text>
            <Text style={styles.overlaySubtext}>
              • Aşağı kaydırarak burç detaylarını keşfedin{'\n'}
              • Alt kısımdaki butonlarla beğenin ❤️ veya geçin ❌
            </Text>
            <TouchableOpacity
              style={styles.overlayButton}
              onPress={() => {
          console.log('🎓 [TUTORIAL] Tutorial kapatıldı');
          setShowNewUserOverlay(false);
        }}
            >
              <Text style={styles.overlayButtonText}>Başlayalım!</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Swipe Progress */}
      {isSwipeInProgress && (
        <View style={styles.swipeProgress}>
          <ActivityIndicator size="small" color={astrologyTheme.accent} />
          <Text style={styles.swipeProgressText}>İşleniyor...</Text>
        </View>
      )}

      {/* Error Toast - Kaldırıldı */}
      {/* {errorToast.show && (
        <View style={styles.errorToast}>
          <Text style={styles.errorToastText}>⚠️ {errorToast.message}</Text>
        </View>
      )} */}

      {/* Match Screen */}
      {showMatchScreen && matchedUserData && userProfile && !isClosing && (
        <AstrologyMatchScreen
          currentUser={{
            id: userProfile.id || 0,
            firstName: userProfile.firstName || 'Kullanıcı',
            lastName: userProfile.lastName || '',
            profileImageUrl: userProfile.profileImage || null,
            zodiacSign: userProfile.zodiacSign || 'ARIES'
          }}
          matchedUser={{
            id: matchedUserData.id,
            firstName: matchedUserData.firstName,
            lastName: matchedUserData.lastName,
            profileImageUrl: matchedUserData.profileImageUrl || matchedUserData.photos[0]?.photoUrl || null,
            zodiacSign: matchedUserData.zodiacSign
          }}
          onClose={() => {
            console.log('🔴 [MATCH] Match screen kapatılıyor');
            try {
              setIsClosing(true);
              // State'leri sırayla güncelle
              setShowMatchScreen(false);
              
              // Kısa bir gecikme ile diğer state'leri temizle
              setTimeout(() => {
                setMatchedUserData(null);
                setMatchResponse(null);
                setIsClosing(false);
                console.log('✅ [MATCH] Match screen state\'leri temizlendi');
              }, 100);
              
              console.log('✅ [MATCH] Match screen başarıyla kapatıldı');
            } catch (error) {
              console.error('❌ [MATCH] Match screen kapatma hatası:', error);
              // Fallback: Force close
              setShowMatchScreen(false);
              setMatchedUserData(null);
              setMatchResponse(null);
              setIsClosing(false);
            }
          }}
          onStartChat={() => {
            console.log('💬 [MATCH] Sohbet başlatılıyor');
            try {
              setIsClosing(true);
              // Önce match screen'i kapat
              setShowMatchScreen(false);
              
              // Kısa bir gecikme ile state'leri temizle ve navigation yap
              setTimeout(() => {
                setMatchedUserData(null);
                setMatchResponse(null);
                setIsClosing(false);
                
                // Chat ekranına yönlendir
                router.push('/chat' as any);
                
                console.log('✅ [MATCH] Chat ekranına yönlendirildi');
              }, 150);
              
            } catch (error) {
              console.error('❌ [MATCH] Sohbet başlatma hatası:', error);
              // Fallback: Force close ve navigation
              setShowMatchScreen(false);
              setMatchedUserData(null);
              setMatchResponse(null);
              setIsClosing(false);
              router.push('/chat' as any);
              Alert.alert('Hata', 'Chat ekranına yönlendirilemedi');
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backgroundProtection: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#8000FF', // Fallback renk
    zIndex: -1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(128, 0, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  loadingEmoji: {
    fontSize: 48,
    marginBottom: 15,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingSubtext: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  loadingCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  swipeCounter: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  swipeCountText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },


  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },


  cardStack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
    position: 'relative',
    // Arka plan koruması
    backfaceVisibility: 'hidden',
    // Android için ek koruma
    ...(Platform.OS === 'android' && {
      elevation: 15,
    }),
  },
  cardBehind: {
    position: 'absolute',
    transform: [{ scale: 0.95 }],
    opacity: 0.5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  likeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,255,127,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#00FF7F',
  },
  overlayContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeText: {
    color: '#00FF7F',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  dislikeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,71,87,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#FF4757',
  },
  dislikeText: {
    color: '#FF4757',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 40,
  },
  compatibilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  compatibilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  compatibilityScore: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  compatibilityLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  zodiacInfo: {
    alignItems: 'center',
  },
  zodiacEmoji: {
    fontSize: 30,
    marginBottom: 4,
  },
  zodiacName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  userInfo: {
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  location: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
  },
  compatibility: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  bio: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 22,
  },
  activityStatus: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  photoIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 4,
  },
  photoDot: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  photoDotActive: {
    backgroundColor: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 20,
    gap: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dislikeButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#FF4757',
  },
  superLikeButton: {
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  likeButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#00FF7F',
  },
  swipeProgress: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  swipeProgressText: {
    color: 'white',
    fontSize: 14,
  },
  // Yeni SwipeCard Style'ları
  cardScrollView: {
    flex: 1,
  },
  cardScrollContent: {
    flexGrow: 1,
  },
  cardHeader: {
    position: 'relative',
  },
  mainPhoto: {
    width: '100%',
    height: 300,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameSection: {
    flex: 1,
  },
  singlePhotoContainer: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  singlePhoto: {
    width: '100%',
    height: 300,
    borderRadius: 20,
  },
  sectionTitle: {
    color: '#8000FF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bioSection: {
    padding: 20,
    paddingTop: 0,
  },
  bioText: {
    color: '#333',
    fontSize: 16,
    lineHeight: 24,
  },
  astrologySection: {
    padding: 20,
    paddingTop: 0,
    gap: 15,
  },
  zodiacCard: {
    backgroundColor: 'rgba(128,0,255,0.1)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(128,0,255,0.2)',
  },
  zodiacHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  zodiacIcon: {
    fontSize: 24,
  },
  zodiacTitle: {
    color: '#8000FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  zodiacSubtitle: {
    color: '#5B00B5',
    fontSize: 14,
    fontWeight: '600',
  },
  zodiacDescription: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  traitsList: {
    gap: 8,
  },
  traitsTitle: {
    color: '#8000FF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  traitItem: {
    color: '#666',
    fontSize: 14,
    paddingLeft: 10,
  },
  elementCard: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  elementTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  elementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  elementItem: {
    color: '#B8860B',
    fontSize: 14,
    fontWeight: '600',
  },
  compatibilitySection: {
    padding: 20,
    paddingTop: 0,
  },
  compatibilityMessage: {
    color: '#8000FF',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    backgroundColor: 'rgba(128,0,255,0.1)',
    padding: 15,
    borderRadius: 15,
  },
  bottomSpacing: {
    height: 30,
  },
  // New User Overlay Styles
  newUserOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  overlayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8000FF',
    marginBottom: 15,
    textAlign: 'center',
  },
  overlayText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  overlaySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  overlayButton: {
    backgroundColor: '#8000FF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#8000FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  overlayButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorToast: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 71, 87, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1001,
  },
  errorToastText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  limitStatsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  premiumButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  premiumButtonText: {
    color: '#8000FF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  swipeHint: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
  },
  swipeHintText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyIconContainer: {
    marginBottom: 30,
  },
  emptyIcon: {
    fontSize: 80,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  refreshButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 20,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyInfoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 