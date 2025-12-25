import { useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
import { State } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

export interface SwipeGestureHandlers {
  translateX: Animated.Value;
  rotate: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  onGestureEvent: (...args: any[]) => void;
  onHandlerStateChange: (event: any) => void;
  resetAnimations: () => void;
}

interface UseSwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export const useSwipeGesture = (options: UseSwipeGestureOptions = {}): SwipeGestureHandlers => {
  const { onSwipeLeft, onSwipeRight, threshold = 100 } = options;

  // Animasyon değerleri
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Animasyonları sıfırla
  const resetAnimations = () => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.spring(rotate, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(opacity, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Gesture event handler
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  // Gesture state handler
  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX: tx, velocityX } = event.nativeEvent;

      // Swipe threshold kontrolü
      if (Math.abs(tx) > threshold || Math.abs(velocityX) > 500) {
        if (tx > 0) {
          // Sağa swipe - LIKE
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: width,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(rotate, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onSwipeRight?.();
            resetAnimations();
          });
        } else {
          // Sola swipe - DISLIKE
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: -width,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(rotate, {
              toValue: -1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onSwipeLeft?.();
            resetAnimations();
          });
        }
      } else {
        // Geri dön
        resetAnimations();
      }
    }
  };

  return {
    translateX,
    rotate,
    scale,
    opacity,
    onGestureEvent,
    onHandlerStateChange,
    resetAnimations,
  };
};
