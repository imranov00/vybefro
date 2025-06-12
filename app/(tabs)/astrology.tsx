import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { PotentialMatch, swipeApi } from '../services/api';
import { calculateCompatibility, getCompatibilityDescription } from '../types/compatibility';
import { getZodiacEmoji } from '../types/zodiac';

const { width, height } = Dimensions.get('window');

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
  const { userProfile } = useProfile();
  const [currentMatch, setCurrentMatch] = useState(0);
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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

  // Potential matches'i yükle
  useEffect(() => {
    loadPotentialMatches();
  }, []);

  const loadPotentialMatches = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Astroloji potansiyel eşleşmeleri yükleniyor...');
      
      const response = await swipeApi.getPotentialMatches(1, 10);
      
      if (response.users && response.users.length > 0) {
        const matches = response.users.map(user => ({
          ...user,
          photos: user.photos && user.photos.length > 0 ? user.photos : (user.profileImageUrl ? [user.profileImageUrl] : []),
          compatibilityDescription: user.compatibilityMessage || getCompatibilityDescription(
            userProfile.zodiacSign as any,
            user.zodiacSign as any,
            user.compatibilityScore || 50
          )
        }));
        
        setPotentialMatches(matches);
        console.log('✅ Astroloji eşleşmeleri yüklendi:', matches.length);
      } else {
        console.log('⚠️ Hiç kullanıcı bulunamadı, mock data kullanılıyor...');
        generateMockData();
      }
    } catch (error) {
      console.error('❌ Astroloji potential matches yükleme hatası:', error);
      console.log('🔄 API hatası, mock data kullanılıyor...');
      generateMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = () => {
    const mockZodiacSigns = ['ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO', 'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES'];
    const userZodiac = userProfile.zodiacSign || 'ARIES';
    
    const mockUsers: PotentialMatch[] = Array.from({ length: 8 }, (_, index) => {
      const randomZodiac = mockZodiacSigns[Math.floor(Math.random() * mockZodiacSigns.length)];
      const compatibility = calculateCompatibility(userZodiac as any, randomZodiac as any);
      
      return {
        id: index + 1,
        username: `user_${index + 1}`,
        firstName: ['Ayşe', 'Fatma', 'Zeynep', 'Mehmet', 'Ali', 'Ahmet', 'Elif', 'Deniz'][index],
        lastName: ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Özkan', 'Arslan', 'Doğan'][index],
        age: Math.floor(Math.random() * 15) + 20,
        profileImageUrl: `https://picsum.photos/400/600?random=${index + 1}`,
        photos: [`https://picsum.photos/400/600?random=${index + 1}`],
        bio: 'Hayatı dolu dolu yaşamayı seven biriyim.',
        zodiacSign: randomZodiac,
        compatibilityScore: compatibility,
        compatibilityDescription: getCompatibilityDescription(userZodiac as any, randomZodiac as any, compatibility),
        distance: Math.floor(Math.random() * 20) + 1,
        isOnline: Math.random() > 0.5
      };
    });
    
    setPotentialMatches(mockUsers);
  };

  const handleSwipe = async (direction: 'left' | 'right' | 'up') => {
    if (potentialMatches.length === 0) return;
    
    const currentUser = potentialMatches[currentMatch];
    
    try {
      let action: 'LIKE' | 'DISLIKE' | 'SUPER_LIKE';
      switch (direction) {
        case 'right':
          action = 'LIKE';
          break;
        case 'left':
          action = 'DISLIKE';
          break;
        case 'up':
          action = 'SUPER_LIKE';
          break;
      }
      
      console.log('🔄 Swipe yapılıyor:', { userId: currentUser.id, action });
      
      const response = await swipeApi.swipe({
        targetUserId: currentUser.id,
        action: action
      });
      
      console.log('✅ Swipe yanıtı:', response);
      
      if (response.isMatch) {
        Alert.alert(
          '🎉 Eşleştiniz!',
          `${currentUser.firstName} ile eşleştiniz! %${currentUser.compatibilityScore} uyumluluğunuz var.`,
          [{ text: 'Harika!', style: 'default' }]
        );
      }
      
    } catch (error) {
      console.error('❌ Swipe hatası:', error);
      Alert.alert('Hata', 'Swipe işlemi sırasında bir hata oluştu.');
    }
    
    // Sonraki karta geç
    handleCardTap();
  };

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
        setCurrentMatch((prev) => (prev + 1) % potentialMatches.length);
        fadeAnim.value = withTiming(1, { duration: 200 });
      });
    }, 100);
  };

  const getCurrentUser = () => {
    if (potentialMatches.length === 0) return null;
    return potentialMatches[currentMatch];
  };

  const currentUser = getCurrentUser();

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
        {isLoading ? (
          <View style={[styles.matchCard, styles.loadingCard]}>
            <Text style={styles.loadingText}>Eşleşmeler yükleniyor...</Text>
          </View>
        ) : currentUser ? (
          <Animated.View style={[styles.matchCard, animatedCardStyle]}>
            <TouchableOpacity 
              style={styles.cardContent}
              onPress={handleCardTap}
              activeOpacity={0.9}
            >
              {/* Profil Fotoğrafı */}
              <View style={styles.profileImageContainer}>
                <Image 
                  source={{ uri: currentUser.profileImageUrl || 'https://picsum.photos/300' }}
                  style={styles.profileImage}
                />
              </View>
              
              <View style={styles.cardHeader}>
                <Text style={styles.matchSymbol}>
                  {getZodiacEmoji(currentUser.zodiacSign)}
                </Text>
                <View style={styles.matchInfo}>
                  <Text style={styles.matchName}>
                    {currentUser.firstName}, {currentUser.age}
                  </Text>
                  <View style={styles.compatibilityContainer}>
                    <Text style={styles.compatibilityText}>
                      %{currentUser.compatibilityScore} Uyumlu
                    </Text>
                    <View style={styles.compatibilityBar}>
                      <View 
                        style={[
                          styles.compatibilityFill, 
                          { 
                            width: `${currentUser.compatibilityScore}%`,
                            backgroundColor: currentUser.compatibilityScore > 80 ? '#4ECDC4' : 
                                           currentUser.compatibilityScore > 60 ? '#FECA57' : '#FF6B6B'
                          }
                        ]} 
                      />
                    </View>
                  </View>
                  {currentUser.compatibilityDescription && (
                    <Text style={styles.compatibilityDesc}>
                      {currentUser.compatibilityDescription}
                    </Text>
                  )}
                </View>
              </View>
              
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.passButton]}
                  onPress={() => handleSwipe('left')}
                >
                  <Ionicons name="close" size={24} color="#FF6B6B" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.likeButton]}
                  onPress={() => handleSwipe('right')}
                >
                  <Ionicons name="heart" size={24} color="#4ECDC4" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.superLikeButton]}
                  onPress={() => handleSwipe('up')}
                >
                  <Ionicons name="star" size={24} color="#FECA57" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.tapHint}>Kartı değiştirmek için dokunun</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={[styles.matchCard, styles.emptyCard]}>
            <Text style={styles.emptyText}>Şu anda gösterilecek eşleşme yok</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={loadPotentialMatches}
            >
              <Text style={styles.refreshButtonText}>Yenile</Text>
            </TouchableOpacity>
          </View>
        )}

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
  loadingCard: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 20,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  compatibilityDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 10,
  },
  emptyCard: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 5,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
}); 