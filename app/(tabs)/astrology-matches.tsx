import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { swipeApi } from '../services/api';
import { ZodiacSign, getZodiacInfo } from '../types/zodiac';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.7;

// Swipe API Types
interface SwipeUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  age: number;
  gender: string;
  bio: string;
  zodiacSign: ZodiacSign;
  zodiacSignDisplay: string;
  compatibilityScore: number;
  compatibilityMessage: string;
  profileImageUrl: string;
  photos: Array<{
    id: number;
    photoUrl: string;
    isProfilePhoto: boolean;
    displayOrder: number;
  }>;
  photoCount: number;
  isPremium: boolean;
  lastActiveTime: string;
  activityStatus: string;
  location: string;
  distanceKm: number;
  isVerified: boolean;
  hasInstagram: boolean;
  hasSpotify: boolean;
  isNewUser: boolean;
  hasLikedCurrentUser?: boolean;
  profileCompleteness: string;
}

interface SwipeLimitInfo {
  isPremium: boolean;
  remainingSwipes: number;
  totalSwipes: number;
  nextResetTime: string | null;
}

interface SwipeResponse {
  success: boolean;
  isMatch: boolean;
  matchId?: number;
  message: string;
}

export default function AstrologyMatchesScreen() {
  const colorScheme = useColorScheme();
  const { isPremium } = useAuth();
  
  // State
  const [users, setUsers] = useState<SwipeUser[]>([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [swipeLimitInfo, setSwipeLimitInfo] = useState<SwipeLimitInfo | null>(null);
  const [isSwipeInProgress, setIsSwipeInProgress] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const likeOpacity = useSharedValue(0);
  const dislikeOpacity = useSharedValue(0);

  // Astroloji tema renkleri
  const astrologyTheme = {
    primary: '#8000FF',
    secondary: '#5B00B5',
    accent: '#FFD700',
    gradient: ['#8000FF', '#5B00B5', '#3D007A'],
    cardBg: 'rgba(128, 0, 255, 0.1)',
    likeColor: '#00FF7F',
    dislikeColor: '#FF4757',
    matchColor: '#FFD700',
  };

  // Kullanıcıları getir
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await swipeApi.getDiscoverUsers(1, 10);
      
      if (response.success) {
        // DiscoverUser'ları SwipeUser formatına dönüştür
        const convertedUsers: SwipeUser[] = response.users.map(user => ({
          id: user.id,
          username: user.firstName.toLowerCase() + user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
          age: user.age,
          gender: 'UNKNOWN',
          bio: user.bio || 'Yıldızların rehberliğinde hayatımı yaşıyorum ✨',
          zodiacSign: user.zodiacSign as ZodiacSign,
          zodiacSignDisplay: user.zodiacSign,
          compatibilityScore: user.compatibilityScore,
          compatibilityMessage: user.compatibilityDescription || 'Yıldızlar sizin için mükemmel bir uyum öngörüyor! 🌟',
          profileImageUrl: user.profileImageUrl || `https://picsum.photos/400/600?random=${user.id}`,
          photos: user.photos?.map(p => ({
            id: Math.random(),
            photoUrl: p.imageUrl || `https://picsum.photos/400/600?random=${user.id}`,
            isProfilePhoto: true,
            displayOrder: 1
          })) || [{
            id: Math.random(),
            photoUrl: `https://picsum.photos/400/600?random=${user.id}`,
            isProfilePhoto: true,
            displayOrder: 1
          }],
          photoCount: Math.max(user.photos?.length || 1, 1),
          isPremium: user.isPremium || false,
          lastActiveTime: new Date().toISOString(),
          activityStatus: user.isOnline ? 'Şimdi aktif' : '2 saat önce',
          location: 'İstanbul, Türkiye',
          distanceKm: user.distance || Math.floor(Math.random() * 20) + 1,
          isVerified: user.isVerified || Math.random() > 0.7,
          hasInstagram: Math.random() > 0.5,
          hasSpotify: Math.random() > 0.6,
          isNewUser: user.isNewUser || false,
          profileCompleteness: '85%'
        }));
        
        setUsers(convertedUsers);
        setSwipeLimitInfo(response.swipeLimitInfo);
      } else {
        Alert.alert('Hata', response.message || 'Kullanıcılar yüklenemedi');
      }
    } catch (error) {
      console.error('Kullanıcılar getirme hatası:', error);
      Alert.alert('Hata', 'Kullanıcılar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Swipe limit bilgisi getir
  const fetchSwipeLimitInfo = async () => {
    try {
      // Bu fonksiyon için ayrı bir API endpoint'i gerekiyor
      // Şimdilik discover'dan alınan bilgiyi kullanacağız
      console.log('Swipe limit bilgisi discover ile alınıyor');
    } catch (error) {
      console.error('Swipe limit bilgisi hatası:', error);
    }
  };

  // Swipe işlemi
  const performSwipe = async (toUserId: number, action: 'LIKE' | 'DISLIKE' | 'SUPER_LIKE') => {
    try {
      setIsSwipeInProgress(true);
      
      const response = await swipeApi.swipe({
        toUserId,
        action: action === 'SUPER_LIKE' ? 'LIKE' : action
      });

      if (response.success) {
        if (response.isMatch) {
          // Eşleşme var!
          showMatchAnimation();
          Alert.alert(
            '🎉 Eşleşme!',
            response.message,
            [{ text: 'Harika!', style: 'default' }]
          );
        }
        
        // Sonraki kullanıcıya geç
        nextUser();
      } else {
        // Limit doldu veya hata
        Alert.alert('Uyarı', response.message);
        if (response.message.includes('limit')) {
          await fetchSwipeLimitInfo();
        }
      }
    } catch (error) {
      console.error('Swipe hatası:', error);
      Alert.alert('Hata', 'Swipe işlemi başarısız oldu');
    } finally {
      setIsSwipeInProgress(false);
    }
  };

  // Sonraki kullanıcıya geç
  const nextUser = () => {
    setCurrentUserIndex(prev => prev + 1);
    setCurrentPhotoIndex(0);
    resetAnimations();
    
    // Son 2 kullanıcı kaldığında yeni kullanıcılar getir
    if (currentUserIndex >= users.length - 2) {
      fetchUsers();
    }
  };

  // Animasyonları sıfırla
  const resetAnimations = () => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    rotate.value = withSpring(0);
    scale.value = withSpring(1);
    likeOpacity.value = withSpring(0);
    dislikeOpacity.value = withSpring(0);
  };

  // Eşleşme animasyonu
  const showMatchAnimation = () => {
    scale.value = withSpring(1.1, { damping: 15 }, () => {
      scale.value = withSpring(1);
    });
  };

  // Gesture handler
  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(0.95);
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      
      // Rotasyon hesapla
      rotate.value = interpolate(
        event.translationX,
        [-width / 2, 0, width / 2],
        [-15, 0, 15]
      );

      // Like/Dislike opacity
      if (event.translationX > 0) {
        likeOpacity.value = interpolate(
          event.translationX,
          [0, width * 0.3],
          [0, 1]
        );
        dislikeOpacity.value = 0;
      } else {
        dislikeOpacity.value = interpolate(
          event.translationX,
          [-width * 0.3, 0],
          [1, 0]
        );
        likeOpacity.value = 0;
      }
    },
    onEnd: (event) => {
      const threshold = width * 0.25;
      
      if (event.translationX > threshold) {
        // LIKE
        translateX.value = withTiming(width * 1.5, { duration: 300 });
        rotate.value = withTiming(30, { duration: 300 });
        runOnJS(performSwipe)(users[currentUserIndex]?.id, 'LIKE');
      } else if (event.translationX < -threshold) {
        // DISLIKE
        translateX.value = withTiming(-width * 1.5, { duration: 300 });
        rotate.value = withTiming(-30, { duration: 300 });
        runOnJS(performSwipe)(users[currentUserIndex]?.id, 'DISLIKE');
      } else {
        // Geri dön
        resetAnimations();
      }
      
      scale.value = withSpring(1);
    },
  });

  // Animated styles
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  const likeStyle = useAnimatedStyle(() => ({
    opacity: likeOpacity.value,
  }));

  const dislikeStyle = useAnimatedStyle(() => ({
    opacity: dislikeOpacity.value,
  }));

  // Component mount
  useEffect(() => {
    fetchUsers();
    fetchSwipeLimitInfo();
  }, []);

  // Mevcut kullanıcı
  const currentUser = users[currentUserIndex];
  const zodiacInfo = currentUser ? getZodiacInfo(currentUser.zodiacSign) : null;

  // Burç uyumluluk rengi
  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return '#00FF7F'; // Yeşil
    if (score >= 60) return '#FFD700'; // Altın
    if (score >= 40) return '#FF8C00'; // Turuncu
    return '#FF4757'; // Kırmızı
  };

  // Loading state
  if (isLoading) {
    return (
      <LinearGradient colors={['#8000FF', '#5B00B5', '#3D007A']} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8000FF" />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🌟 Astroloji Eşleşme</Text>
          <View style={styles.swipeCounter}>
            <Text style={styles.swipeCountText}>--/--</Text>
          </View>
        </View>

        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>🌟</Text>
            <Text style={styles.loadingSubtext}>Yıldızlar senin için uyumlu kişileri arıyor...</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  // Kullanıcı kalmadı
  if (!currentUser) {
    return (
      <View style={styles.emptyContainer}>
        <LinearGradient colors={astrologyTheme.gradient as any} style={styles.background} />
        <Text style={styles.emptyTitle}>🌟 Yıldızlar Tükendi</Text>
        <Text style={styles.emptySubtitle}>
          Şu an için gösterilecek yeni profil yok. Biraz sonra tekrar deneyin!
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchUsers}>
          <Text style={styles.refreshButtonText}>Yenile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Arka plan */}
      <LinearGradient colors={astrologyTheme.gradient as any} style={styles.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✨ Astroloji Eşleşme</Text>
        {swipeLimitInfo && (
          <View style={styles.limitInfo}>
            {swipeLimitInfo.isPremium ? (
              <Text style={styles.limitText}>∞ Sınırsız</Text>
            ) : (
              <Text style={styles.limitText}>
                {swipeLimitInfo.remainingSwipes}/{swipeLimitInfo.totalSwipes}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Kart Stack */}
      <View style={styles.cardStack}>
        {/* Alt kart (sonraki kullanıcı) */}
        {users[currentUserIndex + 1] && (
          <View style={[styles.card, styles.cardBehind]}>
            <Image
              source={{ uri: users[currentUserIndex + 1].profileImageUrl }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Ana kart */}
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.card, cardStyle]}>
            {/* Fotoğraf */}
            <Image
              source={{ 
                uri: currentUser.profileImageUrl || `https://picsum.photos/400/600?random=${currentUser.id}` 
              }}
              style={styles.cardImage}
              resizeMode="cover"
              onError={(error) => {
                console.log('Fotoğraf yükleme hatası:', currentUser.profileImageUrl, error.nativeEvent.error);
                // Fallback image'e geç
                setUsers(prevUsers => 
                  prevUsers.map(user => 
                    user.id === currentUser.id 
                      ? { ...user, profileImageUrl: `https://picsum.photos/400/600?random=${Date.now()}` }
                      : user
                  )
                );
              }}
              onLoad={() => console.log('Fotoğraf başarıyla yüklendi:', currentUser.fullName)}
            />

            {/* Like/Dislike Overlays */}
            <Animated.View style={[styles.likeOverlay, likeStyle]}>
              <Text style={styles.likeText}>BEĞEN</Text>
            </Animated.View>

            <Animated.View style={[styles.dislikeOverlay, dislikeStyle]}>
              <Text style={styles.dislikeText}>GEÇE</Text>
            </Animated.View>

            {/* Kullanıcı Bilgileri */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
              style={styles.cardInfo}
            >
              {/* Burç Uyumluluk Skoru */}
              <View style={styles.compatibilityHeader}>
                <View style={[
                  styles.compatibilityBadge,
                  { backgroundColor: getCompatibilityColor(currentUser.compatibilityScore) }
                ]}>
                  <Text style={styles.compatibilityScore}>
                    %{currentUser.compatibilityScore}
                  </Text>
                  <Text style={styles.compatibilityLabel}>Uyum</Text>
                </View>
                
                {zodiacInfo && (
                  <View style={styles.zodiacInfo}>
                    <Text style={styles.zodiacEmoji}>{zodiacInfo.emoji}</Text>
                    <Text style={styles.zodiacName}>{zodiacInfo.turkishName}</Text>
                  </View>
                )}
              </View>

              {/* Kullanıcı Detayları */}
              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>
                    {currentUser.fullName}, {currentUser.age}
                  </Text>
                  {currentUser.isVerified && (
                    <Ionicons name="checkmark-circle" size={20} color="#00FF7F" />
                  )}
                  {currentUser.isPremium && (
                    <Ionicons name="diamond" size={16} color="#FFD700" />
                  )}
                </View>

                <Text style={styles.location}>
                  📍 {currentUser.location} • {currentUser.distanceKm} km
                </Text>

                <Text style={styles.compatibility}>
                  {currentUser.compatibilityMessage}
                </Text>

                {currentUser.bio && (
                  <Text style={styles.bio} numberOfLines={2}>
                    {currentUser.bio}
                  </Text>
                )}

                <Text style={styles.activityStatus}>
                  🟢 {currentUser.activityStatus}
                </Text>
              </View>
            </LinearGradient>

            {/* Fotoğraf sayısı göstergesi */}
            {currentUser.photoCount > 1 && (
              <View style={styles.photoIndicator}>
                {Array.from({ length: currentUser.photoCount }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.photoDot,
                      index === currentPhotoIndex && styles.photoDotActive
                    ]}
                  />
                ))}
              </View>
            )}
          </Animated.View>
        </PanGestureHandler>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.dislikeButton]}
          onPress={() => performSwipe(currentUser.id, 'DISLIKE')}
          disabled={isSwipeInProgress}
        >
          <Ionicons name="close" size={30} color="#FF4757" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={() => performSwipe(currentUser.id, 'SUPER_LIKE')}
          disabled={isSwipeInProgress}
        >
          <Ionicons name="star" size={25} color="#FFD700" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => performSwipe(currentUser.id, 'LIKE')}
          disabled={isSwipeInProgress}
        >
          <Ionicons name="heart" size={30} color="#00FF7F" />
        </TouchableOpacity>
      </View>

      {/* Swipe Progress */}
      {isSwipeInProgress && (
        <View style={styles.swipeProgress}>
          <ActivityIndicator size="small" color={astrologyTheme.accent} />
          <Text style={styles.swipeProgressText}>İşleniyor...</Text>
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 10,
  },
  loadingSubtext: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  loadingCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  swipeCounter: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  swipeCountText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 30,
  },
  refreshButton: {
    backgroundColor: '#8000FF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  limitInfo: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  limitText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cardStack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  cardBehind: {
    position: 'absolute',
    transform: [{ scale: 0.95 }],
    opacity: 0.5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  likeOverlay: {
    position: 'absolute',
    top: 50,
    left: 30,
    backgroundColor: 'rgba(0,255,127,0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    transform: [{ rotate: '-20deg' }],
  },
  likeText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dislikeOverlay: {
    position: 'absolute',
    top: 50,
    right: 30,
    backgroundColor: 'rgba(255,71,87,0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    transform: [{ rotate: '20deg' }],
  },
  dislikeText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 40,
  },
  compatibilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  compatibilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  compatibilityScore: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  compatibilityLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  zodiacInfo: {
    alignItems: 'center',
  },
  zodiacEmoji: {
    fontSize: 30,
    marginBottom: 4,
  },
  zodiacName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  userInfo: {
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  location: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
  },
  compatibility: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  bio: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 22,
  },
  activityStatus: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  photoIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 4,
  },
  photoDot: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  photoDotActive: {
    backgroundColor: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 20,
    gap: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dislikeButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#FF4757',
  },
  superLikeButton: {
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  likeButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#00FF7F',
  },
  swipeProgress: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  swipeProgressText: {
    color: 'white',
    fontSize: 14,
  },
}); 