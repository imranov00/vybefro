// Zodiac Enum Değerleri
export enum ZodiacSign {
  ARIES = 'ARIES',
  TAURUS = 'TAURUS',
  GEMINI = 'GEMINI',
  CANCER = 'CANCER',
  LEO = 'LEO',
  VIRGO = 'VIRGO',
  LIBRA = 'LIBRA',
  SCORPIO = 'SCORPIO',
  SAGITTARIUS = 'SAGITTARIUS',
  CAPRICORN = 'CAPRICORN',
  AQUARIUS = 'AQUARIUS',
  PISCES = 'PISCES'
}

// Zodiac Bilgileri
export interface ZodiacInfo {
  enum: ZodiacSign;
  turkishName: string;
  emoji: string;
  display: string;
}

// Zodiac Mapping
export const ZODIAC_INFO: Record<ZodiacSign, ZodiacInfo> = {
  [ZodiacSign.ARIES]: {
    enum: ZodiacSign.ARIES,
    turkishName: 'Koç',
    emoji: '♈',
    display: '♈ Koç'
  },
  [ZodiacSign.TAURUS]: {
    enum: ZodiacSign.TAURUS,
    turkishName: 'Boğa',
    emoji: '♉',
    display: '♉ Boğa'
  },
  [ZodiacSign.GEMINI]: {
    enum: ZodiacSign.GEMINI,
    turkishName: 'İkizler',
    emoji: '♊',
    display: '♊ İkizler'
  },
  [ZodiacSign.CANCER]: {
    enum: ZodiacSign.CANCER,
    turkishName: 'Yengeç',
    emoji: '♋',
    display: '♋ Yengeç'
  },
  [ZodiacSign.LEO]: {
    enum: ZodiacSign.LEO,
    turkishName: 'Aslan',
    emoji: '♌',
    display: '♌ Aslan'
  },
  [ZodiacSign.VIRGO]: {
    enum: ZodiacSign.VIRGO,
    turkishName: 'Başak',
    emoji: '♍',
    display: '♍ Başak'
  },
  [ZodiacSign.LIBRA]: {
    enum: ZodiacSign.LIBRA,
    turkishName: 'Terazi',
    emoji: '♎',
    display: '♎ Terazi'
  },
  [ZodiacSign.SCORPIO]: {
    enum: ZodiacSign.SCORPIO,
    turkishName: 'Akrep',
    emoji: '♏',
    display: '♏ Akrep'
  },
  [ZodiacSign.SAGITTARIUS]: {
    enum: ZodiacSign.SAGITTARIUS,
    turkishName: 'Yay',
    emoji: '♐',
    display: '♐ Yay'
  },
  [ZodiacSign.CAPRICORN]: {
    enum: ZodiacSign.CAPRICORN,
    turkishName: 'Oğlak',
    emoji: '♑',
    display: '♑ Oğlak'
  },
  [ZodiacSign.AQUARIUS]: {
    enum: ZodiacSign.AQUARIUS,
    turkishName: 'Kova',
    emoji: '♒',
    display: '♒ Kova'
  },
  [ZodiacSign.PISCES]: {
    enum: ZodiacSign.PISCES,
    turkishName: 'Balık',
    emoji: '♓',
    display: '♓ Balık'
  }
};

// Utility Fonksiyonlar
export const getZodiacInfo = (zodiacSign: string | ZodiacSign): ZodiacInfo | null => {
  if (!zodiacSign) return null;
  
  // Enum değeri olarak direkt kontrol
  if (Object.values(ZodiacSign).includes(zodiacSign as ZodiacSign)) {
    return ZODIAC_INFO[zodiacSign as ZodiacSign];
  }
  
  // String olarak gelen değerleri normalize et ve ara
  const normalizedSign = zodiacSign.toString().toUpperCase().trim();
  
  // Direk enum değeri olarak ara
  if (ZODIAC_INFO[normalizedSign as ZodiacSign]) {
    return ZODIAC_INFO[normalizedSign as ZodiacSign];
  }
  
  // Legacy değerleri için fallback (eski sistem uyumluluğu)
  const legacyMapping: Record<string, ZodiacSign> = {
    'ARIES': ZodiacSign.ARIES,
    'TAURUS': ZodiacSign.TAURUS,
    'GEMINI': ZodiacSign.GEMINI,
    'CANCER': ZodiacSign.CANCER,
    'LEO': ZodiacSign.LEO,
    'VIRGO': ZodiacSign.VIRGO,
    'LIBRA': ZodiacSign.LIBRA,
    'SCORPIO': ZodiacSign.SCORPIO,
    'SAGITTARIUS': ZodiacSign.SAGITTARIUS,
    'CAPRICORN': ZodiacSign.CAPRICORN,
    'AQUARIUS': ZodiacSign.AQUARIUS,
    'PISCES': ZodiacSign.PISCES,
    // Küçük harfli versiyonlar
    'aries': ZodiacSign.ARIES,
    'taurus': ZodiacSign.TAURUS,
    'gemini': ZodiacSign.GEMINI,
    'cancer': ZodiacSign.CANCER,
    'leo': ZodiacSign.LEO,
    'virgo': ZodiacSign.VIRGO,
    'libra': ZodiacSign.LIBRA,
    'scorpio': ZodiacSign.SCORPIO,
    'sagittarius': ZodiacSign.SAGITTARIUS,
    'capricorn': ZodiacSign.CAPRICORN,
    'aquarius': ZodiacSign.AQUARIUS,
    'pisces': ZodiacSign.PISCES,
    // Karma case versiyonlar
    'Aries': ZodiacSign.ARIES,
    'Taurus': ZodiacSign.TAURUS,
    'Gemini': ZodiacSign.GEMINI,
    'Cancer': ZodiacSign.CANCER,
    'Leo': ZodiacSign.LEO,
    'Virgo': ZodiacSign.VIRGO,
    'Libra': ZodiacSign.LIBRA,
    'Scorpio': ZodiacSign.SCORPIO,
    'Sagittarius': ZodiacSign.SAGITTARIUS,
    'Capricorn': ZodiacSign.CAPRICORN,
    'Aquarius': ZodiacSign.AQUARIUS,
    'Pisces': ZodiacSign.PISCES
  };
  
  const mappedEnum = legacyMapping[zodiacSign];
  if (mappedEnum && ZODIAC_INFO[mappedEnum]) {
    return ZODIAC_INFO[mappedEnum];
  }
  
  return null;
};

export const getZodiacDisplay = (zodiacSign: string | ZodiacSign): string => {
  const info = getZodiacInfo(zodiacSign);
  return info ? info.display : 'Burç Belirtilmemiş';
};

export const getZodiacTurkish = (zodiacSign: string | ZodiacSign): string => {
  const info = getZodiacInfo(zodiacSign);
  return info ? info.turkishName : 'Belirtilmemiş';
};

export const getZodiacEmoji = (zodiacSign: string | ZodiacSign): string => {
  const info = getZodiacInfo(zodiacSign);
  return info ? info.emoji : '🌟';
}; 