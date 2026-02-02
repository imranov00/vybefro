import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useLoading } from '../context/LoadingContext';
import { useBlock } from '../hooks/useBlock';
import { useUnmatch } from '../hooks/useUnmatch';
import { UserProfileResponse, relationshipApi, userApi } from '../services/api';
import { ZodiacSign, zodiacTranslations } from '../utils/zodiacTranslations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Burç emoji'lerini al
const getZodiacEmoji = (sign: string): string => {
  const emojis: { [key: string]: string } = {
    'ARIES': '♈', 'KOÇ': '♈',
    'TAURUS': '♉', 'BOĞA': '♉',
    'GEMINI': '♊', 'İKİZLER': '♊',
    'CANCER': '♋', 'YENGEÇ': '♋',
    'LEO': '♌', 'ASLAN': '♌',
    'VIRGO': '♍', 'BAŞAK': '♍',
    'LIBRA': '♎', 'TERAZİ': '♎',
    'SCORPIO': '♏', 'AKREP': '♏',
    'SAGITTARIUS': '♐', 'YAY': '♐',
    'CAPRICORN': '♑', 'OĞLAK': '♑',
    'AQUARIUS': '♒', 'KOVA': '♒',
    'PISCES': '♓', 'BALIK': '♓',
  };
  return emojis[sign?.toUpperCase()] || '⭐';
};

// Burç Türkçe karşılığı
const getZodiacTurkish = (sign: string): string => {
  const upperSign = sign?.toUpperCase() as ZodiacSign;
  return zodiacTranslations[upperSign] || sign;
};

// Yaş hesapla
const calculateAge = (birthDate: string): number | null => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Burç özellikleri - Genişletilmiş
const zodiacTraits: Record<string, { 
  positive: string[]; 
  negative: string[]; 
  element: string; 
  planet: string; 
  description: string;
  compatible: string[];
  incompatible: string[];
  luckyNumbers: number[];
  luckyDay: string;
  luckyColor: string;
  loveStyle: string;
  dateRange: string;
  quality: string;
  symbol: string;
}> = {
  ARIES: {
    positive: ['Cesur', 'Enerjik', 'Lider ruhlu', 'Kararlı', 'Hevesli'],
    negative: ['Sabırsız', 'İnatçı', 'Agresif', 'Düşüncesiz', 'Rekabetçi'],
    element: 'Ateş 🔥',
    planet: 'Mars ♂',
    description: 'Koç burcu, zodiakın ilk burcu olarak öncü ve cesur bir ruha sahiptir. Doğal liderler olan Koçlar, yeni başlangıçlar yapmaktan ve risk almaktan korkmaz.',
    compatible: ['Aslan', 'Yay', 'İkizler', 'Kova'],
    incompatible: ['Yengeç', 'Oğlak'],
    luckyNumbers: [1, 8, 17],
    luckyDay: 'Salı',
    luckyColor: 'Kırmızı',
    loveStyle: 'Tutkulu ve heyecan dolu bir aşık. İlk adımı atmaktan çekinmez, ilişkide spontanlık ve macera arar.',
    dateRange: '21 Mart - 19 Nisan',
    quality: 'Öncü (Cardinal)',
    symbol: 'Koç'
  },
  TAURUS: {
    positive: ['Güvenilir', 'Sabırlı', 'Pratik', 'Sadık', 'Kararlı'],
    negative: ['İnatçı', 'Possessif', 'Değişime kapalı', 'Tembel', 'Materyalist'],
    element: 'Toprak 🌍',
    planet: 'Venüs ♀',
    description: 'Boğa burcu, istikrar ve konfor arayan güvenilir bir burçtur. Estetik duyguları güçlü olan Boğalar, güzel şeylere ve lükse düşkündür.',
    compatible: ['Başak', 'Oğlak', 'Yengeç', 'Balık'],
    incompatible: ['Aslan', 'Kova'],
    luckyNumbers: [2, 6, 9, 12],
    luckyDay: 'Cuma',
    luckyColor: 'Yeşil',
    loveStyle: 'Sadık ve romantik bir partner. Fiziksel yakınlık ve güvenlik arar, yavaş ama derin bağlar kurar.',
    dateRange: '20 Nisan - 20 Mayıs',
    quality: 'Sabit (Fixed)',
    symbol: 'Boğa'
  },
  GEMINI: {
    positive: ['Uyumlu', 'Meraklı', 'İletişimci', 'Zeki', 'Esprili'],
    negative: ['Kararsız', 'Yüzeysel', 'Tutarsız', 'Dedikoducu', 'Huzursuz'],
    element: 'Hava 💨',
    planet: 'Merkür ☿',
    description: 'İkizler burcu, çok yönlü ve sosyal bir yapıya sahiptir. Hızlı öğrenen ve her ortama uyum sağlayabilen İkizler, iletişimin ustasıdır.',
    compatible: ['Terazi', 'Kova', 'Koç', 'Aslan'],
    incompatible: ['Başak', 'Balık'],
    luckyNumbers: [5, 7, 14, 23],
    luckyDay: 'Çarşamba',
    luckyColor: 'Sarı',
    loveStyle: 'Entelektüel ve eğlenceli bir aşık. Zihinsel uyum ve iyi iletişim ilişkinin temelidir.',
    dateRange: '21 Mayıs - 20 Haziran',
    quality: 'Değişken (Mutable)',
    symbol: 'İkizler'
  },
  CANCER: {
    positive: ['Şefkatli', 'Koruyucu', 'Sezgisel', 'Sadık', 'Duygusal zeka'],
    negative: ['Alıngan', 'Karamsar', 'Manipülatif', 'Şüpheci', 'Değişken ruh hali'],
    element: 'Su 💧',
    planet: 'Ay ☽',
    description: 'Yengeç burcu, duygusal derinliği ve aile bağlılığıyla bilinir. Koruyucu ve besleyici yapıları ile sevdiklerine sonsuz destek verirler.',
    compatible: ['Akrep', 'Balık', 'Boğa', 'Başak'],
    incompatible: ['Koç', 'Terazi'],
    luckyNumbers: [2, 3, 15, 20],
    luckyDay: 'Pazartesi',
    luckyColor: 'Gümüş',
    loveStyle: 'Duygusal ve koruyucu bir partner. Derin bağlar kurar, güven ve sadakat en önemli değerleridir.',
    dateRange: '21 Haziran - 22 Temmuz',
    quality: 'Öncü (Cardinal)',
    symbol: 'Yengeç'
  },
  LEO: {
    positive: ['Karizmatik', 'Cömert', 'Yaratıcı', 'Sadık', 'Özgüvenli'],
    negative: ['Kibirli', 'İnatçı', 'Bencil', 'Dramatik', 'İlgi düşkünü'],
    element: 'Ateş 🔥',
    planet: 'Güneş ☉',
    description: 'Aslan burcu, zodiakın kralı olarak doğuştan liderlik özellikleri taşır. Karizmatik ve gösterişli Aslanlar, dikkat çekmeyi ve takdir edilmeyi severler.',
    compatible: ['Koç', 'Yay', 'İkizler', 'Terazi'],
    incompatible: ['Boğa', 'Akrep'],
    luckyNumbers: [1, 3, 10, 19],
    luckyDay: 'Pazar',
    luckyColor: 'Altın',
    loveStyle: 'Romantik ve cömert bir aşık. Takdir edilmek ve hayranlık görmek ister, karşılığında büyük sadakat sunar.',
    dateRange: '23 Temmuz - 22 Ağustos',
    quality: 'Sabit (Fixed)',
    symbol: 'Aslan'
  },
  VIRGO: {
    positive: ['Analitik', 'Çalışkan', 'Dikkatli', 'Güvenilir', 'Pratik'],
    negative: ['Eleştirel', 'Endişeli', 'Mükemmeliyetçi', 'Takıntılı', 'Tutucu'],
    element: 'Toprak 🌍',
    planet: 'Merkür ☿',
    description: 'Başak burcu, detaylara olan hakimiyeti ve analitik zekasıyla öne çıkar. Düzenli ve metodolojik çalışan Başaklar, mükemmeliyetçi yapılarıyla bilinir.',
    compatible: ['Boğa', 'Oğlak', 'Yengeç', 'Akrep'],
    incompatible: ['İkizler', 'Yay'],
    luckyNumbers: [5, 14, 15, 23],
    luckyDay: 'Çarşamba',
    luckyColor: 'Lacivert',
    loveStyle: 'Düşünceli ve özenli bir partner. Küçük detaylarla ilgilenir, pratik yollarla sevgisini gösterir.',
    dateRange: '23 Ağustos - 22 Eylül',
    quality: 'Değişken (Mutable)',
    symbol: 'Başak'
  },
  LIBRA: {
    positive: ['Diplomatik', 'Adil', 'Romantik', 'Uyumlu', 'Zarif'],
    negative: ['Kararsız', 'Yüzeysel', 'Çatışmadan kaçan', 'Bağımlı', 'Manipülatif'],
    element: 'Hava 💨',
    planet: 'Venüs ♀',
    description: 'Terazi burcu, denge ve uyum arayışındadır. Estetik duyguları gelişmiş olan Teraziler, ilişkilerde barışı ve adaleti korumak için çabalar.',
    compatible: ['İkizler', 'Kova', 'Aslan', 'Yay'],
    incompatible: ['Yengeç', 'Oğlak'],
    luckyNumbers: [4, 6, 13, 15],
    luckyDay: 'Cuma',
    luckyColor: 'Pembe',
    loveStyle: 'Romantik ve uyumlu bir aşık. İlişkide denge ve eşitlik arar, partnerini mutlu etmek için çaba gösterir.',
    dateRange: '23 Eylül - 22 Ekim',
    quality: 'Öncü (Cardinal)',
    symbol: 'Terazi'
  },
  SCORPIO: {
    positive: ['Tutkulu', 'Kararlı', 'Cesur', 'Sadık', 'Sezgisel'],
    negative: ['Kıskanç', 'Gizli', 'İntikamcı', 'Obsesif', 'Manipülatif'],
    element: 'Su 💧',
    planet: 'Plüton ♇ / Mars ♂',
    description: 'Akrep burcu, yoğun duyguları ve derin sezgileriyle bilinir. Gizemli ve tutkulu Akrepler, hedeflerine ulaşmak için büyük kararlılık gösterir.',
    compatible: ['Yengeç', 'Balık', 'Başak', 'Oğlak'],
    incompatible: ['Aslan', 'Kova'],
    luckyNumbers: [8, 11, 18, 22],
    luckyDay: 'Salı',
    luckyColor: 'Bordo',
    loveStyle: 'Tutkulu ve yoğun bir aşık. Derin duygusal bağlar kurar, sadakat ve güven en önemli unsurlardır.',
    dateRange: '23 Ekim - 21 Kasım',
    quality: 'Sabit (Fixed)',
    symbol: 'Akrep'
  },
  SAGITTARIUS: {
    positive: ['İyimser', 'Maceracı', 'Dürüst', 'Felsefi', 'Özgür ruhlu'],
    negative: ['Taktıksız', 'Sabırsız', 'Sorumsuz', 'Abartıcı', 'Tutarsız'],
    element: 'Ateş 🔥',
    planet: 'Jüpiter ♃',
    description: 'Yay burcu, özgürlük ve macera tutkusuyla tanınır. Felsefi düşünceye yatkın olan Yaylar, hayatın anlamını keşfetmek için sürekli yolculuk halindedir.',
    compatible: ['Koç', 'Aslan', 'Terazi', 'Kova'],
    incompatible: ['Başak', 'Balık'],
    luckyNumbers: [3, 7, 9, 12],
    luckyDay: 'Perşembe',
    luckyColor: 'Mor',
    loveStyle: 'Maceracı ve eğlenceli bir partner. Özgürlüğüne düşkün, birlikte keşfedilecek deneyimler arar.',
    dateRange: '22 Kasım - 21 Aralık',
    quality: 'Değişken (Mutable)',
    symbol: 'Okçu'
  },
  CAPRICORN: {
    positive: ['Disiplinli', 'Sorumlu', 'Hırslı', 'Pratik', 'Sabırlı'],
    negative: ['Pesimist', 'İnatçı', 'İş odaklı', 'Soğuk', 'Katı'],
    element: 'Toprak 🌍',
    planet: 'Satürn ♄',
    description: 'Oğlak burcu, azim ve disiplinle başarıya ulaşan bir burçtur. Kariyer odaklı ve sorumlu Oğlaklar, uzun vadeli hedefler için çalışmaktan çekinmez.',
    compatible: ['Boğa', 'Başak', 'Akrep', 'Balık'],
    incompatible: ['Koç', 'Terazi'],
    luckyNumbers: [4, 8, 13, 22],
    luckyDay: 'Cumartesi',
    luckyColor: 'Kahverengi',
    loveStyle: 'Sadık ve güvenilir bir partner. Yavaş başlar ama uzun vadeli, sağlam ilişkiler kurar.',
    dateRange: '22 Aralık - 19 Ocak',
    quality: 'Öncü (Cardinal)',
    symbol: 'Keçi'
  },
  AQUARIUS: {
    positive: ['Yenilikçi', 'İnsancıl', 'Bağımsız', 'Entelektüel', 'Vizyoner'],
    negative: ['Mesafeli', 'İnatçı', 'Öngörülmez', 'Aşırı idealist', 'İsyankar'],
    element: 'Hava 💨',
    planet: 'Uranüs ♅ / Satürn ♄',
    description: 'Kova burcu, yenilikçi fikirleri ve insancıl yaklaşımıyla öne çıkar. Bağımsız düşünen Kovalar, toplumsal değişim için mücadele eder.',
    compatible: ['İkizler', 'Terazi', 'Koç', 'Yay'],
    incompatible: ['Boğa', 'Akrep'],
    luckyNumbers: [4, 7, 11, 22],
    luckyDay: 'Cumartesi',
    luckyColor: 'Turkuaz',
    loveStyle: 'Özgün ve entelektüel bir aşık. Zihinsel bağ önemlidir, arkadaşlık temelli ilişkiler kurar.',
    dateRange: '20 Ocak - 18 Şubat',
    quality: 'Sabit (Fixed)',
    symbol: 'Su Taşıyıcı'
  },
  PISCES: {
    positive: ['Empatik', 'Sanatsal', 'Sezgisel', 'Şefkatli', 'Hayal gücü'],
    negative: ['Kaçış eğilimli', 'Aşırı hassas', 'Kurban psikolojisi', 'Gerçekçi değil', 'Kararsız'],
    element: 'Su 💧',
    planet: 'Neptün ♆ / Jüpiter ♃',
    description: 'Balık burcu, zodiakın en sezgisel ve empatik burcudur. Sanatsal yetenekleri güçlü olan Balıklar, duygusal derinlikleriyle çevrelerine ilham verir.',
    compatible: ['Yengeç', 'Akrep', 'Boğa', 'Oğlak'],
    incompatible: ['İkizler', 'Yay'],
    luckyNumbers: [3, 9, 12, 15],
    luckyDay: 'Perşembe',
    luckyColor: 'Deniz Mavisi',
    loveStyle: 'Romantik ve rüya gibi bir aşık. Derin duygusal bağlar kurar, sezgileriyle partnerini anlar.',
    dateRange: '19 Şubat - 20 Mart',
    quality: 'Değişken (Mutable)',
    symbol: 'Balıklar'
  }
};

export default function UserProfileScreen() {
  const { currentMode } = useAuth();
  const { refreshPrivateChats } = useChat();
  const { showLoading, hideLoading } = useLoading();
  const router = useRouter();
  const { userId, chatRoomId } = useLocalSearchParams();
  const { blockUser: performBlockUser, loading: blockLoading } = useBlock();
  const { unmatchUser: performUnmatchUser, loading: unmatchLoading } = useUnmatch();
  
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'astrology' | 'music'>('astrology');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showUnmatchModal, setShowUnmatchModal] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  
  const photoFlatListRef = useRef<FlatList>(null);

  // Tema
  const theme = {
    astrology: {
      primary: '#8000FF',
      secondary: '#5B00B5',
      gradient: ['#8000FF', '#5B00B5', '#3D007A'] as const,
    },
    music: {
      primary: '#1DB954',
      secondary: '#1ED760',
      gradient: ['#1DB954', '#1ED760', '#1AA34A'] as const,
    }
  };
  const currentTheme = theme[currentMode];

  // User ID'yi number'a çevir
  const userIdNum = parseInt(userId as string, 10);
  const chatRoomIdNum = chatRoomId ? parseInt(chatRoomId as string, 10) : null;

  // Veri yükle
  useEffect(() => {
    const loadData = async () => {
      if (isNaN(userIdNum)) return;
      
      setIsLoading(true);
      showLoading('Profil yükleniyor...');
      try {
        const userData = await userApi.getUserProfile(userIdNum);
        setUser(userData);
        hideLoading();
        console.log('✅ [USER PROFILE] Profil yüklendi:', userData);
      } catch (error: any) {
        console.error('❌ [USER PROFILE] Veri yüklenemedi:', error);
        hideLoading();
        
        if (error.response?.status === 404) {
          Alert.alert(
            'Kullanıcı Bulunamadı',
            'Bu kullanıcı artık mevcut değil.',
            [{ text: 'Tamam', onPress: () => router.back() }]
          );
        } else if (error.response?.status === 403) {
          // Engellenmiş kullanıcı
          setIsBlocked(true);
        } else {
          Alert.alert('Hata', 'Profil yüklenemedi');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userIdNum]);

  // Block işlemi
  const handleBlock = async () => {
    try {
      console.log('🔄 [USER PROFILE] Block işlemi başlatılıyor...');
      
      await performBlockUser(userIdNum, 'PROFILE');
      setShowBlockModal(false);
      
      console.log('✅ [USER PROFILE] Block başarılı');
      
      // ⚠️ ÖNEMLİ: Backend chat'i kapattı (closedReason=BLOCK)
      // Chat listesini yenile - Kapalı chat'ler artık filtrelenecek
      try {
        await refreshPrivateChats();
        console.log('✅ [USER PROFILE] Chat listesi başarıyla yenilendi');
      } catch (refreshError) {
        console.error('⚠️ [USER PROFILE] Chat listesi yenileme hatası:', refreshError);
      }
      
      Alert.alert(
        'Başarılı',
        'Kullanıcı engellendi',
        [{ text: 'Tamam', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('❌ [USER PROFILE] Block hatası:', error);
      Alert.alert('Hata', 'Engelleme işlemi başarısız oldu');
    }
  };

  // Report işlemi
  const handleReport = async (reason: string) => {
    setIsActionLoading(true);
    try {
      await relationshipApi.reportUser(userIdNum, reason);
      setShowReportModal(false);
      Alert.alert('Başarılı', 'Şikayetiniz alındı. İnceleme sonrasında gerekli işlemler yapılacaktır.');
    } catch (error: any) {
      console.error('❌ [USER PROFILE] Report hatası:', error);
      Alert.alert('Hata', 'Şikayet gönderilemedi');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Sohbeti Bitir (Unmatch) işlemi
  const handleUnmatch = async () => {
    // Backend Universal ID sistemi: hem Match ID hem Chat Room ID kabul eder
    // Öncelik: chatRoomId -> matchId -> chatRoomId (user)
    const idToUse = chatRoomIdNum || user?.matchId || user?.chatRoomId;
    
    if (!idToUse) {
      console.error('❌ [USER PROFILE] Unmatch için ID bulunamadı:', {
        userMatchId: user?.matchId,
        chatRoomIdParam: chatRoomIdNum,
        userChatRoomId: user?.chatRoomId
      });
      Alert.alert('Hata', 'Eşleşme bilgisi bulunamadı. Lütfen sohbet ekranından tekrar deneyin.');
      return;
    }
    
    try {
      console.log('🔄 [USER PROFILE] Unmatch işlemi başlatılıyor (Universal ID):', { idToUse });
      
      await performUnmatchUser(idToUse);
      setShowUnmatchModal(false);
      
      console.log('✅ [USER PROFILE] Unmatch başarılı, chat listesi yenileniyor...');
      
      // ⚠️ ÖNEMLİ: Backend chat'i kapattı (closedReason=UNMATCH)
      // Chat listesini yenile - Kapalı chat'ler artık filtrelenecek
      try {
        await refreshPrivateChats();
        console.log('✅ [USER PROFILE] Chat listesi başarıyla güncellendi');
      } catch (refreshError) {
        console.error('⚠️ [USER PROFILE] Chat listesi yenileme hatası:', refreshError);
        // Yenileme hatası olsa bile kullanıcıyı bilgilendir
      }
      
      Alert.alert(
        'Sohbet Sonlandırıldı',
        'Eşleşme ve sohbet başarıyla sonlandırıldı.',
        [{ text: 'Tamam', onPress: () => router.replace('/(tabs)/chat' as any) }]
      );
    } catch (error: any) {
      console.error('❌ [USER PROFILE] Unmatch hatası:', error);
      const errorMsg = error.response?.data?.message || 'Sohbet sonlandırılamadı';
      Alert.alert('Hata', errorMsg);
    }
  };

  // Mesaj gönder
  const handleSendMessage = () => {
    if (chatRoomIdNum) {
      router.push(`/chat/${chatRoomIdNum}` as any);
    } else {
      Alert.alert('Bilgi', 'Mesaj göndermek için önce eşleşmeniz gerekiyor.');
    }
  };

  // Fotoğrafa tıklama (sonraki/önceki fotoğraf)
  const handlePhotoTap = (event: any) => {
    if (!user) return;
    const photos = user.photos || (user.profileImageUrl ? [user.profileImageUrl] : []);
    if (photos.length <= 1) return;
    
    const tapX = event.nativeEvent.locationX;
    const screenHalf = SCREEN_WIDTH / 2;
    
    if (tapX > screenHalf) {
      // Sağa tıklama - sonraki
      const nextIndex = (currentPhotoIndex + 1) % photos.length;
      setCurrentPhotoIndex(nextIndex);
      photoFlatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      // Sola tıklama - önceki
      const prevIndex = currentPhotoIndex === 0 ? photos.length - 1 : currentPhotoIndex - 1;
      setCurrentPhotoIndex(prevIndex);
      photoFlatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: currentTheme.primary }]}>
        <LinearGradient colors={currentTheme.gradient} style={styles.background} />
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      </View>
    );
  }

  // Blocked state
  if (isBlocked) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        <View style={styles.blockedHeader}>
          <TouchableOpacity style={styles.blockedBackButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.blockedHeaderTitle}>Profil</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.blockedFullContainer}>
          <View style={styles.blockedIconContainer}>
            <Ionicons name="ban" size={80} color="#FF6B6B" />
          </View>
          <Text style={styles.blockedFullTitle}>Bu kullanıcıyla etkileşim mümkün değil</Text>
          <Text style={styles.blockedFullMessage}>
            Bu kullanıcı ile iletişim kurulamıyor.
          </Text>
          
          <TouchableOpacity 
            style={styles.blockedBackButtonAlt}
            onPress={() => router.back()}
          >
            <Text style={styles.blockedBackButtonAltText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
        <Text style={styles.errorText}>Profil bulunamadı</Text>
        <TouchableOpacity style={styles.backButtonAlt} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const age = calculateAge(user.birthDate);
  const photos = user.photos || (user.profileImageUrl ? [user.profileImageUrl] : []);
  const zodiacSign = user.zodiacSign?.toString().toUpperCase() || '';
  const zodiacTurkish = user.zodiacSignTurkish || getZodiacTurkish(zodiacSign);
  const zodiacEmoji = user.zodiacSignEmoji || getZodiacEmoji(zodiacSign);
  const traits = zodiacTraits[zodiacSign] || null;

  // Astroloji Tab içeriği
  const renderAstrologyTab = () => (
    <View style={styles.tabContent}>
      {/* Burç kartı */}
      <View style={styles.zodiacCard}>
        <LinearGradient
          colors={['#8000FF', '#5B00B5']}
          style={styles.zodiacCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.zodiacCardEmoji}>{zodiacEmoji}</Text>
          <Text style={styles.zodiacCardName}>{zodiacTurkish}</Text>
          {traits && (
            <>
              <Text style={styles.zodiacCardDateRange}>{traits.dateRange}</Text>
              <View style={styles.zodiacCardDetails}>
                <View style={styles.zodiacDetailItem}>
                  <Text style={styles.zodiacDetailLabel}>Element</Text>
                  <Text style={styles.zodiacDetailValue}>{traits.element}</Text>
                </View>
                <View style={styles.zodiacDetailItem}>
                  <Text style={styles.zodiacDetailLabel}>Gezegen</Text>
                  <Text style={styles.zodiacDetailValue}>{traits.planet}</Text>
                </View>
                <View style={styles.zodiacDetailItem}>
                  <Text style={styles.zodiacDetailLabel}>Nitelik</Text>
                  <Text style={styles.zodiacDetailValue}>{traits.quality}</Text>
                </View>
              </View>
            </>
          )}
        </LinearGradient>
      </View>

      {/* Burç açıklaması */}
      {traits && (
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>{traits.description}</Text>
        </View>
      )}

      {/* Şanslı Bilgiler */}
      {traits && (
        <View style={styles.luckyCard}>
          <View style={styles.luckyHeader}>
            <Ionicons name="star" size={24} color="#FFD700" />
            <Text style={styles.luckyTitle}>Şanslı Bilgiler</Text>
          </View>
          <View style={styles.luckyGrid}>
            <View style={styles.luckyItem}>
              <Ionicons name="calendar" size={20} color="#B8B8D0" />
              <Text style={styles.luckyLabel}>Şanslı Gün</Text>
              <Text style={styles.luckyValue}>{traits.luckyDay}</Text>
            </View>
            <View style={styles.luckyItem}>
              <Ionicons name="color-palette" size={20} color="#B8B8D0" />
              <Text style={styles.luckyLabel}>Şanslı Renk</Text>
              <Text style={styles.luckyValue}>{traits.luckyColor}</Text>
            </View>
            <View style={styles.luckyItem}>
              <Ionicons name="apps" size={20} color="#B8B8D0" />
              <Text style={styles.luckyLabel}>Şanslı Sayılar</Text>
              <Text style={styles.luckyValue}>{traits.luckyNumbers.join(', ')}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Aşk Stili */}
      {traits && (
        <View style={styles.loveCard}>
          <View style={styles.loveHeader}>
            <Ionicons name="heart" size={24} color="#FF6B9D" />
            <Text style={styles.loveTitle}>Aşk & İlişki</Text>
          </View>
          <Text style={styles.loveText}>{traits.loveStyle}</Text>
        </View>
      )}

      {/* Uyumlu Burçlar */}
      {traits && (
        <View style={styles.compatibilityCard}>
          <View style={styles.compatibilitySection}>
            <View style={styles.compatibilityHeader}>
              <Ionicons name="heart-circle" size={22} color="#4CAF50" />
              <Text style={styles.compatibilityTitle}>Uyumlu Burçlar</Text>
            </View>
            <View style={styles.compatibilityList}>
              {traits.compatible.map((sign, index) => (
                <View key={index} style={styles.compatibleBadge}>
                  <Text style={styles.compatibleText}>{sign}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.compatibilityDivider} />
          <View style={styles.compatibilitySection}>
            <View style={styles.compatibilityHeader}>
              <Ionicons name="heart-dislike" size={22} color="#FF6B6B" />
              <Text style={styles.compatibilityTitle}>Zor Uyum</Text>
            </View>
            <View style={styles.compatibilityList}>
              {traits.incompatible.map((sign, index) => (
                <View key={index} style={styles.incompatibleBadge}>
                  <Text style={styles.incompatibleText}>{sign}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Olumlu özellikler */}
      {traits && (
        <View style={styles.traitsCard}>
          <View style={styles.traitsHeader}>
            <Ionicons name="add-circle" size={24} color="#4CAF50" />
            <Text style={styles.traitsTitle}>Olumlu Özellikler</Text>
          </View>
          <View style={styles.traitsContainer}>
            {traits.positive.map((trait, index) => (
              <View key={index} style={[styles.traitBadge, styles.positiveBadge]}>
                <Text style={styles.positiveText}>{trait}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Olumsuz özellikler */}
      {traits && (
        <View style={styles.traitsCard}>
          <View style={styles.traitsHeader}>
            <Ionicons name="remove-circle" size={24} color="#FF6B6B" />
            <Text style={styles.traitsTitle}>Dikkat Edilmesi Gerekenler</Text>
          </View>
          <View style={styles.traitsContainer}>
            {traits.negative.map((trait, index) => (
              <View key={index} style={[styles.traitBadge, styles.negativeBadge]}>
                <Text style={styles.negativeText}>{trait}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Bio */}
      {user.bio && (
        <View style={styles.bioCard}>
          <View style={styles.bioHeader}>
            <Ionicons name="person" size={20} color="#8000FF" />
            <Text style={styles.bioTitle}>Hakkında</Text>
          </View>
          <Text style={styles.bioText}>{user.bio}</Text>
        </View>
      )}
    </View>
  );

  // Müzik Tab içeriği
  const renderMusicTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.comingSoonContainer}>
        <LinearGradient
          colors={['#1DB954', '#1ED760']}
          style={styles.comingSoonGradient}
        >
          <Ionicons name="musical-notes" size={80} color="white" />
          <Text style={styles.comingSoonTitle}>Yakında Gelecek</Text>
          <Text style={styles.comingSoonText}>
            Müzik zevklerinizi keşfetmeniz için harika özellikler geliyor!
          </Text>
          <View style={styles.comingSoonFeatures}>
            <View style={styles.featureItem}>
              <Ionicons name="heart" size={20} color="white" />
              <Text style={styles.featureText}>Favori şarkılar</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="people" size={20} color="white" />
              <Text style={styles.featureText}>Ortak sanatçılar</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="stats-chart" size={20} color="white" />
              <Text style={styles.featureText}>Müzik uyumu</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} bounces={false}>
        {/* Fotoğraf Galerisi */}
        <View style={styles.photoContainer}>
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={handlePhotoTap}
            style={styles.photoTouchable}
          >
            {photos.length > 0 ? (
              <>
                <FlatList
                  ref={photoFlatListRef}
                  data={photos}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                    setCurrentPhotoIndex(index);
                  }}
                  renderItem={({ item }) => (
                    <Image
                      source={{ uri: item }}
                      style={styles.profilePhoto}
                      resizeMode="cover"
                    />
                  )}
                  keyExtractor={(item, index) => index.toString()}
                  getItemLayout={(data, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index
                  })}
                />
                
                {/* Photo indicators */}
                {photos.length > 1 && (
                  <View style={styles.photoIndicators}>
                    {photos.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.photoIndicator,
                          currentPhotoIndex === index && styles.photoIndicatorActive
                        ]}
                      />
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={[styles.noPhotoContainer, { backgroundColor: currentTheme.secondary }]}>
                <Text style={styles.noPhotoText}>{user.firstName?.charAt(0) || '?'}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {/* Gradient overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.photoGradient}
            pointerEvents="none"
          />
          
          {/* Geri butonu */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          {/* More options butonu */}
          <TouchableOpacity style={styles.moreButton} onPress={() => setShowReportModal(true)}>
            <Ionicons name="ellipsis-vertical" size={20} color="white" />
          </TouchableOpacity>
          
          {/* İsim ve yaş overlay */}
          <View style={styles.nameOverlay}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>
                {user.firstName} {user.lastName}
              </Text>
              {age && <Text style={styles.userAge}>, {age}</Text>}
              {user.isPremium && <Text style={styles.premiumBadge}>👑</Text>}
            </View>
            <View style={styles.zodiacRow}>
              <Text style={styles.zodiacEmoji}>{zodiacEmoji}</Text>
              <Text style={styles.zodiacText}>{zodiacTurkish}</Text>
            </View>
          </View>
        </View>
        
        {/* Tab Buttons */}
        <View style={styles.tabButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'astrology' && styles.tabButtonActive,
              activeTab === 'astrology' && { borderBottomColor: '#8000FF' }
            ]}
            onPress={() => setActiveTab('astrology')}
          >
            <Ionicons 
              name="planet" 
              size={22} 
              color={activeTab === 'astrology' ? '#8000FF' : '#999'} 
            />
            <Text style={[
              styles.tabButtonText,
              activeTab === 'astrology' && styles.tabButtonTextActive,
              activeTab === 'astrology' && { color: '#8000FF' }
            ]}>
              Astroloji
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'music' && styles.tabButtonActive,
              activeTab === 'music' && { borderBottomColor: '#1DB954' }
            ]}
            onPress={() => setActiveTab('music')}
          >
            <Ionicons 
              name="musical-notes" 
              size={22} 
              color={activeTab === 'music' ? '#1DB954' : '#999'} 
            />
            <Text style={[
              styles.tabButtonText,
              activeTab === 'music' && styles.tabButtonTextActive,
              activeTab === 'music' && { color: '#1DB954' }
            ]}>
              Müzik
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab Content */}
        {activeTab === 'astrology' ? renderAstrologyTab() : renderMusicTab()}
        
        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <View style={styles.actionButtonsContainer}>
            {/* Mesaj Gönder */}
            {chatRoomIdNum && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: currentTheme.primary }]}
                onPress={handleSendMessage}
              >
                <Ionicons name="chatbubble" size={20} color="white" />
                <Text style={styles.actionButtonText}>Mesaj Gönder</Text>
              </TouchableOpacity>
            )}
            
            {/* Sohbeti Bitir */}
            {chatRoomIdNum && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.actionButtonWarning]}
                onPress={() => setShowUnmatchModal(true)}
              >
                <Ionicons name="close-circle" size={20} color="#FF9500" />
                <Text style={[styles.actionButtonText, { color: '#FF9500' }]}>Sohbeti Bitir</Text>
              </TouchableOpacity>
            )}
            
            {/* Engelle */}
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonDanger]}
              onPress={() => setShowBlockModal(true)}
            >
              <Ionicons name="ban" size={20} color="#FF3B30" />
              <Text style={[styles.actionButtonText, { color: '#FF3B30' }]}>Engelle</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Alt boşluk */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Block Modal */}
      <Modal visible={showBlockModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="ban" size={48} color="#FF3B30" />
            </View>
            <Text style={styles.modalTitle}>Kullanıcıyı Engelle</Text>
            <Text style={styles.modalMessage}>
              Bu kullanıcıyı engellerseniz mesajlaşamazsınız ve bir daha karşınıza çıkmaz.{'\n\n'}
              Engeli Ayarlar'dan kaldırabilirsiniz.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowBlockModal(false)}
                disabled={blockLoading}
              >
                <Text style={styles.modalButtonCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonDestructive]}
                onPress={handleBlock}
                disabled={blockLoading}
              >
                <Text style={styles.modalButtonDestructiveText}>
                  {blockLoading ? 'Engelleniyor...' : 'Engelle'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Report Modal */}
      <Modal visible={showReportModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="flag" size={48} color="#FF9500" />
            </View>
            <Text style={styles.modalTitle}>Kullanıcıyı Şikayet Et</Text>
            <Text style={styles.modalMessage}>Şikayet sebebinizi seçin:</Text>
            
            {['Uygunsuz içerik', 'Spam veya sahte profil', 'Taciz veya zorbalık', 'Diğer'].map((reason) => (
              <TouchableOpacity
                key={reason}
                style={styles.reportOption}
                onPress={() => handleReport(reason)}
                disabled={isActionLoading}
              >
                <Text style={styles.reportOptionText}>{reason}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonCancel, { marginTop: 12, width: '100%' }]}
              onPress={() => setShowReportModal(false)}
              disabled={isActionLoading}
            >
              <Text style={styles.modalButtonCancelText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Unmatch Modal */}
      <Modal visible={showUnmatchModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalIconContainer, { backgroundColor: 'rgba(255, 149, 0, 0.15)' }]}>
              <Ionicons name="close-circle" size={48} color="#FF9500" />
            </View>
            <Text style={styles.modalTitle}>Sohbeti Bitir</Text>
            <Text style={styles.modalMessage}>
              Eşleşmeyi sonlandırmak istediğinize emin misiniz?{'\n\n'}
              Bu işlem geri alınamaz ve sohbet geçmişi silinecektir.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowUnmatchModal(false)}
                disabled={unmatchLoading}
              >
                <Text style={styles.modalButtonCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonWarning]}
                onPress={handleUnmatch}
                disabled={unmatchLoading}
              >
                <Text style={styles.modalButtonWarningText}>
                  {unmatchLoading ? 'Sonlandırılıyor...' : 'Bitir'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D1A',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#B8B8D0',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D1A',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  backButtonAlt: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#1A1A2E',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#B8B8D0',
    fontWeight: '500',
  },
  
  // Photo section
  photoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.55,
    position: 'relative',
  },
  photoTouchable: {
    flex: 1,
  },
  profilePhoto: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.55,
  },
  noPhotoContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotoText: {
    fontSize: 80,
    color: 'white',
    fontWeight: 'bold',
  },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  photoIndicators: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 60,
    right: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  photoIndicator: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
  },
  photoIndicatorActive: {
    backgroundColor: 'white',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  userAge: {
    fontSize: 28,
    color: 'white',
    marginLeft: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  premiumBadge: {
    fontSize: 24,
    marginLeft: 8,
  },
  zodiacRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  zodiacEmoji: {
    fontSize: 24,
  },
  zodiacText: {
    fontSize: 18,
    color: 'white',
    marginLeft: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  // Tab Buttons
  tabButtonsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomWidth: 3,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B6B8D',
  },
  tabButtonTextActive: {
    fontWeight: '700',
  },
  
  // Tab Content
  tabContent: {
    padding: 16,
  },
  
  // Zodiac Card
  zodiacCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  zodiacCardGradient: {
    padding: 24,
    alignItems: 'center',
  },
  zodiacCardEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  zodiacCardName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  zodiacCardDateRange: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  zodiacCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },
  zodiacDetailItem: {
    alignItems: 'center',
    flex: 1,
  },
  zodiacDetailLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  zodiacDetailValue: {
    fontSize: 13,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  zodiacCardElement: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  zodiacCardPlanet: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  
  // Description Card
  descriptionCard: {
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  descriptionText: {
    fontSize: 15,
    color: '#B8B8D0',
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Traits Card
  traitsCard: {
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  traitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  traitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EAEAFF',
    marginLeft: 8,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  traitBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  positiveBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  negativeBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.4)',
  },
  positiveText: {
    fontSize: 14,
    color: '#81C784',
    fontWeight: '500',
  },
  negativeText: {
    fontSize: 14,
    color: '#FF8A80',
    fontWeight: '500',
  },
  
  // Lucky Card
  luckyCard: {
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  luckyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  luckyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EAEAFF',
    marginLeft: 8,
  },
  luckyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  luckyItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#252540',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  luckyLabel: {
    fontSize: 11,
    color: '#6B6B8D',
    marginTop: 8,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  luckyValue: {
    fontSize: 13,
    color: '#EAEAFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Love Card
  loveCard: {
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  loveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  loveTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EAEAFF',
    marginLeft: 8,
  },
  loveText: {
    fontSize: 14,
    color: '#B8B8D0',
    lineHeight: 22,
  },
  
  // Compatibility Card
  compatibilityCard: {
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  compatibilitySection: {
    marginBottom: 8,
  },
  compatibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  compatibilityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EAEAFF',
    marginLeft: 8,
  },
  compatibilityList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  compatibilityDivider: {
    height: 1,
    backgroundColor: '#2D2D44',
    marginVertical: 12,
  },
  compatibleBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  compatibleText: {
    fontSize: 13,
    color: '#81C784',
    fontWeight: '500',
  },
  incompatibleBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  incompatibleText: {
    fontSize: 13,
    color: '#FF8A80',
    fontWeight: '500',
  },
  
  // Bio Card
  bioCard: {
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  bioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EAEAFF',
    marginLeft: 8,
  },
  bioText: {
    fontSize: 15,
    color: '#B8B8D0',
    lineHeight: 24,
  },
  
  // Coming Soon
  comingSoonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  comingSoonGradient: {
    padding: 32,
    alignItems: 'center',
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 24,
  },
  comingSoonFeatures: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  
  // Actions section
  actionsSection: {
    padding: 20,
    backgroundColor: '#1A1A2E',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2D2D44',
  },
  actionButtonsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#8000FF',
  },
  actionButtonDanger: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  actionButtonWarning: {
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    borderWidth: 2,
    borderColor: '#FF9500',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  
  // Blocked state
  blockedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1A1A2E',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  blockedBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D2D44',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockedHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EAEAFF',
  },
  blockedFullContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#0D0D1A',
  },
  blockedIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  blockedFullTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#EAEAFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  blockedFullMessage: {
    fontSize: 15,
    color: '#B8B8D0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  blockedBackButtonAlt: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  blockedBackButtonAltText: {
    fontSize: 16,
    color: '#6B6B8D',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2D2D44',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EAEAFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#B8B8D0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  modalButtonCancel: {
    backgroundColor: '#2D2D44',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B8B8D0',
  },
  modalButtonDestructive: {
    backgroundColor: '#FF3B30',
  },
  modalButtonDestructiveText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  modalButtonWarning: {
    backgroundColor: '#FF9500',
  },
  modalButtonWarningText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  reportOption: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#2D2D44',
    borderRadius: 12,
    marginBottom: 8,
  },
  reportOptionText: {
    fontSize: 16,
    color: '#EAEAFF',
    textAlign: 'center',
  },
});
