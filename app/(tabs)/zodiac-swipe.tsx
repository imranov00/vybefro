import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Context imports
import { useAuth } from '../context/AuthContext';

// API imports
import { DiscoverUser, Match, swipeApi, userApi } from '../services/api';

// Component imports
import MatchScreen from '../components/match/MatchScreen';

// Swipe components
// @ts-ignore
import { ZodiacSwipeCard } from '../components/swipe/ZodiacSwipeCard';
// @ts-ignore  
import { PanelState, UserDetailPanel } from '../components/swipe/UserDetailPanel';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Layout sabitleri
const LAYOUT_CONSTANTS = {
  statusBarHeight: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24,
  headerHeight: 60,
  tabBarHeight: Platform.OS === 'ios' ? 95 : 75,
  panelMaxHeight: screenHeight - (Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24), // Tam ekran yüksekliği
  panelMinHeight: 60,
};

const TOTAL_HEADER_HEIGHT = LAYOUT_CONSTANTS.headerHeight + LAYOUT_CONSTANTS.statusBarHeight;

const PANEL_POSITIONS = {
  [PanelState.CLOSED]: LAYOUT_CONSTANTS.panelMaxHeight - LAYOUT_CONSTANTS.panelMinHeight,
  [PanelState.HALF]: LAYOUT_CONSTANTS.panelMaxHeight * 0.5, // %50 açık
  [PanelState.FULL]: LAYOUT_CONSTANTS.panelMaxHeight * 0.1, // %90 açık (üstten %10 boşluk)
};

export default function ZodiacSwipeScreen() {
  const router = useRouter();
  const { currentMode, switchMode } = useAuth();
  const insets = useSafeAreaInsets();
  
  // State
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [photoIndexes, setPhotoIndexes] = useState<{ [key: number]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showMatchScreen, setShowMatchScreen] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [panelState, setPanelState] = useState<PanelState>(PanelState.CLOSED);
  
  // Animation values
  const panelTranslateY = useSharedValue(PANEL_POSITIONS[PanelState.CLOSED]);
  
  // Kullanıcıları yükle
  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await swipeApi.getDiscoverUsers(1, 20);
      setUsers(response.users);
      
      console.log('👥 [ZodiacSwipe] Kullanıcılar yüklendi:', response.users.length);
      
      // Fotoğraf verilerini kontrol et
      response.users.forEach((user, index) => {
        console.log(`📸 [ZodiacSwipe] Kullanıcı ${index + 1} (${user.firstName}):`, {
          id: user.id,
          profileImageUrl: user.profileImageUrl,
          photosCount: user.photos?.length || 0,
          photos: user.photos
        });
      });
      
      // Fotoğraf indekslerini başlat
      const initialIndexes: { [key: number]: number } = {};
      response.users.forEach(user => {
        initialIndexes[user.id] = 0;
      });
      setPhotoIndexes(initialIndexes);
      
      console.log('📸 [ZodiacSwipe] Başlangıç fotoğraf indeksleri:', initialIndexes);
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

  // Swipe işlemi
  const handleSwipe = useCallback(async (direction: 'left' | 'right' | 'up', userId: number) => {
    try {
      const action = direction === 'right' || direction === 'up' ? 'LIKE' : 'DISLIKE';
      
      const response = await swipeApi.swipe({
        targetUserId: userId.toString(),
        action
      });

      if (response.isMatch && response.matchId) {
        // Eşleşme var - match screen göster
        const matchedUser = users.find(u => u.id === userId);
        if (matchedUser && currentUserProfile) {
          const matchData: Match = {
            id: parseInt(response.matchId),
            matchedUser: {
              id: matchedUser.id,
              username: matchedUser.firstName,
              firstName: matchedUser.firstName,
              lastName: matchedUser.lastName || '',
              age: matchedUser.age,
              profileImageUrl: matchedUser.profileImageUrl,
              zodiacSign: matchedUser.zodiacSign,
            },
            compatibilityScore: matchedUser.compatibilityScore,
            compatibilityDescription: matchedUser.compatibilityDescription,
            matchType: 'ZODIAC',
            matchedAt: new Date().toISOString(),
          };
          
          setCurrentMatch(matchData);
          setShowMatchScreen(true);
        }
      }

      // Sonraki kullanıcıya geç
      setCurrentUserIndex(prev => prev + 1);
      
      // Kullanıcılar biterse daha fazla yükle
      if (currentUserIndex >= users.length - 3) {
        loadUsers();
      }
    } catch (error) {
      console.error('Swipe hatası:', error);
      // Hata olsa da sonraki kullanıcıya geç
      setCurrentUserIndex(prev => prev + 1);
    }
  }, [users, currentUserIndex, currentUserProfile, loadUsers]);

  // Fotoğraf indeksi güncelle
  const setPhotoIndex = useCallback((userId: number, index: number) => {
    console.log('📸 [ZodiacSwipe] Fotoğraf indeksi güncelleniyor:', { userId, index });
    
    setPhotoIndexes(prev => {
      const newIndexes = {
        ...prev,
        [userId]: index
      };
      console.log('📸 [ZodiacSwipe] Yeni fotoğraf indeksleri:', newIndexes);
      return newIndexes;
    });
  }, []);

  // Panel gesture handler
  const panelGestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      'worklet';
    },
    onActive: (event) => {
      'worklet';
      const newTranslateY = Math.max(
        PANEL_POSITIONS[PanelState.FULL],
        Math.min(
          PANEL_POSITIONS[PanelState.CLOSED],
          event.translationY + PANEL_POSITIONS[panelState]
        )
      );
      panelTranslateY.value = newTranslateY;
    },
    onEnd: (event) => {
      'worklet';
      const velocity = event.velocityY;
      const currentY = panelTranslateY.value;
      
      let targetState = PanelState.CLOSED;
      
      // Hızlı yukarı çekme - direkt tam aç
      if (velocity < -1200) {
        targetState = PanelState.FULL;
      } 
      // Hızlı aşağı itme - kapat
      else if (velocity > 1200) {
        targetState = PanelState.CLOSED;
      } 
      // Pozisyona göre karar ver - 3 seviyeli sistem
      else {
        const panelHeight = LAYOUT_CONSTANTS.panelMaxHeight;
        const currentPosition = currentY / panelHeight;
        
        if (currentPosition < 0.25) {
          // Üst %25'te - tam aç
          targetState = PanelState.FULL;
        } else if (currentPosition < 0.65) {
          // Orta bölge - yarım aç
          targetState = PanelState.HALF;
        } else {
          // Alt bölge - kapat
          targetState = PanelState.CLOSED;
        }
      }
      
      panelTranslateY.value = withSpring(PANEL_POSITIONS[targetState], {
        damping: 20,
        stiffness: 300,
      });
      
      runOnJS(setPanelState)(targetState);
    },
  });

  // Animated styles
  const panelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: panelTranslateY.value }],
  }));

  // Match screen kapatma
  const handleCloseMatch = useCallback(() => {
    setShowMatchScreen(false);
    setCurrentMatch(null);
  }, []);

  const handleSendMessage = useCallback(() => {
    // Mesajlaşma özelliği henüz yok
    console.log('Mesaj gönder:', currentMatch?.matchedUser.firstName);
    handleCloseMatch();
  }, [currentMatch, handleCloseMatch]);

  // Mevcut kullanıcı
  const currentUser = users[currentUserIndex];
  const currentPhotoIndex = currentUser ? photoIndexes[currentUser.id] || 0 : 0;

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
        {/* Swipe kartları */}
        <View style={styles.cardsContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Yıldızlar Hizalanıyor...</Text>
            </View>
          ) : currentUser ? (
            <>
              {/* Sonraki kartlar (stack efekti) */}
              {users.slice(currentUserIndex + 1, currentUserIndex + 3).map((user, index: number) => (
                <ZodiacSwipeCard
                  key={user.id}
                  user={user}
                  onSwipe={handleSwipe}
                  isTop={false}
                  style={[
                    styles.stackCard,
                    {
                      transform: [
                        { scale: 1 - (index + 1) * 0.05 },
                        { translateY: (index + 1) * 10 },
                      ],
                      opacity: 1 - (index + 1) * 0.3,
                    }
                  ]}
                  photoIndex={photoIndexes[user.id] || 0}
                  setPhotoIndex={setPhotoIndex}
                />
              ))}
              
              {/* Üstteki kart (aktif) */}
              <ZodiacSwipeCard
                key={currentUser.id}
                user={currentUser}
                onSwipe={handleSwipe}
                isTop={true}
                photoIndex={currentPhotoIndex}
                setPhotoIndex={setPhotoIndex}
              />
            </>
          ) : (
            <View style={styles.noUsersContainer}>
              <Text style={styles.noUsersText}>Şimdilik bu kadar!</Text>
              <Text style={styles.noUsersSubtext}>Yeni kullanıcılar için daha sonra tekrar gel</Text>
            </View>
          )}
        </View>
      </View>

      {/* Alt panel */}
      <PanGestureHandler onGestureEvent={panelGestureHandler}>
        <Animated.View style={[styles.bottomPanel, panelAnimatedStyle]}>
          <UserDetailPanel 
            user={currentUser}
            panelState={panelState}
            onClose={() => {
              panelTranslateY.value = withSpring(PANEL_POSITIONS[PanelState.CLOSED]);
              setPanelState(PanelState.CLOSED);
            }}
            onPanelStateChange={(newState: PanelState) => {
              panelTranslateY.value = withSpring(PANEL_POSITIONS[newState], {
                damping: 20,
                stiffness: 300,
              });
              setPanelState(newState);
            }}
          />
        </Animated.View>
      </PanGestureHandler>

      {/* Match Screen */}
      {showMatchScreen && currentMatch && currentUserProfile && (
        <MatchScreen
          match={currentMatch}
          currentUser={currentUserProfile}
          onClose={handleCloseMatch}
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
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stackCard: {
    position: 'absolute',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  noUsersContainer: {
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
  bottomPanel: {
    position: 'absolute',
    bottom: LAYOUT_CONSTANTS.tabBarHeight,
    left: 0,
    right: 0,
    height: LAYOUT_CONSTANTS.panelMaxHeight,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
      android: {
        elevation: 15,
      },
    }),
  },
}); 