import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import MatchScreen from '../components/match/MatchScreen';
import SwipeCard from '../components/swipe/SwipeCard';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { Match, matchApi, PotentialMatch, swipeApi } from '../services/api';
import { calculateCompatibility, getCompatibilityDescription } from '../types/compatibility';
import { getZodiacDisplay, getZodiacEmoji } from '../types/zodiac';

const { width, height } = Dimensions.get('window');

// Burç çarkı sembolleri animasyonu için
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
  const { isPremium } = useAuth();
  const { userProfile } = useProfile();
  const router = useRouter();
  
    // State yönetimi
    const [activeTab, setActiveTab] = useState<'discover' | 'matches' | 'likes'>('discover');
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [usersWhoLikedMe, setUsersWhoLikedMe] = useState<PotentialMatch[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

    // Animasyon değerleri
    const zodiacRotation = useSharedValue(0);
    const tabIndicatorPosition = useSharedValue(0);

    // Burç çarkı animasyonu
    useEffect(() => {
        zodiacRotation.value = withTiming(360, { duration: 120000 }, () => {
            zodiacRotation.value = 0;
        });
    }, []);

    // Tab indicator animasyonu
    useEffect(() => {
        const tabIndex = activeTab === 'discover' ? 0 : activeTab === 'matches' ? 1 : 2;
        tabIndicatorPosition.value = withSpring(tabIndex * (width / 3));
    }, [activeTab]);

  // İlk yükleme
  useEffect(() => {
    loadInitialData();
  }, []);

    // Veri yükleme fonksiyonları
  const loadInitialData = async () => {
    setIsInitialLoading(true);
    try {
      await Promise.all([
                loadPotentialMatches(true),
        loadMatches(),
        loadUsersWhoLikedMe()
      ]);
    } catch (error) {
            console.error('❌ İlk veri yükleme hatası:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

    const loadPotentialMatches = async (reset = false) => {
        if (isLoading && !reset) return;
    
    try {
      setIsLoading(true);
            const page = reset ? 1 : currentPage;
            
            console.log('🔄 Potansiyel eşleşmeler yükleniyor...', { page });

            // Önce ana endpoint'i dene
            let response = null;
            try {
                response = await swipeApi.getPotentialMatches(page, 10);
                console.log('✅ Ana endpoint başarılı:', response);
            } catch (error) {
                console.log('❌ Ana endpoint başarısız, alternatif deneniyor...');
                try {
                    response = await swipeApi.getAllUsers(page, 10);
                    console.log('✅ Alternatif endpoint başarılı:', response);
                } catch (altError) {
                    console.log('❌ Alternatif endpoint de başarısız, discover deneniyor...');
                    response = await swipeApi.getDiscoverUsers(page, 10);
                    console.log('✅ Discover endpoint başarılı:', response);
                }
            }

            if (response?.users && response.users.length > 0) {
                const processedUsers = response.users.map((user: any) => ({
          ...user,
                    age: typeof user.age === 'number' ? user.age : 
                         user.birthDate ? new Date().getFullYear() - new Date(user.birthDate).getFullYear() : 25,
                    photos: user.photos?.length > 0 ? user.photos : 
                            user.profileImageUrl ? [user.profileImageUrl] : [],
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

                if (reset) {
                    setPotentialMatches(processedUsers);
                    setCurrentCardIndex(0);
                    setCurrentPage(2);
                } else {
                    setPotentialMatches(prev => [...prev, ...processedUsers]);
        setCurrentPage(prev => prev + 1);
                }
                
                setHasMore(response.hasMore ?? processedUsers.length >= 10);
                console.log('✅ Kullanıcılar işlendi:', processedUsers.length);
      } else {
        setHasMore(false);
                if (reset) {
                    setPotentialMatches([]);
                }
            }
        } catch (error) {
            console.error('❌ Potansiyel eşleşme yükleme hatası:', error);
            if (reset) {
                setPotentialMatches([]);
            }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMatches = async () => {
    try {
      const response = await matchApi.getMatches();
      setMatches(response.matches || []);
            console.log('✅ Eşleşmeler yüklendi:', response.matches?.length || 0);
    } catch (error) {
            console.error('❌ Eşleşme yükleme hatası:', error);
      setMatches([]);
    }
  };

  const loadUsersWhoLikedMe = async () => {
    try {
      const response = await swipeApi.getUsersWhoLikedMe();
            const processedUsers = response.users.map(user => ({
                ...user,
                age: typeof user.age === 'number' ? user.age : 25,
        photos: user.profileImageUrl ? [user.profileImageUrl] : [],
        bio: null,
        zodiacSign: user.zodiacSign || 'ARIES',
        compatibilityScore: calculateCompatibility(
          userProfile.zodiacSign as any, 
          (user.zodiacSign || 'ARIES') as any
        ),
        compatibilityDescription: getCompatibilityDescription(
          userProfile.zodiacSign as any,
          (user.zodiacSign || 'ARIES') as any,
          calculateCompatibility(userProfile.zodiacSign as any, (user.zodiacSign || 'ARIES') as any)
        ),
        distance: 0,
        isOnline: false
      }));
            setUsersWhoLikedMe(processedUsers);
            console.log('✅ Beğeniler yüklendi:', processedUsers.length);
    } catch (error) {
            console.error('❌ Beğeni yükleme hatası:', error);
      setUsersWhoLikedMe([]);
    }
  };

  // Swipe işlemi
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

            // Match kontrolü
      if (response.isMatch && response.matchId) {
        const matchedUser = potentialMatches.find(u => u.id === userId);
        if (matchedUser) {
          const newMatch: Match = {
            id: response.matchId,
            matchedUser: {
              id: matchedUser.id,
              username: matchedUser.username,
              firstName: matchedUser.firstName,
              lastName: matchedUser.lastName,
              age: matchedUser.age,
              profileImageUrl: matchedUser.profileImageUrl,
              zodiacSign: matchedUser.zodiacSign
            },
            compatibilityScore: matchedUser.compatibilityScore,
            compatibilityDescription: matchedUser.compatibilityDescription,
            matchType: 'ZODIAC',
            matchedAt: new Date().toISOString()
          };
          
          setCurrentMatch(newMatch);
          setShowMatchModal(true);
                    setMatches(prev => [newMatch, ...prev]);
        }
      }

      // Sonraki karta geç
      const newIndex = currentCardIndex + 1;
      setCurrentCardIndex(newIndex);
      
            // Daha fazla kart yükle
            if (newIndex >= potentialMatches.length - 2 && hasMore) {
                await loadPotentialMatches();
            }
            
        } catch (error) {
            console.error('❌ Swipe hatası:', error);
            // Hata durumunda da sonraki karta geç
            setCurrentCardIndex(prev => prev + 1);
        }
    };

    // Refresh işlemi
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            if (activeTab === 'discover') {
                await loadPotentialMatches(true);
            } else if (activeTab === 'matches') {
                await loadMatches();
            } else {
                await loadUsersWhoLikedMe();
            }
        } finally {
            setRefreshing(false);
        }
    }, [activeTab]);

    // Eşleşme silme
    const handleDeleteMatch = async (matchId: number) => {
        Alert.alert(
            'Eşleşmeyi Sil',
            'Bu eşleşmeyi silmek istediğinizden emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await matchApi.deleteMatch(matchId);
                            setMatches(prev => prev.filter(m => m.id !== matchId));
                        } catch (error) {
                            console.error('❌ Eşleşme silme hatası:', error);
                            Alert.alert('Hata', 'Eşleşme silinirken bir hata oluştu.');
                        }
                    }
                }
            ]
        );
    };

    // Animasyon stilleri
    const zodiacWheelStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${zodiacRotation.value}deg` }]
    }));

    const tabIndicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: tabIndicatorPosition.value }]
    }));

    // Render fonksiyonları
    const renderDiscoverContent = () => {
        if (isInitialLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8000FF" />
                    <Text style={styles.loadingText}>Yıldızlar hizalanıyor...</Text>
                </View>
            );
        }

        const cardsToShow = potentialMatches.slice(currentCardIndex, currentCardIndex + 3);
        
        if (cardsToShow.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.zodiacEmoji}>✨</Text>
                    <Text style={styles.emptyTitle}>Yeni Eşleşmeler Bekleniyor</Text>
                    <Text style={styles.emptySubtitle}>
                        Yakında size uygun yeni profiller ekleyeceğiz
                    </Text>
                    <TouchableOpacity 
                        style={styles.refreshButton}
                        onPress={() => loadPotentialMatches(true)}
                        disabled={isLoading}
                    >
                        <Text style={styles.refreshButtonText}>Yenile</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.swipeContainer}>
                {cardsToShow.map((user, index) => (
                    <SwipeCard
                        key={`${user.id}-${currentCardIndex}`}
                        user={user}
                        onSwipe={handleSwipe}
                        isTop={index === 0}
                        index={index}
                    />
                ))}
                
                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.dislikeButton]}
                        onPress={() => {
                            if (cardsToShow[0]) {
                                handleSwipe('left', cardsToShow[0].id);
                            }
                        }}
                        disabled={cardsToShow.length === 0}
                    >
                        <Ionicons name="close" size={28} color="#FF5722" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.superLikeButton]}
                        onPress={() => {
                            if (cardsToShow[0]) {
                                handleSwipe('up', cardsToShow[0].id);
                            }
                        }}
                        disabled={cardsToShow.length === 0}
                    >
                        <Ionicons name="star" size={24} color="#FFD700" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.likeButton]}
                        onPress={() => {
                            if (cardsToShow[0]) {
                                handleSwipe('right', cardsToShow[0].id);
                            }
                        }}
                        disabled={cardsToShow.length === 0}
                    >
                        <Ionicons name="heart" size={28} color="#4CAF50" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderMatchesContent = () => {
    if (matches.length === 0) {
      return (
        <View style={styles.emptyContainer}>
                    <Text style={styles.zodiacEmoji}>💕</Text>
                    <Text style={styles.emptyTitle}>Henüz Eşleşmen Yok</Text>
          <Text style={styles.emptySubtitle}>
                        Keşfet sekmesinde swipe yaparak eşleşmeler oluştur
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8000FF" />
                }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.matchCard}
                        onPress={() => router.push(`/match/${item.id}` as any)}
          >
            <Image 
              source={{ uri: item.matchedUser.profileImageUrl || 'https://picsum.photos/400' }} 
              style={styles.matchAvatar}
            />
            <View style={styles.matchInfo}>
              <Text style={styles.matchName}>
                {item.matchedUser.firstName} {item.matchedUser.lastName}
              </Text>
              <Text style={styles.matchCompatibility}>
                                %{item.compatibilityScore} Uyumlu • {getZodiacEmoji(item.matchedUser.zodiacSign)}
              </Text>
              <Text style={styles.matchDate}>
                {new Date(item.matchedAt).toLocaleDateString('tr-TR')}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                handleDeleteMatch(item.id);
                            }}
            >
              <Ionicons name="trash-outline" size={20} color="#FF5722" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    );
  };

    const renderLikesContent = () => {
    if (usersWhoLikedMe.length === 0) {
      return (
        <View style={styles.emptyContainer}>
                    <Text style={styles.zodiacEmoji}>❤️</Text>
                    <Text style={styles.emptyTitle}>Henüz Beğeni Yok</Text>
          <Text style={styles.emptySubtitle}>
                        Profilini geliştir ve daha fazla beğeni al
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={usersWhoLikedMe}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.likesContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8000FF" />
                }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.likeCard}
                        onPress={() => router.push(`/profile/${item.id}` as any)}
          >
            <Image 
              source={{ uri: item.profileImageUrl || 'https://picsum.photos/400' }} 
              style={styles.likeAvatar}
            />
                        <Text style={styles.likeName}>{item.firstName}</Text>
                        <Text style={styles.likeCompatibility}>%{item.compatibilityScore} Uyumlu</Text>
                        <Text style={styles.likeZodiac}>{getZodiacDisplay(item.zodiacSign)}</Text>
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
            {/* Arka plan gradyan */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.background}
      />

            {/* Burç çarkı arka plan */}
            <Animated.View style={[styles.zodiacWheel, zodiacWheelStyle]}>
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

            {/* Tab Bar */}
      <View style={styles.tabBar}>
                <Animated.View style={[styles.tabIndicator, tabIndicatorStyle]} />
                
        <TouchableOpacity
                    style={styles.tab}
                    onPress={() => setActiveTab('discover')}
        >
          <Ionicons 
                        name="telescope" 
            size={20} 
                        color={activeTab === 'discover' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'} 
          />
                    <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
            Keşfet
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
                    style={styles.tab}
          onPress={() => setActiveTab('matches')}
        >
          <Ionicons 
                        name="heart" 
            size={20} 
            color={activeTab === 'matches' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'} 
          />
          <Text style={[styles.tabText, activeTab === 'matches' && styles.activeTabText]}>
            Eşleşmeler
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
                    style={styles.tab}
          onPress={() => setActiveTab('likes')}
        >
          <Ionicons 
                        name="flame" 
            size={20} 
            color={activeTab === 'likes' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'} 
          />
          <Text style={[styles.tabText, activeTab === 'likes' && styles.activeTabText]}>
            Beğeniler
          </Text>
        </TouchableOpacity>
      </View>

            {/* Content */}
            <View style={styles.content}>
                {activeTab === 'discover' && renderDiscoverContent()}
                {activeTab === 'matches' && renderMatchesContent()}
                {activeTab === 'likes' && renderLikesContent()}
      </View>

      {/* Match Modal */}
      <Modal
        visible={showMatchModal}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setShowMatchModal(false)}
      >
        {currentMatch && (
          <MatchScreen
            match={currentMatch}
            currentUser={{
              firstName: userProfile.firstName || 'Sen',
              lastName: userProfile.lastName || '',
              profileImageUrl: userProfile.profileImage,
              zodiacSign: userProfile.zodiacSign || 'ARIES'
            }}
            onClose={() => setShowMatchModal(false)}
            onSendMessage={() => {
              setShowMatchModal(false);
              // Mesajlaşma ekranına yönlendir
            }}
          />
        )}
      </Modal>
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
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 4,
        position: 'relative',
    },
    tabIndicator: {
        position: 'absolute',
        top: 4,
        left: 4,
        width: width / 3 - 16,
        height: 40,
        backgroundColor: 'rgba(128, 0, 255, 0.3)',
        borderRadius: 20,
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
  tabText: {
    fontSize: 14,
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
    zodiacEmoji: {
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
    swipeContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
    listContainer: {
     padding: 20,
   },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  matchAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
        marginRight: 15,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
        marginBottom: 4,
  },
  matchCompatibility: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
  },
  matchDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  deleteButton: {
        padding: 10,
    },
    likesContainer: {
        padding: 20,
  },
  likeCard: {
    flex: 1,
    alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 15,
        padding: 15,
        margin: 5,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  likeAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    marginBottom: 10,
  },
  likeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
        textAlign: 'center',
        marginBottom: 4,
  },
  likeCompatibility: {
        fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginBottom: 2,
    },
    likeZodiac: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
  },
}); 