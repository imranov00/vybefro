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
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
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
import { swipeApi, SwipeLimitInfo } from '../services/api';
import { getZodiacInfo, ZodiacSign } from '../types/zodiac';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.8;

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
  
  // State
  const [users, setUsers] = useState<SwipeUser[]>([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [swipeLimitInfo, setSwipeLimitInfo] = useState<SwipeLimitInfo | null>(null);
  const [isSwipeInProgress, setIsSwipeInProgress] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showNewUserOverlay, setShowNewUserOverlay] = useState(false);
  const [errorToast, setErrorToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  
  // Match Screen State
  const [showMatchScreen, setShowMatchScreen] = useState(false);
  const [matchedUserData, setMatchedUserData] = useState<SwipeUser | null>(null);
  const [matchResponse, setMatchResponse] = useState<any>(null);

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

  // Animation values
  const translateX = useSharedValue(0);
  // translateY kaldırıldı - sadece yatay hareket
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const likeOpacity = useSharedValue(0);
  const dislikeOpacity = useSharedValue(0);

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

  // Toast notification göster
  const showErrorToast = (message: string) => {
    setErrorToast({ show: true, message });
    setTimeout(() => {
      setErrorToast({ show: false, message: '' });
    }, 3000); // 3 saniye sonra gizle
  };

  // Kullanıcıları getir (Normal keşif - hiç swipe yapmadığı + cooldown dolmuş)
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
              const response = await swipeApi.getDiscoverUsers(1, 10, false);
      
      if (response.success) {
        // DiscoverUser'ları SwipeUser formatına dönüştür
        console.log('📷 API\'den gelen kullanıcı sayısı:', response.users.length);
        
        const convertedUsers: SwipeUser[] = response.users.map(user => {
          // Fotoğraf debug
          console.log(`👤 Kullanıcı: ${user.firstName}, Fotoğraf sayısı: ${user.photos?.length || 0}`);
          if (user.photos) {
            user.photos.forEach((photo, index) => {
              console.log(`📸 Fotoğraf ${index + 1}: ${photo.imageUrl ? 'VALID' : 'EMPTY'} - ${photo.imageUrl}`);
            });
          }
          
          // Fotoğrafları filtrele (sadece valid olanlar)
          const validPhotos = user.photos?.filter(p => p.imageUrl && p.imageUrl.trim() !== '') || [];
          
          // Profil fotoğrafını belirle
          const profileImage = user.profileImageUrl && user.profileImageUrl.trim() !== '' 
            ? user.profileImageUrl 
            : validPhotos.length > 0 
              ? validPhotos[0].imageUrl 
              : `https://picsum.photos/400/600?random=${user.id}`;
          
          console.log(`🖼️ ${user.firstName} profil fotoğrafı: ${profileImage}`);
          console.log(`📂 ${user.firstName} toplam valid fotoğraf: ${validPhotos.length}`);
          
          return {
          id: user.id,
          username: user.firstName.toLowerCase() + user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
          age: user.age,
          gender: 'UNKNOWN',
          bio: user.bio || 'Yıldızların rehberliğinde hayatımı yaşıyorum ✨',
          zodiacSign: user.zodiacSign as ZodiacSign,
          zodiacSignDisplay: user.zodiacSign,
          compatibilityScore: user.compatibilityScore,
          compatibilityMessage: user.compatibilityDescription || 'Yıldızlar sizin için mükemmel bir uyum öngörüyor! 🌟',
          profileImageUrl: profileImage,
          photos: validPhotos.map((p, index) => ({
            id: Math.random(),
            photoUrl: p.imageUrl,
            isProfilePhoto: index === 0, // Sadece ilk fotoğraf profil fotoğrafı
            displayOrder: index + 1
          })),
          photoCount: validPhotos.length,
          isPremium: user.isPremium || false,
          lastActiveTime: new Date().toISOString(),
          activityStatus: user.isOnline ? 'Şimdi aktif' : '2 saat önce',
          location: 'İstanbul, Türkiye',
          distanceKm: user.distance || Math.floor(Math.random() * 20) + 1,
          isVerified: user.isVerified || Math.random() > 0.7,
          hasInstagram: Math.random() > 0.5,
          hasSpotify: Math.random() > 0.6,
          isNewUser: user.isNewUser || false,
          profileCompleteness: '85%'
          };
        });
        
        setUsers(convertedUsers);
        setSwipeLimitInfo(response.swipeLimitInfo);
        
        // İlk yükleme - yeni kullanıcı overlay ID listesini temizle
        if (convertedUsers.length > 0) {
          // setShownNewUserIds(new Set()); // Bu satır kaldırıldı
          console.log('🆕 [FETCH] Yeni kullanıcı overlay ID listesi temizlendi');
        }
      } else {
        Alert.alert('Hata', response.message || 'Kullanıcılar yüklenemedi');
      }
    } catch (error: any) {
      console.error('Kullanıcılar getirme hatası:', error);
      
      // 403 hatası - Swipe limit doldu
      if (error?.response?.status === 403) {
        console.log('🚫 [FETCH] 403 - Swipe limiti dolmuş:', error?.response?.data?.message);
        
        // Limit bilgisini güncelle
        try {
          await fetchSwipeLimitInfo();
        } catch (limitError) {
          console.error('❌ [FETCH] Limit info güncellenemedi:', limitError);
        }
        
        // Kullanıcı listesini boşalt - limit ekranı gösterilsin
        setUsers([]);
        
        // Error alert gösterme, limit ekranı zaten gösterilecek
        return;
      }
      
      // Diğer hatalar için generic alert
      Alert.alert('Hata', 'Kullanıcılar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Kullanıcıları yenile (Yenile butonu - tam random sıralama)
  const refreshUsers = async () => {
    console.log('🔄 [REFRESH] Kullanıcıları yeniliyor (random sıralama)');
    try {
      setIsLoading(true);
      const response = await swipeApi.getDiscoverUsers(1, 10, true); // refresh=true
      
      if (response.success) {
        console.log('🎲 [REFRESH] Random sıralanmış kullanıcı sayısı:', response.users.length);
        
        // Tutorial'ı test etmek için reset et (isteğe bağlı)
        // await AsyncStorage.removeItem('astrology_tutorial_shown');
        // console.log('🔄 [REFRESH] Tutorial reset edildi (test için)');
        
        // DiscoverUser'ları SwipeUser formatına dönüştür (aynı mantık)
        const convertedUsers: SwipeUser[] = response.users.map(user => {
          const validPhotos = user.photos?.filter(p => p.imageUrl && p.imageUrl.trim() !== '') || [];
          const profileImage = user.profileImageUrl && user.profileImageUrl.trim() !== '' 
            ? user.profileImageUrl 
            : validPhotos.length > 0 
              ? validPhotos[0].imageUrl 
              : `https://picsum.photos/400/600?random=${user.id}`;
          
          return {
            id: user.id,
            username: user.firstName.toLowerCase() + user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: `${user.firstName} ${user.lastName}`,
            age: user.age,
            gender: 'UNKNOWN',
            bio: user.bio || 'Yıldızların rehberliğinde hayatımı yaşıyorum ✨',
            zodiacSign: user.zodiacSign as ZodiacSign,
            zodiacSignDisplay: user.zodiacSign,
            compatibilityScore: user.compatibilityScore,
            compatibilityMessage: user.compatibilityDescription || 'Yıldızlar sizin için mükemmel bir uyum öngörüyor! 🌟',
            profileImageUrl: profileImage,
            photos: validPhotos.map((p, index) => ({
              id: Math.random(),
              photoUrl: p.imageUrl,
              isProfilePhoto: index === 0,
              displayOrder: index + 1
            })),
            photoCount: validPhotos.length,
            isPremium: user.isPremium || false,
            lastActiveTime: new Date().toISOString(),
            activityStatus: user.isOnline ? 'Şimdi aktif' : '2 saat önce',
            location: 'İstanbul, Türkiye',
            distanceKm: user.distance || Math.floor(Math.random() * 20) + 1,
            isVerified: user.isVerified || Math.random() > 0.7,
            hasInstagram: Math.random() > 0.5,
            hasSpotify: Math.random() > 0.6,
            isNewUser: user.isNewUser || false,
            profileCompleteness: '85%'
          };
        });
        
        setUsers(convertedUsers);
        setCurrentUserIndex(0); // Index'i sıfırla
        setSwipeLimitInfo(response.swipeLimitInfo);
        
        // Yeni kullanıcı overlay'ini gösterilen ID listesini temizle
        // setShownNewUserIds(new Set()); // Bu satır kaldırıldı
        console.log('🔄 [REFRESH] Yeni kullanıcı overlay ID listesi temizlendi');
        
        console.log('✅ [REFRESH] Kullanıcılar yenilendi ve index sıfırlandı');
      } else {
        Alert.alert('Hata', response.message || 'Kullanıcılar yenilenemedi');
      }
    } catch (error: any) {
      console.error('❌ [REFRESH] Kullanıcıları yenileme hatası:', error);
      
      // 403 hatası - Swipe limit doldu
      if (error?.response?.status === 403) {
        console.log('🚫 [REFRESH] 403 - Swipe limiti dolmuş:', error?.response?.data?.message);
        
        // Limit bilgisini güncelle
        try {
          await fetchSwipeLimitInfo();
        } catch (limitError) {
          console.error('❌ [REFRESH] Limit info güncellenemedi:', limitError);
        }
        
        // Kullanıcı listesini boşalt - limit ekranı gösterilsin
        setUsers([]);
        
        // Error alert gösterme, limit ekranı zaten gösterilecek
        return;
      }
      
      // Diğer hatalar için generic alert
      Alert.alert('Hata', 'Kullanıcılar yenilenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Swipe limit bilgisi getir
  const fetchSwipeLimitInfo = async () => {
    try {
      console.log('🔄 [LIMIT] Swipe limit bilgisi getiriliyor...');
      const limitInfo = await swipeApi.getSwipeLimitInfo();
      console.log('✅ [LIMIT] Swipe limit bilgisi:', {
        isPremium: limitInfo.isPremium,
        remainingSwipes: limitInfo.remainingSwipes,
        dailySwipeCount: limitInfo.dailySwipeCount,
        canSwipe: limitInfo.canSwipe,
        hasResetInfo: !!limitInfo.resetInfo
      });
      
      setSwipeLimitInfo(limitInfo);
      
      // Limit dolmuşsa kullanıcıyı bilgilendir
      if (!limitInfo.canSwipe && limitInfo.resetInfo) {
        console.log('⚠️ [LIMIT] Swipe limiti dolmuş:', limitInfo.resetInfo.resetMessage);
      }
      
    } catch (error) {
      console.error('❌ [LIMIT] Swipe limit bilgisi hatası:', error);
    }
  };

  // Premium sayfasına yönlendir
  const navigateToPremium = () => {
    console.log('🎖️ [PREMIUM] Premium sayfasına yönlendiriliyor');
    router.push('/(profile)/premiumScreen');
  };

  // Swipe işlemi
  const performSwipe = async (toUserId: number, action: 'LIKE' | 'DISLIKE' | 'SUPER_LIKE') => {
    try {
      // Swipe limit kontrolü
      if (swipeLimitInfo && !swipeLimitInfo.canSwipe && !swipeLimitInfo.isPremium) {
        console.log('🚫 [SWIPE] Swipe limiti dolmuş, işlem iptal ediliyor');
        Alert.alert(
          '⏰ Günlük Limit Doldu',
          swipeLimitInfo.resetInfo?.resetMessage || 'Günlük swipe limitiniz dolmuş',
          [
            { text: 'Tamam', style: 'default' },
            { text: 'Premium Ol', style: 'default', onPress: navigateToPremium }
          ]
        );
        return; // Swipe işlemini iptal et
      }
      
      setIsSwipeInProgress(true);
      
      const response = await swipeApi.swipe({
        toUserId,
        action: action === 'SUPER_LIKE' ? 'LIKE' : action
      });

      if (response.success) {
        console.log('✅ [SWIPE] Swipe response:', {
          action: action,
          success: response.success,
          isMatch: response.isMatch,
          status: response.status,
          matchId: response.matchId,
          remainingSwipes: response.remainingSwipes,
          message: response.message
        });
        
        // Match kontrolü: hem isMatch hem de status MATCHED olmalı
        const isMatched = response.isMatch && response.status === 'MATCHED';
        
        console.log('🔍 [MATCH] Match kontrol sonucu:', {
          isMatched: isMatched,
          responseIsMatch: response.isMatch,
          responseStatus: response.status,
          willShowMatchScreen: isMatched
        });
        
        if (isMatched) {
          // Eşleşme var!
          console.log('🎉 [MATCH] Eşleşme bulundu!', {
            matchId: response.matchId,
            message: response.message,
            remainingSwipes: response.remainingSwipes
          });
          
          // Match screen'i göster
          console.log('🎯 [MATCH] Match screen açılıyor...', {
            currentUserIndex: currentUserIndex,
            hasMatchedUser: !!users[currentUserIndex],
            hasUserProfile: !!userProfile,
            userProfileId: userProfile?.id,
            matchedUserId: users[currentUserIndex]?.id
          });
          
          setShowMatchScreen(true);
          setMatchedUserData(users[currentUserIndex]);
          setMatchResponse(response);
          
          console.log('✅ [MATCH] Match screen state güncellendi');
          
          // Match animasyonu (opsiyonel)
          showMatchAnimation();
          
          // Match mesajını göster
          console.log('💌 [MATCH] Mesaj:', response.message);
          
        } else if (response.status === 'LIKED') {
          // Beğenildi ama henüz karşılık yok
          console.log('💖 [LIKE] Kullanıcı beğenildi, karşılık bekleniyor');
          
        } else if (response.status === 'DISLIKED') {
          // Beğenilmedi
          console.log('❌ [DISLIKE] Kullanıcı beğenilmedi');
        }
        
        // Kalan swipe hakkını göster ve resetInfo kontrol et
        if (response.remainingSwipes !== undefined) {
          console.log(`📊 [SWIPE] Kalan swipe hakkı: ${response.remainingSwipes}`);
          
          // Limit dolmuşsa özel mesaj göster
          if (response.remainingSwipes === 0 && response.resetInfo) {
            console.log('⏰ [SWIPE] Limit doldu, reset bilgisi:', response.resetInfo.resetMessage);
            // Büyük alert göster
            Alert.alert(
              '⏰ Günlük Limit Doldu', 
              response.resetInfo.resetMessage + '\n\nPremium üyelik ile sınırsız swipe yapabilirsiniz!',
              [
                { text: 'Tamam', style: 'default' },
                { text: 'Premium Ol', style: 'default', onPress: navigateToPremium }
              ]
            );
          }
        }
        
        // Swipe limit bilgisini güncelle
        await fetchSwipeLimitInfo();
        
        // Sonraki kullanıcıya geç
        nextUser();
      } else {
        // API başarısız yanıt döndü - sadece error toast göster
        console.log('❌ [API] Swipe başarısız:', response.message);
        
        // Tüm başarısız durumlar için toast göster ve geç
        showErrorToast(response.message || 'İşlem başarısız, sonraki profil gösteriliyor');
        setTimeout(() => {
          nextUser(); // Kullanıcıyı geç
        }, 1000);
      }
    } catch (error: any) {
      console.error('❌ [API] swipe hatası:', error?.response?.data || error?.message || error);
      
      // Ağ hatası, sunucu hatası vs. - sadece küçük toast göster ve geç
      const errorMessage = error?.response?.data?.message || 'Bağlantı sorunu, sonraki profil gösteriliyor';
      showErrorToast(errorMessage);
      
      // 1 saniye sonra sonraki kullanıcıya geç
      setTimeout(() => {
        nextUser();
      }, 1000);
    } finally {
      setIsSwipeInProgress(false);
    }
  };

  // Sonraki kullanıcıya geç
  const nextUser = () => {
    setCurrentUserIndex(prev => prev + 1);
    setCurrentPhotoIndex(0);
    resetAnimations();
    
    // Yeni kullanıcı overlay'ini kapat
    if (showNewUserOverlay) {
      setShowNewUserOverlay(false);
      console.log('🆕 [NEW_USER] Overlay otomatik kapatıldı - swipe yapıldı');
    }
    
    // Son 2 kullanıcı kaldığında yeni kullanıcılar getir
    if (currentUserIndex >= users.length - 2) {
      fetchUsers();
    }
  };

  // Animasyonları sıfırla
  const resetAnimations = () => {
    'worklet';
    try {
      console.log('resetAnimations çağrıldı');
      translateX.value = withSpring(0, { 
        damping: 20, 
        stiffness: 200,
        mass: 1,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1
      });
      rotate.value = withSpring(0, { 
        damping: 20, 
        stiffness: 200,
        mass: 1,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1
      });
      scale.value = withSpring(1, { 
        damping: 20, 
        stiffness: 200,
        mass: 1,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1
      });
      likeOpacity.value = withSpring(0, { 
        damping: 20, 
        stiffness: 200,
        mass: 1,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1
      });
      dislikeOpacity.value = withSpring(0, { 
        damping: 20, 
        stiffness: 200,
        mass: 1,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1
      });
      console.log('Reset animations başarılı');
    } catch (error) {
      console.error('Reset animations hatası:', error);
    }
  };

  // Eşleşme animasyonu
  const showMatchAnimation = () => {
    scale.value = withSpring(1.1, { damping: 15 }, () => {
      scale.value = withSpring(1);
    });
  };

  // Gesture handler
  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(0.95);
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      // translateY.value = event.translationY; // Yukarı aşağı hareket kaldırıldı
      
      // Rotasyon hesapla
      rotate.value = interpolate(
        event.translationX,
        [-width / 2, 0, width / 2],
        [-15, 0, 15]
      );

      // Like/Dislike opacity
      if (event.translationX > 0) {
        likeOpacity.value = interpolate(
          event.translationX,
          [0, width * 0.3],
          [0, 1]
        );
        dislikeOpacity.value = 0;
      } else {
        dislikeOpacity.value = interpolate(
          event.translationX,
          [-width * 0.3, 0],
          [1, 0]
        );
        likeOpacity.value = 0;
      }
    },
    onEnd: (event) => {
      const threshold = width * 0.75; // Threshold %75'e çıkarıldı - daha kesin swipe gerekli
      const velocityThreshold = 1000; // Velocity threshold artırıldı - daha hızlı swipe gerekli
      
      // Debug log
      console.log('Swipe end:', {
        translationX: event.translationX,
        velocityX: event.velocityX,
        threshold,
        velocityThreshold,
        willTrigger: Math.abs(event.translationX) > threshold || Math.abs(event.velocityX) > velocityThreshold
      });
      
      // Sadece kesin swipe hareketlerini kabul et
      const isDistanceSwipe = Math.abs(event.translationX) > threshold;
      const isVelocitySwipe = Math.abs(event.velocityX) > velocityThreshold;
      const shouldSwipe = isDistanceSwipe || isVelocitySwipe;
      
      if (shouldSwipe && event.translationX > 0) {
        // LIKE - Sağa kaydırma
        console.log('LIKE tetiklendi');
        translateX.value = withTiming(width * 1.5, { duration: 300 });
        rotate.value = withTiming(30, { duration: 300 });
        scale.value = withTiming(0.8, { duration: 300 });
        
        // Güvenli swipe çağrısı
        if (users[currentUserIndex]?.id) {
          runOnJS(performSwipe)(users[currentUserIndex].id, 'LIKE');
        }
      } else if (shouldSwipe && event.translationX < 0) {
        // DISLIKE - Sola kaydırma
        console.log('DISLIKE tetiklendi');
        translateX.value = withTiming(-width * 1.5, { duration: 300 });
        rotate.value = withTiming(-30, { duration: 300 });
        scale.value = withTiming(0.8, { duration: 300 });
        
        // Güvenli swipe çağrısı
        if (users[currentUserIndex]?.id) {
          runOnJS(performSwipe)(users[currentUserIndex].id, 'DISLIKE');
        }
      } else {
        // Geri dön - card eski pozisyonuna döner
        console.log('Card geri dönüyor... translationX:', event.translationX, 'threshold:', threshold);
        console.log('Reset işlemi başlatılıyor...');
        
        // Önce animate et, sonra reset fonksiyonunu çağır
        translateX.value = withSpring(0, { 
          damping: 20, 
          stiffness: 200,
          mass: 1
        });
        rotate.value = withSpring(0, { 
          damping: 20, 
          stiffness: 200,
          mass: 1
        });
        scale.value = withSpring(1, { 
          damping: 20, 
          stiffness: 200,
          mass: 1
        });
        likeOpacity.value = withSpring(0, { 
          damping: 20, 
          stiffness: 200,
          mass: 1
        });
        dislikeOpacity.value = withSpring(0, { 
          damping: 20, 
          stiffness: 200,
          mass: 1
        });
        
        console.log('Reset animasyonları tamamlandı');
      }
    },
  });

  // Animated styles
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      // translateY kaldırıldı - sadece yatay hareket
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
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
      fetchUsers();
      fetchSwipeLimitInfo();
    }, [])
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

    // Sadece kullanıcılar yüklendikten sonra tutorial'ı kontrol et
    if (users.length > 0 && !isLoading) {
      checkTutorialStatus();
    }
  }, [users, isLoading]);

  // Mevcut kullanıcı
  const currentUser = users[currentUserIndex];
  const zodiacInfo = currentUser ? getZodiacInfo(currentUser.zodiacSign) : null;
  const astrologyDetails = currentUser ? ASTROLOGY_DETAILS[currentUser.zodiacSign] : null;

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

  // Swipe limit doldu
  if (swipeLimitInfo && !swipeLimitInfo.canSwipe && !swipeLimitInfo.isPremium) {
    return (
      <View style={styles.emptyContainer}>
        <LinearGradient colors={astrologyTheme.gradient as any} style={styles.background} />
        <Text style={styles.emptyTitle}>⏰ Günlük Limit Doldu</Text>
        <Text style={styles.emptySubtitle}>
          {swipeLimitInfo.resetInfo?.resetMessage || 'Günlük swipe limitiniz dolmuş'}
        </Text>
        <Text style={styles.limitStatsText}>
          Bugün {swipeLimitInfo.dailySwipeCount} swipe yaptınız
        </Text>
        <TouchableOpacity style={styles.premiumButton} onPress={navigateToPremium}>
          <Text style={styles.premiumButtonText}>⭐ Premium Ol - Sınırsız Swipe</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.refreshButtonOld} onPress={fetchSwipeLimitInfo}>
          <Ionicons 
            name="refresh" 
            size={16} 
            color="white"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.refreshButtonText}>Durumu Kontrol Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Kullanıcı kalmadı
  if (!currentUser) {
    return (
      <View style={styles.emptyContainer}>
        <LinearGradient colors={astrologyTheme.gradient as any} style={styles.background} />
        <Text style={styles.emptyTitle}>🌟 Yıldızlar Tükendi</Text>
        <Text style={styles.emptySubtitle}>
          Şu an için gösterilecek yeni profil yok. Biraz sonra tekrar deneyin!
        </Text>
        <TouchableOpacity style={styles.refreshButtonOld} onPress={fetchUsers}>
          <Ionicons 
            name="refresh" 
            size={16} 
            color="white"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.refreshButtonText}>Yenile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Arka plan */}
      <LinearGradient colors={astrologyTheme.gradient as any} style={styles.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✨ Astroloji Eşleşme</Text>
      </View>

      {/* Kart Stack */}
      <View style={styles.cardStack}>
        {/* Alt kart (sonraki kullanıcı) */}
        {users[currentUserIndex + 1] && (
          <View style={[styles.card, styles.cardBehind]}>
            <Image
              source={{ uri: users[currentUserIndex + 1].profileImageUrl }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Ana kart */}
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.card, cardStyle]}>
            {/* Like/Dislike Overlays */}
            <Animated.View style={[styles.likeOverlay, likeStyle]}>
              <Text style={styles.likeText}>BEĞEN</Text>
            </Animated.View>

            <Animated.View style={[styles.dislikeOverlay, dislikeStyle]}>
              <Text style={styles.dislikeText}>GEÇE</Text>
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
                    uri: currentUser.profileImageUrl || `https://picsum.photos/400/600?random=${currentUser.id}` 
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
                        {currentUser.fullName}, {currentUser.age}
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
        </PanGestureHandler>
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
              • Sağa: Beğen ❤️ • Sola: Geç ❌
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

      {/* Error Toast */}
      {errorToast.show && (
        <View style={styles.errorToast}>
          <Text style={styles.errorToastText}>⚠️ {errorToast.message}</Text>
        </View>
      )}

      {/* Match Screen */}
      {showMatchScreen && matchedUserData && userProfile && (
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
            profileImageUrl: matchedUserData.profileImageUrl,
            zodiacSign: matchedUserData.zodiacSign
          }}
          onClose={() => {
            console.log('🔴 [MATCH] Match screen kapatılıyor');
            try {
              setShowMatchScreen(false);
              setMatchedUserData(null);
              setMatchResponse(null);
              console.log('✅ [MATCH] Match screen başarıyla kapatıldı');
            } catch (error) {
              console.error('❌ [MATCH] Match screen kapatma hatası:', error);
              // Fallback: Force close
              setShowMatchScreen(false);
            }
          }}
          onStartChat={() => {
            console.log('💬 [MATCH] Sohbet başlatılıyor');
            try {
              setShowMatchScreen(false);
              setMatchedUserData(null);
              setMatchResponse(null);
              
              // Chat ekranına yönlendir
              router.push('/chat' as any);
              
              console.log('✅ [MATCH] Chat ekranına yönlendirildi');
            } catch (error) {
              console.error('❌ [MATCH] Sohbet başlatma hatası:', error);
              // Fallback: Force close
              setShowMatchScreen(false);
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 10,
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
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 30,
  },
  refreshButtonOld: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8000FF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
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
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },

  cardStack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: 'white',
    marginTop: -100, // Card'ı yukarı taşır
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
    position: 'relative',
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
    top: 50,
    left: 30,
    backgroundColor: 'rgba(0,255,127,0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    transform: [{ rotate: '-20deg' }],
  },
  likeText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dislikeOverlay: {
    position: 'absolute',
    top: 50,
    right: 30,
    backgroundColor: 'rgba(255,71,87,0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    transform: [{ rotate: '20deg' }],
  },
  dislikeText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
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
  overlayContent: {
    backgroundColor: 'white',
    margin: 40,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
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
}); 