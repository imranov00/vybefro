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
import {
  useSharedValue
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Context imports
import { useAuth } from '../context/AuthContext';

// API imports
import { DiscoverUser, Match, swipeApi, userApi } from '../services/api';

// Component imports

// Swipe components
// @ts-ignore  
import { PanelState } from '../components/swipe/UserDetailPanel';

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

  // Mevcut kullanıcı
  const currentUser = users[currentUserIndex];
  const currentPhotoIndex = currentUser ? photoIndexes[currentUser.id] || 0 : 0;
  const currentPhoto = currentUser && currentUser.photos && currentUser.photos.length > 0
    ? currentUser.photos[currentPhotoIndex]?.imageUrl || currentUser.profileImageUrl || 'https://picsum.photos/400/600'
    : currentUser?.profileImageUrl || 'https://picsum.photos/400/600';

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
        <View style={styles.cardsContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Yıldızlar Hizalanıyor...</Text>
            </View>
          ) : currentUser ? (
            <View style={styles.simpleCard}>
              <View style={styles.photoArea}>
                <Image
                  source={{ uri: currentPhoto }}
                  style={styles.photo}
                  resizeMode="cover"
                />
                {currentUser.photos && currentUser.photos.length > 1 && (
                  <View style={styles.photoNavRow}>
                    <TouchableOpacity
                      style={styles.photoNavButton}
                      onPress={() => setPhotoIndex(currentUser.id, (currentPhotoIndex - 1 + currentUser.photos.length) % currentUser.photos.length)}
                    >
                      <Text style={styles.photoNavText}>{'<'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.photoNavText}>{`${currentPhotoIndex + 1} / ${currentUser.photos.length}`}</Text>
                    <TouchableOpacity
                      style={styles.photoNavButton}
                      onPress={() => setPhotoIndex(currentUser.id, (currentPhotoIndex + 1) % currentUser.photos.length)}
                    >
                      <Text style={styles.photoNavText}>{'>'}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <View style={styles.infoArea}>
                <Text style={styles.userName}>{currentUser.firstName} {currentUser.lastName}, {currentUser.age}</Text>
                <Text style={styles.userZodiac}>{currentUser.zodiacSign}</Text>
                <Text style={styles.userBio} numberOfLines={2}>{currentUser.bio}</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setCurrentUserIndex((currentUserIndex - 1 + users.length) % users.length)}
                  disabled={users.length <= 1}
                >
                  <Text style={styles.actionButtonText}>Önceki</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setCurrentUserIndex((currentUserIndex + 1) % users.length)}
                  disabled={users.length <= 1}
                >
                  <Text style={styles.actionButtonText}>Sonraki</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.noUsersContainer}>
              <Text style={styles.noUsersText}>Şimdilik bu kadar!</Text>
              <Text style={styles.noUsersSubtext}>Yeni kullanıcılar için daha sonra tekrar gel</Text>
            </View>
          )}
        </View>
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
  simpleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  photoArea: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  photoNavRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  photoNavButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
  },
  photoNavText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  infoArea: {
    marginTop: 20,
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userZodiac: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  userBio: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  cardActions: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});  