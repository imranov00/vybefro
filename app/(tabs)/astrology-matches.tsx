import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
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
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { SwipeCard } from '../../components/swipe/SwipeCard';
import { useAuth } from '../context/AuthContext';
import { usePhotoIndex } from '../hooks/usePhotoIndex';
import { DiscoverUser, PremiumStatus, userApi, UserWhoLikedMe } from '../services/api';
import { getZodiacEmoji } from '../types/zodiac';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

export default function AstrologyMatchesScreen() {
  const colorScheme = useColorScheme();
  const { isPremium } = useAuth();
  const [activeTab, setActiveTab] = useState<'matches' | 'suggestions' | 'likes'>('matches');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [likedUsers, setLikedUsers] = useState<UserWhoLikedMe[]>([]);
  const [discoverUsers, setDiscoverUsers] = useState<DiscoverUser[]>([]);
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus | null>(null);
  const [swipeLimitInfo, setSwipeLimitInfo] = useState<any>(null);
  const [showSwipeScreen, setShowSwipeScreen] = useState(false);
  
  // Animasyon değerleri
  const fadeAnim = useSharedValue(1);
  const scaleAnim = useSharedValue(1);
  const slideAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(1);

  const { photoIndexes, setPhotoIndex } = usePhotoIndex();

  // Burç çarkı animasyonu
  useEffect(() => {
    slideAnim.value = withTiming(1, { duration: 300 });
    
    // Pulse animasyonu
    pulseAnim.value = withRepeat(
      withTiming(1.05, { duration: 1500 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ scale: scaleAnim.value }]
    };
  });

  const animatedPulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnim.value }],
    };
  });

  const handleUserPress = (user: any) => {
    setSelectedUser(user);
    scaleAnim.value = withSpring(0.95, {}, () => {
      scaleAnim.value = withSpring(1);
    });
  };

  const renderAstrologyMatchCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.matchCard}
      onPress={() => handleUserPress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <View style={styles.imageContainer}>
          <Animated.View style={[styles.imagePlaceholder, animatedPulseStyle]}>
            <Text style={styles.zodiacIcon}>{getZodiacEmoji(item.zodiacSign)}</Text>
          </Animated.View>
          {item.activityStatus === 'ONLINE' && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{item.fullName}, {item.age}</Text>
            <View style={styles.compatibilityBadge}>
              <Text style={styles.compatibilityText}>%{item.compatibilityScore}</Text>
            </View>
          </View>
          
          <Text style={styles.zodiacText}>{item.zodiacSignDisplay}</Text>
          <Text style={styles.locationText}>{item.location} • {item.lastActiveTime}</Text>
          <Text style={styles.bioText} numberOfLines={2}>{item.bio}</Text>
          
          {/* Uyumluluk Mesajı */}
          <View style={styles.compatibilityContainer}>
            <Text style={styles.compatibilityLabel}>Uyumluluk:</Text>
            <Text style={styles.compatibilityMessage} numberOfLines={1}>
              {item.compatibilityMessage}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionBtn, styles.passBtn]}>
          <Ionicons name="close" size={20} color="#FF6B6B" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionBtn, styles.chartBtn]}>
          <Ionicons name="star" size={20} color="#FFD700" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionBtn, styles.likeBtn]}>
          <Ionicons name="heart" size={20} color="#FF9FF3" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderAstrologySuggestionCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.suggestionCard} activeOpacity={0.9}>
      <View style={styles.suggestionHeader}>
        <Text style={styles.suggestionIcon}>{getZodiacEmoji(item.zodiacSign)}</Text>
        <View style={styles.suggestionInfo}>
          <Text style={styles.suggestionTitle}>{item.compatibilityMessage}</Text>
          <Text style={styles.suggestionSubtitle}>Yüksek Uyumluluk Oranı</Text>
        </View>
      </View>
      
      <View style={styles.suggestionUser}>
        <View style={styles.smallImageContainer}>
          <Text style={styles.smallZodiacIcon}>{getZodiacEmoji(item.zodiacSign)}</Text>
        </View>
        <Text style={styles.suggestionUserName}>
          {item.fullName}, {item.age} • {item.zodiacSignDisplay}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const fetchLikedUsers = async () => {
    try {
      setLoading(true);
      console.log('Beğenen kullanıcılar yükleniyor...');
      const response = await userApi.getUsersWhoLikedMe(1, 20);
      console.log('Beğenen kullanıcılar yanıtı:', response);
      
      if (response.success) {
        setLikedUsers(response.users);
      } else {
        console.error('API yanıtı başarısız:', response);
        Alert.alert('Hata', response.message || 'Beğenen kullanıcılar yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Beğenen kullanıcılar yüklenirken hata:', error);
      if (error instanceof Error) {
        console.error('Hata detayı:', error.message);
        Alert.alert('Hata', error.message);
      } else {
        Alert.alert('Hata', 'Beğenen kullanıcılar yüklenirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscoverUsers = async () => {
    try {
      setLoading(true);
      console.log('Keşfet kullanıcıları yükleniyor...');
      const response = await userApi.getDiscoverUsers(1, 20);
      console.log('Keşfet kullanıcıları yanıtı:', response);
      
      if (response.success) {
        setDiscoverUsers(response.users);
        setSwipeLimitInfo(response.swipeLimitInfo);
      } else {
        console.error('API yanıtı başarısız:', response);
        Alert.alert('Hata', response.message || 'Kullanıcılar yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Keşfet kullanıcıları yüklenirken hata:', error);
      if (error instanceof Error) {
        console.error('Hata detayı:', error.message);
        Alert.alert('Hata', error.message);
      } else {
        Alert.alert('Hata', 'Kullanıcılar yüklenirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPremiumStatus = async () => {
    try {
      const response = await userApi.getPremiumStatus();
      if (response.success) {
        setPremiumStatus(response.data);
      }
    } catch (error) {
      console.error('Premium status fetching error:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'likes') {
      fetchLikedUsers();
    } else if (activeTab === 'matches') {
      fetchDiscoverUsers();
    }
    fetchPremiumStatus();
  }, [activeTab, isPremium]);

  // Premium banner'ı güncelle
  const renderPremiumBanner = () => {
    if (isPremium || !premiumStatus) return null;

    const remainingSwipes = premiumStatus.remainingSwipes || 0;
    const totalSwipes = premiumStatus.totalSwipes || 0;

    return (
      <View style={styles.premiumBanner}>
        <Ionicons name="diamond" size={24} color="#FFD700" />
        <View style={styles.premiumInfo}>
          <Text style={styles.premiumTitle}>Premium Özellik</Text>
          <Text style={styles.premiumSubtitle}>
            {remainingSwipes > 0 
              ? `Kalan ${remainingSwipes}/${totalSwipes} swipe hakkın var`
              : 'Swipe hakların bitti. Premium üye ol ve sınırsız swipe yap!'}
          </Text>
        </View>
        <TouchableOpacity style={styles.premiumButton}>
          <Text style={styles.premiumButtonText}>Yükselt</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderUserCard = (user: DiscoverUser) => (
    <View style={styles.card}>
      <Image
        source={{ uri: user.profileImageUrl || '' }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.cardAge}>{user.age} yaşında</Text>
        <Text style={styles.cardZodiac}>
          {getZodiacEmoji(user.zodiacSign)} {user.zodiacSign}
        </Text>
        <Text style={styles.cardBio}>{user.bio}</Text>
        <Text style={styles.cardCompatibility}>
          Uyumluluk: {user.compatibilityScore}%
        </Text>
      </View>
    </View>
  );

  const renderLikedUserCard = (user: UserWhoLikedMe) => (
    <View style={styles.card}>
      <Image
        source={{ uri: user.profileImageUrl || '' }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.cardAge}>{user.age} yaşında</Text>
        <Text style={styles.cardZodiac}>
          {getZodiacEmoji(user.zodiacSign)} {user.zodiacSign}
        </Text>
        <Text style={styles.cardCompatibility}>
          Uyumluluk: {user.compatibilityScore}%
        </Text>
      </View>
    </View>
  );

  const handleSwipe = async (direction: 'left' | 'right', userId: number) => {
    try {
      const swipeAction = direction === 'right' ? 'LIKE' : 'DISLIKE';
      const response = await userApi.swipe({
        toUserId: userId,
        action: swipeAction
      });

      if (response.success) {
        console.log('Swipe başarılı:', response);
        if (response.isMatch) {
          Alert.alert('Eşleşme!', 'Tebrikler! Yeni bir eşleşmeniz var!');
        }
      } else {
        console.error('Swipe başarısız:', response.message);
      }
    } catch (error) {
      console.error('Swipe hatası:', error);
    }
  };

  const handleActionButton = (action: 'like' | 'dislike' | 'superlike') => {
    if (discoverUsers.length === 0) return;
    
    const currentUser = discoverUsers[0];
    if (action === 'like') {
      handleSwipe('right', currentUser.id);
    } else if (action === 'dislike') {
      handleSwipe('left', currentUser.id);
    } else {
      // superlike UI'da gösterilebilir ama API'ya gönderilmez
      Alert.alert('Super Like', 'Super Like özelliği henüz desteklenmiyor.');
    }
  };

  const renderCard = (card: DiscoverUser) => {
    return (
      <View style={styles.card}>
        <Image
          source={{ uri: card.profileImageUrl || '' }}
          style={styles.cardImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardName}>{card.firstName} {card.lastName}</Text>
            <Text style={styles.cardAge}>{card.age} yaşında</Text>
            <Text style={styles.cardZodiac}>
              {getZodiacEmoji(card.zodiacSign)} {card.zodiacSign}
            </Text>
            <Text style={styles.cardBio}>{card.bio}</Text>
            <Text style={styles.cardCompatibility}>
              Uyumluluk: {card.compatibilityScore}%
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Kullanıcılar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Arka plan gradyan */}
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.background} />

      {!showSwipeScreen ? (
        // Eşleşmeler Ekranı
        <Animated.View style={[styles.content, animatedStyle]}>
          <View style={styles.header}>
            <Text style={styles.title}>Eşleşmeler</Text>
            <TouchableOpacity 
              style={styles.swipeButton}
              onPress={() => setShowSwipeScreen(true)}
            >
              <Ionicons name="heart" size={24} color="white" />
              <Text style={styles.swipeButtonText}>Swipe Yap</Text>
            </TouchableOpacity>
          </View>
          
          {/* Tab Bar */}
          <View style={styles.tabBar}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'matches' && styles.activeTab]}
              onPress={() => setActiveTab('matches')}
            >
              <Ionicons 
                name="star" 
                size={20} 
                color={activeTab === 'matches' ? '#FFFFFF' : 'rgba(255,255,255,0.6)'} 
              />
              <Text style={[styles.tabText, activeTab === 'matches' && styles.activeTabText]}>
                Eşleşmeler
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'suggestions' && styles.activeTab]}
              onPress={() => setActiveTab('suggestions')}
            >
              <Ionicons 
                name="sparkles" 
                size={20} 
                color={activeTab === 'suggestions' ? '#FFFFFF' : 'rgba(255,255,255,0.6)'} 
              />
              <Text style={[styles.tabText, activeTab === 'suggestions' && styles.activeTabText]}>
                Öneriler
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'likes' && styles.activeTab]}
              onPress={() => setActiveTab('likes')}
            >
              <Ionicons 
                name="heart" 
                size={20} 
                color={activeTab === 'likes' ? '#FFFFFF' : 'rgba(255,255,255,0.6)'} 
              />
              <Text style={[styles.tabText, activeTab === 'likes' && styles.activeTabText]}>
                Beğeniler
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {activeTab === 'matches' && (
            <FlatList
              data={discoverUsers}
              renderItem={renderAstrologyMatchCard}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          )}
          
          {activeTab === 'suggestions' && (
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {discoverUsers.slice(0, 5).map((user) => (
                <View key={user.id}>
                  {renderAstrologySuggestionCard({ item: user })}
                </View>
              ))}
            </ScrollView>
          )}
          
          {activeTab === 'likes' && (
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {renderPremiumBanner()}
              
              {/* Beğeni Listesi */}
              <View style={styles.likesContainer}>
                <Text style={styles.sectionTitle}>
                  {isPremium ? 'Seni Beğenenler' : 'Beğeni Alındı'}
                </Text>
                
                {likedUsers.slice(0, 3).map((user) => (
                  <View key={user.id} style={[styles.likeCard, !isPremium && styles.blurredCard]}>
                    <View style={styles.likeCardContent}>
                      <View style={styles.likeImageContainer}>
                        <Text style={styles.zodiacIcon}>{getZodiacEmoji(user.zodiacSign)}</Text>
                      </View>
                      
                      <View style={styles.likeUserInfo}>
                        <Text style={[styles.likeUserName, !isPremium && styles.blurredText]}>
                          {isPremium ? `${user.firstName} ${user.lastName}, ${user.age}` : '••••••, ••'}
                        </Text>
                        <Text style={[styles.likeZodiacText, !isPremium && styles.blurredText]}>
                          {isPremium ? user.zodiacSign : '••••••'}
                        </Text>
                      </View>
                      
                      <View style={styles.likeCompatibility}>
                        <Text style={styles.likeCompatibilityText}>
                          %{user.compatibilityScore}
                        </Text>
                      </View>
                    </View>
                    
                    {!isPremium && (
                      <View style={styles.blurOverlay}>
                        <Ionicons name="lock-closed" size={24} color="white" />
                      </View>
                    )}
                  </View>
                ))}
                
                {!isPremium && (
                  <TouchableOpacity style={styles.viewMoreButton}>
                    <Ionicons name="add" size={20} color="white" />
                    <Text style={styles.viewMoreText}>
                      Daha fazla beğeni görmek için premium'a geç
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          )}
        </Animated.View>
      ) : (
        // Swipe Ekranı
        <>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => setShowSwipeScreen(false)}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.title}>Burç Eşleşmeleri</Text>
              {swipeLimitInfo && (
                <Text style={styles.swipeLimit}>
                  {swipeLimitInfo.isPremium ? '∞ ' : `${swipeLimitInfo.remainingSwipes}/${swipeLimitInfo.totalSwipes} `}
                  Swipe Hakkı
                </Text>
              )}
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Swipe Cards Container */}
          <View style={styles.cardsContainer}>
            {discoverUsers.map((user, index) => (
              <SwipeCard
                key={user.id}
                user={user}
                onSwipe={handleSwipe}
                style={{
                  zIndex: discoverUsers.length - index,
                  transform: [
                    { scale: 1 - index * 0.02 },
                    { translateY: index * -8 }
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
              <Ionicons name="close" size={32} color="#FF5722" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.superLikeButton]}
              onPress={() => handleActionButton('superlike')}
            >
              <Ionicons name="star" size={28} color="#FFD700" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.likeButton]}
              onPress={() => handleActionButton('like')}
            >
              <Ionicons name="heart" size={32} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </>
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
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 6,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  matchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zodiacIcon: {
    fontSize: 24,
    color: 'white',
  },
  onlineIndicator: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1DB954',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  compatibilityBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compatibilityText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  zodiacText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
    marginBottom: 8,
  },
  compatibilityContainer: {
    marginTop: 4,
  },
  compatibilityLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  compatibilityMessage: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  passBtn: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  chartBtn: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
  },
  likeBtn: {
    backgroundColor: 'rgba(255, 159, 243, 0.2)',
  },
  suggestionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  suggestionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  suggestionUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallImageContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  smallZodiacIcon: {
    fontSize: 16,
    color: 'white',
  },
  suggestionUserName: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  premiumInfo: {
    flex: 1,
    marginLeft: 12,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  premiumButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  premiumButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  likesContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  likeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  blurredCard: {
    opacity: 0.7,
  },
  likeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  likeUserInfo: {
    flex: 1,
  },
  likeUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  likeZodiacText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  likeCompatibility: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  likeCompatibilityText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  blurredText: {
    fontFamily: 'monospace',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
  viewMoreText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: 20,
    backgroundColor: 'white',
    position: 'relative',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    padding: 20,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  cardAge: {
    fontSize: 18,
    color: 'white',
    marginBottom: 4,
  },
  cardZodiac: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
  },
  cardBio: {
    fontSize: 14,
    color: 'white',
    marginBottom: 8,
  },
  cardCompatibility: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
  },
  swipeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  backButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerCenter: {
    flex: 1,
  },
  filterButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardsContainer: {
    flex: 1,
    padding: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dislikeButton: {
    backgroundColor: 'rgba(255, 87, 34, 0.2)',
  },
  superLikeButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  likeButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  swipeLimit: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
}); 