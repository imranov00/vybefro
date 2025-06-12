import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
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
import { DiscoverResponse, DiscoverUser, swipeApi } from '../services/api';
import { getZodiacEmoji } from '../types/zodiac';
import { getToken } from '../utils/tokenStorage';

const { width, height } = Dimensions.get('window');

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

// Burç uyumluluk bilgileri
const ASTROLOGY_MATCHES = [
  { sign: 'ARIES', emoji: '♈', name: 'Koç', compatibility: 94, color: '#FF6B6B', description: 'Ateş elementinin güçlü enerjisi' },
  { sign: 'TAURUS', emoji: '♉', name: 'Boğa', compatibility: 89, color: '#4ECDC4', description: 'Toprak elementinin sağlamlığı' },
  { sign: 'GEMINI', emoji: '♊', name: 'İkizler', compatibility: 91, color: '#45B7D1', description: 'Hava elementinin çevikliği' },
  { sign: 'CANCER', emoji: '♋', name: 'Yengeç', compatibility: 86, color: '#96CEB4', description: 'Su elementinin derinliği' },
  { sign: 'LEO', emoji: '♌', name: 'Aslan', compatibility: 92, color: '#FECA57', description: 'Ateş elementinin görkemi' },
  { sign: 'VIRGO', emoji: '♍', name: 'Başak', compatibility: 88, color: '#FF9FF3', description: 'Toprak elementinin mükemmeliyeti' },
  { sign: 'LIBRA', emoji: '♎', name: 'Terazi', compatibility: 85, color: '#54A0FF', description: 'Hava elementinin dengesi' },
  { sign: 'SCORPIO', emoji: '♏', name: 'Akrep', compatibility: 93, color: '#5F27CD', description: 'Su elementinin gizemi' },
];

export default function AstrologyScreen() {
  const colorScheme = useColorScheme();
  const { userProfile } = useProfile();
  const { switchMode } = useAuth();
  const [discoverUsers, setDiscoverUsers] = useState<DiscoverUser[]>([]);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // Animasyon değerleri
  const rotation = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const fadeAnim = useSharedValue(1);
  const starAnim = useSharedValue(0);

  // Dönen burç çarkı animasyonu
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { 
        duration: 120000, // 2 dakika
        easing: Easing.linear 
      }), 
      -1,
      false
    );

    // Yıldız animasyonu
    starAnim.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    loadDiscoverUsers();
  }, []);

  // Burç çarkı animasyonu
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

  const animatedStarStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: 0.8 + (starAnim.value * 0.4) }],
      opacity: 0.3 + (starAnim.value * 0.4),
    };
  });

  const loadDiscoverUsers = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Discover kullanıcıları yükleniyor...');
      
      const token = await getToken();
      if (!token) {
        console.log('❌ Token bulunamadı');
        Alert.alert('Oturum Hatası', 'Lütfen önce giriş yapın.');
        return;
      }  
      
      try {
        // Yeni discover API'sini kullan
        const response: DiscoverResponse = await swipeApi.getDiscoverUsers(1, 6);
        
        if (response.success && response.users && response.users.length > 0) {
          console.log('✅ Discover kullanıcıları yüklendi:', response.users.length);
          setDiscoverUsers(response.users);
        } else {
          console.log('⚠️ Discover API den kullanıcı bulunamadı, fallback API deneniyor...');
          // Fallback: Eski API leri dene
          await loadFallbackUsers();
        }
      } catch (error: any) {
        console.log('❌ Discover API hatası, fallback API deneniyor...');
        await loadFallbackUsers();
      }
    } catch (error: any) {
      console.error('❌ Genel kullanıcı yükleme hatası:', error);
      setDiscoverUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFallbackUsers = async () => {
    try {
      let response = null;
      let apiSuccess = false;
      
      // Fallback API leri dene
      try {
        response = await swipeApi.getPotentialMatches(1, 6);
        apiSuccess = true;
      } catch (error: any) {
        try {
          response = await swipeApi.getAllUsers(1, 6);
          apiSuccess = true;
        } catch (error2: any) {
          console.log('❌ Tüm API ler başarısız');
        }
      }

      if (apiSuccess && response?.users && response.users.length > 0) {
        // PotentialMatch'i DiscoverUser'a dönüştür
        const convertedUsers: DiscoverUser[] = response.users.map((user: any) => ({
          id: user.id,
          username: user.username || `user_${user.id}`,
          firstName: user.firstName || 'İsimsiz',
          lastName: user.lastName || 'Kullanıcı',
          fullName: `${user.firstName || 'İsimsiz'} ${user.lastName || 'Kullanıcı'}`,
          age: user.age || 25,
          gender: user.gender || 'OTHER',
          bio: user.bio || '',
          zodiacSign: user.zodiacSign || 'ARIES',
          zodiacSignDisplay: user.zodiacSign || 'Koç',
          compatibilityScore: user.compatibilityScore || 75,
          compatibilityMessage: user.compatibilityDescription || 'Uyumlu bir eşleşme!',
          profileImageUrl: user.profileImageUrl || 'https://picsum.photos/400/600',
          photos: user.photos?.map((url: string) => ({ 
            id: Math.random(), 
            imageUrl: url, 
            isPrimary: false, 
            uploadDate: new Date().toISOString() 
          })) || [],
          photoCount: user.photos?.length || 0,
          isPremium: false,
          lastActiveTime: new Date().toISOString(),
          activityStatus: user.isOnline ? 'Çevrimiçi' : '2 saat önce',
          location: 'İstanbul',
          activities: [],
          isVerified: false,
          isNewUser: false,
          hasLikedCurrentUser: false,
          profileCompleteness: '85%'
        }));

        setDiscoverUsers(convertedUsers);
        console.log('✅ Fallback kullanıcıları yüklendi:', convertedUsers.length);
      } else {
        console.log('⚠️ Hiç kullanıcı bulunamadı');
        setDiscoverUsers([]);
        Alert.alert('Kullanıcı Bulunamadı', 'Şu anda gösterilecek kullanıcı bulunmuyor.');
      }
    } catch (error) {
      console.error('❌ Fallback yükleme hatası:', error);
      setDiscoverUsers([]);
    }
  };

  const handleCardTap = (user: DiscoverUser) => {
    cardScale.value = withSpring(0.95, { damping: 10 }, () => {
      cardScale.value = withSpring(1);
    });
    
    fadeAnim.value = withTiming(0, { duration: 200 }, () => {
      setCurrentMatch((prev) => (prev + 1) % discoverUsers.length);
      fadeAnim.value = withTiming(1, { duration: 200 });
    });
  };

  const handleAction = async (action: 'like' | 'dislike' | 'superlike', user: DiscoverUser) => {
    try {
      const swipeAction = action === 'like' ? 'LIKE' : 
                         action === 'superlike' ? 'SUPER_LIKE' : 'DISLIKE';
      
      const response = await swipeApi.swipe({
        targetUserId: user.id,
        action: swipeAction
      });

      if (response.isMatch) {
        Alert.alert(
          '🎉 Eşleştiniz!',
          `${user.firstName} ile eşleştiniz! %${user.compatibilityScore} uyumluluğunuz var.`,
          [{ text: 'Harika!', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('❌ Action hatası:', error);
    }
  };

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Arka plan gradyan */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.background}
      />

      {/* Dönen burç çarkı - arka plan */}
      <Animated.View style={[styles.zodiacWheel, animatedWheelStyle]}>
        <View style={styles.innerCircle} />
        <View style={styles.middleCircle} />
        <View style={styles.outerCircle} />
        
        {ZODIAC_SYMBOLS.map((item, index) => (
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

      {/* Yıldız efekti */}
      <Animated.View style={[styles.starEffect, animatedStarStyle]} />
      <Animated.View style={[styles.starEffect2, animatedStarStyle]} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Başlık */}
        <View style={styles.header}>
          <Text style={styles.title}>Burç Uyumluluğu</Text>
          <Text style={styles.subtitle}>Yıldızların Rehberliğinde Aşkı Keşfet</Text>
        </View>

        {/* Swipe Eşleşme Butonu */}
        <TouchableOpacity 
          style={styles.swipeMatchButton} 
          onPress={() => router.push('/astrology-matches' as any)}
        >
          <LinearGradient
            colors={['#8000FF', '#6A00D6', '#4B0082']}
            style={styles.swipeMatchGradient}
          >
            <Ionicons name="heart" size={24} color="white" />
            <Text style={styles.swipeMatchText}>Swipe Eşleşme Yap</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Ana Eşleşme Kartları */}
        {discoverUsers.length > 0 ? (
          <View style={styles.matchesContainer}>
            {discoverUsers.slice(0, 6).map((user, index) => (
              <Animated.View key={user.id} style={[styles.matchCard, animatedCardStyle]}>
                <TouchableOpacity 
                  style={styles.cardContent}
                  onPress={() => handleCardTap(user)}
                  activeOpacity={0.9}
                >
                  <View style={styles.cardHeader}>
                    <Image 
                      source={{ 
                        uri: user.photos.length > 0 
                          ? user.photos[0].imageUrl 
                          : user.profileImageUrl || 'https://picsum.photos/400/600' 
                      }}
                      style={styles.userImage}
                    />
                    <View style={styles.userInfo}>
                      <View style={styles.nameRow}>
                        <Text style={styles.userName}>
                          {user.firstName} {user.lastName}, {user.age}
                        </Text>
                        <Text style={styles.zodiacEmoji}>
                          {getZodiacEmoji(user.zodiacSign)}
                        </Text>
                      </View>
                      
                      <View style={styles.compatibilityContainer}>
                        <View style={styles.compatibilityHeader}>
                          <Ionicons name="star" size={16} color="#FFD700" />
                          <Text style={styles.compatibilityText}>
                            %{user.compatibilityScore} Uyumlu
                          </Text>
                        </View>
                        <View style={styles.compatibilityBar}>
                          <View 
                            style={[
                              styles.compatibilityFill, 
                              { 
                                width: `${user.compatibilityScore}%`,
                                backgroundColor: user.compatibilityScore > 80 ? '#4CAF50' : 
                                                user.compatibilityScore > 60 ? '#FF9800' : '#FF5722'
                              }
                            ]} 
                          />
                        </View>
                      </View>

                      {user.bio && (
                        <Text style={styles.userBio} numberOfLines={2}>
                          {user.bio}
                        </Text>
                      )}

                      <Text style={styles.compatibilityDesc} numberOfLines={2}>
                        {user.compatibilityMessage}
                      </Text>

                      {/* Yeni Status Badge'ler */}
                      <View style={styles.statusRow}>
                        {user.isPremium && (
                          <View style={styles.premiumBadge}>
                            <Ionicons name="star" size={12} color="#FFD700" />
                            <Text style={styles.badgeText}>Premium</Text>
                          </View>
                        )}
                        {user.isVerified && (
                          <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
                            <Text style={styles.badgeText}>Doğrulandı</Text>
                          </View>
                        )}
                        {user.hasLikedCurrentUser && (
                          <View style={styles.likedBadge}>
                            <Ionicons name="heart" size={12} color="#FF6B6B" />
                            <Text style={styles.badgeText}>Sizi beğendi</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.cardActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.dislikeButton]}
                      onPress={() => handleAction('dislike', user)}
                    >
                      <Ionicons name="close" size={20} color="#FF5722" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.superLikeButton]}
                      onPress={() => handleAction('superlike', user)}
                    >
                      <Ionicons name="star" size={18} color="#FFD700" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.likeButton]}
                      onPress={() => handleAction('like', user)}
                    >
                      <Ionicons name="heart" size={20} color="#4CAF50" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>✨</Text>
            <Text style={styles.emptyTitle}>Yeni Eşleşmeler Bekleniyor</Text>
            <Text style={styles.emptySubtitle}>
              Yakında size uygun yeni profiller ekleyeceğiz
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={loadDiscoverUsers}>
              <Text style={styles.refreshButtonText}>Yenile</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bugünün Burç Yorumu */}
        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationTitle}>✨ Bugünün Burç Yorumu</Text>
          <Text style={styles.recommendationText}>
            Yeni tanışacağınız kişilerle güçlü bir bağ kurabilirsiniz. 
            Astrolojik enerjiler bugün aşk konusunda size yardımcı olacak.
          </Text>
        </View>

        {/* Uyumluluk İpuçları */}
        <View style={styles.recentCard}>
          <Text style={styles.recentTitle}>🔮 En Uyumlu Burçlar</Text>
          <View style={styles.signList}>
            {ASTROLOGY_MATCHES.slice(0, 4).map((match, index) => (
              <View key={index} style={[styles.signChip, { borderColor: match.color }]}>
                <Text style={styles.signEmoji}>{match.emoji}</Text>
                <Text style={styles.signText}>{match.name}</Text>
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
  zodiacWheel: {
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
    borderColor: 'rgba(128, 0, 255, 0.1)',
    position: 'absolute',
  },
  middleCircle: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 255, 0.15)',
    position: 'absolute',
  },
  outerCircle: {
    width: width * 1.0,
    height: width * 1.0,
    borderRadius: width * 0.5,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 255, 0.2)',
    position: 'absolute',
  },
  symbolContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zodiacSymbol: {
    fontSize: 18,
    color: 'rgba(128, 0, 255, 0.4)',
    textAlign: 'center',
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(128, 0, 255, 0.4)',
    position: 'absolute',
  },
  starEffect: {
    position: 'absolute',
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    top: height * 0.4,
    left: width * 0.35,
  },
  starEffect2: {
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
  matchesContainer: {
    gap: 20,
    marginBottom: 25,
  },
  matchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
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
    alignItems: 'stretch',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  userImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  zodiacEmoji: {
    fontSize: 24,
  },
  compatibilityContainer: {
    marginBottom: 8,
  },
  compatibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  compatibilityText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 4,
  },
  compatibilityBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  compatibilityFill: {
    height: '100%',
    borderRadius: 3,
  },
  userBio: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
    marginBottom: 5,
  },
  compatibilityDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    lineHeight: 15,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
  },
  actionButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dislikeButton: {
    borderWidth: 2,
    borderColor: '#FF5722',
  },
  superLikeButton: {
    borderWidth: 2,
    borderColor: '#FFD700',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  likeButton: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
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
  signList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  signChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  signEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  signText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  spacer: {
    height: 40,
  },
  swipeMatchButton: {
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#8000FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  swipeMatchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  swipeMatchText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  likedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
}); 