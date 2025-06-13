import { useProfile } from '@/app/context/ProfileContext';
import { DiscoverUser, swipeApi } from '@/app/services/api';
import { getZodiacEmoji } from '@/app/types/zodiac';
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
    ? user.photos[photoIndex]?.imageUrl || user.profileImageUrl || 'https://picsum.photos/400/600'
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
          <Text style={styles.overlayText}>SÜPER BEĞENDİM</Text>
        </Animated.View>

        {/* User Info */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.userInfoGradient}
        >
          <View style={styles.userInfo}>
            <View style={styles.userNameContainer}>
              <Text style={styles.userName}>{user.firstName}, {user.age}</Text>
              <Text style={styles.userZodiac}>{getZodiacEmoji(user.zodiacSign)} {user.zodiacSign}</Text>
            </View>
            
            {user.bio && (
              <Text style={styles.userBio} numberOfLines={2}>
                {user.bio}
              </Text>
            )}

            {user.distance && (
              <View style={styles.distanceContainer}>
                <Ionicons name="location" size={14} color="#fff" />
                <Text style={styles.distanceText}>
                  {user.distance < 1 ? '1 km\'den yakın' : `${Math.round(user.distance)} km uzakta`}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
};

export default function ZodiacSwipeScreen() {
  const router = useRouter();
  const { userProfile } = useProfile();
  const [discoverUsers, setDiscoverUsers] = useState<DiscoverUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [photoIndexes, setPhotoIndexes] = useState<Record<number, number>>({});
  const [swipeLimitInfo, setSwipeLimitInfo] = useState<any>(null);

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
    try {
      const action = direction === 'right' ? 'LIKE' : direction === 'left' ? 'DISLIKE' : 'LIKE';
      
      await swipeApi.swipe({
        targetUserId: userId.toString(),
        action
      });

      // Remove the swiped user from the list
      setDiscoverUsers(prev => prev.filter(user => user.id !== userId));
      
      // If we're running low on cards, load more
      if (discoverUsers.length - currentIndex < 3) {
        loadMoreCards();
      }
    } catch (error: any) {
      console.error('❌ Swipe hatası:', error);
      Alert.alert(
        'Hata',
        'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam', style: 'default' as const }]
      );
    }
  };

  const loadMoreCards = async () => {
    try {
      const response = await swipeApi.getDiscoverUsers(1, 10);
      if (response.success && response.users) {
        setDiscoverUsers(prev => [...prev, ...response.users]);
      }
    } catch (error) {
      console.error('❌ Daha fazla kart yüklenirken hata:', error);
    }
  };

  const handleActionButton = (action: 'dislike' | 'superlike' | 'like') => {
    if (discoverUsers.length === 0) return;
    
    const currentUser = discoverUsers[currentIndex];
    const direction = action === 'like' ? 'right' : action === 'dislike' ? 'left' : 'up';
    
    handleSwipe(direction, currentUser.id);
  };

  const setPhotoIndex = (userId: number, index: number) => {
    setPhotoIndexes(prev => ({
      ...prev,
      [userId]: index
    }));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push('/(tabs)/profile' as any)}
        >
          <Ionicons name="person-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push('/(tabs)/matches' as any)}
        >
          <Ionicons name="heart" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Cards Container */}
      <View style={styles.cardsContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Kullanıcılar yükleniyor...</Text>
          </View>
        ) : discoverUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={64} color="#fff" />
            <Text style={styles.emptyText}>Şu an için yeni kullanıcı yok</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadDiscoverUsers}
            >
              <Text style={styles.refreshButtonText}>Yenile</Text>
            </TouchableOpacity>
          </View>
        ) : (
          discoverUsers.map((user, index) => (
            <SwipeCard
              key={user.id}
              user={user}
              onSwipe={handleSwipe}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: discoverUsers.length - index,
              }}
              isTop={index === currentIndex}
              photoIndex={photoIndexes[user.id] || 0}
              setPhotoIndex={(index) => setPhotoIndex(user.id, index)}
            />
          ))
        )}
      </View>

      {/* Action Buttons */}
      {!isLoading && discoverUsers.length > 0 && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.dislikeButton]}
            onPress={() => handleActionButton('dislike')}
          >
            <Ionicons name="close" size={32} color="#FF6B6B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.superLikeButton]}
            onPress={() => handleActionButton('superlike')}
          >
            <Ionicons name="star" size={32} color="#FFD700" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => handleActionButton('like')}
          >
            <Ionicons name="heart" size={32} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      )}

      {/* Swipe Limit Info */}
      {swipeLimitInfo && (
        <View style={styles.swipeLimitInfo}>
          <Text style={styles.swipeLimitText}>
            {swipeLimitInfo.remainingSwipes} swipe hakkınız kaldı
          </Text>
          {!swipeLimitInfo.isPremium && (
            <TouchableOpacity
              style={styles.premiumButton}
              onPress={() => router.push('/(tabs)/premium' as any)}
            >
              <Text style={styles.premiumButtonText}>Premium Al</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
  },
  headerButton: {
    padding: 8,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  photoContainer: {
    width: '100%',
    height: '100%',
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
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  photoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  photoIndicatorActive: {
    backgroundColor: '#fff',
  },
  statusBadges: {
    position: 'absolute',
    top: 20,
    right: 20,
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76,175,80,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  newUserBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,107,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
  },
  likeOverlay: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76,175,80,0.2)',
  },
  dislikeOverlay: {
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255,107,107,0.2)',
  },
  superLikeOverlay: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.2)',
  },
  overlayText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  userInfoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  userInfo: {
    gap: 8,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userZodiac: {
    color: '#fff',
    fontSize: 20,
  },
  userBio: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingBottom: 40,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dislikeButton: {
    backgroundColor: '#fff',
  },
  superLikeButton: {
    backgroundColor: '#fff',
  },
  likeButton: {
    backgroundColor: '#fff',
  },
  swipeLimitInfo: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 8,
  },
  swipeLimitText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  premiumButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  premiumButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
}); 