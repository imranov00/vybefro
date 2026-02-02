import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
import AnimatedSplashScreen from '../components/AnimatedSplashScreen';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import { authApi } from '../services/api';

const { width, height } = Dimensions.get('window');

// Müzik sembolleri
const MUSIC_SYMBOLS = [
  { symbol: '🎵', name: 'Nota', color: '#FFD700', angle: 0 },
  { symbol: '🎸', name: 'Gitar', color: '#FFD700', angle: 30 },
  { symbol: '🎹', name: 'Piyano', color: '#FFD700', angle: 60 },
  { symbol: '🎤', name: 'Mikrofon', color: '#FFD700', angle: 90 },
  { symbol: '🎧', name: 'Kulaklık', color: '#FFD700', angle: 120 },
  { symbol: '📻', name: 'Radyo', color: '#FFD700', angle: 150 },
  { symbol: '🎷', name: 'Saksafon', color: '#FFD700', angle: 180 },
  { symbol: '🎻', name: 'Keman', color: '#FFD700', angle: 210 },
  { symbol: '🥁', name: 'Davul', color: '#FFD700', angle: 240 },
  { symbol: '🎺', name: 'Trompet', color: '#FFD700', angle: 270 },
  { symbol: '🎶', name: 'Notalar', color: '#FFD700', angle: 300 },
  { symbol: '🎼', name: 'Müzik', color: '#FFD700', angle: 330 },
];

// Müzik elementleri
const MUSIC_ELEMENTS = [
  { icon: 'music-box' as any, name: 'Music Box' },
  { icon: 'vinyl' as any, name: 'Vinyl' },
  { icon: 'guitar' as any, name: 'Guitar' },
  { icon: 'piano' as any, name: 'Piano' },
  { icon: 'microphone' as any, name: 'Microphone' },
];

export default function LoginMusicScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rotation = useSharedValue(0);
  const [loading, setLoading] = useState(false);
  const [showLoginSplash, setShowLoginSplash] = useState(false);
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  
  // Kayıt sayfasından gelen email parametresini kullan
  useEffect(() => {
    if (params.email) {
      setFormData(prev => ({ ...prev, emailOrUsername: params.email as string }));
    }
  }, [params.email]);
  
  // Sağa kaydırma ile geri dönüş için
  useEffect(() => {
    router.setParams({
      gestureEnabled: 'true',
      gestureDirection: 'horizontal'
    });
  }, []);
  
  // Arka plandaki müzik çarkının dönme animasyonu
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { 
        duration: 60000, 
        easing: Easing.linear 
      }), 
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const handleLogin = async () => {
    try {
      showLoading('Giriş yapılıyor...');
      
      // Form validasyonu
      if (!formData.emailOrUsername.trim()) {
        Alert.alert('Hata', 'E-posta veya kullanıcı adı gereklidir');
        setLoading(false);
        hideLoading();
        return;
      }
      if (!formData.password.trim()) {
        Alert.alert('Hata', 'Şifre gereklidir');
        setLoading(false);
        hideLoading();
        return;
      }

      console.log('[LOGIN MUSIC PAGE] Login attempt with:', { 
        usernameOrEmail: formData.emailOrUsername, 
        password: '***' 
      });
      
      // API isteği
      const response = await authApi.login({
        usernameOrEmail: formData.emailOrUsername.trim(),
        password: formData.password.trim(),
      });
      
      console.log('[LOGIN MUSIC PAGE] Login response:', response ? 'Success' : 'Empty');
      
      // Token kontrolü
      if (response.token) {
        console.log('[LOGIN MUSIC PAGE] Token received, showing splash...');
        hideLoading();
        // Splash göster, login splash bitince yapılacak
        setShowLoginSplash(true);
      } else {
        console.error('[LOGIN MUSIC PAGE] Login successful but no token received');
        hideLoading();
        Alert.alert('Hata', 'Giriş başarılı ancak oturum açılamadı');
      }
      
    } catch (error: any) {
      console.error('[LOGIN MUSIC PAGE] Login error:', error);
      hideLoading();
      
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        console.error('[LOGIN MUSIC PAGE] Status code:', statusCode);
        
        // HTTP durum koduna göre hata mesajı
        if (statusCode === 401) {
          Alert.alert('Hata', 'Kullanıcı adı veya şifre hatalı');
        } else if (statusCode === 403) {
          Alert.alert('Hata', 'Bu hesaba erişim izniniz yok');
        } else if (error.response?.data?.message) {
          Alert.alert('Hata', error.response.data.message);
        } else {
          Alert.alert('Hata', 'Giriş yapılırken bir hata oluştu');
        }
      } else if (error.message) {
        Alert.alert('Hata', error.message);
      } else {
        Alert.alert('Hata', 'Giriş yapılamadı');
      }
    } finally {
      setLoading(false);
    }
  };

  // Splash bittiğinde login yap ve ana sayfaya yönlendir
  const handleSplashFinish = useCallback(async () => {
    await login('music');
    router.replace('/(tabs)' as any);
  }, [router, login]);

  // Login sonrası splash ekranı göster (music = yeşil tema)
  if (showLoginSplash) {
    return (
      <AnimatedSplashScreen 
        onFinish={handleSplashFinish}
        isAppReady={true}
        theme="green"
        duration={2000}
      />
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Arka plan gradyan */}
      <LinearGradient
        colors={['#1DB954', '#1E7E34', '#145A24']}
        style={styles.background}
      />

      {/* Dönen müzik çarkı */}
      <Animated.View style={[styles.musicWheel, animatedStyle]}>
        <View style={styles.innerCircle} />
        <View style={styles.middleCircle} />
        <View style={styles.outerCircle} />
        
        {/* Müzik sembolleri */}
        {MUSIC_SYMBOLS.map((item, index) => (
          <View 
            key={index} 
            style={[
              styles.symbolContainer, 
              { 
                transform: [
                  { rotate: `${item.angle}deg` }, 
                  { translateY: -(width * 0.6) },
                ]
              }
            ]}
          >
            <Text 
              style={[
                styles.musicSymbol, 
                { transform: [{ rotate: `-${item.angle}deg` }] }
              ]}
            >
              {item.symbol}
            </Text>
          </View>
        ))}
        
        {/* Çarkın merkezi */}
        <View style={styles.centerDot} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Logo ve Alt Başlık */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Vybe</Text>
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.noteIcon}>🎵</Text>
            <View style={styles.dividerLine} />
          </View>
          <Text style={styles.tagline}>Find Your Vibe</Text>
          <Text style={styles.subtitle}>Premium Music Experience</Text>
        </View>

        {/* Giriş Formu */}
        <View style={styles.formContainer}>
          <BlurView intensity={20} style={styles.blurContainer}>
            {/* E-posta veya Kullanıcı Adı Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-posta veya Kullanıcı Adı</Text>
              <TextInput
                style={styles.input}
                placeholder="E-posta veya kullanıcı adınızı girin"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.emailOrUsername}
                onChangeText={(text) => setFormData({ ...formData, emailOrUsername: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                autoComplete="email"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Şifre</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Şifre"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  autoFocus={false}
                  blurOnSubmit={true}
                  contextMenuHidden={true}
                />
                <TouchableOpacity 
                  style={styles.eyeButton} 
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={24} 
                    color="rgba(255,255,255,0.7)" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loginButtonText}>Giriş Yapılıyor...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Giriş Yap</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.orText}>veya</Text>

            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-apple" size={24} color="black" style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Apple ile devam et</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={24} color="black" style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Google ile devam et</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Hesabın yok mu? </Text>
              <TouchableOpacity 
                onPress={() => {
                  try {
                    if (Platform.OS === 'android') {
                      // Android için daha güvenli navigasyon
                      router.push({
                        pathname: '/(auth)/register-music'
                      });
                    } else {
                      // iOS için standart navigasyon
                      setTimeout(() => {
                        router.push('/(auth)/register-music');
                      }, 50);
                    }
                  } catch (error) {
                    console.error('Navigasyon hatası:', error);
                  }
                }}
              >
                <Text style={styles.registerLink}>Kaydol</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </ScrollView>

      {/* Tema Değiştirme Butonu */}
      <TouchableOpacity 
        style={styles.themeToggle}
        activeOpacity={0.7}
        onPress={() => {
          try {
            if (Platform.OS === 'android') {
              // Android için daha güvenli navigasyon
              router.replace({
                pathname: '/(auth)/login'
              });
            } else {
              // iOS için standart navigasyon
              setTimeout(() => {
                router.replace('/(auth)/login');
              }, 50);
            }
          } catch (error) {
            console.error('Tema değiştirme hatası:', error);
          }
        }}
      >
        <Ionicons name="planet" size={24} color="white" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    width: width,
    height: height,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 30,
  },
  musicWheel: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.3,
    left: width * 0.1,
    top: height * 0.25,
  },
  innerCircle: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.1)',
    position: 'absolute',
  },
  middleCircle: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    position: 'absolute',
  },
  outerCircle: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    position: 'absolute',
  },
  symbolContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicSymbol: {
    fontSize: 26,
    color: '#FFD700',
    textAlign: 'center',
  },
  centerDot: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#FFD700',
    position: 'absolute',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
    marginBottom: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    width: width * 0.6,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 215, 0, 0.5)',
  },
  noteIcon: {
    fontSize: 24,
    marginHorizontal: 15,
    color: '#FFD700',
  },
  tagline: {
    fontSize: 24,
    color: 'white',
    fontWeight: '300',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  formContainer: {
    width: width * 0.85,
    marginBottom: 20,
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 15,
    color: 'white',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    color: 'white',
    fontSize: 16,
  },
  eyeButton: {
    padding: 10,
  },
  loginButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  loginButtonText: {
    color: '#1DB954',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orText: {
    color: 'white',
    textAlign: 'center',
    marginVertical: 15,
    fontSize: 16,
  },
  socialButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  socialIcon: {
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 16,
    color: 'black',
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  registerText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  registerLink: {
    color: 'white',
    fontWeight: '600',
  },
  themeToggle: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});