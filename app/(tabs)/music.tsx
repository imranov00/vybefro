import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect } from 'react';
import { Dimensions, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

// Müzik türleri ve eşleşme bilgileri
const MUSIC_MATCHES = [
  { icon: '🎸', genre: 'Rock', artist: 'Queen', compatibility: 94, color: '#FF6B6B' },
  { icon: '🎵', genre: 'Pop', artist: 'Taylor Swift', compatibility: 89, color: '#4ECDC4' },
  { icon: '🎹', genre: 'Classical', artist: 'Mozart', compatibility: 91, color: '#45B7D1' },
  { icon: '🎤', genre: 'R&B', artist: 'The Weeknd', compatibility: 86, color: '#96CEB4' },
  { icon: '🎧', genre: 'Electronic', artist: 'Daft Punk', compatibility: 92, color: '#FECA57' },
  { icon: '🎻', genre: 'Jazz', artist: 'Miles Davis', compatibility: 88, color: '#FF9FF3' },
  { icon: '🥁', genre: 'Hip-Hop', artist: 'Kendrick Lamar', compatibility: 85, color: '#54A0FF' },
  { icon: '🎺', genre: 'Blues', artist: 'B.B. King', compatibility: 83, color: '#5F27CD' },
];

// Dönen müzik enstrümanları
const MUSIC_WHEEL_SYMBOLS = [
  { symbol: '🎵', name: 'Nota', angle: 0 },
  { symbol: '🎸', name: 'Gitar', angle: 30 },
  { symbol: '🎹', name: 'Piyano', angle: 60 },
  { symbol: '🎤', name: 'Mikrofon', angle: 90 },
  { symbol: '🎧', name: 'Kulaklık', angle: 120 },
  { symbol: '📻', name: 'Radyo', angle: 150 },
  { symbol: '🎷', name: 'Saksafon', angle: 180 },
  { symbol: '🎻', name: 'Keman', angle: 210 },
  { symbol: '🥁', name: 'Davul', angle: 240 },
  { symbol: '🎺', name: 'Trompet', angle: 270 },
  { symbol: '🎶', name: 'Notalar', angle: 300 },
  { symbol: '🎼', name: 'Müzik', angle: 330 },
];

export default function MusicScreen() {
  const colorScheme = useColorScheme();
  const { switchMode } = useAuth();
  
  // State'i güvenli bir şekilde tanımla
  const [currentMatchIndex, setCurrentMatchIndex] = React.useState(0);
  
  // Animasyon değerleri
  const rotation = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const fadeAnim = useSharedValue(1);
  const waveAnim = useSharedValue(0);

  // Animasyon reset fonksiyonu
  const resetAnimations = useCallback(() => {
    try {
      'worklet';
      cardScale.value = 1;
      fadeAnim.value = 1;
    } catch (error) {
      console.error('Animation reset error:', error);
    }
  }, []);

  // Güvenli match değiştirme fonksiyonu
  const switchToNextMatch = useCallback(() => {
    try {
      setCurrentMatchIndex((prevIndex) => {
        const safeIndex = typeof prevIndex === 'number' && !isNaN(prevIndex) ? prevIndex : 0;
        const nextIndex = (safeIndex + 1) % MUSIC_MATCHES.length;
        console.log('Switching to music match:', nextIndex);
        return nextIndex;
      });
    } catch (error) {
      console.error('Match switch error:', error);
      // Fallback: Manuel index hesapla
      const currentIndex = currentMatchIndex || 0;
      const nextIndex = (currentIndex + 1) % MUSIC_MATCHES.length;
      setCurrentMatchIndex(nextIndex);
    }
  }, [currentMatchIndex]);

  // Güvenli current match getter
  const getCurrentMatch = useCallback(() => {
    try {
      const safeIndex = typeof currentMatchIndex === 'number' && 
                        !isNaN(currentMatchIndex) && 
                        currentMatchIndex >= 0 && 
                        currentMatchIndex < MUSIC_MATCHES.length 
                        ? currentMatchIndex : 0;
      return MUSIC_MATCHES[safeIndex];
    } catch (error) {
      console.error('Get current match error:', error);
      return MUSIC_MATCHES[0]; // Fallback to first item
    }
  }, [currentMatchIndex]);

  // Memoized current match
  const currentMatch = getCurrentMatch();

  // Dönen müzik çarkı animasyonu
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { 
        duration: 100000, // Biraz daha hızlı
        easing: Easing.linear 
      }), 
      -1,
      false
    );

    // Ses dalgası animasyonu
    waveAnim.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Cleanup function - component unmount olurken
    return () => {
      try {
        // Animasyonları durdur
        rotation.value = withTiming(rotation.value);
        waveAnim.value = withTiming(waveAnim.value);
        resetAnimations();
      } catch (error) {
        console.error('Animation cleanup error:', error);
      }
    };
  }, []);

  // Animasyon sağlık kontrolü - her 15 saniyede bir kontrol et
  useEffect(() => {
    const healthCheck = setInterval(() => {
      try {
        // Eğer animasyon değerleri NaN veya undefined ise reset et
        if (isNaN(cardScale.value) || isNaN(fadeAnim.value)) {
          console.warn('Animation values corrupted, resetting...');
          resetAnimations();
        }
      } catch (error) {
        console.error('Animation health check error:', error);
        resetAnimations();
      }
    }, 15000);

    return () => clearInterval(healthCheck);
  }, []);

  // Kart animasyonu
  const animatedWheelStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
      opacity: fadeAnim.value,
    };
  });

  const animatedWaveStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: 0.8 + (waveAnim.value * 0.4) }],
      opacity: 0.5 - (waveAnim.value * 0.3),
    };
  });

  const handleCardTap = () => {
    try {
      // Önce animasyonları durdur
      cardScale.value = withTiming(cardScale.value);
      fadeAnim.value = withTiming(fadeAnim.value);
      
      // Güvenli kart scale animasyonu
      cardScale.value = withSpring(0.95, { 
        damping: 15,
        stiffness: 150
      }, (finished) => {
        if (finished) {
          cardScale.value = withSpring(1, {
            damping: 15,
            stiffness: 150
          });
        }
    });
    
      // Güvenli kart değiştirme animasyonu
    setTimeout(() => {
        try {
          fadeAnim.value = withTiming(0, { 
            duration: 200 
          }, (finished) => {
            if (finished) {
              // State güncelleme - UI thread'de yap
              switchToNextMatch();
              
              // Fade in animasyonu
              fadeAnim.value = withTiming(1, { 
                duration: 200 
              });
            }
      });
        } catch (error) {
          console.error('Card fade animation error:', error);
          // Fallback: Animasyon olmadan değiştir
          switchToNextMatch();
          fadeAnim.value = 1;
        }
      }, 150);
      
    } catch (error) {
      console.error('Card tap animation error:', error);
      // Güvenli fallback: Sadece kart değiştir
      switchToNextMatch();
    }
  };

  return (
    <View style={styles.container}>
      {/* Status bar ayarı */}
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Arka plan gradyan */}
      <LinearGradient
        colors={['#1DB954', '#1E7E34', '#145A24']}
        style={styles.background}
      />

      {/* Dönen müzik çarkı - arka plan */}
      <Animated.View style={[styles.musicWheel, animatedWheelStyle]}>
        <View style={styles.innerCircle} />
        <View style={styles.middleCircle} />
        <View style={styles.outerCircle} />
        
        {MUSIC_WHEEL_SYMBOLS.map((item, index) => (
          <View 
            key={index} 
            style={[
              styles.symbolContainer, 
              { 
                transform: [
                  { rotate: `${item.angle}deg` }, 
                  { translateY: -(width * 0.4) },
                ]
              }
            ]}
          >
            <Text 
              style={[
                styles.musicSymbol, 
                { transform: [{ rotate: `-${item.angle}deg` }] }
              ]}
            >
              {item.symbol}
            </Text>
          </View>
        ))}
        
        <View style={styles.centerDot} />
      </Animated.View>

      {/* Ses dalgası efekti */}
      <Animated.View style={[styles.waveEffect, animatedWaveStyle]} />
      <Animated.View style={[styles.waveEffect2, animatedWaveStyle]} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Başlık */}
        <View style={styles.header}>
          <Text style={styles.title}>Müzik Uyumluluğu</Text>
          <Text style={styles.subtitle}>Müzik Zevkinize Uygun Eşleşmeler</Text>
        </View>

        {/* Ana Eşleşme Kartı */}
        <Animated.View style={[styles.matchCard, animatedCardStyle]}>
          <TouchableOpacity 
            style={styles.cardContent}
            onPress={handleCardTap}
            onPressIn={() => {
              try {
                cardScale.value = withSpring(0.98, { damping: 20 });
              } catch (error) {
                console.error('Press in animation error:', error);
              }
            }}
            onPressOut={() => {
              try {
                if (cardScale.value !== 1) {
                  cardScale.value = withSpring(1, { damping: 20 });
                }
              } catch (error) {
                console.error('Press out animation error:', error);
              }
            }}
            activeOpacity={0.9}
            disabled={fadeAnim.value < 0.5} // Animasyon sırasında tıklamayı engelle
          >
            <View style={styles.cardHeader}>
              <Text style={styles.matchIcon}>
                {currentMatch.icon}
              </Text>
              <View style={styles.matchInfo}>
                <Text style={styles.matchGenre}>
                  {currentMatch.genre}
                </Text>
                <Text style={styles.matchArtist}>
                  {currentMatch.artist}
                </Text>
                <View style={styles.compatibilityContainer}>
                  <Text style={styles.compatibilityText}>
                    %{currentMatch.compatibility} Uyumlu
                  </Text>
                  <View style={styles.compatibilityBar}>
                    <View 
                      style={[
                        styles.compatibilityFill, 
                        { 
                          width: `${currentMatch.compatibility}%`,
                          backgroundColor: currentMatch.color
                        }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.cardActions}>
              <TouchableOpacity style={[styles.actionButton, styles.skipButton]}>
                <Ionicons name="play-skip-forward" size={24} color="#FF6B6B" />
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButton, styles.playButton]}>
                <Ionicons name="play" size={28} color="#4ECDC4" />
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButton, styles.addButton]}>
                <Ionicons name="add" size={24} color="#FECA57" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.tapHint}>Kartı değiştirmek için dokunun</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Bugünün Müzik Önerisi */}
        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationTitle}>🎵 Bugünün Müzik Önerisi</Text>
          <Text style={styles.recommendationText}>
            Yeni keşfettiğiniz müzik türleri ruh halinizi yükseltebilir. 
            Farklı tarzlardaki kişilerle müzik üzerinden bağ kurmaya açık olun.
          </Text>
        </View>

        {/* Son Dinlenenler */}
        <View style={styles.recentCard}>
          <Text style={styles.recentTitle}>📀 Popüler Türler</Text>
          <View style={styles.genreList}>
            {['Pop', 'Rock', 'Jazz', 'Electronic'].map((genre, index) => (
              <View key={index} style={styles.genreChip}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    width: width,
    height: height + (StatusBar.currentHeight || 0),
    top: -(StatusBar.currentHeight || 0),
  },
  musicWheel: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.08,
    left: -width * 0.1,
    top: height * 0.1,
  },
  innerCircle: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.1)',
    position: 'absolute',
  },
  middleCircle: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.15)',
    position: 'absolute',
  },
  outerCircle: {
    width: width * 1.0,
    height: width * 1.0,
    borderRadius: width * 0.5,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    position: 'absolute',
  },
  symbolContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicSymbol: {
    fontSize: 18,
    color: 'rgba(255, 215, 0, 0.4)',
    textAlign: 'center',
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.4)',
    position: 'absolute',
  },
  waveEffect: {
    position: 'absolute',
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    top: height * 0.4,
    left: width * 0.35,
  },
  waveEffect2: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    top: height * 0.3,
    left: width * 0.25,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: (StatusBar.currentHeight || 0) + 80,
    paddingBottom: Platform.OS === 'ios' ? 140 : 115,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  matchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    width: '100%',
  },
  matchIcon: {
    fontSize: 60,
    marginRight: 20,
  },
  matchInfo: {
    flex: 1,
  },
  matchGenre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  matchArtist: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  compatibilityContainer: {
    flex: 1,
  },
  compatibilityText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  compatibilityBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  compatibilityFill: {
    height: '100%',
    borderRadius: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  playButton: {
    borderWidth: 2,
    borderColor: '#4ECDC4',
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  addButton: {
    borderWidth: 2,
    borderColor: '#FECA57',
  },
  tapHint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  recommendationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  recentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  genreList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genreChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  genreText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  spacer: {
    height: 40,
  },
}); 