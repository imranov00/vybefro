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
  ScrollView,
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
import { getToken } from '../utils/tokenStorage';

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
      console.log('🔄 Gerçek kullanıcılar yükleniyor...');
      
      // Token kontrolü
      const token = await getToken();
      console.log('🔑 Token durumu:', token ? 'Mevcut' : 'Yok', token ? `(${token.substring(0, 20)}...)` : '');
      
      if (!token) {
        console.log('❌ Token bulunamadı, kullanıcı giriş yapmamış');
        Alert.alert(
          'Oturum Hatası',
          'Lütfen önce giriş yapın.',
          [{ text: 'Tamam', style: 'default' }]
        );
        return;
      }
      
      let response = null;
      let apiSuccess = false;
      let lastError = null;
      
      // 1. Ana endpoint'i dene - Potansiyel eşleşmeler
      try {
        console.log('🔄 Ana endpoint deneniyor: /api/swipes/potential-matches');
        response = await swipeApi.getPotentialMatches(1, 20);
        console.log('✅ Ana endpoint başarılı:', {
          userCount: response?.users?.length || 0,
          totalCount: response?.totalCount,
          hasMore: response?.hasMore,
          firstUser: response?.users?.[0] ? {
            id: response.users[0].id,
            firstName: response.users[0].firstName,
            age: response.users[0].age
          } : 'Yok'
        });
        apiSuccess = true;
      } catch (error: any) {
        lastError = error;
        console.log('❌ Ana endpoint başarısız:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url
        });
      }
      
      // 2. Alternatif endpoint - Tüm kullanıcılar
      if (!apiSuccess) {
        try {
          console.log('🔄 Alternatif endpoint deneniyor: /api/users');
          response = await swipeApi.getAllUsers(1, 20);
          console.log('✅ Alternatif endpoint başarılı:', {
            userCount: response?.users?.length || 0,
            totalCount: response?.totalCount,
            hasMore: response?.hasMore
          });
          apiSuccess = true;
        } catch (error: any) {
          lastError = error;
          console.log('❌ Alternatif endpoint başarısız:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message
          });
        }
      }
      
      // 3. Son çare - Discover endpoint
      if (!apiSuccess) {
        try {
          console.log('🔄 Discover endpoint deneniyor: /api/discover');
          response = await swipeApi.getDiscoverUsers(1, 20);
          console.log('✅ Discover endpoint başarılı:', {
            userCount: response?.users?.length || 0,
            totalCount: response?.totalCount,
            hasMore: response?.hasMore
          });
          apiSuccess = true;
        } catch (error: any) {
          lastError = error;
          console.log('❌ Discover endpoint de başarısız:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message
          });
        }
      }

      if (apiSuccess && response?.users && response.users.length > 0) {
        console.log('📊 Ham API yanıtı (ilk kullanıcı):', {
          id: response.users[0].id,
          firstName: response.users[0].firstName,
          lastName: response.users[0].lastName,
          age: response.users[0].age,
          profileImageUrl: response.users[0].profileImageUrl,
          photos: response.users[0].photos,
          zodiacSign: response.users[0].zodiacSign,
          bio: response.users[0].bio
        });
        
        const processedUsers = response.users.map((user: any) => {
          // Yaş hesaplama
          let calculatedAge = user.age;
          if (typeof user.age !== 'number' && user.birthDate) {
            const birthYear = new Date(user.birthDate).getFullYear();
            calculatedAge = new Date().getFullYear() - birthYear;
          }
          if (!calculatedAge || calculatedAge < 18) {
            calculatedAge = 25; // Varsayılan yaş
          }

          // Fotoğraf dizisi oluşturma
          let photos = [];
          if (user.photos && Array.isArray(user.photos) && user.photos.length > 0) {
            photos = user.photos;
          } else if (user.profileImageUrl) {
            photos = [user.profileImageUrl];
          } else {
            photos = ['https://picsum.photos/400/600?random=' + user.id];
          }

          // Uyumluluk skoru hesaplama
          let compatibilityScore = user.compatibilityScore;
          if (!compatibilityScore || isNaN(compatibilityScore)) {
            compatibilityScore = calculateCompatibility(
              userProfile.zodiacSign as any,
              (user.zodiacSign || 'ARIES') as any
            );
          }

          // Uyumluluk açıklaması
          let compatibilityDescription = user.compatibilityDescription || user.compatibilityMessage;
          if (!compatibilityDescription) {
            compatibilityDescription = getCompatibilityDescription(
              userProfile.zodiacSign as any,
              (user.zodiacSign || 'ARIES') as any,
              compatibilityScore
            );
          }

          const processedUser = {
            id: user.id,
            username: user.username || `user_${user.id}`,
            firstName: user.firstName || 'İsimsiz',
            lastName: user.lastName || 'Kullanıcı',
            age: calculatedAge,
            profileImageUrl: user.profileImageUrl,
            photos: photos,
            bio: user.bio || null,
            zodiacSign: user.zodiacSign || 'ARIES',
            compatibilityScore: compatibilityScore,
            compatibilityDescription: compatibilityDescription,
            distance: user.distance || Math.floor(Math.random() * 20) + 1,
            isOnline: user.isOnline ?? Math.random() > 0.5,
            lastSeen: user.lastSeen
          };

          console.log('✅ İşlenmiş kullanıcı:', {
            id: processedUser.id,
            firstName: processedUser.firstName,
            age: processedUser.age,
            photosCount: processedUser.photos.length,
            compatibilityScore: processedUser.compatibilityScore
          });

          return processedUser;
        });

        setPotentialMatches(processedUsers);
        
        // Photo index'lerini initialize et
        const indexes: Record<number, number> = {};
        processedUsers.forEach(user => {
          indexes[user.id] = 0;
        });
        setPhotoIndexes(indexes);
        
        console.log('✅ Toplam kullanıcı yüklendi:', processedUsers.length);
      } else {
        console.log('⚠️ Hiç kullanıcı bulunamadı veya tüm APIler başarısız');
        console.log('🔍 Son hata detayı:', {
          status: lastError?.response?.status,
          statusText: lastError?.response?.statusText,
          message: lastError?.response?.data?.message || lastError?.message,
          url: lastError?.config?.url,
          headers: lastError?.config?.headers
        });
        
        setPotentialMatches([]);
        
        // Hata türüne göre farklı mesajlar
        if (lastError?.response?.status === 401) {
          Alert.alert(
            'Oturum Süresi Doldu',
            'Lütfen tekrar giriş yapın.',
            [{ text: 'Tamam', style: 'default' }]
          );
        } else if (lastError?.response?.status === 404) {
          Alert.alert(
            'Endpoint Bulunamadı',
            'API endpoint\'i mevcut değil. Backend kontrolü gerekli.',
            [{ text: 'Tamam', style: 'default' }]
          );
        } else if (lastError?.code === 'NETWORK_ERROR' || lastError?.message?.includes('Network')) {
          Alert.alert(
            'Bağlantı Hatası',
            'İnternet bağlantınızı kontrol edin veya sunucu çalışmıyor olabilir.',
            [{ text: 'Tamam', style: 'default' }]
          );
        } else {
          Alert.alert(
            'Kullanıcı Bulunamadı',
            'Şu anda gösterilecek kullanıcı bulunmuyor. Lütfen daha sonra tekrar deneyin.',
            [{ text: 'Tamam', style: 'default' }]
          );
        }
      }
    } catch (error: any) {
      console.error('❌ Kullanıcı yükleme genel hatası:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 200)
      });
      setPotentialMatches([]);
      Alert.alert(
        'Beklenmeyen Hata',
        'Bir hata oluştu. Lütfen uygulamayı yeniden başlatın.',
        [{ text: 'Tamam', style: 'default' }]
      );
    } finally {
      setIsLoading(false);
    }
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

      {/* Header - Fixed */}
      <View style={styles.header}>
        <Text style={styles.title}>Burç Eşleşmeleri</Text>
        <Text style={styles.subtitle}>Yıldızların rehberliğinde aşkı keşfet</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
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

        {/* Extra content space for scrolling */}
        <View style={styles.extraContent}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>✨ Bugünün Burç Yorumu</Text>
            <Text style={styles.infoText}>
              Yeni tanışacağınız kişilerle güçlü bir bağ kurabilirsiniz. 
              Astrolojik enerjiler bugün aşk konusunda size yardımcı olacak.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🔮 Uyumluluk İpuçları</Text>
            <Text style={styles.infoText}>
              Burç uyumluluğu sadece güneş burcuna bağlı değildir. 
              Yükselen burç ve ay burcunuz da önemli rol oynar.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💫 Swipe İpuçları</Text>
            <Text style={styles.infoText}>
              • Sağa kaydır: Beğen{'\n'}
              • Sola kaydır: Geç{'\n'}
              • Yukarı kaydır: Süper beğeni{'\n'}
              • Fotoğrafları görmek için dokun
            </Text>
          </View>
        </View>

        {/* Bottom spacing for footer */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Action Buttons - Fixed Footer */}
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100, // Footer için alan
  },
  cardsContainer: {
    height: CARD_HEIGHT + 50, // Kartlar için sabit yükseklik
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
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
    bottom: Platform.OS === 'ios' ? 90 : 70, // Tab bar'ın üstünde kalması için artırıldı
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Hafif arka plan ekledim
    paddingVertical: 15,
    zIndex: 1000, // En üstte kalması için
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
  extraContent: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
  },
  bottomSpacing: {
    height: 80,
  },
}); 