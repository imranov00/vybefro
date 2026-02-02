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

const { width, height } = Dimensions.get('window');

interface MusicMatchScreenProps {
  currentUser: {
    id: number;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    favoriteGenre?: string;
    favoriteArtist?: string;
  };
  matchedUser: {
    id: number;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    favoriteGenre?: string;
    favoriteArtist?: string;
  };
  onClose: () => void;
  onStartChat: () => void;
}

const MusicMatchScreen: React.FC<MusicMatchScreenProps> = ({ 
  currentUser, 
  matchedUser, 
  onClose, 
  onStartChat 
}) => {
  const router = useRouter();
  const [isClosing, setIsClosing] = React.useState(false);
  
  // Animation values
  const backgroundOpacity = useSharedValue(0);
  const musicNotesScale = useSharedValue(0);
  const heartsScale = useSharedValue(0);
  const profileCardsY = useSharedValue(height);
  const musicCompatibilityScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const buttonY = useSharedValue(100);

  // Müzik uyumluluğu için rastgele skor (gerçek uygulamada API'den gelecek)
  const musicCompatibilityScore = Math.floor(Math.random() * 30) + 70; // 70-100 arası

  // Ortak müzik türü
  const commonGenre = currentUser.favoriteGenre || matchedUser.favoriteGenre || 'Müzik';

  useEffect(() => {
    // Animasyon sırası
    backgroundOpacity.value = withTiming(1, { duration: 500 });
    
    // Müzik notaları ve kalpler
    setTimeout(() => {
      musicNotesScale.value = withSpring(1, { damping: 15 });
      heartsScale.value = withSequence(
        withSpring(1.3, { damping: 8 }),
        withSpring(1, { damping: 12 })
      );
    }, 300);

    // Profil kartları
    setTimeout(() => {
      profileCardsY.value = withSpring(0, { damping: 15 });
    }, 600);

    // Müzik uyumluluğu ve text
    setTimeout(() => {
      musicCompatibilityScale.value = withSpring(1, { damping: 12 });
      textOpacity.value = withTiming(1, { duration: 800 });
    }, 1000);

    // Buton
    setTimeout(() => {
      buttonY.value = withSpring(0, { damping: 15 });
    }, 1400);
    
    // Cleanup function
    return () => {
      console.log('🧹 [MUSIC_MATCH] Component unmounting, cleanup...');
      // Animasyonları durdur
      backgroundOpacity.value = 0;
      textOpacity.value = 0;
      profileCardsY.value = height;
      heartsScale.value = 1;
      musicNotesScale.value = 0;
      musicCompatibilityScale.value = 0;
      buttonY.value = 100;
    };
  }, []);

  const handleClose = () => {
    if (isClosing) return; // Çift tıklama koruması
    
    console.log('🔴 [MUSIC_MATCH] Kapanma işlemi başlatılıyor');
    setIsClosing(true);
    
    // Kapanma animasyonu
    backgroundOpacity.value = withTiming(0, { duration: 300 });
    textOpacity.value = withTiming(0, { duration: 200 });
    profileCardsY.value = withTiming(height, { duration: 300 });
    
    // Animasyon tamamlandıktan sonra kapat
    setTimeout(() => {
      try {
        console.log('🔴 [MUSIC_MATCH] onClose çağrılıyor...');
        onClose();
        console.log('✅ [MUSIC_MATCH] Kapanma tamamlandı');
      } catch (error) {
        console.error('❌ [MUSIC_MATCH] Kapanma hatası:', error);
        // Hata durumunda state'i sıfırla
        setIsClosing(false);
      }
    }, 350); // Animasyon süresinden biraz daha uzun
  };

  const handleStartChat = () => {
    if (isClosing) return; // Çift tıklama koruması
    
    console.log('💬 [MUSIC_MATCH] Sohbet başlatılıyor');
    setIsClosing(true);
    
    // Kapanma animasyonu
    backgroundOpacity.value = withTiming(0, { duration: 300 });
    textOpacity.value = withTiming(0, { duration: 200 });
    
    // Animasyon tamamlandıktan sonra sohbet başlat
    setTimeout(() => {
      try {
        console.log('🔴 [MUSIC_MATCH] onStartChat çağrılıyor...');
        onStartChat();
        console.log('✅ [MUSIC_MATCH] Sohbet başlatıldı');
      } catch (error) {
        console.error('❌ [MUSIC_MATCH] Sohbet başlatma hatası:', error);
        // Hata durumunda state'i sıfırla
        setIsClosing(false);
      }
    }, 350); // Animasyon süresinden biraz daha uzun
  };

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const musicNotesStyle = useAnimatedStyle(() => ({
    transform: [{ scale: musicNotesScale.value }],
  }));

  const heartsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartsScale.value }],
  }));

  const profileCardsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: profileCardsY.value }],
  }));

  const musicCompatibilityStyle = useAnimatedStyle(() => ({
    transform: [{ scale: musicCompatibilityScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonY.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background */}
      <Animated.View style={[styles.background, backgroundStyle]}>
        <LinearGradient
          colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Müzik notası efektleri */}
      <Animated.View style={[styles.musicNotesContainer, musicNotesStyle]}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.musicNote,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7 + 0.3,
              },
            ]}
          >
            <Ionicons 
              name={i % 2 === 0 ? 'musical-note' : 'musical-notes'} 
              size={16 + Math.random() * 10} 
              color="#FFFFFF" 
            />
          </View>
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
        <Text style={styles.matchTitle}>🎵 MÜZİK RUHLARINIZ BULUŞTU! 🎵</Text>
        <Text style={styles.matchSubtitle}>
          {currentUser.firstName} ve {matchedUser.firstName}
        </Text>
        <Text style={styles.matchDescription}>
          Aynı ritimde kalp atışlarınız var...
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
                <Ionicons name="person" size={35} color="#FFFFFF" />
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser.firstName}</Text>
            <Text style={styles.profileMusic}>
              {currentUser.favoriteGenre || '🎵 Müzik'}
            </Text>
          </View>
        </View>

        {/* Ortadaki müzik uyumluluğu */}
        <Animated.View style={[styles.compatibilityCenter, musicCompatibilityStyle]}>
          <View style={styles.compatibilityCircle}>
            <Text style={styles.compatibilityPercentage}>
              %{musicCompatibilityScore}
            </Text>
            <Text style={styles.compatibilityLabel}>Uyumlu</Text>
          </View>
          <View style={styles.musicConnection}>
            <Ionicons name="musical-note" size={24} color="#FFD700" />
            <View style={styles.connectionLine} />
            <Ionicons name="musical-note" size={24} color="#FFD700" />
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
                <Ionicons name="person" size={35} color="#FFFFFF" />
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{matchedUser.firstName}</Text>
            <Text style={styles.profileMusic}>
              {matchedUser.favoriteGenre || '🎵 Müzik'}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Müzik Uyumluluğu Açıklaması */}
      <Animated.View style={[styles.compatibilityDescription, textStyle]}>
        <Text style={styles.descriptionTitle}>🎶 Müzik Uyumunuz</Text>
        <Text style={styles.descriptionText}>
          İkinizin de {commonGenre} müzik zevki var! Bu harika bir başlangıç. 
          Aynı ritimde kalp atışlarınız, birlikte güzel anlar yaşayabileceğinizin işareti.
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
            colors={['#FF6B6B', '#4ECDC4']}
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
  musicNotesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  musicNote: {
    position: 'absolute',
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
    color: '#FFFFFF',
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
    borderColor: '#FFFFFF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  profileMusic: {
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  compatibilityPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  compatibilityLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  musicConnection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionLine: {
    width: 30,
    height: 2,
    backgroundColor: '#FFFFFF',
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
    color: '#FFFFFF',
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

export default MusicMatchScreen; 