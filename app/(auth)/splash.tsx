import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Burç sembolleri
const ZODIAC_SYMBOLS = [
  { symbol: '♈', name: 'Koç', color: '#FFD700', angle: 0 },
  { symbol: '♉', name: 'Boğa', color: '#FFD700', angle: 30 },
  { symbol: '♊', name: 'İkizler', color: '#FFD700', angle: 60 },
  { symbol: '♋', name: 'Yengeç', color: '#FFD700', angle: 90 },
  { symbol: '♌', name: 'Aslan', color: '#FFD700', angle: 120 },
  { symbol: '♍', name: 'Başak', color: '#FFD700', angle: 150 },
  { symbol: '♎', name: 'Terazi', color: '#FFD700', angle: 180 },
  { symbol: '♏', name: 'Akrep', color: '#FFD700', angle: 210 },
  { symbol: '♐', name: 'Yay', color: '#FFD700', angle: 240 },
  { symbol: '♑', name: 'Oğlak', color: '#FFD700', angle: 270 },
  { symbol: '♒', name: 'Kova', color: '#FFD700', angle: 300 },
  { symbol: '♓', name: 'Balık', color: '#FFD700', angle: 330 },
];

// Müzik sembolleri
const MUSIC_SYMBOLS = [
  { symbol: '🎵', name: 'Nota', color: '#FFD700', angle: 0 },
  { symbol: '🎸', name: 'Gitar', color: '#FFD700', angle: 30 },
  { symbol: '🎹', name: 'Piyano', color: '#FFD700', angle: 60 },
  { symbol: '🎤', name: 'Mikrofon', color: '#FFD700', angle: 90 },
  { symbol: '🎧', name: 'Kulaklık', color: '#FFD700', angle: 120 },
  { symbol: '📻', name: 'Radyo', color: '#FFD700', angle: 150 },
  { symbol: '🎷', name: 'Saksafon', color: '#FFD700', angle: 180 },
  { symbol: '🎻', name: 'Keman', color: '#FFD700', angle: 210 },
  { symbol: '🥁', name: 'Davul', color: '#FFD700', angle: 240 },
  { symbol: '🎺', name: 'Trompet', color: '#FFD700', angle: 270 },
  { symbol: '🎶', name: 'Notalar', color: '#FFD700', angle: 300 },
  { symbol: '🎼', name: 'Müzik', color: '#FFD700', angle: 330 },
];

// Gezegen sembolleri - artık tek bir sembol
const PLANET_SYMBOL = '☀️'; // Güneş sembolü

export default function SplashScreen() {
  const router = useRouter();
  
  // Animasyon değerleri
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const leftSideWidth = useSharedValue(0);
  const rightSideWidth = useSharedValue(0);
  const colorProgress = useSharedValue(0);
  
  // Çark animasyonları
  const leftWheelRotation = useSharedValue(0);
  const rightWheelRotation = useSharedValue(0);
  const wheelsOpacity = useSharedValue(0);
  
  // Gezegen animasyonu
  const planetScale = useSharedValue(1);
  
  // Kulaklık animasyonu
  const headphoneScale = useSharedValue(1);

  // Logo animasyonu
  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [{ scale: logoScale.value }],
    };
  });

  // Sol taraf (astroloji) animasyonu
  const leftSideStyle = useAnimatedStyle(() => {
    return {
      width: leftSideWidth.value,
      opacity: Math.min(leftSideWidth.value / (width / 2), 1),
    };
  });

  // Sağ taraf (müzik) animasyonu
  const rightSideStyle = useAnimatedStyle(() => {
    return {
      width: rightSideWidth.value,
      opacity: Math.min(rightSideWidth.value / (width / 2), 1),
    };
  });

  // Sol çark (burç) animasyonu
  const leftWheelStyle = useAnimatedStyle(() => {
    return {
      opacity: wheelsOpacity.value,
      transform: [{ rotate: `${leftWheelRotation.value}deg` }],
    };
  });

  // Sağ çark (müzik) animasyonu
  const rightWheelStyle = useAnimatedStyle(() => {
    return {
      opacity: wheelsOpacity.value,
      transform: [{ rotate: `${rightWheelRotation.value}deg` }],
    };
  });
  
  // Gezegen sembolü animasyonu
  const planetStyle = useAnimatedStyle(() => {
    return {
      opacity: wheelsOpacity.value,
      transform: [{ scale: planetScale.value }],
    };
  });
  
  // Kulaklık animasyonu
  const headphoneStyle = useAnimatedStyle(() => {
    return {
      opacity: wheelsOpacity.value,
      transform: [{ scale: headphoneScale.value }],
    };
  });

  // Arka plan gradient animasyonu
  const backgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1],
      ['#9733EE', '#FF6B6B']
    );
    
    return {
      backgroundColor,
    };
  });

  useEffect(() => {
    // Ana logo animasyonu
    logoOpacity.value = withTiming(1, { duration: 1000 });
    logoScale.value = withSpring(1, { damping: 15 });
    
    // Yanların genişleme animasyonu (500ms sonra)
    setTimeout(() => {
      leftSideWidth.value = withTiming(width / 2, { duration: 800 });
      rightSideWidth.value = withTiming(width / 2, { duration: 800 });
      colorProgress.value = withTiming(0.5, { duration: 1500 });
    }, 500);
    
    // Çarkların görünme ve dönme animasyonu (800ms sonra)
    setTimeout(() => {
      // Çarkları göster
      wheelsOpacity.value = withTiming(1, { duration: 500 });
      
      // Çarkları hızlıca döndür (10 saniyede 360 derece yerine 2 saniyede)
      leftWheelRotation.value = withRepeat(
        withTiming(360, { 
          duration: 2000, 
          easing: Easing.linear 
        }), 
        -1, // sonsuz tekrar
        false
      );
      
      rightWheelRotation.value = withRepeat(
        withTiming(360, { 
          duration: 2000, 
          easing: Easing.linear 
        }), 
        -1, // sonsuz tekrar
        false
      );
      
      // Gezegen animasyonu (kulaklık gibi büyüyüp küçülsün)
      planetScale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 700, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
      
      // Kulaklık animasyonu (büyüyüp küçülsün)
      headphoneScale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 700, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
      
    }, 800);

    // Splash screen'den login sayfasına yönlendirme
    const timer = setTimeout(() => {
      try {
        if (Platform.OS === 'android') {
          // Android için daha güvenli navigasyon
          router.replace({
            pathname: '/(auth)/login'
          });
        } else {
          // iOS için standart navigasyon
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Navigasyon hatası:', error);
      }
    }, 3500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, backgroundStyle]}>
      {/* Ana Logo Container - Ortada ve Yukarıda */}
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <Text style={styles.logoText}>VYBE</Text>
      </Animated.View>
      
      {/* Sol Taraf - Astroloji */}
      <Animated.View style={[styles.leftSide, leftSideStyle]}>
        <LinearGradient
          colors={['#9733EE', '#8000FF']}
          style={styles.sideGradient}
        >
          {/* Burç Çarkı */}
          <Animated.View style={[styles.zodiacWheel, leftWheelStyle]}>
            <View style={styles.innerCircle} />
            <View style={styles.middleCircle} />
            <View style={styles.outerCircle} />
            
            {/* Burç sembolleri */}
            {ZODIAC_SYMBOLS.map((item, index) => (
              <View 
                key={index} 
                style={[
                  styles.symbolContainer, 
                  { 
                    transform: [
                      { rotate: `${item.angle}deg` }, 
                      { translateY: -(width * 0.3) },
                    ]
                  }
                ]}
              >
                <Text 
                  style={[
                    styles.wheelSymbol, 
                    { transform: [{ rotate: `-${item.angle}deg` }] }
                  ]}
                >
                  {item.symbol}
                </Text>
              </View>
            ))}
            
            {/* Merkez gezegen sembolü */}
            <Animated.View style={[styles.planetContainer, planetStyle]}>
              <Text style={styles.planetSymbol}>{PLANET_SYMBOL}</Text>
            </Animated.View>
            
            {/* Çarkın merkezi */}
            <View style={styles.centerDot} />
          </Animated.View>
        </LinearGradient>
      </Animated.View>
      
      {/* Sağ Taraf - Müzik */}
      <Animated.View style={[styles.rightSide, rightSideStyle]}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E53']}
          style={styles.sideGradient}
        >
          {/* Müzik Çarkı */}
          <Animated.View style={[styles.musicWheel, rightWheelStyle]}>
            <View style={styles.innerCircle} />
            <View style={styles.middleCircle} />
            <View style={styles.outerCircle} />
            
            {/* Müzik sembolleri */}
            {MUSIC_SYMBOLS.map((item, index) => (
              <View 
                key={index} 
                style={[
                  styles.symbolContainer, 
                  { 
                    transform: [
                      { rotate: `${item.angle}deg` }, 
                      { translateY: -(width * 0.3) },
                    ]
                  }
                ]}
              >
                <Text 
                  style={[
                    styles.wheelSymbol, 
                    { transform: [{ rotate: `-${item.angle}deg` }] }
                  ]}
                >
                  {item.symbol}
                </Text>
              </View>
            ))}
            
            {/* Merkezdeki Kulaklık */}
            <Animated.View style={[styles.headphoneContainer, headphoneStyle]}>
              <Text style={styles.headphoneSymbol}>🎧</Text>
            </Animated.View>
            
            {/* Çarkın merkezi */}
            <View style={styles.centerDot} />
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 10,
    top: height * 0.12, // Daha yukarıda konumlandır
  },
  logoText: {
    fontSize: 84,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    color: 'white',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 15,
    textTransform: 'uppercase',
  },
  leftSide: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: height,
    overflow: 'hidden',
  },
  rightSide: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: height,
    overflow: 'hidden',
  },
  sideGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zodiacWheel: {
    width: width * 0.7,
    height: width * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
  musicWheel: {
    width: width * 0.7,
    height: width * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
  symbolContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planetContainer: {
    width: width * 0.2,
    height: width * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  planetSymbol: {
    fontSize: 50,
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headphoneContainer: {
    width: width * 0.2,
    height: width * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  headphoneSymbol: {
    fontSize: 50,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  outerCircle: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    position: 'absolute',
  },
  middleCircle: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    position: 'absolute',
  },
  innerCircle: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.1)',
    position: 'absolute',
  },
  centerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD700',
    position: 'absolute',
  },
  wheelSymbol: {
    fontSize: 20,
    color: '#FFD700',
    textAlign: 'center',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
}); 