import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
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
import {
    getCompatibilityColor,
    getCompatibilityLabel,
    getCompatibilityLevel
} from '../../types/compatibility';
import { getZodiacDisplay, getZodiacEmoji } from '../../types/zodiac';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.9;
const CARD_HEIGHT = screenHeight * 0.7;
const SWIPE_THRESHOLD = screenWidth * 0.25;

interface SwipeCardProps {
  user: PotentialMatch;
  onSwipe: (direction: 'left' | 'right' | 'up', userId: number) => void;
  onPress?: () => void;
  isTop?: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ user, onSwipe, onPress, isTop = false }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(isTop ? 1 : 0.95);
  const opacity = useSharedValue(isTop ? 1 : 0.8);

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const photos = user.photos && user.photos.length > 0 ? user.photos : [user.profileImageUrl].filter(Boolean);

  const compatibilityLevel = getCompatibilityLevel(user.compatibilityScore);
  const compatibilityColor = getCompatibilityColor(user.compatibilityScore);
  const compatibilityLabel = getCompatibilityLabel(user.compatibilityScore);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      if (!isTop) return;
    },
    onActive: (event) => {
      if (!isTop) return;
      
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotate.value = interpolate(
        event.translationX,
        [-screenWidth, screenWidth],
        [-30, 30],
        Extrapolate.CLAMP
      );
    },
    onEnd: (event) => {
      if (!isTop) return;

      const { translationX, translationY, velocityX, velocityY } = event;

      // Super like (yukarı kaydırma)
      if (translationY < -100 && Math.abs(translationX) < 50) {
        translateY.value = withTiming(-screenHeight);
        translateX.value = withTiming(0);
        rotate.value = withTiming(0);
        runOnJS(onSwipe)('up', user.id);
        return;
      }

      // Sağa veya sola kaydırma
      if (Math.abs(translationX) > SWIPE_THRESHOLD || Math.abs(velocityX) > 500) {
        const direction = translationX > 0 ? 'right' : 'left';
        const targetX = direction === 'right' ? screenWidth : -screenWidth;
        
        translateX.value = withTiming(targetX);
        rotate.value = withTiming(direction === 'right' ? 30 : -30);
        runOnJS(onSwipe)(direction, user.id);
      } else {
        // Geri dön
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
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
      [-100, 0],
      [1, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

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

  const age = new Date().getFullYear() - new Date(user.age).getFullYear();

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.card, cardStyle]}>
        <TouchableOpacity 
          style={styles.cardContent} 
          onPress={onPress}
          activeOpacity={0.95}
        >
          {/* Fotoğraf */}
          <View style={styles.imageContainer}>
            {photos.length > 0 && photos[currentPhotoIndex] ? (
              <Image 
                source={{ uri: photos[currentPhotoIndex] }} 
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.zodiacEmoji}>
                  {getZodiacEmoji(user.zodiacSign)}
                </Text>
              </View>
            )}

            {/* Fotoğraf navigasyon */}
            {photos.length > 1 && (
              <>
                <TouchableOpacity 
                  style={styles.photoNavLeft} 
                  onPress={prevPhoto}
                />
                <TouchableOpacity 
                  style={styles.photoNavRight} 
                  onPress={nextPhoto}
                />
                
                {/* Fotoğraf göstergeleri */}
                <View style={styles.photoIndicators}>
                  {photos.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.photoIndicator,
                        index === currentPhotoIndex && styles.activePhotoIndicator
                      ]}
                    />
                  ))}
                </View>
              </>
            )}

            {/* Uyumluluk Badge */}
            <View style={[styles.compatibilityBadge, { backgroundColor: compatibilityColor }]}>
              <Text style={styles.compatibilityScore}>%{user.compatibilityScore}</Text>
              <Text style={styles.compatibilityText}>{compatibilityLabel}</Text>
            </View>

            {/* Online durumu */}
            {user.isOnline && (
              <View style={styles.onlineIndicator}>
                <View style={styles.onlineDot} />
              </View>
            )}
          </View>

          {/* Kullanıcı bilgileri */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.infoGradient}
          >
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>
                  {user.firstName} {user.lastName}, {age}
                </Text>
                <Text style={styles.zodiacDisplay}>
                  {getZodiacDisplay(user.zodiacSign)}
                </Text>
              </View>
              
              {user.bio && (
                <Text style={styles.bio} numberOfLines={2}>
                  {user.bio}
                </Text>
              )}

              {user.distance && (
                <View style={styles.distanceRow}>
                  <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.distance}>{user.distance} km uzakta</Text>
                </View>
              )}

              {/* Uyumluluk açıklaması */}
              <View style={styles.compatibilityInfo}>
                <Text style={styles.compatibilityDescription} numberOfLines={2}>
                  {user.compatibilityDescription}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Swipe Overlays */}
          <Animated.View style={[styles.overlay, styles.likeOverlay, likeOverlayStyle]}>
            <BlurView intensity={20} style={styles.overlayBlur}>
              <Ionicons name="heart" size={60} color="#4CAF50" />
              <Text style={[styles.overlayText, { color: '#4CAF50' }]}>BEĞENDİM</Text>
            </BlurView>
          </Animated.View>

          <Animated.View style={[styles.overlay, styles.dislikeOverlay, dislikeOverlayStyle]}>
            <BlurView intensity={20} style={styles.overlayBlur}>
              <Ionicons name="close" size={60} color="#F44336" />
              <Text style={[styles.overlayText, { color: '#F44336' }]}>HAYIR</Text>
            </BlurView>
          </Animated.View>

          <Animated.View style={[styles.overlay, styles.superLikeOverlay, superLikeOverlayStyle]}>
            <BlurView intensity={20} style={styles.overlayBlur}>
              <Ionicons name="star" size={60} color="#2196F3" />
              <Text style={[styles.overlayText, { color: '#2196F3' }]}>SÜPER BEĞENİ</Text>
            </BlurView>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center',
  },
  cardContent: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.5,
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
    backgroundColor: '#2a2a3e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zodiacEmoji: {
    fontSize: 80,
  },
  photoNavLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    zIndex: 2,
  },
  photoNavRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    zIndex: 2,
  },
  photoIndicators: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    zIndex: 3,
  },
  photoIndicator: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  activePhotoIndicator: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  compatibilityBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    zIndex: 3,
  },
  compatibilityScore: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  compatibilityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 3,
  },
  onlineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: 'white',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  zodiacDisplay: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  bio: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    marginBottom: 8,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  distance: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },
  compatibilityInfo: {
    marginTop: 8,
  },
  compatibilityDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
    lineHeight: 18,
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
    transform: [{ rotate: '-20deg' }],
  },
  dislikeOverlay: {
    transform: [{ rotate: '20deg' }],
  },
  superLikeOverlay: {
    transform: [{ rotate: '0deg' }],
  },
  overlayBlur: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 20,
  },
  overlayText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default SwipeCard; 