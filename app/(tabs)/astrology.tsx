import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
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

// Burç bilgileri
const ZODIAC_SIGNS = [
  { symbol: '♈', name: 'Koç', compatibility: 95, color: '#FF6B6B' },
  { symbol: '♉', name: 'Boğa', compatibility: 88, color: '#4ECDC4' },
  { symbol: '♊', name: 'İkizler', compatibility: 92, color: '#45B7D1' },
  { symbol: '♋', name: 'Yengeç', compatibility: 78, color: '#96CEB4' },
  { symbol: '♌', name: 'Aslan', compatibility: 85, color: '#FECA57' },
  { symbol: '♍', name: 'Başak', compatibility: 90, color: '#FF9FF3' },
  { symbol: '♎', name: 'Terazi', compatibility: 87, color: '#54A0FF' },
  { symbol: '♏', name: 'Akrep', compatibility: 83, color: '#5F27CD' },
];

// Burç çarkı sembolleri
const ZODIAC_WHEEL_SYMBOLS = [
  { symbol: '♈', name: 'Koç', angle: 0 },
  { symbol: '♉', name: 'Boğa', angle: 30 },
  { symbol: '♊', name: 'İkizler', angle: 60 },
  { symbol: '♋', name: 'Yengeç', angle: 90 },
  { symbol: '♌', name: 'Aslan', angle: 120 },
  { symbol: '♍', name: 'Başak', angle: 150 },
  { symbol: '♎', name: 'Terazi', angle: 180 },
  { symbol: '♏', name: 'Akrep', angle: 210 },
  { symbol: '♐', name: 'Yay', angle: 240 },
  { symbol: '♑', name: 'Oğlak', angle: 270 },
  { symbol: '♒', name: 'Kova', angle: 300 },
  { symbol: '♓', name: 'Balık', angle: 330 },
];

export default function AstrologyScreen() {
  const colorScheme = useColorScheme();
  const { switchMode } = useAuth();
  const [currentMatch, setCurrentMatch] = useState(0);
  
  // Animasyon değerleri
  const rotation = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const fadeAnim = useSharedValue(1);

  // Dönen burç çarkı animasyonu
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { 
        duration: 120000, // 2 dakikada bir tur
        easing: Easing.linear 
      }), 
      -1,
      false
    );
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

  const handleCardTap = () => {
    cardScale.value = withSpring(0.95, { damping: 10 }, () => {
      cardScale.value = withSpring(1);
    });
    
    // Sonraki eşleşmeye geç
    setTimeout(() => {
      fadeAnim.value = withTiming(0, { duration: 200 }, () => {
        setCurrentMatch((prev) => (prev + 1) % ZODIAC_SIGNS.length);
        fadeAnim.value = withTiming(1, { duration: 200 });
      });
    }, 100);
  };

  return (
    <View style={styles.container}>
      {/* Status bar ayarı */}
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Arka plan gradyan */}
      <LinearGradient
        colors={['#8000FF', '#5B00B5', '#3D007A']}
        style={styles.background}
      />

      {/* Dönen burç çarkı - arka plan */}
      <Animated.View style={[styles.zodiacWheel, animatedWheelStyle]}>
        <View style={styles.innerCircle} />
        <View style={styles.middleCircle} />
        <View style={styles.outerCircle} />
        
        {ZODIAC_WHEEL_SYMBOLS.map((item, index) => (
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
                styles.zodiacSymbol, 
                { transform: [{ rotate: `-${item.angle}deg` }] }
              ]}
            >
              {item.symbol}
            </Text>
          </View>
        ))}
        
        <View style={styles.centerDot} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Başlık */}
        <View style={styles.header}>
          <Text style={styles.title}>Burç Uyumluluğu</Text>
          <Text style={styles.subtitle}>Size Uygun Eşleşmeleri Keşfedin</Text>
        </View>

        {/* Ana Eşleşme Kartı */}
        <Animated.View style={[styles.matchCard, animatedCardStyle]}>
          <TouchableOpacity 
            style={styles.cardContent}
            onPress={handleCardTap}
            activeOpacity={0.9}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.matchSymbol}>
                {ZODIAC_SIGNS[currentMatch].symbol}
              </Text>
              <View style={styles.matchInfo}>
                <Text style={styles.matchName}>
                  {ZODIAC_SIGNS[currentMatch].name}
                </Text>
                <View style={styles.compatibilityContainer}>
                  <Text style={styles.compatibilityText}>
                    %{ZODIAC_SIGNS[currentMatch].compatibility} Uyumlu
                  </Text>
                  <View style={styles.compatibilityBar}>
                    <View 
                      style={[
                        styles.compatibilityFill, 
                        { 
                          width: `${ZODIAC_SIGNS[currentMatch].compatibility}%`,
                          backgroundColor: ZODIAC_SIGNS[currentMatch].color
                        }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.cardActions}>
              <TouchableOpacity style={[styles.actionButton, styles.passButton]}>
                <Ionicons name="close" size={24} color="#FF6B6B" />
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButton, styles.likeButton]}>
                <Ionicons name="heart" size={24} color="#4ECDC4" />
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButton, styles.superLikeButton]}>
                <Ionicons name="star" size={24} color="#FECA57" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.tapHint}>Kartı değiştirmek için dokunun</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Bugünün Burç Yorumu */}
        <View style={styles.horoscopeCard}>
          <Text style={styles.horoscopeTitle}>✨ Bugünün Burç Yorumu</Text>
          <Text style={styles.horoscopeText}>
            Yeni tanışacağınız kişilerle güçlü bir bağ kurabilirsiniz. 
            Astrolojik enerjiler bugün aşk konusunda size yardımcı olacak.
          </Text>
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
  zodiacWheel: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.1,
    left: -width * 0.1,
    top: height * 0.1,
  },
  innerCircle: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'absolute',
  },
  middleCircle: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    position: 'absolute',
  },
  outerCircle: {
    width: width * 1.0,
    height: width * 1.0,
    borderRadius: width * 0.5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'absolute',
  },
  symbolContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zodiacSymbol: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.3)',
    textAlign: 'center',
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    position: 'absolute',
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
  matchSymbol: {
    fontSize: 60,
    marginRight: 20,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
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
  passButton: {
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  likeButton: {
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  superLikeButton: {
    borderWidth: 2,
    borderColor: '#FECA57',
  },
  tapHint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  horoscopeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  horoscopeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  horoscopeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  spacer: {
    height: 40,
  },
}); 