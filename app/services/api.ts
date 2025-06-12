import axios from 'axios';
import { ZodiacSign } from '../types/zodiac';
import { getToken, saveToken } from '../utils/tokenStorage';

const API_URL = 'https://f92a-95-70-131-250.ngrok-free.app';

console.log('🔗 [API CONFIG] Base URL:', API_URL);

// API isteği için bir axios örneği oluşturuluyor
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 saniye timeout ekle
});

// İstek/yanıt durumlarını kontrol eden interceptor'lar
api.interceptors.request.use(
  (config) => {
    console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`[API RESPONSE] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`[API RESPONSE ERROR] ${error.response.status}`, error.response.data);
    } else if (error.request) {
      console.error('[API REQUEST FAILED]', error.request);
    } else {
      console.error('[API ERROR]', error.message);
    }
    return Promise.reject(error);
  }
);

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
  premiumUntil: string | null;
  features: PremiumFeature[];
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
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  age: number;
  zodiacSign?: ZodiacSign | string;
  zodiacSignTurkish?: string;
  compatibility?: number;
  likedAt: string;
}

export interface UsersWhoLikedMeResponse {
  users: UserWhoLikedMe[];
  total: number;
  hasMore: boolean;
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
  targetUserId: number;
  action: 'LIKE' | 'DISLIKE' | 'SUPER_LIKE';
}

export interface SwipeResponse {
  success: boolean;
  isMatch: boolean;
  matchId?: number;
  message: string;
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

// API'yi kullanırken gerekli token header'ını oluşturur
const createAuthHeader = async () => {
  const token = await getToken();
  if (!token) {
    throw new Error('Oturum açık değil');
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
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
  async login(data: LoginRequest): Promise<any> {
    const response = await api.post('/api/auth/login', data);
    
    // JWT token varsa saklama işlemi 
    if (response.data?.token) {
      await saveToken(response.data.token);
    }
    
    return response.data;
  },
  
  // Çıkış yapma
  logout: async (): Promise<LogoutResponse> => {
    try {
      const response = await api.post('/api/auth/logout');
      return response.data;
    } catch (error) {
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
  // Potansiyel eşleşmeleri getir
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

  // Swipe işlemi yap
  swipe: async (swipeData: SwipeRequest): Promise<SwipeResponse> => {
    console.log('🔄 [API] swipe çağrısı:', swipeData);
    const authHeader = await createAuthHeader();
    try {
      const response = await api.post('/api/swipes', swipeData, authHeader);
      console.log('✅ [API] swipe yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] swipe hatası:', error.response?.data || error.message);
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