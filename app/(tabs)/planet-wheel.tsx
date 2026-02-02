import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import PlanetDetailModal from '../components/PlanetDetailModal';
import { useProfile } from '../context/ProfileContext';
import { RETROGRADE_PLANETS } from '../types/planetDetails';
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

const PLANET_NAMES: Record<string, string> = {
  sun: 'Güneş',
  moon: 'Ay',
  mercury: 'Merkür',
  venus: 'Venüs',
  mars: 'Mars',
  jupiter: 'Jüpiter',
  saturn: 'Satürn',
  uranus: 'Uranüs',
  neptune: 'Neptün',
};

// Astrolojik açılar (aspects)
interface Aspect {
  angle: number;
  name: string;
  emoji: string;
  color: string;
  type: 'harmonious' | 'challenging' | 'neutral';
  description: string;
}

const ASPECTS: Record<string, Aspect> = {
  conjunction: { angle: 0, name: 'Kavuşum', emoji: '☌', color: '#FFD700', type: 'neutral', description: 'Enerjiler birleşir - güçlü etki' },
  semisextile: { angle: 30, name: 'Yarı Sextile', emoji: '⚺', color: '#9C27B0', type: 'neutral', description: 'Hafif uyarım - yavaş gelişim' },
  semisquare: { angle: 45, name: 'Yarı Kare', emoji: '∠', color: '#FF9800', type: 'challenging', description: 'İçsel sürtüşme - ince gerginlik' },
  sextile: { angle: 60, name: 'Sextile', emoji: '⚹', color: '#4CAF50', type: 'harmonious', description: 'Fırsat ve uyum - yaratıcı destek' },
  square: { angle: 90, name: 'Kare', emoji: '□', color: '#FF5252', type: 'challenging', description: 'Gerilim ve çatışma - büyüme fırsatı' },
  trine: { angle: 120, name: 'Trine', emoji: '△', color: '#00BCD4', type: 'harmonious', description: 'Akış ve uyum - doğal yetenek' },
  quincunx: { angle: 150, name: 'Quincunx', emoji: '⚻', color: '#795548', type: 'challenging', description: 'Uyumsuzluk - ayarlama gerekir' },
  opposition: { angle: 180, name: 'Karşıtlık', emoji: '☍', color: '#E91E63', type: 'challenging', description: 'Denge arayışı - farkındalık' },
};

function calculateAspect(angle1: number, angle2: number): Aspect | null {
  let diff = Math.abs(angle1 - angle2);
  if (diff > 180) diff = 360 - diff;
  
  const orb = 10; // Tolerans artırıldı
  
  for (const aspect of Object.values(ASPECTS)) {
    if (Math.abs(diff - aspect.angle) <= orb) {
      return aspect;
    }
  }
  return null;
}

// Genel gezegen ilişkisi (aspect bulunamazsa)
function getPlanetRelationship(planet1: string, planet2: string): { description: string; emoji: string; color: string } {
  const relationships: Record<string, Record<string, { description: string; emoji: string; color: string }>> = {
    sun: {
      moon: { description: 'Ego ve duyguların buluşması - iç dünya ile dış dünya', emoji: '☀️🌙', color: '#FFD700' },
      mercury: { description: 'Zihin ve kimlik uyumu - iletişim gücü', emoji: '☀️💬', color: '#FFA726' },
      venus: { description: 'Yaratıcılık ve aşk - kendini sevme yolculuğu', emoji: '☀️💖', color: '#FF4081' },
      mars: { description: 'İrade ve eylem - motivasyon kaynağı', emoji: '☀️⚔️', color: '#FF5252' },
      jupiter: { description: 'Büyüme ve gelişim - şans faktörü', emoji: '☀️🍀', color: '#4CAF50' },
      saturn: { description: 'Ego ve disiplin - olgunlaşma süreci', emoji: '☀️⏰', color: '#9E9E9E' },
    },
    moon: {
      mercury: { description: 'Duygular ve mantık - içsel diyalog', emoji: '🌙💭', color: '#90CAF9' },
      venus: { description: 'Duygusal ihtiyaçlar ve sevgi - şefkat bağı', emoji: '🌙💕', color: '#F48FB1' },
      mars: { description: 'Duygular ve eylem - içgüdüsel tepkiler', emoji: '🌙⚡', color: '#EF5350' },
      jupiter: { description: 'Güven ve büyüme - duygusal genişleme', emoji: '🌙✨', color: '#66BB6A' },
      saturn: { description: 'Duygusal olgunluk - sorumluluk hissi', emoji: '🌙🛡️', color: '#BDBDBD' },
    },
    mercury: {
      venus: { description: 'İletişim ve estetik - tatlı sözler', emoji: '💬💝', color: '#CE93D8' },
      mars: { description: 'Zihin ve aksiyon - keskin düşünce', emoji: '💬⚔️', color: '#FF7043' },
      jupiter: { description: 'Öğrenme ve felsefe - geniş görüş', emoji: '💬📚', color: '#4DB6AC' },
      saturn: { description: 'Disiplinli düşünce - yapılandırılmış zihin', emoji: '💬📋', color: '#A1887F' },
    },
    venus: {
      mars: { description: 'Aşk ve tutku - çekim gücü', emoji: '💖🔥', color: '#FF1744' },
      jupiter: { description: 'Bolluk ve zevk - keyif ve şans', emoji: '💖🌟', color: '#00E676' },
      saturn: { description: 'Ciddi ilişkiler - kalıcı bağlar', emoji: '💖🔒', color: '#90A4AE' },
    },
    mars: {
      jupiter: { description: 'Cesaret ve büyüme - risk alma', emoji: '⚔️🎯', color: '#FF6F00' },
      saturn: { description: 'Kontrollü güç - stratejik hareket', emoji: '⚔️🛡️', color: '#546E7A' },
    },
  };

  const rel = relationships[planet1]?.[planet2] || relationships[planet2]?.[planet1];
  if (rel) return rel;

  return { 
    description: `${PLANET_NAMES[planet1] || planet1} ve ${PLANET_NAMES[planet2] || planet2} arasında özel bir enerji alışverişi var`, 
    emoji: '🌟', 
    color: '#9C27B0' 
  };
}

export default function PlanetWheelScreen() {
  const router = useRouter();
  const { userProfile } = useProfile();
  const userZodiac = (userProfile?.zodiacSign as ZodiacSign) || undefined;
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [selectedPlanets, setSelectedPlanets] = useState<string[]>([]);
  const wheelRotation = useSharedValue(0);
  const zodiacSphereRotation = useSharedValue(0);

  useEffect(() => {
    wheelRotation.value = withRepeat(
      withTiming(360, { duration: 80000, easing: Easing.linear }),
      -1,
      false
    );
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
  };

  const onPlanetSelect = (name: string) => {
    setSelectedPlanets(prev => {
      if (prev.includes(name)) {
        return prev.filter(p => p !== name);
      } else if (prev.length < 2) {
        return [...prev, name];
      } else {
        return [prev[1], name];
      }
    });
  };

  // İki gezegen arasındaki açıyı hesapla
  const planetPositions = useMemo(() => {
    const positions: Record<string, number> = {};
    PLANETS.forEach((name, index) => {
      positions[name] = (360 / PLANETS.length) * index;
    });
    return positions;
  }, []);

  const currentAspect = useMemo(() => {
    if (selectedPlanets.length === 2) {
      const angle1 = planetPositions[selectedPlanets[0]];
      const angle2 = planetPositions[selectedPlanets[1]];
      return calculateAspect(angle1, angle2);
    }
    return null;
  }, [selectedPlanets, planetPositions]);

  const planetRelationship = useMemo(() => {
    if (selectedPlanets.length === 2) {
      return getPlanetRelationship(selectedPlanets[0], selectedPlanets[1]);
    }
    return null;
  }, [selectedPlanets]);

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
          <Text style={styles.subtitle}>Evrenin Sırlarını Keşfet</Text>
        </View>

        <View style={styles.wheelContainer}>
          <Animated.View style={[styles.wheel, wheelStyle]}>
            <View style={styles.outerRing} />
            <View style={styles.middleRing} />
            <View style={styles.innerRing} />

            {/* Merkezdeki Zodiac Sphere - Ana ekrana geri dönmek için */}
            <View style={styles.centerSymbol}>
              <TouchableOpacity onPress={() => router.back()}>
                <Image 
                  source={require('../../simgeler/gezegenler/zodiac-sphere.png')} 
                  style={styles.zodiacSphereImage} 
                />
              </TouchableOpacity>
            </View>

            {/* Gezegenler dairesel dizilim */}
            {PLANETS.map((planet, index) => {
              const angle = (2 * Math.PI * index) / PLANETS.length;
              const radius = width * 0.34;
              const x = Math.sin(angle) * radius;
              const y = -Math.cos(angle) * radius;
              const isSelected = selectedPlanets.includes(planet);
              return (
                <Animated.View
                  key={planet}
                  style={[styles.planetContainer, { transform: [{ translateX: x }, { translateY: y }] }]}
                >
                  <TouchableOpacity
                    style={[styles.planetButton, isSelected && styles.planetSelected]}
                    onPress={() => onPlanetPress(planet)}
                    onLongPress={() => onPlanetSelect(planet)}
                  >
                    <View style={styles.planetImageContainer}>
                      <Animated.Image
                        source={GEZEGEN_MAP[planet]}
                        style={[styles.planetImage, selectedPlanet === planet && { transform: [{ scale: 1.05 }] }]}
                      />
                      {RETROGRADE_PLANETS.includes(planet) && (
                        <View style={styles.retroBadge}>
                          <Text style={styles.retroText}>R</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.planetLabel}>{PLANET_NAMES[planet]}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </Animated.View>
        </View>

        {/* Aspect Bilgi Kartı (her zaman görünür ve sabit) */}
        <View style={[styles.aspectInfo, styles.aspectBelowWheel]}>
          <LinearGradient
            colors={selectedPlanets.length === 2 && currentAspect 
              ? [currentAspect.color + '40', currentAspect.color + '20']
              : ['rgba(138,43,226,0.22)', 'rgba(138,43,226,0.12)']}
            style={styles.aspectCard}
          >
            {selectedPlanets.length === 0 && (
              <View style={styles.aspectPrompt}>
                <Text style={styles.aspectPromptEmoji}>👆</Text>
                <Text style={styles.aspectPromptText}>İki gezegen seçmek için uzun bas</Text>
                <Text style={styles.aspectDescription}>
                  Seçim yapınca kart otomatik olarak açı veya enerji bilgisini gösterecek.
                </Text>
              </View>
            )}

            {selectedPlanets.length === 1 && (
              <View style={styles.aspectPrompt}>
                <Text style={styles.aspectPromptEmoji}>✨</Text>
                <Text style={styles.aspectPromptText}>Bir gezegen daha seç</Text>
                <Text style={styles.aspectSelectedPlanet}>
                  {PLANET_NAMES[selectedPlanets[0]]} seçildi
                </Text>
              </View>
            )}

            {selectedPlanets.length === 2 && currentAspect && (
              <View style={styles.aspectResult}>
                <View style={styles.aspectHeader}>
                  <Text style={styles.aspectPlanets}>
                    {PLANET_NAMES[selectedPlanets[0]]} {currentAspect.emoji} {PLANET_NAMES[selectedPlanets[1]]}
                  </Text>
                </View>
                <Text style={[styles.aspectName, { color: currentAspect.color }]}>
                  {currentAspect.name} ({currentAspect.angle}°)
                </Text>
                <View style={[styles.aspectTypeBadge, { 
                  backgroundColor: currentAspect.type === 'harmonious' ? '#4CAF5030' : 
                                   currentAspect.type === 'challenging' ? '#FF525230' : '#FFD70030'
                }]}>
                  <Text style={styles.aspectTypeText}>
                    {currentAspect.type === 'harmonious' ? '✅ Uyumlu' : 
                     currentAspect.type === 'challenging' ? '⚠️ Gerilimli' : '⚡ Güçlü'}
                  </Text>
                </View>
                <Text style={styles.aspectDescription}>{currentAspect.description}</Text>
                <TouchableOpacity 
                  onPress={() => setSelectedPlanets([])}
                  style={styles.aspectClearButton}
                >
                  <Text style={styles.aspectClearText}>Temizle ✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedPlanets.length === 2 && !currentAspect && planetRelationship && (
              <View style={styles.aspectResult}>
                <Text style={styles.aspectRelationEmoji}>{planetRelationship.emoji}</Text>
                <View style={styles.aspectHeader}>
                  <Text style={styles.aspectPlanets}>
                    {PLANET_NAMES[selectedPlanets[0]]} × {PLANET_NAMES[selectedPlanets[1]]}
                  </Text>
                </View>
                <Text style={[styles.aspectName, { color: planetRelationship.color, fontSize: 18 }]}>
                  Genel İlişki
                </Text>
                <View style={[styles.aspectTypeBadge, { backgroundColor: 'rgba(156,39,176,0.2)' }]}>
                  <Text style={styles.aspectTypeText}>🔮 Enerji Etkileşimi</Text>
                </View>
                <Text style={styles.aspectDescription}>{planetRelationship.description}</Text>
                <Text style={[styles.aspectDescription, { fontSize: 13, fontStyle: 'italic', marginTop: 8, opacity: 0.7 }]}>
                  💡 Doğum haritasında bu iki gezegenin konumuna göre etki değişir
                </Text>
                <TouchableOpacity 
                  onPress={() => setSelectedPlanets([])}
                  style={styles.aspectClearButton}
                >
                  <Text style={styles.aspectClearText}>Temizle ✕</Text>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Bilgi alanı */}
        <View style={styles.infoCard}>
          <LinearGradient 
            colors={["#1a0f4d", "#2d1b69", "#1a0f4d"]} 
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.cardGradient}
          >
            <Text style={styles.infoTitle}>✨ Astrolojide Gezegenlerin Önemi</Text>
            {[
              { emoji: '☀️', text: 'Güneş: kimlik ve yaşam enerjisi, haritanın kalbi.' },
              { emoji: '🌙', text: 'Ay: duygular, alışkanlıklar ve iç güvenlik ihtiyacı.' },
              { emoji: '☿️', text: 'Merkür: zihin, iletişim, öğrenme hızı ve merak.' },
              { emoji: '♀️', text: 'Venüs: sevgi dili, estetik, değer algısı ve çekim.' },
              { emoji: '♂️', text: 'Mars: motivasyon, eylem biçimi ve mücadele gücü.' },
              { emoji: '♃', text: 'Jüpiter: büyüme alanları, şans pencereleri ve ilham.' },
              { emoji: '♄', text: 'Satürn: sınavlar, disiplin, uzun vadeli kalıcılık.' },
              { emoji: '♅', text: 'Uranüs: özgürlük, ani uyanışlar ve yenilik dürtüsü.' },
              { emoji: '♆', text: 'Neptün: sezgi, hayal gücü, çözülme ve ilham.' },
            ].map((item, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>{item.emoji}</Text>
                <Text style={styles.infoText}>{item.text}</Text>
              </View>
            ))}
            <Text style={[styles.infoText, { marginTop: 16, backgroundColor: 'rgba(138, 43, 226, 0.2)', padding: 12, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#8A2BE2' }]}>
              Çarktaki gezegenleri incelemek, doğum haritandaki enerjilerin nasıl aktığını
              anlamanı kolaylaştırır.
            </Text>
          </LinearGradient>
        </View>

        {/* Kullanım rehberi */}
        <View style={styles.infoCard}>
          <LinearGradient 
            colors={["#0a1f44", "#1e3a6d", "#0a1f44"]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.cardGradient}
          >
            <Text style={styles.infoTitle}>🎯 Çarkı Kullanma Rehberi</Text>
            <View style={styles.bulletRow}><Text style={styles.bulletDot}>1️⃣</Text><Text style={styles.infoText}>Merkezdeki burç küresine tıklayarak ana ekrana geri dönebilirsin.</Text></View>
            <View style={styles.bulletRow}><Text style={styles.bulletDot}>2️⃣</Text><Text style={styles.infoText}>Her gezegene tıkla, kendi modalı açılır ve detaylı bilgiler görürsün.</Text></View>
            <View style={styles.bulletRow}><Text style={styles.bulletDot}>3️⃣</Text><Text style={styles.infoText}>Açılan modalda 3D gezegen + astrolojik açıklama + burcuna özel etki var.</Text></View>
            <View style={styles.bulletRow}><Text style={styles.bulletDot}>4️⃣</Text><Text style={styles.infoText}>Kendi burcuna göre etkileri okumayı unutma; yorumlar burca göre değişir.</Text></View>
            <View style={styles.bulletRow}><Text style={styles.bulletDot}>5️⃣</Text><Text style={styles.infoText}>Mobilde daha akıcı gezinmek için yavaş sürükle; çark otomatik dönüyor.</Text></View>
          </LinearGradient>
        </View>

        {/* Kısa notlar / astro ipuçları */}
        <View style={[styles.infoCard, { marginBottom: 12 }]}>
          <LinearGradient 
            colors={["#4a148c", "#7b1fa2", "#4a148c"]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.cardGradient}
          >
            <Text style={styles.infoTitle}>💫 Hızlı Astro İpuçları</Text>
            <View style={styles.chipRow}>
              {['🔄 Retrograd = içe dönüş', '⬆️ Yükselen etkileşir', '🏠 Ev konumu kritik', '📐 Açılar senaryoyu yazar'].map((chip) => (
                <View key={chip} style={styles.chip}><Text style={styles.chipText}>{chip}</Text></View>
              ))}
            </View>
            <Text style={[styles.infoText, { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.12)', padding: 14, borderRadius: 14, fontStyle: 'italic' }]}>
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
  header: { alignItems: 'center', marginTop: Platform.OS === 'ios' ? 70 : 40, marginBottom: 30 },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
    textShadowColor: 'rgba(138, 43, 226, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  subtitle: { 
    fontSize: 16, 
    color: '#E0E7FF', 
    textAlign: 'center', 
    fontWeight: '600',
    letterSpacing: 0.5,
    opacity: 0.95,
  },
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
  zodiacSphereImage: {
    width: 90,
    height: 90,
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  planetContainer: { position: 'absolute' },
  planetButton: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  planetImageContainer: {
    position: 'relative',
  },
  planetSelected: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 15,
  },
  planetImage: { 
    width: 74, 
    height: 74, 
    borderRadius: 37,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  retroBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  retroText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  planetLabel: { 
    marginTop: 8, 
    fontSize: 13, 
    fontWeight: '800', 
    color: '#ffffff', 
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  infoCard: { marginTop: 20 },
  cardGradient: { 
    borderRadius: 24, 
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  infoTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#ffffff', 
    marginBottom: 16,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  bulletRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    borderRadius: 12,
  },
  bulletDot: { 
    color: '#FFD700', 
    fontSize: 18, 
    marginRight: 10, 
    lineHeight: 24,
    fontWeight: 'bold',
  },
  infoText: { 
    fontSize: 15, 
    color: '#ffffff', 
    lineHeight: 24,
    flex: 1,
    fontWeight: '500',
  },
  chipRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10, 
    marginBottom: 16,
    marginTop: 8,
  },
  chip: { 
    backgroundColor: 'rgba(255,255,255,0.18)', 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    borderRadius: 16, 
    borderWidth: 2, 
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  chipText: { 
    color: '#ffffff', 
    fontSize: 13, 
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  aspectInfo: {
    marginTop: 20,
    marginHorizontal: 0,
  },
  aspectBelowWheel: {
    width: '100%',
  },
  aspectCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  aspectPrompt: {
    alignItems: 'center',
    gap: 8,
  },
  aspectPromptEmoji: {
    fontSize: 40,
  },
  aspectPromptText: {
    fontSize: 16,
    color: '#E0E7FF',
    fontWeight: '600',
    textAlign: 'center',
  },
  aspectSelectedPlanet: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: '800',
    marginTop: 8,
  },
  aspectResult: {
    alignItems: 'center',
    gap: 12,
  },
  aspectRelationEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  aspectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aspectPlanets: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '800',
    textAlign: 'center',
  },
  aspectName: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  aspectTypeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 4,
  },
  aspectTypeText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
  },
  aspectDescription: {
    fontSize: 15,
    color: '#E0E7FF',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  aspectClearButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  aspectClearText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  aspectNoAspect: {
    fontSize: 15,
    color: '#E0E7FF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
