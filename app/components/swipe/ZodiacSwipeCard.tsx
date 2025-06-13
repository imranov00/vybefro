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
  onSwipe: (direction: 'left' | 'right', userId: number) => void;
  isTop?: boolean;
  style?: any;
  photoIndex: number;
  setPhotoIndex: (userId: number, index: number) => void;
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
  const opacity = useSharedValue(1);

  // BASİT FOTOĞRAF SİSTEMİ
  const photos = React.useMemo(() => {
    const allPhotos: string[] = [];
    
    if (user.profileImageUrl) {
      allPhotos.push(user.profileImageUrl);
    }
    
    if (user.photos && user.photos.length > 0) {
      user.photos.forEach(photo => {
        if (photo.imageUrl && photo.imageUrl !== user.profileImageUrl) {
          allPhotos.push(photo.imageUrl);
        }
      });
    }
    
    console.log(`🔍 [${user.firstName}] Toplam fotoğraf: ${allPhotos.length}`, allPhotos);
    return allPhotos;
  }, [user.photos, user.profileImageUrl, user.firstName]);

  const currentPhoto = photos[photoIndex] || null;

  // FOTOĞRAF DEĞİŞTİRME
  const changePhoto = (direction: 'next' | 'prev') => {
    if (photos.length <= 1) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (photoIndex + 1) % photos.length;
    } else {
      newIndex = photoIndex > 0 ? photoIndex - 1 : photos.length - 1;
    }
    
    console.log(`📸 [${user.firstName}] Fotoğraf değişti: ${photoIndex} → ${newIndex}`);
    setPhotoIndex(user.id, newIndex);
  };

  // SADECE SWIPE İÇİN GESTURE HANDLER
  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      if (!isTop) return;
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    },
    onEnd: (event) => {
      if (!isTop) return;
      
      const shouldSwipe = Math.abs(event.translationX) > SWIPE_THRESHOLD;
      
      if (shouldSwipe) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        const targetX = direction === 'right' ? screenWidth * 1.5 : -screenWidth * 1.5;
        
        translateX.value = withTiming(targetX, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });
        
        runOnJS(onSwipe)(direction, user.id);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${translateX.value / 20}deg` }
    ],
    opacity: opacity.value
  }));

  const zodiacEmoji = getZodiacEmoji(user.zodiacSign);
  const zodiacDisplay = getZodiacDisplay(user.zodiacSign);
  const compatibilityColor = getCompatibilityColor(user.compatibilityScore);
  const compatibilityLabel = getCompatibilityLabel(user.compatibilityScore);

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.cardContainer, style, animatedStyle]}>
        <View style={styles.card}>
          
          {/* FOTOĞRAF ALANI */}
          <View style={styles.imageContainer}>
            {currentPhoto ? (
              <Image
                source={{ uri: currentPhoto }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f3460']}
                style={styles.image}
              >
                <Text style={styles.zodiacEmoji}>{zodiacEmoji}</Text>
                <Text style={styles.placeholderText}>{user.firstName}</Text>
              </LinearGradient>
            )}

            {/* SOL/SAĞ TAP ALANLARI */}
            {photos.length > 1 && (
              <>
                <TouchableOpacity 
                  style={styles.leftTap}
                  onPress={() => {
                    console.log('👈 Sol tarafa tap - önceki fotoğraf');
                    changePhoto('prev');
                  }}
                  activeOpacity={1}
                />
                <TouchableOpacity 
                  style={styles.rightTap}
                  onPress={() => {
                    console.log('👉 Sağ tarafa tap - sonraki fotoğraf');
                    changePhoto('next');
                  }}
                  activeOpacity={1}
                />
              </>
            )}

            {/* FOTOĞRAF NOKTALAR */}
            {photos.length > 1 && (
              <View style={styles.dots}>
                {photos.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dot,
                      index === photoIndex && styles.activeDot
                    ]}
                    onPress={() => {
                      console.log(`📍 Nokta ${index} tıklandı`);
                      setPhotoIndex(user.id, index);
                    }}
                  />
                ))}
              </View>
            )}

            {/* BURÇ BADGE */}
            <View style={styles.zodiacBadge}>
              <Text style={styles.zodiacBadgeText}>{zodiacEmoji}</Text>
            </View>

            {/* BİLGİ ALANI */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.infoGradient}
            >
              <Text style={styles.name}>{user.firstName}, {user.age}</Text>
              <Text style={styles.zodiac}>{zodiacDisplay}</Text>
              
              <View style={[styles.compatibilityBadge, { backgroundColor: compatibilityColor }]}>
                <Ionicons name="star" size={12} color="white" />
                <Text style={styles.compatibilityText}>
                  %{user.compatibilityScore} {compatibilityLabel}
                </Text>
              </View>
              
              {user.bio && (
                <Text style={styles.bio} numberOfLines={2}>{user.bio}</Text>
              )}
            </LinearGradient>
          </View>
          
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

export { ZodiacSwipeCard };
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  zodiacEmoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  placeholderText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  leftTap: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: CARD_WIDTH / 2,
    height: '70%',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  rightTap: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: CARD_WIDTH / 2,
    height: '70%',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  dots: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    flexDirection: 'row',
    zIndex: 15,
  },
  dot: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  activeDot: {
    backgroundColor: 'white',
  },
  zodiacBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: 'rgba(128, 0, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  zodiacBadgeText: {
    fontSize: 20,
  },
  infoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    padding: 20,
    justifyContent: 'flex-end',
  },
  name: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  zodiac: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginBottom: 8,
  },
  compatibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  compatibilityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  bio: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 18,
  },
}); 