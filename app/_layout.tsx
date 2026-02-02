import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import AnimatedSplashScreen, { SplashTheme } from './components/AnimatedSplashScreen';
import { LoadingOverlay } from './components/LoadingOverlay';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { LoadingProvider } from './context/LoadingContext';
import { ProfileProvider } from './context/ProfileContext';
import { SwipeProvider } from './context/SwipeContext';

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Expo native splash'ı hemen gizle
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Fontlar yüklenene kadar hiçbir şey gösterme
  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000' }} />
    );
  }

  // AuthProvider'ı en üste sarıp, içeride splash kontrolü yapıyoruz
  return (
    <LoadingProvider>
      <ProfileProvider>
        <AuthProvider>
          <AppWithSplash />
        </AuthProvider>
      </ProfileProvider>
    </LoadingProvider>
  );
}

// Auth durumunu kontrol edip splash gösterecek component
function AppWithSplash() {
  const { isLoading: isAuthLoading, isLoggedIn } = useAuth();
  const router = useRouter();
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);
  const [splashFinished, setSplashFinished] = useState(false);
  
  // İlk açılışta %50 ihtimalle mor veya yeşil tema
  const initialTheme = useMemo<SplashTheme>(() => {
    return Math.random() < 0.5 ? 'purple' : 'green';
  }, []);

  // Splash bittiğinde çağrılacak
  const handleSplashFinish = useCallback(() => {
    setShowAnimatedSplash(false);
    setSplashFinished(true);
  }, []);

  // Splash bittikten ve auth yüklendikten sonra yönlendirme yap
  useEffect(() => {
    if (splashFinished && !isAuthLoading) {
      // Kullanıcı giriş yapmamışsa, splash temasına göre login sayfasına yönlendir
      if (!isLoggedIn) {
        if (initialTheme === 'purple') {
          router.replace('/(auth)/login');
        } else {
          router.replace('/(auth)/login-music');
        }
      }
    }
  }, [splashFinished, isAuthLoading, isLoggedIn, initialTheme, router]);

  // Auth yükleniyor veya splash gösteriliyorsa
  const isAppReady = !isAuthLoading;

  // Animasyonlu splash screen göster
  if (showAnimatedSplash) {
    return (
      <AnimatedSplashScreen 
        onFinish={handleSplashFinish}
        isAppReady={isAppReady}
        theme={initialTheme}
      />
    );
  }

  // Splash bittikten sonra ana uygulamayı göster
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ChatProvider>
            <LoadingOverlay />
          <SwipeProvider>
            <Slot />
          </SwipeProvider>
        </ChatProvider>
        <StatusBar style="light" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
