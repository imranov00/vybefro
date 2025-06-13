import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
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
import { useProfile } from '../context/ProfileContext';

// API imports
import { DiscoverUser, Match, swipeApi, userApi } from '../services/api';

// Component imports
import MatchScreen from '../components/match/MatchScreen';

// Swipe components
// @ts-ignore
import { ZodiacSwipeCard } from '../components/swipe/ZodiacSwipeCard';
// @ts-ignore  
import { UserDetailPanel } from '../components/swipe/UserDetailPanel';

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

enum PanelState {
  CLOSED = 0,
  FULL = 1, // HALF durumunu kaldırdık
}

const PANEL_POSITIONS = {
  [PanelState.CLOSED]: LAYOUT_CONSTANTS.panelMaxHeight - LAYOUT_CONSTANTS.panelMinHeight,
  [PanelState.FULL]: 0, // Tam üste çıkar
};

export default function ZodiacSwipeScreen() {
  const router = useRouter();
  const { currentMode, switchMode } = useAuth();
  const { showProfile } = useProfile();
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
  const headerOpacity = useSharedValue(1);
  
  // Kullanıcıları yükle
  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await swipeApi.getDiscoverUsers(1, 20);
      setUsers(response.users);
      
      // Fotoğraf indekslerini başlat
      const initialIndexes: { [key: number]: number } = {};
      response.users.forEach(user => {
        initialIndexes[user.id] = 0;
      });
      setPhotoIndexes(initialIndexes);
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
    setPhotoIndexes(prev => ({
      ...prev,
      [userId]: index
    }));
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
      
      // Hızlı yukarı çekme - tam aç
      if (velocity < -800) {
        targetState = PanelState.FULL;
      } 
      // Hızlı aşağı itme - kapat
      else if (velocity > 800) {
        targetState = PanelState.CLOSED;
      } 
      // Pozisyona göre karar ver - ekranın yarısından yukarıdaysa aç, altındaysa kapat
      else {
        if (currentY < LAYOUT_CONSTANTS.panelMaxHeight * 0.5) {
          targetState = PanelState.FULL;
        } else {
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

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  // Mod değiştirme
  const handleModeSwitch = useCallback(() => {
    const newMode = currentMode === 'astrology' ? 'music' : 'astrology';
    switchMode(newMode);
    if (newMode === 'music') {
      router.push('/music');
    }
  }, [currentMode, switchMode, router]);

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

      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            {/* Sol - Profil ikonu */}
            <TouchableOpacity style={styles.headerButton} onPress={showProfile}>
              <Ionicons name="person-circle-outline" size={28} color="white" />
            </TouchableOpacity>

            {/* Orta - Başlık */}
            <View style={styles.headerTitle}>
              <Text style={styles.headerTitleText}>Burçlar Arası Aşk</Text>
              <Text style={styles.headerSubtitle}>Yıldızların Rehberliği</Text>
            </View>

            {/* Sağ - Mod değiştirme */}
            <TouchableOpacity style={styles.modeButton} onPress={handleModeSwitch}>
              <Ionicons name="musical-notes" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>

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
                  setPhotoIndex={(index: number) => setPhotoIndex(user.id, index)}
                />
              ))}
              
              {/* Üstteki kart (aktif) */}
              <ZodiacSwipeCard
                key={currentUser.id}
                user={currentUser}
                onSwipe={handleSwipe}
                isTop={true}
                photoIndex={currentPhotoIndex}
                setPhotoIndex={(index: number) => setPhotoIndex(currentUser.id, index)}
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: TOTAL_HEADER_HEIGHT,
    zIndex: 100,
  },
  headerBlur: {
    flex: 1,
    paddingTop: LAYOUT_CONSTANTS.statusBarHeight,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  modeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  mainContent: {
    flex: 1,
    paddingTop: TOTAL_HEADER_HEIGHT,
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