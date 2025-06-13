import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { usePhotoIndex } from '../hooks/usePhotoIndex';
import { DiscoverResponse, DiscoverUser, swipeApi } from '../services/api';
import { getZodiacDisplay, getZodiacEmoji } from '../types/zodiac';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.75;
const SWIPE_THRESHOLD = width * 0.25;

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

export default function ZodiacSwipeScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  
  // Animasyon değerleri
  const rotation = useSharedValue(0);
  const starAnimation = useSharedValue(0);

  // Fotoğraf indeksi için hook
  const { photoIndexes, setPhotoIndex } = usePhotoIndex();

  // Dönen burç çarkı animasyonu
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { 
        duration: 180000, // 3 dakika
        easing: Easing.linear 
      }), 
      -1,
      false
    );

    // Yıldız animasyonu
    starAnimation.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  // Burç çarkı animasyonu
  const animatedWheelStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const animatedStarStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: 0.7 + (starAnimation.value * 0.6) }],
      opacity: 0.2 + (starAnimation.value * 0.3),
    };
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (loadMore = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const currentPage = loadMore ? page + 1 : 1;
      const response: DiscoverResponse = await swipeApi.getDiscoverUsers(currentPage, 10);
      
      if (response.success && response.users) {
        if (loadMore) {
          setUsers(prev => [...prev, ...response.users]);
          setPage(currentPage);
        } else {
          setUsers(response.users);
          setCurrentIndex(0);
        }
      }
    } catch (error) {
      console.error('Kullanıcı yükleme hatası:', error);
      Alert.alert('Hata', 'Kullanıcılar yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right' | 'up', userId: number) => {
    try {
      const action = direction === 'right' ? 'LIKE' : 
                   direction === 'left' ? 'DISLIKE' : 'LIKE';
      
      const response = await swipeApi.swipe({
        targetUserId: userId.toString(),
        action: action
      });

      if (response.isMatch && direction !== 'left') {
        const user = users[currentIndex];
        Alert.alert(
          '🎉 Astrolojik Eşleşme!',
          `${user.firstName} ile eşleştiniz! Burçlarınız %${user.compatibilityScore} uyumlu.`,
          [{ text: 'Harika!', style: 'default' }]
        );
      }

      // Sonraki karta geç
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      // Son 2 karttan birindeyse daha fazla yükle
      if (nextIndex >= users.length - 2 && !isLoadingMore) {
        loadUsers(true);
      }
    } catch (error) {
      console.error('Swipe hatası:', error);
      Alert.alert('Hata', 'İşlem sırasında bir hata oluştu.');
    }
  };

  const currentUser = users[currentIndex];
  const nextUser = users[currentIndex + 1];

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

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.background} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>✨</Text>
          <Text style={styles.emptyTitle}>Tüm Profilleri İnceledi</Text>
          <Text style={styles.emptyText}>
            Yeni profiller için biraz sonra tekrar kontrol edin.
          </Text>
          <TouchableOpacity style={styles.reloadButton} onPress={() => loadUsers()}>
            <Text style={styles.reloadText}>Yeniden Yükle</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Arka plan gradyan */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.background}
      />

      {/* Dönen burç çarkı - arka plan */}
      <Animated.View style={[styles.zodiacWheel, animatedWheelStyle]}>
        <View style={styles.innerCircle} />
        <View style={styles.middleCircle} />
        <View style={styles.outerCircle} />
        
        {ZODIAC_SYMBOLS.map((item, index) => (
          <View 
            key={index} 
            style={[
              styles.symbolContainer, 
              { 
                transform: [
                  { rotate: `${item.angle}deg` }, 
                  { translateY: -(width * 0.35) },
                ]
              }
            ]}
          >
            <Text 
              style={[
                styles.zodiacSymbol, 
                { transform: [{ rotate: `-${item.angle}deg` }] }
              ]}
            >
              {item.symbol}
            </Text>
          </View>
        ))}
        
        <View style={styles.centerDot} />
      </Animated.View>

      {/* Yıldız efekti */}
      <Animated.View style={[styles.starEffect, animatedStarStyle]} />
      <Animated.View style={[styles.starEffect2, animatedStarStyle]} />

      {/* Üst başlık */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Burç Uyumluluğu</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Kart konteyneri */}
      <View style={styles.cardContainer}>
        {/* Arka kart */}
        {nextUser && (
          <ZodiacSwipeCard 
            user={nextUser}
            onSwipe={() => {}}
            isTop={false}
            photoIndex={photoIndexes[nextUser.id] || 0}
            setPhotoIndex={(index) => setPhotoIndex(nextUser.id, index)}
            style={[styles.card, { transform: [{ scale: 0.95 }], opacity: 0.8 }]}
          />
        )}
        
        {/* Ön kart */}
        <ZodiacSwipeCard 
          user={currentUser}
          onSwipe={handleSwipe}
          isTop={true}
          photoIndex={photoIndexes[currentUser.id] || 0}
          setPhotoIndex={(index) => setPhotoIndex(currentUser.id, index)}
          style={styles.card}
        />
      </View>

      {/* Alt action butonları */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.dislikeButton]}
          onPress={() => handleSwipe('left', currentUser.id)}
        >
          <Ionicons name="close" size={30} color="#FF5722" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={() => handleSwipe('up', currentUser.id)}
        >
          <Ionicons name="star" size={24} color="#FFD700" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleSwipe('right', currentUser.id)}
        >
          <Ionicons name="heart" size={28} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Yükleme göstergesi */}
      {isLoadingMore && (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color="#8000FF" />
          <Text style={styles.loadingMoreText}>Daha fazla profil yükleniyor...</Text>
        </View>
      )}
    </View>
  );
}

// Swipe kartı bileşeni
interface ZodiacSwipeCardProps {
  user: DiscoverUser;
  onSwipe: (direction: 'left' | 'right' | 'up', userId: number) => void;
  isTop: boolean;
  photoIndex: number;
  setPhotoIndex: (index: number) => void;
  style: any;
}

const ZodiacSwipeCard: React.FC<ZodiacSwipeCardProps> = ({
  user,
  onSwipe,
  isTop,
  photoIndex,
  setPhotoIndex,
  style
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      'worklet';
      if (!isTop) return;
    },
    onActive: (event) => {
      'worklet';
      if (!isTop) return;
      
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      
      rotate.value = interpolate(
        event.translationX,
        [-width / 2, width / 2],
        [-15, 15],
        Extrapolate.CLAMP
      );
    },
    onEnd: (event) => {
      'worklet';
      if (!isTop) return;

      const { translationX, translationY, velocityX } = event;

      // Super like (yukarı swipe)
      if (translationY < -120 && Math.abs(translationX) < 100) {
        translateY.value = withTiming(-height * 1.5, { duration: 300 });
        translateX.value = withTiming(0, { duration: 300 });
        rotate.value = withTiming(0, { duration: 300 });
        runOnJS(onSwipe)('up', user.id);
        return;
      }

      const shouldSwipe = Math.abs(translationX) > SWIPE_THRESHOLD || Math.abs(velocityX) > 800;
      
      if (shouldSwipe) {
        const direction = translationX > 0 ? 'right' : 'left';
        const targetX = direction === 'right' ? width * 1.5 : -width * 1.5;
        const targetRotation = direction === 'right' ? 30 : -30;
        
        translateX.value = withTiming(targetX, { duration: 300 });
        rotate.value = withTiming(targetRotation, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });
        
        runOnJS(onSwipe)(direction, user.id);
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
        rotate.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` }
    ],
    opacity: opacity.value
  }));

  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, width * 0.25],
      [0, 1],
      Extrapolate.CLAMP
    )
  }));

  const dislikeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-width * 0.25, 0],
      [1, 0],
      Extrapolate.CLAMP
    )
  }));

  const superLikeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [-height * 0.15, 0],
      [1, 0],
      Extrapolate.CLAMP
    )
  }));

  const handlePhotoTap = (side: 'left' | 'right') => {
    const photos = user.photos || [];
    if (side === 'left' && photoIndex > 0) {
      setPhotoIndex(photoIndex - 1);
    } else if (side === 'right' && photoIndex < photos.length - 1) {
      setPhotoIndex(photoIndex + 1);
    }
  };

  const currentPhotoUrl = user.photos && user.photos.length > 0 
    ? user.photos[photoIndex]?.imageUrl || user.profileImageUrl 
    : user.profileImageUrl;

  const compatibilityColor = user.compatibilityScore > 80 ? '#4CAF50' : 
                           user.compatibilityScore > 60 ? '#FF9800' : '#FF5722';

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[style, animatedStyle]}>
        <View style={styles.swipeCard}>
          <View style={styles.imageContainer}>
            {currentPhotoUrl ? (
              <Image
                source={{ uri: currentPhotoUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderEmoji}>
                  {getZodiacEmoji(user.zodiacSign)}
                </Text>
                <Text style={styles.placeholderText}>
                  {user.firstName}
                </Text>
              </View>
            )}

            {/* Fotoğraf navigasyonu */}
            <TouchableOpacity
              style={styles.photoNavLeft}
              onPress={() => handlePhotoTap('left')}
            />
            <TouchableOpacity
              style={styles.photoNavRight}
              onPress={() => handlePhotoTap('right')}
            />

            {/* Fotoğraf indikatörleri */}
            {user.photos && user.photos.length > 1 && (
              <View style={styles.photoIndicators}>
                {user.photos.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.photoIndicator,
                      index === photoIndex && styles.activePhotoIndicator
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Gradient overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.gradient}
            />

            {/* Kullanıcı bilgileri */}
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>
                  {user.firstName}, {user.age}
                </Text>
                <Text style={styles.zodiacEmoji}>
                  {getZodiacEmoji(user.zodiacSign)}
                </Text>
              </View>
              
              <Text style={styles.zodiacSign}>
                {getZodiacDisplay(user.zodiacSign)}
              </Text>

              <View style={[styles.compatibilityBadge, { backgroundColor: compatibilityColor }]}>
                <Ionicons name="star" size={16} color="white" />
                <Text style={styles.compatibilityScore}>
                  %{user.compatibilityScore} Uyumlu
                </Text>
              </View>

              {user.bio && (
                <Text style={styles.bio} numberOfLines={2}>
                  {user.bio}
                </Text>
              )}

              {user.compatibilityDescription && (
                <Text style={styles.compatibilityDescription} numberOfLines={2}>
                  {user.compatibilityDescription}
                </Text>
              )}
            </View>
          </View>

          {/* Overlay'ler */}
          <Animated.View style={[styles.overlay, styles.likeOverlay, likeOverlayStyle]}>
            <View style={styles.overlayContent}>
              <Ionicons name="heart" size={60} color="#4CAF50" />
              <Text style={[styles.overlayText, { color: '#4CAF50' }]}>BEĞENDİM</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.overlay, styles.dislikeOverlay, dislikeOverlayStyle]}>
            <View style={styles.overlayContent}>
              <Ionicons name="close" size={60} color="#FF5722" />
              <Text style={[styles.overlayText, { color: '#FF5722' }]}>HAYIR</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.overlay, styles.superLikeOverlay, superLikeOverlayStyle]}>
            <View style={styles.overlayContent}>
              <Ionicons name="star" size={60} color="#FFD700" />
              <Text style={[styles.overlayText, { color: '#FFD700' }]}>SÜPER BEĞENİ</Text>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    width: width,
    height: height + (StatusBar.currentHeight || 0),
    top: -(StatusBar.currentHeight || 0),
  },
  zodiacWheel: {
    position: 'absolute',
    width: width * 1.0,
    height: width * 1.0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.1,
    left: 0,
    top: height * 0.15,
  },
  innerCircle: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 255, 0.2)',
    position: 'absolute',
  },
  middleCircle: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 255, 0.15)',
    position: 'absolute',
  },
  outerCircle: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 255, 0.1)',
    position: 'absolute',
  },
  symbolContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zodiacSymbol: {
    fontSize: 20,
    color: 'rgba(128, 0, 255, 0.6)',
    textAlign: 'center',
  },
  centerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(128, 0, 255, 0.5)',
    position: 'absolute',
  },
  starEffect: {
    position: 'absolute',
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: width * 0.1,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    top: height * 0.2,
    right: width * 0.1,
  },
  starEffect2: {
    position: 'absolute',
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    top: height * 0.6,
    left: width * 0.05,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: (StatusBar.currentHeight || 0) + 15,
  },
  backButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 44,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  swipeCard: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 25,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(128, 0, 255, 0.1)',
  },
  placeholderEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
    fontWeight: '600',
  },
  photoNavLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    zIndex: 10,
  },
  photoNavRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    zIndex: 10,
  },
  photoIndicators: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    zIndex: 5,
  },
  photoIndicator: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  activePhotoIndicator: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
  },
  userInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 25,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  name: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
  },
  zodiacEmoji: {
    fontSize: 32,
  },
  zodiacSign: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    marginBottom: 12,
    fontWeight: '500',
  },
  compatibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  compatibilityScore: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  bio: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  compatibilityDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderRadius: 25,
  },
  likeOverlay: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  dislikeOverlay: {
    borderColor: '#FF5722',
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
  },
  superLikeOverlay: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  overlayContent: {
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 30,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  dislikeButton: {
    borderColor: '#FF5722',
  },
  superLikeButton: {
    borderColor: '#FFD700',
    width: 55,
    height: 55,
    borderRadius: 27.5,
  },
  likeButton: {
    borderColor: '#4CAF50',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 20,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 30,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  reloadButton: {
    backgroundColor: 'rgba(128, 0, 255, 0.3)',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  reloadText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingMoreContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  loadingMoreText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 10,
  },
}); 