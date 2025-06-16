import React, { useRef, useState } from 'react';
import { Animated, Dimensions, Image, PanResponder, StyleSheet, Text, View } from 'react-native';
import { DiscoverUser } from '../../services/api';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ZodiacSwipeCardProps {
  user: DiscoverUser;
  onSwipe: (direction: 'left' | 'right') => void;
  onPhotoChange?: (index: number) => void;
  onLike?: () => void;
  onDislike?: () => void;
  onMatch?: () => void;
}

const SWIPE_THRESHOLD = screenWidth * 0.25;
const PHOTO_SWIPE_THRESHOLD = 80;

const ZodiacSwipeCard: React.FC<ZodiacSwipeCardProps> = ({
  user,
  onSwipe,
  onPhotoChange,
  onLike,
  onDislike,
  onMatch,
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const [isPhotoSwiping, setIsPhotoSwiping] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        // Y ekseninde daha fazla hareket varsa fotoğraf swipe
        if (Math.abs(gesture.dy) > Math.abs(gesture.dx) && Math.abs(gesture.dy) > 10) {
          setIsPhotoSwiping(true);
          return true;
        }
        // X ekseninde daha fazla hareket varsa kart swipe
        if (Math.abs(gesture.dx) > Math.abs(gesture.dy) && Math.abs(gesture.dx) > 10) {
          setIsPhotoSwiping(false);
          return true;
        }
        return false;
      },
      onPanResponderMove: (_, gesture) => {
        if (isPhotoSwiping) {
          position.setValue({ x: 0, y: gesture.dy });
        } else {
          position.setValue({ x: gesture.dx, y: 0 });
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (isPhotoSwiping) {
          if (gesture.dy < -PHOTO_SWIPE_THRESHOLD && user.photos && photoIndex < user.photos.length - 1) {
            // Sonraki fotoğraf
            setPhotoIndex(photoIndex + 1);
            onPhotoChange?.(photoIndex + 1);
          } else if (gesture.dy > PHOTO_SWIPE_THRESHOLD && photoIndex > 0) {
            // Önceki fotoğraf
            setPhotoIndex(photoIndex - 1);
            onPhotoChange?.(photoIndex - 1);
          }
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        } else {
          if (gesture.dx > SWIPE_THRESHOLD) {
            // Like
            Animated.timing(position, {
              toValue: { x: screenWidth, y: 0 },
              duration: 200,
              useNativeDriver: false,
            }).start(() => {
              onSwipe('right');
              onLike?.();
              position.setValue({ x: 0, y: 0 });
            });
          } else if (gesture.dx < -SWIPE_THRESHOLD) {
            // Dislike
            Animated.timing(position, {
              toValue: { x: -screenWidth, y: 0 },
              duration: 200,
              useNativeDriver: false,
            }).start(() => {
              onSwipe('left');
              onDislike?.();
              position.setValue({ x: 0, y: 0 });
            });
          } else {
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
            }).start();
          }
        }
      },
    })
  ).current;

  if (!user) return null;

  const photoUrl = user.photos && user.photos.length > 0 ? user.photos[photoIndex].imageUrl : user.profileImageUrl || undefined;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.card,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate: position.x.interpolate({
                inputRange: [-screenWidth, 0, screenWidth],
                outputRange: ['-15deg', '0deg', '15deg'],
              }) },
          ],
        },
      ]}
    >
      <View style={styles.imageContainer}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.noImage}><Text style={{ color: '#fff' }}>Fotoğraf yok</Text></View>
        )}
        {/* Fotoğraf sayacı */}
        {user.photos && user.photos.length > 1 && (
          <View style={styles.photoIndicator}>
            {user.photos.map((_, idx) => (
              <View
                key={idx}
                style={[styles.dot, idx === photoIndex ? styles.activeDot : null]}
              />
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const CARD_WIDTH = screenWidth * 0.85;
const CARD_HEIGHT = screenHeight * 0.55;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    position: 'absolute',
    top: 0,
    left: (screenWidth - CARD_WIDTH) / 2,
    zIndex: 10,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#22223b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#B57EDC',
    width: 16,
  },
});

export default ZodiacSwipeCard; 