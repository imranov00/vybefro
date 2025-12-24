import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Platform,
    ScrollView,
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
import Planet3D from '../components/Planet3D';
import PlanetDetailModal from '../components/PlanetDetailModal';
import UniverseModal from '../components/UniverseModal';
import { useProfile } from '../context/ProfileContext';
import { ZodiacSign, getZodiacInfo } from '../types/zodiac';

const { width, height } = Dimensions.get('window');

// Burç çarkı sembolleri
const ZODIAC_WHEEL = [
  { sign: ZodiacSign.ARIES, angle: 0 },
  { sign: ZodiacSign.TAURUS, angle: 30 },
  { sign: ZodiacSign.GEMINI, angle: 60 },
  { sign: ZodiacSign.CANCER, angle: 90 },
  { sign: ZodiacSign.LEO, angle: 120 },
  { sign: ZodiacSign.VIRGO, angle: 150 },
  { sign: ZodiacSign.LIBRA, angle: 180 },
  { sign: ZodiacSign.SCORPIO, angle: 210 },
  { sign: ZodiacSign.SAGITTARIUS, angle: 240 },
  { sign: ZodiacSign.CAPRICORN, angle: 270 },
  { sign: ZodiacSign.AQUARIUS, angle: 300 },
  { sign: ZodiacSign.PISCES, angle: 330 },
];

// Burç uyumluluk matrisi
const COMPATIBILITY_MATRIX: Record<ZodiacSign, ZodiacSign[]> = {
  [ZodiacSign.ARIES]: [ZodiacSign.LEO, ZodiacSign.SAGITTARIUS, ZodiacSign.GEMINI],
  [ZodiacSign.TAURUS]: [ZodiacSign.VIRGO, ZodiacSign.CAPRICORN, ZodiacSign.CANCER],
  [ZodiacSign.GEMINI]: [ZodiacSign.LIBRA, ZodiacSign.AQUARIUS, ZodiacSign.ARIES],
  [ZodiacSign.CANCER]: [ZodiacSign.SCORPIO, ZodiacSign.PISCES, ZodiacSign.TAURUS],
  [ZodiacSign.LEO]: [ZodiacSign.ARIES, ZodiacSign.SAGITTARIUS, ZodiacSign.GEMINI],
  [ZodiacSign.VIRGO]: [ZodiacSign.TAURUS, ZodiacSign.CAPRICORN, ZodiacSign.SCORPIO],
  [ZodiacSign.LIBRA]: [ZodiacSign.GEMINI, ZodiacSign.AQUARIUS, ZodiacSign.LEO],
  [ZodiacSign.SCORPIO]: [ZodiacSign.CANCER, ZodiacSign.PISCES, ZodiacSign.VIRGO],
  [ZodiacSign.SAGITTARIUS]: [ZodiacSign.ARIES, ZodiacSign.LEO, ZodiacSign.LIBRA],
  [ZodiacSign.CAPRICORN]: [ZodiacSign.TAURUS, ZodiacSign.VIRGO, ZodiacSign.SCORPIO],
  [ZodiacSign.AQUARIUS]: [ZodiacSign.GEMINI, ZodiacSign.LIBRA, ZodiacSign.SAGITTARIUS],
  [ZodiacSign.PISCES]: [ZodiacSign.CANCER, ZodiacSign.SCORPIO, ZodiacSign.CAPRICORN],
};

// Günlük burç yorumları
const DAILY_HOROSCOPE: Record<ZodiacSign, string> = {
  [ZodiacSign.ARIES]: "Bugün enerjiniz yüksek! Yeni başlangıçlar için mükemmel bir gün. Aşk hayatınızda heyecan verici gelişmeler olabilir.",
  [ZodiacSign.TAURUS]: "Sakin ve kararlı adımlar atın. Finansal konularda dikkatli olun. Romantik bir sürpriz sizi bekliyor olabilir.",
  [ZodiacSign.GEMINI]: "İletişim becerileriniz ön planda olacak. Yeni insanlarla tanışma fırsatı bulabilirsiniz. Merakınızı takip edin.",
  [ZodiacSign.CANCER]: "Duygusal zeka yüksek bir gün. Aile ve sevdiklerinizle kaliteli zaman geçirin. Sezgilerinize güvenin.",
  [ZodiacSign.LEO]: "Charismanız bugün herkesi büyüleyecek. Sahne alın ve kendinizi ifade edin. Yaratıcılığınızı kullanın.",
  [ZodiacSign.VIRGO]: "Detaylara odaklanın ve planlarınızı gözden geçirin. Sağlık konularında dikkatli olun. Pratik çözümler bulun.",
  [ZodiacSign.LIBRA]: "Denge ve uyum arayın. Güzellik ve sanata ilgi gösterin. İlişkilerinizde adil olmaya çalışın.",
  [ZodiacSign.SCORPIO]: "Derinlere inin ve gerçekleri keşfedin. Gizemli konular ilginizi çekebilir. Tutkularınızı takip edin.",
  [ZodiacSign.SAGITTARIUS]: "Macera ve özgürlük arayın. Yeni yerler keşfedin. Felsefik konularda düşünmeye zaman ayırın.",
  [ZodiacSign.CAPRICORN]: "Hedeflerinize odaklanın ve sabırlı olun. Kariyerinizde önemli adımlar atabilirsiniz. Disiplinli kalın.",
  [ZodiacSign.AQUARIUS]: "Farklı düşünün ve özgün olun. Teknoloji ile ilgilenin. Arkadaşlarınızla birlikte projeler geliştirin.",
  [ZodiacSign.PISCES]: "Hayal gücünüzü kullanın ve yaratıcı olun. Spiritüel konulara ilgi gösterin. Empati yeteneğinizi kullanın.",
};

export default function AstrologyScreen() {
  const colorScheme = useColorScheme();
  const { userProfile } = useProfile();
  const [selectedZodiac, setSelectedZodiac] = useState<ZodiacSign | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showUniverse, setShowUniverse] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  
  // Animasyon değerleri - sadece gerekli olanlar
  const wheelRotation = useSharedValue(0);
  const starPulse = useSharedValue(1);
  const cardScale = useSharedValue(1);
  const selectedScale = useSharedValue(1);
  
  // Kullanıcının burcu
  const userZodiac = userProfile?.zodiacSign as ZodiacSign;
  const userZodiacInfo = userZodiac ? getZodiacInfo(userZodiac) : null;

  // Sadece otomatik döndürme
  useEffect(() => {
    // Sürekli dönen animasyon
    wheelRotation.value = withRepeat(
      withTiming(360, { 
        duration: 60000, // 1 dakika
        easing: Easing.linear 
      }), 
      -1,
      false
    );

    // Yıldız pulse animasyonu
    starPulse.value = withRepeat(
      withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  // Burç seçimi
  useEffect(() => {
    if (userZodiac) {
      setSelectedZodiac(userZodiac);
    }
  }, [userZodiac]);

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wheelRotation.value}deg` }],
  }));

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starPulse.value }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const selectedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: selectedScale.value }],
  }));

  const handleZodiacSelect = (zodiac: ZodiacSign) => {
    setSelectedZodiac(zodiac);
    setShowDetails(true);
    
    // Animasyon efekti
    selectedScale.value = withSpring(1.1, { damping: 15 }, () => {
      selectedScale.value = withSpring(1);
    });
  };

  const selectedZodiacInfo = selectedZodiac ? getZodiacInfo(selectedZodiac) : null;
  const compatibleSigns = selectedZodiac ? COMPATIBILITY_MATRIX[selectedZodiac] : [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Arka plan gradyan */}
      <LinearGradient
        colors={['#0F0C29', '#302B63', '#24243e']}
        style={styles.background}
      />

      {/* Yıldız efektleri */}
      <Animated.View style={[styles.starField, starStyle]}>
        {Array.from({ length: 50 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              },
            ]}
          />
        ))}
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Başlık */}
        <View style={styles.header}>
          <Text style={styles.title}>🌟 Astroloji Rehberi</Text>
          <Text style={styles.subtitle}>
            Yıldızların Dilinde Sırlarınızı Keşfedin
          </Text>
        </View>

        {/* Burç Çarkı */}
        <View style={styles.zodiacWheelContainer}>
          <Animated.View style={[styles.zodiacWheel, wheelStyle]}>
            {/* Çark çemberleri */}
            <View style={styles.outerRing} />
            <View style={styles.middleRing} />
            <View style={styles.innerRing} />

            {/* 3D Gezegen tam ortada */}
            <View style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: [{ translateX: -70 }, { translateY: -70 }],
              zIndex: 10
            }}>
              {/* Merkez gezegen (Satürn) — dokununca evreni aç */}
              <TouchableOpacity activeOpacity={0.8} onPress={() => setShowUniverse(true)}>
                <Planet3D />
              </TouchableOpacity>
            </View>

            {/* Burç sembolleri */}
            {ZODIAC_WHEEL.map((item, index) => {
              const zodiacInfo = getZodiacInfo(item.sign);
              const isSelected = selectedZodiac === item.sign;
              const isUserZodiac = userZodiac === item.sign;
              
              return (
                <Animated.View
                  key={item.sign}
                  style={[
                    styles.zodiacContainer,
                    {
                      transform: [
                        { rotate: `${item.angle}deg` },
                        { translateY: -(width * 0.35) },
                      ],
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.zodiacButton,
                      {
                        transform: [
                          { rotate: `-${item.angle}deg` }, // Burç içeriğini düz tut
                        ],
                      },
                      isSelected && styles.selectedZodiacButton,
                      isUserZodiac && styles.userZodiacButton,
                    ]}
                    onPress={() => handleZodiacSelect(item.sign)}
                  >
                    <Text style={[
                      styles.zodiacSymbol,
                      isSelected && styles.selectedSymbol,
                      isUserZodiac && styles.userSymbol,
                    ]}>
                      {zodiacInfo?.emoji}
                    </Text>
                    <Text style={[
                      styles.zodiacName,
                      isSelected && styles.selectedName,
                      isUserZodiac && styles.userName,
                    ]}>
                      {zodiacInfo?.turkishName}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </Animated.View>
        </View>

        {/* Seçili Burç Detayları */}
        {selectedZodiacInfo && (
          <Animated.View style={[styles.detailsCard, selectedStyle]}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {selectedZodiacInfo.emoji} {selectedZodiacInfo.turkishName}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {selectedZodiacInfo.element} • {selectedZodiacInfo.planet}
                </Text>
              </View>

              <Text style={styles.description}>
                {selectedZodiacInfo.description}
              </Text>

              {/* Özellikler */}
              <View style={styles.propertiesContainer}>
                <View style={styles.propertyRow}>
                  <Text style={styles.propertyLabel}>Element:</Text>
                  <Text style={styles.propertyValue}>{selectedZodiacInfo.element}</Text>
                </View>
                <View style={styles.propertyRow}>
                  <Text style={styles.propertyLabel}>Yönetici Gezegen:</Text>
                  <Text style={styles.propertyValue}>{selectedZodiacInfo.planet}</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Günlük Burç Yorumu */}
        {selectedZodiac && (
          <Animated.View style={[styles.horoscopeCard, cardStyle]}>
            <LinearGradient
              colors={['rgba(138,43,226,0.2)', 'rgba(75,0,130,0.2)']}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>🔮 Günlük Yorum</Text>
                <Text style={styles.cardSubtitle}>
                  {new Date().toLocaleDateString('tr-TR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </Text>
              </View>
              <Text style={styles.horoscopeContent}>
                {DAILY_HOROSCOPE[selectedZodiac]}
              </Text>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Uyumlu Burçlar */}
        {compatibleSigns.length > 0 && (
          <View style={styles.compatibilityCard}>
            <LinearGradient
              colors={['rgba(255,20,147,0.2)', 'rgba(255,105,180,0.2)']}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>💕 En Uyumlu Burçlar</Text>
                <Text style={styles.cardSubtitle}>
                  {selectedZodiacInfo?.turkishName} ile uyumlu
                </Text>
              </View>
              
              <View style={styles.compatibilityList}>
                {compatibleSigns.map((sign) => {
                  const info = getZodiacInfo(sign);
                  return (
                    <TouchableOpacity
                      key={sign}
                      style={styles.compatibilityItem}
                      onPress={() => handleZodiacSelect(sign)}
                    >
                      <Text style={styles.compatibilityEmoji}>{info?.emoji}</Text>
                      <Text style={styles.compatibilityName}>{info?.turkishName}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Astroloji İpuçları */}
        <View style={styles.tipsCard}>
          <LinearGradient
            colors={['rgba(0,191,255,0.2)', 'rgba(30,144,255,0.2)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>✨ Astroloji İpuçları</Text>
            </View>
            
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>🌙</Text>
                <Text style={styles.tipText}>Yeni ay dönemlerinde yeni başlangıçlar yapın</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>☀️</Text>
                <Text style={styles.tipText}>Güneş burcunuz kişiliğinizi yansıtır</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>🌟</Text>
                <Text style={styles.tipText}>Yükselen burcunuz başkalarının sizi nasıl gördüğünü gösterir</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Modallar */}
      <UniverseModal
        visible={showUniverse}
        onClose={() => setShowUniverse(false)}
        onSelectPlanet={(name) => {
          setShowUniverse(false);
          setSelectedPlanet(name);
        }}
      />
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
    width: 2,
    height: 2,
    backgroundColor: 'white',
    borderRadius: 1,
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Platform.OS === 'ios' ? 140 : 115,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  zodiacWheelContainer: {
    alignItems: 'center',
    marginBottom: 30,
    height: width * 0.9,
  },
  zodiacWheel: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: width * 0.375,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
  },
  middleRing: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  innerRing: {
    position: 'absolute',
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  zodiacContainer: {
    position: 'absolute',
  },
  zodiacButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedZodiacButton: {
    backgroundColor: 'rgba(138,43,226,0.4)',
    borderColor: '#8A2BE2',
    borderWidth: 3,
    shadowColor: '#8A2BE2',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  userZodiacButton: {
    backgroundColor: 'rgba(255,215,0,0.4)',
    borderColor: '#FFD700',
    borderWidth: 3,
    shadowColor: '#FFD700',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  zodiacSymbol: {
    fontSize: 26,
    color: 'white',
    marginBottom: 2,
  },
  selectedSymbol: {
    color: '#8A2BE2',
  },
  userSymbol: {
    color: '#FFD700',
  },
  zodiacName: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  selectedName: {
    color: '#8A2BE2',
  },
  userName: {
    color: '#FFD700',
  },
  detailsCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  horoscopeCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  compatibilityCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  tipsCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 15,
  },
  propertiesContainer: {
    gap: 8,
  },
  propertyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propertyLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  propertyValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  horoscopeContent: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
    textAlign: 'center',
  },
  compatibilityList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 10,
  },
  compatibilityItem: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    minWidth: 70,
  },
  compatibilityEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  compatibilityName: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
    lineHeight: 20,
  },
  spacer: {
    height: 40,
  },
});