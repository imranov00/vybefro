import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
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
import { useAuth } from '../context/AuthContext';
import { swipeApi, userApi, UserWhoLikedMe } from '../services/api';

const { width, height } = Dimensions.get('window');

// Örnek müzik eşleşme verileri
const MUSIC_MATCHES_DATA = [
  {
    id: 1,
    name: 'Cem',
    age: 27,
    musicGenre: '🎸',
    genreName: 'Rock',
    favoriteArtist: 'Radiohead',
    compatibility: 94,
    distance: '1.5 km',
    lastActive: '1 saat önce',
    bio: 'Rock müzik tutkunu, canlı konserlerde buluşmayı seven...',
    isOnline: true,
    topSongs: ['Creep', 'Paranoid Android', 'Karma Police']
  },
  {
    id: 2,
    name: 'Deniz',
    age: 25,
    musicGenre: '🎵',
    genreName: 'Pop',
    favoriteArtist: 'Billie Eilish',
    compatibility: 91,
    distance: '3 km',
    lastActive: '2 saat önce',
    bio: 'Pop müzik ve indie soundlar, spotify playlistlerimizi paylaşalım...',
    isOnline: true,
    topSongs: ['Bad Guy', 'Lovely', 'Ocean Eyes']
  },
  {
    id: 3,
    name: 'Kaan',
    age: 30,
    musicGenre: '🎧',
    genreName: 'Electronic',
    favoriteArtist: 'Daft Punk',
    compatibility: 89,
    distance: '2 km',
    lastActive: '4 saat önce',
    bio: 'Electronic beats ve house music, dans etmeyi seven biri...',
    isOnline: false,
    topSongs: ['One More Time', 'Get Lucky', 'Around the World']
  },
  {
    id: 4,
    name: 'Berk',
    age: 26,
    musicGenre: '🎻',
    genreName: 'Jazz',
    favoriteArtist: 'Miles Davis',
    compatibility: 87,
    distance: '4 km',
    lastActive: '1 gün önce',
    bio: 'Jazz classics ve improvisation, canlı jazz kulüplerinde buluşalım...',
    isOnline: false,
    topSongs: ['Kind of Blue', 'So What', 'Blue in Green']
  }
];

// Günlük müzik önerileri
const DAILY_MUSIC_SUGGESTIONS = [
  {
    id: 1,
    title: 'Spotify Uyumluluğu %95',
    subtitle: 'Müzik zevkinizle mükemmel uyum',
    user: MUSIC_MATCHES_DATA[0],
    icon: '🎵'
  },
  {
    id: 2,
    title: 'Same Vibe Music',
    subtitle: 'Aynı müzik enerjisini paylaşıyorsunuz',
    user: MUSIC_MATCHES_DATA[1],
    icon: '🎶'
  }
];

export default function MusicMatchesScreen() {
  const colorScheme = useColorScheme();
  const { isPremium } = useAuth();
  const [activeTab, setActiveTab] = useState<'matches' | 'suggestions' | 'playlists'>('matches');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [likedUsers, setLikedUsers] = useState<UserWhoLikedMe[]>([]);

  // Müzik modunda da daha önce swipe edilmişleri filtrele
  const fetchMusicUsers = async () => {
    try {
      console.log('🎵 [MUSIC] Yeni müzik eşleşmeleri getiriliyor (refresh=false)');
      const response = await swipeApi.getDiscoverUsers(false, false, 1, 10);
      
      if (response.success) {
              console.log(`🎶 [MUSIC] ${response.users.length} yeni kullanıcı bulundu`);
      console.log(`📊 [MUSIC] Toplam: ${response.totalCount}, Returned: ${response.returnedCount}`);
        // TODO: Static data yerine API data'sını kullan
      }
    } catch (error) {
      console.warn('⚠️ [MUSIC] Kullanıcılar alınamadı:', error);
    }
  };
  
  // Animasyon değerleri
  const fadeAnim = useSharedValue(1);
  const scaleAnim = useSharedValue(1);
  const slideAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(1);

  // Müzik pulse animasyonu ve API çağrısı
  useEffect(() => {
    slideAnim.value = withTiming(1, { duration: 300 });
    
    // Pulse animasyonu
    pulseAnim.value = withRepeat(
      withTiming(1.05, { duration: 1500 }),
      -1,
      true
    );

    // API çağrısı - daha önce swipe edilmişleri filtrele
    fetchMusicUsers();
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

  const renderMusicMatchCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.matchCard}
      onPress={() => handleUserPress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <View style={styles.imageContainer}>
          <Animated.View style={[styles.imagePlaceholder, animatedPulseStyle]}>
            <Text style={styles.musicIcon}>{item.musicGenre}</Text>
          </Animated.View>
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{item.name}, {item.age}</Text>
            <View style={styles.compatibilityBadge}>
              <Text style={styles.compatibilityText}>%{item.compatibility}</Text>
            </View>
          </View>
          
          <Text style={styles.genreText}>{item.genreName} • {item.favoriteArtist}</Text>
          <Text style={styles.distanceText}>{item.distance} • {item.lastActive}</Text>
          <Text style={styles.bioText} numberOfLines={2}>{item.bio}</Text>
          
          {/* Top Songs */}
          <View style={styles.songsContainer}>
            <Text style={styles.songsLabel}>Favori Şarkılar:</Text>
            <Text style={styles.songsText} numberOfLines={1}>
              {item.topSongs.join(' • ')}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionBtn, styles.passBtn]}>
          <Ionicons name="close" size={20} color="#FF6B6B" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionBtn, styles.playlistBtn]}>
          <Ionicons name="musical-notes" size={20} color="#1DB954" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionBtn, styles.likeBtn]}>
          <Ionicons name="heart" size={20} color="#FF9FF3" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderMusicSuggestionCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.suggestionCard} activeOpacity={0.9}>
      <View style={styles.suggestionHeader}>
        <Text style={styles.suggestionIcon}>{item.icon}</Text>
        <View style={styles.suggestionInfo}>
          <Text style={styles.suggestionTitle}>{item.title}</Text>
          <Text style={styles.suggestionSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      
      <View style={styles.suggestionUser}>
        <View style={styles.smallImageContainer}>
          <Text style={styles.smallMusicIcon}>{item.user.musicGenre}</Text>
        </View>
        <Text style={styles.suggestionUserName}>
          {item.user.name}, {item.user.age} • {item.user.genreName}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const fetchLikedUsers = async () => {
    if (!isPremium) return;
    
    setLoading(true);
    try {
      const response = await userApi.getUsersWhoLikedMe(1, 20);
      setLikedUsers(response.users);
    } catch (error) {
      console.error('Liked users fetching error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'playlists') {
      fetchLikedUsers();
    }
  }, [activeTab, isPremium]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Arka plan gradyan */}
      <LinearGradient
        colors={['#1DB954', '#1E7E34', '#145A24']}
        style={styles.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Müzik Eşleşmelerim</Text>
        <Text style={styles.subtitle}>Müzik Zevkinle Uyumlu Ruhlar</Text>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'matches' && styles.activeTab]}
          onPress={() => setActiveTab('matches')}
        >
          <Ionicons 
            name="people" 
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
            name="star" 
            size={20} 
            color={activeTab === 'suggestions' ? '#FFFFFF' : 'rgba(255,255,255,0.6)'} 
          />
          <Text style={[styles.tabText, activeTab === 'suggestions' && styles.activeTabText]}>
            Öneriler
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'playlists' && styles.activeTab]}
          onPress={() => setActiveTab('playlists')}
        >
          <Ionicons 
            name="heart" 
            size={20} 
            color={activeTab === 'playlists' ? '#FFFFFF' : 'rgba(255,255,255,0.6)'} 
          />
          <Text style={[styles.tabText, activeTab === 'playlists' && styles.activeTabText]}>
            Beğeniler
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, animatedStyle]}>
        {activeTab === 'matches' && (
          <FlatList
            data={MUSIC_MATCHES_DATA}
            renderItem={renderMusicMatchCard}
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
            {DAILY_MUSIC_SUGGESTIONS.map((suggestion) => (
              <View key={suggestion.id}>
                {renderMusicSuggestionCard({ item: suggestion })}
              </View>
            ))}
          </ScrollView>
        )}
        
        {activeTab === 'playlists' && (
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Premium Banner */}
            {!isPremium && (
              <View style={styles.premiumBanner}>
                <Ionicons name="diamond" size={24} color="#FFD700" />
                <View style={styles.premiumInfo}>
                  <Text style={styles.premiumTitle}>Premium Özellik</Text>
                  <Text style={styles.premiumSubtitle}>
                    Seni beğenenleri görmek için premium üyeliğe geç
                  </Text>
                </View>
                <TouchableOpacity style={styles.premiumButton}>
                  <Text style={styles.premiumButtonText}>Yükselt</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Beğeni Listesi */}
            <View style={styles.likesContainer}>
              <Text style={styles.sectionTitle}>
                {isPremium ? 'Seni Beğenenler' : 'Beğeni Alındı'}
              </Text>
              
              {MUSIC_MATCHES_DATA.slice(0, 3).map((user, index) => (
                <View key={user.id} style={[styles.likeCard, !isPremium && styles.blurredCard]}>
                  <View style={styles.likeCardContent}>
                    <View style={styles.likeImageContainer}>
                      <Text style={styles.musicIcon}>{user.musicGenre}</Text>
                    </View>
                    
                    <View style={styles.likeUserInfo}>
                      <Text style={[styles.likeUserName, !isPremium && styles.blurredText]}>
                        {isPremium ? `${user.name}, ${user.age}` : '••••••, ••'}
                      </Text>
                      <Text style={[styles.likeGenreText, !isPremium && styles.blurredText]}>
                        {isPremium ? `${user.genreName} • ${user.favoriteArtist}` : '•••••• • ••••••'}
                      </Text>
                      <Text style={styles.likeTimeText}>1 saat önce</Text>
                    </View>
                    
                    <View style={styles.likeCompatibility}>
                      <Text style={styles.likeCompatibilityText}>
                        %{user.compatibility}
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
  musicIcon: {
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
  genreText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  distanceText: {
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
  songsContainer: {
    marginTop: 4,
  },
  songsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  songsText: {
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
  playlistBtn: {
    backgroundColor: 'rgba(29, 185, 84, 0.3)',
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
  smallMusicIcon: {
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Premium ve Beğeni Stilleri
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
  likeGenreText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  likeTimeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
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
}); 