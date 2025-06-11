export type ZodiacSign = 'ARIES' | 'TAURUS' | 'GEMINI' | 'CANCER' | 'LEO' | 'VIRGO' | 'LIBRA' | 'SCORPIO' | 'SAGITTARIUS' | 'CAPRICORN' | 'AQUARIUS' | 'PISCES';

export const zodiacSignTranslations: Record<ZodiacSign, string> = {
  ARIES: "Koç",
  TAURUS: "Boğa",
  GEMINI: "İkizler",
  CANCER: "Yengeç",
  LEO: "Aslan",
  VIRGO: "Başak",
  LIBRA: "Terazi",
  SCORPIO: "Akrep",
  SAGITTARIUS: "Yay",
  CAPRICORN: "Oğlak",
  AQUARIUS: "Kova",
  PISCES: "Balık"
}; 