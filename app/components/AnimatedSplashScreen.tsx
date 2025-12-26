import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const LOGO_SIZE = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.7;

// Tema renkleri
const THEMES = {
  purple: {
    nebula1: '#3D1A80',
    nebula2: '#4A2090',
    nebula3: '#2D1060',
    outerGlow: '#2D1060',
    outerGlowShadow: '#3D1A80',
    innerGlow: '#4A2090',
    innerGlowShadow: '#5D3FD3',
    logoText: '#E0D0FF',
    logoTextShadow: '#B388FF',
    tagline: '#9B7BD4',
    decorativeLine: ['transparent', '#7C4DFF', '#B388FF', '#7C4DFF', 'transparent'] as const,
    particle: '#5D3FD3',
    particleShadow: '#4A2090',
    logo: require('../../assets/images/splash_logo.png'),
  },
  green: {
    nebula1: '#1A802D',
    nebula2: '#20904A',
    nebula3: '#106030',
    outerGlow: '#106030',
    outerGlowShadow: '#1A803D',
    innerGlow: '#209050',
    innerGlowShadow: '#3FD35D',
    logoText: '#D0FFE0',
    logoTextShadow: '#88FFB3',
    tagline: '#7BD49B',
    decorativeLine: ['transparent', '#4DFF7C', '#88FFB3', '#4DFF7C', 'transparent'] as const,
    particle: '#3FD35D',
    particleShadow: '#20904A',
    logo: require('../../assets/images/splash_logo2.png'),
  },
};

export type SplashTheme = 'purple' | 'green';

interface SplashScreenProps {
  onFinish: () => void;
  isAppReady?: boolean;
  theme?: SplashTheme;
  duration?: number; // Splash süresi (ms)
}

export default function AnimatedSplashScreen({ onFinish, isAppReady = true, theme = 'purple', duration = 2500 }: SplashScreenProps) {
  const colors = THEMES[theme];
  
  // Animasyon değerleri
  const containerOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const floatY = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const starsOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const exitOpacity = useSharedValue(1);
  const exitScale = useSharedValue(1);

  const handleFinish = () => {
    onFinish();
  };

  useEffect(() => {
    // Container fade in
    containerOpacity.value = withTiming(1, { duration: 400 });
    
    // Stars fade in first
    starsOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    
    // Logo entrance - scale up with bounce
    logoScale.value = withDelay(300, withSequence(
      withTiming(1.15, { duration: 600, easing: Easing.out(Easing.back(1.7)) }),
      withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
    ));
    
    // Logo fade in
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    
    // Glow effect fade in
    glowOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    
    // Continuous pulse animation
    pulseScale.value = withDelay(1200, withRepeat(
      withSequence(
        withTiming(1.04, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ));
    
    // Floating animation
    floatY.value = withDelay(1000, withRepeat(
      withSequence(
        withTiming(-12, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(12, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ));
    
    // Subtle rotation
    rotateZ.value = withDelay(1000, withRepeat(
      withSequence(
        withTiming(2, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-2, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ));
    
    // Text fade in
    textOpacity.value = withDelay(1000, withTiming(1, { duration: 800 }));
  }, []);

  // Exit animation - either when isAppReady or after duration
  useEffect(() => {
    if (isAppReady) {
      // Belirli süre sonra çıkış animasyonunu başlat
      const timer = setTimeout(() => {
        exitScale.value = withTiming(1.3, { duration: 500, easing: Easing.out(Easing.ease) });
        exitOpacity.value = withTiming(0, { duration: 600, easing: Easing.in(Easing.ease) }, (finished) => {
          if (finished) {
            runOnJS(handleFinish)();
          }
        });
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isAppReady, duration]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value * exitOpacity.value,
    transform: [{ scale: exitScale.value }],
  }));

  const logoContainerStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value * pulseScale.value },
      { translateY: floatY.value },
      { rotate: `${rotateZ.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowOpacity.value, [0, 1], [0, 0.25]),
    // Glow sabit kalacak, scale yok
  }));

  const innerGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowOpacity.value, [0, 1], [0, 0.35]),
    // Inner glow sabit kalacak, scale yok
  }));

  const starsStyle = useAnimatedStyle(() => ({
    opacity: starsOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [
      { translateY: interpolate(textOpacity.value, [0, 1], [20, 0]) },
    ],
  }));

  // Star positions
  const starPositions = useMemo(() => 
    [...Array(50)].map(() => ({
      top: Math.random() * SCREEN_HEIGHT,
      left: Math.random() * SCREEN_WIDTH,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 2000,
    })), []
  );

  // Dynamic styles based on theme
  const dynamicStyles = useMemo(() => ({
    nebula1: { backgroundColor: colors.nebula1 },
    nebula2: { backgroundColor: colors.nebula2 },
    nebula3: { backgroundColor: colors.nebula3 },
    outerGlow: { 
      backgroundColor: colors.outerGlow,
      shadowColor: colors.outerGlowShadow,
    },
    innerGlow: { 
      backgroundColor: colors.innerGlow,
      shadowColor: colors.innerGlowShadow,
    },
    logoText: { 
      color: colors.logoText,
      textShadowColor: colors.logoTextShadow,
    },
    tagline: { color: colors.tagline },
    particle: { 
      backgroundColor: colors.particle,
      shadowColor: colors.particleShadow,
    },
  }), [colors]);

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Background - tam siyah */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, backgroundColor: '#000000' }} />
      </View>
      
      {/* Nebula effects */}
      <View style={styles.nebulaContainer}>
        <View style={[styles.nebula, styles.nebula1, dynamicStyles.nebula1]} />
        <View style={[styles.nebula, styles.nebula2, dynamicStyles.nebula2]} />
        <View style={[styles.nebula, styles.nebula3, dynamicStyles.nebula3]} />
      </View>

      {/* Stars */}
      <Animated.View style={[styles.starsContainer, starsStyle]}>
        {starPositions.map((pos, i) => (
          <Star key={i} index={i} top={pos.top} left={pos.left} size={pos.size} delay={pos.delay} />
        ))}
      </Animated.View>

      {/* Main logo with effects */}
      <View style={styles.logoWrapper}>
        {/* Outer glow */}
        <Animated.View style={[styles.outerGlow, glowStyle, dynamicStyles.outerGlow]} />
        
        {/* Inner glow */}
        <Animated.View style={[styles.innerGlow, innerGlowStyle, dynamicStyles.innerGlow]} />
        
        {/* Logo container */}
        <Animated.View style={[styles.logoContainer, logoContainerStyle]}>
          <Image
            source={colors.logo}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Text */}
      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={[styles.logoText, dynamicStyles.logoText]}>VYBE</Text>
        <Text style={[styles.taglineText, dynamicStyles.tagline]}>astrology • music • connection</Text>
        
        {/* Decorative line */}
        <View style={styles.decorativeLine}>
          <LinearGradient
            colors={colors.decorativeLine as any}
            style={styles.decorativeLineGradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          />
        </View>
      </Animated.View>

      {/* Bottom particles */}
      <Animated.View style={[styles.particlesContainer, starsStyle]}>
        {[...Array(8)].map((_, i) => (
          <FloatingParticle key={i} index={i} theme={theme} />
        ))}
      </Animated.View>
    </Animated.View>
  );
}

// Twinkling star component
const Star = ({ index, top, left, size, delay }: { index: number; top: number; left: number; size: number; delay: number }) => {
  const opacity = useSharedValue(0.2);
  const scale = useSharedValue(1);
  
  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 800 + Math.random() * 1200 }),
          withTiming(0.2, { duration: 800 + Math.random() * 1200 })
        ),
        -1,
        true
      )
    );
    
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.8, { duration: 1000 + Math.random() * 500 }),
          withTiming(1, { duration: 1000 + Math.random() * 500 })
        ),
        -1,
        true
      )
    );
  }, []);

  const starStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        starStyle,
        { width: size, height: size, borderRadius: size / 2, top, left },
      ]}
    />
  );
};

// Floating particle component
const FloatingParticle = ({ index, theme }: { index: number; theme: SplashTheme }) => {
  const colors = THEMES[theme];
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  
  const startX = (SCREEN_WIDTH / 9) * (index + 1);
  const size = 4 + Math.random() * 4;
  
  useEffect(() => {
    const delay = index * 300;
    
    translateY.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(-80 - Math.random() * 40, { duration: 3000 + Math.random() * 2000, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 0 })
      ),
      -1,
      false
    ));
    
    translateX.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming((Math.random() - 0.5) * 40, { duration: 3000 + Math.random() * 2000 }),
        withTiming(0, { duration: 0 })
      ),
      -1,
      false
    ));
    
    opacity.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(0.8, { duration: 500 }),
        withTiming(0.8, { duration: 2000 }),
        withTiming(0, { duration: 500 }),
        withTiming(0, { duration: 500 })
      ),
      -1,
      false
    ));
    
    scale.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.3, { duration: 2000 }),
        withTiming(0.5, { duration: 0 })
      ),
      -1,
      false
    ));
  }, []);

  const particleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        particleStyle,
        { 
          left: startX, 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          backgroundColor: colors.particle,
          shadowColor: colors.particleShadow,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  nebulaContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  nebula: {
    position: 'absolute',
    borderRadius: 999,
  },
  nebula1: {
    width: 350,
    height: 350,
    top: '5%',
    left: '-25%',
    opacity: 0.03,
    transform: [{ scale: 1.5 }],
  },
  nebula2: {
    width: 300,
    height: 300,
    bottom: '10%',
    right: '-20%',
    opacity: 0.025,
    transform: [{ scale: 1.3 }],
  },
  nebula3: {
    width: 250,
    height: 250,
    top: '35%',
    right: '5%',
    opacity: 0.02,
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  logoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: LOGO_SIZE + 80,
    height: LOGO_SIZE + 80,
  },
  outerGlow: {
    position: 'absolute',
    width: LOGO_SIZE + 40,
    height: LOGO_SIZE + 40,
    borderRadius: (LOGO_SIZE + 40) / 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 50,
  },
  innerGlow: {
    position: 'absolute',
    width: LOGO_SIZE + 20,
    height: LOGO_SIZE + 20,
    borderRadius: (LOGO_SIZE + 20) / 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  logoContainer: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  textContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: 18,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  taglineText: {
    fontSize: 14,
    letterSpacing: 5,
    marginTop: 12,
    opacity: 0.9,
  },
  decorativeLine: {
    marginTop: 25,
    width: 180,
    height: 2,
    overflow: 'hidden',
  },
  decorativeLineGradient: {
    flex: 1,
  },
  particlesContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  particle: {
    position: 'absolute',
    bottom: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
  },
});
