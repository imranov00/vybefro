import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SwipeCard } from '../../components/swipe/SwipeCard';
import UserDetailPanel from '../components/swipe/UserDetailPanel';
import { DiscoverResponse, DiscoverUser, swipeApi } from '../services/api';
import { getToken } from '../utils/tokenStorage';

const { width, height } = Dimensions.get('window');

enum PanelState {
  CLOSED = 0,
  HALF = 1,
  FULL = 2,
}

export default function AstrologySwipeScreen() {
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [panelState, setPanelState] = useState<PanelState>(PanelState.CLOSED);
  const [swipeCount, setSwipeCount] = useState(0);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Kullanıcılar yükleniyor...');
      
      const token = await getToken();
      if (!token) {
        Alert.alert('Oturum Hatası', 'Lütfen önce giriş yapın.');
        return;
      }

      try {
        const response: DiscoverResponse = await swipeApi.getDiscoverUsers(1, 10);
        
        if (response.success && response.users && response.users.length > 0) {
          console.log('✅ Kullanıcılar yüklendi:', response.users.length);
          setUsers(response.users);
        } else {
          console.log('⚠️ Discover API den kullanıcı bulunamadı, fallback deneniyor...');
          await loadFallbackUsers();
        }
      } catch (error: any) {
        console.log('❌ Discover API hatası, fallback deneniyor...');
        await loadFallbackUsers();
      }
    } catch (error: any) {
      console.error('❌ Kullanıcı yükleme hatası:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackUsers = async () => {
    try {
      let response = null;
      let apiSuccess = false;
      
      try {
        response = await swipeApi.getPotentialMatches(1, 10);
        apiSuccess = true;
      } catch (error: any) {
        try {
          response = await swipeApi.getAllUsers(1, 10);
          apiSuccess = true;
        } catch (error2: any) {
          console.log('❌ Tüm API ler başarısız');
        }
      }

      if (apiSuccess && response?.users && response.users.length > 0) {
        const convertedUsers: DiscoverUser[] = response.users.map((user: any) => ({
          id: user.id,
          firstName: user.firstName || 'İsimsiz',
          lastName: user.lastName || 'Kullanıcı',
          age: user.age || 25,
          zodiacSign: user.zodiacSign || 'ARIES',
          profileImageUrl: user.profileImageUrl || 'https://picsum.photos/400/600',
          photos: user.photos?.map((url: string) => ({ imageUrl: url })) || [],
          compatibilityScore: user.compatibilityScore || 75,
          compatibilityDescription: user.compatibilityDescription || 'Uyumlu bir eşleşme!',
          isOnline: user.isOnline || false,
          distance: user.distance,
          bio: user.bio || '',
          isVerified: user.isVerified || false,
          isPremium: user.isPremium || false,
          isNewUser: user.isNewUser || false
        }));

        setUsers(convertedUsers);
        console.log('✅ Fallback kullanıcıları yüklendi:', convertedUsers.length);
      } else {
        console.log('⚠️ Hiç kullanıcı bulunamadı');
        setUsers([]);
      }
    } catch (error) {
      console.error('❌ Fallback yükleme hatası:', error);
      setUsers([]);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right', userId: number) => {
    try {
      const action = direction === 'right' ? 'LIKE' : 'DISLIKE';
      console.log(`🔄 Swipe işlemi: ${action} - User ID: ${userId}`);
      
      const response = await swipeApi.swipe({
        targetUserId: userId.toString(),
        action: action
      });

      if (response.isMatch && direction === 'right') {
        const user = users[current];
        Alert.alert(
          '🎉 Eşleştiniz!',
          `${user?.firstName} ile eşleştiniz! %${user?.compatibilityScore} uyumluluğunuz var.`,
          [{ text: 'Harika!', style: 'default' }]
        );
      }

      // Sonraki kullanıcıya geç
      setCurrent(prev => prev + 1);
      setSwipeCount(prev => prev + 1);
      setPanelState(PanelState.CLOSED);

      console.log('✅ Swipe başarılı');
    } catch (error: any) {
      console.error('❌ Swipe hatası:', error);
      Alert.alert('Hata', 'Swipe işlemi başarısız oldu.');
    }
  };

  const handleCardTap = () => {
    setPanelState(prev => 
      prev === PanelState.CLOSED ? PanelState.HALF : 
      prev === PanelState.HALF ? PanelState.FULL : PanelState.CLOSED
    );
  };

  const handlePanelClose = () => {
    setPanelState(PanelState.CLOSED);
  };

  const currentUser = users[current];

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.background} />
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#8000FF" />
          <Text style={styles.loadingText}>Yıldızlar hizalanıyor...</Text>
        </View>
      </View>
    );
  }

  if (!currentUser || current >= users.length) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.background} />
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.centered}>
          <Text style={styles.noUserEmoji}>✨</Text>
          <Text style={styles.noUserTitle}>Tüm Kartları Gördünüz!</Text>
          <Text style={styles.noUserSubtitle}>
            {swipeCount} kişiyi değerlendirdiniz.{'\n'}
            Yakında yeni profiller ekleyeceğiz.
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadUsers}>
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.refreshButtonText}>Yenile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.background} />
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Burç Swipe</Text>
        <Text style={styles.headerSubtitle}>Yıldızların Rehberliğinde Aşkı Keşfet</Text>
      </View>

      {/* Swipe Card Area */}
      <View style={styles.cardArea}>
        <TouchableOpacity 
          style={styles.cardContainer} 
          onPress={handleCardTap}
          activeOpacity={0.95}
        >
          <SwipeCard 
            user={currentUser} 
            onSwipe={handleSwipe}
            style={styles.swipeCard}
          />
        </TouchableOpacity>
      </View>

      {/* User Detail Panel */}
      <View style={[
        styles.detailArea,
        panelState === PanelState.FULL && styles.detailAreaFull,
        panelState === PanelState.HALF && styles.detailAreaHalf,
        panelState === PanelState.CLOSED && styles.detailAreaClosed
      ]}>
        <UserDetailPanel 
          user={currentUser} 
          panelState={panelState}
          onClose={handlePanelClose}
          onPanelStateChange={setPanelState}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.footerStats}>
            <Ionicons name="heart" size={16} color="#FF6B6B" />
            <Text style={styles.footerText}>{swipeCount} Swipe</Text>
          </View>
          <View style={styles.footerDivider} />
          <View style={styles.footerStats}>
            <Ionicons name="people" size={16} color="#4ECDC4" />
            <Text style={styles.footerText}>{users.length - current} Kalan</Text>
          </View>
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
    width: width,
    height: height + (StatusBar.currentHeight || 0),
    top: -(StatusBar.currentHeight || 0),
  },
  header: {
    paddingTop: (StatusBar.currentHeight || 0) + 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  cardArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeCard: {
    width: width * 0.9,
    height: width * 1.2,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
     detailArea: {
     position: 'absolute',
     bottom: 60,
     left: 0,
     right: 0,
     backgroundColor: 'rgba(26, 26, 46, 0.95)',
     borderTopLeftRadius: 20,
     borderTopRightRadius: 20,
   },
  detailAreaClosed: {
    height: 80,
  },
  detailAreaHalf: {
    height: height * 0.4,
  },
  detailAreaFull: {
    height: height * 0.7,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(15, 52, 96, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  footerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  footerDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  noUserEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  noUserTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  noUserSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(128, 0, 255, 0.3)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 