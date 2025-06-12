import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
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
import { premiumApi } from '../../services/api';
import { getZodiacDisplay, getZodiacEmoji } from '../../types/zodiac';

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
  const { currentMode, switchMode, logout, isPremium, isLoggedIn, setPremium } = useAuth();
  const { fetchUserProfile } = useProfile();
  const router = useRouter();
  const [purchasingPremium, setPurchasingPremium] = useState(false);
  const animation = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const [isRendered, setIsRendered] = useState(visible);
  
  // Premium badge animasyonu
  const premiumGlow = useSharedValue(0);
  const premiumScale = useSharedValue(1);
  
  // Sadece login durumu değiştiğinde profil bilgilerini yenile
  useEffect(() => {
    if (isLoggedIn && visible) {
      fetchUserProfile();
    }
  }, [isLoggedIn]); // fetchUserProfile ve visible dependency'sini kaldırdık

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
    
    // Premium animasyonunu başlat
    if (isPremium) {
      // Neon glow animasyonu
      premiumGlow.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
      
      // Hafif scale animasyonu
      premiumScale.value = withRepeat(
        withTiming(1.05, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    }
  }, [visible, animation, isPremium]);

  const animatedPremiumStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: 0.6 + (premiumGlow.value * 0.4),
      shadowRadius: 8 + (premiumGlow.value * 12),
      transform: [{ scale: premiumScale.value }],
    };
  });

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

  // Premium satın alma fonksiyonu
  const handlePremiumPurchase = async () => {
    // Premium ise veya değilse her durumda premium sayfasına yönlendir
    onClose();
    setTimeout(() => {
      router.push('/(profile)/premiumScreen' as any);
    }, 300);
  };

  // Premium iptal fonksiyonu
  const handlePremiumCancel = async () => {
    try {
      setPurchasingPremium(true);
      
      // Premium iptal API çağrısı
      const response = await premiumApi.cancel();

      if (response.success) {
        // Premium durumunu güncelle
        setPremium(false);
        
        Alert.alert(
          'İptal Edildi',
          'Premium üyeliğiniz başarıyla iptal edildi.',
          [
            {
              text: 'Tamam',
              style: 'default'
            }
          ]
        );
      } else {
        Alert.alert(
          'Hata',
          response.message || 'Premium iptal işlemi başarısız oldu.',
          [{ text: 'Tamam', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Premium cancel error:', error);
      Alert.alert(
        'Hata',
        'Premium iptal sırasında bir hata oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam', style: 'default' }]
      );
    } finally {
      setPurchasingPremium(false);
    }
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
          <View style={[styles.zodiacBadge, { 
            borderColor: themeColors.accent,
          }]}>
            <Text style={styles.zodiacEmoji}>
              {getZodiacEmoji(user.zodiacSign || '')}
            </Text>
            <Text style={[styles.zodiacText, { 
              color: themeColors.accent,
            }]}>
              {(() => {
                // Burç gösterimi düzeltildi
                if (user.zodiacSign) {
                  // Yeni sistem - enum'dan tam display
                  return getZodiacDisplay(user.zodiacSign);
                }
                
                if (user.zodiacSignTurkish) {
                  // Eski sistem - sadece Türkçe isim
                  return user.zodiacSignTurkish;
                }
                
                return 'Burç Belirtilmemiş';
              })()}
            </Text>
          </View>
        )}

        {/* Premium Badge - Burç altında */}
        {isPremium && (
          <ReanimatedAnimated.View style={[styles.premiumBadgeLuxury, animatedPremiumStyle]}>
            {/* Arka plan gradient efekti */}
            <View style={styles.premiumGradientBackground} />
            
            {/* Ana içerik */}
            <View style={styles.premiumBadgeInner}>
              <View style={styles.premiumIconContainer}>
                <Ionicons name="diamond" size={18} color="#FFD700" />
              </View>
              <ReanimatedAnimated.Text style={[styles.premiumTextLuxury, animatedPremiumStyle]}>
                PREMIUM
              </ReanimatedAnimated.Text>
              <View style={styles.premiumIconContainer}>
                <Ionicons name="diamond" size={18} color="#FFD700" />
              </View>
            </View>
            
            {/* Çoklu glow efektleri */}
            <View style={styles.premiumGlowEffect} />
            <View style={styles.premiumInnerGlow} />
            
            {/* Shimmer efekti */}
            <ReanimatedAnimated.View style={[styles.premiumShimmer, {
              transform: [{
                translateX: premiumGlow.value * 200 - 100
              }]
            }]} />
          </ReanimatedAnimated.View>
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
                <View style={[styles.menuIcon, { 
                  backgroundColor: `${themeColors.accent}15`,
                }]}>
                  <Ionicons name="person" size={26} color={themeColors.accent} />
                </View>
                <Text style={styles.menuText}>Profil</Text>
                <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.menuItem, purchasingPremium && styles.menuItemDisabled]}
                onPress={handlePremiumPurchase}
                disabled={purchasingPremium}
              >
                <View style={[styles.menuIcon, { 
                  backgroundColor: 'rgba(255, 215, 0, 0.15)',
                }]}>
                  {purchasingPremium ? (
                    <ActivityIndicator size="small" color="#FFD700" />
                  ) : (
                    <Ionicons name="diamond" size={26} color="#FFD700" />
                  )}
                </View>
                <Text style={styles.menuText}>
                  {isPremium ? 'Premium Yönetimi' : 'Premium'}
                </Text>
                {!purchasingPremium && (
                  <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.6)" />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  router.push('/settingsScreen' as any);
                }}
              >
                <View style={[styles.menuIcon, { 
                  backgroundColor: 'rgba(156, 163, 175, 0.15)',
                }]}>
                  <Ionicons name="settings" size={26} color="#9CA3AF" />
                </View>
                <Text style={styles.menuText}>Ayarlar</Text>
                <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  // Notifications page
                }}
              >
                <View style={[styles.menuIcon, { 
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                }]}>
                  <Ionicons name="notifications" size={26} color="#3B82F6" />
                </View>
                <Text style={styles.menuText}>Bildirimler</Text>
                <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  // Privacy page
                }}
              >
                <View style={[styles.menuIcon, { 
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                }]}>
                  <Ionicons name="shield-checkmark" size={26} color="#22C55E" />
                </View>
                <Text style={styles.menuText}>Gizlilik</Text>
                <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  // Help page
                }}
              >
                <View style={[styles.menuIcon, { 
                  backgroundColor: 'rgba(168, 85, 247, 0.15)',
                }]}>
                  <Ionicons name="help-circle" size={26} color="#A855F7" />
                </View>
                <Text style={styles.menuText}>Yardım</Text>
                <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.6)" />
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: DRAWER_WIDTH,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: -8,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 25,
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
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileSection: {
    alignItems: 'center',
    padding: 30,
    paddingBottom: 25,
  },
  avatarContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: 4,
    marginBottom: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 15,
  },
  avatarGradient: {
    flex: 1,
    borderRadius: 61,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 61,
  },
  onlineStatus: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5,
  },
  profileName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  profileUsername: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 20,
    textAlign: 'center',
  },
  zodiacBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 2,
    marginBottom: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  zodiacEmoji: {
    fontSize: 28,
    marginRight: 10,
  },
  zodiacText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuContainer: {
    padding: 25,
    paddingTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  menuText: {
    flex: 1,
    fontSize: 17,
    color: 'white',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  logoutContainer: {
    padding: 25,
    paddingTop: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.4)',
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '700',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  bottomSpacer: {
    height: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  premiumBadgeLuxury: {
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 15,
    position: 'relative',
    overflow: 'hidden',
  },
  premiumBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumIconContainer: {
    marginHorizontal: 8,
  },
  premiumTextLuxury: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 2.5,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica-Bold' : 'sans-serif-medium',
  },
  premiumGradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 30,
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    zIndex: -3,
  },
  premiumGlowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    zIndex: -2,
  },
  premiumInnerGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    zIndex: -1,
  },
  premiumShimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 30,
    opacity: 0.6,
    zIndex: 1,
  },
}); 