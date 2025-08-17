import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Dimensions,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import PlanetModal from '../components/astro/PlanetModal';
import { PLANETS, Planet } from '../types/planets';

const { width, height } = Dimensions.get('window');

export default function AstroMapScreen() {
  const router = useRouter();
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Animasyon değerleri
  const planetsRotation = useSharedValue(0);
  const centerScale = useSharedValue(0);
  const starPulse = useSharedValue(1);
  const screenScale = useSharedValue(0.8);
  const screenOpacity = useSharedValue(0);

  // Ekran focus olduğunda animasyonları başlat
  useFocusEffect(
    useCallback(() => {
      console.log('AstroMapScreen focus oldu - animasyonlar başlatılıyor');
      
      // Modal state'i sıfırla
      setSelectedPlanet(null);
      setModalVisible(false);
      
      // Başlangıç değerlerini sıfırla
      screenScale.value = 0.8;
      screenOpacity.value = 0;
      centerScale.value = 0;
      planetsRotation.value = 0;
      starPulse.value = 1;

      // Ekran açılış efekti
      screenScale.value = withSpring(1, { damping: 15, stiffness: 100 });
      screenOpacity.value = withTiming(1, { duration: 500 });
      centerScale.value = withSpring(1, { damping: 20, stiffness: 150 });

      // Gezegenler sürekli dönsün
      planetsRotation.value = withRepeat(
        withTiming(360, { 
          duration: 120000, // 2 dakika
          easing: Easing.linear 
        }), 
        -1,
        false
      );

      // Yıldız pulse animasyonu
      starPulse.value = withRepeat(
        withTiming(1.3, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );

      return () => {
        console.log('AstroMapScreen blur oldu - animasyonlar durduruluyor');
      };
    }, [])
  );

  const screenStyle = useAnimatedStyle(() => ({
    transform: [{ scale: screenScale.value }],
    opacity: screenOpacity.value,
  }));

  const planetsStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${planetsRotation.value}deg` }],
  }));

  const centerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: centerScale.value }],
  }));

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starPulse.value }],
  }));

  const handlePlanetPress = (planet: Planet) => {
    console.log('handlePlanetPress çağrıldı:', planet.turkishName);
    setSelectedPlanet(planet);
    setModalVisible(true);
    console.log('Modal state:', { selectedPlanet: planet, modalVisible: true });
  };

  const handleCloseModal = () => {
    console.log('Modal kapatılıyor...');
    setModalVisible(false);
    setTimeout(() => {
      setSelectedPlanet(null);
      console.log('Modal tamamen kapatıldı');
    }, 300);
  };

  const handleGoBack = () => {
    screenScale.value = withTiming(0.8, { duration: 300 });
    screenOpacity.value = withTiming(0, { duration: 300 });
    setTimeout(() => router.back(), 300);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Uzay arka planı */}
      <LinearGradient
        colors={['#0a0a23', '#1a1a3a', '#2d1b69', '#0f0c29']}
        style={styles.background}
      />

      {/* Yıldız efektleri */}
      <Animated.View style={[styles.starField, starStyle]}>
        {Array.from({ length: 100 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                opacity: Math.random() * 0.8 + 0.2,
              },
            ]}
          />
        ))}
      </Animated.View>

      <Animated.View style={[styles.content, screenStyle]}>
        {/* Geri butonu */}
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
            style={styles.backButtonGradient}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Başlık */}
        <View style={styles.header}>
          <Text style={styles.title}>🗺️ Astro Harita</Text>
          <Text style={styles.subtitle}>Gezegenlerin Gizli Dünyası</Text>
        </View>

        {/* Ana Harita Konteyneri */}
        <View style={styles.mapContainer}>
          {/* Merkezdeki Doğum Haritası */}
          <Animated.View style={[styles.centerChart, centerStyle]}>
            <LinearGradient
              colors={['rgba(255,215,0,0.3)', 'rgba(255,140,0,0.2)', 'rgba(138,43,226,0.2)']}
              style={styles.chartGradient}
            >
              <View style={styles.chartInner}>
                <Text style={styles.chartEmoji}>🌌</Text>
                <Text style={styles.chartText}>Doğum{'\n'}Haritası</Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Dönen Gezegenler */}
          <Animated.View style={[styles.planetsContainer, planetsStyle]}>
            {PLANETS.map((planet, index) => {
              const radius = width * 0.35;
              const angleRad = (planet.angle * Math.PI) / 180;
              const x = Math.cos(angleRad) * radius;
              const y = Math.sin(angleRad) * radius;

              // Her gezegen için counter-rotation animasyonu
              const planetContentStyle = useAnimatedStyle(() => ({
                transform: [{ rotate: `-${planetsRotation.value}deg` }],
              }));

              return (
                <Animated.View
                  key={planet.id}
                  style={[
                    styles.planetContainer,
                    {
                      transform: [
                        { translateX: x },
                        { translateY: y },
                      ],
                    },
                  ]}
                >
                  <Animated.View style={planetContentStyle}>
                    <TouchableOpacity
                      style={[
                        styles.planetButton,
                        { backgroundColor: `${planet.color}20`, borderColor: `${planet.color}60` }
                      ]}
                      onPress={() => {
                        console.log('Gezegen tıklandı:', planet.turkishName);
                        handlePlanetPress(planet);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.planetEmoji, { textShadowColor: planet.color }]}>
                        {planet.emoji}
                      </Text>
                      <Text style={styles.planetName}>{planet.turkishName}</Text>
                      <Text style={[styles.planetSymbol, { color: planet.color }]}>
                        {planet.symbol}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>

                  {/* Gezegen ışık efekti */}
                  <View 
                    style={[
                      styles.planetGlow, 
                      { backgroundColor: planet.color, shadowColor: planet.color }
                    ]} 
                  />
                </Animated.View>
              );
            })}
          </Animated.View>

          {/* Yörünge çizgileri */}
          <View style={styles.orbitRings}>
            <View style={[styles.orbitRing, styles.innerOrbit]} />
            <View style={[styles.orbitRing, styles.middleOrbit]} />
            <View style={[styles.orbitRing, styles.outerOrbit]} />
          </View>
        </View>

        {/* Alt bilgi */}
        <View style={styles.infoContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.infoGradient}
          >
            <Text style={styles.infoText}>
              ✨ Bir gezegene dokunarak astrolojik anlamını keşfedin
            </Text>
          </LinearGradient>
        </View>
      </Animated.View>

      {/* Gezegen Modal */}
      <PlanetModal
        visible={modalVisible}
        planet={selectedPlanet}
        onClose={handleCloseModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  starField: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  star: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 10,
    borderRadius: 25,
    overflow: 'hidden',
  },
  backButtonGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerChart: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: width * 0.125,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  chartGradient: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.125,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  chartInner: {
    alignItems: 'center',
  },
  chartEmoji: {
    fontSize: 32,
    marginBottom: 5,
  },
  chartText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 16,
  },
  planetsContainer: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planetContainer: {
    position: 'absolute',
  },
  planetButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  planetEmoji: {
    fontSize: 20,
    marginBottom: 2,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    textShadowOpacity: 0.8,
  },
  planetName: {
    fontSize: 9,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 1,
  },
  planetSymbol: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  planetGlow: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    top: '50%',
    left: '50%',
    marginTop: -10,
    marginLeft: -10,
    opacity: 0.3,
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  orbitRings: {
    position: 'absolute',
  },
  orbitRing: {
    position: 'absolute',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 1000,
  },
  innerOrbit: {
    width: width * 0.5,
    height: width * 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    top: -width * 0.25,
    left: -width * 0.25,
  },
  middleOrbit: {
    width: width * 0.7,
    height: width * 0.7,
    borderColor: 'rgba(255,255,255,0.08)',
    top: -width * 0.35,
    left: -width * 0.35,
  },
  outerOrbit: {
    width: width * 0.9,
    height: width * 0.9,
    borderColor: 'rgba(255,255,255,0.05)',
    top: -width * 0.45,
    left: -width * 0.45,
  },
  infoContainer: {
    marginBottom: Platform.OS === 'ios' ? 40 : 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  infoGradient: {
    padding: 15,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
