import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    PanResponder,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from './context/AuthContext';
import { useProfile } from './context/ProfileContext';
import { DiscoverResponse, DiscoverUser, SwipeLimitInfo, swipeApi } from './services/api';
import { getZodiacEmoji } from './types/zodiac';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.92;
const CARD_HEIGHT = height * 0.75;

// Burç çarkı sembolleri
const ZODIAC_SYMBOLS = [
  { symbol: '♈', name: 'Koç', angle: 0 },
  { symbol: '♉', name: 'Boğa', angle: 30 },
  { symbol: '♊', name: 'İkizler', angle: 60 },
  { symbol: '♋', name: 'Yengeç', angle: 90 },
  { symbol: '♌', name: 'Aslan', angle: 120 },
  { symbol: '♍', name: 'Başak', angle: 150 },
  { symbol: '♎', name: 'Terazi', angle: 180 },
  { symbol: '♏', name: 'Akrep', angle: 210 },
  { symbol: '♐', name: 'Yay', angle: 240 },
  { symbol: '♑', name: 'Oğlak', angle: 270 },
  { symbol: '♒', name: 'Kova', angle: 300 },
  { symbol: '♓', name: 'Balık', angle: 330 },
];

// SwipeCard Props Interface
interface SwipeCardProps {
  user: DiscoverUser;
  onSwipe: (direction: 'left' | 'right' | 'up', userId: number) => void;
  style: any;
  isTop: boolean;
  photoIndex: number;
  setPhotoIndex: (index: number) => void;
}

// Swipe Card Component
const SwipeCard: React.FC<SwipeCardProps> = ({ user, onSwipe, style, isTop, photoIndex, setPhotoIndex }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset({
        x: (pan.x as any)._value,
        y: (pan.y as any)._value,
      });
    },
    onPanResponderMove: (_, gestureState) => {
      if (!isTop) return;
      
      pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      
      // Rotation based on horizontal movement
      const rotateValue = gestureState.dx / width * 0.4;
      rotate.setValue(rotateValue);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (!isTop) return;
      
      pan.flattenOffset();
      
      const threshold = width * 0.25;
      const velocity = Math.abs(gestureState.vx);
      
      if (gestureState.dx > threshold || (gestureState.dx > 50 && velocity > 0.5)) {
        // Swipe Right - Like
        animateCardOut('right');
        setTimeout(() => onSwipe('right', user.id), 200);
      } else if (gestureState.dx < -threshold || (gestureState.dx < -50 && velocity > 0.5)) {
        // Swipe Left - Dislike
        animateCardOut('left');
        setTimeout(() => onSwipe('left', user.id), 200);
      } else if (gestureState.dy < -threshold || (gestureState.dy < -50 && velocity > 0.5)) {
        // Swipe Up - Super Like
        animateCardOut('up');
        setTimeout(() => onSwipe('up', user.id), 200);
      } else {
        // Return to center
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }),
          Animated.spring(rotate, {
            toValue: 0,
            useNativeDriver: false,
          }),
        ]).start();
      }
    },
  });

  const animateCardOut = (direction: 'left' | 'right' | 'up') => {
    const toValue = direction === 'right' ? { x: width * 1.5, y: 0 } :
                   direction === 'left' ? { x: -width * 1.5, y: 0 } :
                   { x: 0, y: -height * 1.5 };

    Animated.parallel([
      Animated.timing(pan, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const rotateInterpolate = rotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  const animatedStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { rotate: rotateInterpolate },
    ],
    opacity,
  };

  const likeOpacity = pan.x.interpolate({
    inputRange: [0, width * 0.25],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const dislikeOpacity = pan.x.interpolate({
    inputRange: [-width * 0.25, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const superLikeOpacity = pan.y.interpolate({
    inputRange: [-height * 0.15, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const handlePhotoTap = (side: 'left' | 'right') => {
    const photos = user.photos.map(p => p.imageUrl);
    if (side === 'left' && photoIndex > 0) {
      setPhotoIndex(photoIndex - 1);
    } else if (side === 'right' && photoIndex < photos.length - 1) {
      setPhotoIndex(photoIndex + 1);
    }
  };

  const currentPhotoUrl = user.photos.length > 0 
    ? user.photos[photoIndex]?.imageUrl || user.profileImageUrl 
    : user.profileImageUrl || 'https://picsum.photos/400/600';

  return (
    <Animated.View
      style={[styles.card, style, animatedStyle]}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      {/* Photo */}
      <View style={styles.photoContainer}>
        <Image
          source={{ uri: currentPhotoUrl }}
          style={styles.photo}
        />
        
        {/* Photo Navigation */}
        <View style={styles.photoNavigation}>
          <TouchableOpacity
            style={styles.photoNavLeft}
            onPress={() => handlePhotoTap('left')}
            activeOpacity={1}
          />
          <TouchableOpacity
            style={styles.photoNavRight}
            onPress={() => handlePhotoTap('right')}
            activeOpacity={1}
          />
        </View>

        {/* Photo Indicators */}
        {user.photos.length > 1 && (
          <View style={styles.photoIndicators}>
            {user.photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.photoIndicator,
                  index === photoIndex && styles.photoIndicatorActive
                ]}
              />
            ))}
          </View>
        )}

        {/* Status Badges */}
        <View style={styles.statusBadges}>
          {user.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.badgeText}>Doğrulandı</Text>
            </View>
          )}
          
          {user.isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.badgeText}>Premium</Text>
            </View>
          )}

          {user.isNewUser && (
            <View style={styles.newUserBadge}>
              <Ionicons name="sparkles" size={16} color="#FF6B6B" />
              <Text style={styles.badgeText}>Yeni</Text>
            </View>
          )}
        </View>

        {/* Swipe Overlays */}
        <Animated.View style={[styles.overlay, styles.likeOverlay, { opacity: likeOpacity }]}>
          <Ionicons name="heart" size={60} color="white" />
          <Text style={styles.overlayText}>BEĞENDİM</Text>
        </Animated.View>

        <Animated.View style={[styles.overlay, styles.dislikeOverlay, { opacity: dislikeOpacity }]}>
          <Ionicons name="close" size={60} color="white" />
          <Text style={styles.overlayText}>HAYIR</Text>
        </Animated.View>

        <Animated.View style={[styles.overlay, styles.superLikeOverlay, { opacity: superLikeOpacity }]}>
          <Ionicons name="star" size={60} color="white" />
          <Text style={styles.overlayText}>SÜPER BEĞENİ</Text>
        </Animated.View>

        {/* Liked Badge */}
        {user.hasLikedCurrentUser && (
          <View style={styles.likedMeBadge}>
            <Ionicons name="heart" size={14} color="#FF6B6B" />
            <Text style={styles.likedMeText}>Sizi beğendi</Text>
          </View>
        )}
      </View>

      {/* User Info */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.infoGradient}
      >
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <View style={styles.nameAndLocation}>
              <Text style={styles.userName}>
                {user.firstName} {user.lastName}, {user.age}
              </Text>
              {user.location && (
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={12} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={styles.locationText}>{user.location}</Text>
                </View>
              )}
            </View>
            <View style={styles.zodiacBadge}>
              <Text style={styles.zodiacEmoji}>{getZodiacEmoji(user.zodiacSign)}</Text>
              <Text style={styles.zodiacText}>{user.zodiacSignDisplay}</Text>
            </View>
          </View>

          <View style={styles.compatibilityRow}>
            <View style={styles.compatibilityBadge}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.compatibilityText}>%{user.compatibilityScore} Uyumlu</Text>
            </View>
            <View style={styles.activityBadge}>
              <Ionicons name="time" size={14} color="#4CAF50" />
              <Text style={styles.activityText}>{user.activityStatus}</Text>
            </View>
          </View>

          {user.bio && (
            <Text style={styles.userBio} numberOfLines={3}>
              {user.bio}
            </Text>
          )}

          {user.compatibilityMessage && (
            <View style={styles.compatibilityDesc}>
              <Text style={styles.compatibilityDescText}>
                {user.compatibilityMessage}
              </Text>
            </View>
          )}

          <View style={styles.profileStats}>
            <Text style={styles.profileCompletenessText}>
              Profil tamamlanma: {user.profileCompleteness}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default function AstrologyMatchesScreen() {
  const { userProfile } = useProfile();
  const { isPremium } = useAuth();
  const router = useRouter();
  const [discoverUsers, setDiscoverUsers] = useState<DiscoverUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [photoIndexes, setPhotoIndexes] = useState<Record<number, number>>({});
  const [swipeLimitInfo, setSwipeLimitInfo] = useState<SwipeLimitInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Burç çarkı animasyonu
  const zodiacRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotateAnimation = Animated.loop(
      Animated.timing(zodiacRotation, {
        toValue: 1,
        duration: 150000, // 2.5 dakika
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();
    return () => rotateAnimation.stop();
  }, []);

  useEffect(() => {
    loadDiscoverUsers();
  }, []);

  const loadDiscoverUsers = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 [DISCOVER] Kullanıcılar yükleniyor...');
      
      const response = await swipeApi.getDiscoverUsers(1, 10);
      console.log('✅ [DISCOVER] API Yanıtı:', JSON.stringify(response, null, 2));
      
      if (response.success && response.users) {
        console.log(`📊 [DISCOVER] ${response.users.length} kullanıcı bulundu`);
        setDiscoverUsers(response.users);
        setSwipeLimitInfo(response.swipeLimitInfo);
      } else {
        console.warn('⚠️ [DISCOVER] API başarılı ama kullanıcı listesi boş:', response.message);
        setDiscoverUsers([]);
      }
    } catch (error: any) {
      console.error('❌ [DISCOVER] Hata detayı:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        Alert.alert(
          'Oturum Süresi Doldu',
          'Lütfen tekrar giriş yapın.',
          [{ text: 'Tamam', style: 'default' as const }]
        );
      } else {
        Alert.alert(
          'Hata',
          'Kullanıcılar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.',
          [{ text: 'Tamam', style: 'default' as const }]
        );
      }
      setDiscoverUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right' | 'up', userId: number) => {
    console.log(`🎯 SWIPE: ${direction} kullanıcı ${userId}`);
    
    try {
      const swipeAction = direction === 'right' ? 'LIKE' : 
                         direction === 'up' ? 'SUPER_LIKE' : 'DISLIKE';
      
      const response = await swipeApi.swipe({
        targetUserId: userId,
        action: swipeAction
      });

      console.log('📥 Swipe yanıtı:', response);

      if (response.isMatch) {
        const matchedUser = discoverUsers.find(u => u.id === userId);
        if (matchedUser) {
          Alert.alert(
            '🎉 Eşleştiniz!',
            `${matchedUser.firstName} ile eşleştiniz! %${matchedUser.compatibilityScore} uyumluluğunuz var.`,
            [
              { text: 'Harika!', style: 'default' as const },
              { text: 'Mesaj Gönder', style: 'default' as const, onPress: () => router.push(`/chat/${response.matchId}` as any) }
            ]
          );
        }
      }

      // Swipe limit bilgisini güncelle
      if (swipeLimitInfo) {
        setSwipeLimitInfo({
          ...swipeLimitInfo,
          remainingSwipes: swipeLimitInfo.remainingSwipes - 1
        });
      }
    } catch (error: any) {
      console.error('❌ Swipe hatası:', error);
      if (error.response?.data?.message) {
        Alert.alert('Swipe Hatası', error.response.data.message);
      }
    }
    
    // Sonraki karta geç
    setCurrentIndex(prev => prev + 1);
    
    // Daha fazla kart yükle
    if (currentIndex >= discoverUsers.length - 3) {
      loadMoreCards();
    }
  };

  const loadMoreCards = async () => {
    console.log('🔄 Daha fazla kart yükleniyor...');
    try {
      const nextPage = currentPage + 1;
      const response: DiscoverResponse = await swipeApi.getDiscoverUsers(nextPage, 10);
      
      if (response.success && response.users && response.users.length > 0) {
        setDiscoverUsers(prev => [...prev, ...response.users]);
        setCurrentPage(nextPage);
        
        // Yeni kullanıcılar için photo index'lerini ekle
        const newIndexes: Record<number, number> = {};
        response.users.forEach(user => {
          newIndexes[user.id] = 0;
        });
        setPhotoIndexes(prev => ({ ...prev, ...newIndexes }));
      }
    } catch (error) {
      console.error('❌ Daha fazla kart yükleme hatası:', error);
    }
  };

  const handleActionButton = (action: 'dislike' | 'superlike' | 'like') => {
    if (currentIndex >= discoverUsers.length) return;
    
    // Swipe limit kontrolü
    if (swipeLimitInfo && swipeLimitInfo.remainingSwipes <= 0 && !swipeLimitInfo.isPremium) {
      Alert.alert(
        'Swipe Limiti Doldu',
        'Günlük swipe limitiniz doldu. Premium üyelik satın alarak sınırsız swipe yapabilirsiniz.',
        [
          { text: 'Tamam', style: 'default' },
          { text: 'Premium Al', style: 'default', onPress: () => router.push('/premium' as any) }
        ]
      );
      return;
    }
    
    const currentUser = discoverUsers[currentIndex];
    const direction = action === 'like' ? 'right' : action === 'superlike' ? 'up' : 'left';
    handleSwipe(direction, currentUser.id);
  };

  const setPhotoIndex = (userId: number, index: number) => {
    setPhotoIndexes(prev => ({
      ...prev,
      [userId]: index
    }));
  };

  const zodiacRotateInterpolate = zodiacRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8000FF" />
          <Text style={styles.loadingText}>Yıldızlar hizalanıyor...</Text>
        </View>
      </View>
    );
  }

  const cardsToShow = discoverUsers.slice(currentIndex, currentIndex + 3);

  if (cardsToShow.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.background} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>✨</Text>
          <Text style={styles.emptyTitle}>
            {swipeLimitInfo?.remainingSwipes === 0 && !swipeLimitInfo?.isPremium 
              ? 'Günlük Swipe Limitiniz Doldu' 
              : 'Yeni Eşleşmeler Bekleniyor'
            }
          </Text>
          <Text style={styles.emptySubtitle}>
            {swipeLimitInfo?.remainingSwipes === 0 && !swipeLimitInfo?.isPremium 
              ? 'Premium üyelik satın alarak sınırsız swipe yapabilirsiniz'
              : 'Yakında size uygun yeni profiller ekleyeceğiz'
            }
          </Text>
          {swipeLimitInfo?.remainingSwipes === 0 && !swipeLimitInfo?.isPremium ? (
            <TouchableOpacity 
              style={styles.premiumButton} 
              onPress={() => router.push('/premium' as any)}
            >
              <Text style={styles.premiumButtonText}>Premium Satın Al</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.refreshButton} onPress={loadDiscoverUsers}>
              <Text style={styles.refreshButtonText}>Yenile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Arka plan gradyan */}
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.background} />

      {/* Burç çarkı arka plan */}
      <Animated.View 
        style={[
          styles.zodiacWheel, 
          { transform: [{ rotate: zodiacRotateInterpolate }] }
        ]}
      >
        {ZODIAC_SYMBOLS.map((item, index) => (
          <View 
            key={index}
            style={[
              styles.zodiacSymbol,
              {
                transform: [
                  { rotate: `${item.angle}deg` },
                  { translateY: -width * 0.35 },
                  { rotate: `-${item.angle}deg` }
                ]
              }
            ]}
          >
            <Text style={styles.zodiacText}>{item.symbol}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Header - Fixed */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Burç Eşleşmeleri</Text>
          {swipeLimitInfo && (
            <Text style={styles.swipeLimit}>
              {swipeLimitInfo.isPremium ? '∞ ' : `${swipeLimitInfo.remainingSwipes}/${swipeLimitInfo.totalSwipes} `}
              Swipe Hakkı
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Cards Container */}
      <View style={styles.cardsContainer}>
        {cardsToShow.map((user, index) => (
          <SwipeCard
            key={user.id}
            user={user}
            onSwipe={handleSwipe}
            style={{
              zIndex: cardsToShow.length - index,
              transform: [
                { scale: 1 - index * 0.02 },
                { translateY: index * -8 }
              ]
            }}
            isTop={index === 0}
            photoIndex={photoIndexes[user.id] || 0}
            setPhotoIndex={(newIndex: number) => setPhotoIndex(user.id, newIndex)}
          />
        ))}
      </View>

      {/* Action Buttons - Fixed Footer */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.dislikeButton]}
          onPress={() => handleActionButton('dislike')}
        >
          <Ionicons name="close" size={32} color="#FF5722" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={() => handleActionButton('superlike')}
        >
          <Ionicons name="star" size={28} color="#FFD700" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleActionButton('like')}
        >
          <Ionicons name="heart" size={32} color="#4CAF50" />
        </TouchableOpacity>
      </View>
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
  zodiacWheel: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    left: width * 0.1,
    top: height * 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.1,
  },
  zodiacSymbol: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zodiacText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  swipeLimit: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 2,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
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
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  refreshButton: {
    backgroundColor: 'rgba(128, 0, 255, 0.3)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  premiumButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  premiumButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },
  photoContainer: {
    flex: 1,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoNavigation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  photoNavLeft: {
    flex: 1,
  },
  photoNavRight: {
    flex: 1,
  },
  photoIndicators: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  photoIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 2,
  },
  photoIndicatorActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  statusBadges: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'column',
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newUserBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  likedMeBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  likedMeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeOverlay: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  dislikeOverlay: {
    backgroundColor: 'rgba(255, 87, 34, 0.8)',
  },
  superLikeOverlay: {
    backgroundColor: 'rgba(255, 215, 0, 0.8)',
  },
  overlayText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  infoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    justifyContent: 'flex-end',
  },
  userInfo: {
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  nameAndLocation: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },
  zodiacBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(128, 0, 255, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  zodiacEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  compatibilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  compatibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  compatibilityText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 4,
  },
  activityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activityText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 4,
  },
  userBio: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    marginBottom: 10,
  },
  compatibilityDesc: {
    backgroundColor: 'rgba(128, 0, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  compatibilityDescText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  profileStats: {
    alignItems: 'center',
  },
  profileCompletenessText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  actionButtons: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 50,
    zIndex: 1000,
  },
  actionButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dislikeButton: {
    borderWidth: 3,
    borderColor: '#FF5722',
  },
  superLikeButton: {
    borderWidth: 3,
    borderColor: '#FFD700',
    width: 55,
    height: 55,
    borderRadius: 27.5,
  },
  likeButton: {
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
}); 