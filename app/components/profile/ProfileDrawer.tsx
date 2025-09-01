import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import Reanimated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import { useProfile, UserProfile } from '../../context/ProfileContext';
import { getZodiacDisplay, getZodiacEmoji } from '../../types/zodiac';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.88;

type ProfileDrawerProps = {
  visible: boolean;
  onClose: () => void;
  user: UserProfile;
  isLoading?: boolean;
};

export default function ProfileDrawer({ visible, onClose, user, isLoading = false }: ProfileDrawerProps) {
  const colorScheme = useColorScheme();
  const { currentMode, switchMode, logout, isPremium, isLoggedIn, setPremium } = useAuth();
  const { showProfile, isLoading: profileLoading, userProfile } = useProfile();
  const router = useRouter();
  const [isRendered, setIsRendered] = useState(visible);
  
  const slideAnimation = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  
  // Premium animasyon
  const premiumGlow = useSharedValue(0);
  
  // ProfileDrawer her açıldığında güncel verileri getir
  
  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      // Her açılışta profil verilerini güncelle (güncel veri için)
      showProfile();
      
      // Slide ve fade animasyonlarını paralel çalıştır
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start(() => {
        setIsRendered(false);
      });
    }
    
    // Premium glow animasyonu
    if (isPremium && visible) {
      premiumGlow.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    }
  }, [visible, isPremium]);

  const animatedPremiumStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.3 + (premiumGlow.value * 0.5),
    shadowRadius: 10 + (premiumGlow.value * 15),
    transform: [{ scale: 1 + (premiumGlow.value * 0.02) }],
  }));

  if (!isRendered) return null;

  // Mode'a göre tema renkleri
  const getThemeColors = () => {
    if (currentMode === 'music') {
      return {
        primary: '#1DB954',
        secondary: '#1E7E34',
        accent: '#FFD700',
        gradient: ['#1DB954', '#1E7E34', '#145A24'],
        cardBg: 'rgba(29, 185, 84, 0.1)',
        iconBg: 'rgba(29, 185, 84, 0.15)',
      };
    }
    return {
      primary: '#8000FF',
      secondary: '#5B00B5', 
      accent: '#FFFFFF',
      gradient: ['#8000FF', '#5B00B5', '#3D007A'],
      cardBg: 'rgba(128, 0, 255, 0.1)',
      iconBg: 'rgba(128, 0, 255, 0.15)',
    };
  };

  const theme = getThemeColors();

  // Navigation handlers
  const navigateToProfile = () => {
    onClose();
    setTimeout(() => router.push('/profileScreen' as any), 300);
  };

  const handlePremiumPress = () => {
    onClose();
    setTimeout(() => router.push('/(profile)/premiumScreen' as any), 300);
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: () => {
            onClose();
            setTimeout(() => logout(), 300);
          }
        }
      ]
    );
  };

  // Profil içerik renderer
  const renderProfileHeader = () => {
    if (isLoading || profileLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.primary }]}>
            Profil güncelleniyor...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.profileHeader}>
        {/* Avatar */}
        <View style={[styles.avatarContainer, { borderColor: theme.primary }]}>
          <LinearGradient
            colors={theme.gradient as any}
            style={styles.avatarGradient}
          >
            <Image
              source={{ 
                uri: userProfile.profileImage || 'https://via.placeholder.com/120',
                cache: 'reload'
              }}
              key={`profile-${userProfile.profileImage}-${Date.now()}`}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </LinearGradient>
          <View style={styles.onlineIndicator} />
        </View>

        {/* Profil Bilgileri */}
        <Text style={styles.userName}>{userProfile.name}</Text>
        <Text style={styles.userHandle}>@{userProfile.username}</Text>

        {/* Premium Badge */}
        {isPremium && (
          <Reanimated.View style={[styles.premiumBadge, animatedPremiumStyle]}>
            <LinearGradient
              colors={['#FFD700', '#FFA500'] as any}
              style={styles.premiumGradient}
            >
              <Ionicons name="diamond" size={16} color="#FFF" />
              <Text style={styles.premiumText}>PREMIUM</Text>
            </LinearGradient>
          </Reanimated.View>
        )}

        {/* Burç Bilgisi */}
        {(userProfile.zodiacSign || userProfile.zodiacSignTurkish) && (
          <View style={[styles.zodiacCard, { borderColor: theme.primary, backgroundColor: theme.cardBg }]}>
            <Text style={styles.zodiacEmoji}>
              {getZodiacEmoji(userProfile.zodiacSign || '')}
            </Text>
            <Text style={[styles.zodiacName, { color: theme.primary }]}>
              {userProfile.zodiacSign ? getZodiacDisplay(userProfile.zodiacSign) : userProfile.zodiacSignTurkish}
            </Text>
          </View>
        )}

        {/* İstatistikler */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>42</Text>
            <Text style={styles.statLabel}>Eşleşme</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>18</Text>
            <Text style={styles.statLabel}>Beğeni</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>95%</Text>
            <Text style={styles.statLabel}>Uyum</Text>
          </View>
        </View>
      </View>
    );
  };

  // Menu items
  const menuItems = [
    {
      icon: 'person',
      title: 'Profilim',
      color: theme.primary,
      onPress: navigateToProfile,
    },
    {
      icon: 'diamond',
      title: isPremium ? 'Premium Yönetimi' : 'Premium Ol',
      color: '#FFD700',
      onPress: handlePremiumPress,
    },
    {
      icon: 'settings',
      title: 'Ayarlar',
      color: '#9CA3AF',
      onPress: () => {
        onClose();
        setTimeout(() => router.push('/settingsScreen' as any), 300);
      },
    },
    {
      icon: 'notifications',
      title: 'Bildirimler',
      color: '#3B82F6',
      onPress: () => {
        onClose();
        // Notifications handler
      },
    },
    {
      icon: 'help-circle',
      title: 'Yardım',
      color: '#A855F7',
      onPress: () => {
        onClose();
        // Help handler  
      },
    },
  ];

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnimation }]}>
        <TouchableOpacity 
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1} 
          onPress={onClose}
        />
      </Animated.View>
      
      {/* Drawer */}
      <Animated.View 
        style={[
          styles.drawer,
          { transform: [{ translateX: slideAnimation }] }
        ]}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.9)'] as any}
          style={styles.drawerBackground}
        />
        
        <BlurView
          intensity={Platform.OS === 'ios' ? 50 : 80}
          tint="dark"
          style={styles.blurOverlay}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.headerLeft}>
                <View style={[styles.modeIcon, { backgroundColor: theme.primary }]}>
                  <Ionicons 
                    name={currentMode === 'astrology' ? 'planet' : 'musical-notes'} 
                    size={20} 
                    color="white" 
                  />
                </View>
                <Text style={styles.headerTitle}>Profil</Text>
              </View>
              
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            {/* Profil Header */}
            {renderProfileHeader()}
            
            {/* Menu */}
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>Menü</Text>
              
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                    <Ionicons name={item.icon as any} size={22} color={item.color} />
                  </View>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
              <Text style={styles.logoutText}>Çıkış Yap</Text>
            </TouchableOpacity>
            
            <View style={styles.bottomSpace} />
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
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 20,
  },
  drawerBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  blurOverlay: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 0) + 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 32,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    padding: 3,
    marginBottom: 16,
    position: 'relative',
  },
  avatarGradient: {
    flex: 1,
    borderRadius: 57,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 57,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },
  userHandle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 16,
  },
  premiumBadge: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 6,
    letterSpacing: 1,
  },
  zodiacCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    marginBottom: 24,
  },
  zodiacEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  zodiacName: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 4,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  menuSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpace: {
    height: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
}); 