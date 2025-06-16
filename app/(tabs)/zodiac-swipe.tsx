import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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
import Swiper from 'react-native-deck-swiper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Context imports
import { useAuth } from '../context/AuthContext';

// API imports
import { DiscoverUser, Match, swipeApi, userApi } from '../services/api';

// Component imports
import MatchScreen from '../components/match/MatchScreen';
import UserDetailPanel, { PanelState } from '../components/swipe/UserDetailPanel';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Layout sabitleri
const LAYOUT_CONSTANTS = {
  statusBarHeight: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24,
  headerHeight: 60,
  tabBarHeight: Platform.OS === 'ios' ? 95 : 75,
  cardWidth: screenWidth * 0.9,
  cardHeight: screenHeight * 0.7,
};

export default function ZodiacSwipeScreen() {
  const router = useRouter();
  const { currentMode, switchMode } = useAuth();
  const insets = useSafeAreaInsets();
  
  // State
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showMatchScreen, setShowMatchScreen] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [panelState, setPanelState] = useState<PanelState>(PanelState.CLOSED);
  const [selectedUser, setSelectedUser] = useState<DiscoverUser | null>(null);
  
  // Swiper ref
  const swiperRef = React.useRef<any>(null);

  // Kullanıcıları yükle
  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await swipeApi.getDiscoverUsers(1, 20);
      setUsers(response.users);
      console.log('👥 [ZodiacSwipe] Kullanıcılar yüklendi:', response.users.length);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Kullanıcı profilini yükle
  const loadCurrentUserProfile = useCallback(async () => {
    try {
      const profile = await userApi.getProfile();
      setCurrentUserProfile(profile);
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadCurrentUserProfile();
  }, [loadUsers, loadCurrentUserProfile]);

  // Swipe işlemleri
  const handleSwipeLeft = async (index: number) => {
    const swipedUser = users[index];
    console.log('👈 Sola swipe:', swipedUser.firstName);
    try {
      await swipeApi.swipe({
        targetUserId: swipedUser.id.toString(),
        action: 'DISLIKE'
      });
    } catch (error) {
      console.error('Dislike gönderilirken hata:', error);
    }
  };

  const handleSwipeRight = async (index: number) => {
    const swipedUser = users[index];
    console.log('👉 Sağa swipe:', swipedUser.firstName);
    try {
      const response = await swipeApi.swipe({
        targetUserId: swipedUser.id.toString(),
        action: 'LIKE'
      });
      
      if (response.isMatch) {
        setCurrentMatch({
          id: Number(response.matchId),
          matchedUser: {
            id: swipedUser.id,
            username: swipedUser.firstName.toLowerCase() + swipedUser.lastName.toLowerCase(),
            firstName: swipedUser.firstName,
            lastName: swipedUser.lastName,
            age: swipedUser.age,
            profileImageUrl: swipedUser.profileImageUrl,
            zodiacSign: swipedUser.zodiacSign
          },
          compatibilityScore: swipedUser.compatibilityScore,
          compatibilityDescription: swipedUser.compatibilityDescription || '',
          matchType: 'ZODIAC',
          matchedAt: new Date().toISOString()
        });
        setShowMatchScreen(true);
      }
    } catch (error) {
      console.error('Like gönderilirken hata:', error);
    }
  };

  const handleCardPress = (index: number) => {
    setSelectedUser(users[index]);
    setPanelState(PanelState.HALF);
  };

  const handleClosePanel = () => {
    setPanelState(PanelState.CLOSED);
    setSelectedUser(null);
  };

  const handleSendMessage = () => {
    if (currentMatch) {
      // Mesajlaşma ekranına git
      router.push('/(app)');
    }
    setShowMatchScreen(false);
  };

  const renderCard = (user: DiscoverUser) => {
    if (!user) return null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleCardPress(users.indexOf(user))}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: user.profileImageUrl || 'https://picsum.photos/400/600' }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.cardGradient}
        >
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{user.firstName}, {user.age}</Text>
            <Text style={styles.cardZodiac}>{user.zodiacSign}</Text>
            <Text style={styles.cardBio} numberOfLines={2}>{user.bio}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Arka plan gradyan */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.background}
      />

      {/* Ana içerik alanı */}
      <View style={styles.mainContent}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Yıldızlar Hizalanıyor...</Text>
          </View>
        ) : users.length > 0 ? (
          <Swiper
            ref={swiperRef}
            cards={users}
            renderCard={renderCard}
            onSwipedLeft={handleSwipeLeft}
            onSwipedRight={handleSwipeRight}
            cardIndex={0}
            backgroundColor="transparent"
            stackSize={3}
            stackSeparation={15}
            animateOverlayLabelsOpacity
            overlayLabels={{
              left: {
                title: 'PAS',
                style: {
                  label: {
                    backgroundColor: '#FF6B9D',
                    color: 'white',
                    fontSize: 24,
                    borderRadius: 10,
                    padding: 10,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                    marginTop: 30,
                    marginLeft: -30,
                  },
                },
              },
              right: {
                title: 'BEĞEN',
                style: {
                  label: {
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    fontSize: 24,
                    borderRadius: 10,
                    padding: 10,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 30,
                    marginLeft: 30,
                  },
                },
              },
            }}
            cardStyle={styles.swiperCard}
          />
        ) : (
          <View style={styles.noUsersContainer}>
            <Text style={styles.noUsersText}>Şimdilik bu kadar!</Text>
            <Text style={styles.noUsersSubtext}>Yeni kullanıcılar için daha sonra tekrar gel</Text>
          </View>
        )}
      </View>

      {/* Detay Paneli */}
      <UserDetailPanel
        user={selectedUser || undefined}
        panelState={panelState}
        onClose={handleClosePanel}
        onPanelStateChange={setPanelState}
      />

      {/* Eşleşme Ekranı */}
      {showMatchScreen && currentMatch && currentUserProfile && (
        <MatchScreen
          match={currentMatch}
          currentUser={currentUserProfile}
          onClose={() => setShowMatchScreen(false)}
          onSendMessage={handleSendMessage}
        />
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
    width: screenWidth,
    height: screenHeight,
  },
  mainContent: {
    flex: 1,
    paddingTop: LAYOUT_CONSTANTS.statusBarHeight,
    paddingBottom: LAYOUT_CONSTANTS.tabBarHeight,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  noUsersContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noUsersText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  noUsersSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  swiperCard: {
    width: LAYOUT_CONSTANTS.cardWidth,
    height: LAYOUT_CONSTANTS.cardHeight,
    borderRadius: 20,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  card: {
    width: LAYOUT_CONSTANTS.cardWidth,
    height: LAYOUT_CONSTANTS.cardHeight,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    padding: 20,
    justifyContent: 'flex-end',
  },
  cardInfo: {
    marginBottom: 20,
  },
  cardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  cardZodiac: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  cardBio: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
  },
}); 