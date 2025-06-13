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

interface SwipeCardProps {
  user: DiscoverUser;
  onSwipe: (direction: 'left' | 'right' | 'up', userId: number) => void;
  isTop?: boolean;
  style?: any;
  photoIndex: number;
  setPhotoIndex: (index: number) => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
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
    const photos = user.photos.map(p => p.imageUrl);
    if (side === 'left' && photoIndex > 0) {
      setPhotoIndex(photoIndex - 1);
    } else if (side === 'right' && photoIndex < photos.length - 1) {
      setPhotoIndex(photoIndex + 1);
    }
  };

  const currentPhotoUrl = user.photos.length > 0 
    ? user.photos[photoIndex]?.imageUrl || user.profileImageUrl 
    : user.profileImageUrl;

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
              <View style={styles.placeholderImage}>
                <Text style={styles.zodiacEmoji}>
                  {getZodiacEmoji(user.zodiacSign)}
                </Text>
                <Text style={styles.placeholderText}>
                  {user.firstName}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.photoNavLeft}
              onPress={() => handlePhotoTap('left')}
            />
            <TouchableOpacity
              style={styles.photoNavRight}
              onPress={() => handlePhotoTap('right')}
            />

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

            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.gradient}
            >
              <View style={styles.userInfo}>
                <Text style={styles.name}>
                  {user.firstName}, {user.age}
                </Text>
                <Text style={styles.zodiacSign}>
                  {getZodiacDisplay(user.zodiacSign)}
                </Text>
                <View style={[
                  styles.compatibilityBadge,
                  { backgroundColor: getCompatibilityColor(user.compatibilityScore) }
                ]}>
                  <Text style={styles.compatibilityScore}>
                    %{user.compatibilityScore}
                  </Text>
                  <Text style={styles.compatibilityLabel}>
                    {getCompatibilityLabel(user.compatibilityScore)}
                  </Text>
                </View>
                {user.compatibilityDescription && (
                  <Text style={styles.compatibilityDescription} numberOfLines={2}>
                    {user.compatibilityDescription}
                  </Text>
                )}
              </View>
            </LinearGradient>
          </View>

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
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    padding: 20,
    justifyContent: 'flex-end',
  },
  userInfo: {
    marginBottom: 20,
  },
  name: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  zodiacSign: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: 8,
  },
  compatibilityBadge: {
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
  },
  compatibilityLabel: {
    color: 'white',
    fontSize: 12,
  },
  compatibilityDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
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
  },
  dislikeOverlay: {
    borderColor: '#F44336',
  },
  superLikeOverlay: {
    borderColor: '#FFD700',
  },
  overlayContent: {
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
}); 