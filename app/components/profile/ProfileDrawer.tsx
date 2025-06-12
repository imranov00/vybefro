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
import ReanimatedAnimated, {
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
  const { fetchUserProfile } = useProfile();
  const router = useRouter();
  const [purchasingPremium, setPurchasingPremium] = useState(false);
  const animation = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const [isRendered, setIsRendered] = useState(visible);
  
  // Animasyon değerleri
  const premiumGlow = useSharedValue(0);
  const premiumScale = useSharedValue(1);
  const sparkleAnimation = useSharedValue(0);
  
  // Sadece login durumu değiştiğinde profil bilgilerini yenile
  useEffect(() => {
    if (isLoggedIn && visible) {
      fetchUserProfile();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
    }
    
    Animated.timing(animation, {
      toValue: visible ? 0 : DRAWER_WIDTH,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      if (!visible) {
        setIsRendered(false);
      }
    });
    
    // Premium animasyonları
    if (isPremium) {
      premiumGlow.value = withRepeat(
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
      
      premiumScale.value = withRepeat(
        withTiming(1.03, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );

      sparkleAnimation.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [visible, animation, isPremium]);

  const animatedPremiumStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: 0.5 + (premiumGlow.value * 0.3),
      shadowRadius: 12 + (premiumGlow.value * 8),
      transform: [{ scale: premiumScale.value }],
    };
  });

  const sparkleStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.6 + (sparkleAnimation.value * 0.4),
      transform: [
        { rotate: `${sparkleAnimation.value * 360}deg` },
        { scale: 0.8 + (sparkleAnimation.value * 0.4) }
      ],
    };
  });

  if (!isRendered) {
    return null;
  }

  // Mode'a göre tema renkleri
  const getThemeColors = () => {
    if (currentMode === 'music') {
      return {
        gradient: ['#1DB954', '#1E7E34', '#0D4F1C'],
        accent: '#1DB954',
        secondary: '#FFD700',
        light: 'rgba(29, 185, 84, 0.15)',
        border: 'rgba(255, 215, 0, 0.4)',
        overlay: 'rgba(29, 185, 84, 0.9)'
      };
    } else {
      return {
        gradient: ['#8000FF', '#5B00B5', '#3D007A'],
        accent: '#8000FF',
        secondary: '#FFFFFF',
        light: 'rgba(128, 0, 255, 0.15)',
        border: 'rgba(255, 255, 255, 0.4)',
        overlay: 'rgba(128, 0, 255, 0.9)'
      };
    }
  };

  const themeColors = getThemeColors();

  // Navigation fonksiyonları
  const navigateToProfile = () => {
    onClose();
    setTimeout(() => {
      router.push('/profileScreen' as any);
    }, 300);
  };

  const handleLogout = () => {
    Alert.alert(
      '🚪 Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: () => {
            onClose();
            setTimeout(() => {
              logout();
            }, 300);
          }
        }
      ]
    );
  };

  const handlePremiumPurchase = async () => {
    onClose();
    setTimeout(() => {
      router.push('/(profile)/premiumScreen' as any);
    }, 300);
  };

  // Profil içerik renderer
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
        {/* Profil Header */}
        <View style={styles.profileHeader}>
          {/* Avatar Container */}
          <View style={[styles.avatarContainer, { 
            shadowColor: themeColors.accent,
            shadowOpacity: 0.4,
            shadowRadius: 15,
            elevation: 10
          }]}>
            <LinearGradient
              colors={[themeColors.accent, `${themeColors.accent}80`]}
              style={styles.avatarGradient}
            >
              <Image
                source={{ uri: user.profileImage || 'https://via.placeholder.com/120' }}
                style={styles.profileImage}
              />
              {/* Online Status */}
              <View style={styles.onlineStatus}>
                <View style={styles.onlineIndicator} />
              </View>
            </LinearGradient>
            
            {/* Sparkle Efektleri */}
            {isPremium && (
              <>
                <ReanimatedAnimated.View style={[styles.sparkle, styles.sparkle1, sparkleStyle]}>
                  <Ionicons name="diamond" size={12} color="#FFD700" />
                </ReanimatedAnimated.View>
                <ReanimatedAnimated.View style={[styles.sparkle, styles.sparkle2, sparkleStyle]}>
                  <Ionicons name="star" size={10} color="#FFF" />
                </ReanimatedAnimated.View>
                <ReanimatedAnimated.View style={[styles.sparkle, styles.sparkle3, sparkleStyle]}>
                  <Ionicons name="diamond" size={8} color="#FFD700" />
                </ReanimatedAnimated.View>
              </>
            )}
          </View>
          
          {/* Profil Bilgileri */}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileUsername}>@{user.username}</Text>
            
            {/* Burç Badge */}
            {(user.zodiacSign || user.zodiacSignTurkish) && (
              <View style={[styles.zodiacBadge, { 
                borderColor: themeColors.accent,
                backgroundColor: `${themeColors.accent}20`
              }]}>
                <Text style={styles.zodiacEmoji}>
                  {getZodiacEmoji(user.zodiacSign || '')}
                </Text>
                <Text style={[styles.zodiacText, { 
                  color: themeColors.accent,
                }]}>
                  {(() => {
                    if (user.zodiacSign) {
                      return getZodiacDisplay(user.zodiacSign);
                    }
                    if (user.zodiacSignTurkish) {
                      return user.zodiacSignTurkish;
                    }
                    return 'Burç Belirtilmemiş';
                  })()}
                </Text>
              </View>
            )}

            {/* Premium Badge */}
            {isPremium && (
              <ReanimatedAnimated.View style={[styles.premiumBadge, animatedPremiumStyle]}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500', '#FF8C00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.premiumGradient}
                >
                  <View style={styles.premiumContent}>
                    <Ionicons name="diamond" size={16} color="#000" />
                    <Text style={styles.premiumText}>PREMIUM</Text>
                    <Ionicons name="diamond" size={16} color="#000" />
                  </View>
                </LinearGradient>
              </ReanimatedAnimated.View>
            )}
          </View>
        </View>

        {/* İstatistikler */}
        <View style={[styles.statsContainer, { backgroundColor: `${themeColors.accent}10` }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: themeColors.accent }]}>42</Text>
            <Text style={styles.statLabel}>Eşleşme</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: themeColors.accent }]}>18</Text>
            <Text style={styles.statLabel}>Beğeni</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: themeColors.accent }]}>95%</Text>
            <Text style={styles.statLabel}>Uyum</Text>
          </View>
        </View>
      </View>
    );
  };

  // Menü öğesi renderer
  const renderMenuItem = (icon: string, title: string, onPress: () => void, iconColor: string, isLoading = false) => (
    <TouchableOpacity 
      style={[styles.menuItem, isLoading && styles.menuItemDisabled]}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${iconColor}20` }]}>
        {isLoading ? (
          <ActivityIndicator size="small" color={iconColor} />
        ) : (
          <Ionicons name={icon as any} size={24} color={iconColor} />
        )}
      </View>
      <Text style={styles.menuText}>{title}</Text>
      {!isLoading && (
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose}
      />
      
      {/* Drawer */}
      <Animated.View 
        style={[
          styles.drawer,
          { transform: [{ translateX: animation }] }
        ]}
      >
        {/* Arka plan gradyanı */}
        <LinearGradient
          colors={[`${themeColors.accent}15`, `${themeColors.accent}05`, 'transparent']}
          style={styles.drawerGradient}
        />
        
        <BlurView
          intensity={Platform.OS === 'ios' ? 50 : 90}
          tint="dark"
          style={styles.blurContainer}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.headerContainer}>
              <View style={styles.headerLeft}>
                <View style={[styles.modeIndicator, { backgroundColor: themeColors.accent }]}>
                  <Ionicons 
                    name={currentMode === 'astrology' ? 'planet' : 'musical-notes'} 
                    size={20} 
                    color="white" 
                  />
                </View>
                <Text style={styles.headerTitle}>VybeFro</Text>
                <Text style={styles.headerSubtitle}>
                  {currentMode === 'astrology' ? 'Astroloji Modu' : 'Müzik Modu'}
                </Text>
              </View>
              
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>
            
            {/* Profil İçeriği */}
            {renderProfileContent()}
            
            {/* Menü */}
            <View style={styles.menuContainer}>
              <Text style={styles.sectionTitle}>Menü</Text>
              
              {renderMenuItem('person-outline', 'Profil Düzenle', navigateToProfile, themeColors.accent)}
              {renderMenuItem('diamond-outline', isPremium ? 'Premium Yönetimi' : 'Premium Ol', handlePremiumPurchase, '#FFD700', purchasingPremium)}
              {renderMenuItem('settings-outline', 'Ayarlar', () => { onClose(); router.push('/settingsScreen' as any); }, '#9CA3AF')}
              {renderMenuItem('notifications-outline', 'Bildirimler', () => { onClose(); }, '#3B82F6')}
              {renderMenuItem('shield-checkmark-outline', 'Gizlilik', () => { onClose(); }, '#22C55E')}
              {renderMenuItem('help-circle-outline', 'Yardım', () => { onClose(); }, '#F59E0B')}
            </View>

            {/* Mode Switch */}
            <View style={styles.modeSection}>
              <Text style={styles.sectionTitle}>Mod Değiştir</Text>
              <TouchableOpacity
                style={[styles.modeSwitchButton, { borderColor: themeColors.accent }]}
                onPress={() => {
                  const newMode = currentMode === 'astrology' ? 'music' : 'astrology';
                  switchMode(newMode);
                  if (newMode === 'astrology') {
                    router.push('/astrology');
                  } else {
                    router.push('/music');
                  }
                }}
              >
                <LinearGradient
                  colors={currentMode === 'astrology' ? 
                    ['#1DB954', '#1E7E34'] : 
                    ['#8000FF', '#5B00B5']
                  }
                  style={styles.modeSwitchGradient}
                >
                  <Ionicons
                    name={currentMode === 'astrology' ? 'musical-notes' : 'planet'}
                    size={24}
                    color="white"
                  />
                  <Text style={styles.modeSwitchText}>
                    {currentMode === 'astrology' ? 'Müzik Moduna Geç' : 'Astroloji Moduna Geç'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Çıkış */}
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={22} color="#FF6B6B" />
              <Text style={styles.logoutText}>Çıkış Yap</Text>
            </TouchableOpacity>

            {/* Bottom Spacing */}
            <View style={{ height: 50 }} />
          </ScrollView>
        </BlurView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: DRAWER_WIDTH,
    height: height,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
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
    backgroundColor: 'rgba(15, 15, 15, 0.85)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight || 44 : 25,
  },
  
  // Header Styles
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  modeIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Loading Styles
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
  },

  // Profile Styles
  profileSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatarContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 20,
    position: 'relative',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 65,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  onlineStatus: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  onlineIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  
  // Sparkle Efektleri
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: 10,
    right: 20,
  },
  sparkle2: {
    top: 30,
    left: 15,
  },
  sparkle3: {
    bottom: 20,
    right: 10,
  },

  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 6,
    textAlign: 'center',
  },
  profileUsername: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 15,
    fontWeight: '500',
  },
  zodiacBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 15,
  },
  zodiacEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  zodiacText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Premium Badge
  premiumBadge: {
    borderRadius: 25,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  premiumGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
    marginHorizontal: 8,
    letterSpacing: 1,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    opacity: 0.3,
  },

  // Menu Styles
  menuContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 15,
    marginLeft: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    marginBottom: 10,
  },
  menuItemDisabled: {
    opacity: 0.6,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  // Mode Section
  modeSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  modeSwitchButton: {
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
  },
  modeSwitchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  modeSwitchText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
}); 