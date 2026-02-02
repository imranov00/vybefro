import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Dimensions, Image, StyleSheet } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import type { DiscoverUserDTO } from '../../context/SwipeContext';

const { width } = Dimensions.get('window');

interface SwipeCardProps {
  user: DiscoverUserDTO;
  translateX: Animated.Value;
  rotate: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  onGestureEvent: (...args: any[]) => void;
  onHandlerStateChange: (event: any) => void;
  children?: React.ReactNode;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  user,
  translateX,
  rotate,
  scale,
  opacity,
  onGestureEvent,
  onHandlerStateChange,
  children
}) => {
  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [
              { translateX: translateX },
              { 
                rotate: rotate.interpolate({
                  inputRange: [-1, 1],
                  outputRange: ['-15deg', '15deg'],
                })
              },
              { scale: scale }
            ],
            opacity: opacity,
          }
        ]}
      >
        {/* Swipe Overlay - LIKE */}
        <Animated.View
          style={[
            styles.swipeOverlay,
            styles.likeOverlay,
            {
              opacity: translateX.interpolate({
                inputRange: [0, width / 2],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              }),
            }
          ]}
        >
          <Animated.Text style={styles.swipeOverlayText}>❤️ LIKE</Animated.Text>
        </Animated.View>

        {/* Swipe Overlay - DISLIKE */}
        <Animated.View
          style={[
            styles.swipeOverlay,
            styles.dislikeOverlay,
            {
              opacity: translateX.interpolate({
                inputRange: [-width / 2, 0],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
            }
          ]}
        >
          <Animated.Text style={styles.swipeOverlayText}>❌ PASS</Animated.Text>
        </Animated.View>

        {/* Main Photo */}
        <Image 
          source={{ 
            uri: user.profileImageUrl || 
                  (user.photos.length > 0 ? user.photos[0].imageUrl : 'https://picsum.photos/400/600?random=1')
          }} 
          style={styles.mainPhoto}
          fadeDuration={200}
        />

        {/* Gradient Overlay */}
        <LinearGradient 
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']} 
          style={styles.photoOverlay}
        />

        {/* Custom Content */}
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width * 0.95,
    height: '100%',
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  swipeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  likeOverlay: {
    backgroundColor: 'rgba(0, 255, 0, 0.3)',
  },
  dislikeOverlay: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  swipeOverlayText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
});
