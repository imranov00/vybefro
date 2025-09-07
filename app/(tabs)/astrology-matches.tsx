import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { swipeApi } from '../services/api';
import { getZodiacInfo, ZodiacSign } from '../types/zodiac';
import { getDailyZodiacCommentByString } from '../types/zodiacDailyComments';

const { width, height } = Dimensions.get('window');

// Burç özellikleri bilgi fonksiyonları
const getElementInfo = (element: string) => {
  const elements = {
    'Ateş': {
      emoji: '🔥',
      name: 'Ateş',
      description: 'Enerjik, tutkulu ve liderlik özelliklerine sahip',
      signs: ['Koç', 'Aslan', 'Yay'],
      traits: ['Enerjik', 'Tutkulu', 'Lider', 'Cesur', 'Bağımsız'],
      compatibility: 'Ateş burçları ile hava burçları uyumlu, su burçları ile çelişkili'
    },
    'Su': {
      emoji: '💧',
      name: 'Su',
      description: 'Duygusal, sezgisel ve empatik',
      signs: ['Yengeç', 'Akrep', 'Balık'],
      traits: ['Duygusal', 'Sezgisel', 'Empatik', 'Yaratıcı', 'Mystik'],
      compatibility: 'Su burçları ile toprak burçları uyumlu, ateş burçları ile çelişkili'
    },
    'Hava': {
      emoji: '💨',
      name: 'Hava',
      description: 'Zihinsel, sosyal ve iletişim odaklı',
      signs: ['İkizler', 'Terazi', 'Kova'],
      traits: ['Zihinsel', 'Sosyal', 'İletişimci', 'Mantıklı', 'Değişken'],
      compatibility: 'Hava burçları ile ateş burçları uyumlu, toprak burçları ile çelişkili'
    },
    'Toprak': {
      emoji: '🌍',
      name: 'Toprak',
      description: 'Pratik, güvenilir ve materyalist',
      signs: ['Boğa', 'Başak', 'Oğlak'],
      traits: ['Pratik', 'Güvenilir', 'Materyalist', 'Sabırlı', 'Kararlı'],
      compatibility: 'Toprak burçları ile su burçları uyumlu, hava burçları ile çelişkili'
    }
  };
  return elements[element as keyof typeof elements] || elements['Ateş'];
};

const getPlanetInfo = (planet: string) => {
  const planets = {
    'Mars': { emoji: '🔴', name: 'Mars', description: 'Savaş ve enerji gezegeni', influence: 'Cesaret, rekabet, cinsellik, güç' },
    'Venüs': { emoji: '💚', name: 'Venüs', description: 'Aşk ve güzellik gezegeni', influence: 'Aşk, sanat, uyum, estetik' },
    'Merkür': { emoji: '☿️', name: 'Merkür', description: 'İletişim gezegeni', influence: 'İletişim, zeka, ticaret, öğrenme' },
    'Ay': { emoji: '🌙', name: 'Ay', description: 'Duygular ve sezgiler gezegeni', influence: 'Duygular, sezgiler, anne, içgüdü' },
    'Güneş': { emoji: '☀️', name: 'Güneş', description: 'Ego ve kimlik gezegeni', influence: 'Ego, kimlik, yaratıcılık, liderlik' },
    'Jüpiter': { emoji: '🟡', name: 'Jüpiter', description: 'Büyüme ve şans gezegeni', influence: 'Büyüme, şans, felsefe, genişleme' },
    'Satürn': { emoji: '🪐', name: 'Satürn', description: 'Disiplin ve sınırlar gezegeni', influence: 'Disiplin, sınırlar, sorumluluk, olgunluk' },
    'Uranüs': { emoji: '🔵', name: 'Uranüs', description: 'Değişim ve özgürlük gezegeni', influence: 'Değişim, özgürlük, yenilik, isyan' },
    'Neptün': { emoji: '🔮', name: 'Neptün', description: 'Hayaller ve ilham gezegeni', influence: 'Hayaller, ilham, mistisizm, sezgiler' },
    'Plüton': { emoji: '🖤', name: 'Plüton', description: 'Dönüşüm ve güç gezegeni', influence: 'Dönüşüm, güç, yeniden doğuş, gizem' }
  };
  return planets[planet as keyof typeof planets] || planets['Mars'];
};

const getQualityInfo = (quality: string) => {
  const qualities = {
    'Öncü': {
      emoji: '🚀',
      name: 'Öncü',
      description: 'Yeni başlangıçlar ve liderlik kalitesi',
      traits: ['Lider', 'Başlatıcı', 'Enerjik', 'Cesur', 'Pioner'],
      meaning: 'Yeni dönemler başlatır, öncülük eder ve değişimi tetikler',
      positive: ['Liderlik yeteneği', 'Yenilikçi düşünce', 'Girişimcilik', 'Cesaret', 'Enerji'],
      negative: ['Sabırsızlık', 'Acelecilik', 'Detayları gözden kaçırma', 'İnatçılık', 'Dominant olma'],
      advice: 'Sabırlı olmayı öğrenin ve detaylara dikkat edin. Başkalarının fikirlerini de dinleyin.',
      compatibility: 'Öncü burçlar birbirleriyle güçlü rekabet yaşayabilir, ancak birlikte büyük işler başarabilirler.'
    },
    'Sabit': {
      emoji: '⚖️',
      name: 'Sabit',
      description: 'Kararlılık ve süreklilik kalitesi',
      traits: ['Kararlı', 'Güvenilir', 'Sabırlı', 'İnatçı', 'Sürekli'],
      meaning: 'Kararlılık gösterir, süreklilik sağlar ve değişime direnir',
      positive: ['Güvenilirlik', 'Sabır', 'Kararlılık', 'Süreklilik', 'Derinlik'],
      negative: ['İnatçılık', 'Değişime direnç', 'Esneklik eksikliği', 'Rutin takıntısı', 'Yavaşlık'],
      advice: 'Değişime daha açık olun ve yeni deneyimlere kapı açın. Esneklik geliştirin.',
      compatibility: 'Sabit burçlar birbirleriyle uyumlu olabilir, ancak değişken burçlarla denge sağlayabilirler.'
    },
    'Değişken': {
      emoji: '🔄',
      name: 'Değişken',
      description: 'Uyum ve değişim kalitesi',
      traits: ['Uyumlu', 'Değişken', 'Esnek', 'Çok yönlü', 'Adaptif'],
      meaning: 'Değişime uyum sağlar, esneklik gösterir ve çok yönlü düşünür',
      positive: ['Esneklik', 'Uyum sağlama', 'Çok yönlülük', 'Adaptasyon', 'Merak'],
      negative: ['Kararsızlık', 'Tutarsızlık', 'Odaklanma sorunu', 'Süreklilik eksikliği', 'Belirsizlik'],
      advice: 'Kararlılık geliştirin ve hedeflerinize odaklanın. Süreklilik sağlamayı öğrenin.',
      compatibility: 'Değişken burçlar herkesle uyum sağlayabilir, ancak sabit burçlarla denge kurmalıdırlar.'
    }
  };
  return qualities[quality as keyof typeof qualities] || qualities['Sabit'];
};

const getPolarityInfo = (polarity: string) => {
  const polarities = {
    'Pozitif': {
      emoji: '➕',
      name: 'Pozitif',
      description: 'Dışa dönük ve aktif enerji polaritesi',
      traits: ['Dışa dönük', 'Aktif', 'Sosyal', 'Enerjik', 'Açık'],
      meaning: 'Dış dünyaya odaklanır, aktif enerji yayar ve sosyal etkileşimi sever',
      positive: ['Sosyallik', 'Enerji', 'Açıklık', 'Liderlik', 'Girişkenlik'],
      negative: ['Yüzeysellik', 'Sabırsızlık', 'Dikkat dağınıklığı', 'Dominant olma', 'Dinleme eksikliği'],
      advice: 'Derinlemesine düşünmeyi öğrenin ve başkalarını dinlemeye zaman ayırın.',
      compatibility: 'Pozitif polarite burçları birbirleriyle enerjik ilişkiler kurabilir, ancak rekabet yaşayabilirler.'
    },
    'Negatif': {
      emoji: '➖',
      name: 'Negatif',
      description: 'İçe dönük ve pasif enerji polaritesi',
      traits: ['İçe dönük', 'Pasif', 'Derin', 'Sezgisel', 'Analitik'],
      meaning: 'İç dünyaya odaklanır, derinlemesine düşünür ve sezgisel yaklaşım sergiler',
      positive: ['Derinlik', 'Sezgiler', 'Analitik düşünce', 'Sabır', 'İçgörü'],
      negative: ['İçe kapanıklık', 'Pasiflik', 'Sosyal zorluk', 'Kararsızlık', 'İletişim eksikliği'],
      advice: 'Sosyal becerilerinizi geliştirin ve dış dünyayla daha fazla etkileşim kurun.',
      compatibility: 'Negatif polarite burçları birbirleriyle derin bağlar kurabilir, ancak pozitif burçlarla denge sağlamalıdırlar.'
    }
  };
  return polarities[polarity as keyof typeof polarities] || polarities['Pozitif'];
};

// Gerçekçi burç uyumluluğu hesaplama
const calculateRealisticCompatibility = (userZodiac: string, targetZodiac: string) => {
  const zodiacSigns = {
    'Koç': { element: 'Ateş', quality: 'Öncü', polarity: 'Pozitif' },
    'Boğa': { element: 'Toprak', quality: 'Sabit', polarity: 'Negatif' },
    'İkizler': { element: 'Hava', quality: 'Değişken', polarity: 'Pozitif' },
    'Yengeç': { element: 'Su', quality: 'Öncü', polarity: 'Negatif' },
    'Aslan': { element: 'Ateş', quality: 'Sabit', polarity: 'Pozitif' },
    'Başak': { element: 'Toprak', quality: 'Değişken', polarity: 'Negatif' },
    'Terazi': { element: 'Hava', quality: 'Öncü', polarity: 'Pozitif' },
    'Akrep': { element: 'Su', quality: 'Sabit', polarity: 'Negatif' },
    'Yay': { element: 'Ateş', quality: 'Değişken', polarity: 'Pozitif' },
    'Oğlak': { element: 'Toprak', quality: 'Öncü', polarity: 'Negatif' },
    'Kova': { element: 'Hava', quality: 'Sabit', polarity: 'Pozitif' },
    'Balık': { element: 'Su', quality: 'Değişken', polarity: 'Negatif' }
  };

  const userSign = zodiacSigns[userZodiac as keyof typeof zodiacSigns];
  const targetSign = zodiacSigns[targetZodiac as keyof typeof zodiacSigns];

  if (!userSign || !targetSign) return { score: 50, analysis: 'Burç bilgisi bulunamadı' };

  let score = 50; // Başlangıç skoru
  let analysis = '';

  // Element uyumluluğu (en önemli faktör)
  if (userSign.element === targetSign.element) {
    score += 25; // Aynı element
    analysis += 'Aynı element grubundasınız, güçlü bir bağ var. ';
  } else if (
    (userSign.element === 'Ateş' && targetSign.element === 'Hava') ||
    (userSign.element === 'Hava' && targetSign.element === 'Ateş') ||
    (userSign.element === 'Su' && targetSign.element === 'Toprak') ||
    (userSign.element === 'Toprak' && targetSign.element === 'Su')
  ) {
    score += 20; // Uyumlu elementler
    analysis += 'Uyumlu element gruplarındasınız, dengeli bir ilişki kurabilirsiniz. ';
  } else {
    score -= 10; // Çelişkili elementler
    analysis += 'Farklı element gruplarındasınız, çelişkiler yaşayabilirsiniz. ';
  }

  // Kalite uyumluluğu
  if (userSign.quality === targetSign.quality) {
    score += 15;
    analysis += 'Aynı kalite grubundasınız, benzer yaklaşımlarınız var. ';
  } else if (
    (userSign.quality === 'Öncü' && targetSign.quality === 'Sabit') ||
    (userSign.quality === 'Sabit' && targetSign.quality === 'Öncü')
  ) {
    score += 10;
    analysis += 'Farklı kalite gruplarındasınız, birbirinizi tamamlayabilirsiniz. ';
  } else {
    score += 5;
    analysis += 'Farklı kalite gruplarındasınız, öğrenme fırsatı var. ';
  }

  // Polarite uyumluluğu
  if (userSign.polarity === targetSign.polarity) {
    score += 10;
    analysis += 'Aynı polarite grubundasınız, benzer enerji seviyeleriniz var. ';
  } else {
    score += 5;
    analysis += 'Farklı polarite gruplarındasınız, denge sağlayabilirsiniz. ';
  }

  // Skoru 0-100 arasında sınırla
  score = Math.max(0, Math.min(100, score));

  return { score, analysis };
};

const getCompatibilityInfo = (score: number, userZodiac?: string, targetZodiac?: string) => {
  // Gerçekçi uyumluluk hesapla
  let realisticScore = score;
  let realisticAnalysis = '';
  
  if (userZodiac && targetZodiac) {
    const realistic = calculateRealisticCompatibility(userZodiac, targetZodiac);
    realisticScore = realistic.score;
    realisticAnalysis = realistic.analysis;
  }

  if (realisticScore >= 80) {
    return {
      level: 'Mükemmel Uyum',
      emoji: '💕',
      color: '#00D4AA',
      description: 'İnanılmaz bir uyum! Bu ilişki çok güçlü temellere sahip.',
      traits: ['Derin bağ', 'Güçlü iletişim', 'Karşılıklı anlayış', 'Uzun vadeli potansiyel'],
      negativeTraits: ['Aşırı bağımlılık riski', 'Rekabet duyguları', 'Rutin takıntısı'],
      advice: 'Bu özel bağı korumak için birlikte büyümeye odaklanın. Bireysellik alanlarınızı koruyun.',
      analysis: realisticAnalysis
    };
  } else if (realisticScore >= 60) {
    return {
      level: 'Yüksek Uyum',
      emoji: '💖',
      color: '#FFB347',
      description: 'Güçlü bir uyum var. Birlikte güzel anlar yaşayabilirsiniz.',
      traits: ['İyi iletişim', 'Ortak ilgi alanları', 'Karşılıklı saygı', 'Pozitif enerji'],
      negativeTraits: ['Bazı çelişkiler', 'Farklı beklentiler', 'Uyum sağlama zorluğu'],
      advice: 'İlişkinizi güçlendirmek için ortak aktiviteler yapın. Farklılıkları kabul edin.',
      analysis: realisticAnalysis
    };
  } else if (realisticScore >= 40) {
    return {
      level: 'Orta Uyum',
      emoji: '💛',
      color: '#FFB347',
      description: 'Orta düzeyde bir uyum var. Çaba ile geliştirilebilir.',
      traits: ['Bazı ortak noktalar', 'Farklılıklar', 'Öğrenme fırsatı', 'Büyüme potansiyeli'],
      negativeTraits: ['Sık çelişkiler', 'İletişim zorlukları', 'Farklı değerler', 'Uyum sağlama zorluğu'],
      advice: 'Farklılıkları zenginlik olarak görün ve birbirinizden öğrenin. Sabırlı olun.',
      analysis: realisticAnalysis
    };
  } else {
    return {
      level: 'Düşük Uyum',
      emoji: '💔',
      color: '#FF6B9D',
      description: 'Zorlu bir uyum. Ama imkansız değil!',
      traits: ['Farklı yaklaşımlar', 'Öğrenme fırsatı', 'Büyüme zorluğu', 'Sabır gerektirir'],
      negativeTraits: ['Sürekli çelişkiler', 'İletişim kopukluğu', 'Farklı yaşam tarzları', 'Uyumsuzluk'],
      advice: 'Sabırlı olun ve birbirinizin farklılıklarını kabul edin. Profesyonel yardım almayı düşünün.',
      analysis: realisticAnalysis
    };
  }
};

// API Response Types - Backend'den gelen veri yapısı
interface DiscoverUserDTO {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate: string;
  age: number;
  gender: string;
  bio: string;
  zodiacSign: string;
  zodiacSignDisplay: string;
  compatibilityScore: number;
  compatibilityMessage: string;
  profileImageUrl: string;
  photos: UserPhotoDTO[];
  photoCount: number;
  isPremium: boolean;
  lastActiveTime: string;
  activityStatus: string;
  location: string;
  activities: UserActivityDTO[];
  isVerified: boolean;
  isNewUser: boolean;
  hasLikedCurrentUser: boolean;
  profileCompleteness: string;
}

interface UserPhotoDTO {
  id: number;
  imageUrl: string;
  isProfilePhoto: boolean;
  uploadedAt: string;
  displayOrder: number;
}

interface UserActivityDTO {
  id: number;
  activityType: string;
  details: string;
  activityDate: string;
}

interface SwipeResponse {
  success: boolean;
  isMatch: boolean;
  status: string;
  matchId?: number;
  message: string;
  remainingSwipes: number;
  resetInfo?: any;
}

interface SwipeLimitInfo {
  isPremium: boolean;
  remainingSwipes: number;
  dailySwipeCount: number;
  canSwipe: boolean;
  resetInfo?: any;
}

interface DiscoverResponse {
  success: boolean;
  user: DiscoverUserDTO | null;
  hasMoreUsers: boolean;
  refresh: boolean;
  showLikedMe: boolean;
  totalRemainingUsers: number;
  cooldownInfo: any;
  swipeLimitInfo: SwipeLimitInfo;
  code?: string; // Swipe limit exceeded durumu için
}

export default function AstrologyMatchesScreen() {
  const router = useRouter();
  const { isPremium } = useAuth();
  const { userProfile } = useProfile();
  
  // 15'li batch sistemi için state'ler
  const [userBatch, setUserBatch] = useState<DiscoverUserDTO[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwipeInProgress, setIsSwipeInProgress] = useState(false);
  const [swipeLimitInfo, setSwipeLimitInfo] = useState<SwipeLimitInfo | null>(null);
  const [showLimitOverlay, setShowLimitOverlay] = useState(false);
  const [showMatchScreen, setShowMatchScreen] = useState(false);
  const [matchedUser, setMatchedUser] = useState<DiscoverUserDTO | null>(null);
  const [showZodiacModal, setShowZodiacModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showCompatibilityModal, setShowCompatibilityModal] = useState(false);
  const [showPhotoGalleryModal, setShowPhotoGalleryModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string>('');
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [cooldownInfo, setCooldownInfo] = useState<any>(null);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [seenUsers, setSeenUsers] = useState<Set<number>>(new Set());
  const [isPreloading, setIsPreloading] = useState(false);

  // Swipe animasyonları için
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  

  // Swipe limit bilgilerini getir
  const fetchSwipeLimitInfo = useCallback(async () => {
    try {
      const data = await swipeApi.getSwipeLimitInfo();
      setSwipeLimitInfo(data);
      
      // Premium kullanıcılar için swipe limit kontrolü yapma
      if (!data.canSwipe && !data.isPremium) {
        setShowLimitOverlay(true);
      }
    } catch (error) {
      console.error('Swipe limit bilgisi alınamadı:', error);
    }
  }, []);

  // 15'li batch yükleme fonksiyonu
  const loadUserBatch = useCallback(async (refresh: boolean = false) => {
    try {
      setIsLoading(true);
      console.log('🔄 [BATCH] 15 kullanıcılı batch yükleniyor...');
      
      const data = await swipeApi.getDiscoverUsers(refresh, false, 1, 15);
      
      if (data.success && data.users && data.users.length > 0) {
        // Duplicate kullanıcıları filtrele
        const filteredUsers = data.users.filter(user => !seenUsers.has(user.id));
        
        if (filteredUsers.length > 0) {
          // Kullanıcıları batch formatına dönüştür
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
          setCurrentIndex(0);
          setHasMoreUsers(data.hasMoreUsers || false);
          
          console.log(`✅ [BATCH] ${batchUsers.length} kullanıcı yüklendi`);
        } else {
          console.log('⚠️ [BATCH] Tüm kullanıcılar daha önce görülmüş, yeni batch gerekli');
          // Tüm kullanıcılar duplicate ise yeni batch getir
          if (data.hasMoreUsers) {
            await loadUserBatch(true); // Refresh ile yeni batch
            return;
          }
        }
        
        if (data.swipeLimitInfo) {
          setSwipeLimitInfo(data.swipeLimitInfo);
          // Premium kullanıcılar için swipe limit kontrolü yapma
          if (!data.swipeLimitInfo.canSwipe && !data.swipeLimitInfo.isPremium) {
            setShowLimitOverlay(true);
          }
        }
        
        if (data.cooldownInfo) {
          setCooldownInfo(data.cooldownInfo);
        }
      } else {
        setUserBatch([]);
        setHasMoreUsers(false);
        if (data.swipeLimitInfo && !data.swipeLimitInfo.canSwipe && !data.swipeLimitInfo.isPremium) {
          setShowLimitOverlay(true);
        }
      }
    } catch (error) {
      console.error('❌ [BATCH] Batch yükleme hatası:', error);
      Alert.alert('Hata', 'Kullanıcılar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [seenUsers]);

  // Mevcut kullanıcıyı al
  const currentUser = userBatch[currentIndex] || null;

  // Sıradaki kullanıcıya geç
  const showNextUser = useCallback(() => {
    if (currentIndex < userBatch.length - 1) {
      // Batch içinde sıradaki kullanıcı
      setCurrentIndex(currentIndex + 1);
      
      // Preloading: Son 3 kullanıcı kaldığında yeni batch'i önceden yükle
      if (currentIndex >= userBatch.length - 3 && hasMoreUsers && !isPreloading) {
        preloadNextBatch();
      }
    } else if (hasMoreUsers) {
      // Batch bitti, yeni batch getir
      loadNextBatch();
    } else {
      // Tüm kullanıcılar bitti
      setUserBatch([]);
      setCurrentIndex(0);
    }
  }, [currentIndex, userBatch.length, hasMoreUsers, isPreloading]);

  // Yeni batch getir
  const loadNextBatch = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔄 [BATCH] Yeni batch yükleniyor...');
      
      const data = await swipeApi.getDiscoverUsers(false, false, 1, 15);
      
      if (data.success && data.users && data.users.length > 0) {
        // Duplicate kullanıcıları filtrele
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
          setCurrentIndex(0);
          setHasMoreUsers(data.hasMoreUsers || false);
          
          console.log(`✅ [BATCH] Yeni ${batchUsers.length} kullanıcı yüklendi`);
        } else {
          // Tüm kullanıcılar duplicate ise yeni batch getir
          if (data.hasMoreUsers) {
            await loadNextBatch();
            return;
          } else {
            setUserBatch([]);
            setHasMoreUsers(false);
          }
        }
      } else {
        setUserBatch([]);
        setHasMoreUsers(false);
      }
    } catch (error) {
      console.error('❌ [BATCH] Yeni batch yükleme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  }, [seenUsers]);

  // Preloading: Son 3 kullanıcı kaldığında yeni batch'i önceden yükle
  const preloadNextBatch = useCallback(async () => {
    if (isPreloading || !hasMoreUsers) return;
    
    try {
      setIsPreloading(true);
      console.log('🔄 [PRELOAD] Yeni batch önceden yükleniyor...');
      
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
          
          // Preloaded batch'i state'e ekle (mevcut batch'in sonuna ekle)
          setUserBatch(prevBatch => [...prevBatch, ...batchUsers]);
          setHasMoreUsers(data.hasMoreUsers || false);
          
          console.log(`✅ [PRELOAD] ${batchUsers.length} kullanıcı önceden yüklendi`);
        }
      }
    } catch (error) {
      console.error('❌ [PRELOAD] Preload hatası:', error);
    } finally {
      setIsPreloading(false);
    }
  }, [seenUsers, hasMoreUsers, isPreloading]);

  // Swipe işlemi
  const performSwipe = async (action: 'LIKE' | 'DISLIKE') => {
    if (!currentUser || isSwipeInProgress) return;
    
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
        
        if (data.isMatch) {
          // Eşleşme bulundu!
          setMatchedUser(currentUser);
          setShowMatchScreen(true);
        } else {
          // Sonraki kullanıcıya geç
          showNextUser();
        }
        
        // Swipe limit bilgilerini güncelle
        await fetchSwipeLimitInfo();
      }
    } catch (error: any) {
      console.error('Swipe hatası:', error);
      
      // Swipe limit hatası kontrolü (sadece premium olmayan kullanıcılar için)
      if (error.message && error.message.includes('limit') && !isPremium) {
        setShowLimitOverlay(true);
      } 
      // Duplicate swipe hatası (artık çok az görülecek)
      else if (error.message && error.message.includes('zaten bir swipe kaydınız var')) {
        console.log('Bu kullanıcı için zaten swipe yapılmış, sıradakine geçiliyor...');
        // Kullanıcıyı görüldü olarak işaretle ve sıradakine geç
        setSeenUsers(prev => new Set([...prev, currentUser.id]));
        showNextUser();
        return; // Hata fırlatma, normal akışa devam et
      } 
      // Diğer hatalar
      else {
        Alert.alert('Hata', error.message || 'Swipe işlemi sırasında bir hata oluştu');
      }
    } finally {
      setIsSwipeInProgress(false);
    }
  };

  // Swipe animasyonlarını sıfırla
  const resetAnimations = () => {
    translateX.setValue(0);
    rotate.setValue(0);
    scale.setValue(1);
    opacity.setValue(1);
  };

  // Swipe işlemi tamamlandığında
  const handleSwipeComplete = async (action: 'LIKE' | 'DISLIKE') => {
    try {
      await performSwipe(action);
    } catch (error) {
      console.log('Swipe tamamlanamadı, animasyonlar sıfırlanıyor...');
    } finally {
      resetAnimations();
    }
  };

  // Pan gesture handler
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      
      // Swipe threshold (minimum kaydırma mesafesi)
      const threshold = 100;
      
      if (Math.abs(translationX) > threshold || Math.abs(velocityX) > 500) {
        if (translationX > 0) {
          // Sağa swipe - LIKE
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: width,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(rotate, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            handleSwipeComplete('LIKE');
          });
        } else {
          // Sola swipe - DISLIKE
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: -width,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(rotate, {
              toValue: -1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            handleSwipeComplete('DISLIKE');
          });
        }
      } else {
        // Geri dön
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(rotate, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  // Premium sayfasına git
  const goToPremium = () => {
    router.push('/(profile)/premiumScreen');
  };

  // Match screen'i kapat
  const closeMatchScreen = () => {
    setShowMatchScreen(false);
    setMatchedUser(null);
    showNextUser();
  };

  // Chat'e git
  const goToChat = () => {
    setShowMatchScreen(false);
    setMatchedUser(null);
    router.push('/chat');
  };

  // Sayfa her fokuslandığında veri çek
  useFocusEffect(
    useCallback(() => {
      // Eğer batch boşsa yeni batch yükle
      if (userBatch.length === 0) {
        loadUserBatch(false);
      }
      fetchSwipeLimitInfo();
    }, [loadUserBatch, fetchSwipeLimitInfo, userBatch.length])
  );

  // Loading state
  if (isLoading && !currentUser) {
    return (
      <LinearGradient colors={['#8000FF', '#5B00B5', '#3D007A']} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8000FF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Yıldızlar yükleniyor...</Text>
        </View>
      </LinearGradient>
    );
  }

  // Kullanıcı yoksa empty state
  if (!currentUser) {
    return (
      <LinearGradient colors={['#8000FF', '#5B00B5', '#3D007A']} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8000FF" />
        
        <View style={styles.header} />
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🌟</Text>
          <Text style={styles.emptyTitle}>Yıldızlar Tükendi</Text>
          <Text style={styles.emptySubtitle}>
            Şu an için gösterilecek yeni profil yok.{'\n'}
            Biraz sonra tekrar deneyin!
          </Text>
          
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={() => loadUserBatch(true)}
          >
            <Ionicons name="refresh" size={22} color="white" style={{ marginRight: 10 }} />
            <Text style={styles.refreshButtonText}>Yenile</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const zodiacInfo = getZodiacInfo(currentUser.zodiacSign as ZodiacSign);
  
  // Debug: zodiacInfo kontrolü
  console.log('🔮 [ZODIAC] Debug bilgileri:', {
    currentUserZodiacSign: currentUser.zodiacSign,
    zodiacInfo: zodiacInfo,
    showZodiacModal: showZodiacModal
  });

  return (
    <LinearGradient colors={['#8000FF', '#5B00B5', '#3D007A']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header - Boş */}
      <View style={styles.header} />

      {/* Ana Kart - Tam Ekran Scrollable */}
      <View style={styles.cardContainer}>
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.card,
              {
                transform: [
                  { translateX: translateX },
                  { 
                    rotate: rotate.interpolate({
                      inputRange: [-1, 1],
                      outputRange: ['-15deg', '15deg'],
                    })
                  },
                  { scale: scale }
                ],
                opacity: opacity,
              }
            ]}
          >
            {/* Swipe Overlay - LIKE */}
            <Animated.View
              style={[
                styles.swipeOverlay,
                styles.likeOverlay,
                {
                  opacity: translateX.interpolate({
                    inputRange: [0, width / 2],
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                  }),
                }
              ]}
            >
              <Text style={styles.swipeOverlayText}>❤️ LIKE</Text>
            </Animated.View>

            {/* Swipe Overlay - DISLIKE */}
            <Animated.View
              style={[
                styles.swipeOverlay,
                styles.dislikeOverlay,
                {
                  opacity: translateX.interpolate({
                    inputRange: [-width / 2, 0],
                    outputRange: [1, 0],
                    extrapolate: 'clamp',
                  }),
                }
              ]}
            >
              <Text style={styles.swipeOverlayText}>❌ PASS</Text>
            </Animated.View>
          {/* Premium Badge */}
          {currentUser.isPremium && (
            <View style={styles.premiumBadge}>
              <LinearGradient 
                colors={['#FFD700', '#FFA500', '#FF8C00']} 
                style={styles.premiumBadgeGradient}
              >
                <Ionicons name="diamond" size={18} color="white" />
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </LinearGradient>
            </View>
          )}

          {/* Tek ScrollView ile tüm içerik - Fotoğraf ve bilgiler birlikte */}
          <ScrollView 
            style={styles.mainScrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
            bounces={true}
            nestedScrollEnabled={true}
          >
            {/* Ana Fotoğraf */}
            <View style={styles.photoContainer}>
              <Image 
                source={{ 
                  uri: currentUser.profileImageUrl || 
                        (currentUser.photos.length > 0 ? currentUser.photos[0].imageUrl : 'https://picsum.photos/400/600?random=1')
                }} 
                style={styles.mainPhoto} 
              />
              
              {/* Fotoğraf Overlay - Gradient */}
              <LinearGradient 
                colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']} 
                style={styles.photoOverlay}
              />
              
              {/* İsim ve Burç Bilgileri - Ayrı overlay */}
              <View style={styles.nameOverlay}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {currentUser.firstName} {currentUser.lastName}, {currentUser.age}
                  </Text>
                  {zodiacInfo && (
                    <TouchableOpacity 
                      onPress={() => {
                        console.log('🔮 [ZODIAC] Burç simgesine tıklandı:', zodiacInfo);
                        setShowZodiacModal(true);
                      }}
                      style={styles.zodiacBadge}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      delayPressIn={0}
                    >
                      <Text style={styles.zodiacEmoji}>{zodiacInfo.emoji}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Uyumluluk Skoru - Ayrı overlay */}
              <View style={styles.userInfoOverlay}>
                <View style={styles.compatibilityContainer}>
                  <Text style={styles.compatibilityLabel}>✨ Uyumluluk</Text>
                  <View style={[
                    styles.compatibilityScore,
                    { backgroundColor: currentUser.compatibilityScore >= 80 ? '#00D4AA' : 
                                       currentUser.compatibilityScore >= 60 ? '#FFB347' : '#FF6B9D' }
                  ]}>
                    <Text style={styles.compatibilityText}>%{currentUser.compatibilityScore}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Bio Section */}
            {currentUser.bio && (
              <View style={styles.bioContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="chatbubble-ellipses" size={22} color="#8B5CF6" />
                  <Text style={styles.sectionTitle}>Hakkında</Text>
                </View>
                <Text style={styles.bioText}>{currentUser.bio}</Text>
              </View>
            )}

            {/* Burç Özellikleri */}
            {zodiacInfo && (
              <View style={styles.zodiacContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="planet" size={22} color="#8B5CF6" />
                  <Text style={styles.sectionTitle}>Burç Özellikleri</Text>
                </View>
                
                <View style={styles.zodiacFeatures}>
                  <TouchableOpacity 
                    style={styles.featureItem}
                    onPress={() => {
                      setSelectedFeature('element');
                      setShowFeatureModal(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.featureIcon}>
                      <Text style={styles.featureEmoji}>{getElementInfo(zodiacInfo.element).emoji}</Text>
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureLabel}>Element</Text>
                      <Text style={styles.featureValue}>{zodiacInfo.element}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.featureItem}
                    onPress={() => {
                      setSelectedFeature('planet');
                      setShowFeatureModal(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.featureIcon}>
                      <Text style={styles.featureEmoji}>{getPlanetInfo(zodiacInfo.planet).emoji}</Text>
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureLabel}>Yönetici Gezegen</Text>
                      <Text style={styles.featureValue}>{zodiacInfo.planet}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.featureItem}
                    onPress={() => {
                      setSelectedFeature('quality');
                      setShowFeatureModal(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.featureIcon}>
                      <Text style={styles.featureEmoji}>⚖️</Text>
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureLabel}>Kalite</Text>
                      <Text style={styles.featureValue}>Sabit</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.featureItem}
                    onPress={() => {
                      setSelectedFeature('polarity');
                      setShowFeatureModal(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.featureIcon}>
                      <Text style={styles.featureEmoji}>➕</Text>
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureLabel}>Polarite</Text>
                      <Text style={styles.featureValue}>Pozitif</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
                  </TouchableOpacity>
                </View>
                
                {/* Burç Açıklaması */}
                <View style={styles.zodiacDescriptionContainer}>
                  <Text style={styles.zodiacDescriptionText}>
                    {zodiacInfo.description}
                  </Text>
                </View>
              </View>
            )}

            {/* Kişilik Özellikleri */}
            {zodiacInfo && (
              <View style={styles.personalityContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person" size={22} color="#8B5CF6" />
                  <Text style={styles.sectionTitle}>Kişilik Özellikleri</Text>
                </View>
                
                <View style={styles.personalityTraits}>
                  <View style={styles.traitRow}>
                    <View style={styles.traitItem}>
                      <Ionicons name="flash" size={16} color="#F59E0B" />
                      <Text style={styles.traitText}>Enerjik</Text>
                    </View>
                    <View style={styles.traitItem}>
                      <Ionicons name="heart" size={10} color="#EC4899" />
                      <Text style={styles.traitText}>Romantik</Text>
                    </View>
                    <View style={styles.traitItem}>
                      <Ionicons name="bulb" size={16} color="#8B5CF6" />
                      <Text style={styles.traitText}>Yaratıcı</Text>
                    </View>
                  </View>
                  
                  <View style={styles.traitRow}>
                    <View style={styles.traitItem}>
                      <Ionicons name="people" size={16} color="#10B981" />
                      <Text style={styles.traitText}>Sosyal</Text>
                    </View>
                    <View style={styles.traitItem}>
                      <Ionicons name="shield-checkmark" size={16} color="#3B82F6" />
                      <Text style={styles.traitText}>Güvenilir</Text>
                    </View>
                    <View style={styles.traitItem}>
                      <Ionicons name="star" size={16} color="#F59E0B" />
                      <Text style={styles.traitText}>Lider</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Uyumluluk Analizi */}
            {currentUser.compatibilityMessage && (
              <TouchableOpacity 
                style={styles.compatibilityMessageContainer}
                onPress={() => setShowCompatibilityModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.sectionHeader}>
                  <Ionicons name="sparkles" size={22} color="#8B5CF6" />
                  <Text style={styles.sectionTitle}>💫 Uyumluluk Analizi</Text>
                  <Ionicons name="chevron-forward" size={16} color="#8B5CF6" style={{ marginLeft: 'auto' }} />
                </View>
                
                {/* Uyumluluk Skoru Görsel */}
                <View style={styles.compatibilityScoreVisual}>
                  <View style={styles.scoreCircle}>
                    <Text style={styles.scorePercentage}>%{currentUser.compatibilityScore}</Text>
                    <Text style={styles.scoreLabel}>Uyumluluk</Text>
                  </View>
                  <View style={styles.scoreDetails}>
                    <View style={styles.scoreBar}>
                      <View 
                        style={[
                          styles.scoreBarFill, 
                          { 
                            width: `${currentUser.compatibilityScore}%`,
                            backgroundColor: currentUser.compatibilityScore >= 80 ? '#00D4AA' : 
                                           currentUser.compatibilityScore >= 60 ? '#FFB347' : '#FF6B9D'
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.scoreDescription}>
                      {currentUser.compatibilityScore >= 80 ? 'Mükemmel Uyum' : 
                       currentUser.compatibilityScore >= 60 ? 'Yüksek Uyum' : 
                       currentUser.compatibilityScore >= 40 ? 'Orta Uyum' : 'Düşük Uyum'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.compatibilityMessageBox}>
                  <Text style={styles.compatibilityMessageText}>
                    {currentUser.compatibilityMessage}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Fotoğraf Galerisi */}
            {currentUser.photos && currentUser.photos.length > 1 && (
              <TouchableOpacity 
                style={styles.photoGalleryContainer}
                onPress={() => {
                  setCurrentPhotoIndex(0);
                  setShowPhotoGalleryModal(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.sectionHeader}>
                  <Ionicons name="images" size={22} color="#8B5CF6" />
                  <Text style={styles.sectionTitle}>Fotoğraf Galerisi</Text>
                  <Ionicons name="chevron-forward" size={16} color="#8B5CF6" style={{ marginLeft: 'auto' }} />
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.photoGallery}
                  nestedScrollEnabled={true}
                >
                  {currentUser.photos.slice(1).map((photo, index) => (
                    <View key={photo.id} style={styles.galleryPhotoContainer}>
                      <Image 
                        source={{ uri: photo.imageUrl }} 
                        style={styles.galleryPhoto} 
                      />
                    </View>
                  ))}
                </ScrollView>
              </TouchableOpacity>
            )}

            {/* Profil Tamamlanma */}
            <View style={styles.profileCompletenessContainer}>
              <View style={styles.completenessBar}>
                <View style={styles.completenessFill} />
              </View>
              <Text style={styles.profileCompletenessText}>
                Profil Tamamlanma: {currentUser.profileCompleteness}
              </Text>
            </View>
          </ScrollView>
          </Animated.View>
        </PanGestureHandler>
      </View>

      {/* Swipe Yönlendirmesi - Sadece metin */}
      <View style={styles.swipeHint}>
        <Text style={styles.swipeHintText}>
          💡 Kartı sağa kaydır ❤️, sola kaydır ❌
        </Text>
      </View>

      {/* Loading Overlay */}
      {isSwipeInProgress && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#8000FF" />
            <Text style={styles.loadingOverlayText}>İşleniyor...</Text>
          </View>
        </View>
      )}

      {/* Swipe Limit Overlay */}
      {showLimitOverlay && (
        <View style={styles.limitOverlay}>
          <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.limitOverlayGradient}>
            <View style={styles.limitOverlayContent}>
              <Text style={styles.limitIcon}>⏰</Text>
              <Text style={styles.limitTitle}>Swipe Limiti Doldu</Text>
              <Text style={styles.limitSubtitle}>
                Günlük swipe hakkınız tükendi
              </Text>
              
              <TouchableOpacity
                style={styles.premiumCtaButton}
                onPress={() => {
                  setShowLimitOverlay(false);
                  goToPremium();
                }}
              >
                <Text style={styles.premiumCtaButtonText}>Premium Ol</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.limitCloseButton}
                onPress={() => setShowLimitOverlay(false)}
              >
                <Text style={styles.limitCloseButtonText}>Tamam</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Burç Özellikleri Modal */}
      <Modal
        visible={showFeatureModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFeatureModal(false)}
        statusBarTranslucent={true}
        hardwareAccelerated={true}
        presentationStyle="overFullScreen"
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFeatureModal(false)}
        >
          <View style={styles.featureModalContainer}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.95)', 'rgba(124, 58, 237, 0.95)']}
              style={styles.featureModalContent}
            >
              {selectedFeature === 'element' && zodiacInfo && (
                <>
                  <View style={styles.featureModalHeader}>
                    <Text style={styles.featureModalEmoji}>{getElementInfo(zodiacInfo.element).emoji}</Text>
                    <Text style={styles.featureModalTitle}>{getElementInfo(zodiacInfo.element).name} Elementi</Text>
                  </View>
                  
                  <View style={styles.featureModalInfo}>
                    <Text style={styles.featureModalDescription}>
                      {getElementInfo(zodiacInfo.element).description}
                    </Text>
                    
                    <View style={styles.featureModalSection}>
                      <Text style={styles.featureModalSectionTitle}>Bu Elemente Ait Burçlar:</Text>
                      <View style={styles.featureModalTags}>
                        {getElementInfo(zodiacInfo.element).signs.map((sign, index) => (
                          <View key={index} style={styles.featureModalTag}>
                            <Text style={styles.featureModalTagText}>{sign}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    
                    <View style={styles.featureModalSection}>
                      <Text style={styles.featureModalSectionTitle}>Özellikler:</Text>
                      <View style={styles.featureModalTags}>
                        {getElementInfo(zodiacInfo.element).traits.map((trait, index) => (
                          <View key={index} style={styles.featureModalTag}>
                            <Text style={styles.featureModalTagText}>{trait}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    
                    <View style={styles.featureModalSection}>
                      <Text style={styles.featureModalSectionTitle}>Uyumluluk:</Text>
                      <Text style={styles.featureModalCompatibility}>
                        {getElementInfo(zodiacInfo.element).compatibility}
                      </Text>
                    </View>
                    
                    <View style={styles.featureModalSection}>
                      <Text style={styles.featureModalSectionTitle}>🤔 Element Nedir?</Text>
                      <Text style={styles.featureModalExplanation}>
                        Astrolojide 4 element vardır: Ateş, Su, Hava ve Toprak. Her burç bu elementlerden birine aittir. 
                        Element, kişinin temel kişilik özelliklerini ve enerji türünü belirler. 
                        Aynı element grubundaki burçlar benzer özellikler taşır.
                      </Text>
                    </View>
                  </View>
                </>
              )}
              
              {selectedFeature === 'planet' && zodiacInfo && (
                <>
                  <View style={styles.featureModalHeader}>
                    <Text style={styles.featureModalEmoji}>{getPlanetInfo(zodiacInfo.planet).emoji}</Text>
                    <Text style={styles.featureModalTitle}>{getPlanetInfo(zodiacInfo.planet).name}</Text>
                  </View>
                  
                  <View style={styles.featureModalInfo}>
                    <Text style={styles.featureModalDescription}>
                      {getPlanetInfo(zodiacInfo.planet).description}
                    </Text>
                    
                    <View style={styles.featureModalSection}>
                      <Text style={styles.featureModalSectionTitle}>Etkileri:</Text>
                      <Text style={styles.featureModalInfluence}>
                        {getPlanetInfo(zodiacInfo.planet).influence}
                      </Text>
                    </View>
                    
                    <View style={styles.featureModalSection}>
                      <Text style={styles.featureModalSectionTitle}>🪐 Yönetici Gezegen Nedir?</Text>
                      <Text style={styles.featureModalExplanation}>
                        Her burç, belirli bir gezegen tarafından yönetilir. Bu gezegen, o burcun özelliklerini ve 
                        kişilik yapısını etkiler. Örneğin Mars yönetimindeki Koç burcu cesur ve enerjik olur. 
                        Gezegenler, burçların "patronu" gibi düşünülebilir.
                      </Text>
                    </View>
                  </View>
                </>
              )}
              
              {selectedFeature === 'quality' && (
                <>
                  <View style={styles.featureModalHeader}>
                    <Text style={styles.featureModalEmoji}>⚖️</Text>
                    <Text style={styles.featureModalTitle}>Sabit Kalite</Text>
                  </View>
                  
                  <View style={styles.featureModalInfo}>
                    <Text style={styles.featureModalDescription}>
                      {getQualityInfo('Sabit').description}
                    </Text>
                    
                    <View style={styles.featureModalSection}>
                      <Text style={styles.featureModalSectionTitle}>Temel Özellikler:</Text>
                      <View style={styles.featureModalTags}>
                        {getQualityInfo('Sabit').traits.map((trait, index) => (
                          <View key={index} style={styles.featureModalTag}>
                            <Text style={styles.featureModalTagText}>{trait}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    
                    <View style={styles.featureModalSection}>
                      <Text style={styles.featureModalSectionTitle}>Pozitif Özellikler:</Text>
                      <View style={styles.featureModalTags}>
                        {getQualityInfo('Sabit').positive.map((trait, index) => (
                          <View key={index} style={[styles.featureModalTag, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                            <Text style={styles.featureModalTagText}>{trait}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    
                    <View style={styles.featureModalSection}>
                      <Text style={styles.featureModalSectionTitle}>Olumsuz Özellikler:</Text>
                      <View style={styles.featureModalTags}>
                        {getQualityInfo('Sabit').negative.map((trait, index) => (
                          <View key={index} style={[styles.featureModalTag, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                            <Text style={styles.featureModalTagText}>{trait}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    
                    <View style={styles.featureModalSection}>
                      <Text style={styles.featureModalSectionTitle}>Anlamı:</Text>
                      <Text style={styles.featureModalMeaning}>
                        {getQualityInfo('Sabit').meaning}
                      </Text>
                    </View>
                    
                    <View style={styles.featureModalSection}>
                      <Text style={styles.featureModalSectionTitle}>Tavsiye:</Text>
                      <Text style={styles.featureModalAdvice}>
                        {getQualityInfo('Sabit').advice}
                      </Text>
                    </View>
                    
                    <View style={styles.featureModalSection}>
                      <Text style={styles.featureModalSectionTitle}>Uyumluluk:</Text>
                      <Text style={styles.featureModalCompatibility}>
                        {getQualityInfo('Sabit').compatibility}
                      </Text>
                    </View>
                    
                    <View style={styles.featureModalSection}>
                      <Text style={styles.featureModalSectionTitle}>⚖️ Kalite Nedir?</Text>
                      <Text style={styles.featureModalExplanation}>
                        Astrolojide 3 kalite türü vardır: Öncü, Sabit ve Değişken. Kalite, kişinin hayata yaklaşım tarzını belirler. 
                        Öncü burçlar liderlik eder, Sabit burçlar kararlıdır, Değişken burçlar uyum sağlar. 
                        Bu, kişinin değişimlere nasıl tepki verdiğini gösterir.
                      </Text>
                    </View>
                  </View>
                </>
              )}
              
              {selectedFeature === 'polarity' && (
                <>
                  <View style={styles.featureModalHeader}>
                    <Text style={styles.featureModalEmoji}>➕</Text>
                    <Text style={styles.featureModalTitle}>Pozitif Polarite</Text>
                  </View>
                  
                  <View style={styles.featureModalInfo}>
                    <Text style={styles.featureModalDescription}>
                      {getPolarityInfo('Pozitif').description}
                    </Text>
                    
                    <View style={styles.featureModalSection}>
                      <Text style={styles.featureModalSectionTitle}>Temel Özellikler:</Text>
                      <View style={styles.featureModalTags}>
                        {getPolarityInfo('Pozitif').traits.map((trait, index) => (
                          <View key={index} style={styles.featureModalTag}>
                            <Text style={styles.featureModalTagText}>{trait}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    
                    <View style={styles.featureModalSection}>
                      <Text style={styles.featureModalSectionTitle}>Pozitif Özellikler:</Text>
                      <View style={styles.featureModalTags}>
                        {getPolarityInfo('Pozitif').positive.map((trait, index) => (
                          <View key={index} style={[styles.featureModalTag, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                            <Text style={styles.featureModalTagText}>{trait}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    
                    <View style={styles.featureModalSection}>
                      <Text style={styles.featureModalSectionTitle}>Olumsuz Özellikler:</Text>
                      <View style={styles.featureModalTags}>
                        {getPolarityInfo('Pozitif').negative.map((trait, index) => (
                          <View key={index} style={[styles.featureModalTag, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                            <Text style={styles.featureModalTagText}>{trait}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    
                    <View style={styles.featureModalSection}>
                      <Text style={styles.featureModalSectionTitle}>Anlamı:</Text>
                      <Text style={styles.featureModalMeaning}>
                        {getPolarityInfo('Pozitif').meaning}
                      </Text>
                    </View>
                    
                    <View style={styles.featureModalSection}>
                      <Text style={styles.featureModalSectionTitle}>Tavsiye:</Text>
                      <Text style={styles.featureModalAdvice}>
                        {getPolarityInfo('Pozitif').advice}
                      </Text>
                    </View>
                    
                    <View style={styles.featureModalSection}>
                      <Text style={styles.featureModalSectionTitle}>Uyumluluk:</Text>
                      <Text style={styles.featureModalCompatibility}>
                        {getPolarityInfo('Pozitif').compatibility}
                      </Text>
                    </View>
                    
                    <View style={styles.featureModalSection}>
                      <Text style={styles.featureModalSectionTitle}>➕➖ Polarite Nedir?</Text>
                      <Text style={styles.featureModalExplanation}>
                        Astrolojide 2 polarite türü vardır: Pozitif ve Negatif. Bu, enerji yönünü belirler. 
                        Pozitif burçlar dışa dönük ve aktif, Negatif burçlar içe dönük ve pasiftir. 
                        Bu, kişinin enerjisini nasıl kullandığını ve dünyayla nasıl etkileşim kurduğunu gösterir.
                      </Text>
                    </View>
                  </View>
                </>
              )}
              
              <TouchableOpacity 
                style={styles.featureModalCloseButton}
                onPress={() => setShowFeatureModal(false)}
              >
                <Text style={styles.featureModalCloseText}>Kapat</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Uyumluluk Analizi Modal */}
      <Modal
        visible={showCompatibilityModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCompatibilityModal(false)}
        statusBarTranslucent={true}
        hardwareAccelerated={true}
        presentationStyle="overFullScreen"
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCompatibilityModal(false)}
        >
          <View style={styles.compatibilityModalContainer}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.95)', 'rgba(124, 58, 237, 0.95)']}
              style={styles.compatibilityModalContent}
            >
              {currentUser && (() => {
                const compatibilityInfo = getCompatibilityInfo(
                  currentUser.compatibilityScore, 
                  userProfile?.zodiacSign, 
                  currentUser.zodiacSign
                );
                return (
                  <>
                    <View style={styles.compatibilityModalHeader}>
                      <Text style={styles.compatibilityModalEmoji}>{compatibilityInfo.emoji}</Text>
                      <Text style={styles.compatibilityModalTitle}>{compatibilityInfo.level}</Text>
                      <Text style={styles.compatibilityModalScore}>%{currentUser.compatibilityScore}</Text>
                    </View>
                    
                    <View style={styles.compatibilityModalInfo}>
                      <Text style={styles.compatibilityModalDescription}>
                        {compatibilityInfo.description}
                      </Text>
                      
                      {compatibilityInfo.analysis && (
                        <View style={styles.compatibilityModalSection}>
                          <Text style={styles.compatibilityModalSectionTitle}>Burç Analizi:</Text>
                          <Text style={styles.compatibilityModalAnalysis}>
                            {compatibilityInfo.analysis}
                          </Text>
                        </View>
                      )}
                      
                      <View style={styles.compatibilityModalSection}>
                        <Text style={styles.compatibilityModalSectionTitle}>Pozitif Özellikler:</Text>
                        <View style={styles.compatibilityModalTraits}>
                          {compatibilityInfo.traits.map((trait, index) => (
                            <View key={index} style={styles.compatibilityModalTrait}>
                              <Ionicons name="checkmark-circle" size={16} color="#00D4AA" />
                              <Text style={styles.compatibilityModalTraitText}>{trait}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                      
                      <View style={styles.compatibilityModalSection}>
                        <Text style={styles.compatibilityModalSectionTitle}>Olumsuz Özellikler:</Text>
                        <View style={styles.compatibilityModalTraits}>
                          {compatibilityInfo.negativeTraits.map((trait, index) => (
                            <View key={index} style={styles.compatibilityModalTrait}>
                              <Ionicons name="close-circle" size={16} color="#EF4444" />
                              <Text style={styles.compatibilityModalTraitText}>{trait}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                      
                      <View style={styles.compatibilityModalSection}>
                        <Text style={styles.compatibilityModalSectionTitle}>Tavsiye:</Text>
                        <Text style={styles.compatibilityModalAdvice}>
                          {compatibilityInfo.advice}
                        </Text>
                      </View>
                      
                      {currentUser.compatibilityMessage && (
                        <View style={styles.compatibilityModalSection}>
                          <Text style={styles.compatibilityModalSectionTitle}>Detaylı Analiz:</Text>
                          <Text style={styles.compatibilityModalMessage}>
                            {currentUser.compatibilityMessage}
                          </Text>
                        </View>
                      )}
                      
                      <View style={styles.compatibilityModalSection}>
                        <Text style={styles.compatibilityModalSectionTitle}>💫 Uyumluluk Nasıl Hesaplanır?</Text>
                        <Text style={styles.compatibilityModalExplanation}>
                          Burç uyumluluğu 3 faktöre dayanır: Element (Ateş, Su, Hava, Toprak), 
                          Kalite (Öncü, Sabit, Değişken) ve Polarite (Pozitif, Negatif). 
                          Aynı element grubundaki burçlar güçlü uyum gösterir. 
                          Farklı elementler de birbirini tamamlayabilir.
                        </Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.compatibilityModalCloseButton}
                      onPress={() => setShowCompatibilityModal(false)}
                    >
                      <Text style={styles.compatibilityModalCloseText}>Kapat</Text>
                    </TouchableOpacity>
                  </>
                );
              })()}
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Fotoğraf Galerisi Modal */}
      <Modal
        visible={showPhotoGalleryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPhotoGalleryModal(false)}
        statusBarTranslucent={true}
        hardwareAccelerated={true}
        presentationStyle="overFullScreen"
      >
        <View style={styles.photoGalleryModalOverlay}>
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.7)']}
            style={styles.photoGalleryModalGradient}
          >
            {/* Header */}
            <View style={styles.photoGalleryModalHeader}>
              <TouchableOpacity 
                style={styles.photoGalleryModalCloseButton}
                onPress={() => setShowPhotoGalleryModal(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.photoGalleryModalTitle}>
                {currentUser?.firstName} {currentUser?.lastName}
              </Text>
              <Text style={styles.photoGalleryModalCounter}>
                {currentPhotoIndex + 1} / {currentUser?.photos?.length || 1}
              </Text>
            </View>

            {/* Ana Fotoğraf */}
            <View style={styles.photoGalleryModalContent}>
              {currentUser?.photos && currentUser.photos.length > 0 && (
                <Image 
                  source={{ uri: currentUser.photos[currentPhotoIndex]?.imageUrl }} 
                  style={styles.photoGalleryModalImage}
                  resizeMode="contain"
                />
              )}
            </View>

            {/* Navigation Buttons */}
            <View style={styles.photoGalleryModalNavigation}>
              <TouchableOpacity 
                style={[
                  styles.photoGalleryModalNavButton,
                  currentPhotoIndex === 0 && styles.photoGalleryModalNavButtonDisabled
                ]}
                onPress={() => {
                  if (currentPhotoIndex > 0) {
                    setCurrentPhotoIndex(currentPhotoIndex - 1);
                  }
                }}
                disabled={currentPhotoIndex === 0}
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.photoGalleryModalNavButton,
                  currentPhotoIndex === (currentUser?.photos?.length || 1) - 1 && styles.photoGalleryModalNavButtonDisabled
                ]}
                onPress={() => {
                  if (currentUser?.photos && currentPhotoIndex < currentUser.photos.length - 1) {
                    setCurrentPhotoIndex(currentPhotoIndex + 1);
                  }
                }}
                disabled={currentPhotoIndex === (currentUser?.photos?.length || 1) - 1}
              >
                <Ionicons name="chevron-forward" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Thumbnail Gallery */}
            {currentUser?.photos && currentUser.photos.length > 1 && (
              <View style={styles.photoGalleryModalThumbnails}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.photoGalleryModalThumbnailsContent}
                >
                  {currentUser.photos.map((photo, index) => (
                    <TouchableOpacity
                      key={photo.id}
                      style={[
                        styles.photoGalleryModalThumbnail,
                        index === currentPhotoIndex && styles.photoGalleryModalThumbnailActive
                      ]}
                      onPress={() => setCurrentPhotoIndex(index)}
                    >
                      <Image 
                        source={{ uri: photo.imageUrl }} 
                        style={styles.photoGalleryModalThumbnailImage}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </LinearGradient>
        </View>
      </Modal>

      {/* Burç Bilgi Modal */}
      <Modal
        visible={showZodiacModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          console.log('🔮 [ZODIAC] Modal kapatılıyor');
          setShowZodiacModal(false);
        }}
        statusBarTranslucent={true}
        hardwareAccelerated={true}
        presentationStyle="overFullScreen"
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            console.log('🔮 [ZODIAC] Modal overlay tıklandı - kapatılıyor');
            setShowZodiacModal(false);
          }}
          hitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}
        >
          <View style={styles.zodiacModalContainer}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.95)', 'rgba(124, 58, 237, 0.95)']}
              style={styles.zodiacModalContent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {zodiacInfo ? (
                <>
                  <View style={styles.zodiacModalHeader}>
                    <Text style={styles.zodiacModalEmoji}>{zodiacInfo.emoji}</Text>
                    <Text style={styles.zodiacModalTitle}>{zodiacInfo.turkishName}</Text>
                  </View>
                  
                  <View style={styles.zodiacModalInfo}>
                    <View style={styles.zodiacModalRow}>
                      <Text style={styles.zodiacModalLabel}>Element:</Text>
                      <Text style={styles.zodiacModalValue}>{zodiacInfo.element}</Text>
                    </View>
                    <View style={styles.zodiacModalRow}>
                      <Text style={styles.zodiacModalLabel}>Yönetici Gezegen:</Text>
                      <Text style={styles.zodiacModalValue}>{zodiacInfo.planet}</Text>
                    </View>
                    <View style={styles.zodiacModalRow}>
                      <Text style={styles.zodiacModalLabel}>Kalite:</Text>
                      <Text style={styles.zodiacModalValue}>Sabit</Text>
                    </View>
                    <View style={styles.zodiacModalRow}>
                      <Text style={styles.zodiacModalLabel}>Polarite:</Text>
                      <Text style={styles.zodiacModalValue}>Pozitif</Text>
                    </View>
                  </View>
                  
                  {/* Günlük Burç Yorumu */}
                  <View style={styles.zodiacModalDescription}>
                    <Text style={styles.zodiacModalDayTitle}>
                      {getDailyZodiacCommentByString(currentUser.zodiacSign).day} Günlük Yorumu
                    </Text>
                    <Text style={styles.zodiacModalDescriptionText}>
                      {getDailyZodiacCommentByString(currentUser.zodiacSign).comment}
                    </Text>
                    <View style={styles.zodiacModalMoodContainer}>
                      <Text style={styles.zodiacModalMoodLabel}>Ruh Hali:</Text>
                      <Text style={styles.zodiacModalMoodText}>
                        {getDailyZodiacCommentByString(currentUser.zodiacSign).mood}
                      </Text>
                    </View>
                    <View style={styles.zodiacModalAdviceContainer}>
                      <Text style={styles.zodiacModalAdviceLabel}>Tavsiye:</Text>
                      <Text style={styles.zodiacModalAdviceText}>
                        {getDailyZodiacCommentByString(currentUser.zodiacSign).advice}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Kişilik Özellikleri */}
                  <View style={styles.zodiacModalTraits}>
                    <Text style={styles.zodiacModalTraitsTitle}>Temel Özellikler</Text>
                    <View style={styles.zodiacModalTraitsGrid}>
                      <View style={styles.zodiacModalTraitItem}>
                        <Ionicons name="flash" size={14} color="#F59E0B" />
                        <Text style={styles.zodiacModalTraitText}>Enerjik</Text>
                      </View>
                      <View style={styles.zodiacModalTraitItem}>
                        <Ionicons name="heart" size={14} color="#EC4899" />
                        <Text style={styles.zodiacModalTraitText}>Romantik</Text>
                      </View>
                      <View style={styles.zodiacModalTraitItem}>
                        <Ionicons name="bulb" size={14} color="#8B5CF6" />
                        <Text style={styles.zodiacModalTraitText}>Yaratıcı</Text>
                      </View>
                      <View style={styles.zodiacModalTraitItem}>
                        <Ionicons name="people" size={14} color="#10B981" />
                        <Text style={styles.zodiacModalTraitText}>Sosyal</Text>
                      </View>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.zodiacModalCloseButton}
                    onPress={() => setShowZodiacModal(false)}
                  >
                    <Text style={styles.zodiacModalCloseText}>Kapat</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.zodiacModalHeader}>
                  <Text style={styles.zodiacModalTitle}>Burç Bilgisi Bulunamadı</Text>
                  <Text style={styles.zodiacModalDescriptionText}>
                    {currentUser.zodiacSign} burcu için bilgi bulunamadı.
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Match Screen */}
      {showMatchScreen && matchedUser && (
        <View style={styles.matchOverlay}>
          <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.matchOverlayGradient}>
            <View style={styles.matchOverlayContent}>
              <Text style={styles.matchIcon}>🎉</Text>
              <Text style={styles.matchTitle}>Eşleşme!</Text>
              <Text style={styles.matchSubtitle}>
                {matchedUser.firstName} ile eşleştiniz!
              </Text>
              
              <TouchableOpacity
                style={styles.matchChatButton}
                onPress={goToChat}
              >
                <Text style={styles.matchChatButtonText}>Sohbet Et</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.matchCloseButton}
                onPress={closeMatchScreen}
              >
                <Text style={styles.matchCloseButtonText}>Devam Et</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  swipeLimitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  swipeLimitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swipeLimitText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  premiumUpgradeButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  premiumUpgradeText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cooldownInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 179, 71, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 71, 0.3)',
  },
  cooldownText: {
    color: '#FFB347',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  premiumCooldownText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 8,
    fontStyle: 'italic',
  },

  cardContainer: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 65,
  },
  card: {
    backgroundColor: '#1E1B4B',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    flex: 1,
  },
  // Premium Badge
  premiumBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
  },
  premiumBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  premiumBadgeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  // Photo Container
  photoContainer: {
    height: 400,
  },
  mainPhoto: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 240,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  nameOverlay: {
    position: 'absolute',
    bottom: -35,
    left: 0,
    right: 0,
    paddingHorizontal: 25,
    paddingVertical: 15,
    zIndex: 6,
  },
  userInfoOverlay: {
    position: 'absolute',
    bottom: 250,
    left: 0,
    right: 0,
    padding: 25,
    paddingBottom: 30,
    paddingTop: 50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    zIndex: 5,
  },
  // Scrollable Content
  scrollableContent: {
    flex: 1,
    backgroundColor: '#1E1B4B',
  },
  scrollContentContainer: {
    paddingBottom: 100,
    paddingTop: 0,
  },
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginLeft: 12,
  },
  // Zodiac Features
  zodiacFeatures: {
    marginTop: -5,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    padding: 22,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  featureContent: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 14,
    color: '#CBD5E1',
    fontWeight: '600',
    marginBottom: 4,
  },
  featureValue: {
    fontSize: 18,
    color: '#F1F5F9',
    fontWeight: 'bold',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  zodiacBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  zodiacEmoji: {
    fontSize: 28,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  zodiacName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  compatibilityContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  compatibilityLabel: {
    fontSize: 20,
    color: 'white',
    marginBottom: 12,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  compatibilityScore: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  compatibilityText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  bioContainer: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    marginHorizontal: 20,
    marginTop: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    paddingTop: 15,
  },

  bioText: {
    fontSize: 16,
    color: '#E2E8F0',
    lineHeight: 26,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  zodiacContainer: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    paddingTop: 15,
  },
  zodiacDescriptionContainer: {
    marginTop: 15,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  zodiacDescriptionText: {
    fontSize: 15,
    color: '#E2E8F0',
    lineHeight: 22,
    fontStyle: 'italic',
    textAlign: 'center',
  },


  compatibilityMessageContainer: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    paddingTop: 15,
  },
  compatibilityScoreVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    marginRight: 20,
  },
  scorePercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: '600',
    marginTop: 2,
  },
  scoreDetails: {
    flex: 1,
  },
  scoreBar: {
    height: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '600',
  },

  compatibilityMessageBox: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    padding: 22,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  compatibilityMessageText: {
    fontSize: 17,
    color: '#E2E8F0',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 26,
  },
  // Photo Gallery
  photoGalleryContainer: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    paddingTop: 15,
  },
  photoGallery: {
    paddingRight: 30,
  },
  galleryPhotoContainer: {
    marginRight: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  galleryPhoto: {
    width: 100,
    height: 100,
    borderRadius: 15,
  },
  profileCompletenessContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    paddingTop: 15,
  },
  completenessBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 4,
    marginBottom: 15,
    overflow: 'hidden',
  },
  completenessFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
    width: '100%',
  },
  profileCompletenessText: {
    fontSize: 14,
    color: '#CBD5E1',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  // Kişilik Özellikleri Stilleri
  personalityContainer: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    paddingTop: 15,
  },
  personalityTraits: {
    marginTop: 5,
  },
  traitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  traitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    flex: 1,
    marginHorizontal: 4,
  },
  traitText: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '600',
    marginLeft: 6,
  },
  // Swipe Overlay Stilleri
  swipeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 30,
  },
  likeOverlay: {
    backgroundColor: 'rgba(0, 212, 170, 0.8)',
  },
  dislikeOverlay: {
    backgroundColor: 'rgba(255, 107, 157, 0.8)',
  },
  swipeOverlayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  swipeHint: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    borderRadius: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  swipeHintText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 15,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 40,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  loadingOverlayText: {
    marginTop: 20,
    fontSize: 18,
    color: '#8B5CF6',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 22,
    marginTop: 30,
    fontWeight: '600',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 45,
  },
  emptyIcon: {
    fontSize: 100,
    marginBottom: 40,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  emptyTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  emptySubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 40,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  refreshButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  limitOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  limitOverlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  limitOverlayContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    margin: 30,
    padding: 35,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 20,
    maxWidth: 350,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  limitIcon: {
    fontSize: 60,
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  limitTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  limitSubtitle: {
    fontSize: 17,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
    lineHeight: 24,
  },
  premiumCtaButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: 18,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  premiumCtaButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  limitCloseButton: {
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  limitCloseButtonText: {
    color: '#EF4444',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  matchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchOverlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchOverlayContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    margin: 30,
    padding: 35,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 20,
    maxWidth: 350,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  matchIcon: {
    fontSize: 70,
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  matchTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  matchSubtitle: {
    fontSize: 19,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
    lineHeight: 26,
  },
  matchChatButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: 18,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  matchChatButtonText: {
    color: '#8B5CF6',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  matchCloseButton: {
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  matchCloseButtonText: {
    color: '#F59E0B',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  mainScrollView: {
    flex: 1,
  },
  // Burç Modal Stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  zodiacModalContainer: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    zIndex: 10000,
    maxHeight: '80%',
    maxWidth: '90%',
  },
  zodiacModalContent: {
    padding: 25,
    minWidth: 320,
    maxWidth: 350,
  },
  zodiacModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  zodiacModalEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  zodiacModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  zodiacModalInfo: {
    marginBottom: 20,
  },
  zodiacModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  zodiacModalLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  zodiacModalValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  zodiacModalCloseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  zodiacModalCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  zodiacModalDescription: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  zodiacModalDayTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  zodiacModalDescriptionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  zodiacModalMoodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  zodiacModalMoodLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginRight: 8,
  },
  zodiacModalMoodText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: 'bold',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  zodiacModalAdviceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  zodiacModalAdviceLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginRight: 8,
    marginTop: 2,
  },
  zodiacModalAdviceText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    flex: 1,
    textAlign: 'center',
  },
  zodiacModalTraits: {
    marginBottom: 20,
  },
  zodiacModalTraitsTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  zodiacModalTraitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  zodiacModalTraitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 8,
    width: '48%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  zodiacModalTraitText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  // Burç Özellikleri Modal Stilleri
  featureModalContainer: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    zIndex: 10000,
    maxHeight: '80%',
    maxWidth: '90%',
  },
  featureModalContent: {
    padding: 25,
    minWidth: 320,
    maxWidth: 350,
  },
  featureModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  featureModalEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  featureModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featureModalInfo: {
    marginBottom: 20,
  },
  featureModalDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  featureModalSection: {
    marginBottom: 20,
  },
  featureModalSectionTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  featureModalTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  featureModalTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  featureModalTagText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  featureModalCompatibility: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 10,
  },
  featureModalInfluence: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 10,
  },
  featureModalMeaning: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 10,
  },
  featureModalCloseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  featureModalCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Uyumluluk Modal Stilleri
  compatibilityModalContainer: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    zIndex: 10000,
    maxHeight: '80%',
    maxWidth: '90%',
  },
  compatibilityModalContent: {
    padding: 25,
    minWidth: 320,
    maxWidth: 350,
  },
  compatibilityModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  compatibilityModalEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  compatibilityModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginBottom: 5,
  },
  compatibilityModalScore: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  compatibilityModalInfo: {
    marginBottom: 20,
  },
  compatibilityModalDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  compatibilityModalSection: {
    marginBottom: 20,
  },
  compatibilityModalSectionTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  compatibilityModalTraits: {
    gap: 8,
  },
  compatibilityModalTrait: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  compatibilityModalTraitText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  compatibilityModalAdvice: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 10,
  },
  compatibilityModalMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 10,
    lineHeight: 20,
  },
  compatibilityModalCloseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  compatibilityModalCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  compatibilityModalAnalysis: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 10,
    lineHeight: 20,
  },
  featureModalAdvice: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 10,
  },
  featureModalExplanation: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'left',
    lineHeight: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  compatibilityModalExplanation: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'left',
    lineHeight: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  // Fotoğraf Galerisi Modal Stilleri
  photoGalleryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoGalleryModalGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoGalleryModalHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  photoGalleryModalCloseButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 10,
  },
  photoGalleryModalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  photoGalleryModalCounter: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  photoGalleryModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  photoGalleryModalImage: {
    width: '100%',
    height: '80%',
    maxHeight: 600,
  },
  photoGalleryModalNavigation: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  photoGalleryModalNavButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 15,
    minWidth: 50,
    alignItems: 'center',
  },
  photoGalleryModalNavButtonDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    opacity: 0.5,
  },
  photoGalleryModalThumbnails: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 80,
  },
  photoGalleryModalThumbnailsContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  photoGalleryModalThumbnail: {
    marginHorizontal: 5,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  photoGalleryModalThumbnailActive: {
    borderColor: '#8B5CF6',
  },
  photoGalleryModalThumbnailImage: {
    width: 60,
    height: 60,
  },
});
