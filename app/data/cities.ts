// Dünya şehirleri ve koordinatları (Astroloji hesaplamaları için)
export interface City {
  name: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
}

// Türkiye İlleri
export const TURKEY_CITIES: City[] = [
  { name: "Adana", country: "Türkiye", lat: 37.0, lng: 35.3213, timezone: "Europe/Istanbul" },
  { name: "Adıyaman", country: "Türkiye", lat: 37.7648, lng: 38.2786, timezone: "Europe/Istanbul" },
  { name: "Afyonkarahisar", country: "Türkiye", lat: 38.7507, lng: 30.5567, timezone: "Europe/Istanbul" },
  { name: "Ağrı", country: "Türkiye", lat: 39.7191, lng: 43.0503, timezone: "Europe/Istanbul" },
  { name: "Aksaray", country: "Türkiye", lat: 38.3687, lng: 34.0370, timezone: "Europe/Istanbul" },
  { name: "Amasya", country: "Türkiye", lat: 40.6499, lng: 35.8353, timezone: "Europe/Istanbul" },
  { name: "Ankara", country: "Türkiye", lat: 39.9334, lng: 32.8597, timezone: "Europe/Istanbul" },
  { name: "Antalya", country: "Türkiye", lat: 36.8969, lng: 30.7133, timezone: "Europe/Istanbul" },
  { name: "Ardahan", country: "Türkiye", lat: 41.1105, lng: 42.7022, timezone: "Europe/Istanbul" },
  { name: "Artvin", country: "Türkiye", lat: 41.1828, lng: 41.8183, timezone: "Europe/Istanbul" },
  { name: "Aydın", country: "Türkiye", lat: 37.8560, lng: 27.8416, timezone: "Europe/Istanbul" },
  { name: "Balıkesir", country: "Türkiye", lat: 39.6484, lng: 27.8826, timezone: "Europe/Istanbul" },
  { name: "Bartın", country: "Türkiye", lat: 41.6344, lng: 32.3375, timezone: "Europe/Istanbul" },
  { name: "Batman", country: "Türkiye", lat: 37.8812, lng: 41.1351, timezone: "Europe/Istanbul" },
  { name: "Bayburt", country: "Türkiye", lat: 40.2552, lng: 40.2249, timezone: "Europe/Istanbul" },
  { name: "Bilecik", country: "Türkiye", lat: 40.0567, lng: 30.0665, timezone: "Europe/Istanbul" },
  { name: "Bingöl", country: "Türkiye", lat: 38.8854, lng: 40.4966, timezone: "Europe/Istanbul" },
  { name: "Bitlis", country: "Türkiye", lat: 38.4004, lng: 42.1095, timezone: "Europe/Istanbul" },
  { name: "Bolu", country: "Türkiye", lat: 40.7392, lng: 31.6089, timezone: "Europe/Istanbul" },
  { name: "Burdur", country: "Türkiye", lat: 37.7203, lng: 30.2906, timezone: "Europe/Istanbul" },
  { name: "Bursa", country: "Türkiye", lat: 40.1826, lng: 29.0665, timezone: "Europe/Istanbul" },
  { name: "Çanakkale", country: "Türkiye", lat: 40.1553, lng: 26.4142, timezone: "Europe/Istanbul" },
  { name: "Çankırı", country: "Türkiye", lat: 40.6013, lng: 33.6134, timezone: "Europe/Istanbul" },
  { name: "Çorum", country: "Türkiye", lat: 40.5506, lng: 34.9556, timezone: "Europe/Istanbul" },
  { name: "Denizli", country: "Türkiye", lat: 37.7765, lng: 29.0864, timezone: "Europe/Istanbul" },
  { name: "Diyarbakır", country: "Türkiye", lat: 37.9144, lng: 40.2306, timezone: "Europe/Istanbul" },
  { name: "Düzce", country: "Türkiye", lat: 40.8438, lng: 31.1565, timezone: "Europe/Istanbul" },
  { name: "Edirne", country: "Türkiye", lat: 41.6818, lng: 26.5623, timezone: "Europe/Istanbul" },
  { name: "Elazığ", country: "Türkiye", lat: 38.6810, lng: 39.2264, timezone: "Europe/Istanbul" },
  { name: "Erzincan", country: "Türkiye", lat: 39.7500, lng: 39.5000, timezone: "Europe/Istanbul" },
  { name: "Erzurum", country: "Türkiye", lat: 39.9000, lng: 41.2700, timezone: "Europe/Istanbul" },
  { name: "Eskişehir", country: "Türkiye", lat: 39.7767, lng: 30.5206, timezone: "Europe/Istanbul" },
  { name: "Gaziantep", country: "Türkiye", lat: 37.0662, lng: 37.3833, timezone: "Europe/Istanbul" },
  { name: "Giresun", country: "Türkiye", lat: 40.9128, lng: 38.3895, timezone: "Europe/Istanbul" },
  { name: "Gümüşhane", country: "Türkiye", lat: 40.4386, lng: 39.5086, timezone: "Europe/Istanbul" },
  { name: "Hakkari", country: "Türkiye", lat: 37.5833, lng: 43.7333, timezone: "Europe/Istanbul" },
  { name: "Hatay", country: "Türkiye", lat: 36.4018, lng: 36.3498, timezone: "Europe/Istanbul" },
  { name: "Iğdır", country: "Türkiye", lat: 39.9167, lng: 44.0333, timezone: "Europe/Istanbul" },
  { name: "Isparta", country: "Türkiye", lat: 37.7648, lng: 30.5566, timezone: "Europe/Istanbul" },
  { name: "İstanbul", country: "Türkiye", lat: 41.0082, lng: 28.9784, timezone: "Europe/Istanbul" },
  { name: "İzmir", country: "Türkiye", lat: 38.4192, lng: 27.1287, timezone: "Europe/Istanbul" },
  { name: "Kahramanmaraş", country: "Türkiye", lat: 37.5858, lng: 36.9371, timezone: "Europe/Istanbul" },
  { name: "Karabük", country: "Türkiye", lat: 41.2061, lng: 32.6204, timezone: "Europe/Istanbul" },
  { name: "Karaman", country: "Türkiye", lat: 37.1759, lng: 33.2287, timezone: "Europe/Istanbul" },
  { name: "Kars", country: "Türkiye", lat: 40.6167, lng: 43.1000, timezone: "Europe/Istanbul" },
  { name: "Kastamonu", country: "Türkiye", lat: 41.3887, lng: 33.7827, timezone: "Europe/Istanbul" },
  { name: "Kayseri", country: "Türkiye", lat: 38.7312, lng: 35.4787, timezone: "Europe/Istanbul" },
  { name: "Kırıkkale", country: "Türkiye", lat: 39.8468, lng: 33.5153, timezone: "Europe/Istanbul" },
  { name: "Kırklareli", country: "Türkiye", lat: 41.7333, lng: 27.2167, timezone: "Europe/Istanbul" },
  { name: "Kırşehir", country: "Türkiye", lat: 39.1425, lng: 34.1709, timezone: "Europe/Istanbul" },
  { name: "Kilis", country: "Türkiye", lat: 36.7184, lng: 37.1212, timezone: "Europe/Istanbul" },
  { name: "Kocaeli", country: "Türkiye", lat: 40.8533, lng: 29.8815, timezone: "Europe/Istanbul" },
  { name: "Konya", country: "Türkiye", lat: 37.8667, lng: 32.4833, timezone: "Europe/Istanbul" },
  { name: "Kütahya", country: "Türkiye", lat: 39.4167, lng: 29.9833, timezone: "Europe/Istanbul" },
  { name: "Malatya", country: "Türkiye", lat: 38.3552, lng: 38.3095, timezone: "Europe/Istanbul" },
  { name: "Manisa", country: "Türkiye", lat: 38.6191, lng: 27.4289, timezone: "Europe/Istanbul" },
  { name: "Mardin", country: "Türkiye", lat: 37.3212, lng: 40.7245, timezone: "Europe/Istanbul" },
  { name: "Mersin", country: "Türkiye", lat: 36.8000, lng: 34.6333, timezone: "Europe/Istanbul" },
  { name: "Muğla", country: "Türkiye", lat: 37.2153, lng: 28.3636, timezone: "Europe/Istanbul" },
  { name: "Muş", country: "Türkiye", lat: 38.9462, lng: 41.7539, timezone: "Europe/Istanbul" },
  { name: "Nevşehir", country: "Türkiye", lat: 38.6939, lng: 34.6857, timezone: "Europe/Istanbul" },
  { name: "Niğde", country: "Türkiye", lat: 37.9667, lng: 34.6833, timezone: "Europe/Istanbul" },
  { name: "Ordu", country: "Türkiye", lat: 40.9839, lng: 37.8764, timezone: "Europe/Istanbul" },
  { name: "Osmaniye", country: "Türkiye", lat: 37.0742, lng: 36.2465, timezone: "Europe/Istanbul" },
  { name: "Rize", country: "Türkiye", lat: 41.0201, lng: 40.5234, timezone: "Europe/Istanbul" },
  { name: "Sakarya", country: "Türkiye", lat: 40.6940, lng: 30.4358, timezone: "Europe/Istanbul" },
  { name: "Samsun", country: "Türkiye", lat: 41.2867, lng: 36.33, timezone: "Europe/Istanbul" },
  { name: "Siirt", country: "Türkiye", lat: 37.9333, lng: 41.95, timezone: "Europe/Istanbul" },
  { name: "Sinop", country: "Türkiye", lat: 42.0231, lng: 35.1531, timezone: "Europe/Istanbul" },
  { name: "Sivas", country: "Türkiye", lat: 39.7477, lng: 37.0179, timezone: "Europe/Istanbul" },
  { name: "Şanlıurfa", country: "Türkiye", lat: 37.1591, lng: 38.7969, timezone: "Europe/Istanbul" },
  { name: "Şırnak", country: "Türkiye", lat: 37.5164, lng: 42.4611, timezone: "Europe/Istanbul" },
  { name: "Tekirdağ", country: "Türkiye", lat: 40.9833, lng: 27.5167, timezone: "Europe/Istanbul" },
  { name: "Tokat", country: "Türkiye", lat: 40.3167, lng: 36.55, timezone: "Europe/Istanbul" },
  { name: "Trabzon", country: "Türkiye", lat: 41.0015, lng: 39.7178, timezone: "Europe/Istanbul" },
  { name: "Tunceli", country: "Türkiye", lat: 39.1079, lng: 39.5401, timezone: "Europe/Istanbul" },
  { name: "Uşak", country: "Türkiye", lat: 38.6823, lng: 29.4082, timezone: "Europe/Istanbul" },
  { name: "Van", country: "Türkiye", lat: 38.4891, lng: 43.4089, timezone: "Europe/Istanbul" },
  { name: "Yalova", country: "Türkiye", lat: 40.6500, lng: 29.2667, timezone: "Europe/Istanbul" },
  { name: "Yozgat", country: "Türkiye", lat: 39.8181, lng: 34.8147, timezone: "Europe/Istanbul" },
  { name: "Zonguldak", country: "Türkiye", lat: 41.4564, lng: 31.7987, timezone: "Europe/Istanbul" },
];

// Dünya Şehirleri (Popüler)
export const WORLD_CITIES: City[] = [
  // İngiltere
  { name: "Londra", country: "İngiltere", lat: 51.5074, lng: -0.1278, timezone: "Europe/London" },
  { name: "Birmingham", country: "İngiltere", lat: 52.4862, lng: -1.8904, timezone: "Europe/London" },
  { name: "Manchester", country: "İngiltere", lat: 53.4808, lng: -2.2426, timezone: "Europe/London" },
  { name: "Liverpool", country: "İngiltere", lat: 53.4084, lng: -2.9916, timezone: "Europe/London" },
  { name: "Leeds", country: "İngiltere", lat: 53.8008, lng: -1.5491, timezone: "Europe/London" },
  { name: "Sheffield", country: "İngiltere", lat: 53.3811, lng: -1.4701, timezone: "Europe/London" },
  { name: "Bristol", country: "İngiltere", lat: 51.4545, lng: -2.5879, timezone: "Europe/London" },
  { name: "Newcastle", country: "İngiltere", lat: 54.9783, lng: -1.6178, timezone: "Europe/London" },
  { name: "Nottingham", country: "İngiltere", lat: 52.9548, lng: -1.1581, timezone: "Europe/London" },
  { name: "Leicester", country: "İngiltere", lat: 52.6369, lng: -1.1398, timezone: "Europe/London" },
  { name: "Edinburgh", country: "İskoçya", lat: 55.9533, lng: -3.1883, timezone: "Europe/London" },
  { name: "Glasgow", country: "İskoçya", lat: 55.8642, lng: -4.2518, timezone: "Europe/London" },
  { name: "Cardiff", country: "Galler", lat: 51.4816, lng: -3.1791, timezone: "Europe/London" },
  { name: "Belfast", country: "Kuzey İrlanda", lat: 54.5973, lng: -5.9301, timezone: "Europe/London" },
  
  // Fransa
  { name: "Paris", country: "Fransa", lat: 48.8566, lng: 2.3522, timezone: "Europe/Paris" },
  { name: "Marsilya", country: "Fransa", lat: 43.2965, lng: 5.3698, timezone: "Europe/Paris" },
  { name: "Lyon", country: "Fransa", lat: 45.7640, lng: 4.8357, timezone: "Europe/Paris" },
  { name: "Toulouse", country: "Fransa", lat: 43.6047, lng: 1.4442, timezone: "Europe/Paris" },
  { name: "Nice", country: "Fransa", lat: 43.7102, lng: 7.2620, timezone: "Europe/Paris" },
  { name: "Nantes", country: "Fransa", lat: 47.2184, lng: -1.5536, timezone: "Europe/Paris" },
  { name: "Strasbourg", country: "Fransa", lat: 48.5734, lng: 7.7521, timezone: "Europe/Paris" },
  { name: "Montpellier", country: "Fransa", lat: 43.6108, lng: 3.8767, timezone: "Europe/Paris" },
  { name: "Bordeaux", country: "Fransa", lat: 44.8378, lng: -0.5792, timezone: "Europe/Paris" },
  { name: "Lille", country: "Fransa", lat: 50.6292, lng: 3.0573, timezone: "Europe/Paris" },
  { name: "Rennes", country: "Fransa", lat: 48.1173, lng: -1.6778, timezone: "Europe/Paris" },
  { name: "Reims", country: "Fransa", lat: 49.2583, lng: 4.0317, timezone: "Europe/Paris" },
  
  // Almanya
  { name: "Berlin", country: "Almanya", lat: 52.5200, lng: 13.4050, timezone: "Europe/Berlin" },
  { name: "Münih", country: "Almanya", lat: 48.1351, lng: 11.5820, timezone: "Europe/Berlin" },
  { name: "Hamburg", country: "Almanya", lat: 53.5511, lng: 9.9937, timezone: "Europe/Berlin" },
  { name: "Frankfurt", country: "Almanya", lat: 50.1109, lng: 8.6821, timezone: "Europe/Berlin" },
  { name: "Köln", country: "Almanya", lat: 50.9375, lng: 6.9603, timezone: "Europe/Berlin" },
  { name: "Düsseldorf", country: "Almanya", lat: 51.2277, lng: 6.7735, timezone: "Europe/Berlin" },
  { name: "Stuttgart", country: "Almanya", lat: 48.7758, lng: 9.1829, timezone: "Europe/Berlin" },
  { name: "Dortmund", country: "Almanya", lat: 51.5136, lng: 7.4653, timezone: "Europe/Berlin" },
  { name: "Essen", country: "Almanya", lat: 51.4556, lng: 7.0116, timezone: "Europe/Berlin" },
  { name: "Leipzig", country: "Almanya", lat: 51.3397, lng: 12.3731, timezone: "Europe/Berlin" },
  { name: "Bremen", country: "Almanya", lat: 53.0793, lng: 8.8017, timezone: "Europe/Berlin" },
  { name: "Dresden", country: "Almanya", lat: 51.0504, lng: 13.7373, timezone: "Europe/Berlin" },
  { name: "Hannover", country: "Almanya", lat: 52.3759, lng: 9.7320, timezone: "Europe/Berlin" },
  { name: "Nürnberg", country: "Almanya", lat: 49.4521, lng: 11.0767, timezone: "Europe/Berlin" },
  
  // İtalya
  { name: "Roma", country: "İtalya", lat: 41.9028, lng: 12.4964, timezone: "Europe/Rome" },
  { name: "Milano", country: "İtalya", lat: 45.4642, lng: 9.1900, timezone: "Europe/Rome" },
  { name: "Napoli", country: "İtalya", lat: 40.8518, lng: 14.2681, timezone: "Europe/Rome" },
  { name: "Torino", country: "İtalya", lat: 45.0703, lng: 7.6869, timezone: "Europe/Rome" },
  { name: "Palermo", country: "İtalya", lat: 38.1157, lng: 13.3615, timezone: "Europe/Rome" },
  { name: "Cenova", country: "İtalya", lat: 44.4056, lng: 8.9463, timezone: "Europe/Rome" },
  { name: "Bologna", country: "İtalya", lat: 44.4949, lng: 11.3426, timezone: "Europe/Rome" },
  { name: "Floransa", country: "İtalya", lat: 43.7696, lng: 11.2558, timezone: "Europe/Rome" },
  { name: "Venedik", country: "İtalya", lat: 45.4408, lng: 12.3155, timezone: "Europe/Rome" },
  { name: "Verona", country: "İtalya", lat: 45.4384, lng: 10.9916, timezone: "Europe/Rome" },
  { name: "Bari", country: "İtalya", lat: 41.1171, lng: 16.8719, timezone: "Europe/Rome" },
  { name: "Catania", country: "İtalya", lat: 37.5079, lng: 15.0830, timezone: "Europe/Rome" },
  
  // İspanya
  { name: "Madrid", country: "İspanya", lat: 40.4168, lng: -3.7038, timezone: "Europe/Madrid" },
  { name: "Barselona", country: "İspanya", lat: 41.3851, lng: 2.1734, timezone: "Europe/Madrid" },
  { name: "Valensiya", country: "İspanya", lat: 39.4699, lng: -0.3763, timezone: "Europe/Madrid" },
  { name: "Sevilla", country: "İspanya", lat: 37.3891, lng: -5.9845, timezone: "Europe/Madrid" },
  { name: "Zaragoza", country: "İspanya", lat: 41.6488, lng: -0.8891, timezone: "Europe/Madrid" },
  { name: "Malaga", country: "İspanya", lat: 36.7213, lng: -4.4214, timezone: "Europe/Madrid" },
  { name: "Murcia", country: "İspanya", lat: 37.9922, lng: -1.1307, timezone: "Europe/Madrid" },
  { name: "Palma", country: "İspanya", lat: 39.5696, lng: 2.6502, timezone: "Europe/Madrid" },
  { name: "Bilbao", country: "İspanya", lat: 43.2630, lng: -2.9350, timezone: "Europe/Madrid" },
  { name: "Alicante", country: "İspanya", lat: 38.3452, lng: -0.4810, timezone: "Europe/Madrid" },
  { name: "Granada", country: "İspanya", lat: 37.1773, lng: -3.5986, timezone: "Europe/Madrid" },
  { name: "San Sebastian", country: "İspanya", lat: 43.3183, lng: -1.9812, timezone: "Europe/Madrid" },
  
  // Hollanda
  { name: "Amsterdam", country: "Hollanda", lat: 52.3676, lng: 4.9041, timezone: "Europe/Amsterdam" },
  { name: "Rotterdam", country: "Hollanda", lat: 51.9244, lng: 4.4777, timezone: "Europe/Amsterdam" },
  { name: "Lahey", country: "Hollanda", lat: 52.0705, lng: 4.3007, timezone: "Europe/Amsterdam" },
  { name: "Utrecht", country: "Hollanda", lat: 52.0907, lng: 5.1214, timezone: "Europe/Amsterdam" },
  { name: "Eindhoven", country: "Hollanda", lat: 51.4416, lng: 5.4697, timezone: "Europe/Amsterdam" },
  { name: "Groningen", country: "Hollanda", lat: 53.2194, lng: 6.5665, timezone: "Europe/Amsterdam" },
  { name: "Tilburg", country: "Hollanda", lat: 51.5555, lng: 5.0913, timezone: "Europe/Amsterdam" },
  { name: "Almere", country: "Hollanda", lat: 52.3508, lng: 5.2647, timezone: "Europe/Amsterdam" },
  
  // Belçika
  { name: "Brüksel", country: "Belçika", lat: 50.8503, lng: 4.3517, timezone: "Europe/Brussels" },
  { name: "Anvers", country: "Belçika", lat: 51.2194, lng: 4.4025, timezone: "Europe/Brussels" },
  { name: "Gent", country: "Belçika", lat: 51.0543, lng: 3.7174, timezone: "Europe/Brussels" },
  { name: "Charleroi", country: "Belçika", lat: 50.4108, lng: 4.4446, timezone: "Europe/Brussels" },
  { name: "Liège", country: "Belçika", lat: 50.6326, lng: 5.5797, timezone: "Europe/Brussels" },
  { name: "Brugge", country: "Belçika", lat: 51.2093, lng: 3.2247, timezone: "Europe/Brussels" },
  { name: "Namur", country: "Belçika", lat: 50.4674, lng: 4.8720, timezone: "Europe/Brussels" },
  { name: "Leuven", country: "Belçika", lat: 50.8798, lng: 4.7005, timezone: "Europe/Brussels" },
  
  // Avusturya
  { name: "Viyana", country: "Avusturya", lat: 48.2082, lng: 16.3738, timezone: "Europe/Vienna" },
  { name: "Graz", country: "Avusturya", lat: 47.0707, lng: 15.4395, timezone: "Europe/Vienna" },
  { name: "Linz", country: "Avusturya", lat: 48.3069, lng: 14.2858, timezone: "Europe/Vienna" },
  { name: "Salzburg", country: "Avusturya", lat: 47.8095, lng: 13.0550, timezone: "Europe/Vienna" },
  { name: "Innsbruck", country: "Avusturya", lat: 47.2692, lng: 11.4041, timezone: "Europe/Vienna" },
  { name: "Klagenfurt", country: "Avusturya", lat: 46.6228, lng: 14.3051, timezone: "Europe/Vienna" },
  { name: "Villach", country: "Avusturya", lat: 46.6111, lng: 13.8558, timezone: "Europe/Vienna" },
  { name: "Wels", country: "Avusturya", lat: 48.1575, lng: 14.0289, timezone: "Europe/Vienna" },
  
  // İsviçre
  { name: "Zürih", country: "İsviçre", lat: 47.3769, lng: 8.5417, timezone: "Europe/Zurich" },
  { name: "Cenevre", country: "İsviçre", lat: 46.2044, lng: 6.1432, timezone: "Europe/Zurich" },
  { name: "Basel", country: "İsviçre", lat: 47.5596, lng: 7.5886, timezone: "Europe/Zurich" },
  { name: "Bern", country: "İsviçre", lat: 46.9480, lng: 7.4474, timezone: "Europe/Zurich" },
  { name: "Lozan", country: "İsviçre", lat: 46.5197, lng: 6.6323, timezone: "Europe/Zurich" },
  { name: "Winterthur", country: "İsviçre", lat: 47.5001, lng: 8.7500, timezone: "Europe/Zurich" },
  { name: "Lucerne", country: "İsviçre", lat: 47.0502, lng: 8.3093, timezone: "Europe/Zurich" },
  { name: "St. Gallen", country: "İsviçre", lat: 47.4245, lng: 9.3767, timezone: "Europe/Zurich" },
  
  // Polonya
  { name: "Varşova", country: "Polonya", lat: 52.2297, lng: 21.0122, timezone: "Europe/Warsaw" },
  { name: "Krakow", country: "Polonya", lat: 50.0647, lng: 19.9450, timezone: "Europe/Warsaw" },
  { name: "Lodz", country: "Polonya", lat: 51.7592, lng: 19.4560, timezone: "Europe/Warsaw" },
  { name: "Wroclaw", country: "Polonya", lat: 51.1079, lng: 17.0385, timezone: "Europe/Warsaw" },
  { name: "Poznan", country: "Polonya", lat: 52.4064, lng: 16.9252, timezone: "Europe/Warsaw" },
  { name: "Gdansk", country: "Polonya", lat: 54.3520, lng: 18.6466, timezone: "Europe/Warsaw" },
  { name: "Szczecin", country: "Polonya", lat: 53.4285, lng: 14.5528, timezone: "Europe/Warsaw" },
  { name: "Bydgoszcz", country: "Polonya", lat: 53.1235, lng: 18.0084, timezone: "Europe/Warsaw" },
  { name: "Lublin", country: "Polonya", lat: 51.2465, lng: 22.5684, timezone: "Europe/Warsaw" },
  { name: "Katowice", country: "Polonya", lat: 50.2649, lng: 19.0238, timezone: "Europe/Warsaw" },
  
  // Çekya
  { name: "Prag", country: "Çekya", lat: 50.0755, lng: 14.4378, timezone: "Europe/Prague" },
  { name: "Brno", country: "Çekya", lat: 49.1951, lng: 16.6068, timezone: "Europe/Prague" },
  { name: "Ostrava", country: "Çekya", lat: 49.8209, lng: 18.2625, timezone: "Europe/Prague" },
  { name: "Plzen", country: "Çekya", lat: 49.7384, lng: 13.3736, timezone: "Europe/Prague" },
  { name: "Liberec", country: "Çekya", lat: 50.7663, lng: 15.0543, timezone: "Europe/Prague" },
  { name: "Olomouc", country: "Çekya", lat: 49.5938, lng: 17.2509, timezone: "Europe/Prague" },
  { name: "Ceske Budejovice", country: "Çekya", lat: 48.9747, lng: 14.4747, timezone: "Europe/Prague" },
  { name: "Hradec Kralove", country: "Çekya", lat: 50.2092, lng: 15.8328, timezone: "Europe/Prague" },
  
  // Slovakya
  { name: "Bratislava", country: "Slovakya", lat: 48.1486, lng: 17.1077, timezone: "Europe/Bratislava" },
  { name: "Kosice", country: "Slovakya", lat: 48.7164, lng: 21.2611, timezone: "Europe/Bratislava" },
  { name: "Presov", country: "Slovakya", lat: 48.9986, lng: 21.2391, timezone: "Europe/Bratislava" },
  { name: "Zilina", country: "Slovakya", lat: 49.2231, lng: 18.7394, timezone: "Europe/Bratislava" },
  { name: "Nitra", country: "Slovakya", lat: 48.3069, lng: 18.0864, timezone: "Europe/Bratislava" },
  { name: "Banska Bystrica", country: "Slovakya", lat: 48.7358, lng: 19.1461, timezone: "Europe/Bratislava" },
  { name: "Trnava", country: "Slovakya", lat: 48.3774, lng: 17.5883, timezone: "Europe/Bratislava" },
  { name: "Martin", country: "Slovakya", lat: 49.0636, lng: 18.9236, timezone: "Europe/Bratislava" },
  
  // Macaristan
  { name: "Budapeşte", country: "Macaristan", lat: 47.4979, lng: 19.0402, timezone: "Europe/Budapest" },
  { name: "Debrecen", country: "Macaristan", lat: 47.5316, lng: 21.6273, timezone: "Europe/Budapest" },
  { name: "Szeged", country: "Macaristan", lat: 46.2530, lng: 20.1414, timezone: "Europe/Budapest" },
  { name: "Miskolc", country: "Macaristan", lat: 48.1035, lng: 20.7784, timezone: "Europe/Budapest" },
  { name: "Pécs", country: "Macaristan", lat: 46.0727, lng: 18.2323, timezone: "Europe/Budapest" },
  { name: "Győr", country: "Macaristan", lat: 47.6875, lng: 17.6504, timezone: "Europe/Budapest" },
  { name: "Nyíregyháza", country: "Macaristan", lat: 47.9495, lng: 21.7244, timezone: "Europe/Budapest" },
  { name: "Kecskemét", country: "Macaristan", lat: 46.9062, lng: 19.6913, timezone: "Europe/Budapest" },
  
  // İskandinav Ülkeleri
  { name: "Stockholm", country: "İsveç", lat: 59.3293, lng: 18.0686, timezone: "Europe/Stockholm" },
  { name: "Göteborg", country: "İsveç", lat: 57.7089, lng: 11.9746, timezone: "Europe/Stockholm" },
  { name: "Malmö", country: "İsveç", lat: 55.6050, lng: 13.0038, timezone: "Europe/Stockholm" },
  { name: "Uppsala", country: "İsveç", lat: 59.8586, lng: 17.6389, timezone: "Europe/Stockholm" },
  { name: "Västerås", country: "İsveç", lat: 59.6099, lng: 16.5448, timezone: "Europe/Stockholm" },
  { name: "Örebro", country: "İsveç", lat: 59.2753, lng: 15.2134, timezone: "Europe/Stockholm" },
  { name: "Linköping", country: "İsveç", lat: 58.4108, lng: 15.6214, timezone: "Europe/Stockholm" },
  
  { name: "Oslo", country: "Norveç", lat: 59.9139, lng: 10.7522, timezone: "Europe/Oslo" },
  { name: "Bergen", country: "Norveç", lat: 60.3913, lng: 5.3221, timezone: "Europe/Oslo" },
  { name: "Trondheim", country: "Norveç", lat: 63.4305, lng: 10.3951, timezone: "Europe/Oslo" },
  { name: "Stavanger", country: "Norveç", lat: 58.9700, lng: 5.7331, timezone: "Europe/Oslo" },
  { name: "Drammen", country: "Norveç", lat: 59.7440, lng: 10.2045, timezone: "Europe/Oslo" },
  { name: "Fredrikstad", country: "Norveç", lat: 59.2181, lng: 10.9298, timezone: "Europe/Oslo" },
  { name: "Tromsø", country: "Norveç", lat: 69.6492, lng: 18.9553, timezone: "Europe/Oslo" },
  
  { name: "Kopenhag", country: "Danimarka", lat: 55.6761, lng: 12.5683, timezone: "Europe/Copenhagen" },
  { name: "Aarhus", country: "Danimarka", lat: 56.1629, lng: 10.2039, timezone: "Europe/Copenhagen" },
  { name: "Odense", country: "Danimarka", lat: 55.4038, lng: 10.4024, timezone: "Europe/Copenhagen" },
  { name: "Aalborg", country: "Danimarka", lat: 57.0488, lng: 9.9217, timezone: "Europe/Copenhagen" },
  { name: "Esbjerg", country: "Danimarka", lat: 55.4670, lng: 8.4520, timezone: "Europe/Copenhagen" },
  { name: "Randers", country: "Danimarka", lat: 56.4607, lng: 10.0364, timezone: "Europe/Copenhagen" },
  
  { name: "Helsinki", country: "Finlandiya", lat: 60.1699, lng: 24.9384, timezone: "Europe/Helsinki" },
  { name: "Espoo", country: "Finlandiya", lat: 60.2055, lng: 24.6559, timezone: "Europe/Helsinki" },
  { name: "Tampere", country: "Finlandiya", lat: 61.4978, lng: 23.7610, timezone: "Europe/Helsinki" },
  { name: "Vantaa", country: "Finlandiya", lat: 60.2934, lng: 25.0378, timezone: "Europe/Helsinki" },
  { name: "Oulu", country: "Finlandiya", lat: 65.0121, lng: 25.4651, timezone: "Europe/Helsinki" },
  { name: "Turku", country: "Finlandiya", lat: 60.4518, lng: 22.2666, timezone: "Europe/Helsinki" },
  { name: "Jyväskylä", country: "Finlandiya", lat: 62.2426, lng: 25.7473, timezone: "Europe/Helsinki" },
  
  // Baltık Ülkeleri
  { name: "Tallinn", country: "Estonya", lat: 59.4370, lng: 24.7536, timezone: "Europe/Tallinn" },
  { name: "Tartu", country: "Estonya", lat: 58.3780, lng: 26.7290, timezone: "Europe/Tallinn" },
  { name: "Narva", country: "Estonya", lat: 59.3797, lng: 28.1791, timezone: "Europe/Tallinn" },
  { name: "Pärnu", country: "Estonya", lat: 58.3859, lng: 24.4971, timezone: "Europe/Tallinn" },
  
  { name: "Riga", country: "Letonya", lat: 56.9496, lng: 24.1052, timezone: "Europe/Riga" },
  { name: "Daugavpils", country: "Letonya", lat: 55.8714, lng: 26.5161, timezone: "Europe/Riga" },
  { name: "Liepaja", country: "Letonya", lat: 56.5047, lng: 21.0108, timezone: "Europe/Riga" },
  { name: "Jelgava", country: "Letonya", lat: 56.6511, lng: 23.7133, timezone: "Europe/Riga" },
  { name: "Jurmala", country: "Letonya", lat: 56.9680, lng: 23.7704, timezone: "Europe/Riga" },
  
  { name: "Vilnius", country: "Litvanya", lat: 54.6872, lng: 25.2797, timezone: "Europe/Vilnius" },
  { name: "Kaunas", country: "Litvanya", lat: 54.8985, lng: 23.9036, timezone: "Europe/Vilnius" },
  { name: "Klaipeda", country: "Litvanya", lat: 55.7033, lng: 21.1443, timezone: "Europe/Vilnius" },
  { name: "Siauliai", country: "Litvanya", lat: 55.9349, lng: 23.3137, timezone: "Europe/Vilnius" },
  { name: "Panevezys", country: "Litvanya", lat: 55.7348, lng: 24.3575, timezone: "Europe/Vilnius" },
  
  // Portekiz
  { name: "Lizbon", country: "Portekiz", lat: 38.7223, lng: -9.1393, timezone: "Europe/Lisbon" },
  { name: "Porto", country: "Portekiz", lat: 41.1579, lng: -8.6291, timezone: "Europe/Lisbon" },
  { name: "Vila Nova de Gaia", country: "Portekiz", lat: 41.1239, lng: -8.6118, timezone: "Europe/Lisbon" },
  { name: "Amadora", country: "Portekiz", lat: 38.7538, lng: -9.2304, timezone: "Europe/Lisbon" },
  { name: "Braga", country: "Portekiz", lat: 41.5454, lng: -8.4265, timezone: "Europe/Lisbon" },
  { name: "Coimbra", country: "Portekiz", lat: 40.2033, lng: -8.4103, timezone: "Europe/Lisbon" },
  { name: "Funchal", country: "Portekiz", lat: 32.6669, lng: -16.9241, timezone: "Atlantic/Madeira" },
  { name: "Faro", country: "Portekiz", lat: 37.0194, lng: -7.9322, timezone: "Europe/Lisbon" },
  
  // İrlanda
  { name: "Dublin", country: "İrlanda", lat: 53.3498, lng: -6.2603, timezone: "Europe/Dublin" },
  { name: "Cork", country: "İrlanda", lat: 51.8985, lng: -8.4756, timezone: "Europe/Dublin" },
  { name: "Limerick", country: "İrlanda", lat: 52.6638, lng: -8.6267, timezone: "Europe/Dublin" },
  { name: "Galway", country: "İrlanda", lat: 53.2707, lng: -9.0568, timezone: "Europe/Dublin" },
  { name: "Waterford", country: "İrlanda", lat: 52.2593, lng: -7.1101, timezone: "Europe/Dublin" },
  { name: "Drogheda", country: "İrlanda", lat: 53.7189, lng: -6.3478, timezone: "Europe/Dublin" },
  
  // Rusya (Avrupa kısmı)
  { name: "Moskova", country: "Rusya", lat: 55.7558, lng: 37.6173, timezone: "Europe/Moscow" },
  { name: "Sankt Petersburg", country: "Rusya", lat: 59.9343, lng: 30.3351, timezone: "Europe/Moscow" },
  { name: "Novosibirsk", country: "Rusya", lat: 55.0084, lng: 82.9357, timezone: "Asia/Novosibirsk" },
  { name: "Yekaterinburg", country: "Rusya", lat: 56.8389, lng: 60.6057, timezone: "Asia/Yekaterinburg" },
  { name: "Kazan", country: "Rusya", lat: 55.8304, lng: 49.0661, timezone: "Europe/Moscow" },
  { name: "Nizhny Novgorod", country: "Rusya", lat: 56.2965, lng: 43.9361, timezone: "Europe/Moscow" },
  { name: "Samara", country: "Rusya", lat: 53.1959, lng: 50.1002, timezone: "Europe/Samara" },
  { name: "Rostov-on-Don", country: "Rusya", lat: 47.2357, lng: 39.7015, timezone: "Europe/Moscow" },
  { name: "Ufa", country: "Rusya", lat: 54.7388, lng: 55.9721, timezone: "Asia/Yekaterinburg" },
  { name: "Krasnodar", country: "Rusya", lat: 45.0355, lng: 38.9753, timezone: "Europe/Moscow" },
  { name: "Voronezh", country: "Rusya", lat: 51.6720, lng: 39.1843, timezone: "Europe/Moscow" },
  { name: "Perm", country: "Rusya", lat: 58.0105, lng: 56.2502, timezone: "Asia/Yekaterinburg" },
  { name: "Volgograd", country: "Rusya", lat: 48.7080, lng: 44.5133, timezone: "Europe/Volgograd" },
  { name: "Sochi", country: "Rusya", lat: 43.6028, lng: 39.7342, timezone: "Europe/Moscow" },
  
  // Ukrayna
  { name: "Kiev", country: "Ukrayna", lat: 50.4501, lng: 30.5234, timezone: "Europe/Kiev" },
  { name: "Harkiv", country: "Ukrayna", lat: 49.9935, lng: 36.2304, timezone: "Europe/Kiev" },
  { name: "Odessa", country: "Ukrayna", lat: 46.4825, lng: 30.7233, timezone: "Europe/Kiev" },
  { name: "Dnipro", country: "Ukrayna", lat: 48.4647, lng: 35.0462, timezone: "Europe/Kiev" },
  { name: "Donetsk", country: "Ukrayna", lat: 48.0159, lng: 37.8028, timezone: "Europe/Kiev" },
  { name: "Zaporizhzhia", country: "Ukrayna", lat: 47.8388, lng: 35.1396, timezone: "Europe/Kiev" },
  { name: "Lviv", country: "Ukrayna", lat: 49.8397, lng: 24.0297, timezone: "Europe/Kiev" },
  { name: "Kryvyi Rih", country: "Ukrayna", lat: 47.9086, lng: 33.3433, timezone: "Europe/Kiev" },
  { name: "Mykolaiv", country: "Ukrayna", lat: 46.9750, lng: 31.9946, timezone: "Europe/Kiev" },
  { name: "Mariupol", country: "Ukrayna", lat: 47.0951, lng: 37.5498, timezone: "Europe/Kiev" },
  
  // Belarus
  { name: "Minsk", country: "Belarus", lat: 53.9045, lng: 27.5615, timezone: "Europe/Minsk" },
  { name: "Gomel", country: "Belarus", lat: 52.4345, lng: 30.9754, timezone: "Europe/Minsk" },
  { name: "Mogilev", country: "Belarus", lat: 53.9168, lng: 30.3449, timezone: "Europe/Minsk" },
  { name: "Vitebsk", country: "Belarus", lat: 55.1904, lng: 30.2049, timezone: "Europe/Minsk" },
  { name: "Grodno", country: "Belarus", lat: 53.6884, lng: 23.8258, timezone: "Europe/Minsk" },
  { name: "Brest", country: "Belarus", lat: 52.0976, lng: 23.7341, timezone: "Europe/Minsk" },
  
  // Moldova
  { name: "Kişinev", country: "Moldova", lat: 47.0105, lng: 28.8638, timezone: "Europe/Chisinau" },
  { name: "Tiraspol", country: "Moldova", lat: 46.8403, lng: 29.6433, timezone: "Europe/Chisinau" },
  { name: "Balti", country: "Moldova", lat: 47.7617, lng: 27.9294, timezone: "Europe/Chisinau" },
  { name: "Bender", country: "Moldova", lat: 46.8328, lng: 29.4719, timezone: "Europe/Chisinau" },
  
  // Küçük Ülkeler
  { name: "Lüksemburg", country: "Lüksemburg", lat: 49.6116, lng: 6.1319, timezone: "Europe/Luxembourg" },
  { name: "Esch-sur-Alzette", country: "Lüksemburg", lat: 49.4958, lng: 5.9806, timezone: "Europe/Luxembourg" },
  
  { name: "Valletta", country: "Malta", lat: 35.8989, lng: 14.5146, timezone: "Europe/Malta" },
  { name: "Birkirkara", country: "Malta", lat: 35.8958, lng: 14.4650, timezone: "Europe/Malta" },
  { name: "Sliema", country: "Malta", lat: 35.9122, lng: 14.5042, timezone: "Europe/Malta" },
  
  { name: "Lefkoşa", country: "Kıbrıs", lat: 35.1856, lng: 33.3823, timezone: "Asia/Nicosia" },
  { name: "Limasol", country: "Kıbrıs", lat: 34.6786, lng: 33.0413, timezone: "Asia/Nicosia" },
  { name: "Larnaka", country: "Kıbrıs", lat: 34.9229, lng: 33.6233, timezone: "Asia/Nicosia" },
  { name: "Baf", country: "Kıbrıs", lat: 34.7754, lng: 32.4245, timezone: "Asia/Nicosia" },
  { name: "Gazimağusa", country: "Kıbrıs", lat: 35.1174, lng: 33.9420, timezone: "Asia/Nicosia" },
  { name: "Girne", country: "Kıbrıs", lat: 35.3364, lng: 33.3190, timezone: "Asia/Nicosia" },
  
  { name: "Reykjavik", country: "İzlanda", lat: 64.1466, lng: -21.9426, timezone: "Atlantic/Reykjavik" },
  { name: "Kopavogur", country: "İzlanda", lat: 64.1101, lng: -21.9131, timezone: "Atlantic/Reykjavik" },
  { name: "Akureyri", country: "İzlanda", lat: 65.6885, lng: -18.1262, timezone: "Atlantic/Reykjavik" },
  
  { name: "Monako", country: "Monako", lat: 43.7384, lng: 7.4246, timezone: "Europe/Monaco" },
  { name: "Andorra la Vella", country: "Andorra", lat: 42.5063, lng: 1.5218, timezone: "Europe/Andorra" },
  { name: "San Marino", country: "San Marino", lat: 43.9424, lng: 12.4578, timezone: "Europe/San_Marino" },
  { name: "Vaduz", country: "Lihtenştayn", lat: 47.1410, lng: 9.5209, timezone: "Europe/Vaduz" },
  
  // Romanya
  { name: "Bükreş", country: "Romanya", lat: 44.4268, lng: 26.1025, timezone: "Europe/Bucharest" },
  { name: "Cluj-Napoca", country: "Romanya", lat: 46.7712, lng: 23.6236, timezone: "Europe/Bucharest" },
  { name: "Timișoara", country: "Romanya", lat: 45.7489, lng: 21.2087, timezone: "Europe/Bucharest" },
  { name: "Iași", country: "Romanya", lat: 47.1585, lng: 27.6014, timezone: "Europe/Bucharest" },
  { name: "Constanța", country: "Romanya", lat: 44.1598, lng: 28.6348, timezone: "Europe/Bucharest" },
  { name: "Craiova", country: "Romanya", lat: 44.3302, lng: 23.7949, timezone: "Europe/Bucharest" },
  { name: "Brașov", country: "Romanya", lat: 45.6427, lng: 25.5887, timezone: "Europe/Bucharest" },
  { name: "Galați", country: "Romanya", lat: 45.4353, lng: 28.0080, timezone: "Europe/Bucharest" },
  { name: "Ploiești", country: "Romanya", lat: 44.9367, lng: 26.0134, timezone: "Europe/Bucharest" },
  { name: "Oradea", country: "Romanya", lat: 47.0465, lng: 21.9189, timezone: "Europe/Bucharest" },
  { name: "Sibiu", country: "Romanya", lat: 45.7983, lng: 24.1256, timezone: "Europe/Bucharest" },
  { name: "Arad", country: "Romanya", lat: 46.1866, lng: 21.3123, timezone: "Europe/Bucharest" },
  
  // Bulgaristan
  { name: "Sofya", country: "Bulgaristan", lat: 42.6977, lng: 23.3219, timezone: "Europe/Sofia" },
  { name: "Plovdiv", country: "Bulgaristan", lat: 42.1354, lng: 24.7453, timezone: "Europe/Sofia" },
  { name: "Varna", country: "Bulgaristan", lat: 43.2141, lng: 27.9147, timezone: "Europe/Sofia" },
  { name: "Burgas", country: "Bulgaristan", lat: 42.5048, lng: 27.4626, timezone: "Europe/Sofia" },
  { name: "Ruse", country: "Bulgaristan", lat: 43.8356, lng: 25.9657, timezone: "Europe/Sofia" },
  { name: "Stara Zagora", country: "Bulgaristan", lat: 42.4258, lng: 25.6345, timezone: "Europe/Sofia" },
  { name: "Pleven", country: "Bulgaristan", lat: 43.4170, lng: 24.6067, timezone: "Europe/Sofia" },
  { name: "Sliven", country: "Bulgaristan", lat: 42.6814, lng: 26.3287, timezone: "Europe/Sofia" },
  { name: "Dobriç", country: "Bulgaristan", lat: 43.5667, lng: 27.8333, timezone: "Europe/Sofia" },
  { name: "Şumen", country: "Bulgaristan", lat: 43.2708, lng: 26.9225, timezone: "Europe/Sofia" },
  
  // Sırbistan
  { name: "Belgrad", country: "Sırbistan", lat: 44.7866, lng: 20.4489, timezone: "Europe/Belgrade" },
  { name: "Novi Sad", country: "Sırbistan", lat: 45.2671, lng: 19.8335, timezone: "Europe/Belgrade" },
  { name: "Niš", country: "Sırbistan", lat: 43.3209, lng: 21.8958, timezone: "Europe/Belgrade" },
  { name: "Kragujevac", country: "Sırbistan", lat: 44.0128, lng: 20.9114, timezone: "Europe/Belgrade" },
  { name: "Subotica", country: "Sırbistan", lat: 46.1000, lng: 19.6667, timezone: "Europe/Belgrade" },
  { name: "Zrenjanin", country: "Sırbistan", lat: 45.3833, lng: 20.3833, timezone: "Europe/Belgrade" },
  { name: "Pançevo", country: "Sırbistan", lat: 44.8708, lng: 20.6403, timezone: "Europe/Belgrade" },
  { name: "Çaçak", country: "Sırbistan", lat: 43.8914, lng: 20.3497, timezone: "Europe/Belgrade" },
  { name: "Kruşevaç", country: "Sırbistan", lat: 43.5833, lng: 21.3333, timezone: "Europe/Belgrade" },
  { name: "Leskovac", country: "Sırbistan", lat: 42.9981, lng: 21.9461, timezone: "Europe/Belgrade" },
  
  // Hırvatistan
  { name: "Zagreb", country: "Hırvatistan", lat: 45.8150, lng: 15.9819, timezone: "Europe/Zagreb" },
  { name: "Split", country: "Hırvatistan", lat: 43.5081, lng: 16.4402, timezone: "Europe/Zagreb" },
  { name: "Rijeka", country: "Hırvatistan", lat: 45.3271, lng: 14.4422, timezone: "Europe/Zagreb" },
  { name: "Osijek", country: "Hırvatistan", lat: 45.5550, lng: 18.6955, timezone: "Europe/Zagreb" },
  { name: "Zadar", country: "Hırvatistan", lat: 44.1194, lng: 15.2314, timezone: "Europe/Zagreb" },
  { name: "Pula", country: "Hırvatistan", lat: 44.8666, lng: 13.8496, timezone: "Europe/Zagreb" },
  { name: "Dubrovnik", country: "Hırvatistan", lat: 42.6507, lng: 18.0944, timezone: "Europe/Zagreb" },
  { name: "Slavonski Brod", country: "Hırvatistan", lat: 45.1603, lng: 18.0156, timezone: "Europe/Zagreb" },
  { name: "Karlovac", country: "Hırvatistan", lat: 45.4929, lng: 15.5553, timezone: "Europe/Zagreb" },
  { name: "Varaždin", country: "Hırvatistan", lat: 46.3057, lng: 16.3366, timezone: "Europe/Zagreb" },
  
  // Slovenya
  { name: "Ljubljana", country: "Slovenya", lat: 46.0569, lng: 14.5058, timezone: "Europe/Ljubljana" },
  { name: "Maribor", country: "Slovenya", lat: 46.5547, lng: 15.6459, timezone: "Europe/Ljubljana" },
  { name: "Celje", country: "Slovenya", lat: 46.2361, lng: 15.2677, timezone: "Europe/Ljubljana" },
  { name: "Kranj", country: "Slovenya", lat: 46.2389, lng: 14.3556, timezone: "Europe/Ljubljana" },
  { name: "Koper", country: "Slovenya", lat: 45.5469, lng: 13.7294, timezone: "Europe/Ljubljana" },
  { name: "Velenje", country: "Slovenya", lat: 46.3594, lng: 15.1097, timezone: "Europe/Ljubljana" },
  { name: "Novo Mesto", country: "Slovenya", lat: 45.8042, lng: 15.1689, timezone: "Europe/Ljubljana" },
  
  // Bosna Hersek
  { name: "Saraybosna", country: "Bosna Hersek", lat: 43.8563, lng: 18.4131, timezone: "Europe/Sarajevo" },
  { name: "Banja Luka", country: "Bosna Hersek", lat: 44.7722, lng: 17.1910, timezone: "Europe/Sarajevo" },
  { name: "Tuzla", country: "Bosna Hersek", lat: 44.5384, lng: 18.6763, timezone: "Europe/Sarajevo" },
  { name: "Zenica", country: "Bosna Hersek", lat: 44.2017, lng: 17.9078, timezone: "Europe/Sarajevo" },
  { name: "Mostar", country: "Bosna Hersek", lat: 43.3438, lng: 17.8078, timezone: "Europe/Sarajevo" },
  { name: "Bihaç", country: "Bosna Hersek", lat: 44.8169, lng: 15.8697, timezone: "Europe/Sarajevo" },
  { name: "Brçko", country: "Bosna Hersek", lat: 44.8725, lng: 18.8097, timezone: "Europe/Sarajevo" },
  { name: "Bijeljina", country: "Bosna Hersek", lat: 44.7589, lng: 19.2144, timezone: "Europe/Sarajevo" },
  { name: "Prijedor", country: "Bosna Hersek", lat: 44.9797, lng: 16.7136, timezone: "Europe/Sarajevo" },
  { name: "Trebinje", country: "Bosna Hersek", lat: 42.7117, lng: 18.3436, timezone: "Europe/Sarajevo" },
  
  // Arnavutluk
  { name: "Tiran", country: "Arnavutluk", lat: 41.3275, lng: 19.8187, timezone: "Europe/Tirane" },
  { name: "Dıraç", country: "Arnavutluk", lat: 41.3246, lng: 19.4565, timezone: "Europe/Tirane" },
  { name: "Vlora", country: "Arnavutluk", lat: 40.4667, lng: 19.4833, timezone: "Europe/Tirane" },
  { name: "Elbasan", country: "Arnavutluk", lat: 41.1125, lng: 20.0822, timezone: "Europe/Tirane" },
  { name: "Shkodra", country: "Arnavutluk", lat: 42.0683, lng: 19.5126, timezone: "Europe/Tirane" },
  { name: "Fier", country: "Arnavutluk", lat: 40.7239, lng: 19.5564, timezone: "Europe/Tirane" },
  { name: "Korça", country: "Arnavutluk", lat: 40.6186, lng: 20.7808, timezone: "Europe/Tirane" },
  { name: "Berat", country: "Arnavutluk", lat: 40.7058, lng: 19.9522, timezone: "Europe/Tirane" },
  { name: "Lushnje", country: "Arnavutluk", lat: 40.9419, lng: 19.7050, timezone: "Europe/Tirane" },
  { name: "Pogradec", country: "Arnavutluk", lat: 40.9025, lng: 20.6528, timezone: "Europe/Tirane" },
  
  // Kuzey Makedonya
  { name: "Üsküp", country: "Kuzey Makedonya", lat: 41.9981, lng: 21.4254, timezone: "Europe/Skopje" },
  { name: "Bitola", country: "Kuzey Makedonya", lat: 41.0297, lng: 21.3292, timezone: "Europe/Skopje" },
  { name: "Kumanovo", country: "Kuzey Makedonya", lat: 42.1322, lng: 21.7144, timezone: "Europe/Skopje" },
  { name: "Prilep", country: "Kuzey Makedonya", lat: 41.3464, lng: 21.5528, timezone: "Europe/Skopje" },
  { name: "Tetova", country: "Kuzey Makedonya", lat: 42.0069, lng: 20.9714, timezone: "Europe/Skopje" },
  { name: "Ohrid", country: "Kuzey Makedonya", lat: 41.1231, lng: 20.8016, timezone: "Europe/Skopje" },
  { name: "Veles", country: "Kuzey Makedonya", lat: 41.7153, lng: 21.7756, timezone: "Europe/Skopje" },
  { name: "Gostivar", country: "Kuzey Makedonya", lat: 41.7958, lng: 20.9083, timezone: "Europe/Skopje" },
  { name: "Ştip", country: "Kuzey Makedonya", lat: 41.7358, lng: 22.1914, timezone: "Europe/Skopje" },
  { name: "Strumica", country: "Kuzey Makedonya", lat: 41.4378, lng: 22.6427, timezone: "Europe/Skopje" },
  
  // Kosova
  { name: "Priştine", country: "Kosova", lat: 42.6629, lng: 21.1655, timezone: "Europe/Belgrade" },
  { name: "Prizren", country: "Kosova", lat: 42.2139, lng: 20.7397, timezone: "Europe/Belgrade" },
  { name: "Ferizaj", country: "Kosova", lat: 42.3706, lng: 21.1553, timezone: "Europe/Belgrade" },
  { name: "Peja", country: "Kosova", lat: 42.6592, lng: 20.2886, timezone: "Europe/Belgrade" },
  { name: "Gjakova", country: "Kosova", lat: 42.3803, lng: 20.4308, timezone: "Europe/Belgrade" },
  { name: "Mitroviça", country: "Kosova", lat: 42.8914, lng: 20.8660, timezone: "Europe/Belgrade" },
  { name: "Gjilan", country: "Kosova", lat: 42.4636, lng: 21.4694, timezone: "Europe/Belgrade" },
  { name: "Podujeva", country: "Kosova", lat: 42.9108, lng: 21.1928, timezone: "Europe/Belgrade" },
  
  // Karadağ
  { name: "Podgorica", country: "Karadağ", lat: 42.4304, lng: 19.2594, timezone: "Europe/Podgorica" },
  { name: "Nikşiç", country: "Karadağ", lat: 42.7731, lng: 18.9444, timezone: "Europe/Podgorica" },
  { name: "Pljevlja", country: "Karadağ", lat: 43.3572, lng: 19.3592, timezone: "Europe/Podgorica" },
  { name: "Bijelo Polje", country: "Karadağ", lat: 43.0386, lng: 19.7481, timezone: "Europe/Podgorica" },
  { name: "Herceg Novi", country: "Karadağ", lat: 42.4531, lng: 18.5375, timezone: "Europe/Podgorica" },
  { name: "Berane", country: "Karadağ", lat: 42.8439, lng: 19.8628, timezone: "Europe/Podgorica" },
  { name: "Budva", country: "Karadağ", lat: 42.2911, lng: 18.8403, timezone: "Europe/Podgorica" },
  { name: "Cetinje", country: "Karadağ", lat: 42.3931, lng: 18.9236, timezone: "Europe/Podgorica" },
  { name: "Bar", country: "Karadağ", lat: 42.0936, lng: 19.1003, timezone: "Europe/Podgorica" },
  { name: "Kotor", country: "Karadağ", lat: 42.4247, lng: 18.7712, timezone: "Europe/Podgorica" },
  
  // Yunanistan (daha fazla şehir)
  { name: "Atina", country: "Yunanistan", lat: 37.9838, lng: 23.7275, timezone: "Europe/Athens" },
  { name: "Selanik", country: "Yunanistan", lat: 40.6401, lng: 22.9444, timezone: "Europe/Athens" },
  { name: "Patras", country: "Yunanistan", lat: 38.2466, lng: 21.7346, timezone: "Europe/Athens" },
  { name: "Pire", country: "Yunanistan", lat: 37.9475, lng: 23.6469, timezone: "Europe/Athens" },
  { name: "Larissa", country: "Yunanistan", lat: 39.6390, lng: 22.4191, timezone: "Europe/Athens" },
  { name: "Iraklio", country: "Yunanistan", lat: 35.3387, lng: 25.1442, timezone: "Europe/Athens" },
  { name: "Volos", country: "Yunanistan", lat: 39.3666, lng: 22.9507, timezone: "Europe/Athens" },
  { name: "Kavala", country: "Yunanistan", lat: 40.9397, lng: 24.4128, timezone: "Europe/Athens" },
  { name: "Rodos", country: "Yunanistan", lat: 36.4349, lng: 28.2176, timezone: "Europe/Athens" },
  { name: "Yanya", country: "Yunanistan", lat: 39.6650, lng: 20.8537, timezone: "Europe/Athens" },
  { name: "Hanya", country: "Yunanistan", lat: 35.5138, lng: 24.0180, timezone: "Europe/Athens" },
  { name: "Komotini", country: "Yunanistan", lat: 41.1172, lng: 25.4033, timezone: "Europe/Athens" },
  
  // ===================== KUZEY AMERİKA =====================
  
  // ABD - Kuzeydoğu
  { name: "New York", country: "ABD", lat: 40.7128, lng: -74.0060, timezone: "America/New_York" },
  { name: "Philadelphia", country: "ABD", lat: 39.9526, lng: -75.1652, timezone: "America/New_York" },
  { name: "Boston", country: "ABD", lat: 42.3601, lng: -71.0589, timezone: "America/New_York" },
  { name: "Pittsburgh", country: "ABD", lat: 40.4406, lng: -79.9959, timezone: "America/New_York" },
  { name: "Baltimore", country: "ABD", lat: 39.2904, lng: -76.6122, timezone: "America/New_York" },
  { name: "Newark", country: "ABD", lat: 40.7357, lng: -74.1724, timezone: "America/New_York" },
  { name: "Buffalo", country: "ABD", lat: 42.8864, lng: -78.8784, timezone: "America/New_York" },
  { name: "Rochester", country: "ABD", lat: 43.1566, lng: -77.6088, timezone: "America/New_York" },
  { name: "Hartford", country: "ABD", lat: 41.7658, lng: -72.6734, timezone: "America/New_York" },
  { name: "Providence", country: "ABD", lat: 41.8240, lng: -71.4128, timezone: "America/New_York" },
  
  // ABD - Güneydoğu
  { name: "Washington D.C.", country: "ABD", lat: 38.9072, lng: -77.0369, timezone: "America/New_York" },
  { name: "Miami", country: "ABD", lat: 25.7617, lng: -80.1918, timezone: "America/New_York" },
  { name: "Atlanta", country: "ABD", lat: 33.7490, lng: -84.3880, timezone: "America/New_York" },
  { name: "Charlotte", country: "ABD", lat: 35.2271, lng: -80.8431, timezone: "America/New_York" },
  { name: "Tampa", country: "ABD", lat: 27.9506, lng: -82.4572, timezone: "America/New_York" },
  { name: "Orlando", country: "ABD", lat: 28.5383, lng: -81.3792, timezone: "America/New_York" },
  { name: "Jacksonville", country: "ABD", lat: 30.3322, lng: -81.6557, timezone: "America/New_York" },
  { name: "Nashville", country: "ABD", lat: 36.1627, lng: -86.7816, timezone: "America/Chicago" },
  { name: "Memphis", country: "ABD", lat: 35.1495, lng: -90.0490, timezone: "America/Chicago" },
  { name: "Louisville", country: "ABD", lat: 38.2527, lng: -85.7585, timezone: "America/Kentucky/Louisville" },
  { name: "New Orleans", country: "ABD", lat: 29.9511, lng: -90.0715, timezone: "America/Chicago" },
  { name: "Richmond", country: "ABD", lat: 37.5407, lng: -77.4360, timezone: "America/New_York" },
  { name: "Raleigh", country: "ABD", lat: 35.7796, lng: -78.6382, timezone: "America/New_York" },
  { name: "Charleston", country: "ABD", lat: 32.7765, lng: -79.9311, timezone: "America/New_York" },
  
  // ABD - Ortabatı
  { name: "Chicago", country: "ABD", lat: 41.8781, lng: -87.6298, timezone: "America/Chicago" },
  { name: "Detroit", country: "ABD", lat: 42.3314, lng: -83.0458, timezone: "America/Detroit" },
  { name: "Minneapolis", country: "ABD", lat: 44.9778, lng: -93.2650, timezone: "America/Chicago" },
  { name: "Milwaukee", country: "ABD", lat: 43.0389, lng: -87.9065, timezone: "America/Chicago" },
  { name: "Cleveland", country: "ABD", lat: 41.4993, lng: -81.6944, timezone: "America/New_York" },
  { name: "Columbus", country: "ABD", lat: 39.9612, lng: -82.9988, timezone: "America/New_York" },
  { name: "Indianapolis", country: "ABD", lat: 39.7684, lng: -86.1581, timezone: "America/Indiana/Indianapolis" },
  { name: "Kansas City", country: "ABD", lat: 39.0997, lng: -94.5786, timezone: "America/Chicago" },
  { name: "St. Louis", country: "ABD", lat: 38.6270, lng: -90.1994, timezone: "America/Chicago" },
  { name: "Cincinnati", country: "ABD", lat: 39.1031, lng: -84.5120, timezone: "America/New_York" },
  { name: "Omaha", country: "ABD", lat: 41.2565, lng: -95.9345, timezone: "America/Chicago" },
  { name: "Des Moines", country: "ABD", lat: 41.5868, lng: -93.6250, timezone: "America/Chicago" },
  
  // ABD - Güneybatı
  { name: "Houston", country: "ABD", lat: 29.7604, lng: -95.3698, timezone: "America/Chicago" },
  { name: "Dallas", country: "ABD", lat: 32.7767, lng: -96.7970, timezone: "America/Chicago" },
  { name: "San Antonio", country: "ABD", lat: 29.4241, lng: -98.4936, timezone: "America/Chicago" },
  { name: "Austin", country: "ABD", lat: 30.2672, lng: -97.7431, timezone: "America/Chicago" },
  { name: "Phoenix", country: "ABD", lat: 33.4484, lng: -112.0740, timezone: "America/Phoenix" },
  { name: "Las Vegas", country: "ABD", lat: 36.1699, lng: -115.1398, timezone: "America/Los_Angeles" },
  { name: "Tucson", country: "ABD", lat: 32.2226, lng: -110.9747, timezone: "America/Phoenix" },
  { name: "Albuquerque", country: "ABD", lat: 35.0844, lng: -106.6504, timezone: "America/Denver" },
  { name: "El Paso", country: "ABD", lat: 31.7619, lng: -106.4850, timezone: "America/Denver" },
  { name: "Fort Worth", country: "ABD", lat: 32.7555, lng: -97.3308, timezone: "America/Chicago" },
  { name: "Oklahoma City", country: "ABD", lat: 35.4676, lng: -97.5164, timezone: "America/Chicago" },
  { name: "Tulsa", country: "ABD", lat: 36.1540, lng: -95.9928, timezone: "America/Chicago" },
  
  // ABD - Batı Kıyısı
  { name: "Los Angeles", country: "ABD", lat: 34.0522, lng: -118.2437, timezone: "America/Los_Angeles" },
  { name: "San Francisco", country: "ABD", lat: 37.7749, lng: -122.4194, timezone: "America/Los_Angeles" },
  { name: "San Diego", country: "ABD", lat: 32.7157, lng: -117.1611, timezone: "America/Los_Angeles" },
  { name: "San Jose", country: "ABD", lat: 37.3382, lng: -121.8863, timezone: "America/Los_Angeles" },
  { name: "Seattle", country: "ABD", lat: 47.6062, lng: -122.3321, timezone: "America/Los_Angeles" },
  { name: "Portland", country: "ABD", lat: 45.5152, lng: -122.6784, timezone: "America/Los_Angeles" },
  { name: "Sacramento", country: "ABD", lat: 38.5816, lng: -121.4944, timezone: "America/Los_Angeles" },
  { name: "Oakland", country: "ABD", lat: 37.8044, lng: -122.2712, timezone: "America/Los_Angeles" },
  { name: "Long Beach", country: "ABD", lat: 33.7701, lng: -118.1937, timezone: "America/Los_Angeles" },
  { name: "Fresno", country: "ABD", lat: 36.7378, lng: -119.7871, timezone: "America/Los_Angeles" },
  
  // ABD - Dağ Bölgesi
  { name: "Denver", country: "ABD", lat: 39.7392, lng: -104.9903, timezone: "America/Denver" },
  { name: "Salt Lake City", country: "ABD", lat: 40.7608, lng: -111.8910, timezone: "America/Denver" },
  { name: "Colorado Springs", country: "ABD", lat: 38.8339, lng: -104.8214, timezone: "America/Denver" },
  { name: "Boise", country: "ABD", lat: 43.6150, lng: -116.2023, timezone: "America/Boise" },
  
  // ABD - Alaska ve Hawaii
  { name: "Anchorage", country: "ABD", lat: 61.2181, lng: -149.9003, timezone: "America/Anchorage" },
  { name: "Fairbanks", country: "ABD", lat: 64.8378, lng: -147.7164, timezone: "America/Anchorage" },
  { name: "Honolulu", country: "ABD", lat: 21.3069, lng: -157.8583, timezone: "Pacific/Honolulu" },
  
  // Kanada - Ontario
  { name: "Toronto", country: "Kanada", lat: 43.6532, lng: -79.3832, timezone: "America/Toronto" },
  { name: "Ottawa", country: "Kanada", lat: 45.4215, lng: -75.6972, timezone: "America/Toronto" },
  { name: "Mississauga", country: "Kanada", lat: 43.5890, lng: -79.6441, timezone: "America/Toronto" },
  { name: "Hamilton", country: "Kanada", lat: 43.2557, lng: -79.8711, timezone: "America/Toronto" },
  { name: "Brampton", country: "Kanada", lat: 43.7315, lng: -79.7624, timezone: "America/Toronto" },
  { name: "London", country: "Kanada", lat: 42.9849, lng: -81.2453, timezone: "America/Toronto" },
  { name: "Windsor", country: "Kanada", lat: 42.3149, lng: -83.0364, timezone: "America/Toronto" },
  { name: "Kitchener", country: "Kanada", lat: 43.4516, lng: -80.4925, timezone: "America/Toronto" },
  
  // Kanada - Quebec
  { name: "Montreal", country: "Kanada", lat: 45.5017, lng: -73.5673, timezone: "America/Montreal" },
  { name: "Quebec City", country: "Kanada", lat: 46.8139, lng: -71.2080, timezone: "America/Montreal" },
  { name: "Laval", country: "Kanada", lat: 45.6066, lng: -73.7124, timezone: "America/Montreal" },
  { name: "Gatineau", country: "Kanada", lat: 45.4765, lng: -75.7013, timezone: "America/Montreal" },
  { name: "Sherbrooke", country: "Kanada", lat: 45.4042, lng: -71.8929, timezone: "America/Montreal" },
  
  // Kanada - Batı
  { name: "Vancouver", country: "Kanada", lat: 49.2827, lng: -123.1207, timezone: "America/Vancouver" },
  { name: "Calgary", country: "Kanada", lat: 51.0447, lng: -114.0719, timezone: "America/Edmonton" },
  { name: "Edmonton", country: "Kanada", lat: 53.5461, lng: -113.4938, timezone: "America/Edmonton" },
  { name: "Victoria", country: "Kanada", lat: 48.4284, lng: -123.3656, timezone: "America/Vancouver" },
  { name: "Surrey", country: "Kanada", lat: 49.1913, lng: -122.8490, timezone: "America/Vancouver" },
  { name: "Burnaby", country: "Kanada", lat: 49.2488, lng: -122.9805, timezone: "America/Vancouver" },
  { name: "Saskatoon", country: "Kanada", lat: 52.1332, lng: -106.6700, timezone: "America/Regina" },
  { name: "Regina", country: "Kanada", lat: 50.4452, lng: -104.6189, timezone: "America/Regina" },
  { name: "Winnipeg", country: "Kanada", lat: 49.8951, lng: -97.1384, timezone: "America/Winnipeg" },
  
  // Kanada - Atlantik
  { name: "Halifax", country: "Kanada", lat: 44.6488, lng: -63.5752, timezone: "America/Halifax" },
  { name: "St. John's", country: "Kanada", lat: 47.5615, lng: -52.7126, timezone: "America/St_Johns" },
  { name: "Moncton", country: "Kanada", lat: 46.0878, lng: -64.7782, timezone: "America/Moncton" },
  { name: "Fredericton", country: "Kanada", lat: 45.9636, lng: -66.6431, timezone: "America/Moncton" },
  { name: "Charlottetown", country: "Kanada", lat: 46.2382, lng: -63.1311, timezone: "America/Halifax" },
  
  // Meksika
  { name: "Meksiko City", country: "Meksika", lat: 19.4326, lng: -99.1332, timezone: "America/Mexico_City" },
  { name: "Guadalajara", country: "Meksika", lat: 20.6597, lng: -103.3496, timezone: "America/Mexico_City" },
  { name: "Monterrey", country: "Meksika", lat: 25.6866, lng: -100.3161, timezone: "America/Monterrey" },
  { name: "Puebla", country: "Meksika", lat: 19.0414, lng: -98.2063, timezone: "America/Mexico_City" },
  { name: "Tijuana", country: "Meksika", lat: 32.5149, lng: -117.0382, timezone: "America/Tijuana" },
  { name: "León", country: "Meksika", lat: 21.1250, lng: -101.6860, timezone: "America/Mexico_City" },
  { name: "Juárez", country: "Meksika", lat: 31.6904, lng: -106.4245, timezone: "America/Ojinaga" },
  { name: "Zapopan", country: "Meksika", lat: 20.7167, lng: -103.4000, timezone: "America/Mexico_City" },
  { name: "Mérida", country: "Meksika", lat: 20.9674, lng: -89.5926, timezone: "America/Merida" },
  { name: "Cancún", country: "Meksika", lat: 21.1619, lng: -86.8515, timezone: "America/Cancun" },
  { name: "Querétaro", country: "Meksika", lat: 20.5888, lng: -100.3899, timezone: "America/Mexico_City" },
  { name: "San Luis Potosí", country: "Meksika", lat: 22.1565, lng: -100.9855, timezone: "America/Mexico_City" },
  { name: "Aguascalientes", country: "Meksika", lat: 21.8818, lng: -102.2916, timezone: "America/Mexico_City" },
  { name: "Hermosillo", country: "Meksika", lat: 29.0729, lng: -110.9559, timezone: "America/Hermosillo" },
  { name: "Chihuahua", country: "Meksika", lat: 28.6353, lng: -106.0889, timezone: "America/Chihuahua" },
  { name: "Saltillo", country: "Meksika", lat: 25.4232, lng: -101.0053, timezone: "America/Monterrey" },
  { name: "Veracruz", country: "Meksika", lat: 19.1738, lng: -96.1342, timezone: "America/Mexico_City" },
  { name: "Acapulco", country: "Meksika", lat: 16.8531, lng: -99.8237, timezone: "America/Mexico_City" },
  { name: "Oaxaca", country: "Meksika", lat: 17.0732, lng: -96.7266, timezone: "America/Mexico_City" },
  { name: "Morelia", country: "Meksika", lat: 19.7060, lng: -101.1950, timezone: "America/Mexico_City" },
  
  // Orta Amerika
  { name: "Guatemala City", country: "Guatemala", lat: 14.6349, lng: -90.5069, timezone: "America/Guatemala" },
  { name: "Antigua", country: "Guatemala", lat: 14.5586, lng: -90.7295, timezone: "America/Guatemala" },
  { name: "Quetzaltenango", country: "Guatemala", lat: 14.8347, lng: -91.5181, timezone: "America/Guatemala" },
  
  { name: "San Salvador", country: "El Salvador", lat: 13.6929, lng: -89.2182, timezone: "America/El_Salvador" },
  { name: "Santa Ana", country: "El Salvador", lat: 13.9942, lng: -89.5597, timezone: "America/El_Salvador" },
  { name: "San Miguel", country: "El Salvador", lat: 13.4833, lng: -88.1833, timezone: "America/El_Salvador" },
  
  { name: "Tegucigalpa", country: "Honduras", lat: 14.0723, lng: -87.1921, timezone: "America/Tegucigalpa" },
  { name: "San Pedro Sula", country: "Honduras", lat: 15.5000, lng: -88.0333, timezone: "America/Tegucigalpa" },
  { name: "La Ceiba", country: "Honduras", lat: 15.7631, lng: -86.7822, timezone: "America/Tegucigalpa" },
  
  { name: "Managua", country: "Nikaragua", lat: 12.1150, lng: -86.2362, timezone: "America/Managua" },
  { name: "León", country: "Nikaragua", lat: 12.4379, lng: -86.8780, timezone: "America/Managua" },
  { name: "Granada", country: "Nikaragua", lat: 11.9344, lng: -85.9560, timezone: "America/Managua" },
  
  { name: "San José", country: "Kosta Rika", lat: 9.9281, lng: -84.0907, timezone: "America/Costa_Rica" },
  { name: "Alajuela", country: "Kosta Rika", lat: 10.0159, lng: -84.2117, timezone: "America/Costa_Rica" },
  { name: "Cartago", country: "Kosta Rika", lat: 9.8644, lng: -83.9194, timezone: "America/Costa_Rica" },
  { name: "Liberia", country: "Kosta Rika", lat: 10.6346, lng: -85.4407, timezone: "America/Costa_Rica" },
  
  { name: "Panama City", country: "Panama", lat: 8.9824, lng: -79.5199, timezone: "America/Panama" },
  { name: "Colón", country: "Panama", lat: 9.3592, lng: -79.9014, timezone: "America/Panama" },
  { name: "David", country: "Panama", lat: 8.4271, lng: -82.4310, timezone: "America/Panama" },
  
  { name: "Belmopan", country: "Belize", lat: 17.2510, lng: -88.7590, timezone: "America/Belize" },
  { name: "Belize City", country: "Belize", lat: 17.4986, lng: -88.1886, timezone: "America/Belize" },
  { name: "San Ignacio", country: "Belize", lat: 17.1561, lng: -89.0714, timezone: "America/Belize" },
  
  // Karayipler
  { name: "Havana", country: "Küba", lat: 23.1136, lng: -82.3666, timezone: "America/Havana" },
  { name: "Santiago de Cuba", country: "Küba", lat: 20.0247, lng: -75.8219, timezone: "America/Havana" },
  { name: "Camagüey", country: "Küba", lat: 21.3809, lng: -77.9170, timezone: "America/Havana" },
  { name: "Holguín", country: "Küba", lat: 20.7876, lng: -76.2631, timezone: "America/Havana" },
  { name: "Varadero", country: "Küba", lat: 23.1394, lng: -81.2861, timezone: "America/Havana" },
  
  { name: "Santo Domingo", country: "Dominik Cumhuriyeti", lat: 18.4861, lng: -69.9312, timezone: "America/Santo_Domingo" },
  { name: "Santiago de los Caballeros", country: "Dominik Cumhuriyeti", lat: 19.4500, lng: -70.7000, timezone: "America/Santo_Domingo" },
  { name: "Punta Cana", country: "Dominik Cumhuriyeti", lat: 18.5601, lng: -68.3725, timezone: "America/Santo_Domingo" },
  { name: "Puerto Plata", country: "Dominik Cumhuriyeti", lat: 19.7934, lng: -70.6884, timezone: "America/Santo_Domingo" },
  
  { name: "Port-au-Prince", country: "Haiti", lat: 18.5944, lng: -72.3074, timezone: "America/Port-au-Prince" },
  { name: "Cap-Haïtien", country: "Haiti", lat: 19.7578, lng: -72.2044, timezone: "America/Port-au-Prince" },
  
  { name: "Kingston", country: "Jamaika", lat: 17.9714, lng: -76.7936, timezone: "America/Jamaica" },
  { name: "Montego Bay", country: "Jamaika", lat: 18.4762, lng: -77.8939, timezone: "America/Jamaica" },
  { name: "Ocho Rios", country: "Jamaika", lat: 18.4074, lng: -77.1025, timezone: "America/Jamaica" },
  
  { name: "San Juan", country: "Porto Riko", lat: 18.4655, lng: -66.1057, timezone: "America/Puerto_Rico" },
  { name: "Ponce", country: "Porto Riko", lat: 18.0111, lng: -66.6141, timezone: "America/Puerto_Rico" },
  { name: "Mayagüez", country: "Porto Riko", lat: 18.2013, lng: -67.1397, timezone: "America/Puerto_Rico" },
  
  { name: "Nassau", country: "Bahamalar", lat: 25.0343, lng: -77.3963, timezone: "America/Nassau" },
  { name: "Freeport", country: "Bahamalar", lat: 26.5285, lng: -78.6967, timezone: "America/Nassau" },
  
  { name: "Bridgetown", country: "Barbados", lat: 13.1132, lng: -59.5988, timezone: "America/Barbados" },
  
  { name: "Port of Spain", country: "Trinidad ve Tobago", lat: 10.6596, lng: -61.5086, timezone: "America/Port_of_Spain" },
  { name: "San Fernando", country: "Trinidad ve Tobago", lat: 10.2803, lng: -61.4592, timezone: "America/Port_of_Spain" },
  
  { name: "Willemstad", country: "Curaçao", lat: 12.1696, lng: -68.9900, timezone: "America/Curacao" },
  
  { name: "Oranjestad", country: "Aruba", lat: 12.5092, lng: -70.0086, timezone: "America/Aruba" },
  
  { name: "Castries", country: "Saint Lucia", lat: 14.0101, lng: -60.9875, timezone: "America/St_Lucia" },
  
  { name: "St. George's", country: "Grenada", lat: 12.0561, lng: -61.7486, timezone: "America/Grenada" },
  
  { name: "Roseau", country: "Dominika", lat: 15.3017, lng: -61.3881, timezone: "America/Dominica" },
  
  { name: "St. John's", country: "Antigua ve Barbuda", lat: 17.1175, lng: -61.8456, timezone: "America/Antigua" },
  
  { name: "Basseterre", country: "Saint Kitts ve Nevis", lat: 17.2948, lng: -62.7261, timezone: "America/St_Kitts" },
  
  { name: "Kingstown", country: "Saint Vincent ve Grenadinler", lat: 13.1587, lng: -61.2248, timezone: "America/St_Vincent" },
  
  // ===================== GÜNEY AMERİKA =====================
  
  // Brezilya
  { name: "São Paulo", country: "Brezilya", lat: -23.5505, lng: -46.6333, timezone: "America/Sao_Paulo" },
  { name: "Rio de Janeiro", country: "Brezilya", lat: -22.9068, lng: -43.1729, timezone: "America/Sao_Paulo" },
  { name: "Brasília", country: "Brezilya", lat: -15.7975, lng: -47.8919, timezone: "America/Sao_Paulo" },
  { name: "Salvador", country: "Brezilya", lat: -12.9714, lng: -38.5014, timezone: "America/Bahia" },
  { name: "Fortaleza", country: "Brezilya", lat: -3.7172, lng: -38.5433, timezone: "America/Fortaleza" },
  { name: "Belo Horizonte", country: "Brezilya", lat: -19.9191, lng: -43.9386, timezone: "America/Sao_Paulo" },
  { name: "Manaus", country: "Brezilya", lat: -3.1190, lng: -60.0217, timezone: "America/Manaus" },
  { name: "Curitiba", country: "Brezilya", lat: -25.4290, lng: -49.2671, timezone: "America/Sao_Paulo" },
  { name: "Recife", country: "Brezilya", lat: -8.0476, lng: -34.8770, timezone: "America/Recife" },
  { name: "Porto Alegre", country: "Brezilya", lat: -30.0346, lng: -51.2177, timezone: "America/Sao_Paulo" },
  { name: "Belém", country: "Brezilya", lat: -1.4558, lng: -48.4902, timezone: "America/Belem" },
  { name: "Goiânia", country: "Brezilya", lat: -16.6869, lng: -49.2648, timezone: "America/Sao_Paulo" },
  { name: "Guarulhos", country: "Brezilya", lat: -23.4543, lng: -46.5337, timezone: "America/Sao_Paulo" },
  { name: "Campinas", country: "Brezilya", lat: -22.9099, lng: -47.0626, timezone: "America/Sao_Paulo" },
  { name: "Florianópolis", country: "Brezilya", lat: -27.5954, lng: -48.5480, timezone: "America/Sao_Paulo" },
  { name: "Natal", country: "Brezilya", lat: -5.7945, lng: -35.2110, timezone: "America/Fortaleza" },
  
  // Arjantin
  { name: "Buenos Aires", country: "Arjantin", lat: -34.6037, lng: -58.3816, timezone: "America/Argentina/Buenos_Aires" },
  { name: "Córdoba", country: "Arjantin", lat: -31.4201, lng: -64.1888, timezone: "America/Argentina/Cordoba" },
  { name: "Rosario", country: "Arjantin", lat: -32.9468, lng: -60.6393, timezone: "America/Argentina/Buenos_Aires" },
  { name: "Mendoza", country: "Arjantin", lat: -32.8908, lng: -68.8272, timezone: "America/Argentina/Mendoza" },
  { name: "San Miguel de Tucumán", country: "Arjantin", lat: -26.8083, lng: -65.2176, timezone: "America/Argentina/Tucuman" },
  { name: "La Plata", country: "Arjantin", lat: -34.9205, lng: -57.9536, timezone: "America/Argentina/Buenos_Aires" },
  { name: "Mar del Plata", country: "Arjantin", lat: -38.0055, lng: -57.5426, timezone: "America/Argentina/Buenos_Aires" },
  { name: "Salta", country: "Arjantin", lat: -24.7821, lng: -65.4232, timezone: "America/Argentina/Salta" },
  { name: "Santa Fe", country: "Arjantin", lat: -31.6333, lng: -60.7000, timezone: "America/Argentina/Buenos_Aires" },
  { name: "San Juan", country: "Arjantin", lat: -31.5375, lng: -68.5364, timezone: "America/Argentina/San_Juan" },
  { name: "Ushuaia", country: "Arjantin", lat: -54.8019, lng: -68.3030, timezone: "America/Argentina/Ushuaia" },
  { name: "Bariloche", country: "Arjantin", lat: -41.1335, lng: -71.3103, timezone: "America/Argentina/Buenos_Aires" },
  
  // Kolombiya
  { name: "Bogota", country: "Kolombiya", lat: 4.7110, lng: -74.0721, timezone: "America/Bogota" },
  { name: "Medellín", country: "Kolombiya", lat: 6.2442, lng: -75.5812, timezone: "America/Bogota" },
  { name: "Cali", country: "Kolombiya", lat: 3.4516, lng: -76.5320, timezone: "America/Bogota" },
  { name: "Barranquilla", country: "Kolombiya", lat: 10.9639, lng: -74.7964, timezone: "America/Bogota" },
  { name: "Cartagena", country: "Kolombiya", lat: 10.3910, lng: -75.4794, timezone: "America/Bogota" },
  { name: "Cúcuta", country: "Kolombiya", lat: 7.8891, lng: -72.4967, timezone: "America/Bogota" },
  { name: "Bucaramanga", country: "Kolombiya", lat: 7.1254, lng: -73.1198, timezone: "America/Bogota" },
  { name: "Pereira", country: "Kolombiya", lat: 4.8087, lng: -75.6906, timezone: "America/Bogota" },
  { name: "Santa Marta", country: "Kolombiya", lat: 11.2408, lng: -74.1990, timezone: "America/Bogota" },
  { name: "Manizales", country: "Kolombiya", lat: 5.0703, lng: -75.5138, timezone: "America/Bogota" },
  
  // Peru
  { name: "Lima", country: "Peru", lat: -12.0464, lng: -77.0428, timezone: "America/Lima" },
  { name: "Arequipa", country: "Peru", lat: -16.4090, lng: -71.5375, timezone: "America/Lima" },
  { name: "Trujillo", country: "Peru", lat: -8.1116, lng: -79.0288, timezone: "America/Lima" },
  { name: "Chiclayo", country: "Peru", lat: -6.7714, lng: -79.8409, timezone: "America/Lima" },
  { name: "Cusco", country: "Peru", lat: -13.5320, lng: -71.9675, timezone: "America/Lima" },
  { name: "Piura", country: "Peru", lat: -5.1945, lng: -80.6328, timezone: "America/Lima" },
  { name: "Iquitos", country: "Peru", lat: -3.7491, lng: -73.2538, timezone: "America/Lima" },
  { name: "Huancayo", country: "Peru", lat: -12.0651, lng: -75.2049, timezone: "America/Lima" },
  { name: "Puno", country: "Peru", lat: -15.8402, lng: -70.0219, timezone: "America/Lima" },
  { name: "Tacna", country: "Peru", lat: -18.0146, lng: -70.2536, timezone: "America/Lima" },
  
  // Şili
  { name: "Santiago", country: "Şili", lat: -33.4489, lng: -70.6693, timezone: "America/Santiago" },
  { name: "Valparaíso", country: "Şili", lat: -33.0472, lng: -71.6127, timezone: "America/Santiago" },
  { name: "Concepción", country: "Şili", lat: -36.8201, lng: -73.0444, timezone: "America/Santiago" },
  { name: "Antofagasta", country: "Şili", lat: -23.6509, lng: -70.3975, timezone: "America/Santiago" },
  { name: "Viña del Mar", country: "Şili", lat: -33.0245, lng: -71.5518, timezone: "America/Santiago" },
  { name: "Temuco", country: "Şili", lat: -38.7359, lng: -72.5904, timezone: "America/Santiago" },
  { name: "Puerto Montt", country: "Şili", lat: -41.4693, lng: -72.9424, timezone: "America/Santiago" },
  { name: "Iquique", country: "Şili", lat: -20.2141, lng: -70.1524, timezone: "America/Santiago" },
  { name: "La Serena", country: "Şili", lat: -29.9027, lng: -71.2519, timezone: "America/Santiago" },
  { name: "Punta Arenas", country: "Şili", lat: -53.1638, lng: -70.9171, timezone: "America/Punta_Arenas" },
  
  // Venezuela
  { name: "Caracas", country: "Venezuela", lat: 10.4806, lng: -66.9036, timezone: "America/Caracas" },
  { name: "Maracaibo", country: "Venezuela", lat: 10.6666, lng: -71.6125, timezone: "America/Caracas" },
  { name: "Valencia", country: "Venezuela", lat: 10.1620, lng: -67.9993, timezone: "America/Caracas" },
  { name: "Barquisimeto", country: "Venezuela", lat: 10.0678, lng: -69.3467, timezone: "America/Caracas" },
  { name: "Maracay", country: "Venezuela", lat: 10.2469, lng: -67.5958, timezone: "America/Caracas" },
  { name: "Ciudad Guayana", country: "Venezuela", lat: 8.3596, lng: -62.6517, timezone: "America/Caracas" },
  { name: "Barcelona", country: "Venezuela", lat: 10.1333, lng: -64.7000, timezone: "America/Caracas" },
  { name: "Maturín", country: "Venezuela", lat: 9.7453, lng: -63.1833, timezone: "America/Caracas" },
  
  // Ekvador
  { name: "Quito", country: "Ekvador", lat: -0.1807, lng: -78.4678, timezone: "America/Guayaquil" },
  { name: "Guayaquil", country: "Ekvador", lat: -2.1894, lng: -79.8891, timezone: "America/Guayaquil" },
  { name: "Cuenca", country: "Ekvador", lat: -2.9001, lng: -79.0059, timezone: "America/Guayaquil" },
  { name: "Santo Domingo", country: "Ekvador", lat: -0.2522, lng: -79.1719, timezone: "America/Guayaquil" },
  { name: "Machala", country: "Ekvador", lat: -3.2581, lng: -79.9554, timezone: "America/Guayaquil" },
  { name: "Manta", country: "Ekvador", lat: -0.9677, lng: -80.7089, timezone: "America/Guayaquil" },
  { name: "Galápagos", country: "Ekvador", lat: -0.9538, lng: -90.9656, timezone: "Pacific/Galapagos" },
  
  // Bolivya
  { name: "La Paz", country: "Bolivya", lat: -16.4897, lng: -68.1193, timezone: "America/La_Paz" },
  { name: "Santa Cruz de la Sierra", country: "Bolivya", lat: -17.7863, lng: -63.1812, timezone: "America/La_Paz" },
  { name: "Cochabamba", country: "Bolivya", lat: -17.3895, lng: -66.1568, timezone: "America/La_Paz" },
  { name: "Sucre", country: "Bolivya", lat: -19.0196, lng: -65.2619, timezone: "America/La_Paz" },
  { name: "Oruro", country: "Bolivya", lat: -17.9647, lng: -67.1064, timezone: "America/La_Paz" },
  { name: "Tarija", country: "Bolivya", lat: -21.5167, lng: -64.7500, timezone: "America/La_Paz" },
  { name: "Potosí", country: "Bolivya", lat: -19.5836, lng: -65.7531, timezone: "America/La_Paz" },
  { name: "Uyuni", country: "Bolivya", lat: -20.4604, lng: -66.8253, timezone: "America/La_Paz" },
  
  // Paraguay
  { name: "Asunción", country: "Paraguay", lat: -25.2637, lng: -57.5759, timezone: "America/Asuncion" },
  { name: "Ciudad del Este", country: "Paraguay", lat: -25.5097, lng: -54.6111, timezone: "America/Asuncion" },
  { name: "San Lorenzo", country: "Paraguay", lat: -25.3397, lng: -57.5092, timezone: "America/Asuncion" },
  { name: "Luque", country: "Paraguay", lat: -25.2700, lng: -57.4872, timezone: "America/Asuncion" },
  { name: "Encarnación", country: "Paraguay", lat: -27.3306, lng: -55.8667, timezone: "America/Asuncion" },
  
  // Uruguay
  { name: "Montevideo", country: "Uruguay", lat: -34.9011, lng: -56.1645, timezone: "America/Montevideo" },
  { name: "Salto", country: "Uruguay", lat: -31.3833, lng: -57.9667, timezone: "America/Montevideo" },
  { name: "Paysandú", country: "Uruguay", lat: -32.3214, lng: -58.0756, timezone: "America/Montevideo" },
  { name: "Las Piedras", country: "Uruguay", lat: -34.7167, lng: -56.2167, timezone: "America/Montevideo" },
  { name: "Punta del Este", country: "Uruguay", lat: -34.9667, lng: -54.9500, timezone: "America/Montevideo" },
  { name: "Colonia del Sacramento", country: "Uruguay", lat: -34.4626, lng: -57.8400, timezone: "America/Montevideo" },
  
  // Guyana
  { name: "Georgetown", country: "Guyana", lat: 6.8013, lng: -58.1551, timezone: "America/Guyana" },
  { name: "Linden", country: "Guyana", lat: 6.0000, lng: -58.3000, timezone: "America/Guyana" },
  
  // Surinam
  { name: "Paramaribo", country: "Surinam", lat: 5.8520, lng: -55.2038, timezone: "America/Paramaribo" },
  
  // Fransız Guyanası
  { name: "Cayenne", country: "Fransız Guyanası", lat: 4.9372, lng: -52.3260, timezone: "America/Cayenne" },
  { name: "Kourou", country: "Fransız Guyanası", lat: 5.1599, lng: -52.6503, timezone: "America/Cayenne" },
  
  // Japonya
  { name: "Tokyo", country: "Japonya", lat: 35.6762, lng: 139.6503, timezone: "Asia/Tokyo" },
  { name: "Osaka", country: "Japonya", lat: 34.6937, lng: 135.5023, timezone: "Asia/Tokyo" },
  { name: "Yokohama", country: "Japonya", lat: 35.4437, lng: 139.6380, timezone: "Asia/Tokyo" },
  { name: "Nagoya", country: "Japonya", lat: 35.1815, lng: 136.9066, timezone: "Asia/Tokyo" },
  { name: "Sapporo", country: "Japonya", lat: 43.0618, lng: 141.3545, timezone: "Asia/Tokyo" },
  { name: "Fukuoka", country: "Japonya", lat: 33.5904, lng: 130.4017, timezone: "Asia/Tokyo" },
  { name: "Kobe", country: "Japonya", lat: 34.6901, lng: 135.1956, timezone: "Asia/Tokyo" },
  { name: "Kyoto", country: "Japonya", lat: 35.0116, lng: 135.7681, timezone: "Asia/Tokyo" },
  { name: "Kawasaki", country: "Japonya", lat: 35.5308, lng: 139.7030, timezone: "Asia/Tokyo" },
  { name: "Hiroshima", country: "Japonya", lat: 34.3853, lng: 132.4553, timezone: "Asia/Tokyo" },
  { name: "Sendai", country: "Japonya", lat: 38.2682, lng: 140.8694, timezone: "Asia/Tokyo" },
  { name: "Kitakyushu", country: "Japonya", lat: 33.8835, lng: 130.8752, timezone: "Asia/Tokyo" },
  
  // Çin
  { name: "Pekin", country: "Çin", lat: 39.9042, lng: 116.4074, timezone: "Asia/Shanghai" },
  { name: "Şanghay", country: "Çin", lat: 31.2304, lng: 121.4737, timezone: "Asia/Shanghai" },
  { name: "Guangzhou", country: "Çin", lat: 23.1291, lng: 113.2644, timezone: "Asia/Shanghai" },
  { name: "Shenzhen", country: "Çin", lat: 22.5431, lng: 114.0579, timezone: "Asia/Shanghai" },
  { name: "Chengdu", country: "Çin", lat: 30.5728, lng: 104.0668, timezone: "Asia/Shanghai" },
  { name: "Wuhan", country: "Çin", lat: 30.5928, lng: 114.3055, timezone: "Asia/Shanghai" },
  { name: "Xi'an", country: "Çin", lat: 34.3416, lng: 108.9398, timezone: "Asia/Shanghai" },
  { name: "Hangzhou", country: "Çin", lat: 30.2741, lng: 120.1551, timezone: "Asia/Shanghai" },
  { name: "Chongqing", country: "Çin", lat: 29.4316, lng: 106.9123, timezone: "Asia/Shanghai" },
  { name: "Nanjing", country: "Çin", lat: 32.0603, lng: 118.7969, timezone: "Asia/Shanghai" },
  { name: "Tianjin", country: "Çin", lat: 39.3434, lng: 117.3616, timezone: "Asia/Shanghai" },
  { name: "Suzhou", country: "Çin", lat: 31.2990, lng: 120.5853, timezone: "Asia/Shanghai" },
  { name: "Harbin", country: "Çin", lat: 45.8038, lng: 126.5350, timezone: "Asia/Shanghai" },
  { name: "Qingdao", country: "Çin", lat: 36.0671, lng: 120.3826, timezone: "Asia/Shanghai" },
  { name: "Hong Kong", country: "Hong Kong", lat: 22.3193, lng: 114.1694, timezone: "Asia/Hong_Kong" },
  { name: "Makao", country: "Makao", lat: 22.1987, lng: 113.5439, timezone: "Asia/Macau" },
  
  // Güney Kore
  { name: "Seul", country: "Güney Kore", lat: 37.5665, lng: 126.9780, timezone: "Asia/Seoul" },
  { name: "Busan", country: "Güney Kore", lat: 35.1796, lng: 129.0756, timezone: "Asia/Seoul" },
  { name: "Incheon", country: "Güney Kore", lat: 37.4563, lng: 126.7052, timezone: "Asia/Seoul" },
  { name: "Daegu", country: "Güney Kore", lat: 35.8714, lng: 128.6014, timezone: "Asia/Seoul" },
  { name: "Daejeon", country: "Güney Kore", lat: 36.3504, lng: 127.3845, timezone: "Asia/Seoul" },
  { name: "Gwangju", country: "Güney Kore", lat: 35.1595, lng: 126.8526, timezone: "Asia/Seoul" },
  { name: "Ulsan", country: "Güney Kore", lat: 35.5384, lng: 129.3114, timezone: "Asia/Seoul" },
  { name: "Suwon", country: "Güney Kore", lat: 37.2636, lng: 127.0286, timezone: "Asia/Seoul" },
  { name: "Changwon", country: "Güney Kore", lat: 35.2280, lng: 128.6811, timezone: "Asia/Seoul" },
  { name: "Seongnam", country: "Güney Kore", lat: 37.4200, lng: 127.1267, timezone: "Asia/Seoul" },
  
  // Kuzey Kore
  { name: "Pyongyang", country: "Kuzey Kore", lat: 39.0392, lng: 125.7625, timezone: "Asia/Pyongyang" },
  { name: "Hamhung", country: "Kuzey Kore", lat: 39.9181, lng: 127.5347, timezone: "Asia/Pyongyang" },
  { name: "Chongjin", country: "Kuzey Kore", lat: 41.7956, lng: 129.7758, timezone: "Asia/Pyongyang" },
  { name: "Nampo", country: "Kuzey Kore", lat: 38.7375, lng: 125.4078, timezone: "Asia/Pyongyang" },
  
  // Tayvan
  { name: "Taipei", country: "Tayvan", lat: 25.0330, lng: 121.5654, timezone: "Asia/Taipei" },
  { name: "Kaohsiung", country: "Tayvan", lat: 22.6273, lng: 120.3014, timezone: "Asia/Taipei" },
  { name: "Taichung", country: "Tayvan", lat: 24.1477, lng: 120.6736, timezone: "Asia/Taipei" },
  { name: "Tainan", country: "Tayvan", lat: 22.9998, lng: 120.2269, timezone: "Asia/Taipei" },
  { name: "Hsinchu", country: "Tayvan", lat: 24.8138, lng: 120.9675, timezone: "Asia/Taipei" },
  { name: "Taoyuan", country: "Tayvan", lat: 24.9936, lng: 121.3010, timezone: "Asia/Taipei" },
  
  // Hindistan
  { name: "Mumbai", country: "Hindistan", lat: 19.0760, lng: 72.8777, timezone: "Asia/Kolkata" },
  { name: "Delhi", country: "Hindistan", lat: 28.7041, lng: 77.1025, timezone: "Asia/Kolkata" },
  { name: "Bangalore", country: "Hindistan", lat: 12.9716, lng: 77.5946, timezone: "Asia/Kolkata" },
  { name: "Hyderabad", country: "Hindistan", lat: 17.3850, lng: 78.4867, timezone: "Asia/Kolkata" },
  { name: "Chennai", country: "Hindistan", lat: 13.0827, lng: 80.2707, timezone: "Asia/Kolkata" },
  { name: "Kolkata", country: "Hindistan", lat: 22.5726, lng: 88.3639, timezone: "Asia/Kolkata" },
  { name: "Ahmedabad", country: "Hindistan", lat: 23.0225, lng: 72.5714, timezone: "Asia/Kolkata" },
  { name: "Pune", country: "Hindistan", lat: 18.5204, lng: 73.8567, timezone: "Asia/Kolkata" },
  { name: "Jaipur", country: "Hindistan", lat: 26.9124, lng: 75.7873, timezone: "Asia/Kolkata" },
  { name: "Surat", country: "Hindistan", lat: 21.1702, lng: 72.8311, timezone: "Asia/Kolkata" },
  { name: "Lucknow", country: "Hindistan", lat: 26.8467, lng: 80.9462, timezone: "Asia/Kolkata" },
  { name: "Kanpur", country: "Hindistan", lat: 26.4499, lng: 80.3319, timezone: "Asia/Kolkata" },
  { name: "Nagpur", country: "Hindistan", lat: 21.1458, lng: 79.0882, timezone: "Asia/Kolkata" },
  { name: "Varanasi", country: "Hindistan", lat: 25.3176, lng: 82.9739, timezone: "Asia/Kolkata" },
  { name: "Agra", country: "Hindistan", lat: 27.1767, lng: 78.0081, timezone: "Asia/Kolkata" },
  { name: "Goa", country: "Hindistan", lat: 15.2993, lng: 74.1240, timezone: "Asia/Kolkata" },
  
  // Pakistan
  { name: "Karaçi", country: "Pakistan", lat: 24.8607, lng: 67.0011, timezone: "Asia/Karachi" },
  { name: "Lahor", country: "Pakistan", lat: 31.5204, lng: 74.3587, timezone: "Asia/Karachi" },
  { name: "İslamabad", country: "Pakistan", lat: 33.6844, lng: 73.0479, timezone: "Asia/Karachi" },
  { name: "Ravalpindi", country: "Pakistan", lat: 33.5651, lng: 73.0169, timezone: "Asia/Karachi" },
  { name: "Faysalabad", country: "Pakistan", lat: 31.4504, lng: 73.1350, timezone: "Asia/Karachi" },
  { name: "Multan", country: "Pakistan", lat: 30.1575, lng: 71.5249, timezone: "Asia/Karachi" },
  { name: "Peşaver", country: "Pakistan", lat: 34.0151, lng: 71.5249, timezone: "Asia/Karachi" },
  { name: "Haydarabad", country: "Pakistan", lat: 25.3960, lng: 68.3578, timezone: "Asia/Karachi" },
  { name: "Kvetta", country: "Pakistan", lat: 30.1798, lng: 66.9750, timezone: "Asia/Karachi" },
  { name: "Gucranvala", country: "Pakistan", lat: 32.1617, lng: 74.1883, timezone: "Asia/Karachi" },
  
  // Bangladeş
  { name: "Dakka", country: "Bangladeş", lat: 23.8103, lng: 90.4125, timezone: "Asia/Dhaka" },
  { name: "Chittagong", country: "Bangladeş", lat: 22.3569, lng: 91.7832, timezone: "Asia/Dhaka" },
  { name: "Khulna", country: "Bangladeş", lat: 22.8456, lng: 89.5403, timezone: "Asia/Dhaka" },
  { name: "Rajshahi", country: "Bangladeş", lat: 24.3745, lng: 88.6042, timezone: "Asia/Dhaka" },
  { name: "Sylhet", country: "Bangladeş", lat: 24.8949, lng: 91.8687, timezone: "Asia/Dhaka" },
  { name: "Rangpur", country: "Bangladeş", lat: 25.7439, lng: 89.2752, timezone: "Asia/Dhaka" },
  
  // Sri Lanka
  { name: "Kolombo", country: "Sri Lanka", lat: 6.9271, lng: 79.8612, timezone: "Asia/Colombo" },
  { name: "Kandy", country: "Sri Lanka", lat: 7.2906, lng: 80.6337, timezone: "Asia/Colombo" },
  { name: "Galle", country: "Sri Lanka", lat: 6.0535, lng: 80.2210, timezone: "Asia/Colombo" },
  { name: "Jaffna", country: "Sri Lanka", lat: 9.6615, lng: 80.0255, timezone: "Asia/Colombo" },
  { name: "Negombo", country: "Sri Lanka", lat: 7.2083, lng: 79.8358, timezone: "Asia/Colombo" },
  
  // Nepal
  { name: "Katmandu", country: "Nepal", lat: 27.7172, lng: 85.3240, timezone: "Asia/Kathmandu" },
  { name: "Pokhara", country: "Nepal", lat: 28.2096, lng: 83.9856, timezone: "Asia/Kathmandu" },
  { name: "Lalitpur", country: "Nepal", lat: 27.6588, lng: 85.3247, timezone: "Asia/Kathmandu" },
  { name: "Biratnagar", country: "Nepal", lat: 26.4525, lng: 87.2718, timezone: "Asia/Kathmandu" },
  { name: "Bharatpur", country: "Nepal", lat: 27.6833, lng: 84.4333, timezone: "Asia/Kathmandu" },
  
  // Singapur
  { name: "Singapur", country: "Singapur", lat: 1.3521, lng: 103.8198, timezone: "Asia/Singapore" },
  
  // Tayland
  { name: "Bangkok", country: "Tayland", lat: 13.7563, lng: 100.5018, timezone: "Asia/Bangkok" },
  { name: "Chiang Mai", country: "Tayland", lat: 18.7883, lng: 98.9853, timezone: "Asia/Bangkok" },
  { name: "Phuket", country: "Tayland", lat: 7.8804, lng: 98.3923, timezone: "Asia/Bangkok" },
  { name: "Pattaya", country: "Tayland", lat: 12.9236, lng: 100.8825, timezone: "Asia/Bangkok" },
  { name: "Nonthaburi", country: "Tayland", lat: 13.8621, lng: 100.5144, timezone: "Asia/Bangkok" },
  { name: "Hat Yai", country: "Tayland", lat: 7.0086, lng: 100.4747, timezone: "Asia/Bangkok" },
  { name: "Khon Kaen", country: "Tayland", lat: 16.4322, lng: 102.8236, timezone: "Asia/Bangkok" },
  { name: "Udon Thani", country: "Tayland", lat: 17.4156, lng: 102.7872, timezone: "Asia/Bangkok" },
  
  // Vietnam
  { name: "Hanoi", country: "Vietnam", lat: 21.0278, lng: 105.8342, timezone: "Asia/Ho_Chi_Minh" },
  { name: "Ho Chi Minh", country: "Vietnam", lat: 10.8231, lng: 106.6297, timezone: "Asia/Ho_Chi_Minh" },
  { name: "Da Nang", country: "Vietnam", lat: 16.0544, lng: 108.2022, timezone: "Asia/Ho_Chi_Minh" },
  { name: "Hai Phong", country: "Vietnam", lat: 20.8449, lng: 106.6881, timezone: "Asia/Ho_Chi_Minh" },
  { name: "Can Tho", country: "Vietnam", lat: 10.0452, lng: 105.7469, timezone: "Asia/Ho_Chi_Minh" },
  { name: "Nha Trang", country: "Vietnam", lat: 12.2388, lng: 109.1967, timezone: "Asia/Ho_Chi_Minh" },
  { name: "Hue", country: "Vietnam", lat: 16.4637, lng: 107.5909, timezone: "Asia/Ho_Chi_Minh" },
  { name: "Da Lat", country: "Vietnam", lat: 11.9404, lng: 108.4583, timezone: "Asia/Ho_Chi_Minh" },
  
  // Malezya
  { name: "Kuala Lumpur", country: "Malezya", lat: 3.1390, lng: 101.6869, timezone: "Asia/Kuala_Lumpur" },
  { name: "George Town", country: "Malezya", lat: 5.4141, lng: 100.3288, timezone: "Asia/Kuala_Lumpur" },
  { name: "Johor Bahru", country: "Malezya", lat: 1.4927, lng: 103.7414, timezone: "Asia/Kuala_Lumpur" },
  { name: "İpoh", country: "Malezya", lat: 4.5975, lng: 101.0901, timezone: "Asia/Kuala_Lumpur" },
  { name: "Shah Alam", country: "Malezya", lat: 3.0733, lng: 101.5185, timezone: "Asia/Kuala_Lumpur" },
  { name: "Malakka", country: "Malezya", lat: 2.1896, lng: 102.2501, timezone: "Asia/Kuala_Lumpur" },
  { name: "Kota Kinabalu", country: "Malezya", lat: 5.9804, lng: 116.0735, timezone: "Asia/Kuala_Lumpur" },
  { name: "Kuching", country: "Malezya", lat: 1.5535, lng: 110.3593, timezone: "Asia/Kuala_Lumpur" },
  
  // Endonezya
  { name: "Jakarta", country: "Endonezya", lat: -6.2088, lng: 106.8456, timezone: "Asia/Jakarta" },
  { name: "Surabaya", country: "Endonezya", lat: -7.2575, lng: 112.7521, timezone: "Asia/Jakarta" },
  { name: "Bandung", country: "Endonezya", lat: -6.9175, lng: 107.6191, timezone: "Asia/Jakarta" },
  { name: "Medan", country: "Endonezya", lat: 3.5952, lng: 98.6722, timezone: "Asia/Jakarta" },
  { name: "Semarang", country: "Endonezya", lat: -6.9666, lng: 110.4196, timezone: "Asia/Jakarta" },
  { name: "Makassar", country: "Endonezya", lat: -5.1477, lng: 119.4327, timezone: "Asia/Makassar" },
  { name: "Palembang", country: "Endonezya", lat: -2.9761, lng: 104.7754, timezone: "Asia/Jakarta" },
  { name: "Denpasar", country: "Endonezya", lat: -8.6705, lng: 115.2126, timezone: "Asia/Makassar" },
  { name: "Yogyakarta", country: "Endonezya", lat: -7.7956, lng: 110.3695, timezone: "Asia/Jakarta" },
  { name: "Balikpapan", country: "Endonezya", lat: -1.2379, lng: 116.8529, timezone: "Asia/Makassar" },
  
  // Filipinler
  { name: "Manila", country: "Filipinler", lat: 14.5995, lng: 120.9842, timezone: "Asia/Manila" },
  { name: "Quezon City", country: "Filipinler", lat: 14.6760, lng: 121.0437, timezone: "Asia/Manila" },
  { name: "Davao", country: "Filipinler", lat: 7.1907, lng: 125.4553, timezone: "Asia/Manila" },
  { name: "Cebu", country: "Filipinler", lat: 10.3157, lng: 123.8854, timezone: "Asia/Manila" },
  { name: "Zamboanga", country: "Filipinler", lat: 6.9214, lng: 122.0790, timezone: "Asia/Manila" },
  { name: "Makati", country: "Filipinler", lat: 14.5547, lng: 121.0244, timezone: "Asia/Manila" },
  { name: "Taguig", country: "Filipinler", lat: 14.5176, lng: 121.0509, timezone: "Asia/Manila" },
  { name: "Pasig", country: "Filipinler", lat: 14.5764, lng: 121.0851, timezone: "Asia/Manila" },
  
  // Myanmar
  { name: "Yangon", country: "Myanmar", lat: 16.8661, lng: 96.1951, timezone: "Asia/Yangon" },
  { name: "Mandalay", country: "Myanmar", lat: 21.9588, lng: 96.0891, timezone: "Asia/Yangon" },
  { name: "Naypyidaw", country: "Myanmar", lat: 19.7633, lng: 96.0785, timezone: "Asia/Yangon" },
  { name: "Bagan", country: "Myanmar", lat: 21.1717, lng: 94.8585, timezone: "Asia/Yangon" },
  { name: "Mawlamyine", country: "Myanmar", lat: 16.4905, lng: 97.6286, timezone: "Asia/Yangon" },
  
  // Kamboçya
  { name: "Phnom Penh", country: "Kamboçya", lat: 11.5564, lng: 104.9282, timezone: "Asia/Phnom_Penh" },
  { name: "Siem Reap", country: "Kamboçya", lat: 13.3671, lng: 103.8448, timezone: "Asia/Phnom_Penh" },
  { name: "Battambang", country: "Kamboçya", lat: 13.1023, lng: 103.1979, timezone: "Asia/Phnom_Penh" },
  { name: "Sihanoukville", country: "Kamboçya", lat: 10.6093, lng: 103.5296, timezone: "Asia/Phnom_Penh" },
  
  // Laos
  { name: "Vientiane", country: "Laos", lat: 17.9757, lng: 102.6331, timezone: "Asia/Vientiane" },
  { name: "Luang Prabang", country: "Laos", lat: 19.8866, lng: 102.1350, timezone: "Asia/Vientiane" },
  { name: "Savannakhet", country: "Laos", lat: 16.5473, lng: 104.7545, timezone: "Asia/Vientiane" },
  { name: "Pakse", country: "Laos", lat: 15.1200, lng: 105.7833, timezone: "Asia/Vientiane" },
  
  // Moğolistan
  { name: "Ulan Batur", country: "Moğolistan", lat: 47.8864, lng: 106.9057, timezone: "Asia/Ulaanbaatar" },
  { name: "Erdenet", country: "Moğolistan", lat: 49.0333, lng: 104.0833, timezone: "Asia/Ulaanbaatar" },
  { name: "Darkhan", country: "Moğolistan", lat: 49.4875, lng: 105.9375, timezone: "Asia/Ulaanbaatar" },
  { name: "Choibalsan", country: "Moğolistan", lat: 48.0667, lng: 114.5333, timezone: "Asia/Ulaanbaatar" },
  
  // Orta Asya - Kazakistan
  { name: "Astana", country: "Kazakistan", lat: 51.1694, lng: 71.4491, timezone: "Asia/Almaty" },
  { name: "Almatı", country: "Kazakistan", lat: 43.2220, lng: 76.8512, timezone: "Asia/Almaty" },
  { name: "Şımkent", country: "Kazakistan", lat: 42.3417, lng: 69.5967, timezone: "Asia/Almaty" },
  { name: "Karaganda", country: "Kazakistan", lat: 49.8047, lng: 73.1094, timezone: "Asia/Almaty" },
  { name: "Aktöbe", country: "Kazakistan", lat: 50.2839, lng: 57.1669, timezone: "Asia/Aqtobe" },
  { name: "Taraz", country: "Kazakistan", lat: 42.9000, lng: 71.3667, timezone: "Asia/Almaty" },
  { name: "Pavlodar", country: "Kazakistan", lat: 52.2873, lng: 76.9674, timezone: "Asia/Almaty" },
  { name: "Öskemen", country: "Kazakistan", lat: 49.9489, lng: 82.6286, timezone: "Asia/Almaty" },
  { name: "Semey", country: "Kazakistan", lat: 50.4111, lng: 80.2275, timezone: "Asia/Almaty" },
  { name: "Atırau", country: "Kazakistan", lat: 46.8064, lng: 51.9472, timezone: "Asia/Atyrau" },
  
  // Özbekistan
  { name: "Taşkent", country: "Özbekistan", lat: 41.2995, lng: 69.2401, timezone: "Asia/Tashkent" },
  { name: "Semerkant", country: "Özbekistan", lat: 39.6542, lng: 66.9597, timezone: "Asia/Samarkand" },
  { name: "Namangan", country: "Özbekistan", lat: 41.0011, lng: 71.6722, timezone: "Asia/Tashkent" },
  { name: "Andican", country: "Özbekistan", lat: 40.7833, lng: 72.3333, timezone: "Asia/Tashkent" },
  { name: "Buhara", country: "Özbekistan", lat: 39.7681, lng: 64.4556, timezone: "Asia/Samarkand" },
  { name: "Fergana", country: "Özbekistan", lat: 40.3842, lng: 71.7889, timezone: "Asia/Tashkent" },
  { name: "Nukus", country: "Özbekistan", lat: 42.4619, lng: 59.6003, timezone: "Asia/Samarkand" },
  { name: "Hive", country: "Özbekistan", lat: 41.3775, lng: 60.3639, timezone: "Asia/Samarkand" },
  
  // Kırgızistan
  { name: "Bişkek", country: "Kırgızistan", lat: 42.8746, lng: 74.5698, timezone: "Asia/Bishkek" },
  { name: "Oş", country: "Kırgızistan", lat: 40.5283, lng: 72.7985, timezone: "Asia/Bishkek" },
  { name: "Calalabad", country: "Kırgızistan", lat: 40.9333, lng: 73.0000, timezone: "Asia/Bishkek" },
  { name: "Karakol", country: "Kırgızistan", lat: 42.4908, lng: 78.3939, timezone: "Asia/Bishkek" },
  { name: "Tokmok", country: "Kırgızistan", lat: 42.8333, lng: 75.3000, timezone: "Asia/Bishkek" },
  
  // Tacikistan
  { name: "Duşanbe", country: "Tacikistan", lat: 38.5598, lng: 68.7739, timezone: "Asia/Dushanbe" },
  { name: "Hocent", country: "Tacikistan", lat: 40.2833, lng: 69.6167, timezone: "Asia/Dushanbe" },
  { name: "Kulob", country: "Tacikistan", lat: 37.9167, lng: 69.7833, timezone: "Asia/Dushanbe" },
  { name: "Bokhtar", country: "Tacikistan", lat: 37.8361, lng: 68.7833, timezone: "Asia/Dushanbe" },
  
  // Türkmenistan
  { name: "Aşkabat", country: "Türkmenistan", lat: 37.9601, lng: 58.3261, timezone: "Asia/Ashgabat" },
  { name: "Türkmenabat", country: "Türkmenistan", lat: 39.0733, lng: 63.5786, timezone: "Asia/Ashgabat" },
  { name: "Daşoguz", country: "Türkmenistan", lat: 41.8363, lng: 59.9666, timezone: "Asia/Ashgabat" },
  { name: "Mary", country: "Türkmenistan", lat: 37.5936, lng: 61.8308, timezone: "Asia/Ashgabat" },
  { name: "Balkanabat", country: "Türkmenistan", lat: 39.5108, lng: 54.3675, timezone: "Asia/Ashgabat" },
  
  // Afganistan
  { name: "Kabil", country: "Afganistan", lat: 34.5553, lng: 69.2075, timezone: "Asia/Kabul" },
  { name: "Kandahar", country: "Afganistan", lat: 31.6289, lng: 65.7372, timezone: "Asia/Kabul" },
  { name: "Herat", country: "Afganistan", lat: 34.3529, lng: 62.2040, timezone: "Asia/Kabul" },
  { name: "Mezar-ı Şerif", country: "Afganistan", lat: 36.7069, lng: 67.1147, timezone: "Asia/Kabul" },
  { name: "Celalabad", country: "Afganistan", lat: 34.4344, lng: 70.4478, timezone: "Asia/Kabul" },
  { name: "Kunduz", country: "Afganistan", lat: 36.7281, lng: 68.8578, timezone: "Asia/Kabul" },
  
  // Gürcistan
  { name: "Tiflis", country: "Gürcistan", lat: 41.7151, lng: 44.8271, timezone: "Asia/Tbilisi" },
  { name: "Batum", country: "Gürcistan", lat: 41.6168, lng: 41.6367, timezone: "Asia/Tbilisi" },
  { name: "Kutaisi", country: "Gürcistan", lat: 42.2679, lng: 42.6946, timezone: "Asia/Tbilisi" },
  { name: "Rustavi", country: "Gürcistan", lat: 41.5545, lng: 44.9939, timezone: "Asia/Tbilisi" },
  { name: "Suhumi", country: "Gürcistan", lat: 43.0015, lng: 41.0234, timezone: "Asia/Tbilisi" },
  
  // Ermenistan
  { name: "Erivan", country: "Ermenistan", lat: 40.1792, lng: 44.4991, timezone: "Asia/Yerevan" },
  { name: "Gyumri", country: "Ermenistan", lat: 40.7942, lng: 43.8453, timezone: "Asia/Yerevan" },
  { name: "Vanadzor", country: "Ermenistan", lat: 40.8128, lng: 44.4883, timezone: "Asia/Yerevan" },
  { name: "Vagharshapat", country: "Ermenistan", lat: 40.1625, lng: 44.2875, timezone: "Asia/Yerevan" },
  { name: "Hrazdan", country: "Ermenistan", lat: 40.4978, lng: 44.7656, timezone: "Asia/Yerevan" },
  
  // İsrail
  { name: "Tel Aviv", country: "İsrail", lat: 32.0853, lng: 34.7818, timezone: "Asia/Jerusalem" },
  { name: "Kudüs", country: "İsrail", lat: 31.7683, lng: 35.2137, timezone: "Asia/Jerusalem" },
  { name: "Hayfa", country: "İsrail", lat: 32.7940, lng: 34.9896, timezone: "Asia/Jerusalem" },
  { name: "Rishon LeZion", country: "İsrail", lat: 31.9730, lng: 34.7925, timezone: "Asia/Jerusalem" },
  { name: "Petah Tikva", country: "İsrail", lat: 32.0867, lng: 34.8872, timezone: "Asia/Jerusalem" },
  { name: "Ashdod", country: "İsrail", lat: 31.8044, lng: 34.6553, timezone: "Asia/Jerusalem" },
  { name: "Netanya", country: "İsrail", lat: 32.3286, lng: 34.8567, timezone: "Asia/Jerusalem" },
  { name: "Beer Sheva", country: "İsrail", lat: 31.2530, lng: 34.7915, timezone: "Asia/Jerusalem" },
  { name: "Eilat", country: "İsrail", lat: 29.5577, lng: 34.9519, timezone: "Asia/Jerusalem" },
  
  // Ürdün
  { name: "Amman", country: "Ürdün", lat: 31.9454, lng: 35.9284, timezone: "Asia/Amman" },
  { name: "Zerka", country: "Ürdün", lat: 32.0833, lng: 36.0833, timezone: "Asia/Amman" },
  { name: "Irbid", country: "Ürdün", lat: 32.5556, lng: 35.8500, timezone: "Asia/Amman" },
  { name: "Akabe", country: "Ürdün", lat: 29.5267, lng: 35.0078, timezone: "Asia/Amman" },
  { name: "Petra", country: "Ürdün", lat: 30.3285, lng: 35.4444, timezone: "Asia/Amman" },
  
  // Lübnan
  { name: "Beyrut", country: "Lübnan", lat: 33.8938, lng: 35.5018, timezone: "Asia/Beirut" },
  { name: "Trablus", country: "Lübnan", lat: 34.4361, lng: 35.8497, timezone: "Asia/Beirut" },
  { name: "Sayda", country: "Lübnan", lat: 33.5633, lng: 35.3717, timezone: "Asia/Beirut" },
  { name: "Sur", country: "Lübnan", lat: 33.2705, lng: 35.1939, timezone: "Asia/Beirut" },
  { name: "Baalbek", country: "Lübnan", lat: 34.0047, lng: 36.2110, timezone: "Asia/Beirut" },
  
  // Filistin
  { name: "Gazze", country: "Filistin", lat: 31.5017, lng: 34.4668, timezone: "Asia/Gaza" },
  { name: "Ramallah", country: "Filistin", lat: 31.9038, lng: 35.2034, timezone: "Asia/Hebron" },
  { name: "Nablus", country: "Filistin", lat: 32.2211, lng: 35.2544, timezone: "Asia/Hebron" },
  { name: "El Halil", country: "Filistin", lat: 31.5326, lng: 35.0998, timezone: "Asia/Hebron" },
  { name: "Beytüllahim", country: "Filistin", lat: 31.7054, lng: 35.2024, timezone: "Asia/Hebron" },
  
  // Azerbaycan
  { name: "Bakü", country: "Azerbaycan", lat: 40.4093, lng: 49.8671, timezone: "Asia/Baku" },
  { name: "Gence", country: "Azerbaycan", lat: 40.6828, lng: 46.3606, timezone: "Asia/Baku" },
  { name: "Sumgayıt", country: "Azerbaycan", lat: 40.5855, lng: 49.6317, timezone: "Asia/Baku" },
  { name: "Mingəçevir", country: "Azerbaycan", lat: 40.7703, lng: 47.0497, timezone: "Asia/Baku" },
  { name: "Şirvan", country: "Azerbaycan", lat: 39.9386, lng: 48.9208, timezone: "Asia/Baku" },
  { name: "Naxçıvan", country: "Azerbaycan", lat: 39.2089, lng: 45.4122, timezone: "Asia/Baku" },
  { name: "Şəki", country: "Azerbaycan", lat: 41.1919, lng: 47.1706, timezone: "Asia/Baku" },
  { name: "Lənkəran", country: "Azerbaycan", lat: 38.7536, lng: 48.8511, timezone: "Asia/Baku" },
  { name: "Yevlax", country: "Azerbaycan", lat: 40.6186, lng: 47.1500, timezone: "Asia/Baku" },
  { name: "Xaçmaz", country: "Azerbaycan", lat: 41.4631, lng: 48.8025, timezone: "Asia/Baku" },
  { name: "Quba", country: "Azerbaycan", lat: 41.3614, lng: 48.5133, timezone: "Asia/Baku" },
  { name: "Zaqatala", country: "Azerbaycan", lat: 41.6314, lng: 46.6383, timezone: "Asia/Baku" },
  { name: "Qəbələ", country: "Azerbaycan", lat: 40.9814, lng: 47.8458, timezone: "Asia/Baku" },
  { name: "Şamaxı", country: "Azerbaycan", lat: 40.6319, lng: 48.6367, timezone: "Asia/Baku" },
  { name: "İsmayıllı", country: "Azerbaycan", lat: 40.7872, lng: 48.1519, timezone: "Asia/Baku" },
  { name: "Qusar", country: "Azerbaycan", lat: 41.4275, lng: 48.4306, timezone: "Asia/Baku" },
  { name: "Bərdə", country: "Azerbaycan", lat: 40.3747, lng: 47.1264, timezone: "Asia/Baku" },
  { name: "Ağdam", country: "Azerbaycan", lat: 39.9911, lng: 46.9269, timezone: "Asia/Baku" },
  { name: "Şuşa", country: "Azerbaycan", lat: 39.7619, lng: 46.7469, timezone: "Asia/Baku" },
  
  // İran
  { name: "Tahran", country: "İran", lat: 35.6892, lng: 51.3890, timezone: "Asia/Tehran" },
  { name: "Meşhed", country: "İran", lat: 36.2605, lng: 59.6168, timezone: "Asia/Tehran" },
  { name: "Isfahan", country: "İran", lat: 32.6546, lng: 51.6680, timezone: "Asia/Tehran" },
  { name: "Tebriz", country: "İran", lat: 38.0800, lng: 46.2919, timezone: "Asia/Tehran" },
  { name: "Şiraz", country: "İran", lat: 29.5918, lng: 52.5837, timezone: "Asia/Tehran" },
  { name: "Ahvaz", country: "İran", lat: 31.3183, lng: 48.6706, timezone: "Asia/Tehran" },
  { name: "Kum", country: "İran", lat: 34.6416, lng: 50.8746, timezone: "Asia/Tehran" },
  { name: "Kirmanşah", country: "İran", lat: 34.3142, lng: 47.0650, timezone: "Asia/Tehran" },
  { name: "Urmiye", country: "İran", lat: 37.5527, lng: 45.0761, timezone: "Asia/Tehran" },
  { name: "Reşt", country: "İran", lat: 37.2808, lng: 49.5832, timezone: "Asia/Tehran" },
  { name: "Yezd", country: "İran", lat: 31.8974, lng: 54.3569, timezone: "Asia/Tehran" },
  { name: "Kirman", country: "İran", lat: 30.2839, lng: 57.0834, timezone: "Asia/Tehran" },
  { name: "Hemedan", country: "İran", lat: 34.7990, lng: 48.5150, timezone: "Asia/Tehran" },
  { name: "Arak", country: "İran", lat: 34.0917, lng: 49.6892, timezone: "Asia/Tehran" },
  { name: "Erdebil", country: "İran", lat: 38.2498, lng: 48.2933, timezone: "Asia/Tehran" },
  { name: "Zencan", country: "İran", lat: 36.6736, lng: 48.4787, timezone: "Asia/Tehran" },
  { name: "Sennendec", country: "İran", lat: 35.3114, lng: 46.9988, timezone: "Asia/Tehran" },
  { name: "Kazvin", country: "İran", lat: 36.2688, lng: 50.0041, timezone: "Asia/Tehran" },
  { name: "Bender Abbas", country: "İran", lat: 27.1865, lng: 56.2808, timezone: "Asia/Tehran" },
  { name: "Sari", country: "İran", lat: 36.5633, lng: 53.0601, timezone: "Asia/Tehran" },
  
  // Irak
  { name: "Bağdat", country: "Irak", lat: 33.3152, lng: 44.3661, timezone: "Asia/Baghdad" },
  { name: "Basra", country: "Irak", lat: 30.5085, lng: 47.7804, timezone: "Asia/Baghdad" },
  { name: "Musul", country: "Irak", lat: 36.3350, lng: 43.1189, timezone: "Asia/Baghdad" },
  { name: "Erbil", country: "Irak", lat: 36.1901, lng: 44.0091, timezone: "Asia/Baghdad" },
  { name: "Süleymaniye", country: "Irak", lat: 35.5613, lng: 45.4306, timezone: "Asia/Baghdad" },
  { name: "Kerkük", country: "Irak", lat: 35.4681, lng: 44.3922, timezone: "Asia/Baghdad" },
  { name: "Necef", country: "Irak", lat: 31.9959, lng: 44.3143, timezone: "Asia/Baghdad" },
  { name: "Kerbela", country: "Irak", lat: 32.6160, lng: 44.0249, timezone: "Asia/Baghdad" },
  { name: "Nasıriye", country: "Irak", lat: 31.0439, lng: 46.2575, timezone: "Asia/Baghdad" },
  { name: "Amara", country: "Irak", lat: 31.8356, lng: 47.1449, timezone: "Asia/Baghdad" },
  { name: "Duhok", country: "Irak", lat: 36.8631, lng: 42.9458, timezone: "Asia/Baghdad" },
  { name: "Hille", country: "Irak", lat: 32.4637, lng: 44.4196, timezone: "Asia/Baghdad" },
  { name: "Kut", country: "Irak", lat: 32.5074, lng: 45.8178, timezone: "Asia/Baghdad" },
  { name: "Ramadi", country: "Irak", lat: 33.4271, lng: 43.3010, timezone: "Asia/Baghdad" },
  { name: "Samarra", country: "Irak", lat: 34.1979, lng: 43.8750, timezone: "Asia/Baghdad" },
  
  // Suriye
  { name: "Şam", country: "Suriye", lat: 33.5138, lng: 36.2765, timezone: "Asia/Damascus" },
  { name: "Halep", country: "Suriye", lat: 36.2021, lng: 37.1343, timezone: "Asia/Damascus" },
  { name: "Humus", country: "Suriye", lat: 34.7324, lng: 36.7137, timezone: "Asia/Damascus" },
  { name: "Hama", country: "Suriye", lat: 35.1318, lng: 36.7519, timezone: "Asia/Damascus" },
  { name: "Lazkiye", country: "Suriye", lat: 35.5317, lng: 35.7919, timezone: "Asia/Damascus" },
  { name: "Deir ez-Zor", country: "Suriye", lat: 35.3359, lng: 40.1408, timezone: "Asia/Damascus" },
  { name: "Rakka", country: "Suriye", lat: 35.9528, lng: 39.0078, timezone: "Asia/Damascus" },
  { name: "İdlib", country: "Suriye", lat: 35.9306, lng: 36.6339, timezone: "Asia/Damascus" },
  { name: "Haseke", country: "Suriye", lat: 36.5022, lng: 40.7466, timezone: "Asia/Damascus" },
  { name: "Tartus", country: "Suriye", lat: 34.8959, lng: 35.8867, timezone: "Asia/Damascus" },
  { name: "Kamışlı", country: "Suriye", lat: 37.0506, lng: 41.2261, timezone: "Asia/Damascus" },
  { name: "Dera", country: "Suriye", lat: 32.6189, lng: 36.1021, timezone: "Asia/Damascus" },
  { name: "Süveyda", country: "Suriye", lat: 32.7094, lng: 36.5667, timezone: "Asia/Damascus" },
  { name: "Palmira", country: "Suriye", lat: 34.5503, lng: 38.2691, timezone: "Asia/Damascus" },
  
  // Suudi Arabistan
  { name: "Riyad", country: "Suudi Arabistan", lat: 24.7136, lng: 46.6753, timezone: "Asia/Riyadh" },
  { name: "Cidde", country: "Suudi Arabistan", lat: 21.4858, lng: 39.1925, timezone: "Asia/Riyadh" },
  { name: "Mekke", country: "Suudi Arabistan", lat: 21.4225, lng: 39.8262, timezone: "Asia/Riyadh" },
  { name: "Medine", country: "Suudi Arabistan", lat: 24.5247, lng: 39.5692, timezone: "Asia/Riyadh" },
  { name: "Dammam", country: "Suudi Arabistan", lat: 26.4207, lng: 50.0888, timezone: "Asia/Riyadh" },
  { name: "Taif", country: "Suudi Arabistan", lat: 21.2703, lng: 40.4158, timezone: "Asia/Riyadh" },
  { name: "Tabuk", country: "Suudi Arabistan", lat: 28.3838, lng: 36.5550, timezone: "Asia/Riyadh" },
  { name: "Bureyda", country: "Suudi Arabistan", lat: 26.3267, lng: 43.9717, timezone: "Asia/Riyadh" },
  { name: "Hatim", country: "Suudi Arabistan", lat: 27.5114, lng: 41.7208, timezone: "Asia/Riyadh" },
  { name: "Hafr el-Batin", country: "Suudi Arabistan", lat: 28.4328, lng: 45.9708, timezone: "Asia/Riyadh" },
  { name: "Cübey", country: "Suudi Arabistan", lat: 26.9598, lng: 49.5687, timezone: "Asia/Riyadh" },
  { name: "Necran", country: "Suudi Arabistan", lat: 17.4917, lng: 44.1322, timezone: "Asia/Riyadh" },
  { name: "Abha", country: "Suudi Arabistan", lat: 18.2164, lng: 42.5053, timezone: "Asia/Riyadh" },
  { name: "Hamis Müşeyt", country: "Suudi Arabistan", lat: 18.3000, lng: 42.7333, timezone: "Asia/Riyadh" },
  { name: "Cizan", country: "Suudi Arabistan", lat: 16.8892, lng: 42.5511, timezone: "Asia/Riyadh" },
  
  // Birleşik Arap Emirlikleri
  { name: "Dubai", country: "BAE", lat: 25.2048, lng: 55.2708, timezone: "Asia/Dubai" },
  { name: "Abu Dabi", country: "BAE", lat: 24.4539, lng: 54.3773, timezone: "Asia/Dubai" },
  { name: "Şarja", country: "BAE", lat: 25.3463, lng: 55.4209, timezone: "Asia/Dubai" },
  { name: "Acman", country: "BAE", lat: 25.4052, lng: 55.5136, timezone: "Asia/Dubai" },
  { name: "Ras el-Hayme", country: "BAE", lat: 25.7895, lng: 55.9432, timezone: "Asia/Dubai" },
  { name: "Fujayra", country: "BAE", lat: 25.1288, lng: 56.3265, timezone: "Asia/Dubai" },
  { name: "Ummu'l-Kayveyn", country: "BAE", lat: 25.5647, lng: 55.5532, timezone: "Asia/Dubai" },
  { name: "El-Ayn", country: "BAE", lat: 24.1917, lng: 55.7606, timezone: "Asia/Dubai" },
  
  // Katar
  { name: "Doha", country: "Katar", lat: 25.2854, lng: 51.5310, timezone: "Asia/Qatar" },
  { name: "El-Vakra", country: "Katar", lat: 25.1659, lng: 51.5927, timezone: "Asia/Qatar" },
  { name: "El-Hawr", country: "Katar", lat: 25.6839, lng: 51.5057, timezone: "Asia/Qatar" },
  { name: "Er-Rayyan", country: "Katar", lat: 25.2919, lng: 51.4244, timezone: "Asia/Qatar" },
  { name: "Umm Salal", country: "Katar", lat: 25.4086, lng: 51.4067, timezone: "Asia/Qatar" },
  { name: "Lusail", country: "Katar", lat: 25.4300, lng: 51.4900, timezone: "Asia/Qatar" },
  
  // Kuveyt
  { name: "Kuveyt", country: "Kuveyt", lat: 29.3759, lng: 47.9774, timezone: "Asia/Kuwait" },
  { name: "Havalli", country: "Kuveyt", lat: 29.3327, lng: 48.0285, timezone: "Asia/Kuwait" },
  { name: "Selimiye", country: "Kuveyt", lat: 29.0847, lng: 48.0783, timezone: "Asia/Kuwait" },
  { name: "Sabah es-Salim", country: "Kuveyt", lat: 29.2500, lng: 48.0667, timezone: "Asia/Kuwait" },
  { name: "El-Ahmedi", country: "Kuveyt", lat: 29.0769, lng: 48.0838, timezone: "Asia/Kuwait" },
  { name: "El-Fervaniye", country: "Kuveyt", lat: 29.2717, lng: 47.9583, timezone: "Asia/Kuwait" },
  { name: "El-Cehra", country: "Kuveyt", lat: 29.3375, lng: 47.6581, timezone: "Asia/Kuwait" },
  
  // Bahreyn
  { name: "Manama", country: "Bahreyn", lat: 26.2285, lng: 50.5860, timezone: "Asia/Bahrain" },
  { name: "Riffa", country: "Bahreyn", lat: 26.1300, lng: 50.5550, timezone: "Asia/Bahrain" },
  { name: "Muharrak", country: "Bahreyn", lat: 26.2572, lng: 50.6119, timezone: "Asia/Bahrain" },
  { name: "Hamad", country: "Bahreyn", lat: 26.1142, lng: 50.5031, timezone: "Asia/Bahrain" },
  { name: "A'ali", country: "Bahreyn", lat: 26.1528, lng: 50.5264, timezone: "Asia/Bahrain" },
  { name: "Isa", country: "Bahreyn", lat: 26.1736, lng: 50.5478, timezone: "Asia/Bahrain" },
  
  // Umman
  { name: "Maskat", country: "Umman", lat: 23.5880, lng: 58.3829, timezone: "Asia/Muscat" },
  { name: "Selaile", country: "Umman", lat: 17.0151, lng: 54.0924, timezone: "Asia/Muscat" },
  { name: "Suhar", country: "Umman", lat: 24.3461, lng: 56.7075, timezone: "Asia/Muscat" },
  { name: "İbri", country: "Umman", lat: 23.2256, lng: 56.5161, timezone: "Asia/Muscat" },
  { name: "Seeb", country: "Umman", lat: 23.6700, lng: 58.1894, timezone: "Asia/Muscat" },
  { name: "Sur", country: "Umman", lat: 22.5667, lng: 59.5289, timezone: "Asia/Muscat" },
  { name: "Nizva", country: "Umman", lat: 22.9333, lng: 57.5333, timezone: "Asia/Muscat" },
  { name: "Barka", country: "Umman", lat: 23.7078, lng: 57.8886, timezone: "Asia/Muscat" },
  
  // Yemen
  { name: "Sana", country: "Yemen", lat: 15.3694, lng: 44.1910, timezone: "Asia/Aden" },
  { name: "Aden", country: "Yemen", lat: 12.7855, lng: 45.0187, timezone: "Asia/Aden" },
  { name: "Taiz", country: "Yemen", lat: 13.5789, lng: 44.0219, timezone: "Asia/Aden" },
  { name: "Hudeyde", country: "Yemen", lat: 14.7979, lng: 42.9540, timezone: "Asia/Aden" },
  { name: "Mukalla", country: "Yemen", lat: 14.5425, lng: 49.1283, timezone: "Asia/Aden" },
  { name: "İbb", country: "Yemen", lat: 13.9667, lng: 44.1833, timezone: "Asia/Aden" },
  { name: "Dhamar", country: "Yemen", lat: 14.5500, lng: 44.4000, timezone: "Asia/Aden" },
  { name: "Amran", country: "Yemen", lat: 15.6594, lng: 43.9436, timezone: "Asia/Aden" },
  { name: "Sayun", country: "Yemen", lat: 15.9431, lng: 48.7872, timezone: "Asia/Aden" },
  { name: "Zincibar", country: "Yemen", lat: 13.1283, lng: 45.3817, timezone: "Asia/Aden" },
  
  { name: "Kuala Lumpur", country: "Malezya", lat: 3.1390, lng: 101.6869, timezone: "Asia/Kuala_Lumpur" },
  { name: "Jakarta", country: "Endonezya", lat: -6.2088, lng: 106.8456, timezone: "Asia/Jakarta" },
  { name: "Manila", country: "Filipinler", lat: 14.5995, lng: 120.9842, timezone: "Asia/Manila" },
  { name: "Hanoi", country: "Vietnam", lat: 21.0278, lng: 105.8342, timezone: "Asia/Ho_Chi_Minh" },
  { name: "Taşkent", country: "Özbekistan", lat: 41.2995, lng: 69.2401, timezone: "Asia/Tashkent" },
  
  { name: "Tiflis", country: "Gürcistan", lat: 41.7151, lng: 44.8271, timezone: "Asia/Tbilisi" },
  { name: "Erivan", country: "Ermenistan", lat: 40.1792, lng: 44.4991, timezone: "Asia/Yerevan" },
  { name: "Astana", country: "Kazakistan", lat: 51.1694, lng: 71.4491, timezone: "Asia/Almaty" },
  { name: "Bişkek", country: "Kırgızistan", lat: 42.8746, lng: 74.5698, timezone: "Asia/Bishkek" },
  
  // ===================== AFRİKA =====================
  
  // Kuzey Afrika
  // Mısır
  { name: "Kahire", country: "Mısır", lat: 30.0444, lng: 31.2357, timezone: "Africa/Cairo" },
  { name: "İskenderiye", country: "Mısır", lat: 31.2001, lng: 29.9187, timezone: "Africa/Cairo" },
  { name: "Giza", country: "Mısır", lat: 30.0131, lng: 31.2089, timezone: "Africa/Cairo" },
  { name: "Şarm el-Şeyh", country: "Mısır", lat: 27.9158, lng: 34.3300, timezone: "Africa/Cairo" },
  { name: "Luksor", country: "Mısır", lat: 25.6872, lng: 32.6396, timezone: "Africa/Cairo" },
  { name: "Asvan", country: "Mısır", lat: 24.0889, lng: 32.8998, timezone: "Africa/Cairo" },
  { name: "Port Said", country: "Mısır", lat: 31.2653, lng: 32.3019, timezone: "Africa/Cairo" },
  { name: "Süveyş", country: "Mısır", lat: 29.9668, lng: 32.5498, timezone: "Africa/Cairo" },
  { name: "Hurghada", country: "Mısır", lat: 27.2579, lng: 33.8116, timezone: "Africa/Cairo" },
  
  // Fas
  { name: "Kazablanka", country: "Fas", lat: 33.5731, lng: -7.5898, timezone: "Africa/Casablanca" },
  { name: "Rabat", country: "Fas", lat: 34.0132, lng: -6.8326, timezone: "Africa/Casablanca" },
  { name: "Marakeş", country: "Fas", lat: 31.6295, lng: -7.9811, timezone: "Africa/Casablanca" },
  { name: "Fes", country: "Fas", lat: 34.0181, lng: -5.0078, timezone: "Africa/Casablanca" },
  { name: "Tanca", country: "Fas", lat: 35.7595, lng: -5.8340, timezone: "Africa/Casablanca" },
  { name: "Agadir", country: "Fas", lat: 30.4278, lng: -9.5981, timezone: "Africa/Casablanca" },
  { name: "Meknes", country: "Fas", lat: 33.8731, lng: -5.5407, timezone: "Africa/Casablanca" },
  { name: "Şefşauen", country: "Fas", lat: 35.1714, lng: -5.2697, timezone: "Africa/Casablanca" },
  
  // Cezayir
  { name: "Cezayir", country: "Cezayir", lat: 36.7538, lng: 3.0588, timezone: "Africa/Algiers" },
  { name: "Oran", country: "Cezayir", lat: 35.6969, lng: -0.6331, timezone: "Africa/Algiers" },
  { name: "Konstantin", country: "Cezayir", lat: 36.3650, lng: 6.6147, timezone: "Africa/Algiers" },
  { name: "Annaba", country: "Cezayir", lat: 36.9000, lng: 7.7667, timezone: "Africa/Algiers" },
  { name: "Blida", country: "Cezayir", lat: 36.4700, lng: 2.8300, timezone: "Africa/Algiers" },
  { name: "Setif", country: "Cezayir", lat: 36.1898, lng: 5.4108, timezone: "Africa/Algiers" },
  
  // Tunus
  { name: "Tunus", country: "Tunus", lat: 36.8065, lng: 10.1815, timezone: "Africa/Tunis" },
  { name: "Sfaks", country: "Tunus", lat: 34.7400, lng: 10.7600, timezone: "Africa/Tunis" },
  { name: "Susa", country: "Tunus", lat: 35.8256, lng: 10.6084, timezone: "Africa/Tunis" },
  { name: "Kayrevan", country: "Tunus", lat: 35.6781, lng: 10.0963, timezone: "Africa/Tunis" },
  { name: "Bizerte", country: "Tunus", lat: 37.2744, lng: 9.8739, timezone: "Africa/Tunis" },
  { name: "Hammamet", country: "Tunus", lat: 36.4000, lng: 10.6167, timezone: "Africa/Tunis" },
  { name: "Cerba", country: "Tunus", lat: 33.8076, lng: 10.8451, timezone: "Africa/Tunis" },
  
  // Libya
  { name: "Trablus", country: "Libya", lat: 32.8872, lng: 13.1913, timezone: "Africa/Tripoli" },
  { name: "Bingazi", country: "Libya", lat: 32.1165, lng: 20.0761, timezone: "Africa/Tripoli" },
  { name: "Misrata", country: "Libya", lat: 32.3754, lng: 15.0925, timezone: "Africa/Tripoli" },
  { name: "Sabha", country: "Libya", lat: 27.0377, lng: 14.4283, timezone: "Africa/Tripoli" },
  
  // Batı Afrika
  // Nijerya
  { name: "Lagos", country: "Nijerya", lat: 6.5244, lng: 3.3792, timezone: "Africa/Lagos" },
  { name: "Kano", country: "Nijerya", lat: 12.0022, lng: 8.5920, timezone: "Africa/Lagos" },
  { name: "Ibadan", country: "Nijerya", lat: 7.3775, lng: 3.9470, timezone: "Africa/Lagos" },
  { name: "Abuja", country: "Nijerya", lat: 9.0579, lng: 7.4951, timezone: "Africa/Lagos" },
  { name: "Port Harcourt", country: "Nijerya", lat: 4.8156, lng: 7.0498, timezone: "Africa/Lagos" },
  { name: "Benin City", country: "Nijerya", lat: 6.3350, lng: 5.6037, timezone: "Africa/Lagos" },
  { name: "Kaduna", country: "Nijerya", lat: 10.5222, lng: 7.4383, timezone: "Africa/Lagos" },
  { name: "Enugu", country: "Nijerya", lat: 6.4584, lng: 7.5464, timezone: "Africa/Lagos" },
  
  // Gana
  { name: "Akra", country: "Gana", lat: 5.6037, lng: -0.1870, timezone: "Africa/Accra" },
  { name: "Kumasi", country: "Gana", lat: 6.6885, lng: -1.6244, timezone: "Africa/Accra" },
  { name: "Tamale", country: "Gana", lat: 9.4008, lng: -0.8393, timezone: "Africa/Accra" },
  { name: "Cape Coast", country: "Gana", lat: 5.1053, lng: -1.2466, timezone: "Africa/Accra" },
  
  // Senegal
  { name: "Dakar", country: "Senegal", lat: 14.7167, lng: -17.4677, timezone: "Africa/Dakar" },
  { name: "Thiès", country: "Senegal", lat: 14.7833, lng: -16.9167, timezone: "Africa/Dakar" },
  { name: "Saint-Louis", country: "Senegal", lat: 16.0179, lng: -16.4896, timezone: "Africa/Dakar" },
  { name: "Touba", country: "Senegal", lat: 14.8500, lng: -15.8833, timezone: "Africa/Dakar" },
  
  // Fildişi Sahili
  { name: "Abidjan", country: "Fildişi Sahili", lat: 5.3600, lng: -4.0083, timezone: "Africa/Abidjan" },
  { name: "Yamoussoukro", country: "Fildişi Sahili", lat: 6.8276, lng: -5.2893, timezone: "Africa/Abidjan" },
  { name: "Bouaké", country: "Fildişi Sahili", lat: 7.6881, lng: -5.0308, timezone: "Africa/Abidjan" },
  
  // Mali
  { name: "Bamako", country: "Mali", lat: 12.6392, lng: -8.0029, timezone: "Africa/Bamako" },
  { name: "Timbuktu", country: "Mali", lat: 16.7666, lng: -3.0026, timezone: "Africa/Bamako" },
  { name: "Sikasso", country: "Mali", lat: 11.3167, lng: -5.6667, timezone: "Africa/Bamako" },
  
  // Burkina Faso
  { name: "Ouagadougou", country: "Burkina Faso", lat: 12.3714, lng: -1.5197, timezone: "Africa/Ouagadougou" },
  { name: "Bobo-Dioulasso", country: "Burkina Faso", lat: 11.1771, lng: -4.2979, timezone: "Africa/Ouagadougou" },
  
  // Nijer
  { name: "Niamey", country: "Nijer", lat: 13.5137, lng: 2.1098, timezone: "Africa/Niamey" },
  { name: "Zinder", country: "Nijer", lat: 13.8000, lng: 8.9833, timezone: "Africa/Niamey" },
  
  // Gine
  { name: "Konakri", country: "Gine", lat: 9.6412, lng: -13.5784, timezone: "Africa/Conakry" },
  
  // Sierra Leone
  { name: "Freetown", country: "Sierra Leone", lat: 8.4657, lng: -13.2317, timezone: "Africa/Freetown" },
  
  // Liberya
  { name: "Monrovia", country: "Liberya", lat: 6.3156, lng: -10.8074, timezone: "Africa/Monrovia" },
  
  // Togo
  { name: "Lomé", country: "Togo", lat: 6.1319, lng: 1.2228, timezone: "Africa/Lome" },
  
  // Benin
  { name: "Porto-Novo", country: "Benin", lat: 6.4969, lng: 2.6289, timezone: "Africa/Porto-Novo" },
  { name: "Cotonou", country: "Benin", lat: 6.3654, lng: 2.4183, timezone: "Africa/Porto-Novo" },
  
  // Moritanya
  { name: "Nouakchott", country: "Moritanya", lat: 18.0735, lng: -15.9582, timezone: "Africa/Nouakchott" },
  
  // Yeşil Burun Adaları
  { name: "Praia", country: "Yeşil Burun Adaları", lat: 14.9315, lng: -23.5125, timezone: "Atlantic/Cape_Verde" },
  
  // Gambiya
  { name: "Banjul", country: "Gambiya", lat: 13.4549, lng: -16.5790, timezone: "Africa/Banjul" },
  
  // Gine-Bissau
  { name: "Bissau", country: "Gine-Bissau", lat: 11.8636, lng: -15.5977, timezone: "Africa/Bissau" },
  
  // Orta Afrika
  // Kamerun
  { name: "Yaoundé", country: "Kamerun", lat: 3.8480, lng: 11.5021, timezone: "Africa/Douala" },
  { name: "Douala", country: "Kamerun", lat: 4.0511, lng: 9.7679, timezone: "Africa/Douala" },
  { name: "Garoua", country: "Kamerun", lat: 9.3000, lng: 13.4000, timezone: "Africa/Douala" },
  
  // Kongo Demokratik Cumhuriyeti
  { name: "Kinşasa", country: "Kongo DC", lat: -4.4419, lng: 15.2663, timezone: "Africa/Kinshasa" },
  { name: "Lubumbashi", country: "Kongo DC", lat: -11.6647, lng: 27.4794, timezone: "Africa/Lubumbashi" },
  { name: "Mbuji-Mayi", country: "Kongo DC", lat: -6.1500, lng: 23.6000, timezone: "Africa/Lubumbashi" },
  { name: "Kisangani", country: "Kongo DC", lat: 0.5153, lng: 25.1909, timezone: "Africa/Lubumbashi" },
  { name: "Goma", country: "Kongo DC", lat: -1.6771, lng: 29.2228, timezone: "Africa/Lubumbashi" },
  
  // Kongo Cumhuriyeti
  { name: "Brazzaville", country: "Kongo", lat: -4.2634, lng: 15.2429, timezone: "Africa/Brazzaville" },
  { name: "Pointe-Noire", country: "Kongo", lat: -4.7692, lng: 11.8664, timezone: "Africa/Brazzaville" },
  
  // Angola
  { name: "Luanda", country: "Angola", lat: -8.8390, lng: 13.2894, timezone: "Africa/Luanda" },
  { name: "Huambo", country: "Angola", lat: -12.7761, lng: 15.7392, timezone: "Africa/Luanda" },
  { name: "Lobito", country: "Angola", lat: -12.3644, lng: 13.5361, timezone: "Africa/Luanda" },
  { name: "Benguela", country: "Angola", lat: -12.5763, lng: 13.4055, timezone: "Africa/Luanda" },
  
  // Gabon
  { name: "Libreville", country: "Gabon", lat: 0.4162, lng: 9.4673, timezone: "Africa/Libreville" },
  
  // Ekvator Ginesi
  { name: "Malabo", country: "Ekvator Ginesi", lat: 3.7504, lng: 8.7371, timezone: "Africa/Malabo" },
  
  // Orta Afrika Cumhuriyeti
  { name: "Bangui", country: "Orta Afrika Cumhuriyeti", lat: 4.3947, lng: 18.5582, timezone: "Africa/Bangui" },
  
  // Çad
  { name: "N'Djamena", country: "Çad", lat: 12.1348, lng: 15.0557, timezone: "Africa/Ndjamena" },
  
  // Doğu Afrika
  // Kenya
  { name: "Nairobi", country: "Kenya", lat: -1.2921, lng: 36.8219, timezone: "Africa/Nairobi" },
  { name: "Mombasa", country: "Kenya", lat: -4.0435, lng: 39.6682, timezone: "Africa/Nairobi" },
  { name: "Kisumu", country: "Kenya", lat: -0.1022, lng: 34.7617, timezone: "Africa/Nairobi" },
  { name: "Nakuru", country: "Kenya", lat: -0.3031, lng: 36.0800, timezone: "Africa/Nairobi" },
  { name: "Eldoret", country: "Kenya", lat: 0.5143, lng: 35.2698, timezone: "Africa/Nairobi" },
  
  // Etiyopya
  { name: "Addis Ababa", country: "Etiyopya", lat: 9.0320, lng: 38.7469, timezone: "Africa/Addis_Ababa" },
  { name: "Dire Dawa", country: "Etiyopya", lat: 9.6009, lng: 41.8540, timezone: "Africa/Addis_Ababa" },
  { name: "Mekelle", country: "Etiyopya", lat: 13.4967, lng: 39.4753, timezone: "Africa/Addis_Ababa" },
  { name: "Gondar", country: "Etiyopya", lat: 12.6000, lng: 37.4667, timezone: "Africa/Addis_Ababa" },
  { name: "Bahir Dar", country: "Etiyopya", lat: 11.5936, lng: 37.3908, timezone: "Africa/Addis_Ababa" },
  { name: "Lalibela", country: "Etiyopya", lat: 12.0312, lng: 39.0472, timezone: "Africa/Addis_Ababa" },
  
  // Tanzanya
  { name: "Dar es Salaam", country: "Tanzanya", lat: -6.7924, lng: 39.2083, timezone: "Africa/Dar_es_Salaam" },
  { name: "Dodoma", country: "Tanzanya", lat: -6.1630, lng: 35.7516, timezone: "Africa/Dar_es_Salaam" },
  { name: "Zanzibar", country: "Tanzanya", lat: -6.1659, lng: 39.2026, timezone: "Africa/Dar_es_Salaam" },
  { name: "Arusha", country: "Tanzanya", lat: -3.3869, lng: 36.6830, timezone: "Africa/Dar_es_Salaam" },
  { name: "Mwanza", country: "Tanzanya", lat: -2.5167, lng: 32.9000, timezone: "Africa/Dar_es_Salaam" },
  
  // Uganda
  { name: "Kampala", country: "Uganda", lat: 0.3476, lng: 32.5825, timezone: "Africa/Kampala" },
  { name: "Entebbe", country: "Uganda", lat: 0.0612, lng: 32.4633, timezone: "Africa/Kampala" },
  { name: "Jinja", country: "Uganda", lat: 0.4244, lng: 33.2041, timezone: "Africa/Kampala" },
  
  // Ruanda
  { name: "Kigali", country: "Ruanda", lat: -1.9403, lng: 29.8739, timezone: "Africa/Kigali" },
  { name: "Butare", country: "Ruanda", lat: -2.5967, lng: 29.7386, timezone: "Africa/Kigali" },
  
  // Burundi
  { name: "Bujumbura", country: "Burundi", lat: -3.3822, lng: 29.3644, timezone: "Africa/Bujumbura" },
  
  // Somali
  { name: "Mogadişu", country: "Somali", lat: 2.0469, lng: 45.3182, timezone: "Africa/Mogadishu" },
  { name: "Hargeisa", country: "Somali", lat: 9.5600, lng: 44.0650, timezone: "Africa/Mogadishu" },
  
  // Eritre
  { name: "Asmara", country: "Eritre", lat: 15.3229, lng: 38.9251, timezone: "Africa/Asmara" },
  
  // Cibuti
  { name: "Cibuti", country: "Cibuti", lat: 11.5883, lng: 43.1456, timezone: "Africa/Djibouti" },
  
  // Sudan
  { name: "Hartum", country: "Sudan", lat: 15.5007, lng: 32.5599, timezone: "Africa/Khartoum" },
  { name: "Omdurman", country: "Sudan", lat: 15.6445, lng: 32.4777, timezone: "Africa/Khartoum" },
  { name: "Port Sudan", country: "Sudan", lat: 19.6158, lng: 37.2164, timezone: "Africa/Khartoum" },
  
  // Güney Sudan
  { name: "Juba", country: "Güney Sudan", lat: 4.8594, lng: 31.5713, timezone: "Africa/Juba" },
  
  // Güney Afrika
  // Güney Afrika Cumhuriyeti
  { name: "Cape Town", country: "Güney Afrika", lat: -33.9249, lng: 18.4241, timezone: "Africa/Johannesburg" },
  { name: "Johannesburg", country: "Güney Afrika", lat: -26.2041, lng: 28.0473, timezone: "Africa/Johannesburg" },
  { name: "Durban", country: "Güney Afrika", lat: -29.8587, lng: 31.0218, timezone: "Africa/Johannesburg" },
  { name: "Pretoria", country: "Güney Afrika", lat: -25.7479, lng: 28.2293, timezone: "Africa/Johannesburg" },
  { name: "Port Elizabeth", country: "Güney Afrika", lat: -33.9608, lng: 25.6022, timezone: "Africa/Johannesburg" },
  { name: "Bloemfontein", country: "Güney Afrika", lat: -29.0852, lng: 26.1596, timezone: "Africa/Johannesburg" },
  { name: "East London", country: "Güney Afrika", lat: -33.0153, lng: 27.9116, timezone: "Africa/Johannesburg" },
  { name: "Pietermaritzburg", country: "Güney Afrika", lat: -29.6006, lng: 30.3794, timezone: "Africa/Johannesburg" },
  
  // Zimbabwe
  { name: "Harare", country: "Zimbabwe", lat: -17.8252, lng: 31.0335, timezone: "Africa/Harare" },
  { name: "Bulawayo", country: "Zimbabwe", lat: -20.1325, lng: 28.6265, timezone: "Africa/Harare" },
  { name: "Victoria Falls", country: "Zimbabwe", lat: -17.9243, lng: 25.8572, timezone: "Africa/Harare" },
  
  // Zambiya
  { name: "Lusaka", country: "Zambiya", lat: -15.3875, lng: 28.3228, timezone: "Africa/Lusaka" },
  { name: "Livingstone", country: "Zambiya", lat: -17.8419, lng: 25.8601, timezone: "Africa/Lusaka" },
  { name: "Kitwe", country: "Zambiya", lat: -12.8125, lng: 28.2137, timezone: "Africa/Lusaka" },
  
  // Mozambik
  { name: "Maputo", country: "Mozambik", lat: -25.9692, lng: 32.5732, timezone: "Africa/Maputo" },
  { name: "Beira", country: "Mozambik", lat: -19.8436, lng: 34.8389, timezone: "Africa/Maputo" },
  { name: "Nampula", country: "Mozambik", lat: -15.1166, lng: 39.2666, timezone: "Africa/Maputo" },
  
  // Botsvana
  { name: "Gaborone", country: "Botsvana", lat: -24.6282, lng: 25.9231, timezone: "Africa/Gaborone" },
  { name: "Francistown", country: "Botsvana", lat: -21.1667, lng: 27.5167, timezone: "Africa/Gaborone" },
  { name: "Maun", country: "Botsvana", lat: -19.9833, lng: 23.4167, timezone: "Africa/Gaborone" },
  
  // Namibya
  { name: "Windhoek", country: "Namibya", lat: -22.5609, lng: 17.0658, timezone: "Africa/Windhoek" },
  { name: "Walvis Bay", country: "Namibya", lat: -22.9575, lng: 14.5053, timezone: "Africa/Windhoek" },
  { name: "Swakopmund", country: "Namibya", lat: -22.6792, lng: 14.5256, timezone: "Africa/Windhoek" },
  
  // Malavi
  { name: "Lilongwe", country: "Malavi", lat: -13.9626, lng: 33.7741, timezone: "Africa/Blantyre" },
  { name: "Blantyre", country: "Malavi", lat: -15.7861, lng: 35.0058, timezone: "Africa/Blantyre" },
  
  // Lesotho
  { name: "Maseru", country: "Lesotho", lat: -29.3167, lng: 27.4833, timezone: "Africa/Maseru" },
  
  // Esvatini (Svaziland)
  { name: "Mbabane", country: "Esvatini", lat: -26.3054, lng: 31.1367, timezone: "Africa/Mbabane" },
  
  // Madagaskar
  { name: "Antananarivo", country: "Madagaskar", lat: -18.8792, lng: 47.5079, timezone: "Indian/Antananarivo" },
  { name: "Toamasina", country: "Madagaskar", lat: -18.1492, lng: 49.4023, timezone: "Indian/Antananarivo" },
  { name: "Antsirabe", country: "Madagaskar", lat: -19.8659, lng: 47.0333, timezone: "Indian/Antananarivo" },
  { name: "Nosy Be", country: "Madagaskar", lat: -13.3167, lng: 48.2667, timezone: "Indian/Antananarivo" },
  
  // Mauritius
  { name: "Port Louis", country: "Mauritius", lat: -20.1609, lng: 57.5012, timezone: "Indian/Mauritius" },
  
  // Seyşeller
  { name: "Victoria", country: "Seyşeller", lat: -4.6191, lng: 55.4513, timezone: "Indian/Mahe" },
  
  // Komorlar
  { name: "Moroni", country: "Komorlar", lat: -11.7022, lng: 43.2551, timezone: "Indian/Comoro" },
  
  // Réunion
  { name: "Saint-Denis", country: "Réunion", lat: -20.8789, lng: 55.4481, timezone: "Indian/Reunion" },
  
  // ===================== OKYANUSYA =====================
  
  // Avustralya
  { name: "Sidney", country: "Avustralya", lat: -33.8688, lng: 151.2093, timezone: "Australia/Sydney" },
  { name: "Melbourne", country: "Avustralya", lat: -37.8136, lng: 144.9631, timezone: "Australia/Melbourne" },
  { name: "Brisbane", country: "Avustralya", lat: -27.4698, lng: 153.0251, timezone: "Australia/Brisbane" },
  { name: "Perth", country: "Avustralya", lat: -31.9505, lng: 115.8605, timezone: "Australia/Perth" },
  { name: "Adelaide", country: "Avustralya", lat: -34.9285, lng: 138.6007, timezone: "Australia/Adelaide" },
  { name: "Gold Coast", country: "Avustralya", lat: -28.0167, lng: 153.4000, timezone: "Australia/Brisbane" },
  { name: "Canberra", country: "Avustralya", lat: -35.2809, lng: 149.1300, timezone: "Australia/Sydney" },
  { name: "Newcastle", country: "Avustralya", lat: -32.9283, lng: 151.7817, timezone: "Australia/Sydney" },
  { name: "Hobart", country: "Avustralya", lat: -42.8821, lng: 147.3272, timezone: "Australia/Hobart" },
  { name: "Darwin", country: "Avustralya", lat: -12.4634, lng: 130.8456, timezone: "Australia/Darwin" },
  { name: "Cairns", country: "Avustralya", lat: -16.9186, lng: 145.7781, timezone: "Australia/Brisbane" },
  { name: "Townsville", country: "Avustralya", lat: -19.2590, lng: 146.8169, timezone: "Australia/Brisbane" },
  { name: "Alice Springs", country: "Avustralya", lat: -23.6980, lng: 133.8807, timezone: "Australia/Darwin" },
  
  // Yeni Zelanda
  { name: "Auckland", country: "Yeni Zelanda", lat: -36.8509, lng: 174.7645, timezone: "Pacific/Auckland" },
  { name: "Wellington", country: "Yeni Zelanda", lat: -41.2866, lng: 174.7756, timezone: "Pacific/Auckland" },
  { name: "Christchurch", country: "Yeni Zelanda", lat: -43.5321, lng: 172.6362, timezone: "Pacific/Auckland" },
  { name: "Hamilton", country: "Yeni Zelanda", lat: -37.7870, lng: 175.2793, timezone: "Pacific/Auckland" },
  { name: "Tauranga", country: "Yeni Zelanda", lat: -37.6878, lng: 176.1651, timezone: "Pacific/Auckland" },
  { name: "Dunedin", country: "Yeni Zelanda", lat: -45.8788, lng: 170.5028, timezone: "Pacific/Auckland" },
  { name: "Queenstown", country: "Yeni Zelanda", lat: -45.0312, lng: 168.6626, timezone: "Pacific/Auckland" },
  { name: "Rotorua", country: "Yeni Zelanda", lat: -38.1368, lng: 176.2497, timezone: "Pacific/Auckland" },
  
  // Papua Yeni Gine
  { name: "Port Moresby", country: "Papua Yeni Gine", lat: -9.4438, lng: 147.1803, timezone: "Pacific/Port_Moresby" },
  { name: "Lae", country: "Papua Yeni Gine", lat: -6.7228, lng: 147.0026, timezone: "Pacific/Port_Moresby" },
  
  // Fiji
  { name: "Suva", country: "Fiji", lat: -18.1416, lng: 178.4419, timezone: "Pacific/Fiji" },
  { name: "Nadi", country: "Fiji", lat: -17.7765, lng: 177.4356, timezone: "Pacific/Fiji" },
  
  // Solomon Adaları
  { name: "Honiara", country: "Solomon Adaları", lat: -9.4456, lng: 159.9729, timezone: "Pacific/Guadalcanal" },
  
  // Vanuatu
  { name: "Port Vila", country: "Vanuatu", lat: -17.7333, lng: 168.3167, timezone: "Pacific/Efate" },
  
  // Yeni Kaledonya
  { name: "Nouméa", country: "Yeni Kaledonya", lat: -22.2758, lng: 166.4580, timezone: "Pacific/Noumea" },
  
  // Samoa
  { name: "Apia", country: "Samoa", lat: -13.8333, lng: -171.7500, timezone: "Pacific/Apia" },
  
  // Tonga
  { name: "Nuku'alofa", country: "Tonga", lat: -21.2114, lng: -175.1998, timezone: "Pacific/Tongatapu" },
  
  // Fransız Polinezyası
  { name: "Papeete", country: "Fransız Polinezyası", lat: -17.5516, lng: -149.5585, timezone: "Pacific/Tahiti" },
  { name: "Bora Bora", country: "Fransız Polinezyası", lat: -16.5004, lng: -151.7415, timezone: "Pacific/Tahiti" },
  
  // Kiribati
  { name: "Tarawa", country: "Kiribati", lat: 1.3278, lng: 172.9770, timezone: "Pacific/Tarawa" },
  
  // Mikronezya
  { name: "Palikir", country: "Mikronezya", lat: 6.9248, lng: 158.1610, timezone: "Pacific/Pohnpei" },
  
  // Marshall Adaları
  { name: "Majuro", country: "Marshall Adaları", lat: 7.0897, lng: 171.3803, timezone: "Pacific/Majuro" },
  
  // Palau
  { name: "Ngerulmud", country: "Palau", lat: 7.5006, lng: 134.6243, timezone: "Pacific/Palau" },
  
  // Nauru
  { name: "Yaren", country: "Nauru", lat: -0.5477, lng: 166.9209, timezone: "Pacific/Nauru" },
  
  // Tuvalu
  { name: "Funafuti", country: "Tuvalu", lat: -8.5211, lng: 179.1983, timezone: "Pacific/Funafuti" },
  
  // Guam
  { name: "Hagåtña", country: "Guam", lat: 13.4443, lng: 144.7937, timezone: "Pacific/Guam" },
  
  // Kuzey Mariana Adaları
  { name: "Saipan", country: "Kuzey Mariana Adaları", lat: 15.1801, lng: 145.7496, timezone: "Pacific/Guam" },
];

// Tüm şehirler birleşik
export const ALL_CITIES: City[] = [...TURKEY_CITIES, ...WORLD_CITIES];

// Şehir arama fonksiyonu
export const searchCities = (query: string): City[] => {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return ALL_CITIES.filter(city => 
    city.name.toLowerCase().includes(normalizedQuery) ||
    city.country.toLowerCase().includes(normalizedQuery)
  ).slice(0, 20); // Maksimum 20 sonuç
};

// Popüler şehirler (hızlı seçim için)
export const POPULAR_CITIES: City[] = [
  ALL_CITIES.find(c => c.name === "İstanbul")!,
  ALL_CITIES.find(c => c.name === "Ankara")!,
  ALL_CITIES.find(c => c.name === "İzmir")!,
  ALL_CITIES.find(c => c.name === "Antalya")!,
  ALL_CITIES.find(c => c.name === "Bursa")!,
  ALL_CITIES.find(c => c.name === "Londra")!,
  ALL_CITIES.find(c => c.name === "Berlin")!,
  ALL_CITIES.find(c => c.name === "Paris")!,
  ALL_CITIES.find(c => c.name === "New York")!,
  ALL_CITIES.find(c => c.name === "Dubai")!,
].filter(Boolean);
