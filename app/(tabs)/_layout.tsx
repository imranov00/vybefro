import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Platform, StatusBar, TouchableOpacity } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import AnimatedSplashScreen, { SplashTheme } from '../components/AnimatedSplashScreen';
import ProfileDrawer from '../components/profile/ProfileDrawer';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import { useProfile } from '../context/ProfileContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isProfileVisible, showProfile, hideProfile, userProfile } = useProfile();
  const { isLoggedIn, currentMode, switchMode } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const router = useRouter();
  
  // Mod değişikliği splash state'i
  const [showModeSplash, setShowModeSplash] = useState(false);
  const [modeSplashReady, setModeSplashReady] = useState(false);
  const [modeSplashTheme, setModeSplashTheme] = useState<SplashTheme>('purple');
  const [pendingMode, setPendingMode] = useState<'astrology' | 'music' | null>(null);
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);
  const [isPreparingRoute, setIsPreparingRoute] = useState(false);

  // Mod değişikliği başlat
  const handleModeSwitch = useCallback(async () => {
    // Zaten mod değişikliği yapılıyorsa, çift tıklamayı engelle
    if (isSwitchingMode) {
      console.log('⚠️ [MODE SWITCH] Zaten mod değişikliği yapılıyor, bekleniyor...');
      return;
    }

    setIsSwitchingMode(true);
    const newMode = currentMode === 'astrology' ? 'music' : 'astrology';
    
    // Loading göster
    showLoading(newMode === 'music' ? 'Müzik moduna geçiliyor...' : 'Astroloji moduna geçiliyor...');
    
    try {
      // Hedef moda göre splash temasını seç
      const theme: SplashTheme = newMode === 'music' ? 'green' : 'purple';
      
      // Kısa bir gecikme (kullanıcı deneyimi için)
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setModeSplashTheme(theme);
      setPendingMode(newMode);
      
      // Loading'i gizle
      hideLoading();
      
      // Splash'ı göster
      setModeSplashReady(true);
      setShowModeSplash(true);

      // Splash gösterilirken arka planda mod değişikliği ve route hazırlığını yap
      // 800ms sonra mod değiştir (splash devam ederken)
      setTimeout(() => {
        console.log('🔄 [MODE SWITCH] Mod değiştiriliyor:', newMode);
        switchMode(newMode);
        setIsPreparingRoute(true);
      }, 800);

      // 1500ms sonra route'u hazırla (splash hala gösteriliyor)
      setTimeout(() => {
        console.log('🔄 [MODE SWITCH] Route hazırlanıyor:', newMode === 'astrology' ? '/astrology' : '/music');
        if (newMode === 'astrology') {
          router.push('/astrology');
        } else {
          router.push('/music');
        }
      }, 1500);

    } catch (error) {
      console.error('❌ [MODE SWITCH] Hata:', error);
      hideLoading();
      setIsSwitchingMode(false);
      setIsPreparingRoute(false);
    }
  }, [currentMode, isSwitchingMode, showLoading, hideLoading, switchMode, router]);

  // Splash tamamlandığında sadece state'leri temizle (mod değişikliği zaten yapıldı)
  const handleModeSplashFinish = useCallback(() => {
    console.log('✅ [MODE SWITCH] Splash tamamlandı, her şey hazır');
    setPendingMode(null);
    setShowModeSplash(false);
    setModeSplashReady(false);
    setIsSwitchingMode(false);
    setIsPreparingRoute(false);
  }, []);

  // Mode'a göre tab bar renklerini belirle - memoized
  const tabColors = useMemo(() => {
    if (currentMode === 'music') {
      return {
        backgroundColor: 'rgba(29, 185, 84, 0.95)', // Yeşil ton
        borderColor: 'rgba(255, 215, 0, 0.4)',
        blurTint: 'dark' as const
      };
    } else {
      return {
        backgroundColor: 'rgba(128, 0, 255, 0.95)', // Mor ton  
        borderColor: 'rgba(255, 255, 255, 0.3)',
        blurTint: 'dark' as const
      };
    }
  }, [currentMode]);

  return (
    <>
      {/* Status bar ayarları */}
      <StatusBar 
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.7)',
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTitleStyle: {
            color: 'white',
          },
          headerLeft: () => (
            <TouchableOpacity
              style={{ marginLeft: 15 }}
              onPress={showProfile}
            >
              <Ionicons 
                name="person-circle-outline" 
                size={28} 
                color="white"
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleModeSwitch}
              disabled={isSwitchingMode}
              style={{
                backgroundColor: isSwitchingMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.25)',
                borderRadius: 22,
                paddingHorizontal: 14,
                paddingVertical: 8,
                marginRight: 15,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                opacity: isSwitchingMode ? 0.5 : 1,
              }}
            >
              <Ionicons
                name={currentMode === 'astrology' ? 'musical-notes' : 'planet'}
                size={18}
                color="white"
              />
            </TouchableOpacity>
          ),
          tabBarBackground: () => (
            <BlurView 
              intensity={90}
              tint={tabColors.blurTint}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                backgroundColor: tabColors.backgroundColor,
                borderTopColor: tabColors.borderColor,
                borderTopWidth: 1,
              }}
            />
          ),
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            paddingBottom: Platform.OS === 'ios' ? 25 : 15,
            paddingTop: 15,
            height: Platform.OS === 'ios' ? 95 : 75,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: -8,
            },
            shadowOpacity: 0.4,
            shadowRadius: 15,
            elevation: 25,
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: '700',
            marginTop: 6,
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          },
          tabBarIconStyle: {
            marginTop: 5,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.3,
            shadowRadius: 3,
          },
        }}>
        
        {/* Astrology Tab */}
        <Tabs.Screen
          name="astrology"
          options={{
            title: '',
            tabBarLabel: () => null,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'planet' : 'planet-outline'} 
                size={28} 
                color={color} 
              />
            ),
            href: currentMode === 'astrology' ? '/astrology' : null,
          }}
        />

        {/* Astrology Matches Tab - Sadece astrology mode'da görünür */}
        <Tabs.Screen
          name="astrology-matches"
          options={{
            title: '',
            tabBarLabel: () => null,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'heart' : 'heart-outline'} 
                size={28} 
                color={color} 
              />
            ),
            href: currentMode === 'astrology' ? '/astrology-matches' : null,
          }}
        />

        {/* Birth Chart Tab - Sadece astrology mode'da görünür */}
        <Tabs.Screen
          name="birth-chart"
          options={{
            title: '',
            tabBarLabel: () => null,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'sparkles' : 'sparkles-outline'} 
                size={28} 
                color={color} 
              />
            ),
            href: currentMode === 'astrology' ? '/birth-chart' : null,
          }}
        />

        {/* Music Tab */}
        <Tabs.Screen
          name="music"
          options={{
            title: '',
            tabBarLabel: () => null,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'musical-notes' : 'musical-notes-outline'} 
                size={28} 
                color={color} 
              />
            ),
            href: currentMode === 'music' ? '/music' : null,
          }}
        />

        {/* Music Matches Tab - Sadece music mode'da görünür */}
        <Tabs.Screen
          name="music-matches"
          options={{
            title: '',
            tabBarLabel: () => null,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'people' : 'people-outline'} 
                size={28} 
                color={color} 
              />
            ),
            href: currentMode === 'music' ? '/music-matches' : null,
          }}
        />


        {/* Chat Tab - Her iki mode'da da görünür */}
        <Tabs.Screen
          name="chat"
          options={{
            title: '',
            tabBarLabel: () => null,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'chatbubbles' : 'chatbubbles-outline'} 
                size={28} 
                color={color} 
              />
            ),
            href: '/(tabs)/chat' as any,
          }}
        />

        

        {/* Index sayfasını gizle */}
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />
        {/* Planet Wheel sayfasını gizle (sadece yönlendirme ile açılır) */}
        <Tabs.Screen
          name="planet-wheel"
          options={{
            href: null,
          }}
        />
      </Tabs>
      
      {/* Profil Drawer */}
      <ProfileDrawer 
        visible={isProfileVisible} 
        onClose={hideProfile} 
        user={userProfile} 
      />
      
      {/* Mod Değişikliği Splash Screen */}
      {showModeSplash && modeSplashReady && (
        <AnimatedSplashScreen 
          onFinish={handleModeSplashFinish}
          theme={modeSplashTheme}
          isAppReady={true}
          duration={3000}
        />
      )}
    </>
  );
}
