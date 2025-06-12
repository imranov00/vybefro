import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  PanResponder,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useProfile } from '../context/ProfileContext';
import { PotentialMatch, swipeApi } from '../services/api';
import { calculateCompatibility, getCompatibilityDescription } from '../types/compatibility';
import { getZodiacEmoji } from '../types/zodiac';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.7;

// Burç çarkı sembolleri
const ZODIAC_SYMBOLS = [
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

// SwipeCard Props Interface
interface SwipeCardProps {
  user: PotentialMatch;
  onSwipe: (direction: 'left' | 'right' | 'up', userId: number) => void;
  style: any;
  isTop: boolean;
  photoIndex: number;
  setPhotoIndex: (index: number) => void;
}

// Swipe Card Component
const SwipeCard: React.FC<SwipeCardProps> = ({ user, onSwipe, style, isTop, photoIndex, setPhotoIndex }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset({
        x: (pan.x as any)._value,
        y: (pan.y as any)._value,
      });
    },
    onPanResponderMove: (_, gestureState) => {
      if (!isTop) return;
      
      pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      
      // Rotation based on horizontal movement
      const rotateValue = gestureState.dx / width * 0.4;
      rotate.setValue(rotateValue);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (!isTop) return;
      
      pan.flattenOffset();
      
      const threshold = width * 0.3;
      const velocity = Math.abs(gestureState.vx);
      
      if (gestureState.dx > threshold || (gestureState.dx > 50 && velocity > 0.5)) {
        // Swipe Right - Like
        animateCardOut('right');
        setTimeout(() => onSwipe('right', user.id), 200);
      } else if (gestureState.dx < -threshold || (gestureState.dx < -50 && velocity > 0.5)) {
        // Swipe Left - Dislike
        animateCardOut('left');
        setTimeout(() => onSwipe('left', user.id), 200);
      } else if (gestureState.dy < -threshold || (gestureState.dy < -50 && velocity > 0.5)) {
        // Swipe Up - Super Like
        animateCardOut('up');
        setTimeout(() => onSwipe('up', user.id), 200);
      } else {
        // Return to center
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }),
          Animated.spring(rotate, {
            toValue: 0,
            useNativeDriver: false,
          }),
        ]).start();
      }
    },
  });

  const animateCardOut = (direction: 'left' | 'right' | 'up') => {
    const toValue = direction === 'right' ? { x: width * 1.5, y: 0 } :
                   direction === 'left' ? { x: -width * 1.5, y: 0 } :
                   { x: 0, y: -height * 1.5 };

    Animated.parallel([
      Animated.timing(pan, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const rotateInterpolate = rotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-30deg', '0deg', '30deg'],
  });

  const animatedStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { rotate: rotateInterpolate },
    ],
    opacity,
  };

  const likeOpacity = pan.x.interpolate({
    inputRange: [0, width * 0.3],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const dislikeOpacity = pan.x.interpolate({
    inputRange: [-width * 0.3, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const superLikeOpacity = pan.y.interpolate({
    inputRange: [-height * 0.2, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const handlePhotoTap = (side: 'left' | 'right') => {
    if (side === 'left' && photoIndex > 0) {
      setPhotoIndex(photoIndex - 1);
    } else if (side === 'right' && photoIndex < user.photos.length - 1) {
      setPhotoIndex(photoIndex + 1);
    }
  };

  return (
    <Animated.View
      style={[styles.card, style, animatedStyle]}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      {/* Photo */}
      <View style={styles.photoContainer}>
        <Image
          source={{ uri: user.photos[photoIndex] || user.profileImageUrl || 'https://picsum.photos/400/600' }}
          style={styles.photo}
        />
        
        {/* Photo Navigation */}
        <View style={styles.photoNavigation}>
          <TouchableOpacity
            style={styles.photoNavLeft}
            onPress={() => handlePhotoTap('left')}
            activeOpacity={1}
          />
          <TouchableOpacity
            style={styles.photoNavRight}
            onPress={() => handlePhotoTap('right')}
            activeOpacity={1}
          />
        </View>

        {/* Photo Indicators */}
        {user.photos.length > 1 && (
          <View style={styles.photoIndicators}>
            {user.photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.photoIndicator,
                  index === photoIndex && styles.photoIndicatorActive
                ]}
              />
            ))}
          </View>
        )}

        {/* Swipe Overlays */}
        <Animated.View style={[styles.overlay, styles.likeOverlay, { opacity: likeOpacity }]}>
          <Text style={styles.overlayText}>BEĞENDİM</Text>
        </Animated.View>

        <Animated.View style={[styles.overlay, styles.dislikeOverlay, { opacity: dislikeOpacity }]}>
          <Text style={styles.overlayText}>HAYIR</Text>
        </Animated.View>

        <Animated.View style={[styles.overlay, styles.superLikeOverlay, { opacity: superLikeOpacity }]}>
          <Text style={styles.overlayText}>SÜPER BEĞENİ</Text>
        </Animated.View>

        {/* Online Status */}
        {user.isOnline && (
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Çevrimiçi</Text>
          </View>
        )}
      </View>

      {/* User Info */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.infoGradient}
      >
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}, {user.age}
            </Text>
            <View style={styles.zodiacBadge}>
              <Text style={styles.zodiacEmoji}>{getZodiacEmoji(user.zodiacSign)}</Text>
            </View>
          </View>

          <View style={styles.compatibilityRow}>
            <View style={styles.compatibilityBadge}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.compatibilityText}>%{user.compatibilityScore} Uyumlu</Text>
            </View>
            {user.distance && (
              <View style={styles.distanceBadge}>
                <Ionicons name="location" size={14} color="#FF6B6B" />
                <Text style={styles.distanceText}>{user.distance} km</Text>
              </View>
            )}
          </View>

          {user.bio && (
            <Text style={styles.userBio} numberOfLines={2}>
              {user.bio}
            </Text>
          )}

          {user.compatibilityDescription && (
            <View style={styles.compatibilityDesc}>
              <Text style={styles.compatibilityDescText}>
                {user.compatibilityDescription}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default function AstrologyScreen() {
  const { userProfile } = useProfile();
  const router = useRouter();
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [photoIndexes, setPhotoIndexes] = useState<Record<number, number>>({});

  // Burç çarkı animasyonu
  const zodiacRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotateAnimation = Animated.loop(
      Animated.timing(zodiacRotation, {
        toValue: 1,
        duration: 120000, // 2 dakika
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();
    return () => rotateAnimation.stop();
  }, []);

  useEffect(() => {
    loadPotentialMatches();
  }, []);

  const loadPotentialMatches = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Potansiyel eşleşmeler yükleniyor...');
      
      let response = null;
      
      // API endpoint'lerini dene
      try {
        response = await swipeApi.getPotentialMatches(1, 20);
        console.log('✅ Ana endpoint başarılı:', response);
      } catch (error) {
        console.log('❌ Ana endpoint başarısız, alternatif deneniyor...');
        try {
          response = await swipeApi.getAllUsers(1, 20);
          console.log('✅ Alternatif endpoint başarılı:', response);
        } catch (altError) {
          console.log('❌ Alternatif endpoint de başarısız, mock data kullanılıyor...');
          generateMockData();
          return;
        }
      }

      if (response?.users && response.users.length > 0) {
        const processedUsers = response.users.map((user: any) => ({
          ...user,
          age: typeof user.age === 'number' ? user.age : 
               user.birthDate ? new Date().getFullYear() - new Date(user.birthDate).getFullYear() : 25,
          photos: user.photos?.length > 0 ? user.photos : 
                  user.profileImageUrl ? [user.profileImageUrl] : ['https://picsum.photos/400/600'],
          compatibilityScore: user.compatibilityScore || 
                             calculateCompatibility(userProfile.zodiacSign as any, user.zodiacSign as any),
          compatibilityDescription: user.compatibilityMessage || 
                                   getCompatibilityDescription(
                                     userProfile.zodiacSign as any,
                                     user.zodiacSign as any,
                                     user.compatibilityScore || 50
                                   ),
          zodiacSign: user.zodiacSign || 'ARIES',
          distance: user.distance || Math.floor(Math.random() * 20) + 1,
          isOnline: user.isOnline ?? Math.random() > 0.5
        }));

        setPotentialMatches(processedUsers);
        
        // Photo index'lerini initialize et
        const indexes: Record<number, number> = {};
        processedUsers.forEach(user => {
          indexes[user.id] = 0;
        });
        setPhotoIndexes(indexes);
        
        console.log('✅ Kullanıcılar işlendi:', processedUsers.length);
      } else {
        generateMockData();
      }
    } catch (error) {
      console.error('❌ Potansiyel eşleşme yükleme hatası:', error);
      generateMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = () => {
    const mockZodiacSigns = ['ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO', 'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES'];
    const userZodiac = userProfile.zodiacSign || 'ARIES';
    
    const mockUsers: PotentialMatch[] = Array.from({ length: 15 }, (_, index) => {
      const randomZodiac = mockZodiacSigns[Math.floor(Math.random() * mockZodiacSigns.length)];
      const compatibility = calculateCompatibility(userZodiac as any, randomZodiac as any);
      const photoCount = Math.floor(Math.random() * 4) + 1;
      const photos = Array.from({ length: photoCount }, (_, photoIndex) => 
        `https://picsum.photos/400/600?random=${index * 10 + photoIndex}`
      );
      
      return {
        id: index + 1,
        username: `user_${index + 1}`,
        firstName: ['Ayşe', 'Fatma', 'Zeynep', 'Mehmet', 'Ali', 'Ahmet', 'Elif', 'Deniz', 'Selin', 'Burak', 'Cem', 'Duygu', 'Ece', 'Furkan', 'Gizem'][index],
        lastName: ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Özkan', 'Arslan', 'Doğan', 'Aydın', 'Koç', 'Güneş', 'Ay', 'Yıldız', 'Bulut', 'Deniz'][index],
        age: Math.floor(Math.random() * 15) + 20,
        profileImageUrl: photos[0],
        photos: photos,
        bio: [
          'Hayatı dolu dolu yaşamayı seven biriyim 🌟',
          'Doğa sevgisi ve kitap okuma tutkum var 📚',
          'Müzik ve sanat dünyasında kaybolmayı seviyorum 🎵',
          'Yeni yerler keşfetmek ve macera aramak benim işim ✈️',
          'Spor yapmayı ve sağlıklı yaşamayı seviyorum 💪',
          'Kahve tutkunu, film sevdalısı ☕',
          'Yoga ve meditasyon ile iç huzuru arıyorum 🧘‍♀️',
          'Fotoğrafçılık hobim, anları ölümsüzleştiriyorum 📸'
        ][index % 8],
        zodiacSign: randomZodiac,
        compatibilityScore: compatibility,
        compatibilityDescription: getCompatibilityDescription(userZodiac as any, randomZodiac as any, compatibility),
        distance: Math.floor(Math.random() * 20) + 1,
        isOnline: Math.random() > 0.5
      };
    });
    
    setPotentialMatches(mockUsers);
    
    // Photo index'lerini initialize et
    const indexes: Record<number, number> = {};
    mockUsers.forEach(user => {
      indexes[user.id] = 0;
    });
    setPhotoIndexes(indexes);
    
    console.log('✅ Mock data yüklendi:', mockUsers.length);
  };

  const handleSwipe = async (direction: 'left' | 'right' | 'up', userId: number) => {
    console.log(`🎯 SWIPE: ${direction} kullanıcı ${userId}`);
    
    try {
      const swipeAction = direction === 'right' ? 'LIKE' : 
                         direction === 'up' ? 'SUPER_LIKE' : 'DISLIKE';
      
      const response = await swipeApi.swipe({
        targetUserId: userId,
        action: swipeAction
      });

      console.log('📥 Swipe yanıtı:', response);

      if (response.isMatch) {
        const matchedUser = potentialMatches.find(u => u.id === userId);
        if (matchedUser) {
          Alert.alert(
            '🎉 Eşleştiniz!',
            `${matchedUser.firstName} ile eşleştiniz! %${matchedUser.compatibilityScore} uyumluluğunuz var.`,
            [{ text: 'Harika!', style: 'default' }]
          );
        }
      }
    } catch (error) {
      console.error('❌ Swipe hatası:', error);
    }
    
    // Sonraki karta geç
    setCurrentIndex(prev => prev + 1);
    
    // Daha fazla kart yükle
    if (currentIndex >= potentialMatches.length - 3) {
      loadMoreCards();
    }
  };

  const loadMoreCards = async () => {
    // Daha fazla kart yükleme mantığı
    console.log('🔄 Daha fazla kart yükleniyor...');
  };

  const handleActionButton = (action: 'dislike' | 'superlike' | 'like') => {
    if (currentIndex >= potentialMatches.length) return;
    
    const currentUser = potentialMatches[currentIndex];
    const direction = action === 'like' ? 'right' : action === 'superlike' ? 'up' : 'left';
    handleSwipe(direction, currentUser.id);
  };

  const setPhotoIndex = (userId: number, index: number) => {
    setPhotoIndexes(prev => ({
      ...prev,
      [userId]: index
    }));
  };

  const zodiacRotateInterpolate = zodiacRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8000FF" />
          <Text style={styles.loadingText}>Yıldızlar hizalanıyor...</Text>
        </View>
      </View>
    );
  }

  const cardsToShow = potentialMatches.slice(currentIndex, currentIndex + 3);

  if (cardsToShow.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.background} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>✨</Text>
          <Text style={styles.emptyTitle}>Yeni Eşleşmeler Bekleniyor</Text>
          <Text style={styles.emptySubtitle}>
            Yakında size uygun yeni profiller ekleyeceğiz
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadPotentialMatches}>
            <Text style={styles.refreshButtonText}>Yenile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Arka plan gradyan */}
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.background} />

      {/* Burç çarkı arka plan */}
      <Animated.View 
        style={[
          styles.zodiacWheel, 
          { transform: [{ rotate: zodiacRotateInterpolate }] }
        ]}
      >
        {ZODIAC_SYMBOLS.map((item, index) => (
          <View 
            key={index}
            style={[
              styles.zodiacSymbol,
              {
                transform: [
                  { rotate: `${item.angle}deg` },
                  { translateY: -width * 0.35 },
                  { rotate: `-${item.angle}deg` }
                ]
              }
            ]}
          >
            <Text style={styles.zodiacText}>{item.symbol}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Burç Eşleşmeleri</Text>
        <Text style={styles.subtitle}>Yıldızların rehberliğinde aşkı keşfet</Text>
      </View>

      {/* Cards Container */}
      <View style={styles.cardsContainer}>
        {cardsToShow.map((user, index) => (
          <SwipeCard
            key={user.id}
            user={user}
            onSwipe={handleSwipe}
            style={{
              zIndex: cardsToShow.length - index,
              transform: [
                { scale: 1 - index * 0.02 },
                { translateY: index * -10 }
              ]
            }}
            isTop={index === 0}
            photoIndex={photoIndexes[user.id] || 0}
            setPhotoIndex={(newIndex: number) => setPhotoIndex(user.id, newIndex)}
          />
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.dislikeButton]}
          onPress={() => handleActionButton('dislike')}
        >
          <Ionicons name="close" size={28} color="#FF5722" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={() => handleActionButton('superlike')}
        >
          <Ionicons name="star" size={24} color="#FFD700" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleActionButton('like')}
        >
          <Ionicons name="heart" size={28} color="#4CAF50" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  zodiacWheel: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    left: width * 0.1,
    top: height * 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.1,
  },
  zodiacSymbol: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zodiacText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  refreshButton: {
    backgroundColor: 'rgba(128, 0, 255, 0.3)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },
  photoContainer: {
    flex: 1,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoNavigation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  photoNavLeft: {
    flex: 1,
  },
  photoNavRight: {
    flex: 1,
  },
  photoIndicators: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  photoIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 2,
  },
  photoIndicatorActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeOverlay: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  dislikeOverlay: {
    backgroundColor: 'rgba(255, 87, 34, 0.8)',
  },
  superLikeOverlay: {
    backgroundColor: 'rgba(255, 215, 0, 0.8)',
  },
  overlayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  onlineIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 4,
  },
  onlineText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  infoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    justifyContent: 'flex-end',
  },
  userInfo: {
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  zodiacBadge: {
    backgroundColor: 'rgba(128, 0, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  zodiacEmoji: {
    fontSize: 20,
  },
  compatibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  compatibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  compatibilityText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 4,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: 4,
  },
  userBio: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    marginBottom: 8,
  },
  compatibilityDesc: {
    backgroundColor: 'rgba(128, 0, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  compatibilityDescText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionButtons: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  dislikeButton: {
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    borderWidth: 2,
    borderColor: '#FF5722',
  },
  superLikeButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 2,
    borderColor: '#FFD700',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  likeButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
}); 