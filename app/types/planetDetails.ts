import { ZodiacSign } from './zodiac';

export interface PlanetDetail {
  name: string;
  symbol: string;
  element: string;
  rulerOf: ZodiacSign[];
  exaltedIn?: ZodiacSign;
  detrimentIn?: ZodiacSign;
  fallIn?: ZodiacSign;
  orbitalPeriod: string;
  mythology: string;
  keywords: string[];
  color: string;
  gradient: [string, string];
}

export interface PlanetInSign {
  title: string;
  strength: number;
  description: string;
  keywords: string[];
  positiveTraits: string;
  challenges: string;
  advice: string;
}

// Retrograd gezegen listesi (gerçek zamanlı API yerine örnek)
export const RETROGRADE_PLANETS: string[] = ['mercury', 'venus'];

export const PLANET_DETAILS: Record<string, PlanetDetail> = {
  sun: {
    name: 'Güneş',
    symbol: '☉',
    element: 'Ateş',
    rulerOf: [ZodiacSign.LEO],
    exaltedIn: ZodiacSign.ARIES,
    fallIn: ZodiacSign.LIBRA,
    orbitalPeriod: '365 gün (Dünya\'nın yörüngesi)',
    mythology: 'Apollo - Işık, müzik ve kehanet tanrısı. Yunan mitolojisinde Helios güneş arabasıyla gökyüzünde yolculuk eder. Güneş, yaşam enerjisinin, bilinçli benliğin ve ruhsal aydınlanmanın sembolüdür.',
    keywords: ['Kimlik', 'Ego', 'Yaşam Enerjisi', 'Bilinç', 'Yaratıcılık', 'Otorite', 'Baba Figürü'],
    color: '#FDB813',
    gradient: ['#FDB813', '#FF6B35'],
  },
  moon: {
    name: 'Ay',
    symbol: '☽',
    element: 'Su',
    rulerOf: [ZodiacSign.CANCER],
    exaltedIn: ZodiacSign.TAURUS,
    fallIn: ZodiacSign.SCORPIO,
    orbitalPeriod: '27.3 gün',
    mythology: 'Artemis/Diana - Av ve Ay tanrıçası. Yunan mitolojisinde Selene ay arabasıyla geceyi aydınlatır. Ay, duyguları, içgüdüleri, anne arketipi ve geçmişi temsil eder.',
    keywords: ['Duygular', 'İçgüdü', 'Alışkanlıklar', 'Anne Figürü', 'Geçmiş', 'Güvenlik İhtiyacı', 'Ruh Hali'],
    color: '#C0C0C0',
    gradient: ['#E8E8E8', '#A8A8A8'],
  },
  mercury: {
    name: 'Merkür',
    symbol: '☿',
    element: 'Hava',
    rulerOf: [ZodiacSign.GEMINI, ZodiacSign.VIRGO],
    exaltedIn: ZodiacSign.AQUARIUS,
    fallIn: ZodiacSign.PISCES,
    orbitalPeriod: '88 gün',
    mythology: 'Hermes - Haberci tanrı, ticaret ve hırsızlık tanrısı. Kanatlı sandaletleriyle tanrılar arasında mesaj taşır. Merkür, zihin, iletişim, öğrenme ve adaptasyon yeteneğini simgeler.',
    keywords: ['İletişim', 'Zihin', 'Öğrenme', 'Mantık', 'Analiz', 'Yazma', 'Konuşma', 'Ticaret'],
    color: '#87CEEB',
    gradient: ['#87CEEB', '#4682B4'],
  },
  venus: {
    name: 'Venüs',
    symbol: '♀',
    element: 'Toprak/Hava',
    rulerOf: [ZodiacSign.TAURUS, ZodiacSign.LIBRA],
    exaltedIn: ZodiacSign.PISCES,
    detrimentIn: ZodiacSign.SCORPIO,
    fallIn: ZodiacSign.VIRGO,
    orbitalPeriod: '225 gün',
    mythology: 'Aphrodite - Aşk ve güzellik tanrıçası. Deniz köpüğünden doğmuş, sevgi ve çekiciliğin sembolü. Venüs, romantizm, estetik, değerler ve ilişkilerdeki uyumu temsil eder.',
    keywords: ['Aşk', 'Güzellik', 'Estetik', 'Değer', 'İlişkiler', 'Para', 'Zevk', 'Uyum'],
    color: '#FF69B4',
    gradient: ['#FF69B4', '#FFB6C1'],
  },
  mars: {
    name: 'Mars',
    symbol: '♂',
    element: 'Ateş',
    rulerOf: [ZodiacSign.ARIES, ZodiacSign.SCORPIO],
    exaltedIn: ZodiacSign.CAPRICORN,
    fallIn: ZodiacSign.CANCER,
    orbitalPeriod: '687 gün',
    mythology: 'Ares - Savaş tanrısı, cesaret ve mücadele sembolü. Kızıl gezegen, eylem, tutku ve rekabeti temsil eder. Mars, nasıl harekete geçtiğimizi ve ne için savaştığımızı gösterir.',
    keywords: ['Eylem', 'Enerji', 'Cesaret', 'Öfke', 'Tutku', 'Rekabet', 'Cinsellik', 'Mücadele'],
    color: '#DC143C',
    gradient: ['#DC143C', '#FF6347'],
  },
  jupiter: {
    name: 'Jüpiter',
    symbol: '♃',
    element: 'Ateş',
    rulerOf: [ZodiacSign.SAGITTARIUS, ZodiacSign.PISCES],
    exaltedIn: ZodiacSign.CANCER,
    fallIn: ZodiacSign.CAPRICORN,
    orbitalPeriod: '11.9 yıl',
    mythology: 'Zeus/Jüpiter - Tanrıların kralı, yıldırım ve adaleti temsil eder. Jüpiter, büyüme, genişleme, şans ve bilgeliği simgeler. Öğretmen ve filozof arketipidir.',
    keywords: ['Büyüme', 'Genişleme', 'Şans', 'Felsefe', 'Bilgelik', 'Optimizm', 'Yabancı Kültürler', 'Din'],
    color: '#FFD700',
    gradient: ['#FFD700', '#FFA500'],
  },
  saturn: {
    name: 'Satürn',
    symbol: '♄',
    element: 'Toprak',
    rulerOf: [ZodiacSign.CAPRICORN, ZodiacSign.AQUARIUS],
    exaltedIn: ZodiacSign.LIBRA,
    fallIn: ZodiacSign.ARIES,
    orbitalPeriod: '29.5 yıl',
    mythology: 'Cronus - Zaman tanrısı, disiplin ve sınırların efendisi. Satürn, hayatın zorlu derslerini öğreten öğretmendir. Sorumluluk, olgunluk ve kalıcı başarıyı temsil eder.',
    keywords: ['Disiplin', 'Sorumluluk', 'Sınır', 'Zaman', 'Olgunluk', 'Yapı', 'Otorite', 'Ders'],
    color: '#B8860B',
    gradient: ['#B8860B', '#8B7355'],
  },
  uranus: {
    name: 'Uranüs',
    symbol: '♅',
    element: 'Hava',
    rulerOf: [ZodiacSign.AQUARIUS],
    exaltedIn: ZodiacSign.SCORPIO,
    fallIn: ZodiacSign.TAURUS,
    orbitalPeriod: '84 yıl',
    mythology: 'Uranos - Gök tanrısı, ilk kuşak titanların babası. Uranüs, ani değişim, devrim ve yeniliği temsil eder. Özgürlük, bağımsızlık ve teknolojinin gezegenidir.',
    keywords: ['Devrim', 'Özgürlük', 'Ani Değişim', 'Teknoloji', 'Yenilik', 'Bağımsızlık', 'Elektrik', 'Uyanış'],
    color: '#00CED1',
    gradient: ['#00CED1', '#20B2AA'],
  },
  neptune: {
    name: 'Neptün',
    symbol: '♆',
    element: 'Su',
    rulerOf: [ZodiacSign.PISCES],
    exaltedIn: ZodiacSign.LEO,
    fallIn: ZodiacSign.AQUARIUS,
    orbitalPeriod: '165 yıl',
    mythology: 'Poseidon - Deniz tanrısı, okyanus ve depremlerin hakimi. Neptün, sezgi, hayal gücü ve spiritüel arayışı simgeler. Çözülme, ilham ve yanılsamanın gezegenidir.',
    keywords: ['Sezgi', 'Hayal', 'Rüya', 'Spiritüalite', 'Sanat', 'Müzik', 'Çözülme', 'İllüzyon', 'Merhamet'],
    color: '#4169E1',
    gradient: ['#4169E1', '#1E90FF'],
  },
};

// Gezegenlerin burçlardaki etkileri
export const PLANET_IN_SIGNS: Record<string, Record<ZodiacSign, PlanetInSign>> = {
  venus: {
    [ZodiacSign.ARIES]: {
      title: 'Venüs Koç\'ta',
      strength: 75,
      description: 'Aşkta cesur, spontane ve tutkulu. İlk adımı atmaktan korkmaz, romantizmde doğrudan ve heyecan odaklı.',
      keywords: ['Tutkulu', 'Hızlı', 'Rekabetçi', 'Doğrudan'],
      positiveTraits: 'Aşkta cesaret, spontane romantizm, heyecan yaratma yeteneği, özgün ifade biçimi',
      challenges: 'Sabırsızlık, uzun vadeli ilişki zorluğu, aşırı bağımsızlık, duygusal derinlik eksikliği',
      advice: 'Romantizmde hız yerine derinliğe odaklan. Partnerine alan vermeyi öğren. Aşk bir yarış değil, yolculuktur.',
    },
    [ZodiacSign.TAURUS]: {
      title: 'Venüs Boğa\'da',
      strength: 95,
      description: 'Venüs kendi evinde! Aşkta sadık, duyusal ve güvenlik odaklı. Fiziksel temas ve güzelliğe büyük önem verir.',
      keywords: ['Sadık', 'Duyusal', 'Güvenli', 'Maddi'],
      positiveTraits: 'Derin sadakat, duyusal romantizm, güzellik duygusu, maddi güvenlik sağlama',
      challenges: 'Aşırı inatçılık, değişime direnç, kıskançlık, maddiyata aşırı bağlılık',
      advice: 'Değişimi kabul et. İlişkide esneklik göster. Güvenlik önemli ama kontrolü bırakmayı öğren.',
    },
    [ZodiacSign.GEMINI]: {
      title: 'Venüs İkizler\'de',
      strength: 80,
      description: 'Aşkta zihinsel bağlantı arar. Flört etmeyi sever, çeşitlilik ve iletişim odaklıdır. Sözcüklerle aşık eder.',
      keywords: ['İletişimci', 'Çok Yönlü', 'Meraklı', 'Sosyal'],
      positiveTraits: 'Mükemmel iletişim, entelektüel romantizm, eğlenceli flört, uyum yeteneği',
      challenges: 'Bağlanma korkusu, yüzeysellik, kararsızlık, birden fazla ilgiye meyil',
      advice: 'Bir ilişkiye derinlemesine odaklanmayı dene. Zihinsel bağ önemli ama duygusal derinlik de gerekli.',
    },
    [ZodiacSign.CANCER]: {
      title: 'Venüs Yengeç\'te',
      strength: 85,
      description: 'Aşkta duygusal, koruyucu ve besleyici. Yuva kurmayı sever, aile ve güvenlik odaklıdır. Derin hisseder.',
      keywords: ['Duygusal', 'Koruyucu', 'Besleyici', 'Ailesel'],
      positiveTraits: 'Derin duygusal bağ, sadakat, besleyicilik, ev odaklı romantizm',
      challenges: 'Aşırı hassasiyet, geçmişe takılma, bağımlılık, çabuk alınma',
      advice: 'Duygularını paylaş ama aşırı savunmacı olma. Geçmiş ilişkileri geride bırak. Kendinle yeterli ol.',
    },
    [ZodiacSign.LEO]: {
      title: 'Venüs Aslan\'da',
      strength: 88,
      description: 'Aşkta gösterişli, cömert ve dramatik. Takdir edilmek ister, romantizmde büyük jestler yapar. Sadık ve tutkulu.',
      keywords: ['Gösterişli', 'Cömert', 'Tutkulu', 'Sadık'],
      positiveTraits: 'Büyük romantizm, cömertlik, sıcaklık, eğlence yaratma, sadakat',
      challenges: 'Ego ihtiyacı, aşırı drama, övgü beklentisi, dikkat arayışı',
      advice: 'İlişki tek taraflı değil. Partneri de sahneye çıkar. Mütevazi romantizm bazen daha etkilidir.',
    },
    [ZodiacSign.VIRGO]: {
      title: 'Venüs Başak\'ta',
      strength: 65,
      description: 'Aşkta pratik, detaycı ve hizmet odaklı. Sevgisini eylemlerle gösterir. Mükemmeliyetçi ve analitik.',
      keywords: ['Pratik', 'Detaycı', 'Hizmet Odaklı', 'Mükemmeliyetçi'],
      positiveTraits: 'Güvenilir sevgi, pratik destek, iyileştirme yeteneği, sadakat',
      challenges: 'Aşırı eleştiricilik, soğukluk, mükemmeliyetçilik, spontanlık eksikliği',
      advice: 'Kusursuzluk yerine bağlantıyı seç. Eleştiri yerine takdir et. İlişkide esneklik göster.',
    },
    [ZodiacSign.LIBRA]: {
      title: 'Venüs Terazi\'de',
      strength: 95,
      description: 'Venüs yine kendi evinde! Aşkta uyumlu, romantik ve adil. Ortaklık odaklı, güzelliğe ve dengeye değer verir.',
      keywords: ['Uyumlu', 'Romantik', 'Adil', 'Diplomatik'],
      positiveTraits: 'Mükemmel uyum, romantizm, adalet, sosyal zerafet, partnerlik yeteneği',
      challenges: 'Kararsızlık, çatışmadan kaçınma, aşırı uyumlu olma, kendi ihtiyaçlarını ihmal',
      advice: 'Uyum önemli ama kendi sesini kaybetme. Hayır demeyi öğren. İhtiyaçlarını da ifade et.',
    },
    [ZodiacSign.SCORPIO]: {
      title: 'Venüs Akrep\'te',
      strength: 70,
      description: 'Aşkta yoğun, derin ve tutkulu. Her şey ya hep ya hiç. Sadakat ve duygusal bağlılık kritik. Gizlilik sever.',
      keywords: ['Yoğun', 'Derin', 'Tutkulu', 'Gizli'],
      positiveTraits: 'Derin bağlılık, yoğun tutku, sadakat, dönüştürücü sevgi',
      challenges: 'Kıskançlık, sahiplenme, güven sorunları, manipülasyon eğilimi',
      advice: 'Güven ver ve güven al. Kontrolü bırak. Aşk özgürlük gerektirir. Sırları paylaş.',
    },
    [ZodiacSign.SAGITTARIUS]: {
      title: 'Venüs Yay\'da',
      strength: 78,
      description: 'Aşkta özgür, macera odaklı ve iyimser. Felsefik bağlantı arar. Bağımsızlık önemlidir. Eğlenceli flört.',
      keywords: ['Özgür', 'Maceracı', 'İyimser', 'Felsefik'],
      positiveTraits: 'Neşeli romantizm, macera, özgürlük, açık fikirlilik, eğlence',
      challenges: 'Bağlanma korkusu, gerçekçi olmama, aşırı bağımsızlık, sürekli değişim ihtiyacı',
      advice: 'Özgürlük ve bağlılık bir arada olabilir. Derinliğe izin ver. İlişkide kök sal.',
    },
    [ZodiacSign.CAPRICORN]: {
      title: 'Venüs Oğlak\'ta',
      strength: 73,
      description: 'Aşkta ciddi, geleneksel ve uzun vadeli odaklı. Güvenilir ve sadık. Statü ve istikrar önemser.',
      keywords: ['Ciddi', 'Geleneksel', 'Sadık', 'İstikrarlı'],
      positiveTraits: 'Uzun vadeli bağlılık, güvenilirlik, sorumluluk, istikrarlı sevgi',
      challenges: 'Duygusal mesafe, fazla ciddiyet, statü odaklılık, spontanlık eksikliği',
      advice: 'İlişkide biraz gevşe. Eğlenmeyi unutma. Sevgiyi sadece sorumlulukla gösterme.',
    },
    [ZodiacSign.AQUARIUS]: {
      title: 'Venüs Kova\'da',
      strength: 76,
      description: 'Aşkta özgün, bağımsız ve entelektüel. Arkadaşlık temelli ilişki arar. Geleceğe ve özgürlüğe değer verir.',
      keywords: ['Özgün', 'Bağımsız', 'Entelektüel', 'Arkadaşça'],
      positiveTraits: 'Özgün sevgi ifadesi, bağımsızlık, eşitlik, entelektüel bağ',
      challenges: 'Duygusal mesafe, aşırı rasyonellik, yakınlıktan kaçınma, soğukluk',
      advice: 'Duygularını bastırma. Yakınlığı kabul et. Özgürlük ve sevgi bir arada olabilir.',
    },
    [ZodiacSign.PISCES]: {
      title: 'Venüs Balık\'ta',
      strength: 92,
      description: 'Venüs yücelmede! Aşkta romantik, empatik ve fedakar. Ruhsal bağ arar. Koşulsuz sevgi idealini yaşar.',
      keywords: ['Romantik', 'Empatik', 'Fedakar', 'Ruhsal'],
      positiveTraits: 'Koşulsuz sevgi, derin empati, romantizm, spiritüel bağ',
      challenges: 'Aşırı fedakarlık, sınır eksikliği, hayal kırıklığı, kurban rolü',
      advice: 'Kendini kaybetme. Sınır koy. Gerçekçi beklentiler oluştur. Kurtarıcı değil, partner ol.',
    },
  },
  // Diğer gezegenler için de benzer yapı oluşturulabilir...
};
