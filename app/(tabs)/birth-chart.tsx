import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import Svg, { Circle, Defs, G, Line, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { useProfile } from '../context/ProfileContext';
import { City, POPULAR_CITIES, searchCities } from '../data/cities';

const { width, height } = Dimensions.get('window');

// Gezegen resimleri
const PLANET_IMAGES: Record<string, any> = {
  SUN: require('../../simgeler/gezegenler/Gunes.png'),
  MOON: require('../../simgeler/gezegenler/ay.png'),
  MERCURY: require('../../simgeler/gezegenler/merkür.png'),
  VENUS: require('../../simgeler/gezegenler/venus.png'),
  MARS: require('../../simgeler/gezegenler/mars.png'),
  JUPITER: require('../../simgeler/gezegenler/jupiter.png'),
  SATURN: require('../../simgeler/gezegenler/saturn.png'),
  URANUS: require('../../simgeler/gezegenler/uranus.png'),
  NEPTUNE: require('../../simgeler/gezegenler/neptun.png'),
  PLUTO: require('../../simgeler/gezegenler/pluton.png'),
};

// Burç sembolleri
const ZODIAC_SYMBOLS: Record<string, string> = {
  ARIES: '♈',
  TAURUS: '♉',
  GEMINI: '♊',
  CANCER: '♋',
  LEO: '♌',
  VIRGO: '♍',
  LIBRA: '♎',
  SCORPIO: '♏',
  SAGITTARIUS: '♐',
  CAPRICORN: '♑',
  AQUARIUS: '♒',
  PISCES: '♓',
};

// Burç Türkçe isimleri
const ZODIAC_NAMES_TR: Record<string, string> = {
  ARIES: 'Koç',
  TAURUS: 'Boğa',
  GEMINI: 'İkizler',
  CANCER: 'Yengeç',
  LEO: 'Aslan',
  VIRGO: 'Başak',
  LIBRA: 'Terazi',
  SCORPIO: 'Akrep',
  SAGITTARIUS: 'Yay',
  CAPRICORN: 'Oğlak',
  AQUARIUS: 'Kova',
  PISCES: 'Balık',
};

// Gezegen Türkçe isimleri
const PLANET_NAMES_TR: Record<string, string> = {
  SUN: 'Güneş',
  MOON: 'Ay',
  MERCURY: 'Merkür',
  VENUS: 'Venüs',
  MARS: 'Mars',
  JUPITER: 'Jüpiter',
  SATURN: 'Satürn',
  URANUS: 'Uranüs',
  NEPTUNE: 'Neptün',
  PLUTO: 'Plüton',
};

// Açı türleri ve renkleri
const ASPECT_COLORS: Record<string, string> = {
  CONJUNCTION: '#FFD700',
  OPPOSITION: '#FF4444',
  TRINE: '#4CAF50',
  SQUARE: '#FF6B6B',
  SEXTILE: '#2196F3',
  QUINCUNX: '#9C27B0',
};

const ASPECT_NAMES_TR: Record<string, string> = {
  CONJUNCTION: 'Kavuşum',
  OPPOSITION: 'Karşıt',
  TRINE: 'Trigon',
  SQUARE: 'Kare',
  SEXTILE: 'Sekstil',
  QUINCUNX: 'Quincunx',
};

// API Response Types
interface PlanetData {
  name: string;
  longitude: number;
  sign: string;
  house: number;
  signDegree: number;
  nameLocalized: string;
  signLocalized: string;
}

interface HouseData {
  number: number;
  cuspLongitude: number;
  sign: string;
  signLocalized: string;
}

interface AspectData {
  planet1: string;
  planet2: string;
  aspectType: string;
  angle: number;
  orb: number;
  planet1Localized: string;
  planet2Localized: string;
  aspectTypeLocalized: string;
}

interface NatalChartResponse {
  meta: {
    requestedHouseSystem: string;
    effectiveHouseSystem: string;
    warnings: string[];
  };
  angles: {
    ascendantLongitude: number;
    midHeavenLongitude: number;
    ascendantSign: string;
    midHeavenSign: string;
    ascendantSignLocalized: string;
    midHeavenSignLocalized: string;
  };
  houses: HouseData[];
  planets: Record<string, PlanetData>;
  aspects: AspectData[];
}

type TabType = 'birth-chart' | 'chart-view' | 'aspects';

export default function BirthChartScreen() {
  const colorScheme = useColorScheme();
  const { userProfile } = useProfile();
  
  const [activeTab, setActiveTab] = useState<TabType>('birth-chart');
  const [birthDate, setBirthDate] = useState(new Date(1995, 0, 1));
  const [birthTime, setBirthTime] = useState(new Date(1995, 0, 1, 12, 0));
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  
  const [chartData, setChartData] = useState<NatalChartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [showPlanetDetail, setShowPlanetDetail] = useState(false);
  
  const [selectedAspect, setSelectedAspect] = useState<AspectData | null>(null);
  const [showAspectDetail, setShowAspectDetail] = useState(false);
  const [showFullChart, setShowFullChart] = useState(false);
  
  // Büyük Üçlü Modal
  const [selectedBigThree, setSelectedBigThree] = useState<'SUN' | 'MOON' | 'ASCENDANT' | null>(null);
  const [showBigThreeModal, setShowBigThreeModal] = useState(false);
  
  const starPulse = useSharedValue(1);
  const glowPulse = useSharedValue(0.5);
  const tabIndicatorX = useSharedValue(0);

  const filteredCities = useMemo(() => {
    if (citySearchQuery.length < 2) return POPULAR_CITIES;
    return searchCities(citySearchQuery);
  }, [citySearchQuery]);

  useEffect(() => {
    starPulse.value = withRepeat(
      withTiming(1.3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    glowPulse.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    const positions = { 'birth-chart': 0, 'chart-view': (width - 40) / 3, 'aspects': (width - 40) * 2 / 3 };
    tabIndicatorX.value = withSpring(positions[activeTab], {
      damping: 15,
      stiffness: 150
    });
  }, [activeTab]);

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starPulse.value }],
    opacity: 0.6
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value
  }));

  const tabIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabIndicatorX.value }]
  }));

  const fetchNatalChart = useCallback(async () => {
    if (!selectedCity) {
      Alert.alert('Uyarı', 'Lütfen doğum yerinizi seçin.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const year = birthDate.getFullYear();
      const month = String(birthDate.getMonth() + 1).padStart(2, '0');
      const day = String(birthDate.getDate()).padStart(2, '0');
      const hours = String(birthTime.getHours()).padStart(2, '0');
      const minutes = String(birthTime.getMinutes()).padStart(2, '0');
      const birthDateTimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;

      const requestBody = {
        birthDateTimeLocal,
        timeZoneId: selectedCity.timezone,
        latitude: selectedCity.lat,
        longitude: selectedCity.lng,
        zodiac: "TROPICAL",
        houseSystem: "WHOLE_SIGN",
        includeAspects: true,
        language: "tr"
      };

      const response = await fetch(
        'https://inherent-renate-sametbkmz-dd157ff9.koyeb.app/api/astro/natal-chart?language=tr',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error('API isteği başarısız oldu');
      }

      const rawData = await response.json();
      // API 'points' döndürüyor, biz 'planets' olarak kullanıyoruz
      const data: NatalChartResponse = {
        ...rawData,
        planets: rawData.points || rawData.planets,
      };
      console.log('Natal Chart Data:', JSON.stringify(data, null, 2));
      setChartData(data);
      setActiveTab('chart-view');
    } catch (err) {
      console.error('Natal chart error:', err);
      setError('Doğum haritası hesaplanırken bir hata oluştu. Lütfen tekrar deneyin.');
      Alert.alert('Hata', 'Doğum haritası hesaplanırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, [birthDate, birthTime, selectedCity]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    // Android'de picker otomatik kapanır, iOS'ta modal içinde olduğu için kapanmaz
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    // Android'de picker otomatik kapanır, iOS'ta modal içinde olduğu için kapanmaz
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      setBirthTime(selectedTime);
    }
  };

  const NatalChartWheel = ({ data }: { data: NatalChartResponse }) => {
    // Early return if data is incomplete
    if (!data || !data.planets || !data.angles || !data.houses) {
      return (
        <View style={{ alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Text style={{ color: '#fff' }}>Harita yükleniyor...</Text>
        </View>
      );
    }
    
    // Oransal boyutlandırma - her şey chartSize'a göre hesaplanıyor
    const chartSize = width - 32;
    const centerX = chartSize / 2;
    const centerY = chartSize / 2;
    
    // Çember yarıçapları - oransal
    const outerRadius = chartSize / 2 - 8;
    const zodiacOuterRadius = outerRadius - 2; // Burç bandı dış
    const zodiacInnerRadius = outerRadius - 28; // Burç bandı iç
    const houseRadius = zodiacInnerRadius - 4; // Ev sınırları
    const planetRadius = houseRadius - 35; // Gezegen bandı
    const innerRadius = planetRadius - 20; // Açı çizgileri iç
    const centerRadius = innerRadius - 15; // Merkez

    // Derece işaretlerini render et
    const renderDegreeMarks = () => {
      const marks = [];
      for (let i = 0; i < 360; i += 5) {
        const angle = (i - 90) * (Math.PI / 180);
        const isMajor = i % 30 === 0;
        const isMedium = i % 10 === 0;
        
        const outerR = outerRadius;
        let innerR = outerRadius - 4;
        let strokeW = 0.5;
        let strokeColor = 'rgba(157, 78, 221, 0.25)';
        
        if (isMajor) {
          innerR = zodiacOuterRadius;
          strokeW = 1.5;
          strokeColor = 'rgba(157, 78, 221, 0.7)';
        } else if (isMedium) {
          innerR = outerRadius - 6;
          strokeW = 0.8;
          strokeColor = 'rgba(157, 78, 221, 0.4)';
        }
        
        marks.push(
          <Line
            key={`tick-${i}`}
            x1={centerX + innerR * Math.cos(angle)}
            y1={centerY + innerR * Math.sin(angle)}
            x2={centerX + outerR * Math.cos(angle)}
            y2={centerY + outerR * Math.sin(angle)}
            stroke={strokeColor}
            strokeWidth={strokeW}
          />
        );
      }
      return marks;
    };

    // Burç sembolleri
    const renderZodiacSigns = () => {
      const signs = ['ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO', 
                     'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES'];
      
      const elementColors: Record<string, string> = {
        ARIES: '#FF6B6B', TAURUS: '#7CB342', GEMINI: '#64B5F6', CANCER: '#B0BEC5',
        LEO: '#FFB300', VIRGO: '#7CB342', LIBRA: '#64B5F6', SCORPIO: '#B0BEC5',
        SAGITTARIUS: '#FF6B6B', CAPRICORN: '#7CB342', AQUARIUS: '#64B5F6', PISCES: '#B0BEC5',
      };
      
      const zodiacMidRadius = (zodiacOuterRadius + zodiacInnerRadius) / 2;
      
      return signs.map((sign, index) => {
        const midAngle = ((index * 30 + 15) - 90) * (Math.PI / 180);
        const x = centerX + zodiacMidRadius * Math.cos(midAngle);
        const y = centerY + zodiacMidRadius * Math.sin(midAngle);
        
        return (
          <SvgText
            key={sign}
            x={x}
            y={y}
            fontSize={14}
            fill={elementColors[sign]}
            textAnchor="middle"
            alignmentBaseline="central"
            fontWeight="600"
          >
            {ZODIAC_SYMBOLS[sign]}
          </SvgText>
        );
      });
    };

    // Ev çizgileri ve numaraları
    const renderHouses = () => {
      return data.houses.map((house) => {
        const angle = (house.cuspLongitude - data.angles.ascendantLongitude - 90) * (Math.PI / 180);
        
        // Ev çizgisi - merkeze kadar
        const x1 = centerX + centerRadius * Math.cos(angle);
        const y1 = centerY + centerRadius * Math.sin(angle);
        const x2 = centerX + zodiacInnerRadius * Math.cos(angle);
        const y2 = centerY + zodiacInnerRadius * Math.sin(angle);
        
        // Ev numarası - ev ortasında
        const nextHouse = data.houses.find(h => h.number === (house.number % 12) + 1);
        const nextCusp = nextHouse ? nextHouse.cuspLongitude : house.cuspLongitude + 30;
        let midLongitude = (house.cuspLongitude + nextCusp) / 2;
        if (nextCusp < house.cuspLongitude) midLongitude = (house.cuspLongitude + nextCusp + 360) / 2;
        const midAngle = ((midLongitude - data.angles.ascendantLongitude) - 90) * (Math.PI / 180);
        const numRadius = centerRadius + 20;
        const numX = centerX + numRadius * Math.cos(midAngle);
        const numY = centerY + numRadius * Math.sin(midAngle);
        
        const isCardinal = [1, 4, 7, 10].includes(house.number);
        
        return (
          <G key={`house-${house.number}`}>
            <Line
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isCardinal ? 'rgba(157, 78, 221, 0.7)' : 'rgba(157, 78, 221, 0.25)'}
              strokeWidth={isCardinal ? 1.5 : 0.8}
            />
            <SvgText
              x={numX} y={numY}
              fontSize={9}
              fill={isCardinal ? 'rgba(157, 78, 221, 0.9)' : 'rgba(255,255,255,0.4)'}
              textAnchor="middle"
              alignmentBaseline="central"
              fontWeight={isCardinal ? 'bold' : 'normal'}
            >
              {house.number}
            </SvgText>
          </G>
        );
      });
    };

    // Gezegenler - çakışma önleme algoritması ile
    const renderPlanets = () => {
      const planets = Object.values(data.planets);
      
      // Gezegenleri açıya göre sırala
      const sortedPlanets = [...planets].sort((a, b) => {
        const angleA = a.longitude - data.angles.ascendantLongitude;
        const angleB = b.longitude - data.angles.ascendantLongitude;
        return angleA - angleB;
      });
      
      // Çakışma kontrolü için pozisyonları hesapla
      const positions: { planet: typeof planets[0]; angle: number; radius: number; layer: number }[] = [];
      
      sortedPlanets.forEach((planet) => {
        const baseAngle = ((planet.longitude - data.angles.ascendantLongitude) - 90) * (Math.PI / 180);
        
        // Çakışma kontrolü
        let layer = 0;
        const minDistance = 18; // Minimum piksel mesafesi
        
        for (const pos of positions) {
          const angleDiff = Math.abs(baseAngle - pos.angle);
          const normalizedDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);
          const arcDistance = normalizedDiff * planetRadius;
          
          if (arcDistance < minDistance && pos.layer === layer) {
            layer++;
          }
        }
        
        positions.push({ planet, angle: baseAngle, radius: planetRadius - layer * 16, layer });
      });
      
      return positions.map(({ planet, angle, radius }) => {
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        // Derece hesapla
        const deg = Math.floor(planet.signDegree);
        const min = Math.floor((planet.signDegree - deg) * 60);
        
        // Derece yazısı için konum (gezegen dışında, burç bandına doğru)
        const degRadius = radius + 14;
        const degX = centerX + degRadius * Math.cos(angle);
        const degY = centerY + degRadius * Math.sin(angle);
        
        return (
          <G key={planet.name}>
            {/* Gezegen dairesi */}
            <Circle
              cx={x} cy={y} r={9}
              fill={getPlanetColor(planet.name)}
              stroke="rgba(255,255,255,0.6)"
              strokeWidth={1}
            />
            {/* Gezegen sembolü */}
            <SvgText
              x={x} y={y + 0.5}
              fontSize={9}
              fill="#fff"
              textAnchor="middle"
              alignmentBaseline="central"
              fontWeight="bold"
            >
              {getPlanetSymbol(planet.name)}
            </SvgText>
            {/* Derece */}
            <SvgText
              x={degX} y={degY}
              fontSize={6}
              fill={getPlanetColor(planet.name)}
              textAnchor="middle"
              alignmentBaseline="central"
            >
              {deg}°{min.toString().padStart(2, '0')}'
            </SvgText>
          </G>
        );
      });
    };

    // Açı çizgileri
    const renderAspects = () => {
      if (!data.aspects || !data.planets) return null;
      
      const getStyle = (type: string) => {
        switch (type) {
          case 'CONJUNCTION': return { color: '#FFD700', width: 1.2 };
          case 'OPPOSITION': return { color: '#E53935', width: 1.2 };
          case 'TRINE': return { color: '#1E88E5', width: 1 };
          case 'SQUARE': return { color: '#F4511E', width: 1 };
          case 'SEXTILE': return { color: '#43A047', width: 0.8, dash: '4,2' };
          default: return { color: 'rgba(150,150,150,0.3)', width: 0.5, dash: '2,2' };
        }
      };
      
      return data.aspects.slice(0, 15).map((aspect, i) => {
        const p1 = data.planets[aspect.planet1];
        const p2 = data.planets[aspect.planet2];
        if (!p1 || !p2) return null;
        
        const a1 = ((p1.longitude - data.angles.ascendantLongitude) - 90) * (Math.PI / 180);
        const a2 = ((p2.longitude - data.angles.ascendantLongitude) - 90) * (Math.PI / 180);
        const r = innerRadius;
        
        const style = getStyle(aspect.aspectType);
        
        return (
          <Line
            key={`asp-${i}`}
            x1={centerX + r * Math.cos(a1)}
            y1={centerY + r * Math.sin(a1)}
            x2={centerX + r * Math.cos(a2)}
            y2={centerY + r * Math.sin(a2)}
            stroke={style.color}
            strokeWidth={style.width}
            opacity={0.6}
            strokeDasharray={style.dash}
          />
        );
      });
    };

    // AC, DC, MC, IC etiketleri
    const renderAngles = () => {
      const r = zodiacInnerRadius - 12;
      return (
        <G>
          <SvgText x={centerX + r} y={centerY} fontSize={9} fill="#FFD700" fontWeight="bold" textAnchor="start" alignmentBaseline="central">AC</SvgText>
          <SvgText x={centerX - r} y={centerY} fontSize={9} fill="#FFD700" fontWeight="bold" textAnchor="end" alignmentBaseline="central">DC</SvgText>
          <SvgText x={centerX} y={centerY - r} fontSize={9} fill="#FFD700" fontWeight="bold" textAnchor="middle" alignmentBaseline="baseline">MC</SvgText>
          <SvgText x={centerX} y={centerY + r} fontSize={9} fill="#FFD700" fontWeight="bold" textAnchor="middle" alignmentBaseline="hanging">IC</SvgText>
        </G>
      );
    };

    return (
      <View style={styles.chartWheelContainer}>
        <Svg width={chartSize} height={chartSize} viewBox={`0 0 ${chartSize} ${chartSize}`}>
          <Defs>
            <RadialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#0d0d1a" />
              <Stop offset="100%" stopColor="#1a1a2e" />
            </RadialGradient>
          </Defs>
          
          {/* Arka plan */}
          <Circle cx={centerX} cy={centerY} r={outerRadius} fill="url(#bgGrad)" />
          
          {/* Dış çember */}
          <Circle cx={centerX} cy={centerY} r={outerRadius} stroke="#9D4EDD" strokeWidth={2} fill="none" />
          
          {/* Derece işaretleri */}
          {renderDegreeMarks()}
          
          {/* Burç bandı çemberleri */}
          <Circle cx={centerX} cy={centerY} r={zodiacOuterRadius} stroke="rgba(157, 78, 221, 0.5)" strokeWidth={1} fill="none" />
          <Circle cx={centerX} cy={centerY} r={zodiacInnerRadius} stroke="rgba(157, 78, 221, 0.5)" strokeWidth={1} fill="none" />
          
          {/* Burç ayırıcı çizgileri */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            return (
              <Line
                key={`zl-${i}`}
                x1={centerX + zodiacInnerRadius * Math.cos(angle)}
                y1={centerY + zodiacInnerRadius * Math.sin(angle)}
                x2={centerX + zodiacOuterRadius * Math.cos(angle)}
                y2={centerY + zodiacOuterRadius * Math.sin(angle)}
                stroke="rgba(157, 78, 221, 0.5)"
                strokeWidth={1}
              />
            );
          })}
          
          {/* İç çemberler */}
          <Circle cx={centerX} cy={centerY} r={houseRadius} stroke="rgba(157, 78, 221, 0.2)" strokeWidth={0.5} fill="none" />
          <Circle cx={centerX} cy={centerY} r={innerRadius} stroke="rgba(157, 78, 221, 0.3)" strokeWidth={1} fill="none" />
          <Circle cx={centerX} cy={centerY} r={centerRadius} stroke="rgba(157, 78, 221, 0.3)" strokeWidth={1} fill="rgba(10,10,20,0.5)" />
          
          {/* Açılar */}
          {renderAspects()}
          
          {/* Evler */}
          {renderHouses()}
          
          {/* Burç sembolleri */}
          {renderZodiacSigns()}
          
          {/* Gezegenler */}
          {renderPlanets()}
          
          {/* Köşe etiketleri */}
          {renderAngles()}
        </Svg>
      </View>
    );
  };

  // Açı detay açıklamaları
  const ASPECT_DESCRIPTIONS: Record<string, string> = {
    CONJUNCTION: 'Kavuşum açısı (0°), iki gezegenin enerjilerinin birleştiği ve güçlendiği bir açıdır. Bu açı yoğun bir odak noktası oluşturur.',
    OPPOSITION: 'Karşıt açı (180°), iki gezegen arasındaki gerilimi ve dengeleme ihtiyacını gösterir. Bu açı farkındalık ve büyüme potansiyeli taşır.',
    TRINE: 'Trigon açısı (120°), uyum ve doğal yetenek gösterir. İki gezegen birbirini destekler ve enerji akışı kolaydır.',
    SQUARE: 'Kare açısı (90°), zorluk ve gerilim yaratır ama aynı zamanda büyüme ve gelişme potansiyeli taşır.',
    SEXTILE: 'Sekstil açısı (60°), fırsatlar ve olumlu etkileşimler sunar. Potansiyeli kullanmak için biraz çaba gerekir.',
    QUINCUNX: 'Quincunx açısı (150°), ayarlama ve uyum sağlama gerektiren bir açıdır. İki gezegen arasında doğrudan bağlantı yoktur.',
  };

  const getPlanetColor = (planet: string): string => {
    const colors: Record<string, string> = {
      SUN: '#FFD700',
      MOON: '#C0C0C0',
      MERCURY: '#87CEEB',
      VENUS: '#FF69B4',
      MARS: '#FF4500',
      JUPITER: '#FFA500',
      SATURN: '#8B7355',
      URANUS: '#00CED1',
      NEPTUNE: '#4169E1',
      PLUTO: '#8B0000',
    };
    return colors[planet] || '#fff';
  };

  const getPlanetSymbol = (planet: string): string => {
    const symbols: Record<string, string> = {
      SUN: '☉',
      MOON: '☽',
      MERCURY: '☿',
      VENUS: '♀',
      MARS: '♂',
      JUPITER: '♃',
      SATURN: '♄',
      URANUS: '♅',
      NEPTUNE: '♆',
      PLUTO: '♇',
    };
    return symbols[planet] || '?';
  };

  const PlanetCard = ({ planet }: { planet: PlanetData }) => {
    const planetImage = PLANET_IMAGES[planet.name];
    const degree = Math.floor(planet.signDegree);
    const minutes = Math.floor((planet.signDegree - degree) * 60);
    
    return (
      <TouchableOpacity 
        style={styles.planetCard}
        onPress={() => {
          setSelectedPlanet(planet);
          setShowPlanetDetail(true);
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['rgba(157, 78, 221, 0.15)', 'rgba(75, 0, 130, 0.1)']}
          style={styles.planetCardGradient}
        >
          <View style={styles.planetCardHeader}>
            {planetImage && (
              <Image 
                source={planetImage} 
                style={styles.planetImage}
                resizeMode="contain"
              />
            )}
            <View style={styles.planetCardInfo}>
              <Text style={styles.planetCardName}>
                {PLANET_NAMES_TR[planet.name] || planet.nameLocalized}
              </Text>
              <View style={styles.planetCardSignRow}>
                <Text style={styles.planetCardSymbol}>
                  {ZODIAC_SYMBOLS[planet.sign]}
                </Text>
                <Text style={styles.planetCardSign}>
                  {ZODIAC_NAMES_TR[planet.sign] || planet.signLocalized}
                </Text>
              </View>
            </View>
            <View style={styles.planetCardRight}>
              <Text style={styles.planetCardDegree}>
                {degree}° {minutes}'
              </Text>
              <View style={styles.planetCardHouse}>
                <Text style={styles.houseNumber}>{planet.house}</Text>
                <Text style={styles.houseLabel}>Ev</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const AspectCard = ({ aspect }: { aspect: AspectData }) => {
    return (
      <TouchableOpacity 
        style={styles.aspectCard}
        onPress={() => {
          setSelectedAspect(aspect);
          setShowAspectDetail(true);
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.aspectIndicator, { backgroundColor: ASPECT_COLORS[aspect.aspectType] || '#666' }]} />
        <View style={styles.aspectContent}>
          <View style={styles.aspectPlanets}>
            <Text style={styles.aspectPlanetName}>
              {PLANET_NAMES_TR[aspect.planet1] || aspect.planet1Localized}
            </Text>
            <View style={[styles.aspectTypeBadge, { backgroundColor: ASPECT_COLORS[aspect.aspectType] || '#666' }]}>
              <Text style={styles.aspectTypeText}>
                {ASPECT_NAMES_TR[aspect.aspectType] || aspect.aspectTypeLocalized}
              </Text>
            </View>
            <Text style={styles.aspectPlanetName}>
              {PLANET_NAMES_TR[aspect.planet2] || aspect.planet2Localized}
            </Text>
          </View>
          <Text style={styles.aspectOrb}>
            Orb: {aspect.orb.toFixed(1)}°
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      <LinearGradient
        colors={['#0F0C29', '#302B63', '#1a1a2e']}
        style={styles.background}
      />

      <Animated.View style={[styles.starField, starStyle]}>
        {Array.from({ length: 60 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
              },
            ]}
          />
        ))}
      </Animated.View>

      <Animated.View style={[styles.glowEffect, glowStyle]} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.header}>
          <Text style={styles.title}>🌌 Doğum Haritası</Text>
          <Text style={styles.subtitle}>
            Kozmik Haritanızı Keşfedin
          </Text>
        </Animated.View>

        {chartData && (
          <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.tabContainer}>
            <View style={styles.tabBackground}>
              <Animated.View style={[styles.tabIndicator, tabIndicatorStyle]} />
              
              <TouchableOpacity
                style={styles.tab}
                onPress={() => setActiveTab('birth-chart')}
              >
                <Ionicons 
                  name="create-outline" 
                  size={18} 
                  color={activeTab === 'birth-chart' ? '#fff' : 'rgba(255,255,255,0.5)'} 
                />
                <Text style={[
                  styles.tabText,
                  activeTab === 'birth-chart' && styles.activeTabText
                ]}>
                  Bilgiler
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.tab}
                onPress={() => setActiveTab('chart-view')}
              >
                <MaterialCommunityIcons 
                  name="zodiac-aries" 
                  size={18} 
                  color={activeTab === 'chart-view' ? '#fff' : 'rgba(255,255,255,0.5)'} 
                />
                <Text style={[
                  styles.tabText,
                  activeTab === 'chart-view' && styles.activeTabText
                ]}>
                  Harita
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.tab}
                onPress={() => setActiveTab('aspects')}
              >
                <Ionicons 
                  name="git-network-outline" 
                  size={18} 
                  color={activeTab === 'aspects' ? '#fff' : 'rgba(255,255,255,0.5)'} 
                />
                <Text style={[
                  styles.tabText,
                  activeTab === 'aspects' && styles.activeTabText
                ]}>
                  Açılar
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {activeTab === 'birth-chart' && (
          <Animated.View entering={FadeIn.delay(400).duration(500)}>
            <View style={styles.formCard}>
              <LinearGradient
                colors={['rgba(138,43,226,0.2)', 'rgba(75,0,130,0.15)']}
                style={styles.formGradient}
              >
                <Text style={styles.formTitle}>📅 Doğum Bilgileriniz</Text>
                <Text style={styles.formSubtitle}>
                  Doğum saatiniz doğru sonuçlar için zorunludur
                </Text>
                
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={24} color="#9D4EDD" />
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>Doğum Tarihi</Text>
                    <Text style={styles.inputValue}>
                      {birthDate.toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time" size={24} color="#FF6B6B" />
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>Doğum Saati (Zorunlu)</Text>
                    <Text style={styles.inputValue}>
                      {birthTime.toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>!</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowCityPicker(true)}
                >
                  <Ionicons name="location" size={24} color="#9D4EDD" />
                  <View style={styles.inputContent}>
                    <Text style={styles.inputLabel}>Doğum Yeri</Text>
                    <Text style={[
                      styles.inputValue,
                      !selectedCity && { color: 'rgba(255,255,255,0.4)' }
                    ]}>
                      {selectedCity ? `${selectedCity.name}, ${selectedCity.country}` : 'Şehir seçin...'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.calculateButton, isLoading && styles.calculatingButton]}
                  onPress={fetchNatalChart}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={isLoading ? ['#666', '#444'] : ['#9D4EDD', '#7B2CBF']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator color="#fff" size="small" />
                        <Text style={styles.buttonText}>Hesaplanıyor...</Text>
                      </View>
                    ) : (
                      <>
                        <MaterialCommunityIcons name="chart-arc" size={24} color="#fff" />
                        <Text style={styles.buttonText}>Haritamı Hesapla</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>

            {chartData && chartData.planets && (
              <Animated.View entering={FadeInUp.delay(200).duration(600)}>
                <View style={styles.bigThreeContainer}>
                  <Text style={styles.sectionTitle}>✨ Büyük Üçlünüz</Text>
                  <Text style={styles.bigThreeHint}>Detay için üzerine dokunun</Text>
                  
                  <View style={styles.bigThreeCards}>
                    <TouchableOpacity 
                      style={styles.bigThreeCard}
                      onPress={() => {
                        setSelectedBigThree('SUN');
                        setShowBigThreeModal(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={['rgba(255,215,0,0.3)', 'rgba(255,165,0,0.2)']}
                        style={styles.bigThreeGradient}
                      >
                        <Image 
                          source={PLANET_IMAGES.SUN} 
                          style={styles.bigThreeImage}
                          resizeMode="contain"
                        />
                        <Text style={styles.bigThreeLabel}>Güneş</Text>
                        <Text style={styles.bigThreeSign}>
                          {ZODIAC_SYMBOLS[chartData.planets.SUN?.sign] || ''} {ZODIAC_NAMES_TR[chartData.planets.SUN?.sign] || ''}
                        </Text>
                        <Text style={styles.bigThreeDescription}>
                          Temel kişiliğiniz
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.bigThreeCard}
                      onPress={() => {
                        setSelectedBigThree('MOON');
                        setShowBigThreeModal(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={['rgba(192,192,192,0.3)', 'rgba(128,128,128,0.2)']}
                        style={styles.bigThreeGradient}
                      >
                        <Image 
                          source={PLANET_IMAGES.MOON} 
                          style={styles.bigThreeImage}
                          resizeMode="contain"
                        />
                        <Text style={styles.bigThreeLabel}>Ay</Text>
                        <Text style={styles.bigThreeSign}>
                          {ZODIAC_SYMBOLS[chartData.planets.MOON?.sign] || ''} {ZODIAC_NAMES_TR[chartData.planets.MOON?.sign] || ''}
                        </Text>
                        <Text style={styles.bigThreeDescription}>
                          Duygusal dünyanız
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.bigThreeCard}
                      onPress={() => {
                        setSelectedBigThree('ASCENDANT');
                        setShowBigThreeModal(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={['rgba(156,39,176,0.3)', 'rgba(123,31,162,0.2)']}
                        style={styles.bigThreeGradient}
                      >
                        <View style={styles.ascendantIcon}>
                          <Ionicons name="arrow-up" size={28} color="#FFD700" />
                        </View>
                        <Text style={styles.bigThreeLabel}>Yükselen</Text>
                        <Text style={styles.bigThreeSign}>
                          {ZODIAC_SYMBOLS[chartData.angles?.ascendantSign] || ''} {ZODIAC_NAMES_TR[chartData.angles?.ascendantSign] || ''}
                        </Text>
                        <Text style={styles.bigThreeDescription}>
                          Dışa yansımanız
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            )}
          </Animated.View>
        )}

        {activeTab === 'chart-view' && chartData && (
          <Animated.View entering={FadeIn.delay(200).duration(500)}>
            {/* Yükselen Burç Başlığı */}
            {chartData.angles && (
              <View style={styles.ascendantBadge}>
                <LinearGradient
                  colors={['rgba(157, 78, 221, 0.3)', 'rgba(123, 44, 191, 0.2)']}
                  style={styles.ascendantGradient}
                >
                  <Ionicons name="arrow-up" size={20} color="#FFD700" />
                  <Text style={styles.ascendantLabel}>Yükselen Burcunuz</Text>
                  <Text style={styles.ascendantSign}>
                    {ZODIAC_SYMBOLS[chartData.angles.ascendantSign]} {ZODIAC_NAMES_TR[chartData.angles.ascendantSign] || chartData.angles.ascendantSignLocalized}
                  </Text>
                </LinearGradient>
              </View>
            )}
            
            {/* Haritaya basılı tutunca tam ekran açılsın */}
            <TouchableOpacity
              onLongPress={() => setShowFullChart(true)}
              delayLongPress={500}
              activeOpacity={0.9}
              style={styles.chartTouchable}
            >
              <NatalChartWheel data={chartData} />
              <Text style={styles.chartHint}>Haritayı büyütmek için basılı tutun</Text>
            </TouchableOpacity>
            
            <View style={styles.legendContainer}>
              <Text style={styles.legendTitle}>Harita Açıklaması</Text>
              <View style={styles.legendGrid}>
                <View style={styles.legendItem}>
                  <Text style={styles.legendColor}>AC</Text>
                  <Text style={styles.legendText}>Yükselen</Text>
                </View>
                <View style={styles.legendItem}>
                  <Text style={styles.legendColor}>MC</Text>
                  <Text style={styles.legendText}>Gökyüzü Ortası</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.planetsListContainer}>
              <Text style={styles.sectionTitle}>🪐 Gezegen Konumları</Text>
              {chartData.planets && Object.values(chartData.planets).map((planet) => (
                <PlanetCard key={planet.name} planet={planet} />
              ))}
            </View>
          </Animated.View>
        )}

        {activeTab === 'aspects' && chartData && (
          <Animated.View entering={FadeIn.delay(200).duration(500)}>
            <View style={styles.aspectsContainer}>
              <Text style={styles.sectionTitle}>🔗 Gezegen Açıları</Text>
              <Text style={styles.sectionSubtitle}>
                Gezegenler arasındaki enerji bağlantıları
              </Text>
              
              <View style={styles.aspectLegend}>
                {Object.entries(ASPECT_COLORS).slice(0, 5).map(([type, color]) => (
                  <View key={type} style={styles.aspectLegendItem}>
                    <View style={[styles.aspectLegendDot, { backgroundColor: color }]} />
                    <Text style={styles.aspectLegendText}>
                      {ASPECT_NAMES_TR[type]}
                    </Text>
                  </View>
                ))}
              </View>
              
              {chartData.aspects && chartData.aspects.map((aspect, index) => (
                <AspectCard key={index} aspect={aspect} />
              ))}
            </View>
          </Animated.View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* iOS için Date Picker Modal */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={showDatePicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalContainer}>
              <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f0c29']}
                style={styles.pickerModalGradient}
              >
                <View style={styles.pickerModalHeader}>
                  <Text style={styles.pickerModalTitle}>📅 Doğum Tarihi</Text>
                  <TouchableOpacity
                    style={styles.pickerModalDoneButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.pickerModalDoneText}>Tamam</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={birthDate}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1920, 0, 1)}
                  style={styles.iosPicker}
                  textColor="#fff"
                />
              </LinearGradient>
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1920, 0, 1)}
          />
        )
      )}

      {/* iOS için Time Picker Modal */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={showTimePicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalContainer}>
              <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f0c29']}
                style={styles.pickerModalGradient}
              >
                <View style={styles.pickerModalHeader}>
                  <Text style={styles.pickerModalTitle}>🕐 Doğum Saati</Text>
                  <TouchableOpacity
                    style={styles.pickerModalDoneButton}
                    onPress={() => setShowTimePicker(false)}
                  >
                    <Text style={styles.pickerModalDoneText}>Tamam</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={birthTime}
                  mode="time"
                  display="spinner"
                  onChange={onTimeChange}
                  is24Hour={true}
                  style={styles.iosPicker}
                  textColor="#fff"
                />
              </LinearGradient>
            </View>
          </View>
        </Modal>
      ) : (
        showTimePicker && (
          <DateTimePicker
            value={birthTime}
            mode="time"
            display="default"
            onChange={onTimeChange}
            is24Hour={true}
          />
        )
      )}

      <Modal
        visible={showCityPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCityPicker(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.cityModalContainer}>
            <LinearGradient
              colors={['#1a1a2e', '#16213e', '#0f0c29']}
              style={styles.cityModalGradient}
            >
              <View style={styles.cityModalHeader}>
                <Text style={styles.cityModalTitle}>🌍 Şehir Seçin</Text>
                <TouchableOpacity
                  style={styles.cityModalCloseButton}
                  onPress={() => {
                    setShowCityPicker(false);
                    setCitySearchQuery('');
                  }}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.citySearchContainer}>
                <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
                <TextInput
                  style={styles.citySearchInput}
                  placeholder="Şehir veya ülke ara..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={citySearchQuery}
                  onChangeText={setCitySearchQuery}
                  autoFocus={true}
                />
                {citySearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setCitySearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.citySectionTitle}>
                {citySearchQuery.length < 2 ? '⭐ Popüler Şehirler' : `🔍 Sonuçlar (${filteredCities.length})`}
              </Text>

              <FlatList
                data={filteredCities}
                keyExtractor={(item) => `${item.name}-${item.country}`}
                showsVerticalScrollIndicator={false}
                style={styles.cityList}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="location-outline" size={48} color="rgba(255,255,255,0.3)" />
                    <Text style={styles.emptyText}>Şehir bulunamadı</Text>
                    <Text style={styles.emptySubtext}>Farklı bir arama deneyin</Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.cityItem,
                      selectedCity?.name === item.name && selectedCity?.country === item.country && styles.selectedCityItem
                    ]}
                    onPress={() => {
                      setSelectedCity(item);
                      setShowCityPicker(false);
                      setCitySearchQuery('');
                    }}
                  >
                    <View style={styles.cityItemContent}>
                      <View style={styles.cityItemFlag}>
                        <Ionicons 
                          name={item.country === 'Türkiye' ? 'flag' : 'earth'} 
                          size={24} 
                          color={item.country === 'Türkiye' ? '#E30A17' : '#9D4EDD'} 
                        />
                      </View>
                      <View style={styles.cityItemInfo}>
                        <Text style={styles.cityItemName}>{item.name}</Text>
                        <Text style={styles.cityItemCountry}>{item.country}</Text>
                      </View>
                    </View>
                    {selectedCity?.name === item.name && selectedCity?.country === item.country && (
                      <Ionicons name="checkmark-circle" size={24} color="#9D4EDD" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </LinearGradient>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showPlanetDetail}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowPlanetDetail(false)}
      >
        <View style={styles.planetDetailOverlay}>
          <View style={styles.planetDetailContainer}>
            <LinearGradient
              colors={['#1a1a2e', '#302B63', '#0f0c29']}
              style={styles.planetDetailGradient}
            >
              {selectedPlanet && (
                <>
                  <TouchableOpacity
                    style={styles.planetDetailClose}
                    onPress={() => setShowPlanetDetail(false)}
                  >
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                  
                  <Image 
                    source={PLANET_IMAGES[selectedPlanet.name]} 
                    style={styles.planetDetailImage}
                    resizeMode="contain"
                  />
                  
                  <Text style={styles.planetDetailName}>
                    {PLANET_NAMES_TR[selectedPlanet.name]}
                  </Text>
                  
                  <View style={styles.planetDetailRow}>
                    <View style={styles.planetDetailItem}>
                      <Text style={styles.planetDetailLabel}>Burç</Text>
                      <Text style={styles.planetDetailValue}>
                        {ZODIAC_SYMBOLS[selectedPlanet.sign]} {ZODIAC_NAMES_TR[selectedPlanet.sign]}
                      </Text>
                    </View>
                    <View style={styles.planetDetailItem}>
                      <Text style={styles.planetDetailLabel}>Derece</Text>
                      <Text style={styles.planetDetailValue}>
                        {Math.floor(selectedPlanet.signDegree)}° {Math.floor((selectedPlanet.signDegree % 1) * 60)}'
                      </Text>
                    </View>
                    <View style={styles.planetDetailItem}>
                      <Text style={styles.planetDetailLabel}>Ev</Text>
                      <Text style={styles.planetDetailValue}>
                        {selectedPlanet.house}. Ev
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.planetDetailDescription}>
                    <Text style={styles.planetDetailDescTitle}>
                      {PLANET_NAMES_TR[selectedPlanet.name]} {ZODIAC_NAMES_TR[selectedPlanet.sign]} Burcunda
                    </Text>
                    <Text style={styles.planetDetailDescText}>
                      {getPlanetDescription(selectedPlanet.name, selectedPlanet.sign)}
                    </Text>
                  </View>
                </>
              )}
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Açı Detay Modalı */}
      <Modal
        visible={showAspectDetail}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAspectDetail(false)}
      >
        <View style={styles.planetDetailOverlay}>
          <View style={styles.aspectDetailContainer}>
            <LinearGradient
              colors={['#1a1a2e', '#302B63', '#0f0c29']}
              style={styles.aspectDetailGradient}
            >
              {selectedAspect && (
                <>
                  <TouchableOpacity
                    style={styles.planetDetailClose}
                    onPress={() => setShowAspectDetail(false)}
                  >
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                  
                  <View style={[styles.aspectDetailBadge, { backgroundColor: ASPECT_COLORS[selectedAspect.aspectType] || '#666' }]}>
                    <Text style={styles.aspectDetailBadgeText}>
                      {ASPECT_NAMES_TR[selectedAspect.aspectType] || selectedAspect.aspectTypeLocalized}
                    </Text>
                  </View>
                  
                  <View style={styles.aspectDetailPlanets}>
                    <View style={styles.aspectDetailPlanet}>
                      {PLANET_IMAGES[selectedAspect.planet1] && (
                        <Image 
                          source={PLANET_IMAGES[selectedAspect.planet1]} 
                          style={styles.aspectDetailPlanetImage}
                          resizeMode="contain"
                        />
                      )}
                      <Text style={styles.aspectDetailPlanetName}>
                        {PLANET_NAMES_TR[selectedAspect.planet1] || selectedAspect.planet1Localized}
                      </Text>
                    </View>
                    
                    <View style={styles.aspectDetailConnector}>
                      <View style={[styles.aspectDetailLine, { backgroundColor: ASPECT_COLORS[selectedAspect.aspectType] || '#666' }]} />
                      <View style={[styles.aspectDetailAngleBadge, { borderColor: ASPECT_COLORS[selectedAspect.aspectType] || '#666' }]}>
                        <Text style={styles.aspectDetailAngleText}>{selectedAspect.angle}°</Text>
                      </View>
                      <View style={[styles.aspectDetailLine, { backgroundColor: ASPECT_COLORS[selectedAspect.aspectType] || '#666' }]} />
                    </View>
                    
                    <View style={styles.aspectDetailPlanet}>
                      {PLANET_IMAGES[selectedAspect.planet2] && (
                        <Image 
                          source={PLANET_IMAGES[selectedAspect.planet2]} 
                          style={styles.aspectDetailPlanetImage}
                          resizeMode="contain"
                        />
                      )}
                      <Text style={styles.aspectDetailPlanetName}>
                        {PLANET_NAMES_TR[selectedAspect.planet2] || selectedAspect.planet2Localized}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.aspectDetailInfo}>
                    <View style={styles.aspectDetailInfoItem}>
                      <Text style={styles.aspectDetailInfoLabel}>Orb</Text>
                      <Text style={styles.aspectDetailInfoValue}>{selectedAspect.orb.toFixed(2)}°</Text>
                    </View>
                    <View style={styles.aspectDetailInfoItem}>
                      <Text style={styles.aspectDetailInfoLabel}>Açı</Text>
                      <Text style={styles.aspectDetailInfoValue}>{selectedAspect.angle}°</Text>
                    </View>
                  </View>
                  
                  <View style={styles.aspectDetailDescription}>
                    <Text style={styles.aspectDetailDescTitle}>Açı Yorumu</Text>
                    <Text style={styles.aspectDetailDescText}>
                      {ASPECT_DESCRIPTIONS[selectedAspect.aspectType] || 'Bu açı gezegenler arasında özel bir etkileşim oluşturur.'}
                    </Text>
                  </View>
                </>
              )}
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Tam Ekran Harita Modalı */}
      <Modal
        visible={showFullChart}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setShowFullChart(false)}
      >
        <View style={styles.fullChartContainer}>
          <LinearGradient
            colors={['#0F0C29', '#302B63', '#1a1a2e']}
            style={StyleSheet.absoluteFillObject}
          />
          
          <TouchableOpacity
            style={styles.fullChartClose}
            onPress={() => setShowFullChart(false)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          
          {chartData && (
            <ScrollView 
              contentContainerStyle={styles.fullChartScroll}
              maximumZoomScale={4}
              minimumZoomScale={1}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              centerContent={true}
            >
              <NatalChartWheel data={chartData} />
            </ScrollView>
          )}
          
          {chartData?.angles && (
            <View style={styles.fullChartAscendant}>
              <Text style={styles.fullChartAscendantLabel}>Yükselen</Text>
              <Text style={styles.fullChartAscendantSign}>
                {ZODIAC_SYMBOLS[chartData.angles.ascendantSign]} {ZODIAC_NAMES_TR[chartData.angles.ascendantSign]}
              </Text>
            </View>
          )}
        </View>
      </Modal>

      {/* Büyük Üçlü Detay Modalı */}
      <Modal
        visible={showBigThreeModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowBigThreeModal(false)}
      >
        <View style={styles.planetDetailOverlay}>
          <View style={styles.bigThreeModalContainer}>
            <LinearGradient
              colors={['#1a1a2e', '#302B63', '#0f0c29']}
              style={styles.bigThreeModalGradient}
            >
              <TouchableOpacity
                style={styles.planetDetailClose}
                onPress={() => setShowBigThreeModal(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              
              {selectedBigThree === 'SUN' && chartData?.planets?.SUN && (
                <>
                  <Image 
                    source={PLANET_IMAGES.SUN} 
                    style={styles.bigThreeModalImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.bigThreeModalTitle}>☀️ Güneş Burcunuz</Text>
                  <Text style={styles.bigThreeModalSign}>
                    {ZODIAC_SYMBOLS[chartData.planets.SUN.sign]} {ZODIAC_NAMES_TR[chartData.planets.SUN.sign]}
                  </Text>
                  
                  <View style={styles.bigThreeModalInfoRow}>
                    <View style={styles.bigThreeModalInfoItem}>
                      <Text style={styles.bigThreeModalInfoLabel}>Derece</Text>
                      <Text style={styles.bigThreeModalInfoValue}>
                        {Math.floor(chartData.planets.SUN.signDegree)}° {Math.floor((chartData.planets.SUN.signDegree % 1) * 60)}'
                      </Text>
                    </View>
                    <View style={styles.bigThreeModalInfoItem}>
                      <Text style={styles.bigThreeModalInfoLabel}>Ev</Text>
                      <Text style={styles.bigThreeModalInfoValue}>{chartData.planets.SUN.house}. Ev</Text>
                    </View>
                  </View>
                  
                  <View style={styles.bigThreeModalDescription}>
                    <Text style={styles.bigThreeModalDescTitle}>Güneş Ne Anlama Gelir?</Text>
                    <Text style={styles.bigThreeModalDescText}>
                      Güneş burcu, temel kişiliğinizi, egonuzu ve yaşam enerjinizi temsil eder. Hayattaki ana motivasyonunuzu ve kendinizi nasıl ifade ettiğinizi gösterir.
                    </Text>
                  </View>
                  
                  <View style={styles.bigThreeModalDescription}>
                    <Text style={styles.bigThreeModalDescTitle}>
                      {ZODIAC_NAMES_TR[chartData.planets.SUN.sign]} Güneşi
                    </Text>
                    <Text style={styles.bigThreeModalDescText}>
                      {getPlanetDescription('SUN', chartData.planets.SUN.sign)}
                    </Text>
                  </View>
                </>
              )}
              
              {selectedBigThree === 'MOON' && chartData?.planets?.MOON && (
                <>
                  <Image 
                    source={PLANET_IMAGES.MOON} 
                    style={styles.bigThreeModalImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.bigThreeModalTitle}>🌙 Ay Burcunuz</Text>
                  <Text style={styles.bigThreeModalSign}>
                    {ZODIAC_SYMBOLS[chartData.planets.MOON.sign]} {ZODIAC_NAMES_TR[chartData.planets.MOON.sign]}
                  </Text>
                  
                  <View style={styles.bigThreeModalInfoRow}>
                    <View style={styles.bigThreeModalInfoItem}>
                      <Text style={styles.bigThreeModalInfoLabel}>Derece</Text>
                      <Text style={styles.bigThreeModalInfoValue}>
                        {Math.floor(chartData.planets.MOON.signDegree)}° {Math.floor((chartData.planets.MOON.signDegree % 1) * 60)}'
                      </Text>
                    </View>
                    <View style={styles.bigThreeModalInfoItem}>
                      <Text style={styles.bigThreeModalInfoLabel}>Ev</Text>
                      <Text style={styles.bigThreeModalInfoValue}>{chartData.planets.MOON.house}. Ev</Text>
                    </View>
                  </View>
                  
                  <View style={styles.bigThreeModalDescription}>
                    <Text style={styles.bigThreeModalDescTitle}>Ay Ne Anlama Gelir?</Text>
                    <Text style={styles.bigThreeModalDescText}>
                      Ay burcu, duygusal dünyanızı, içgüdülerinizi ve bilinçaltı tepkilerinizi temsil eder. Kendinizi güvende hissetmek için neye ihtiyaç duyduğunuzu gösterir.
                    </Text>
                  </View>
                  
                  <View style={styles.bigThreeModalDescription}>
                    <Text style={styles.bigThreeModalDescTitle}>
                      {ZODIAC_NAMES_TR[chartData.planets.MOON.sign]} Ayı
                    </Text>
                    <Text style={styles.bigThreeModalDescText}>
                      {getPlanetDescription('MOON', chartData.planets.MOON.sign)}
                    </Text>
                  </View>
                </>
              )}
              
              {selectedBigThree === 'ASCENDANT' && chartData?.angles && (
                <>
                  <View style={styles.bigThreeModalAscIcon}>
                    <Ionicons name="arrow-up" size={50} color="#FFD700" />
                  </View>
                  <Text style={styles.bigThreeModalTitle}>⬆️ Yükselen Burcunuz</Text>
                  <Text style={styles.bigThreeModalSign}>
                    {ZODIAC_SYMBOLS[chartData.angles.ascendantSign]} {ZODIAC_NAMES_TR[chartData.angles.ascendantSign]}
                  </Text>
                  
                  <View style={styles.bigThreeModalInfoRow}>
                    <View style={styles.bigThreeModalInfoItem}>
                      <Text style={styles.bigThreeModalInfoLabel}>Derece</Text>
                      <Text style={styles.bigThreeModalInfoValue}>
                        {Math.floor(chartData.angles.ascendantLongitude % 30)}°
                      </Text>
                    </View>
                    <View style={styles.bigThreeModalInfoItem}>
                      <Text style={styles.bigThreeModalInfoLabel}>MC Burcu</Text>
                      <Text style={styles.bigThreeModalInfoValue}>
                        {ZODIAC_SYMBOLS[chartData.angles.midHeavenSign]}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.bigThreeModalDescription}>
                    <Text style={styles.bigThreeModalDescTitle}>Yükselen Ne Anlama Gelir?</Text>
                    <Text style={styles.bigThreeModalDescText}>
                      Yükselen burç (Ascendant), doğum anınızda ufuk çizgisinde yükselen burçtur. Dış dünyadaki ilk izleniminizi, görünümünüzü ve başkalarının sizi nasıl algıladığını temsil eder.
                    </Text>
                  </View>
                  
                  <View style={styles.bigThreeModalDescription}>
                    <Text style={styles.bigThreeModalDescTitle}>
                      {ZODIAC_NAMES_TR[chartData.angles.ascendantSign]} Yükseleni
                    </Text>
                    <Text style={styles.bigThreeModalDescText}>
                      {getAscendantDescription(chartData.angles.ascendantSign)}
                    </Text>
                  </View>
                </>
              )}
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getPlanetDescription = (planet: string, sign: string): string => {
  const descriptions: Record<string, Record<string, string>> = {
    SUN: {
      ARIES: 'Enerjik, girişimci ve cesur bir kişiliğe sahipsiniz. Liderlik yetenekleriniz güçlü.',
      TAURUS: 'Kararlı, güvenilir ve pratik bir yapınız var. Maddi güvenlik sizin için önemli.',
      GEMINI: 'Meraklı, iletişimci ve çok yönlü bir kişiliğiniz var. Bilgi edinmeyi seviyorsunuz.',
      CANCER: 'Duygusal, koruyucu ve sezgisel bir yapınız var. Aile sizin için çok önemli.',
      LEO: 'Yaratıcı, cömert ve karizmatik bir kişiliğe sahipsiniz. İlgi odağı olmayı seversiniz.',
      VIRGO: 'Analitik, düzenli ve mükemmeliyetçi bir yapınız var. Detaylara önem verirsiniz.',
      LIBRA: 'Dengeli, diplomatik ve estetik duygusu güçlü bir kişiliğiniz var. Uyumu seversiniz.',
      SCORPIO: 'Tutkulu, kararlı ve derin bir yapınız var. Dönüşüm ve yenilenme sizin için önemli.',
      SAGITTARIUS: 'Özgürlükçü, iyimser ve maceraperest bir kişiliğe sahipsiniz. Felsefeye ilgi duyarsınız.',
      CAPRICORN: 'Disiplinli, hırslı ve sorumlu bir yapınız var. Başarı sizin için önemli.',
      AQUARIUS: 'Yenilikçi, bağımsız ve insancıl bir kişiliğiniz var. Farklı olmaktan çekinmezsiniz.',
      PISCES: 'Sezgisel, şefkatli ve hayal gücü güçlü bir yapınız var. Sanata yatkınsınız.',
    },
    MOON: {
      ARIES: 'Duygusal tepkileriniz hızlı ve güçlüdür. Bağımsızlık ihtiyacınız yüksek.',
      TAURUS: 'Duygusal istikrar ve güvenlik arayışındasınız. Konfor sizin için önemli.',
      GEMINI: 'Duygularınızı ifade etmeyi seversiniz. Zihinsel uyarılmaya ihtiyaç duyarsınız.',
      CANCER: 'Duygusal derinliğiniz yüksek, sezgileriniz güçlü. Ailenize çok bağlısınız.',
      LEO: 'Duygusal olarak cömert ve sıcakkanlısınız. Takdir edilmeye ihtiyaç duyarsınız.',
      VIRGO: 'Duygularınızı analiz etme eğilimindesiniz. Başkalarına yardım etmek sizi mutlu eder.',
      LIBRA: 'Duygusal denge ve uyum arayışındasınız. İlişkiler sizin için çok önemli.',
      SCORPIO: 'Duygusal yoğunluğunuz derin ve güçlü. Sadakat sizin için vazgeçilmez.',
      SAGITTARIUS: 'Duygusal özgürlük sizin için önemli. İyimser ve neşeli bir yapınız var.',
      CAPRICORN: 'Duygularınızı kontrol altında tutmaya çalışırsınız. Sorumluluk duygunuz güçlü.',
      AQUARIUS: 'Duygusal bağımsızlığınız önemli. Arkadaşlıklar sizin için değerli.',
      PISCES: 'Duygusal olarak son derece hassas ve empatiksiniz. Sezgileriniz çok güçlü.',
    },
  };
  
  return descriptions[planet]?.[sign] || 
    `${PLANET_NAMES_TR[planet]} ${ZODIAC_NAMES_TR[sign]} burcunda konumlanıyor. Bu yerleşim, hayatınızın ${planet === 'SUN' ? 'temel kimliğinizi' : planet === 'MOON' ? 'duygusal dünyanızı' : 'bu alanını'} şekillendiriyor.`;
};

const getAscendantDescription = (sign: string): string => {
  const descriptions: Record<string, string> = {
    ARIES: 'Koç yükselen ile ilk izleniminiz enerjik, cesur ve direkt olur. İnsanlar sizi doğal bir lider olarak görür. Spontane ve maceraperest bir görünüm sergilersiniz.',
    TAURUS: 'Boğa yükselen ile sakin, güvenilir ve kararlı bir ilk izlenim bırakırsınız. İnsanlar sizi rahatlatıcı ve istikrarlı bulur. Zarif ve estetik bir görünümünüz var.',
    GEMINI: 'İkizler yükselen ile zeki, meraklı ve iletişimci bir görünüm sergilersiniz. İnsanlar sizi eğlenceli ve ilginç bulur. Gençlik dolu bir enerjiniz var.',
    CANCER: 'Yengeç yükselen ile sıcak, koruyucu ve şefkatli bir ilk izlenim bırakırsınız. İnsanlar yanınızda kendilerini güvende hisseder. Empatik bir görünümünüz var.',
    LEO: 'Aslan yükselen ile karizmatik, kendinden emin ve dikkat çekici bir görünüm sergilersiniz. İnsanlar sizi doğal bir performansçı olarak görür. Gururlu bir duruşunuz var.',
    VIRGO: 'Başak yükselen ile düzenli, analitik ve mütevazı bir ilk izlenim bırakırsınız. İnsanlar sizi güvenilir ve yardımsever bulur. Temiz ve bakımlı bir görünümünüz var.',
    LIBRA: 'Terazi yükselen ile zarif, uyumlu ve çekici bir görünüm sergilersiniz. İnsanlar sizi hoş ve diplomatik bulur. Dengeyi seven bir yapınız var.',
    SCORPIO: 'Akrep yükselen ile gizemli, yoğun ve manyetik bir ilk izlenim bırakırsınız. İnsanlar sizin içine nüfuz eden bakışlarınızı hisseder. Güçlü bir varlık alanınız var.',
    SAGITTARIUS: 'Yay yükselen ile neşeli, iyimser ve maceraperest bir görünüm sergilersiniz. İnsanlar sizi eğlenceli ve ilham verici bulur. Özgür ruhlu bir enerjiniz var.',
    CAPRICORN: 'Oğlak yükselen ile ciddi, profesyonel ve güvenilir bir ilk izlenim bırakırsınız. İnsanlar sizi olgun ve sorumlu bulur. Otoriteryen bir duruşunuz var.',
    AQUARIUS: 'Kova yükselen ile özgün, bağımsız ve alışılmadık bir görünüm sergilersiniz. İnsanlar sizi farklı ve ilginç bulur. Geleceğe yönelik bir vizyonunuz var.',
    PISCES: 'Balık yükselen ile rüya gibi, hassas ve gizemli bir ilk izlenim bırakırsınız. İnsanlar sizi empatik ve sanatsever bulur. Etrafınızda mistik bir aura var.',
  };
  
  return descriptions[sign] || 'Bu yükselen burç, dış dünyadaki imajınızı ve başkalarının sizi nasıl algıladığını şekillendirir.';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0C29',
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
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  glowEffect: {
    position: 'absolute',
    top: -100,
    left: width / 2 - 150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(157, 78, 221, 0.2)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(157, 78, 221, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  tabContainer: {
    marginBottom: 20,
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 4,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    width: '33.33%',
    height: '100%',
    backgroundColor: 'rgba(157, 78, 221, 0.4)',
    borderRadius: 12,
    left: 4,
    top: 4,
    bottom: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    zIndex: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  activeTabText: {
    color: '#fff',
  },
  formCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  formGradient: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputContent: {
    flex: 1,
    marginLeft: 14,
  },
  inputLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  inputValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  requiredBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requiredText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  calculateButton: {
    marginTop: 10,
    borderRadius: 14,
    overflow: 'hidden',
  },
  calculatingButton: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: -10,
    marginBottom: 15,
  },
  bigThreeContainer: {
    marginBottom: 25,
  },
  bigThreeCards: {
    flexDirection: 'row',
    gap: 10,
  },
  bigThreeCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bigThreeGradient: {
    padding: 14,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 140,
  },
  bigThreeImage: {
    width: 36,
    height: 36,
    marginBottom: 8,
  },
  ascendantIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,215,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bigThreeLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  bigThreeSign: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  bigThreeDescription: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 6,
    textAlign: 'center',
  },
  chartWheelContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 15,
  },
  legendContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 15,
    marginBottom: 20,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  legendText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  planetsListContainer: {
    marginBottom: 20,
  },
  planetCard: {
    marginBottom: 10,
    borderRadius: 14,
    overflow: 'hidden',
  },
  planetCardGradient: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  planetCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planetImage: {
    width: 40,
    height: 40,
  },
  planetCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  planetCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  planetCardSignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planetCardSymbol: {
    fontSize: 16,
    color: '#9D4EDD',
  },
  planetCardSign: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  planetCardRight: {
    alignItems: 'flex-end',
  },
  planetCardDegree: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 4,
  },
  planetCardHouse: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(157, 78, 221, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  houseNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  houseLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  aspectsContainer: {
    marginBottom: 20,
  },
  aspectLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
  },
  aspectLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aspectLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  aspectLegendText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  aspectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    paddingRight: 12,
  },
  aspectIndicator: {
    width: 4,
  },
  aspectContent: {
    flex: 1,
    padding: 12,
  },
  aspectPlanets: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  aspectPlanetName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  aspectTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  aspectTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  aspectOrb: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  cityModalContainer: {
    height: height * 0.75,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  cityModalGradient: {
    flex: 1,
    padding: 20,
  },
  cityModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cityModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  cityModalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  citySearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 10,
  },
  citySearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  citySectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  cityList: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 4,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  selectedCityItem: {
    backgroundColor: 'rgba(157, 78, 221, 0.2)',
    borderWidth: 1,
    borderColor: '#9D4EDD',
  },
  cityItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cityItemFlag: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cityItemInfo: {
    flex: 1,
  },
  cityItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  cityItemCountry: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  planetDetailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  planetDetailContainer: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  planetDetailGradient: {
    padding: 24,
    alignItems: 'center',
  },
  planetDetailClose: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  planetDetailImage: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  planetDetailName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  planetDetailRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  planetDetailItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    minWidth: 80,
  },
  planetDetailLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  planetDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  planetDetailDescription: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 16,
  },
  planetDetailDescTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9D4EDD',
    marginBottom: 8,
  },
  planetDetailDescText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  // Yükselen Burç Badge
  ascendantBadge: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
  },
  ascendantGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
  },
  ascendantLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  ascendantSign: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD700',
  },
  // Zoom Controls
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 10,
  },
  zoomButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(157, 78, 221, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'center',
  },
  // Açı Detay Modalı
  aspectDetailContainer: {
    width: width - 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  aspectDetailGradient: {
    padding: 24,
    alignItems: 'center',
  },
  aspectDetailBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 25,
  },
  aspectDetailBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  aspectDetailPlanets: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  aspectDetailPlanet: {
    alignItems: 'center',
    flex: 1,
  },
  aspectDetailPlanetImage: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  aspectDetailPlanetName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  aspectDetailConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  aspectDetailLine: {
    height: 2,
    width: 20,
  },
  aspectDetailAngleBadge: {
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  aspectDetailAngleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  aspectDetailInfo: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  aspectDetailInfoItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    minWidth: 80,
  },
  aspectDetailInfoLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  aspectDetailInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  aspectDetailDescription: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 16,
  },
  aspectDetailDescTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9D4EDD',
    marginBottom: 8,
  },
  aspectDetailDescText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  // Tam Ekran Harita
  fullChartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullChartClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  fullChartScroll: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  fullChartAscendant: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    backgroundColor: 'rgba(157, 78, 221, 0.3)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  fullChartAscendantLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  fullChartAscendantSign: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD700',
  },
  // Chart touchable area
  chartTouchable: {
    alignSelf: 'center',
    alignItems: 'center',
  },
  chartHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
    textAlign: 'center',
  },
  // Big Three hint
  bigThreeHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginBottom: 12,
  },
  // Big Three Modal
  bigThreeModalContainer: {
    width: width - 40,
    maxHeight: height * 0.85,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bigThreeModalGradient: {
    padding: 24,
    alignItems: 'center',
  },
  bigThreeModalImage: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  bigThreeModalAscIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(157, 78, 221, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  bigThreeModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  bigThreeModalSign: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 20,
  },
  bigThreeModalInfoRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  bigThreeModalInfoItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    minWidth: 100,
  },
  bigThreeModalInfoLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  bigThreeModalInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  bigThreeModalDescription: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  bigThreeModalDescTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9D4EDD',
    marginBottom: 8,
  },
  bigThreeModalDescText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  // iOS Picker Modal Styles
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  pickerModalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  pickerModalGradient: {
    paddingBottom: 40,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  pickerModalDoneButton: {
    backgroundColor: '#9D4EDD',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  pickerModalDoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  iosPicker: {
    height: 200,
    width: '100%',
  },
});
