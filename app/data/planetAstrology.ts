import { ZodiacSign } from "../types/zodiac";

export type PlanetKey =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

export interface PlanetAstrologyInfo {
  displayName: string;
  caption: string;
  description: string;
  effects: Partial<Record<ZodiacSign, string>>;
}

export const PLANET_ASTROLOGY: Record<PlanetKey, PlanetAstrologyInfo> = {
  sun: {
    displayName: "Güneş",
    caption: "Benlik ve yaşam enerjisi",
    description:
      "Güneş, benliği, iradeyi ve yaşam enerjisini temsil eder. Haritada baskın olduğu alan, kişinin parladığı ve kendini en güçlü hissettiği yerdir.",
    effects: {
      [ZodiacSign.LEO]: "Güneş Aslan'da çok güçlüdür: yaratıcılık ve liderlik artar.",
      [ZodiacSign.ARIES]: "Cesaret ve doğrudan hareket etme isteği yükselir.",
      [ZodiacSign.LIBRA]: "İlişkiler ve denge arayışı ön plana çıkar.",
    },
  },
  moon: {
    displayName: "Ay",
    caption: "Duygular ve iç dünya",
    description:
      "Ay, duyguları, ihtiyaçları ve içsel güveni anlatır. Ay'ın konumu, duygusal tepki biçimini ve huzuru aradığınız alanı gösterir.",
    effects: {
      [ZodiacSign.CANCER]: "Ay Yengeç'te ev, aile ve koruma temaları güçlenir.",
      [ZodiacSign.PISCES]: "Empati ve sezgisel derinlik artar.",
      [ZodiacSign.CAPRICORN]: "Duyguları yapılandırma ve sorumlulukla yaklaşma eğilimi.",
    },
  },
  mercury: {
    displayName: "Merkür",
    caption: "Zihin ve iletişim",
    description:
      "Merkür düşünce, öğrenme ve iletişimi yönetir. Konuşma ve analiz becerileri bu gezegenin etkisiyle şekillenir.",
    effects: {
      [ZodiacSign.GEMINI]: "Hızlı öğrenme ve çok yönlü iletişim güçlenir.",
      [ZodiacSign.VIRGO]: "Detaycılık, pratik zeka ve fayda odaklı düşünme artar.",
      [ZodiacSign.SAGITTARIUS]: "Büyük resim ve felsefi bakış öne çıkar.",
    },
  },
  venus: {
    displayName: "Venüs",
    caption: "Aşk, estetik ve uyum",
    description:
      "Venüs, ilişki kurma biçimini, değerleri ve estetik zevkleri yönetir. Venüs'ün uyumlu olduğu burçlar ilişkilerde akışı kolaylaştırır.",
    effects: {
      [ZodiacSign.TAURUS]: "Konfor, sadakat ve kalıcı değerler ön plandadır.",
      [ZodiacSign.LIBRA]: "Uyum, adalet ve güzelliğe yönelim artar.",
      [ZodiacSign.PISCES]: "Koşulsuz sevgi ve romantizm derinleşir.",
    },
  },
  mars: {
    displayName: "Mars",
    caption: "Enerji ve eylem",
    description:
      "Mars, motivasyon, cesaret ve sınır koymayı temsil eder. Eylem gücünüz ve rekabetçi yanınız Mars ile görünür olur.",
    effects: {
      [ZodiacSign.ARIES]: "Girişkenlik, hız ve doğrudanlık artar.",
      [ZodiacSign.SCORPIO]: "Kararlılık ve dönüşüm gücü yükselir.",
      [ZodiacSign.CANCER]: "Koruma ve savunma temaları eylemselliğe dönüşür.",
    },
  },
  jupiter: {
    displayName: "Jüpiter",
    caption: "Genişleme ve şans",
    description:
      "Jüpiter büyüme, bilgelik ve şansı simgeler. Ufkunuzu genişleten temalar Jüpiter etkisiyle gelir.",
    effects: {
      [ZodiacSign.SAGITTARIUS]: "Keşif, öğrenme ve özgürlük alanları büyür.",
      [ZodiacSign.PISCES]: "Şefkat, inanç ve hayal gücü desteklenir.",
      [ZodiacSign.LEO]: "Yaratıcı ifade ve sahne gücü artar.",
    },
  },
  saturn: {
    displayName: "Satürn",
    caption: "Disiplin ve yapı",
    description:
      "Satürn sınırlar, sorumluluk ve olgunlaşmayı getirir. Uzun vadeli başarı için sabır ve disiplin çağrısıdır.",
    effects: {
      [ZodiacSign.CAPRICORN]: "Hedef odaklılık ve kariyer disiplini artar.",
      [ZodiacSign.AQUARIUS]: "Sistem kurma, toplumsal sorumluluk ve vizyoner yapı güçlenir.",
      [ZodiacSign.ARIES]: "Denetimli cesaret ve planlı eylem gerektirir.",
    },
  },
  uranus: {
    displayName: "Uranüs",
    caption: "Devrim ve özgürleşme",
    description:
      "Uranüs yenilik, özgürleşme ve ani değişimleri temsil eder. Rutini kıran fikirler bu gezegenle gelir.",
    effects: {
      [ZodiacSign.AQUARIUS]: "İnovasyon, farklılık ve kolektif vizyon yükselir.",
      [ZodiacSign.TAURUS]: "Maddi alanlarda beklenmedik dönüşümler yaşanabilir.",
    },
  },
  neptune: {
    displayName: "Neptün",
    caption: "Hayal ve sezgi",
    description:
      "Neptün, rüyalar, sanat ve spiritüel bilinçle bağlantıdır. İlham ve sezgi derinleşir.",
    effects: {
      [ZodiacSign.PISCES]: "Sanatsal ve spiritüel yön kuvvetlenir.",
      [ZodiacSign.LEO]: "Yaratıcı vizyon ve imgelem desteklenir.",
    },
  },
};

export const getPlanetInfo = (name: string): PlanetAstrologyInfo | null => {
  const key = name.toLowerCase() as PlanetKey;
  return PLANET_ASTROLOGY[key] ?? null;
};

export const getEffectForZodiac = (
  name: string,
  zodiac: ZodiacSign | undefined
): string | null => {
  if (!zodiac) return null;
  const info = getPlanetInfo(name);
  if (!info) return null;
  return info.effects[zodiac] ?? null;
};
