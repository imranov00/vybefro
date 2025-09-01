import { ZodiacSign } from './zodiac';

// Burç Elementleri
export enum ZodiacElement {
  FIRE = 'FIRE',     // Ateş: Koç, Aslan, Yay
  EARTH = 'EARTH',   // Toprak: Boğa, Başak, Oğlak
  AIR = 'AIR',       // Hava: İkizler, Terazi, Kova
  WATER = 'WATER'    // Su: Yengeç, Akrep, Balık
}

// Burç Element Mapping
export const ZODIAC_ELEMENTS: Record<ZodiacSign, ZodiacElement> = {
  [ZodiacSign.ARIES]: ZodiacElement.FIRE,
  [ZodiacSign.LEO]: ZodiacElement.FIRE,
  [ZodiacSign.SAGITTARIUS]: ZodiacElement.FIRE,
  
  [ZodiacSign.TAURUS]: ZodiacElement.EARTH,
  [ZodiacSign.VIRGO]: ZodiacElement.EARTH,
  [ZodiacSign.CAPRICORN]: ZodiacElement.EARTH,
  
  [ZodiacSign.GEMINI]: ZodiacElement.AIR,
  [ZodiacSign.LIBRA]: ZodiacElement.AIR,
  [ZodiacSign.AQUARIUS]: ZodiacElement.AIR,
  
  [ZodiacSign.CANCER]: ZodiacElement.WATER,
  [ZodiacSign.SCORPIO]: ZodiacElement.WATER,
  [ZodiacSign.PISCES]: ZodiacElement.WATER
};

// Uyumluluk Kategorileri
export enum CompatibilityLevel {
  PERFECT = 'PERFECT',     // %85+: "Mükemmel Uyum"
  HIGH = 'HIGH',           // %70-84: "Yüksek Uyum"
  MEDIUM = 'MEDIUM',       // %50-69: "Orta Uyum"
  LOW = 'LOW',             // %30-49: "Düşük Uyum"
  INCOMPATIBLE = 'INCOMPATIBLE' // %30 altı: "Uyumsuz"
}

// Uyumluluk Puanları (Burç çiftleri için)
export const COMPATIBILITY_SCORES: Record<string, number> = {
  // Mükemmel Uyumlar (%85+)
  'ARIES_LEO': 90,
  'ARIES_SAGITTARIUS': 88,
  'TAURUS_VIRGO': 89,
  'TAURUS_CAPRICORN': 87,
  'GEMINI_LIBRA': 88,
  'GEMINI_AQUARIUS': 86,
  'CANCER_SCORPIO': 91,
  'CANCER_PISCES': 89,
  'LEO_SAGITTARIUS': 87,
  'VIRGO_CAPRICORN': 88,
  'LIBRA_AQUARIUS': 85,
  'SCORPIO_PISCES': 92,
  
  // Yüksek Uyumlar (%70-84)
  'ARIES_GEMINI': 78,
  'ARIES_AQUARIUS': 75,
  'TAURUS_CANCER': 82,
  'TAURUS_PISCES': 79,
  'GEMINI_LEO': 81,
  'CANCER_VIRGO': 77,
  'LEO_LIBRA': 83,
  'VIRGO_SCORPIO': 76,
  'LIBRA_SAGITTARIUS': 80,
  'SCORPIO_CAPRICORN': 74,
  'SAGITTARIUS_AQUARIUS': 78,
  'CAPRICORN_PISCES': 72,
  
  // Orta Uyumlar (%50-69)
  'ARIES_TAURUS': 58,
  'ARIES_VIRGO': 52,
  'TAURUS_GEMINI': 61,
  'GEMINI_CANCER': 55,
  'CANCER_LEO': 63,
  'LEO_VIRGO': 57,
  'VIRGO_LIBRA': 64,
  'LIBRA_SCORPIO': 59,
  'SCORPIO_SAGITTARIUS': 56,
  'SAGITTARIUS_CAPRICORN': 62,
  'CAPRICORN_AQUARIUS': 54,
  'AQUARIUS_PISCES': 68,
  
  // Düşük Uyumlar (%30-49)
  'ARIES_CANCER': 45,
  'ARIES_CAPRICORN': 42,
  'TAURUS_LEO': 38,
  'TAURUS_SAGITTARIUS': 41,
  'GEMINI_VIRGO': 47,
  'GEMINI_SCORPIO': 39,
  'CANCER_LIBRA': 44,
  'LEO_SCORPIO': 36,
  'VIRGO_SAGITTARIUS': 43,
  'LIBRA_CAPRICORN': 40,
  'SCORPIO_AQUARIUS': 37,
  'SAGITTARIUS_PISCES': 46,
  
  // Uyumsuzlar (%30 altı)
  'ARIES_SCORPIO': 28,
  'TAURUS_AQUARIUS': 25,
  'GEMINI_CAPRICORN': 29,
  'CANCER_SAGITTARIUS': 27,
  'LEO_PISCES': 24,
  'VIRGO_AQUARIUS': 26
};

// Uyumluluk Hesaplama Fonksiyonu
export const calculateCompatibility = (sign1: ZodiacSign, sign2: ZodiacSign): number => {
  // Aynı burç kontrolü
  if (sign1 === sign2) {
    return Math.floor(Math.random() * 16) + 70; // 70-85 arası
  }
  
  // Sıralı key oluştur
  const key1 = `${sign1}_${sign2}`;
  const key2 = `${sign2}_${sign1}`;
  
  // Önceden tanımlanmış puanları kontrol et
  if (COMPATIBILITY_SCORES[key1]) {
    return COMPATIBILITY_SCORES[key1];
  }
  if (COMPATIBILITY_SCORES[key2]) {
    return COMPATIBILITY_SCORES[key2];
  }
  
  // Element bazlı hesaplama
  const element1 = ZODIAC_ELEMENTS[sign1];
  const element2 = ZODIAC_ELEMENTS[sign2];
  
  let baseScore = 50; // Varsayılan puan
  
  // Aynı element bonus
  if (element1 === element2) {
    baseScore += 20;
  }
  
  // Element uyumluluğu
  const elementCompatibility: Record<string, number> = {
    'FIRE_AIR': 15,
    'EARTH_WATER': 15,
    'FIRE_EARTH': -10,
    'AIR_WATER': -10,
    'FIRE_WATER': -15,
    'EARTH_AIR': -5
  };
  
  const elementKey1 = `${element1}_${element2}`;
  const elementKey2 = `${element2}_${element1}`;
  
  if (elementCompatibility[elementKey1]) {
    baseScore += elementCompatibility[elementKey1];
  } else if (elementCompatibility[elementKey2]) {
    baseScore += elementCompatibility[elementKey2];
  }
  
  // 0-100 arasında sınırla
  return Math.max(0, Math.min(100, baseScore));
};

// Uyumluluk Seviyesi Belirleme
export const getCompatibilityLevel = (score: number): CompatibilityLevel => {
  if (score >= 85) return CompatibilityLevel.PERFECT;
  if (score >= 70) return CompatibilityLevel.HIGH;
  if (score >= 50) return CompatibilityLevel.MEDIUM;
  if (score >= 30) return CompatibilityLevel.LOW;
  return CompatibilityLevel.INCOMPATIBLE;
};

// Uyumluluk Açıklamaları
export const getCompatibilityDescription = (
  sign1: ZodiacSign, 
  sign2: ZodiacSign, 
  score: number
): string => {
  const level = getCompatibilityLevel(score);
  const element1 = ZODIAC_ELEMENTS[sign1];
  const element2 = ZODIAC_ELEMENTS[sign2];
  
  const elementNames = {
    [ZodiacElement.FIRE]: 'Ateş',
    [ZodiacElement.EARTH]: 'Toprak',
    [ZodiacElement.AIR]: 'Hava',
    [ZodiacElement.WATER]: 'Su'
  };
  
  switch (level) {
    case CompatibilityLevel.PERFECT:
      if (element1 === element2) {
        return `${elementNames[element1]} elementinden olan burçlar olarak mükemmel bir enerji yaratıyorsunuz! Birbirinizi çok iyi anlıyorsunuz.`;
      }
      return 'Harika bir uyumunuz var! Birbirinizi tamamlayan özellikleriniz sayesinde güçlü bir bağ kurabilirsiniz.';
      
    case CompatibilityLevel.HIGH:
      return 'Yüksek uyumlu bir çiftsiniz! Ortak değerleriniz ve tamamlayıcı özellikleriniz güzel bir ilişki vaat ediyor.';
      
    case CompatibilityLevel.MEDIUM:
      return 'Orta seviyede uyumunuz var. Biraz çaba ile güzel bir ilişki kurabilirsiniz.';
      
    case CompatibilityLevel.LOW:
      return 'Farklı özellikleriniz var ama bu da ilginç bir dinamik yaratabilir. Sabır ve anlayış gerekebilir.';
      
    case CompatibilityLevel.INCOMPATIBLE:
      return 'Çok farklı karakterleriniz var. Eğer birlikte olmaya karar verirseniz, birbirinizi anlamak için ekstra çaba gerekecek.';
      
    default:
      return 'Burç uyumluluğunuz hesaplanıyor...';
  }
};

// Uyumluluk Renk Kodları
export const getCompatibilityColor = (score: number): string => {
  const level = getCompatibilityLevel(score);
  
  switch (level) {
    case CompatibilityLevel.PERFECT:
      return '#4CAF50'; // Yeşil
    case CompatibilityLevel.HIGH:
      return '#8BC34A'; // Açık yeşil
    case CompatibilityLevel.MEDIUM:
      return '#FF9800'; // Turuncu
    case CompatibilityLevel.LOW:
      return '#FF5722'; // Kırmızı-turuncu
    case CompatibilityLevel.INCOMPATIBLE:
      return '#F44336'; // Kırmızı
    default:
      return '#9E9E9E'; // Gri
  }
};

// Uyumluluk Etiketi
export const getCompatibilityLabel = (score: number): string => {
  const level = getCompatibilityLevel(score);
  
  switch (level) {
    case CompatibilityLevel.PERFECT:
      return 'Mükemmel Uyum';
    case CompatibilityLevel.HIGH:
      return 'Yüksek Uyum';
    case CompatibilityLevel.MEDIUM:
      return 'Orta Uyum';
    case CompatibilityLevel.LOW:
      return 'Düşük Uyum';
    case CompatibilityLevel.INCOMPATIBLE:
      return 'Uyumsuz';
    default:
      return 'Bilinmiyor';
  }
}; 

// Default export
export default {
  calculateCompatibility,
  getCompatibilityDescription,
  getCompatibilityColor
}; 