import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ZodiacSign } from '../types/zodiac';
import { getRefreshToken, getToken, removeAllTokens, saveRefreshToken, saveToken } from '../utils/tokenStorage';

// NGROK URL'i - değişebilir
const NGROK_URL = 'https://d26bb732480c.ngrok-free.app';

// Alternative endpoints (gerektiğinde eklenebilir)
const FALLBACK_URLS: string[] = [
  // Buraya alternatif URL'ler eklenebilir
  // 'https://your-backend.herokuapp.com',
  // 'https://api.yourdomain.com',
];

// Aktif API URL
let API_URL = NGROK_URL;

console.log('🔗 [API CONFIG] Base URL:', API_URL);

// Network durumunu kontrol eden fonksiyon
const checkNetworkHealth = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 saniye timeout
    
    const response = await fetch(`${url}/health`, { 
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn(`[NETWORK CHECK] ${url} erişilemez:`, error);
    return false;
  }
};

// En iyi URL'i bulan fonksiyon
const findBestApiUrl = async (): Promise<string> => {
  // Önce ana URL'i dene
  const mainUrlWorks = await checkNetworkHealth(NGROK_URL);
  if (mainUrlWorks) {
    return NGROK_URL;
  }

  // Fallback URL'leri dene
  for (const fallbackUrl of FALLBACK_URLS) {
    const works = await checkNetworkHealth(fallbackUrl);
    if (works) {
      console.log(`[API FAILOVER] ${fallbackUrl} kullanılıyor`);
      return fallbackUrl;
    }
  }

  // Hiçbiri çalışmıyorsa ana URL'i döndür (hata mesajı için)
  console.error('[API FAILOVER] Hiçbir endpoint erişilebilir değil');
  return NGROK_URL;
};

// API isteği için bir axios örneği oluşturuluyor
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 saniye timeout (artırıldı)
});

// Dynamic base URL güncelleme
const updateApiBaseUrl = async () => {
  const bestUrl = await findBestApiUrl();
  if (bestUrl !== API_URL) {
    API_URL = bestUrl;
    api.defaults.baseURL = bestUrl;
    console.log(`[API UPDATE] Base URL güncellendi: ${bestUrl}`);
  }
};

// İstek/yanıt durumlarını kontrol eden interceptor'lar
api.interceptors.request.use(
  async (config) => {
    console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// Token yenileme işlemi için global flag (döngüyü engellemek için)
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  async (response) => {
    console.log(`[API RESPONSE] ${response.status} ${response.config.url}`);
    
    // Response header'larında yeni token kontrolü
    const newToken = response.headers['x-new-token'];
    const tokenRefreshed = response.headers['x-token-refreshed'];
    
    if (newToken && tokenRefreshed === 'true') {
      console.log('🔄 [API] Token otomatik yenilendi (response header)');
      
      // Yeni token'ı kaydet
      await saveToken(newToken);
      
      // Opsiyonel: Kullanıcıya bildirim (kaldırabilirsiniz)
      // console.log('✅ [API] Token yenilendi');
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // 401 hatası ve henüz retry yapılmamışsa
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Zaten yenileme yapılıyorsa, kuyruğa ekle
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (token) {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          }
          return Promise.reject(error);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 [API] 401 hatası - Token yenileniyor...');
        const refreshToken = await getRefreshToken();
        
        if (!refreshToken) {
          throw new Error('Refresh token bulunamadı');
        }
        
        // Refresh token endpoint'ini çağır
        const response = await api.post('/api/auth/refresh', { refreshToken });
        
        // Yeni token'ları kaydet
        if (response.data?.token) {
          await saveToken(response.data.token);
          
          if (response.data?.refreshToken) {
            await saveRefreshToken(response.data.refreshToken);
          }
          
          // Başarılı kuyruğu işle
          processQueue(null, response.data.token);
          
          // Orijinal isteği yeni token ile tekrar yap
          originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;
          console.log('✅ [API] Token yenilendi, istek tekrarlanıyor');
          return api(originalRequest);
        }
        
        throw new Error('Token yenileme başarısız');
        
      } catch (refreshError) {
        console.error('❌ [API] Token yenileme hatası:', refreshError);
        
        // Refresh token geçersizse tüm token'ları temizle
        await removeAllTokens();
        
        // Başarısız kuyruğu işle
        processQueue(refreshError, null);
        
        // Logout alert flag'i set et
        try {
          await AsyncStorage.setItem('logout_alert_needed', 'true');
        } catch (error) {
          console.error('❌ [API] Logout alert flag set hatası:', error);
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Diğer hatalar için mevcut logic
    if (error.response) {
      console.error(`[API RESPONSE ERROR] ${error.response.status}`, error.response.data);
    } else if (error.request) {
      console.error('[API REQUEST FAILED]', error.request);
      
      // Network hatası varsa, URL'i yeniden kontrol et
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        console.log('[API RETRY] Network hatası, alternative URL deneniyor...');
        await updateApiBaseUrl();
      }
    } else {
      console.error('[API ERROR]', error.message);
    }
    return Promise.reject(error);
  }
);

// Mock data için fallback fonksiyonları
const createMockUserProfile = (): UserProfileResponse => ({
  id: 1,
  username: 'demo_user',
  email: 'demo@example.com',
  firstName: 'Demo',
  lastName: 'User',
  birthDate: '1995-06-15',
  gender: 'MALE',
  zodiacSign: ZodiacSign.GEMINI,
  zodiacSignTurkish: 'İkizler',
  zodiacSignEmoji: '♊',
  zodiacSignDisplayName: '♊ İkizler',
  profileImageUrl: null,
  bio: 'Demo kullanıcı profili - Backend bağlantısı kuruluyor...'
});

// API için veri türleri
export interface RegisterRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  password: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface RegisterMusicRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
}

export interface ConfirmZodiacRequest {
  userId: number;
  zodiacSign: ZodiacSign | string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: UserProfileResponse;
  success?: boolean; // Persistent login için
}

export interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  zodiacSign: ZodiacSign | string;
  zodiacSignTurkish?: string;
  zodiacSignEmoji?: string;
  zodiacSignDisplayName?: string;
  profileImageUrl: string | null;
  bio: string | null;
}

export interface AccountUpdateRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  bio?: string;
}

export interface PhotoResponse {
  id: number;
  url: string;
  publicId: string;
  uploadedAt: string;
  isProfilePhoto: boolean;
  displayOrder: number;
  description?: string | null;
}

export interface PhotoOrderRequest {
  photoIds: string[];
}

export interface PhotoDescriptionRequest {
  description: string;
}

// Premium işlemleri için interface'ler
export interface PremiumFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface PremiumStatus {
  isPremium: boolean;
  premiumExpiresAt: string | null;
  premiumFeatures: {
    unlimitedSwipes: boolean;
    seeWhoLikedYou: boolean;
    advancedFilters: boolean;
    priorityMatching: boolean;
  };
  remainingSwipes?: number;
  totalSwipes?: number;
  nextResetTime?: string;
}

export interface PremiumStatusResponse {
  success: boolean;
  data: PremiumStatus;
}

export interface PremiumPurchaseRequest {
  plan: 'monthly' | 'yearly';
  paymentMethod: string;
}

export interface PremiumPurchaseResponse {
  success: boolean;
  message: string;
  premiumUntil: string;
}

export interface PremiumCancelResponse {
  success: boolean;
  message: string;
}

// Beğeni işlemleri için interface'ler
export interface UserWhoLikedMe {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  age: number;
  profileImageUrl: string;
  zodiacSign: string;
  compatibilityScore: number;
  lastActiveTime?: string;
  location?: string;
}

export interface UsersWhoLikedMeResponse {
  success: boolean;
  users: UserWhoLikedMe[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  limit: number;
  message?: string;
}

// Çıkış isteği için interface
export interface LogoutResponse {
  success: boolean;
  message: string;
}

// Swipe ve Match API'leri için interface'ler
export interface PotentialMatch {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  age: number;
  profileImageUrl: string | null;
  photos: string[];
  bio: string | null;
  zodiacSign: ZodiacSign | string;
  compatibilityScore: number;
  compatibilityDescription: string;
  compatibilityMessage?: string;
  distance?: number;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface SwipeRequest {
  toUserId?: number;
  targetUserId?: string;
  action: 'LIKE' | 'DISLIKE';
}

export interface SwipeResponse {
  success: boolean;
  isMatch: boolean;
  status: 'LIKED' | 'DISLIKED' | 'MATCHED';
  matchId?: number;
  remainingSwipes?: number;
  message: string;
  resetInfo?: {
    nextResetTime: string;
    hoursUntilReset: number;
    minutesUntilReset: number;
    secondsUntilReset: number;
    totalSecondsUntilReset: number;
    resetMessage: string;
  };
}

export interface Match {
  id: number;
  matchedUser: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    age: number;
    profileImageUrl: string | null;
    zodiacSign: ZodiacSign | string;
  };
  compatibilityScore: number;
  compatibilityDescription: string;
  matchType: 'ZODIAC' | 'MUSIC' | 'GENERAL';
  matchedAt: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

export interface HighCompatibilityMatchesResponse {
  matches: Match[];
  totalCount: number;
}

export interface PotentialMatchesResponse {
  users: PotentialMatch[];
  totalCount: number;
  hasMore: boolean;
}

export interface PhotoItem {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  uploadDate: string;
}

export interface UserActivity {
  activityType: string;
  description: string;
  timestamp: string;
}

export interface SwipeLimitInfo {
  isPremium: boolean;
  remainingSwipes: number;
  dailySwipeCount: number;
  canSwipe: boolean;
  resetInfo?: {
    nextResetTime: string;
    hoursUntilReset: number;
    minutesUntilReset: number;
    secondsUntilReset: number;
    totalSecondsUntilReset: number;
    resetMessage: string;
  };
}

export interface DiscoverUser {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  zodiacSign: string;
  profileImageUrl: string | null;
  photos: Array<{ imageUrl: string }>;
  compatibilityScore: number;
  compatibilityDescription: string;
  isOnline?: boolean;
  distance?: number;
  bio?: string;
  isVerified?: boolean;
  isPremium?: boolean;
  isNewUser?: boolean;
}

export interface DiscoverResponse {
  success: boolean;
  users: DiscoverUser[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  limit: number;
  swipeLimitInfo: SwipeLimitInfo;
  message?: string;
}

// API'yi kullanırken gerekli token header'larını oluşturur
const createAuthHeader = async () => {
  try {
    const token = await getToken();
    const refreshToken = await getRefreshToken();
    
    console.log('🔑 [API] Token kontrolü:', {
      hasAccessToken: !!token,
      hasRefreshToken: !!refreshToken
    });
    
    if (!token) {
      throw new Error('Token bulunamadı');
    }
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Refresh token varsa X-Refresh-Token header'ını ekle
    if (refreshToken) {
      headers['X-Refresh-Token'] = refreshToken;
    }
    
    return { headers };
  } catch (error) {
    console.error('❌ [API] Token oluşturma hatası:', error);
    throw error;
  }
};

// Kullanıcı işlemleri için API
export const authApi = {
  // Burç modunda kayıt ol
  async register(data: RegisterRequest): Promise<any> {
    return api.post('/api/auth/register', data);
  },
  
  // Müzik modunda kayıt ol
  async registerMusic(data: RegisterMusicRequest): Promise<any> {
    return api.post('/api/auth/register-music', data);
  },
  
  // Burç onaylama
  async confirmZodiac(data: ConfirmZodiacRequest): Promise<any> {
    return api.post(`/api/users/${data.userId}/zodiac-confirmation`, { 
      zodiacSign: data.zodiacSign 
    });
  },
  
  // Giriş yapma
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/api/auth/login', data);
    
    // JWT token ve refresh token varsa saklama işlemi 
    if (response.data?.token) {
      await saveToken(response.data.token);
    }
    
    if (response.data?.refreshToken) {
      await saveRefreshToken(response.data.refreshToken);
    }
    
    return response.data;
  },
  
  // Token yenileme
  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const refreshToken = await getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('Refresh token bulunamadı');
      }
      
      const response = await api.post('/api/auth/refresh', { refreshToken });
      
      // Yeni token'ları kaydet
      if (response.data?.token) {
        await saveToken(response.data.token);
      }
      
      if (response.data?.refreshToken) {
        await saveRefreshToken(response.data.refreshToken);
      }
      
      console.log('🔄 [API] Token başarıyla yenilendi');
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] Token yenileme hatası:', error);
      // Refresh token geçersizse tüm token'ları temizle
      await removeAllTokens();
      throw error;
    }
  },
  
  // Otomatik giriş yapma (persistent login)
  async persistentLogin(): Promise<LoginResponse> {
    try {
      const refreshToken = await getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('Refresh token bulunamadı');
      }
      
      console.log('🔄 [API] Persistent login deneniyor...');
      
      const response = await api.post('/api/auth/persistent-login', {
        refreshToken: refreshToken
      });
      
      if (response.data?.success && response.data?.token) {
        // Yeni token'ı kaydet
        await saveToken(response.data.token);
        
        // Refresh token da varsa güncelle
        if (response.data?.refreshToken) {
          await saveRefreshToken(response.data.refreshToken);
        }
        
        console.log('✅ [API] Persistent login başarılı');
        return response.data;
      }
      
      throw new Error('Persistent login başarısız');
    } catch (error: any) {
      console.log('❌ [API] Persistent login hatası:', error.message);
      
      // Geçersiz refresh token'ı temizle
      await removeAllTokens();
      
      throw error;
    }
  },

  // Çıkış yapma
  logout: async (): Promise<LogoutResponse> => {
    try {
      const response = await api.post('/api/auth/logout');
      
      // Çıkış sonrası tüm token'ları temizle
      await removeAllTokens();
      
      return response.data;
    } catch (error) {
      // Hata olsa bile token'ları temizle
      await removeAllTokens();
      throw error;
    }
  }
};

// Kullanıcı profili işlemleri için API
export const userApi = {
  // Kullanıcı kendi profilini getirme
  async getProfile(): Promise<UserProfileResponse> {
    const authHeader = await createAuthHeader();
    const response = await api.get('/api/users/profile', authHeader);
    return response.data;
  },
  
  // Belirli bir kullanıcının profilini getirme
  async getUserProfile(userId: number): Promise<UserProfileResponse> {
    const authHeader = await createAuthHeader();
    const response = await api.get(`/api/users/profile/${userId}`, authHeader);
    return response.data;
  },
  
  // Hesap bilgilerini güncelleme
  async updateAccount(data: AccountUpdateRequest): Promise<UserProfileResponse> {
    const authHeader = await createAuthHeader();
    const response = await api.put('/api/users/account', data, authHeader);
    return response.data;
  },
  
  // Profil fotoğrafı yükleme
  async uploadProfileImage(imageFile: FormData): Promise<any> {
    const token = await getToken();
    if (!token) {
      throw new Error('Oturum açık değil');
    }
    
    const response = await api.post('/api/users/profile/image', imageFile, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  // Profil fotoğrafını silme
  async deleteProfileImage(): Promise<any> {
    const authHeader = await createAuthHeader();
    const response = await api.delete('/api/users/profile/image', authHeader);
    return response.data;
  },
  
  // Kullanıcı fotoğraflarını listeleme
  async getPhotos(): Promise<PhotoResponse[]> {
    const authHeader = await createAuthHeader();
    const response = await api.get('/api/images/list', authHeader);
    return response.data.photos;
  },
  
  // Belirli bir kullanıcının fotoğraflarını listeleme
  async getUserPhotos(userId: number): Promise<PhotoResponse[]> {
    const authHeader = await createAuthHeader();
    const response = await api.get(`/api/images/user/${userId}`, authHeader);
    return response.data.photos;
  },
  
  // Yeni fotoğraf yükleme
  async uploadPhoto(photoFile: FormData): Promise<PhotoResponse> {
    const token = await getToken();
    if (!token) {
      throw new Error('Oturum açık değil');
    }
    
    const response = await api.post('/api/images/upload', photoFile, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  // Fotoğraf silme
  async deletePhoto(publicId: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!publicId) {
        throw new Error('Fotoğraf ID\'si gereklidir');
      }

      const authHeader = await createAuthHeader();
      const response = await api.delete(`/api/images/delete/${publicId}`, authHeader);
      
      return {
        success: true,
        message: 'Fotoğraf başarıyla silindi'
      };
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Fotoğraf silinirken bir hata oluştu');
      } else if (error.request) {
        throw new Error('Sunucuya ulaşılamıyor');
      } else {
        throw new Error(error.message || 'Beklenmeyen bir hata oluştu');
      }
    }
  },
  
  // Fotoğrafı profil fotoğrafı olarak ayarlama
  async setAsProfilePhoto(photoId: number): Promise<any> {
    const authHeader = await createAuthHeader();
    const response = await api.post(`/api/images/set-profile-photo/${photoId}`, {}, authHeader);
    return response.data;
  },
  
  // Fotoğrafların sırasını güncelleme
  async updatePhotoOrder(data: PhotoOrderRequest): Promise<any> {
    const authHeader = await createAuthHeader();
    const response = await api.put('/api/images/order', data, authHeader);
    return response.data;
  },
  
  // Fotoğraf açıklamasını güncelleme
  async updatePhotoDescription(photoId: string, data: PhotoDescriptionRequest): Promise<any> {
    const authHeader = await createAuthHeader();
    const response = await api.put(`/api/images/${photoId}/description`, data, authHeader);
    return response.data;
  },

  getDiscoverUsers: async (page: number = 1, limit: number = 10, refresh: boolean = false): Promise<DiscoverResponse> => {
    const authHeader = await createAuthHeader();
    const response = await api.get(`/api/swipes/discover?page=${page}&limit=${limit}&refresh=${refresh}`, authHeader);
    return response.data;
  },

  getUsersWhoLikedMe: async (page: number, limit: number): Promise<UsersWhoLikedMeResponse> => {
    const authHeader = await createAuthHeader();
    const response = await api.get(`/api/swipes/users-who-liked-me?page=${page}&limit=${limit}`, authHeader);
    return response.data;
  },

  getPremiumStatus: async (): Promise<PremiumStatusResponse> => {
    const authHeader = await createAuthHeader();
    const response = await api.get('/api/premium/status', authHeader);
    return response.data;
  },

  swipe: async (data: SwipeRequest): Promise<SwipeResponse> => {
    const authHeader = await createAuthHeader();
    
    console.log('🔄 [API] userApi.swipe çağrısı:', data);
    console.log('🔧 [API] userApi.swipe headers:', {
      hasAuth: !!authHeader.headers['Authorization'],
      hasRefreshToken: !!authHeader.headers['X-Refresh-Token']
    });
    
    try {
      const response = await api.post('/api/swipes', data, authHeader);
      console.log('✅ [API] userApi.swipe yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] userApi.swipe hatası:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 403) {
        console.error('🔒 [API] userApi.swipe 403 Forbidden:', {
          headers: error.response.headers,
          data: error.response.data
        });
      }
      
      throw error;
    }
  },
};

// Premium işlemleri için API
export const premiumApi = {
  // Premium özelliklerini ve durumunu getirme
  async getFeatures(): Promise<PremiumStatus> {
    const authHeader = await createAuthHeader();
    const response = await api.get('/api/premium/features', authHeader);
    return response.data;
  },
  
  // Premium satın alma
  async purchase(data: PremiumPurchaseRequest): Promise<PremiumPurchaseResponse> {
    const authHeader = await createAuthHeader();
    const response = await api.post('/api/premium/purchase', data, authHeader);
    return response.data;
  },
  
  // Premium iptal etme
  async cancel(): Promise<PremiumCancelResponse> {
    const authHeader = await createAuthHeader();
    const response = await api.post('/api/premium/cancel', {}, authHeader);
    return response.data;
  }
};

// Swipe API'leri
export const swipeApi = {
  // Yeni discover endpoint - Pagination ve Refresh desteği
  getDiscoverUsers: async (page: number = 1, limit: number = 10, refresh: boolean = false): Promise<DiscoverResponse> => {
    console.log('🔄 [API] getDiscoverUsers çağrısı:', { page, limit, refresh });
    const authHeader = await createAuthHeader();
    try {
      console.log('🔍 [API] Discover isteği gönderiliyor...');
      const response = await api.get(`/api/swipes/discover?page=${page}&limit=${limit}&refresh=${refresh}`, authHeader);
      console.log('✅ [API] getDiscoverUsers yanıtı:', {
        success: response.data.success,
        userCount: response.data.users?.length || 0,
        totalCount: response.data.totalCount,
        hasMore: response.data.hasMore,
        message: response.data.message,
        page: page,
        limit: limit,
        refresh: refresh,
        endpoint: `GET /api/swipes/discover?page=${page}&limit=${limit}&refresh=${refresh}`
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] getDiscoverUsers hatası:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        requestParams: { page, limit, refresh }
      });
      throw error;
    }
  },

  // Potansiyel eşleşmeleri getir - Ana endpoint
  getPotentialMatches: async (page: number = 1, limit: number = 10): Promise<PotentialMatchesResponse> => {
    console.log('🔄 [API] getPotentialMatches çağrısı:', { page, limit });
    const authHeader = await createAuthHeader();
    try {
      const response = await api.get(`/api/swipes/potential-matches?page=${page}&limit=${limit}`, authHeader);
      console.log('✅ [API] getPotentialMatches yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] getPotentialMatches hatası:', error.response?.data || error.message);
      throw error;
    }
  },

  // Alternatif endpoint - Tüm kullanıcıları getir
  getAllUsers: async (page: number = 1, limit: number = 10): Promise<PotentialMatchesResponse> => {
    console.log('🔄 [API] getAllUsers çağrısı:', { page, limit });
    const authHeader = await createAuthHeader();
    try {
      const response = await api.get(`/api/users?page=${page}&limit=${limit}`, authHeader);
      console.log('✅ [API] getAllUsers yanıtı:', response.data);
      
      // Response formatını PotentialMatchesResponse'a uyarla
      if (response.data.users) {
        return {
          users: response.data.users.map((user: any) => ({
            ...user,
            photos: user.photos || (user.profileImageUrl ? [user.profileImageUrl] : []),
            compatibilityScore: user.compatibilityScore || 50,
            compatibilityDescription: user.compatibilityDescription || 'Uyumluluk hesaplanıyor...',
            distance: user.distance || 0,
            isOnline: user.isOnline || false
          })),
          totalCount: response.data.totalCount || response.data.users.length,
          hasMore: response.data.hasMore || false
        };
      }
      
      return { users: [], totalCount: 0, hasMore: false };
    } catch (error: any) {
      console.error('❌ [API] getAllUsers hatası:', error.response?.data || error.message);
      throw error;
    }
  },

  // Başka bir alternatif - Discover endpoint (Eski)
  getDiscoverUsersOld: async (page: number = 1, limit: number = 10): Promise<PotentialMatchesResponse> => {
    console.log('🔄 [API] getDiscoverUsersOld çağrısı:', { page, limit });
    const authHeader = await createAuthHeader();
    try {
      const response = await api.get(`/api/discover?page=${page}&limit=${limit}`, authHeader);
      console.log('✅ [API] getDiscoverUsersOld yanıtı:', response.data);
      
      // Response formatını PotentialMatchesResponse'a uyarla
      if (response.data.users) {
        return {
          users: response.data.users.map((user: any) => ({
            ...user,
            photos: user.photos || (user.profileImageUrl ? [user.profileImageUrl] : []),
            compatibilityScore: user.compatibilityScore || 50,
            compatibilityDescription: user.compatibilityDescription || 'Uyumluluk hesaplanıyor...',
            distance: user.distance || 0,
            isOnline: user.isOnline || false
          })),
          totalCount: response.data.totalCount || response.data.users.length,
          hasMore: response.data.hasMore || false
        };
      }
      
      return { users: [], totalCount: 0, hasMore: false };
    } catch (error: any) {
      console.error('❌ [API] getDiscoverUsersOld hatası:', error.response?.data || error.message);
      throw error;
    }
  },

  // Swipe işlemi yap
  swipe: async (swipeData: SwipeRequest): Promise<SwipeResponse> => {
    console.log('🔄 [API] swipe çağrısı:', swipeData);
    const authHeader = await createAuthHeader();
    
    console.log('🔧 [API] Swipe headers:', {
      hasAuth: !!authHeader.headers['Authorization'],
      hasRefreshToken: !!authHeader.headers['X-Refresh-Token'],
      authPreview: authHeader.headers['Authorization']?.substring(0, 20) + '...',
      refreshPreview: authHeader.headers['X-Refresh-Token']?.substring(0, 20) + '...'
    });
    
    // Token kontrolü
    if (!authHeader.headers['Authorization']) {
      console.error('❌ [API] Authorization token eksik');
      throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
    }
    
    if (!authHeader.headers['X-Refresh-Token']) {
      console.error('⚠️ [API] Refresh token eksik');
    }
    
    try {
      const response = await api.post('/api/swipes', swipeData, authHeader);
      console.log('✅ [API] swipe yanıtı:', response.data);
      
      // Swipe limiti bilgisini log'la
      if (response.data.remainingSwipes !== undefined) {
        console.log('📊 [API] Kalan swipe hakkı:', response.data.remainingSwipes);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] swipe hatası:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        swipeData: swipeData
      });
      
      // Özel hata durumları
      if (error.response?.status === 403) {
        console.error('🔒 [API] 403 Forbidden - Yetki hatası:', {
          headers: error.response.headers,
          data: error.response.data,
          url: error.response.config?.url
        });
        
        // 403 hatası için özel mesaj
        const errorMessage = error.response?.data?.message || 'Yetki hatası: Bu işlemi gerçekleştirme yetkiniz yok';
        throw new Error(errorMessage);
      }
      
      // 400 hatası - Geçersiz request
      if (error.response?.status === 400) {
        console.error('❌ [API] 400 Bad Request:', error.response.data);
        const errorMessage = error.response?.data?.message || 'Geçersiz istek';
        throw new Error(errorMessage);
      }
      
      // 429 hatası - Rate limit
      if (error.response?.status === 429) {
        console.error('⏰ [API] 429 Too Many Requests:', error.response.data);
        const errorMessage = 'Çok fazla istek gönderdiniz. Lütfen bir süre bekleyip tekrar deneyin.';
        throw new Error(errorMessage);
      }
      
      // 409 hatası - Duplicate swipe
      if (error.response?.status === 409) {
        console.error('🔄 [API] 409 Conflict - Duplicate swipe:', error.response.data);
        const errorMessage = error.response?.data?.message || 'Bu kullanıcıya zaten swipe yaptınız';
        throw new Error(errorMessage);
      }
      
      // 412 hatası - Swipe limit aşımı
      if (error.response?.status === 412) {
        console.error('⚠️ [API] 412 Precondition Failed - Swipe limit:', error.response.data);
        const errorMessage = error.response?.data?.message || 'Günlük swipe limitiniz dolmuş. Premium üyelik ile sınırsız swipe yapabilirsiniz.';
        throw new Error(errorMessage);
      }
      
      throw error;
    }
  },

  // Yüksek uyumluluk eşleşmeleri
  getHighCompatibilityMatches: async (minScore: number = 70): Promise<HighCompatibilityMatchesResponse> => {
    console.log('🔄 [API] getHighCompatibilityMatches çağrısı:', { minScore });
    const authHeader = await createAuthHeader();
    try {
      const response = await api.get(`/api/matches/high-compatibility?minScore=${minScore}`, authHeader);
      console.log('✅ [API] getHighCompatibilityMatches yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] getHighCompatibilityMatches hatası:', error.response?.data || error.message);
      throw error;
    }
  },

  // Beni beğenen kullanıcıları getir
  getUsersWhoLikedMe: async (limit: number = 10): Promise<UsersWhoLikedMeResponse> => {
    console.log('🔄 [API] getUsersWhoLikedMe çağrısı:', { limit });
    const authHeader = await createAuthHeader();
    try {
      const response = await api.get(`/api/swipes/users-who-liked-me?limit=${limit}`, authHeader);
      console.log('✅ [API] getUsersWhoLikedMe yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] getUsersWhoLikedMe hatası:', error.response?.data || error.message);
      throw error;
    }
  },

  // Swipe limit durumunu kontrol et
  getSwipeLimitInfo: async (): Promise<SwipeLimitInfo> => {
    console.log('🔄 [API] getSwipeLimitInfo çağrısı');
    const authHeader = await createAuthHeader();
    try {
      const response = await api.get('/api/swipes/limit-info', authHeader);
      console.log('✅ [API] getSwipeLimitInfo yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] getSwipeLimitInfo hatası:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Match API'leri
export const matchApi = {
  // Tüm eşleşmeleri getir
  getMatches: async (): Promise<{ matches: Match[] }> => {
    console.log('🔄 [API] getMatches çağrısı');
    const authHeader = await createAuthHeader();
    try {
      const response = await api.get('/api/matches', authHeader);
      console.log('✅ [API] getMatches yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] getMatches hatası:', error.response?.data || error.message);
      throw error;
    }
  },

  // Belirli bir eşleşme detayı
  getMatchDetail: async (matchId: number): Promise<Match> => {
    console.log('🔄 [API] getMatchDetail çağrısı:', { matchId });
    const authHeader = await createAuthHeader();
    try {
      const response = await api.get(`/api/matches/${matchId}`, authHeader);
      console.log('✅ [API] getMatchDetail yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] getMatchDetail hatası:', error.response?.data || error.message);
      throw error;
    }
  },

  // Eşleşmeyi sil
  deleteMatch: async (matchId: number): Promise<{ success: boolean }> => {
    console.log('🔄 [API] deleteMatch çağrısı:', { matchId });
    const authHeader = await createAuthHeader();
    try {
      const response = await api.delete(`/api/matches/${matchId}`, authHeader);
      console.log('✅ [API] deleteMatch yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] deleteMatch hatası:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default api; 