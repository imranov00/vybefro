import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
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
import { PotentialMatch } from '../../services/api';
import { getCompatibilityColor, getCompatibilityLabel } from '../../types/compatibility';
import { getZodiacDisplay, getZodiacEmoji } from '../../types/zodiac';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85;
const CARD_HEIGHT = screenHeight * 0.65;
const SWIPE_THRESHOLD = screenWidth * 0.3;
const ROTATION_STRENGTH = 0.1;

interface SwipeCardProps {
  user: PotentialMatch;
  onSwipe: (direction: 'left' | 'right' | 'up', userId: number) => void;
  isTop?: boolean;
  index?: number;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ 
  user, 
  onSwipe, 
  isTop = false, 
  index = 0 
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(isTop ? 1 : 0.95 - index * 0.02);
  const opacity = useSharedValue(isTop ? 1 : 0.8 - index * 0.1);

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Fotoğraf dizisini düzenle
  const photos = user.photos && user.photos.length > 0 
    ? user.photos 
    : user.profileImageUrl 
      ? [user.profileImageUrl] 
      : [];

  const compatibilityColor = getCompatibilityColor(user.compatibilityScore);
  const compatibilityLabel = getCompatibilityLabel(user.compatibilityScore);

  // Gesture handler
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
      
      // Rotasyon hesaplama
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

      // Super like kontrolü (yukarı kaydırma)
      if (translationY < -120 && Math.abs(translationX) < 100) {
        translateY.value = withTiming(-screenHeight * 1.5, { duration: 300 });
        translateX.value = withTiming(0, { duration: 300 });
        rotate.value = withTiming(0, { duration: 300 });
        runOnJS(onSwipe)('up', user.id);
        return;
      }

      // Sağa/sola kaydırma kontrolü
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
        // Geri dön
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
        rotate.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    },
  });

  // Animasyon stilleri
  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
      zIndex: isTop ? 1000 : 999 - index,
    };
  });

  // Overlay animasyonları
  const likeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const dislikeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const superLikeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [-120, 0],
      [1, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  // Fotoğraf navigasyonu
  const nextPhoto = () => {
    if (photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  // Yaş hesaplama
  const age = typeof user.age === 'number' ? user.age : 25;

  return (
    <PanGestureHandler onGestureEvent={gestureHandler} enabled={isTop}>
      <Animated.View style={[styles.cardContainer, cardStyle]}>
        <View style={styles.card}>
          {/* Ana fotoğraf alanı */}
          <View style={styles.imageContainer}>
            {photos.length > 0 && photos[currentPhotoIndex] ? (
              <Image 
                source={{ uri: photos[currentPhotoIndex] }} 
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['#8000FF', '#5B00B5', '#3D007A']}
                style={styles.placeholderImage}
              >
                <Text style={styles.zodiacEmoji}>
                  {getZodiacEmoji(user.zodiacSign)}
                </Text>
                <Text style={styles.placeholderText}>Fotoğraf Yok</Text>
              </LinearGradient>
            )}

            {/* Fotoğraf navigasyon alanları */}
            {photos.length > 1 && (
              <>
                <TouchableOpacity 
                  style={styles.photoNavLeft} 
                  onPress={prevPhoto}
                  activeOpacity={1}
                />
                <TouchableOpacity 
                  style={styles.photoNavRight} 
                  onPress={nextPhoto}
                  activeOpacity={1}
                />
                
                {/* Fotoğraf göstergeleri */}
                <View style={styles.photoIndicators}>
                  {photos.map((_, photoIndex) => (
                    <View
                      key={photoIndex}
                      style={[
                        styles.photoIndicator,
                        photoIndex === currentPhotoIndex && styles.activePhotoIndicator
                      ]}
                    />
                  ))}
                </View>
              </>
            )}

            {/* Uyumluluk badge */}
            <View style={[styles.compatibilityBadge, { backgroundColor: compatibilityColor }]}>
              <Text style={styles.compatibilityScore}>%{user.compatibilityScore}</Text>
              <Text style={styles.compatibilityLabel}>{compatibilityLabel}</Text>
            </View>

            {/* Online göstergesi */}
            {user.isOnline && (
              <View style={styles.onlineIndicator}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Çevrimiçi</Text>
              </View>
            )}
          </View>

          {/* Kullanıcı bilgileri */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={styles.infoGradient}
          >
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>
                  {user.firstName} {user.lastName}
                </Text>
                <Text style={styles.userAge}>{age}</Text>
              </View>
              
              <View style={styles.zodiacRow}>
                <Text style={styles.zodiacDisplay}>
                  {getZodiacDisplay(user.zodiacSign)}
                </Text>
                {user.distance && (
                  <View style={styles.distanceContainer}>
                    <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.distance}>{user.distance} km</Text>
                  </View>
                )}
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
          </LinearGradient>

          {/* Swipe overlay'leri */}
          <Animated.View style={[styles.overlay, styles.likeOverlay, likeOverlayStyle]}>
            <View style={styles.overlayContent}>
              <Ionicons name="heart" size={50} color="#4CAF50" />
              <Text style={[styles.overlayText, { color: '#4CAF50' }]}>BEĞENDİM</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.overlay, styles.dislikeOverlay, dislikeOverlayStyle]}>
            <View style={styles.overlayContent}>
              <Ionicons name="close" size={50} color="#F44336" />
              <Text style={[styles.overlayText, { color: '#F44336' }]}>HAYIR</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.overlay, styles.superLikeOverlay, superLikeOverlayStyle]}>
            <View style={styles.overlayContent}>
              <Ionicons name="star" size={50} color="#FFD700" />
              <Text style={[styles.overlayText, { color: '#FFD700' }]}>SÜPER BEĞENİ</Text>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

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
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
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
    fontSize: 60,
    marginBottom: 10,
  },
  placeholderText: {
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
  compatibilityBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    alignItems: 'center',
    zIndex: 5,
  },
  compatibilityScore: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  compatibilityLabel: {
    color: 'white',
    fontSize: 9,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 5,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 4,
  },
  onlineText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  infoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
    justifyContent: 'flex-end',
  },
  userInfo: {
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  userAge: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  zodiacRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  zodiacDisplay: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 2,
  },
  bio: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
    marginBottom: 6,
  },
  compatibilityDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
    lineHeight: 16,
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
    transform: [{ rotate: '-15deg' }],
  },
  dislikeOverlay: {
    transform: [{ rotate: '15deg' }],
  },
  superLikeOverlay: {
    transform: [{ rotate: '0deg' }],
  },
  overlayContent: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: 'currentColor',
  },
  overlayText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default SwipeCard; 