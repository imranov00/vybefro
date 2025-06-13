import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
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
import { DiscoverUser } from '../../services/api';
import { getCompatibilityColor, getCompatibilityLabel } from '../../types/compatibility';
import { getZodiacDisplay, getZodiacEmoji } from '../../types/zodiac';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85;
const CARD_HEIGHT = screenHeight * 0.65;
const SWIPE_THRESHOLD = screenWidth * 0.3;

interface ZodiacSwipeCardProps {
  user: DiscoverUser;
  onSwipe: (direction: 'left' | 'right' | 'up', userId: number) => void;
  isTop?: boolean;
  style?: any;
  photoIndex: number;
  setPhotoIndex: (index: number) => void;
}

const ZodiacSwipeCard: React.FC<ZodiacSwipeCardProps> = ({
  user,
  onSwipe,
  isTop = false,
  style,
  photoIndex,
  setPhotoIndex
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
        [-screenWidth / 2, screenWidth / 2],
        [-15, 15],
        Extrapolate.CLAMP
      );
    },
    onEnd: (event) => {
      'worklet';
      if (!isTop) return;

      const { translationX, translationY, velocityX } = event;

      // Süper beğeni (yukarı swipe)
      if (translationY < -120 && Math.abs(translationX) < 100) {
        translateY.value = withTiming(-screenHeight * 1.5, { duration: 300 });
        translateX.value = withTiming(0, { duration: 300 });
        rotate.value = withTiming(0, { duration: 300 });
        runOnJS(onSwipe)('up', user.id);
        return;
      }

      const shouldSwipe = Math.abs(translationX) > SWIPE_THRESHOLD || Math.abs(velocityX) > 800;
      
      if (shouldSwipe) {
        const direction = translationX > 0 ? 'right' : 'left';
        const targetX = direction === 'right' ? screenWidth * 1.5 : -screenWidth * 1.5;
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
      [0, screenWidth * 0.25],
      [0, 1],
      Extrapolate.CLAMP
    )
  }));

  const dislikeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-screenWidth * 0.25, 0],
      [1, 0],
      Extrapolate.CLAMP
    )
  }));

  const superLikeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [-screenHeight * 0.15, 0],
      [1, 0],
      Extrapolate.CLAMP
    )
  }));

  const handlePhotoTap = (side: 'left' | 'right') => {
    // Fotoğraf listesini oluştur - photos array'i + profileImageUrl
    const allPhotos: string[] = [];
    
    // Önce photos array'indeki fotoğrafları ekle
    if (user.photos && user.photos.length > 0) {
      user.photos.forEach(photo => {
        if (photo.imageUrl) {
          allPhotos.push(photo.imageUrl);
        }
      });
    }
    
    // Eğer profileImageUrl varsa ve photos listesinde yoksa ekle
    if (user.profileImageUrl && !allPhotos.includes(user.profileImageUrl)) {
      allPhotos.unshift(user.profileImageUrl); // Başa ekle
    }
    
    // Debug bilgisi
    console.log(`📸 [${user.firstName}] Toplam fotoğraf: ${allPhotos.length}`, allPhotos);
    console.log(`📸 [${user.firstName}] Mevcut index: ${photoIndex}, Hedef: ${side}`);
    
    if (allPhotos.length <= 1) {
      console.log(`📸 [${user.firstName}] Tek fotoğraf var, navigasyon yapılmıyor`);
      return;
    }
    
    if (side === 'left' && photoIndex > 0) {
      const newIndex = photoIndex - 1;
      console.log(`📸 [${user.firstName}] Sol tıklama: ${photoIndex} → ${newIndex}`);
      setPhotoIndex(newIndex);
    } else if (side === 'right' && photoIndex < allPhotos.length - 1) {
      const newIndex = photoIndex + 1;
      console.log(`📸 [${user.firstName}] Sağ tıklama: ${photoIndex} → ${newIndex}`);
      setPhotoIndex(newIndex);
    } else {
      console.log(`📸 [${user.firstName}] Navigasyon sınırında: ${side}, index: ${photoIndex}, max: ${allPhotos.length - 1}`);
    }
  };

  // Mevcut fotoğrafı belirle - geliştirilmiş sistem
  const getAllPhotos = (): string[] => {
    const allPhotos: string[] = [];
    
    // Önce photos array'indeki fotoğrafları ekle
    if (user.photos && user.photos.length > 0) {
      user.photos.forEach(photo => {
        if (photo.imageUrl) {
          allPhotos.push(photo.imageUrl);
        }
      });
    }
    
    // Eğer profileImageUrl varsa ve photos listesinde yoksa ekle
    if (user.profileImageUrl && !allPhotos.includes(user.profileImageUrl)) {
      allPhotos.unshift(user.profileImageUrl); // Başa ekle
    }
    
    return allPhotos;
  };

  const allPhotos = getAllPhotos();
  const currentPhotoUrl = allPhotos.length > 0 
    ? allPhotos[Math.min(photoIndex, allPhotos.length - 1)] 
    : null;

  // Debug: İlk render'da fotoğraf bilgilerini logla
  React.useEffect(() => {
    console.log(`🎯 [${user.firstName}] Kullanıcı fotoğraf bilgileri:`);
    console.log(`   - photos array:`, user.photos);
    console.log(`   - profileImageUrl:`, user.profileImageUrl);
    console.log(`   - Toplam fotoğraf:`, allPhotos.length);
    console.log(`   - Mevcut index:`, photoIndex);
    console.log(`   - Gösterilen fotoğraf:`, currentPhotoUrl);
  }, [user.id]); // Sadece kullanıcı değiştiğinde çalışsın

  const zodiacEmoji = getZodiacEmoji(user.zodiacSign);
  const zodiacDisplay = getZodiacDisplay(user.zodiacSign);
  const compatibilityColor = getCompatibilityColor(user.compatibilityScore);
  const compatibilityLabel = getCompatibilityLabel(user.compatibilityScore);

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.cardContainer, style, animatedStyle]}>
        <View style={styles.card}>
          <View style={styles.imageContainer}>
            {currentPhotoUrl ? (
              <Image
                source={{ uri: currentPhotoUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f3460']}
                style={styles.placeholderImage}
              >
                <Text style={styles.zodiacEmoji}>
                  {zodiacEmoji}
                </Text>
                <Text style={styles.placeholderText}>
                  {user.firstName}
                </Text>
                <Text style={styles.placeholderZodiac}>
                  {zodiacDisplay}
                </Text>
              </LinearGradient>
            )}

            {/* Fotoğraf navigation alanları */}
            <TouchableOpacity
              style={styles.photoNavLeft}
              onPress={() => handlePhotoTap('left')}
            />
            <TouchableOpacity
              style={styles.photoNavRight}
              onPress={() => handlePhotoTap('right')}
            />

            {/* Fotoğraf göstergeleri */}
            {allPhotos.length > 1 && (
              <View style={styles.photoIndicators}>
                {allPhotos.map((_, index) => (
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

            {/* Zodiac badge */}
            <View style={styles.zodiacBadge}>
              <Text style={styles.zodiacBadgeEmoji}>{zodiacEmoji}</Text>
            </View>

            {/* Gradient overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.9)']}
              style={styles.gradient}
            >
              <View style={styles.userInfo}>
                <Text style={styles.name}>
                  {user.firstName}, {user.age}
                </Text>
                <Text style={styles.zodiacSign}>
                  {zodiacDisplay}
                </Text>
                
                {/* Uyumluluk badge */}
                <View style={[
                  styles.compatibilityBadge,
                  { backgroundColor: compatibilityColor }
                ]}>
                  <Ionicons name="star" size={14} color="white" />
                  <Text style={styles.compatibilityScore}>
                    %{user.compatibilityScore}
                  </Text>
                  <Text style={styles.compatibilityLabel}>
                    {compatibilityLabel}
                  </Text>
                </View>
                
                {user.compatibilityDescription && (
                  <Text style={styles.compatibilityDescription} numberOfLines={2}>
                    ✨ {user.compatibilityDescription}
                  </Text>
                )}
                
                {user.bio && (
                  <Text style={styles.bioText} numberOfLines={2}>
                    {user.bio}
                  </Text>
                )}
                
                {/* Distance ve online status */}
                <View style={styles.statusRow}>
                  {user.distance && (
                    <View style={styles.statusItem}>
                      <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.7)" />
                      <Text style={styles.statusText}>{user.distance}km uzakta</Text>
                    </View>
                  )}
                  {user.isOnline && (
                    <View style={styles.statusItem}>
                      <View style={styles.onlineDot} />
                      <Text style={styles.statusText}>Çevrimiçi</Text>
                    </View>
                  )}
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Swipe Overlays */}
          <Animated.View style={[styles.overlay, styles.likeOverlay, likeOverlayStyle]}>
            <View style={styles.overlayContent}>
              <Ionicons name="heart" size={50} color="#4CAF50" />
              <Text style={[styles.overlayText, { color: '#4CAF50' }]}>UYUMLU</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.overlay, styles.dislikeOverlay, dislikeOverlayStyle]}>
            <View style={styles.overlayContent}>
              <Ionicons name="close" size={50} color="#F44336" />
              <Text style={[styles.overlayText, { color: '#F44336' }]}>UYUMSUZ</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.overlay, styles.superLikeOverlay, superLikeOverlayStyle]}>
            <View style={styles.overlayContent}>
              <Ionicons name="star" size={50} color="#8000FF" />
              <Text style={[styles.overlayText, { color: '#8000FF' }]}>MÜKEMMEL UYUM</Text>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

// Named export
export { ZodiacSwipeCard };

// Default export
export default ZodiacSwipeCard;

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center',
  },
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: 'rgba(128, 0, 255, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#8000FF',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 15,
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
  },
  zodiacEmoji: {
    fontSize: 80,
    marginBottom: 15,
  },
  placeholderText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  placeholderZodiac: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
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
    top: 15,
    left: 15,
    right: 15,
    flexDirection: 'row',
    zIndex: 5,
  },
  photoIndicator: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 1,
    borderRadius: 2,
  },
  activePhotoIndicator: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  zodiacBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(128, 0, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  zodiacBadgeEmoji: {
    fontSize: 24,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    padding: 20,
    justifyContent: 'flex-end',
  },
  userInfo: {
    marginBottom: 20,
  },
  name: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  zodiacSign: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
  },
  compatibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 8,
  },
  compatibilityScore: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  compatibilityLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  compatibilityDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  bioText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statusText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginLeft: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 4,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderRadius: 20,
  },
  likeOverlay: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  dislikeOverlay: {
    borderColor: '#F44336',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  superLikeOverlay: {
    borderColor: '#8000FF',
    backgroundColor: 'rgba(128, 0, 255, 0.1)',
  },
  overlayContent: {
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
}); 