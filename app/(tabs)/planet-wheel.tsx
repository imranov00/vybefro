import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
import PlanetDetailModal from '../components/PlanetDetailModal';
import { useProfile } from '../context/ProfileContext';
import { ZodiacSign } from '../types/zodiac';

const { width, height } = Dimensions.get('window');

// Gezegen görsellerini simgeler/gezegenler klasöründen kullan
const PLANETS: string[] = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
];

const GEZEGEN_MAP: Record<string, any> = {
  sun: require('../../simgeler/gezegenler/Gunes.png'),
  moon: require('../../simgeler/gezegenler/ay.png'),
  mercury: require('../../simgeler/gezegenler/merkür.png'),
  venus: require('../../simgeler/gezegenler/venus.png'),
  mars: require('../../simgeler/gezegenler/mars.png'),
  jupiter: require('../../simgeler/gezegenler/jupiter.png'),
  saturn: require('../../simgeler/gezegenler/saturn.png'),
  uranus: require('../../simgeler/gezegenler/uranus.png'),
  neptune: require('../../simgeler/gezegenler/neptun.png'),
};

export default function PlanetWheelScreen() {
  const { userProfile } = useProfile();
  const userZodiac = (userProfile?.zodiacSign as ZodiacSign) || undefined;
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const wheelRotation = useSharedValue(0);
  const zodiacSphereRotation = useSharedValue(0);
  const selectedScale = useSharedValue(1);

  useEffect(() => {
    wheelRotation.value = withRepeat(
      withTiming(360, { duration: 80000, easing: Easing.linear }),
      -1,
      false
    );
    
    // Zodiac sphere çok yavaş dönsün
    zodiacSphereRotation.value = withRepeat(
      withTiming(360, { duration: 180000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wheelRotation.value}deg` }],
  }));

  const zodiacSphereStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${zodiacSphereRotation.value}deg` }],
  }));

  // Yıldız alanı
  const stars = useMemo(() => Array.from({ length: 60 }).map((_, i) => ({
    key: i,
    left: Math.random() * width,
    top: Math.random() * height,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.7 + 0.3,
  })), [width, height]);

  const starPulse = useSharedValue(1);
  useEffect(() => {
    starPulse.value = withRepeat(
      withTiming(1.15, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);
  const starStyle = useAnimatedStyle(() => ({ transform: [{ scale: starPulse.value }] }));

  const onPlanetPress = (name: string) => {
    setSelectedPlanet(name);
    selectedScale.value = withSpring(1.06, { damping: 14 }, () => {
      selectedScale.value = withSpring(1);
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0F0C29", "#302B63", "#24243e"]} style={styles.background} />

      {/* Yıldız efekti */}
      <Animated.View style={[styles.starField, starStyle]}>
        {stars.map(s => (
          <View key={s.key} style={[styles.star, { left: s.left, top: s.top, width: s.size, height: s.size, opacity: s.opacity }]} />
        ))}
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}> 
          <Text style={styles.title}>🪐 Gezegen Çarkı</Text>
          <Text style={styles.subtitle}>Satürn'den açıldı — Evrenin ritmini keşfet</Text>
        </View>

        <View style={styles.wheelContainer}>
          <Animated.View style={[styles.wheel, wheelStyle]}>
            <View style={styles.outerRing} />
            <View style={styles.middleRing} />
            <View style={styles.innerRing} />

            {/* Merkez Zodiac Sphere */}
            <View style={styles.centerSymbol}>
              <Animated.View style={zodiacSphereStyle}>
                <Image 
                  source={require('../../simgeler/gezegenler/zodiac-sphere.png')} 
                  style={{ width: 90, height: 90 }}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>

            {PLANETS.map((name, index) => {
              const angle = (360 / PLANETS.length) * index;
              return (
                <Animated.View
                  key={name}
                  style={[
                    styles.planetContainer,
                    { transform: [{ rotate: `${angle}deg` }, { translateY: -(width * 0.33) }] },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => onPlanetPress(name)}
                    style={[styles.planetButton, { transform: [{ rotate: `-${angle}deg` }] }]}
                  >
                    {GEZEGEN_MAP[name] && <Image source={GEZEGEN_MAP[name]} style={styles.planetImage} />}
                    <Text style={styles.planetLabel}>{name.toUpperCase()}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </Animated.View>
        </View>

        {/* Bilgi alanı */}
        <View style={styles.infoCard}>
          <LinearGradient colors={["rgba(8,12,32,0.78)", "rgba(12,18,46,0.78)"]} style={styles.cardGradient}>
            <Text style={styles.infoTitle}>Astrolojide Gezegenlerin Önemi</Text>
            {[
              'Güneş: kimlik ve yaşam enerjisi, haritanın kalbi.',
              'Ay: duygular, alışkanlıklar ve iç güvenlik ihtiyacı.',
              'Merkür: zihin, iletişim, öğrenme hızı ve merak.',
              'Venüs: sevgi dili, estetik, değer algısı ve çekim.',
              'Mars: motivasyon, eylem biçimi ve mücadele gücü.',
              'Jüpiter: büyüme alanları, şans pencereleri ve ilham.',
              'Satürn: sınavlar, disiplin, uzun vadeli kalıcılık.',
              'Uranüs: özgürlük, ani uyanışlar ve yenilik dürtüsü.',
              'Neptün: sezgi, hayal gücü, çözülme ve ilham.',
            ].map((item, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.infoText}>{item}</Text>
              </View>
            ))}
            <Text style={[styles.infoText, { marginTop: 6 }]}>
              Çarktaki gezegenleri incelemek, doğum haritandaki enerjilerin nasıl aktığını
              anlamanı kolaylaştırır.
            </Text>
          </LinearGradient>
        </View>

        {/* Kullanım rehberi */}
        <View style={styles.infoCard}>
          <LinearGradient colors={["rgba(10,16,44,0.82)", "rgba(16,22,50,0.78)"]} style={styles.cardGradient}>
            <Text style={styles.infoTitle}>Çarkı Kullanma Rehberi</Text>
            <View style={styles.bulletRow}><Text style={styles.bulletDot}>•</Text><Text style={styles.infoText}>Merkez Satürn’den açıldın; her gezegene tıkla, kendi modalli açılır.</Text></View>
            <View style={styles.bulletRow}><Text style={styles.bulletDot}>•</Text><Text style={styles.infoText}>Açılan modalda 3D gezegen + astrolojik açıklama + burcuna özel etki var.</Text></View>
            <View style={styles.bulletRow}><Text style={styles.bulletDot}>•</Text><Text style={styles.infoText}>Kendi burcuna göre etkileri okumayı unutma; yorumlar burca göre değişir.</Text></View>
            <View style={styles.bulletRow}><Text style={styles.bulletDot}>•</Text><Text style={styles.infoText}>Mobilde daha akıcı gezinmek için yavaş sürükle; çark otomatik dönüyor.</Text></View>
          </LinearGradient>
        </View>

        {/* Kısa notlar / astro ipuçları */}
        <View style={[styles.infoCard, { marginBottom: 12 }]}>
          <LinearGradient colors={["rgba(44,26,96,0.78)", "rgba(18,10,54,0.82)"]} style={styles.cardGradient}>
            <Text style={styles.infoTitle}>Hızlı Astro İpuçları</Text>
            <View style={styles.chipRow}>
              {['Retrograd = içe dönüş', 'Yükselen etkileşir', 'Ev konumu kritik', 'Açılar senaryoyu yazar'].map((chip) => (
                <View key={chip} style={styles.chip}><Text style={styles.chipText}>{chip}</Text></View>
              ))}
            </View>
            <Text style={styles.infoText}>
              Gezegenin bulunduğu ev, element ve yaptığı açıların toplamı, yorumu derinleştirir.
              Çarktaki gezegenleri okurken bu üçlüyü birlikte düşün.
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Detay modalı */}
      <PlanetDetailModal
        visible={!!selectedPlanet}
        onClose={() => setSelectedPlanet(null)}
        planetName={selectedPlanet ?? 'saturn'}
        userZodiac={userZodiac}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  starField: { position: 'absolute', width: '100%', height: '100%' },
  star: { position: 'absolute', backgroundColor: 'white', borderRadius: 1 },
  scrollContent: { padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: Platform.OS === 'ios' ? 140 : 110 },
  header: { alignItems: 'center', marginTop: Platform.OS === 'ios' ? 70 : 40, marginBottom: 20 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#eaf0ff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: { fontSize: 14, color: '#cdd8ff', textAlign: 'center', fontStyle: 'italic' },
  wheelContainer: { alignItems: 'center', height: width * 0.9 },
  wheel: { width: width * 0.8, height: width * 0.8, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  outerRing: { position: 'absolute', width: width * 0.75, height: width * 0.75, borderRadius: width * 0.375, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', borderStyle: 'dashed' },
  middleRing: { position: 'absolute', width: width * 0.6, height: width * 0.6, borderRadius: width * 0.3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  innerRing: { position: 'absolute', width: width * 0.4, height: width * 0.4, borderRadius: width * 0.2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  centerSymbol: {
    position: 'absolute',
    width: width * 0.24,
    height: width * 0.24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planetContainer: { position: 'absolute' },
  planetButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  planetImage: { width: 74, height: 74, borderRadius: 12 },
  planetLabel: { marginTop: 6, fontSize: 12, fontWeight: '700', color: 'white', opacity: 0.9 },
  infoCard: { marginTop: 10 },
  cardGradient: { borderRadius: 16, padding: 16 },
  infoTitle: { fontSize: 18, fontWeight: '700', color: '#f6f8ff', marginBottom: 8 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  bulletDot: { color: '#dbe4ff', fontSize: 16, marginRight: 6, lineHeight: 22 },
  infoText: { fontSize: 14, color: '#e1e7ff', lineHeight: 22 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  chipText: { color: '#e8edff', fontSize: 12, fontWeight: '700' },
});
