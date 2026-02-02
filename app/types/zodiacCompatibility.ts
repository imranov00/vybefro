import { ZodiacSign } from './zodiac';

// Uyumluluk detayları
export interface CompatibilityDetail {
  score: number; // 0-100
  love: number; // 0-100
  friendship: number; // 0-100
  career: number; // 0-100
  communication: number; // 0-100
  summary: string;
  strengths: string[];
  challenges: string[];
  advice: string;
}

// Her burç çifti için uyumluluk detayları
export const COMPATIBILITY_DETAILS: Record<string, CompatibilityDetail> = {
  // ARIES uyumlulukları
  'ARIES-LEO': {
    score: 95,
    love: 98,
    friendship: 92,
    career: 88,
    communication: 94,
    summary: 'Ateş elementinin iki güçlü temsilcisi! Tutku, enerji ve heyecan dolu bir ilişki.',
    strengths: ['Yüksek enerji', 'Ortak heyecan', 'Liderlik ruhu', 'Tutkulu bağ'],
    challenges: ['Ego çatışmaları', 'Rekabet', 'Dürtüsellik'],
    advice: 'İkiniz de lider olmak istersiniz. Sırayla liderlik yapın ve birbirinizi destekleyin.'
  },
  'ARIES-SAGITTARIUS': {
    score: 93,
    love: 90,
    friendship: 95,
    career: 91,
    communication: 92,
    summary: 'Macera ve özgürlük tutkusu paylaşan iki ateş burcu. Birlikte dünyanın sınırlarını zorlarsınız.',
    strengths: ['Macera aşkı', 'Özgürlüğe saygı', 'Optimizm', 'Entelektüel uyum'],
    challenges: ['Taahhüt korkusu', 'Sorumluluk kaçışı', 'Sabırsızlık'],
    advice: 'Birbirinize alan tanıyın. Özgürlük ilişkiyi güçlendirir.'
  },
  'ARIES-GEMINI': {
    score: 88,
    love: 85,
    friendship: 90,
    career: 87,
    communication: 92,
    summary: 'Dinamik ve hızlı tempolu bir ilişki. Asla sıkılmazsınız!',
    strengths: ['Zeka uyumu', 'Hızlı tempo', 'Eğlence', 'Sosyal enerji'],
    challenges: ['Derinlik eksikliği', 'Odak kaybı', 'Kararsızlık'],
    advice: 'Bazen yavaşlayın ve derin konuşmalar yapın.'
  },

  // TAURUS uyumlulukları
  'TAURUS-VIRGO': {
    score: 92,
    love: 88,
    friendship: 90,
    career: 95,
    communication: 90,
    summary: 'İki toprak burcu olarak istikrar ve güvenlik odaklısınız. Sağlam bir temel.',
    strengths: ['Güvenilirlik', 'Pratiklik', 'Sadakat', 'Ortak değerler'],
    challenges: ['Fazla eleştirellik', 'Rutin sıkıcılığı', 'Değişime direnç'],
    advice: 'Rutinden çıkıp spontane olmayı deneyin.'
  },
  'TAURUS-CAPRICORN': {
    score: 90,
    love: 87,
    friendship: 88,
    career: 98,
    communication: 86,
    summary: 'Toprak elementi gücü! Uzun vadeli hedefler ve istikrar sizin işiniz.',
    strengths: ['Kariyer odağı', 'Disiplin', 'Sadakat', 'Mali güvenlik'],
    challenges: ['Duygusal soğukluk', 'İş odaklılık', 'İnatçılık'],
    advice: 'İşten zaman ayırıp duygusal bağı güçlendirin.'
  },
  'TAURUS-CANCER': {
    score: 89,
    love: 92,
    friendship: 87,
    career: 85,
    communication: 88,
    summary: 'Güvenlik ve konfor arayışında birleşen iki burç. Yuva odaklı bir bağ.',
    strengths: ['Duygusal güvenlik', 'Aile değerleri', 'Sadakat', 'Besleyici enerji'],
    challenges: ['Değişime direnç', 'Fazla korumacılık', 'Aşırı bağımlılık'],
    advice: 'Comfort zone\'dan çıkıp yeni deneyimlere açılın.'
  },

  // GEMINI uyumlulukları
  'GEMINI-LIBRA': {
    score: 91,
    love: 89,
    friendship: 94,
    career: 88,
    communication: 96,
    summary: 'Hava elementi uyumu! İletişim ve entelektüel bağ harikasınız.',
    strengths: ['İletişim', 'Sosyal uyum', 'Entelektüel bağ', 'Denge'],
    challenges: ['Karar vermede zorluk', 'Yüzeysellik', 'Kararsızlık'],
    advice: 'Duygusal derinliği görmezden gelmeyin.'
  },
  'GEMINI-AQUARIUS': {
    score: 90,
    love: 86,
    friendship: 95,
    career: 89,
    communication: 94,
    summary: 'İki entelektüel hava burcu. Fikirler ve yenilikçilik odaklı.',
    strengths: ['Entelektüel uyum', 'Yenilikçilik', 'Özgürlük', 'Arkadaşlık'],
    challenges: ['Duygusal kopukluk', 'İstikrarsızlık', 'Bağlılık korkusu'],
    advice: 'Duygularınızı ifade etmekten korkmayın.'
  },

  // CANCER uyumlulukları
  'CANCER-SCORPIO': {
    score: 94,
    love: 96,
    friendship: 90,
    career: 88,
    communication: 92,
    summary: 'Derin su burçları! Duygusal ve sezgisel bağ güçlü.',
    strengths: ['Duygusal derinlik', 'Sezgi', 'Sadakat', 'İçsel bağ'],
    challenges: ['Aşırı duygusallık', 'Kıskançlık', 'Gizlilik'],
    advice: 'Açık iletişim kurun, varsayımlardan kaçının.'
  },
  'CANCER-PISCES': {
    score: 92,
    love: 95,
    friendship: 89,
    career: 86,
    communication: 91,
    summary: 'Empati ve duyarlılık dolu bir ilişki. Birbirinizi derinden anlarsınız.',
    strengths: ['Empati', 'Yaratıcılık', 'Duygusal bağ', 'Şefkat'],
    challenges: ['Sınır eksikliği', 'Kaçış eğilimi', 'Aşırı duyarlılık'],
    advice: 'Sınırlarınızı koruyun ve gerçekçi kalın.'
  },

  // LEO uyumlulukları
  'LEO-SAGITTARIUS': {
    score: 90,
    love: 91,
    friendship: 93,
    career: 87,
    communication: 89,
    summary: 'Ateşli ve coşkulu! Birlikte hayatı dolu dolu yaşarsınız.',
    strengths: ['Optimizm', 'Macera', 'Cömertlik', 'Eğlence'],
    challenges: ['Ego', 'Dikkat ihtiyacı', 'Aşırı özgüven'],
    advice: 'Alçakgönüllülük ve sabır pratik yapın.'
  },

  // VIRGO uyumlulukları
  'VIRGO-CAPRICORN': {
    score: 93,
    love: 88,
    friendship: 91,
    career: 97,
    communication: 90,
    summary: 'İki toprak burcu mükemmelliği hedefler. Güvenilir ve disiplinli.',
    strengths: ['Güvenilirlik', 'İş etiği', 'Pratiklik', 'Hedef odağı'],
    challenges: ['Eleştirellik', 'İş bağımlılığı', 'Duygusal soğukluk'],
    advice: 'Eğlenmeyi ve gevşemeyi öğrenin.'
  },
  'VIRGO-SCORPIO': {
    score: 87,
    love: 85,
    friendship: 88,
    career: 90,
    communication: 86,
    summary: 'Analitik ve derin. Birlikte sırları çözersiniz.',
    strengths: ['Zeka', 'Derinlik', 'Sadakat', 'Problem çözme'],
    challenges: ['Eleştirellik', 'Güven sorunları', 'Kontrol ihtiyacı'],
    advice: 'Birbirinizi olduğunuz gibi kabul edin.'
  },

  // LIBRA uyumlulukları
  'LIBRA-AQUARIUS': {
    score: 91,
    love: 88,
    friendship: 94,
    career: 89,
    communication: 93,
    summary: 'Entelektüel ve sosyal uyum. Dengeli ve özgür bir bağ.',
    strengths: ['Entelektüel bağ', 'Sosyal uyum', 'Özgürlük', 'Adalet'],
    challenges: ['Duygusal mesafe', 'Kararsızlık', 'Yüzeysellik'],
    advice: 'Duygusal yakınlığı ihmal etmeyin.'
  },

  // SCORPIO uyumlulukları
  'SCORPIO-PISCES': {
    score: 95,
    love: 97,
    friendship: 91,
    career: 88,
    communication: 93,
    summary: 'Su elementi en yüksek seviyede! Sezgisel ve derin.',
    strengths: ['Sezgi', 'Duygusal derinlik', 'Yaratıcılık', 'Şifa'],
    challenges: ['Sınır eksikliği', 'Kaçış', 'Manipülasyon'],
    advice: 'Açık ve net iletişim kurun.'
  },

  // SAGITTARIUS uyumlulukları
  'SAGITTARIUS-LIBRA': {
    score: 86,
    love: 84,
    friendship: 89,
    career: 85,
    communication: 88,
    summary: 'Sosyal ve keyifli. Birlikte eğlenmeyi bilirsiniz.',
    strengths: ['Sosyal enerji', 'Optimizm', 'Denge', 'Eğlence'],
    challenges: ['Karar verme', 'Derinlik eksikliği', 'Taahhüt'],
    advice: 'Ciddiye alınması gereken konularda samimiyet gösterin.'
  },

  // CAPRICORN uyumlulukları
  'CAPRICORN-SCORPIO': {
    score: 88,
    love: 86,
    friendship: 87,
    career: 93,
    communication: 85,
    summary: 'Güç ve kontrol odaklı iki burç. Birlikte güçlüsünüz.',
    strengths: ['Güç', 'Sadakat', 'Strateji', 'Hedef'],
    challenges: ['Güç mücadelesi', 'Duygusal soğukluk', 'Kontrol'],
    advice: 'Güveni inşa edin ve kontrolü paylaşın.'
  },

  // AQUARIUS uyumlulukları
  'AQUARIUS-SAGITTARIUS': {
    score: 89,
    love: 85,
    friendship: 93,
    career: 88,
    communication: 91,
    summary: 'Özgürlük seven iki burç. Birbirinize alan tanırsınız.',
    strengths: ['Özgürlük', 'Macera', 'Entelektüel bağ', 'Yenilik'],
    challenges: ['Bağlılık', 'Duygusal mesafe', 'İstikrarsızlık'],
    advice: 'Duygusal yakınlık için çaba gösterin.'
  },

  // PISCES uyumlulukları
  'PISCES-CAPRICORN': {
    score: 82,
    love: 80,
    friendship: 83,
    career: 84,
    communication: 81,
    summary: 'Farklı dünyaların uyumu. Birbirini tamamlayan karşıtlar.',
    strengths: ['Denge', 'Tamamlayıcılık', 'Öğrenme', 'Destekleyicilik'],
    challenges: ['Farklı öncelikler', 'İletişim', 'Anlayış'],
    advice: 'Farklılıklarınızı güç olarak görün.'
  },
};

// Uyumluluk hesaplama fonksiyonu
export function getCompatibility(sign1: ZodiacSign, sign2: ZodiacSign): CompatibilityDetail {
  const key1 = `${sign1}-${sign2}`;
  const key2 = `${sign2}-${sign1}`;
  
  // Eğer detaylı bilgi varsa onu kullan
  if (COMPATIBILITY_DETAILS[key1]) {
    return COMPATIBILITY_DETAILS[key1];
  }
  if (COMPATIBILITY_DETAILS[key2]) {
    return COMPATIBILITY_DETAILS[key2];
  }
  
  // Default uyumluluk
  return {
    score: 50,
    love: 50,
    friendship: 50,
    career: 50,
    communication: 50,
    summary: 'Bu iki burç arasında özel bir uyumluluk analizi henüz mevcut değil.',
    strengths: ['Keşfedilmeyi bekleyen potansiyel'],
    challenges: ['Farklılıkları anlamak'],
    advice: 'Birbirinizi tanımak için zaman ayırın.'
  };
}

// Kategori skorları hesaplama
export function getCategoryScores(zodiac: ZodiacSign): {
  love: number;
  career: number;
  health: number;
  creativity: number;
} {
  // Burçlara göre kategori skorları
  const scores: Record<ZodiacSign, any> = {
    [ZodiacSign.ARIES]: { love: 85, career: 90, health: 88, creativity: 82 },
    [ZodiacSign.TAURUS]: { love: 90, career: 85, health: 92, creativity: 78 },
    [ZodiacSign.GEMINI]: { love: 78, career: 88, health: 75, creativity: 95 },
    [ZodiacSign.CANCER]: { love: 95, career: 75, health: 80, creativity: 85 },
    [ZodiacSign.LEO]: { love: 88, career: 92, health: 85, creativity: 90 },
    [ZodiacSign.VIRGO]: { love: 75, career: 95, health: 90, creativity: 80 },
    [ZodiacSign.LIBRA]: { love: 92, career: 82, health: 78, creativity: 88 },
    [ZodiacSign.SCORPIO]: { love: 90, career: 85, health: 82, creativity: 92 },
    [ZodiacSign.SAGITTARIUS]: { love: 82, career: 88, health: 90, creativity: 85 },
    [ZodiacSign.CAPRICORN]: { love: 78, career: 98, health: 85, creativity: 75 },
    [ZodiacSign.AQUARIUS]: { love: 80, career: 85, health: 78, creativity: 95 },
    [ZodiacSign.PISCES]: { love: 95, career: 72, health: 75, creativity: 98 },
  };
  
  return scores[zodiac];
}
