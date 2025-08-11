import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    Dimensions,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useChat } from '../../context/ChatContext';
import { calculateCompatibility, getCompatibilityDescription } from '../../types/compatibility';
import { getZodiacInfo } from '../../types/zodiac';

const { width, height } = Dimensions.get('window');

interface AstrologyMatchScreenProps {
  currentUser: {
    id: number;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    zodiacSign: string;
  };
  matchedUser: {
    id: number;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    zodiacSign: string;
  };
  onClose: () => void;
  onStartChat: () => void;
}

const AstrologyMatchScreen: React.FC<AstrologyMatchScreenProps> = ({ 
  currentUser, 
  matchedUser, 
  onClose, 
  onStartChat 
}) => {
  const router = useRouter();
  const { refreshPrivateChats } = useChat();
  const [isClosing, setIsClosing] = React.useState(false);
  
  // Animation values
  const backgroundOpacity = useSharedValue(0);
  const starsScale = useSharedValue(0);
  const heartsScale = useSharedValue(0);
  const profileCardsY = useSharedValue(height);
  const compatibilityScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const buttonY = useSharedValue(100);

  // Burç bilgilerini al
  const currentUserZodiac = getZodiacInfo(currentUser.zodiacSign);
  const matchedUserZodiac = getZodiacInfo(matchedUser.zodiacSign);
  
  // Uyumluluk hesapla
  const compatibilityScore = calculateCompatibility(
    currentUser.zodiacSign as any, 
    matchedUser.zodiacSign as any
  );
  
  const compatibilityDesc = getCompatibilityDescription(
    currentUser.zodiacSign as any,
    matchedUser.zodiacSign as any,
    compatibilityScore
  );

  // Uyumluluk rengini belirle
  const getCompatibilityColor = () => {
    if (compatibilityScore >= 85) return '#4CAF50'; // Yeşil
    if (compatibilityScore >= 70) return '#FF9800'; // Turuncu
    if (compatibilityScore >= 50) return '#FFC107'; // Sarı
    return '#F44336'; // Kırmızı
  };

  useEffect(() => {
    // Animasyon sırası
    backgroundOpacity.value = withTiming(1, { duration: 500 });
    
    // Yıldızlar ve kalpler
    setTimeout(() => {
      starsScale.value = withSpring(1, { damping: 15 });
      heartsScale.value = withSequence(
        withSpring(1.3, { damping: 8 }),
        withSpring(1, { damping: 12 })
      );
    }, 300);

    // Profil kartları
    setTimeout(() => {
      profileCardsY.value = withSpring(0, { damping: 15 });
    }, 600);

    // Uyumluluk ve text
    setTimeout(() => {
      compatibilityScale.value = withSpring(1, { damping: 12 });
      textOpacity.value = withTiming(1, { duration: 800 });
    }, 1000);

    // Buton
    setTimeout(() => {
      buttonY.value = withSpring(0, { damping: 15 });
    }, 1400);
    
    // Cleanup function
    return () => {
      // Animasyonları durdur
      backgroundOpacity.value = 0;
      textOpacity.value = 0;
      profileCardsY.value = height;
      heartsScale.value = 1;
      starsScale.value = 0;
      compatibilityScale.value = 0;
      buttonY.value = 100;
    };
  }, []);

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const starsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starsScale.value }],
  }));

  const heartsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartsScale.value }],
  }));

  const profileCardsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: profileCardsY.value }],
  }));

  const compatibilityStyle = useAnimatedStyle(() => ({
    transform: [{ scale: compatibilityScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonY.value }],
  }));

  const handleClose = () => {
    if (isClosing) return; // Çift tıklama koruması
    
    // Kapanma animasyonu
    backgroundOpacity.value = withTiming(0, { duration: 300 });
    textOpacity.value = withTiming(0, { duration: 200 });
    profileCardsY.value = withTiming(height, { duration: 300 });
    
    // Animasyon tamamlandıktan sonra kapat
    setTimeout(() => {
      try {
        onClose();
      } catch (error) {
        console.error('❌ [ASTRO_MATCH] Kapanma hatası:', error);
        // Hata durumunda state'i sıfırla
        setIsClosing(false);
      }
    }, 350); // Animasyon süresinden biraz daha uzun
  };

    const handleStartChat = () => {
    if (isClosing) return; // Çift tıklama koruması
    
    // Kapanma animasyonu
    backgroundOpacity.value = withTiming(0, { duration: 300 });
    textOpacity.value = withTiming(0, { duration: 200 });
    
    // Animasyon tamamlandıktan sonra sohbet başlat
    setTimeout(async () => {
      try {
        // Private chat listesini yenile (yeni match için chat odası oluştu)
        await refreshPrivateChats();
        
        onStartChat();
      } catch (error) {
        console.error('❌ [ASTRO_MATCH] Sohbet başlatma hatası:', error);
        // Hata durumunda state'i sıfırla ve tekrar dene
        setIsClosing(false);
        // Hata olsa bile chat'i açmaya çalış
        onStartChat();
      }
    }, 350); // Animasyon süresinden biraz daha uzun
  };

  return (
    <View style={[styles.container, { backgroundColor: 'rgba(255, 0, 0, 0.8)' }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Background */}
      <Animated.View style={[styles.background, backgroundStyle]}>
        <LinearGradient
          colors={['#0F0C29', '#302B63', '#24243e']}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Yıldız efektleri */}
      <Animated.View style={[styles.starsContainer, starsStyle]}>
        {Array.from({ length: 30 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.8 + 0.2,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Kalp animasyonu */}
      <Animated.View style={[styles.heartsContainer, heartsStyle]}>
        <View style={styles.heartLeft}>
          <Ionicons name="heart" size={50} color="#FF6B9D" />
        </View>
        <View style={styles.heartRight}>
          <Ionicons name="heart" size={50} color="#FF6B9D" />
        </View>
        <View style={styles.heartCenter}>
          <Ionicons name="heart" size={70} color="#FF1744" />
        </View>
      </Animated.View>

      {/* Başlık */}
      <Animated.View style={[styles.titleContainer, textStyle]}>
        <Text style={styles.matchTitle}>🌟 YILDIZLAR BULUŞTU! 🌟</Text>
        <Text style={styles.matchSubtitle}>
          {currentUser.firstName} ve {matchedUser.firstName}
        </Text>
        <Text style={styles.matchDescription}>
          Yıldızlarınız birbirinizi beğendiğinizi söylüyor...
        </Text>
      </Animated.View>

      {/* Profil Kartları */}
      <Animated.View style={[styles.profileSection, profileCardsStyle]}>
        {/* Sol profil - Current User */}
        <View style={[styles.profileCard, styles.leftProfile]}>
          <View style={styles.profileImageContainer}>
            {currentUser.profileImageUrl ? (
              <Image 
                source={{ uri: currentUser.profileImageUrl }} 
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderEmoji}>
                  {currentUserZodiac?.emoji || '👤'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser.firstName}</Text>
            <Text style={styles.profileZodiac}>
              {currentUserZodiac?.display || currentUser.zodiacSign}
            </Text>
          </View>
        </View>

        {/* Ortadaki burç uyumluluğu */}
        <Animated.View style={[styles.compatibilityCenter, compatibilityStyle]}>
          <View style={styles.compatibilityCircle}>
            <Text style={styles.compatibilityPercentage}>
              %{compatibilityScore}
            </Text>
            <Text style={styles.compatibilityLabel}>Uyumlu</Text>
          </View>
          <View style={styles.zodiacConnection}>
            <Text style={styles.zodiacEmoji}>
              {currentUserZodiac?.emoji}
            </Text>
            <View style={styles.connectionLine} />
            <Text style={styles.zodiacEmoji}>
              {matchedUserZodiac?.emoji}
            </Text>
          </View>
        </Animated.View>

        {/* Sağ profil - Matched User */}
        <View style={[styles.profileCard, styles.rightProfile]}>
          <View style={styles.profileImageContainer}>
            {matchedUser.profileImageUrl ? (
              <Image 
                source={{ uri: matchedUser.profileImageUrl }} 
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderEmoji}>
                  {matchedUserZodiac?.emoji || '👤'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{matchedUser.firstName}</Text>
            <Text style={styles.profileZodiac}>
              {matchedUserZodiac?.display || matchedUser.zodiacSign}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Uyumluluk Açıklaması */}
      <Animated.View style={[styles.compatibilityDescription, textStyle]}>
        <Text style={styles.descriptionTitle}>✨ Yıldızlar Ne Diyor?</Text>
        <Text style={styles.descriptionText}>
          {compatibilityDesc}
        </Text>
      </Animated.View>

      {/* Aksiyon Butonları */}
      <Animated.View style={[styles.actionButtons, buttonStyle]}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={handleStartChat}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.buttonGradient}
          >
            <Ionicons name="chatbubble-ellipses" size={24} color="white" />
            <Text style={styles.buttonText}>Sohbete Başla</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleClose}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Keşfetmeye Devam Et</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Kapat butonu */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleClose}
        activeOpacity={0.8}
      >
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 1000,
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  starsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#FFF',
    borderRadius: 1,
  },
  heartsContainer: {
    position: 'absolute',
    top: height * 0.15,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartLeft: {
    position: 'absolute',
    left: width * 0.25,
    top: 10,
  },
  heartRight: {
    position: 'absolute',
    right: width * 0.25,
    top: 10,
  },
  heartCenter: {
    position: 'absolute',
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: height * 0.28,
    paddingHorizontal: 20,
  },
  matchTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
  },
  matchSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  matchDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  profileCard: {
    alignItems: 'center',
    flex: 1,
  },
  leftProfile: {
    alignItems: 'flex-end',
  },
  rightProfile: {
    alignItems: 'flex-start',
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFD700',
    overflow: 'hidden',
    marginBottom: 10,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 35,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  profileZodiac: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  compatibilityCenter: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  compatibilityCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  compatibilityPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  compatibilityLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  zodiacConnection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zodiacEmoji: {
    fontSize: 20,
  },
  connectionLine: {
    width: 30,
    height: 2,
    backgroundColor: '#FFD700',
    marginHorizontal: 5,
  },
  compatibilityDescription: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 15,
    padding: 20,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  chatButton: {
    marginBottom: 15,
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  continueButton: {
    alignItems: 'center',
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 25,
  },
  continueButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AstrologyMatchScreen; 