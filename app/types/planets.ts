// Gezegen türleri ve bilgileri
export interface Planet {
  id: string;
  name: string;
  turkishName: string;
  symbol: string;
  emoji: string;
  element: string;
  description: string;
  color: string;
  angle: number; // Çember üzerindeki açı pozisyonu
}

// Gezegen bilgileri
export const PLANETS: Planet[] = [
  {
    id: 'sun',
    name: 'Sun',
    turkishName: 'Güneş',
    symbol: '☉',
    emoji: '☀️',
    element: 'Ateş',
    description: 'Kişiliğin özü, ego ve yaşam enerjisi. Kendinizi nasıl ifade ettiğinizi ve liderlik özelliklerinizi temsil eder.',
    color: '#FFD700',
    angle: 0
  },
  {
    id: 'moon',
    name: 'Moon',
    turkishName: 'Ay',
    symbol: '☽',
    emoji: '🌙',
    element: 'Su',
    description: 'Duygular, sezgiler ve bilinçaltı. İç dünyanızı, duygusal tepkilerinizi ve beslenme ihtiyaçlarınızı yansıtır.',
    color: '#C0C0C0',
    angle: 45
  },
  {
    id: 'mercury',
    name: 'Mercury',
    turkishName: 'Merkür',
    symbol: '☿',
    emoji: '💫',
    element: 'Hava',
    description: 'İletişim, düşünce ve öğrenme. Nasıl konuştuğunuzu, düşündüğünüzü ve bilgiyi işlediğinizi temsil eder.',
    color: '#87CEEB',
    angle: 90
  },
  {
    id: 'venus',
    name: 'Venus',
    turkishName: 'Venüs',
    symbol: '♀',
    emoji: '💖',
    element: 'Toprak',
    description: 'Aşk, güzellik ve değerler. İlişkilerinizi, estetik anlayışınızı ve neyi değerli bulduğunuzu gösterir.',
    color: '#FF69B4',
    angle: 135
  },
  {
    id: 'mars',
    name: 'Mars',
    turkishName: 'Mars',
    symbol: '♂',
    emoji: '🔥',
    element: 'Ateş',
    description: 'Arzu, enerji ve harekete geçme gücü. Motivasyonunuzu, cesaretinizi ve fiziksel enerjinizi temsil eder.',
    color: '#FF4500',
    angle: 180
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    turkishName: 'Jüpiter',
    symbol: '♃',
    emoji: '🌟',
    element: 'Ateş',
    description: 'Büyüme, şans ve genişleme. Felsefenizi, inançlarınızı ve büyük hedeflerinizi temsil eder.',
    color: '#DAA520',
    angle: 225
  },
  {
    id: 'saturn',
    name: 'Saturn',
    turkishName: 'Satürn',
    symbol: '♄',
    emoji: '🪐',
    element: 'Toprak',
    description: 'Disiplin, sorumluluk ve yapı. Sınırlarınızı, hedeflerinizi ve uzun vadeli başarınızı temsil eder.',
    color: '#8B4513',
    angle: 270
  },
  {
    id: 'uranus',
    name: 'Uranus',
    turkishName: 'Uranüs',
    symbol: '♅',
    emoji: '⚡',
    element: 'Hava',
    description: 'Değişim, yenilik ve özgürlük. Bireyselliğinizi, yaratıcılığınızı ve devrimci yanınızı temsil eder.',
    color: '#4FD0E3',
    angle: 315
  }
];

// Gezegen bilgilerini ID ile alma
export const getPlanetInfo = (planetId: string): Planet | undefined => {
  return PLANETS.find(planet => planet.id === planetId);
};

// Tüm gezegen isimlerini alma
export const getAllPlanetNames = (): string[] => {
  return PLANETS.map(planet => planet.turkishName);
};
