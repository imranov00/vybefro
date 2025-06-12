import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
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
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../context/ProfileContext';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.85;

type ProfileDrawerProps = {
  visible: boolean;
  onClose: () => void;
  user: UserProfile;
  isLoading?: boolean;
};

export default function ProfileDrawer({ visible, onClose, user, isLoading = false }: ProfileDrawerProps) {
  const colorScheme = useColorScheme();
  const { currentMode, switchMode, logout } = useAuth();
  const isDark = colorScheme === 'dark';
  const animation = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const [isRendered, setIsRendered] = useState(visible);
  const router = useRouter();
  
  useEffect(() => {
    if (visible) {
      setIsRendered(true);
    }
    
    Animated.timing(animation, {
      toValue: visible ? 0 : DRAWER_WIDTH,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      if (!visible) {
        setIsRendered(false);
      }
    });
  }, [visible, animation]);

  if (!isRendered) {
    return null;
  }

  // Mode'a göre renkler
  const getThemeColors = () => {
    if (currentMode === 'music') {
      return {
        gradient: ['#1DB954', '#1E7E34', '#145A24'],
        accent: '#1DB954',
        secondary: '#FFD700',
        light: 'rgba(29, 185, 84, 0.1)',
        border: 'rgba(255, 215, 0, 0.3)'
      };
    } else {
      return {
        gradient: ['#8000FF', '#5B00B5', '#3D007A'],
        accent: '#8000FF',
        secondary: '#FFFFFF',
        light: 'rgba(128, 0, 255, 0.1)',
        border: 'rgba(255, 255, 255, 0.3)'
      };
    }
  };

  const themeColors = getThemeColors();

  // Profil ekranına yönlendir - mode'a göre doğru ekrana yönlendir
  const navigateToProfile = () => {
    onClose();
    setTimeout(() => {
      router.push('/profileScreen' as any);
    }, 300);
  };

  // Çıkış yap
  const handleLogout = () => {
    onClose();
    setTimeout(() => {
      logout();
    }, 300);
  };

  // Profil fotoğrafı ve bilgileri görünümü
  const renderProfileContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.accent} />
          <Text style={[styles.loadingText, { color: themeColors.accent }]}>
            Profil yükleniyor...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.profileSection}>
        {/* Profil Avatar */}
        <View style={[styles.avatarContainer, { borderColor: themeColors.accent }]}>
          <View
            style={[styles.avatarGradient, { backgroundColor: themeColors.accent }]}
          >
            <Image
              source={{ uri: user.profileImage || 'https://via.placeholder.com/120' }}
              style={styles.profileImage}
            />
          </View>
          
          {/* Online Status */}
          <View style={[styles.onlineStatus, { backgroundColor: '#4CAF50' }]} />
        </View>
        
        {/* Profil Bilgileri */}
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profileUsername}>@{user.username}</Text>
        
        {/* Burç Bilgisi */}
        {(user.zodiacSign || user.zodiacSignTurkish) && (
          <View style={[styles.zodiacBadge, { backgroundColor: themeColors.light, borderColor: themeColors.accent }]}>
            <Ionicons name="planet" size={16} color={themeColors.accent} />
            <Text style={[styles.zodiacText, { color: themeColors.accent }]}>
              {user.zodiacSignTurkish || user.zodiacSign || 'Burç Belirtilmemiş'}
            </Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>42</Text>
            <Text style={styles.statLabel}>Eşleşmeler</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>18</Text>
            <Text style={styles.statLabel}>Beğeniler</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>95%</Text>
            <Text style={styles.statLabel}>Uyumluluk</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Karartılmış arka plan */}
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose}
      />
      
      {/* Drawer paneli */}
      <Animated.View 
        style={[
          styles.drawer,
          { transform: [{ translateX: animation }] }
        ]}
      >
        {/* Arka plan gradyanı */}
        <View
          style={[styles.drawerGradient, { backgroundColor: themeColors.accent }]}
        />
        
        <BlurView
          intensity={Platform.OS === 'ios' ? 40 : 80}
          tint="dark"
          style={styles.blurContainer}
        >
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
            {/* Header */}
            <View style={styles.headerContainer}>
              <View style={styles.headerLeft}>
                <View style={[styles.modeIndicator, { backgroundColor: themeColors.accent }]}>
                  <Ionicons 
                    name={currentMode === 'astrology' ? 'planet' : 'musical-notes'} 
                    size={18} 
                    color="white" 
                  />
                </View>
                <Text style={styles.headerTitle}>Profil</Text>
              </View>
              
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={26} color="white" />
              </TouchableOpacity>
            </View>
            
            {/* Profil İçeriği */}
            {renderProfileContent()}
            
            {/* Menü Seçenekleri */}
            <View style={styles.menuContainer}>
              <Text style={styles.sectionTitle}>Menü</Text>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={navigateToProfile}
              >
                <View style={[styles.menuIcon, { backgroundColor: `${themeColors.accent}20` }]}>
                  <Ionicons name="person-outline" size={20} color={themeColors.accent} />
                </View>
                <Text style={styles.menuText}>Profili Düzenle</Text>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  router.push('/settingsScreen' as any);
                }}
              >
                <View style={[styles.menuIcon, { backgroundColor: `${themeColors.accent}20` }]}>
                  <Ionicons name="settings-outline" size={20} color={themeColors.accent} />
                </View>
                <Text style={styles.menuText}>Ayarlar</Text>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  // Notifications page
                }}
              >
                <View style={[styles.menuIcon, { backgroundColor: `${themeColors.accent}20` }]}>
                  <Ionicons name="notifications-outline" size={20} color={themeColors.accent} />
                </View>
                <Text style={styles.menuText}>Bildirimler</Text>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  // Privacy page
                }}
              >
                <View style={[styles.menuIcon, { backgroundColor: `${themeColors.accent}20` }]}>
                  <Ionicons name="shield-outline" size={20} color={themeColors.accent} />
                </View>
                <Text style={styles.menuText}>Gizlilik</Text>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  // Help page
                }}
              >
                <View style={[styles.menuIcon, { backgroundColor: `${themeColors.accent}20` }]}>
                  <Ionicons name="help-circle-outline" size={20} color={themeColors.accent} />
                </View>
                <Text style={styles.menuText}>Yardım</Text>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>
            
            {/* Çıkış */}
            <View style={styles.logoutContainer}>
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
                <Text style={styles.logoutText}>Çıkış Yap</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </BlurView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: DRAWER_WIDTH,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: -5,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
  },
  drawerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blurContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileSection: {
    alignItems: 'center',
    padding: 25,
    paddingBottom: 30,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    padding: 3,
    marginBottom: 20,
    position: 'relative',
  },
  avatarGradient: {
    flex: 1,
    borderRadius: 57,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 57,
  },
  onlineStatus: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  profileUsername: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 15,
  },
  zodiacBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  zodiacText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statDivider: {
    width: 1,
    height: 30,
    opacity: 0.3,
  },
  menuContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  logoutContainer: {
    padding: 20,
    paddingTop: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: 10,
  },
  bottomSpacer: {
    height: 30,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
  },
}); 