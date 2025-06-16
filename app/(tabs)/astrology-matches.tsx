import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    interpolate,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { DiscoverUser, swipeApi, SwipeRequest } from '../services/api';
import { getZodiacEmoji, getZodiacTurkishName } from '../types/zodiac';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = height * 0.65;
const SWIPE_THRESHOLD = width * 0.25;

// Örnek astroloji eşleşme verileri (API'den veri gelene kadar)
const SAMPLE_ASTROLOGY_MATCHES: DiscoverUser[] = [
  {
    id: 1,
    firstName: 'Ayşe',
    lastName: 'Kaya',
    age: 27,
    zodiacSign: 'LEO',
    profileImageUrl: 'https://picsum.photos/400/600?random=1',
    photos: [{ imageUrl: 'https://picsum.photos/400/600?random=1' }],
    compatibilityScore: 94,
    compatibilityDescription: 'Ateş burcu enerjiniz mükemmel uyum gösteriyor! Aslan ve Koç birlikte harika bir çift oluşturur.',
    isOnline: true,
    distance: 2,
    bio: 'Yaşamı dolu dolu yaşayan, enerjik ve tutkulu bir Aslan. Macera ve yeni keşifler peşinde koşuyorum! 🦁✨',
    isVerified: true,
    isPremium: false,
    isNewUser: false
  },
  {
    id: 2,
    firstName: 'Mehmet',
    lastName: 'Demir',
    age: 30,
    zodiacSign: 'SCORPIO',
    profileImageUrl: 'https://picsum.photos/400/600?random=2',
    photos: [{ imageUrl: 'https://picsum.photos/400/600?random=2' }],
    compatibilityScore: 89,
    compatibilityDescription: 'Su ve ateş elementleri arasındaki çekim büyüleyici! Derin bağ kurabilirsiniz.',
    isOnline: false,
    distance: 5,
    bio: 'Gizemli ruhlu bir Akrep. Derin sohbetleri ve anlamlı bağları seviyorum. Astroloji ve spiritüellik ilgi alanım 🦂🔮',
    isVerified: false,
    isPremium: true,
    isNewUser: true
  },
  {
    id: 3,
    firstName: 'Elif',
    lastName: 'Yılmaz',
    age: 25,
    zodiacSign: 'GEMINI',
    profileImageUrl: 'https://picsum.photos/400/600?random=3',
    photos: [{ imageUrl: 'https://picsum.photos/400/600?random=3' }],
    compatibilityScore: 92,
    compatibilityDescription: 'Hava ve ateş elementleri birbirini beslir! Sosyal ve dinamik bir ilişki yaşayabilirsiniz.',
    isOnline: true,
    distance: 1,
    bio: 'Meraklı ve konuşkan bir İkizler. Her konuda sohbet edebilir, hayatı renkli kılabilirim! 👯‍♀️💫',
    isVerified: true,
    isPremium: false,
    isNewUser: false
  },
  {
    id: 4,
    firstName: 'Burak',
    lastName: 'Özkan',
    age: 28,
    zodiacSign: 'TAURUS',
    profileImageUrl: 'https://picsum.photos/400/600?random=4',
    photos: [{ imageUrl: 'https://picsum.photos/400/600?random=4' }],
    compatibilityScore: 87,
    compatibilityDescription: 'Toprak elementinin sakinliği, ateş elementinin tutkusunu dengeleyebilir.',
    isOnline: true,
    distance: 7,
    bio: 'Sakin ve güvenilir bir Boğa. Güzel yemekler, doğa yürüyüşleri ve huzurlu anları seviyorum 🐂🌿',
    isVerified: false,
    isPremium: false,
    isNewUser: false
  },
  {
    id: 5,
    firstName: 'Zeynep',
    lastName: 'Acar',
    age: 26,
    zodiacSign: 'LIBRA',
    profileImageUrl: 'https://picsum.photos/400/600?random=5',
    photos: [{ imageUrl: 'https://picsum.photos/400/600?random=5' }],
    compatibilityScore: 91,
    compatibilityDescription: 'Hava elementinin dengeleyici etkisi, ateş elementinin enerjisini mükemmel tamamlar.',
    isOnline: false,
    distance: 4,
    bio: 'Dengeyi ve uyumu seven bir Terazi. Sanat, güzellik ve adaletin peşindeyim ⚖️🎭',
    isVerified: true,
    isPremium: true,
    isNewUser: false
  }
];

interface SwipeCardProps {
  user: DiscoverUser;
  index: number;
  totalCards: number;
  onSwipeLeft: (user: DiscoverUser) => void;
  onSwipeRight: (user: DiscoverUser) => void;
  onSuperLike: (user: DiscoverUser) => void;
  isActive: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  user,
  index,
  totalCards,
  onSwipeLeft,
  onSwipeRight,
  onSuperLike,
  isActive
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(isActive ? 1 : 0.95 - (index * 0.02));
  const opacity = useSharedValue(isActive ? 1 : 0.8 - (index * 0.1));
  const rotate = useSharedValue(0);

  // Swipe etiketlerinin opacity değerleri
  const likeOpacity = useSharedValue(0);
  const nopeOpacity = useSharedValue(0);
  const superLikeOpacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withSpring(1);
    } else {
      scale.value = withSpring(0.95 - (index * 0.02));
      opacity.value = withSpring(0.8 - (index * 0.1));
    }
  }, [isActive, index]);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      if (!isActive) return;
    },
    onActive: (event) => {
      if (!isActive) return;
      
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotate.value = interpolate(
        event.translationX,
        [-width, 0, width],
        [-10, 0, 10]
      );

      // Swipe etiketlerinin görünürlüğü
      if (event.translationY < -100) {
        // Super like
        superLikeOpacity.value = interpolate(
          event.translationY,
          [-200, -100],
          [1, 0]
        );
        likeOpacity.value = 0;
        nopeOpacity.value = 0;
      } else if (event.translationX > 50) {
        // Like
        likeOpacity.value = interpolate(
          event.translationX,
          [50, 150],
          [0, 1]
        );
        nopeOpacity.value = 0;
        superLikeOpacity.value = 0;
      } else if (event.translationX < -50) {
        // Nope
        nopeOpacity.value = interpolate(
          event.translationX,
          [-150, -50],
          [1, 0]
        );
        likeOpacity.value = 0;
        superLikeOpacity.value = 0;
      } else {
        likeOpacity.value = 0;
        nopeOpacity.value = 0;
        superLikeOpacity.value = 0;
      }
    },
    onEnd: (event) => {
      if (!isActive) return;

      const shouldSwipeLeft = event.translationX < -SWIPE_THRESHOLD;
      const shouldSwipeRight = event.translationX > SWIPE_THRESHOLD;
      const shouldSuperLike = event.translationY < -150;

      if (shouldSuperLike) {
        // Super like animasyonu
        translateY.value = withTiming(-height, { duration: 300 });
        scale.value = withTiming(0.8, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });
        runOnJS(onSuperLike)(user);
      } else if (shouldSwipeLeft || shouldSwipeRight) {
        // Sağa veya sola swipe
        const toValue = shouldSwipeLeft ? -width * 1.5 : width * 1.5;
        translateX.value = withTiming(toValue, { duration: 300 });
        rotate.value = withTiming(shouldSwipeLeft ? -20 : 20, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });
        
        if (shouldSwipeLeft) {
          runOnJS(onSwipeLeft)(user);
        } else {
          runOnJS(onSwipeRight)(user);
        }
      } else {
        // Geri dön
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
        likeOpacity.value = withTiming(0);
        nopeOpacity.value = withTiming(0);
        superLikeOpacity.value = withTiming(0);
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: likeOpacity.value,
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: nopeOpacity.value,
  }));

  const superLikeStyle = useAnimatedStyle(() => ({
    opacity: superLikeOpacity.value,
  }));

  const zodiacEmoji = getZodiacEmoji(user.zodiacSign);
  const zodiacName = getZodiacTurkishName(user.zodiacSign);

  return (
    <PanGestureHandler onGestureEvent={gestureHandler} enabled={isActive}>
      <Animated.View style={[styles.cardContainer, cardStyle, { zIndex: totalCards - index }]}>
        <View style={styles.card}>
          {/* Arka plan görseli */}
          <View style={styles.imageContainer}>
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>
                {user.firstName[0]}{user.lastName[0]}
              </Text>
            </View>
            
            {/* Online göstergesi */}
            {user.isOnline && (
              <View style={styles.onlineIndicator} />
            )}
            
            {/* Verified göstergesi */}
            {user.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#1DB954" />
              </View>
            )}
            
            {/* Premium göstergesi */}
            {user.isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="diamond" size={16} color="#FFD700" />
              </View>
            )}
          </View>

          {/* Kullanıcı bilgileri */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.infoGradient}
          >
            <View style={styles.userInfo}>
              {/* Ana bilgiler */}
              <View style={styles.nameRow}>
                <Text style={styles.userName}>
                  {user.firstName} {user.lastName}, {user.age}
                </Text>
                <View style={styles.compatibilityBadge}>
                  <Text style={styles.compatibilityText}>%{user.compatibilityScore}</Text>
                </View>
              </View>

              {/* Burç bilgileri */}
              <View style={styles.zodiacRow}>
                <Text style={styles.zodiacEmoji}>{zodiacEmoji}</Text>
                <Text style={styles.zodiacName}>{zodiacName}</Text>
                <Text style={styles.distance}>• {user.distance} km</Text>
              </View>

              {/* Uyumluluk açıklaması */}
              <Text style={styles.compatibilityDescription} numberOfLines={2}>
                {user.compatibilityDescription}
              </Text>

              {/* Bio */}
              {user.bio && (
                <Text style={styles.bioText} numberOfLines={3}>
                  {user.bio}
                </Text>
              )}
            </View>
          </LinearGradient>

          {/* Swipe etiketleri */}
          <Animated.View style={[styles.likeLabel, likeStyle]}>
            <Text style={styles.likeLabelText}>UYUMLU</Text>
          </Animated.View>

          <Animated.View style={[styles.nopeLabel, nopeStyle]}>
            <Text style={styles.nopeLabelText}>GEÇIYORUM</Text>
          </Animated.View>

          <Animated.View style={[styles.superLikeLabel, superLikeStyle]}>
            <Text style={styles.superLikeLabelText}>SÜPER UYUM!</Text>
            <Text style={styles.starIcon}>⭐</Text>
          </Animated.View>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default function AstrologyMatchesScreen() {
  const colorScheme = useColorScheme();
  const { userProfile } = useProfile();
  const { isPremium } = useAuth();
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [swipeCount, setSwipeCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const maxSwipes = isPremium ? 999 : 20;

  // Animasyon değerleri
  const fadeAnim = useSharedValue(1);
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    // Pulse animasyonu
    pulseAnim.value = withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) });
    const interval = setInterval(() => {
      pulseAnim.value = withTiming(1.05, { duration: 1000 }, () => {
        pulseAnim.value = withTiming(1, { duration: 1000 });
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Manuel test fonksiyonu
  const testApiConnection = async () => {
    console.log('🧪 [TEST] API bağlantı testi başlatılıyor...');
    try {
      const { getToken } = await import('../utils/tokenStorage');
      const token = await getToken();
      console.log('🔑 [TEST] Token:', token ? 'VAR' : 'YOK');
      
      if (!token) {
        console.log('❌ [TEST] Token yok, giriş yapmanız gerekiyor');
        return;
      }
      
      console.log('📡 [TEST] SwipeApi.getDiscoverUsers çağrılıyor...');
      const response = await swipeApi.getDiscoverUsers(1, 5);
      console.log('✅ [TEST] API başarılı:', response);
    } catch (error: any) {
      console.error('❌ [TEST] API hatası:', error);
    }
  };

  useEffect(() => {
    console.log('🎯 [ASTROLOGY] Component mount edildi');
    // İlk yükleme için 1 saniye bekle
    setTimeout(() => {
      loadDiscoverUsers();
    }, 1000);
  }, []);

  const loadDiscoverUsers = async () => {
    if (isLoading || !hasMore) {
      console.log('⏳ [ASTROLOGY] Skip loading:', { isLoading, hasMore });
      return;
    }
    
    console.log('🚀 [ASTROLOGY] loadDiscoverUsers başlatıldı, sayfa:', page);
    setIsLoading(true);
    
    try {
      console.log('🔄 [ASTROLOGY] Gerçek kullanıcılar yükleniyor..., sayfa:', page);
      
      // Önce token kontrolü yapalım
      const { getToken } = await import('../utils/tokenStorage');
      const token = await getToken();
      console.log('🔑 [ASTROLOGY] Token durumu:', token ? `Mevcut (${token.substring(0, 20)}...)` : 'Yok');
      
      if (!token) {
        console.log('❌ [ASTROLOGY] Token bulunamadı, fallback kullanılıyor');
        throw new Error('Token bulunamadı');
      }
      
      // API çağrısı öncesi log
      console.log('📡 [ASTROLOGY] API çağrısı yapılıyor...', {
        endpoint: '/api/swipes/discover',
        params: { page, limit: 10 }
      });
      
      const response = await swipeApi.getDiscoverUsers(page, 10);
      
      console.log('📊 [ASTROLOGY] API Response alındı:', {
        success: response?.success,
        usersLength: response?.users?.length,
        hasMore: response?.hasMore,
        totalCount: response?.totalCount,
        fullResponse: response
      });
      
      if (response && response.success && response.users && response.users.length > 0) {
        console.log('✅ [ASTROLOGY] Gerçek kullanıcılar yüklendi:', response.users.length);
        
        if (page === 1) {
          // İlk sayfa - tümünü değiştir
          setUsers(response.users);
          setCurrentIndex(0); // Index'i sıfırla
        } else {
          // Sonraki sayfalar - ekle
          setUsers(prev => [...prev, ...response.users]);
        }
        
        setHasMore(response.hasMore || false);
        setPage(prev => prev + 1);
      } else {
        console.log('⚠️ [ASTROLOGY] API den kullanıcı bulunamadı veya boş response');
        throw new Error('API response invalid');
      }
    } catch (error: any) {
      console.error('❌ [ASTROLOGY] Kullanıcı yükleme hatası:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });
      
      // Hata durumunda fallback sample data kullan
      if (page === 1) {
        console.log('🔄 [ASTROLOGY] Fallback: Sample veriler yükleniyor...');
        setUsers(SAMPLE_ASTROLOGY_MATCHES);
        setCurrentIndex(0);
        setHasMore(false);
      }
    } finally {
      // Loading'i 2 saniye sonra kapat (animasyon için)
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  // Kartlar azaldığında yeni veri yükle
  useEffect(() => {
    const remainingCards = users.length - currentIndex;
    if (remainingCards <= 2 && hasMore && !isLoading) {
      loadDiscoverUsers();
    }
  }, [currentIndex, users.length, hasMore, isLoading]);

  const handleSwipeLeft = async (user: DiscoverUser) => {
    console.log('👎 Dislike:', user.firstName);
    await performSwipe(user, 'DISLIKE');
    setTimeout(moveToNextCard, 300);
  };

  const handleSwipeRight = async (user: DiscoverUser) => {
    console.log('👍 Like:', user.firstName);
    await performSwipe(user, 'LIKE');
    setTimeout(moveToNextCard, 300);
  };

  const handleSuperLike = async (user: DiscoverUser) => {
    console.log('⭐ Super Like:', user.firstName);
    await performSwipe(user, 'LIKE'); // Super like de LIKE olarak gönderiliyor
    setTimeout(moveToNextCard, 300);
  };

  const performSwipe = async (user: DiscoverUser, action: 'LIKE' | 'DISLIKE') => {
    if (swipeCount >= maxSwipes && !isPremium) {
      Alert.alert(
        'Swipe Limiti',
        'Günlük swipe limitinizi aştınız. Premium üyelikle sınırsız swipe yapabilirsiniz.',
        [{ text: 'Tamam' }]
      );
      return;
    }

    try {
      const swipeRequest: SwipeRequest = {
        targetUserId: user.id.toString(),
        action: action
      };

      const response = await swipeApi.swipe(swipeRequest);
      
      if (response.success) {
        setSwipeCount(prev => prev + 1);
        
        if (response.isMatch) {
          Alert.alert(
            '🎉 Eşleşme!',
            `${user.firstName} ile eşleştiniz! Burç uyumluluğunuz %${user.compatibilityScore}`,
            [{ text: 'Harika!' }]
          );
        }
      }
    } catch (error) {
      console.error('Swipe error:', error);
    }
  };

  const moveToNextCard = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handleManualSwipe = async (action: 'like' | 'dislike' | 'superlike') => {
    if (currentIndex >= users.length) return;
    
    const currentUser = users[currentIndex];
    
    switch (action) {
      case 'like':
        await handleSwipeRight(currentUser);
        break;
      case 'dislike':
        await handleSwipeLeft(currentUser);
        break;
      case 'superlike':
        await handleSuperLike(currentUser);
        break;
    }
  };

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const remainingCards = users.length - currentIndex;
  const remainingSwipes = Math.max(0, maxSwipes - swipeCount);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Arka plan gradyan */}
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
        style={styles.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Burç Uyumluluğu</Text>
        <Text style={styles.subtitle}>
          {remainingCards > 0 
            ? `${remainingCards} potansiyel eşleşme` 
            : 'Yeni eşleşmeler yakında'
          }
        </Text>
        
        {/* Swipe limiti göstergesi */}
        {!isPremium && (
          <View style={styles.swipeLimitContainer}>
            <Ionicons name="heart" size={16} color="#FF6B6B" />
            <Text style={styles.swipeLimitText}>
              {remainingSwipes} swipe kaldı
            </Text>
          </View>
        )}
      </View>

      {/* Swipe Stack */}
      <View style={styles.stackContainer}>
        {isLoading && users.length === 0 ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>
              {page === 1 ? 'Uyumlu eşleşmeler aranıyor...' : 'Yeni eşleşmeler yükleniyor...'}
            </Text>
            <Text style={styles.loadingSubtext}>
              Bu işlem birkaç saniye sürebilir
            </Text>
            
            {/* Debug butonları */}
            <View style={styles.debugButtons}>
              <TouchableOpacity 
                style={styles.debugButton}
                onPress={() => {
                  console.log('🔄 [DEBUG] Manuel fallback tetikleniyor...');
                  setUsers(SAMPLE_ASTROLOGY_MATCHES);
                  setCurrentIndex(0);
                  setIsLoading(false);
                  setHasMore(false);
                }}
              >
                <Text style={styles.debugButtonText}>Sample Data Yükle</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.debugButton}
                onPress={() => {
                  console.log('🔄 [DEBUG] API yeniden deneniyor...');
                  setPage(1);
                  setHasMore(true);
                  loadDiscoverUsers();
                }}
              >
                <Text style={styles.debugButtonText}>API Yeniden Dene</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.debugButton}
                onPress={async () => {
                  console.log('🌐 [DEBUG] Network test başlatılıyor...');
                  try {
                    const { getToken } = await import('../utils/tokenStorage');
                    const token = await getToken();
                    console.log('🔑 [DEBUG] Token:', token ? 'Var' : 'Yok');
                    
                    // API base URL'ini test et
                    const testResponse = await fetch('https://ae51-95-70-131-250.ngrok-free.app/api/swipes/discover', {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    });
                    console.log('🌐 [DEBUG] Fetch response:', testResponse.status, testResponse.statusText);
                  } catch (error: any) {
                    console.error('🌐 [DEBUG] Network error:', error.message);
                  }
                }}
              >
                <Text style={styles.debugButtonText}>Network Test</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : remainingCards > 0 ? (
          <>
            {users.slice(currentIndex, currentIndex + 3).map((user, index) => (
              <SwipeCard
                key={`${user.id}-${currentIndex + index}`}
                user={user}
                index={index}
                totalCards={3}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onSuperLike={handleSuperLike}
                isActive={index === 0}
              />
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Animated.View style={animatedPulseStyle}>
              <Ionicons name="planet" size={80} color="rgba(255,255,255,0.3)" />
            </Animated.View>
            <Text style={styles.emptyTitle}>Tüm eşleşmeleri gözden geçirdin!</Text>
            <Text style={styles.emptySubtitle}>
              Yeni potansiyel eşleşmeler için biraz daha bekle, ya da profilini güncelle
            </Text>
          </View>
        )}
      </View>

      {/* Alt kontrol butonları */}
      {remainingCards > 0 && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.dislikeButton]}
            onPress={() => handleManualSwipe('dislike')}
          >
            <Ionicons name="close" size={28} color="#FF6B6B" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.superLikeButton]}
            onPress={() => handleManualSwipe('superlike')}
          >
            <Ionicons name="star" size={24} color="#FFD700" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => handleManualSwipe('like')}
          >
            <Ionicons name="heart" size={28} color="#FF9FF3" />
          </TouchableOpacity>
        </View>
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
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  swipeLimitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 8,
  },
  swipeLimitText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
  stackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cardContainer: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 48,
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  onlineIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1DB954',
    borderWidth: 2,
    borderColor: 'white',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 4,
  },
  premiumBadge: {
    position: 'absolute',
    top: 50,
    left: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'flex-end',
  },
  userInfo: {
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  compatibilityBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  compatibilityText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  zodiacRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  zodiacEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  zodiacName: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  distance: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 8,
  },
  compatibilityDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 8,
  },
  bioText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  // Swipe etiketleri
  likeLabel: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: 'rgba(29, 185, 84, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    transform: [{ rotate: '15deg' }],
  },
  likeLabelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  nopeLabel: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    transform: [{ rotate: '-15deg' }],
  },
  nopeLabelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  superLikeLabel: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    marginHorizontal: 40,
  },
  superLikeLabelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  starIcon: {
    fontSize: 24,
    marginTop: 4,
  },
  // Alt butonlar
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100, // Tab bar için ekstra boşluk
    paddingTop: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)', // Hafif arka plan
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dislikeButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  superLikeButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 2,
    borderColor: '#FFD700',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  likeButton: {
    backgroundColor: 'rgba(255, 159, 243, 0.2)',
    borderWidth: 2,
    borderColor: '#FF9FF3',
  },
  // Loading state
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
    textAlign: 'center',
  },
  debugButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  debugButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  debugButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
});
