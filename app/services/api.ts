import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ZodiacSign } from '../types/zodiac';
import { getRefreshToken, getToken, removeAllTokens, saveRefreshToken, saveToken } from '../utils/tokenStorage';

// CLOUDFLARE TUNNEL URL'i - değişebilir
const CLOUDFLARE_URL = 'https://pages-costumes-enjoying-paper.trycloudflare.com';

// Alternative endpoints (gerektiğinde eklenebilir)
const FALLBACK_URLS: string[] = [
  // Buraya alternatif URL'ler eklenebilir
  // 'https://your-backend.herokuapp.com',
  // 'https://api.yourdomain.com',
];

// Aktif API URL
let API_URL = CLOUDFLARE_URL;

// WebSocket URL'i (API URL'inden türetilir)
export const getWebSocketUrl = (): string => {
  const baseUrl = API_URL.replace('https://', 'wss://').replace('http://', 'ws://');
  console.log('🔗 [API] WebSocket URL oluşturuldu:', baseUrl, 'API URL:', API_URL);
  return baseUrl;
};

console.log('🔗 [API CONFIG] Base URL:', API_URL);

// Network durumunu kontrol eden fonksiyon
const checkNetworkHealth = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 saniye timeout
    
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
  const mainUrlWorks = await checkNetworkHealth(CLOUDFLARE_URL);
  if (mainUrlWorks) {
    return CLOUDFLARE_URL;
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
  return CLOUDFLARE_URL;
};

// API isteği için bir axios örneği oluşturuluyor
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 saniye timeout (daha stabil)
  withCredentials: true, // HttpOnly cookie'ler için gerekli (refresh token)
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
    // config undefined kontrolü ekle
    if (!config) {
      console.error('❌ [API] Request interceptor hatası: config undefined');
      return Promise.reject(new Error('API config undefined'));
    }
    
    console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
    
    // Token gerekli olmayan endpoint'ler veya refresh token istekleri
    const noAuthEndpoints = ['/health', '/api/auth/login', '/api/auth/register', '/api/auth/register-music'];
    const isNoAuthEndpoint = noAuthEndpoints.some(endpoint => config.url?.includes(endpoint)) ||
                            (config as any).metadata?.isRefreshRequest === true ||
                            config.url?.includes('/api/auth/refresh') ||
                            config.url?.includes('/api/auth/persistent-login');
    
    if (!isNoAuthEndpoint) {
      // Token'ı al ve kontrol et
      const token = await getToken();
      const refreshToken = await getRefreshToken();
      
      console.log('🔑 [API] Token kontrolü:', {
        hasAccessToken: !!token,
        hasRefreshToken: !!refreshToken
      });
      
      if (token) {
        // Token'ı decode et ve loglama için bilgileri görüntüle
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          const timeUntilExpire = payload.exp ? (payload.exp - currentTime) : 0;
          
          console.log('🔍 [API] Token bilgileri:', {
            exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'N/A',
            userId: payload.userId,
            expiresIn: `${Math.floor(timeUntilExpire / 60)} dakika`
          });
          
          // PROAKTIF TOKEN YENİLEME: Token 10 dakika içinde dolacaksa ÖNCE yenile
          // Bu sayede 401 hatası almadan token yenilenir
          if (refreshToken && timeUntilExpire > 0 && timeUntilExpire < TOKEN_EXPIRE_THRESHOLD) {
            console.log(`⚡ [API] Proaktif token yenileme: ${Math.floor(timeUntilExpire / 60)} dakika kaldı`);
            
            // Eğer zaten yenileme yapılmıyorsa yenile
            if (!isRefreshing) {
              isRefreshing = true;
              try {
                const refreshResult = await performTokenRefresh();
                await saveToken(refreshResult.token);
                if (refreshResult.refreshToken) {
                  await saveRefreshToken(refreshResult.refreshToken);
                }
                lastTokenRefreshTime = Date.now();
                console.log('✅ [API] Proaktif token yenileme başarılı');
                
                // Yeni token ile isteği gönder
                config.headers['Authorization'] = `Bearer ${refreshResult.token}`;
                isRefreshing = false;
                processQueue(null, refreshResult.token);
                return config;
              } catch (refreshError) {
                console.error('❌ [API] Proaktif token yenileme hatası:', refreshError);
                isRefreshing = false;
                processQueue(refreshError, null);
                // Hata olsa bile mevcut token ile devam et, 401 gelirse response interceptor halledecek
              }
            }
          }
          
          // Normal durum: Token'ı header'a ekle
          config.headers['Authorization'] = `Bearer ${token}`;
        } catch (tokenParseError) {
          console.error('❌ [API] Token parse hatası:', tokenParseError);
          console.warn('⚠️ [API] Token parse edilemedi, refresh token ile devam deneniyor');
          
          // Parse hatası olsa bile token'ı header'a ekle
          // Backend 401 dönerse response interceptor yenileyecek
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      } else if (refreshToken) {
        // Access token yok ama refresh token var - proaktif olarak yenile
        console.log('🔄 [API] Access token yok, refresh token ile yenileniyor...');
        
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshResult = await performTokenRefresh();
            await saveToken(refreshResult.token);
            if (refreshResult.refreshToken) {
              await saveRefreshToken(refreshResult.refreshToken);
            }
            lastTokenRefreshTime = Date.now();
            console.log('✅ [API] Token yenileme başarılı (access token yoktu)');
            
            config.headers['Authorization'] = `Bearer ${refreshResult.token}`;
            isRefreshing = false;
            processQueue(null, refreshResult.token);
          } catch (refreshError) {
            console.error('❌ [API] Token yenileme hatası:', refreshError);
            isRefreshing = false;
            processQueue(refreshError, null);
          }
        }
      } else {
        console.warn('⚠️ [API] Access token ve refresh token bulunamadı');
      }
    }
    
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
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 5; // Daha fazla deneme hakkı

// Persistent login sırasında 403 hatalarında logout tetiklenmesini engellemek için flag
let isPersistentLoginInProgress = false;

// Token yenileme sonrası grace period (saniye cinsinden)
// Bu süre içinde 403 hataları logout tetiklemez çünkü eski istekler hala devam ediyor olabilir
const TOKEN_REFRESH_GRACE_PERIOD = 5000; // 5 saniye

// Otomatik token yenileme için timer
let autoRefreshTimer: ReturnType<typeof setInterval> | null = null;
let lastTokenRefreshTime = 0;
const TOKEN_REFRESH_INTERVAL = 25 * 60 * 1000; // 25 dakika (30 dk token için güvenli)
const TOKEN_EXPIRE_THRESHOLD = 10 * 60; // 10 dakika kala yenile (saniye cinsinden)

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

// Otomatik token yenileme fonksiyonu
const startAutoTokenRefresh = () => {
  // Eğer zaten bir timer varsa temizle
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
  }
  
  console.log('🔄 [API] Otomatik token yenileme başlatıldı (25 dakika aralıklarla)');
  
  // İlk olarak hemen bir kontrol yap
  checkAndRefreshTokenIfNeeded();
  
  autoRefreshTimer = setInterval(async () => {
    await checkAndRefreshTokenIfNeeded();
  }, TOKEN_REFRESH_INTERVAL);
};

// Token kontrolü ve gerekirse yenileme
const checkAndRefreshTokenIfNeeded = async () => {
  try {
    const refreshToken = await getRefreshToken();
      const accessToken = await getToken();
      
      // Her iki token da varsa yenileme yap
      if (refreshToken && accessToken) {
        console.log('🔄 [API] Otomatik token kontrolü başlıyor...');
        
        // Token'ın süresi dolmuş mu kontrol et
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const currentTime = Date.now() / 1000;
          const timeUntilExpire = payload.exp ? (payload.exp - currentTime) : 0;
          
          // Token'ın süresi 10 dakika içinde dolacaksa yenile (daha güvenli)
          if (payload.exp && timeUntilExpire < TOKEN_EXPIRE_THRESHOLD) {
            console.log(`⏰ [API] Token süresi ${Math.floor(timeUntilExpire / 60)} dakika içinde dolacak, yenileniyor...`);
            await authApi.refreshToken();
            lastTokenRefreshTime = Date.now();
            console.log('✅ [API] Otomatik token yenileme başarılı');
          } else if (timeUntilExpire <= 0) {
            // Token zaten expired - hemen yenile
            console.log('🔴 [API] Token süresi dolmuş, acil yenileme yapılıyor...');
            try {
              await authApi.refreshToken();
              lastTokenRefreshTime = Date.now();
              console.log('✅ [API] Expired token yenilendi');
            } catch (error) {
              console.error('❌ [API] Expired token yenileme hatası:', error);
              // Network hatası olabilir, token korunur
            }
          } else {
            console.log(`✅ [API] Token henüz geçerli (${Math.floor(timeUntilExpire / 60)} dakika kaldı)`);
          }
        } catch (tokenError) {
          console.error('❌ [API] Token parse hatası:', tokenError);
          // Token parse edilemiyorsa yenilemeyi dene
          await authApi.refreshToken();
          lastTokenRefreshTime = Date.now();
        }
      } else if (refreshToken && !accessToken) {
        // Access token yok ama refresh token var - yenile
        console.log('🔄 [API] Access token yok, refresh token ile yenileniyor...');
        await authApi.refreshToken();
        lastTokenRefreshTime = Date.now();
        console.log('✅ [API] Token yenilendi (access token yoktu)');
      } else {
        console.log('⚠️ [API] Refresh token bulunamadı, otomatik yenileme durduruluyor');
        stopAutoTokenRefresh();
      }
  } catch (error) {
    console.error('❌ [API] Otomatik token kontrolü hatası:', error);
    // Sadece refresh token yoksa durdur, diğer hatalarda devam et
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      stopAutoTokenRefresh();
    }
  }
};

// Otomatik token yenilemeyi durdur
const stopAutoTokenRefresh = () => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
    console.log('🛑 [API] Otomatik token yenileme durduruldu');
  }
};

// Token refresh işlemi için yardımcı fonksiyon
// NOT: React Native'de cookie yönetimi YOK! Backend fallback kullanmalı (body'de token)
// Web için cookie, React Native için body (hybrid approach)
const performTokenRefresh = async (): Promise<{ token: string; refreshToken?: string }> => {
  try {
    console.log('🔄 [API] Token yenileme başlıyor (React Native - body fallback)...');
    
    // React Native'de refresh token'ı AsyncStorage'dan al
    const refreshToken = await getRefreshToken();
    
    if (!refreshToken) {
      console.error('❌ [API] Refresh token bulunamadı (AsyncStorage)');
      throw new Error('Refresh token bulunamadı');
    }
    
    // Body'de gönder - Backend fallback mekanizması ile çalışacak
    // (Web'de cookie olursa cookie öncelikli, yoksa body'den okur)
    const response = await api.post('/api/auth/refresh', { 
      refreshToken // Backend fallback için
    }, {
      timeout: 10000, // 10 saniye timeout
      withCredentials: true, // Web için cookie desteği (React Native'de işe yaramaz ama zarar vermez)
      metadata: { isRefreshRequest: true }
    } as any);
    
    if (response.data?.token) {
      console.log('✅ [API] Token başarıyla yenilendi (React Native fallback)');
      return {
        token: response.data.token,
        refreshToken: response.data.refreshToken
      };
    } else {
      throw new Error('Token yenileme yanıtı geçersiz');
    }
  } catch (error) {
    console.error('❌ [API] Token yenileme hatası:', error);
    throw error;
  }
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
    const originalRequest = error?.config;
    const status = error?.response?.status;
    
    // Network/timeout veya config'siz hatalarda token temizleme - sadece hata döndür
    if (!originalRequest || !error?.response) {
      console.warn('⚠️ [API] Network/timeout hatası, token korunuyor');
      return Promise.reject(error);
    }
    
    // Refresh token isteği ise döngüye girmesin - direkt hata fırlat
    if (originalRequest.metadata?.isRefreshRequest || originalRequest.url?.includes('/api/auth/refresh')) {
      console.error('❌ [API] Refresh token isteği başarısız:', status);
      return Promise.reject(error);
    }
    
    // Yalnızca 401 durumlarında token yenilemeyi dene
    if (status === 401 && !originalRequest._retry) {
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
        console.log('🔄 [API] 401 hatası - Token yenileniyor (cookie-based)...');
        
        // Refresh token HttpOnly cookie'de olduğu için parametre gerek yok
        // Backend cookie'den otomatik okuyacak
        const refreshResult = await performTokenRefresh();
        
        // Yeni token'ları kaydet
        await saveToken(refreshResult.token);
        
        if (refreshResult.refreshToken) {
          await saveRefreshToken(refreshResult.refreshToken);
        }
        
        // Başarılı kuyruğu işle
        processQueue(null, refreshResult.token);
        
        // Orijinal isteği yeni token ile tekrar yap
        originalRequest.headers['Authorization'] = `Bearer ${refreshResult.token}`;
        console.log('✅ [API] Token yenilendi, istek tekrarlanıyor');
        return api(originalRequest);
        
      } catch (refreshError: any) {
        console.error('❌ [API] Token yenileme hatası:', refreshError);
        
        const refreshStatus = refreshError?.response?.status;
        const isNetworkError = !refreshError?.response; // Network/timeout hatası
        
        // Network hatalarında token korunur (kullanıcı logout olmaz)
        if (isNetworkError) {
          console.warn('⚠️ [API] Network hatası - Token korunuyor, kullanıcı giriş yapılı kalıyor');
          processQueue(refreshError, null);
          return Promise.reject(refreshError);
        }
        
        // Gerçek authentication hatalarında token temizle (401, 403, vb.)
        if (refreshStatus === 401 || refreshStatus === 403) {
          console.error('🔒 [API] Refresh token geçersiz - Token\'lar temizleniyor');
          await removeAllTokens();
          
          // Logout alert flag set et
          try {
            await AsyncStorage.setItem('logout_alert_needed', 'true');
            console.log('🚨 [API] Logout alert flag set edildi (session timeout)');
          } catch (error) {
            console.error('❌ [API] Logout alert flag set hatası:', error);
          }
        } else {
          // Diğer hatalarda (500, vb.) token korunur
          console.warn(`⚠️ [API] Refresh hatası (${refreshStatus}) - Token korunuyor`);
        }
        
        // Başarısız kuyruğu işle
        processQueue(refreshError, null);
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Diğer hatalar için mevcut logic
    if (error.response) {
      console.error(`[API RESPONSE ERROR] ${error.response.status}`, error.response.data);
      
      // 403 hatalarını kontrol et - token silinmemesi gereken durumlar
      if (error.response.status === 403) {
        const errorCode = error.response?.data?.code;
        
        // Swipe limit dolması - normal durum, token korunmalı
        if (errorCode === 'SWIPE_LIMIT_EXCEEDED') {
          console.warn('⚠️ [API] Swipe limit doldu - Token silinmeyecek');
          
          const swipeLimitError = new Error('Swipe limiti doldu') as any;
          swipeLimitError.isSwipeLimitError = true;
          swipeLimitError.swipeLimitInfo = error.response?.data?.swipeLimitInfo;
          swipeLimitError.premiumInfo = error.response?.data?.premiumInfo;
          swipeLimitError.message = error.response?.data?.message || 'Günlük swipe limitiniz dolmuş';
          
          return Promise.reject(swipeLimitError);
        }
        
        // Kullanıcı bulunamadı hatası (mock user'a swipe, match yapma vb.) - token korunmalı
        if (errorCode === 'AUTH_USER_NOT_FOUND' || errorCode === 'USER_NOT_FOUND') {
          console.warn('⚠️ [API] Kullanıcı bulunamadı hatası - Token silinmeyecek');
          
          const userNotFoundError = new Error(error.response?.data?.message || 'Kullanıcı bulunamadı') as any;
          userNotFoundError.isUserNotFoundError = true;
          userNotFoundError.code = errorCode;
          
          return Promise.reject(userNotFoundError);
        }
      }
      
      // 401 veya gerçek yetki hataları (token expired vb.) - token silinmeli
      if (error.response.status === 401 || error.response.status === 403) {
        // Persistent login sırasında veya token yenileme sonrası grace period içinde logout tetikleme
        const timeSinceLastRefresh = Date.now() - lastTokenRefreshTime;
        const isInGracePeriod = timeSinceLastRefresh < TOKEN_REFRESH_GRACE_PERIOD && lastTokenRefreshTime > 0;
        
        if (isPersistentLoginInProgress) {
          console.log('⏳ [API] Persistent login devam ediyor - 403 hatası için logout tetiklenmiyor');
          return Promise.reject(error);
        }
        
        if (isInGracePeriod) {
          console.log(`⏳ [API] Token yenileme sonrası grace period içinde (${timeSinceLastRefresh}ms) - 403 hatası için logout tetiklenmiyor`);
          return Promise.reject(error);
        }
        
        console.log('🔒 [API] Yetkilendirme hatası - logout tetikleniyor');
        try {
          await AsyncStorage.setItem('logout_alert_needed', 'true');
          console.log('🚨 [API] Logout alert flag set edildi');
          
          // Tüm token'ları hemen temizle
          await removeAllTokens();
          console.log('🗑️ [API] Tüm token\'lar temizlendi');
        } catch (alertError) {
          console.error('❌ [API] Logout alert flag set hatası:', alertError);
        }
        
        // 401/403 için error'u reject et
        return Promise.reject(error);
      }
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

// Backend response formatını normalize eden fonksiyon
const normalizeDiscoverResponse = (
  backendResponse: any, 
  refresh: boolean, 
  showLikedMe: boolean, 
  page: number, 
  limit: number
): DiscoverResponse => {
  console.log('🔄 [API] Response normalizasyonu başlıyor:', {
    hasUser: !!backendResponse.user,
    hasUsers: !!backendResponse.users,
    userKeys: Object.keys(backendResponse.user || {}),
    responseKeys: Object.keys(backendResponse)
  });

  // Backend'den gelen response formatını kontrol et
  if (backendResponse.hasOwnProperty('user') && !backendResponse.users) {
    // Kullanıcı null ise (kullanıcı bulunamadı)
    if (!backendResponse.user) {
      console.log('📭 [API] Kullanıcı bulunamadı (user: null)');
      return {
        success: backendResponse.success || false,
        users: [],
        totalCount: 0,
        returnedCount: 0,
        message: backendResponse.message || 'Kullanıcı bulunamadı',
        hasMore: backendResponse.hasMoreUsers || false,
        hasMoreUsers: backendResponse.hasMoreUsers || false,
        cooldownInfo: backendResponse.cooldownInfo ? {
          canRefresh: true,
          nextRefreshTime: new Date(Date.now() + (backendResponse.cooldownInfo.likeCooldownMinutes || 10) * 60 * 1000).toISOString(),
          remainingSeconds: (backendResponse.cooldownInfo.likeCooldownMinutes || 10) * 60,
          message: `Yenileme için ${backendResponse.cooldownInfo.likeCooldownMinutes || 10} dakika bekleyin`,
          likeCooldownMinutes: backendResponse.cooldownInfo.likeCooldownMinutes,
          dislikeCooldownMinutes: backendResponse.cooldownInfo.dislikeCooldownMinutes,
          isPremiumCooldown: backendResponse.cooldownInfo.isPremiumCooldown
        } : undefined,
        swipeLimitInfo: backendResponse.swipeLimitInfo ? {
          isPremium: backendResponse.swipeLimitInfo.isPremium || false,
          remainingSwipes: backendResponse.swipeLimitInfo.remainingSwipes || 0,
          dailySwipeCount: backendResponse.swipeLimitInfo.dailySwipeCount || 0,
          canSwipe: backendResponse.swipeLimitInfo.canSwipe || false,
          nextResetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          resetMessage: 'Günlük swipe limiti yarın sıfırlanacak',
          isLimitReached: (backendResponse.swipeLimitInfo.remainingSwipes || 0) <= 0,
          limitMessage: (backendResponse.swipeLimitInfo.remainingSwipes || 0) <= 0 
            ? 'Günlük swipe limitiniz doldu! Premium üyelik ile sınırsız swipe yapabilirsiniz.' 
            : `${backendResponse.swipeLimitInfo.remainingSwipes || 0} swipe hakkınız kaldı`,
          premiumInfo: backendResponse.premiumInfo
        } : undefined
      };
    }
    
    // Yeni backend formatı: tek kullanıcı objesi
    const normalizedUser: DiscoverUser = {
      id: backendResponse.user.id,
      username: backendResponse.user.username,
      firstName: backendResponse.user.firstName,
      lastName: backendResponse.user.lastName,
      fullName: backendResponse.user.fullName,
      birthDate: backendResponse.user.birthDate,
      age: backendResponse.user.age,
      gender: backendResponse.user.gender,
      bio: backendResponse.user.bio,
      zodiacSign: backendResponse.user.zodiacSign,
      isPremium: backendResponse.user.isPremium,
      lastActiveTime: backendResponse.user.lastActiveTime,
      location: backendResponse.user.location,
      isVerified: backendResponse.user.isVerified,
      profileImageUrl: backendResponse.user.profileImageUrl,
      photos: backendResponse.user.photos || [],
      photoCount: backendResponse.user.photoCount || 0,
      // Yeni backend sistemi için ek alanlar
      compatibilityScore: backendResponse.user.compatibilityScore,
      compatibilityMessage: backendResponse.user.compatibilityMessage,
      distanceKm: backendResponse.user.distanceKm,
      activityStatus: backendResponse.user.activityStatus,
      lastSeen: backendResponse.user.lastActiveTime,
      isOnline: backendResponse.user.activityStatus === 'online'
    };

    console.log('✅ [API] Kullanıcı normalize edildi:', {
      id: normalizedUser.id,
      name: normalizedUser.fullName,
      compatibilityScore: normalizedUser.compatibilityScore,
      hasPhotos: normalizedUser.photos?.length > 0
    });

    return {
      success: backendResponse.success,
      users: [normalizedUser],
      totalCount: backendResponse.totalRemainingUsers || 1,
      returnedCount: 1,
      message: 'Kullanıcı başarıyla getirildi',
      hasMore: backendResponse.hasMoreUsers || false,
      cooldownInfo: {
        canRefresh: !refresh, // Refresh yapılmışsa tekrar yapılamaz
        nextRefreshTime: new Date(Date.now() + (backendResponse.cooldownInfo?.likeCooldownMinutes || 10) * 60 * 1000).toISOString(),
        remainingSeconds: (backendResponse.cooldownInfo?.likeCooldownMinutes || 10) * 60,
        message: `Yenileme için ${backendResponse.cooldownInfo?.likeCooldownMinutes || 10} dakika bekleyin`
      },
      swipeLimitInfo: {
        isPremium: backendResponse.swipeLimitInfo?.isPremium || false,
        remainingSwipes: backendResponse.swipeLimitInfo?.remainingSwipes || 0,
        dailySwipeCount: 0, // Backend'den gelmiyorsa 0
        canSwipe: (backendResponse.swipeLimitInfo?.remainingSwipes || 0) > 0,
        nextResetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 saat sonra
        resetMessage: 'Günlük swipe limiti yarın sıfırlanacak',
        // Swipe limit kontrolü için ek alanlar
        isLimitReached: (backendResponse.swipeLimitInfo?.remainingSwipes || 0) <= 0,
        limitMessage: (backendResponse.swipeLimitInfo?.remainingSwipes || 0) <= 0 
          ? 'Günlük swipe limitiniz doldu! Premium üyelik ile sınırsız swipe yapabilirsiniz.' 
          : `${backendResponse.swipeLimitInfo?.remainingSwipes || 0} swipe hakkınız kaldı`,
        // Premium bilgileri
        premiumInfo: backendResponse.premiumInfo
      }
    };
  } else if (backendResponse.users) {
    // Eski format: users array'i
    return backendResponse;
  } else {
    // Hiç kullanıcı yok
    console.warn('⚠️ [API] Backend response formatı tanınmadı:', backendResponse);
    return {
      success: backendResponse.success || false,
      users: [],
      totalCount: 0,
      returnedCount: 0,
      message: 'Kullanıcı bulunamadı',
      hasMore: false
    };
  }
};

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

// Mock DiscoverResponse için fallback fonksiyon
const createMockDiscoverResponse = (): DiscoverResponse => ({
  success: true,
  users: [
    {
      id: 123,
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      birthDate: '1995-05-15T00:00:00',
      age: 28,
      gender: 'MALE',
      bio: 'Merhaba! Ben John, yeni insanlarla tanışmayı seviyorum.',
      zodiacSign: 'TAURUS',
      isPremium: false,
      lastActiveTime: '2024-01-15T14:30:00',
      location: 'İstanbul, Türkiye',
      isVerified: true,
      profileImageUrl: 'https://example.com/photos/profile123.jpg',
      photos: [
        {
          id: 456,
          imageUrl: 'https://example.com/photos/photo1.jpg',
          isProfilePhoto: true,
          displayOrder: 1
        }
      ],
      photoCount: 1
    }
  ],
  totalCount: 1,
  returnedCount: 1,
  message: 'Mock data başarıyla getirildi'
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
  photos?: string[]; // Tüm fotoğraflar
  bio: string | null;
  isPremium?: boolean; // Premium durumu
  
  // Match/Chat bilgileri (eğer eşleşme varsa)
  matchId?: number;
  chatRoomId?: number;
  hasActiveMatch?: boolean;
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
  toUserId?: number;      // Backend'de beklenen alan
  targetUserId?: string;  // Eski sistem için (opsiyonel)
  action: 'LIKE' | 'DISLIKE';
  // Geriye uyumluluk için
  userId?: number;        // toUserId ile aynı amaç
}

export interface SwipeResponse {
  success: boolean;
  isMatch: boolean;
  status: 'LIKED' | 'DISLIKED' | 'MATCHED';
  matchId?: number;
  remainingSwipes?: number;
  message: string;
  // Eski sistem için
  resetInfo?: {
    nextResetTime: string;
    hoursUntilReset: number;
    minutesUntilReset: number;
    secondsUntilReset: number;
    totalSecondsUntilReset: number;
    resetMessage: string;
  };
  // Yeni backend sistemi için
  swipeLimitInfo?: {
    isPremium: boolean;
    remainingSwipes: number;
    dailySwipeCount: number;
    canSwipe: boolean;
    nextResetTime: string;
    resetMessage: string;
  };
  cooldownInfo?: {
    canRefresh: boolean;
    nextRefreshTime: string;
    remainingSeconds: number;
    message: string;
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
    zodiacSignTurkish?: string;
    isPremium?: boolean;
    bio?: string;
    photos?: string[];
  };
  compatibilityScore: number;
  compatibilityDescription: string;
  matchType: 'ZODIAC' | 'MUSIC' | 'GENERAL';
  matchedAt: string;
  lastMessageAt?: string;
  unreadCount?: number;
  chatRoomId?: number;
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
  // Backend'den gelen ek alanlar
  backwardCompatibility?: boolean;
  // Swipe limit kontrolü için ek alanlar
  isLimitReached?: boolean;
  limitMessage?: string;
  // Reset bilgileri
  nextResetTime?: string;
  resetMessage?: string;
  // Premium bilgileri
  premiumInfo?: {
    benefits: string[];
    isPremium: boolean;
    premiumPrice: number;
  };
}

export interface DiscoverUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate: string;
  age: number;
  gender: string;
  bio: string;
  zodiacSign: string;
  isPremium: boolean;
  lastActiveTime: string;
  location: string;
  isVerified: boolean;
  profileImageUrl: string;
  photos: Array<{
    id: number;
    imageUrl: string;
    photoUrl?: string; // Backward compatibility için
    isProfilePhoto: boolean;
    displayOrder: number;
  }>;
  photoCount: number;
  // Yeni backend sistemi için ek alanlar
  compatibilityScore?: number;        // Burç uyumluluk skoru
  compatibilityMessage?: string;      // Uyumluluk mesajı
  distanceKm?: number;               // Mesafe (km)
  activityStatus?: 'online' | 'offline' | 'recently'; // Aktiflik durumu
  lastSeen?: string;                 // Son görülme zamanı
  isOnline?: boolean;                // Çevrimiçi mi?
  // Cooldown ve swipe status bilgileri
  cooldownInfo?: {
    isExpired: boolean;
    remainingMessage: string;
  };
  swipeStatus?: 'NONE' | 'LIKE' | 'DISLIKE' | 'MATCH';
}

export interface DiscoverResponse {
  success: boolean;
  users: DiscoverUser[];  // Kullanıcı array'i
  totalCount: number;
  returnedCount: number;
  message: string;
  hasMore?: boolean; // Yeni backend sistemi için
  hasMoreUsers?: boolean; // Kullanıcı bitti mi kontrolü
  cooldownInfo?: {   // Cooldown bilgisi
    canRefresh: boolean;
    nextRefreshTime: string;
    remainingSeconds: number;
    message: string;
    // Backend'den gelen ek alanlar
    likeCooldownMinutes?: number;
    dislikeCooldownMinutes?: number;
    isPremiumCooldown?: boolean;
    matchExpiryHours?: number;
  };
  swipeLimitInfo?: { // Swipe limit bilgisi
    isPremium: boolean;
    remainingSwipes: number;
    dailySwipeCount: number;
    canSwipe: boolean;
    nextResetTime: string;
    resetMessage: string;
    // Backend'den gelen ek alanlar
    backwardCompatibility?: boolean;
    // Swipe limit kontrolü için ek alanlar
    isLimitReached?: boolean;
    limitMessage?: string;
    // Premium bilgileri
    premiumInfo?: {
      benefits: string[];
      isPremium: boolean;
      premiumPrice: number;
    };
  };
}

// JWT token'ını decode etmek için basit fonksiyon (debug amaçlı)
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('❌ [API] Token decode hatası:', error);
    return null;
  }
};

// API'yi kullanırken gerekli token header'larını oluşturur
const createAuthHeader = async () => {
  try {
    let token = await getToken();
    const refreshToken = await getRefreshToken();
    
    console.log('🔑 [API] Token kontrolü:', {
      hasAccessToken: !!token,
      hasRefreshToken: !!refreshToken
    });
    
    // Token yoksa ve refresh token varsa, proaktif yenileme yap
    if (!token && refreshToken) {
      console.log('🔄 [API] Access token yok, refresh token ile yenileniyor...');
      try {
        const refreshResult = await performTokenRefresh();
        await saveToken(refreshResult.token);
        if (refreshResult.refreshToken) {
          await saveRefreshToken(refreshResult.refreshToken);
        }
        token = refreshResult.token;
        console.log('✅ [API] Token başarıyla yenilendi (createAuthHeader)');
      } catch (refreshError) {
        console.error('❌ [API] Token yenileme başarısız (createAuthHeader):', refreshError);
        throw new Error('Token bulunamadı - Lütfen giriş yapın');
      }
    }
    
    // Hala token yoksa hata fırlat
    if (!token) {
      console.warn('⚠️ [API] Token bulunamadı - Kullanıcı giriş yapmamış olabilir');
      throw new Error('Token bulunamadı - Lütfen giriş yapın');
    }
    
    // Token içeriğini debug et ve expired kontrolü yap
    const decodedToken = decodeJWT(token);
    if (decodedToken) {
      console.log('🔍 [API] Token içeriği:', {
        userId: decodedToken.userId || decodedToken.sub || decodedToken.id,
        username: decodedToken.username,
        exp: decodedToken.exp ? new Date(decodedToken.exp * 1000).toISOString() : 'N/A',
        iat: decodedToken.iat ? new Date(decodedToken.iat * 1000).toISOString() : 'N/A'
      });
      
      // Token süresi dolmuş mu veya 5 dakika içinde dolacak mı kontrol et
      const currentTime = Date.now() / 1000;
      const timeUntilExpire = decodedToken.exp ? (decodedToken.exp - currentTime) : 0;
      
      if (decodedToken.exp && timeUntilExpire <= 0) {
        console.warn('⚠️ [API] Token süresi dolmuş! Yenileme yapılıyor...');
        
        // Token expired ise ve refresh token varsa proaktif yenile
        if (refreshToken) {
          try {
            const refreshResult = await performTokenRefresh();
            await saveToken(refreshResult.token);
            if (refreshResult.refreshToken) {
              await saveRefreshToken(refreshResult.refreshToken);
            }
            token = refreshResult.token;
            console.log('✅ [API] Expired token başarıyla yenilendi');
          } catch (refreshError) {
            console.error('❌ [API] Expired token yenileme başarısız:', refreshError);
            throw new Error('Oturum süresi dolmuş - Lütfen giriş yapın');
          }
        } else {
          throw new Error('Oturum süresi dolmuş - Lütfen giriş yapın');
        }
      } else if (decodedToken.exp && timeUntilExpire < 300) {
        // 5 dakika içinde dolacaksa proaktif yenile (opsiyonel)
        console.log(`⏰ [API] Token ${Math.floor(timeUntilExpire / 60)} dakika içinde dolacak (proaktif yenileme yapılmıyor)`);
      }
    }
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Refresh token varsa X-Refresh-Token header'ını ekle
    const currentRefreshToken = await getRefreshToken();
    if (currentRefreshToken) {
      headers['X-Refresh-Token'] = currentRefreshToken;
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
    
    // DEBUG: Backend response'u kontrol et
    console.log('🔍 [API] Login response:', {
      hasToken: !!response.data?.token,
      hasRefreshToken: !!response.data?.refreshToken,
      keys: Object.keys(response.data || {})
    });
    
    // Access token'ı sakla
    if (response.data?.token) {
      await saveToken(response.data.token);
      console.log('✅ [API] Login - access token kaydedildi');
    }
    
    // Refresh token'ı sakla (React Native için gerekli - cookie çalışmaz)
    // Backend response'da refreshToken dönerse kaydet
    if (response.data?.refreshToken) {
      await saveRefreshToken(response.data.refreshToken);
      console.log('✅ [API] Login - refresh token kaydedildi (React Native fallback)');
    } else {
      console.error('❌ [API] Login - Backend refreshToken dönmedi! Cookie çalışmaz, AsyncStorage\'a kaydedilemedi!');
      console.error('⚠️ [API] Backend /api/auth/login endpoint\'i response body\'de refreshToken dönmeli!');
    }
    
    console.log('🍪 [API] Web için cookie de set edildi (kullanılmayabilir)');
    
    // Otomatik token yenilemeyi başlat
    startAutoTokenRefresh();
    lastTokenRefreshTime = Date.now();
    
    return response.data;
  },
  
  // Token yenileme
  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      console.log('🔄 [API] Token yenileme başlıyor (React Native fallback)...');
      
      // React Native için refresh token'ı AsyncStorage'dan al
      const refreshToken = await getRefreshToken();
      
      if (!refreshToken) {
        console.error('❌ [API] Refresh token bulunamadı');
        throw new Error('Refresh token bulunamadı');
      }
      
      // Body'de gönder - Backend fallback mekanizması ile çalışacak
      const response = await api.post('/api/auth/refresh', {
        refreshToken // Backend fallback için
      }, {
        timeout: 10000, // 10 saniye timeout
        withCredentials: true, // Web için cookie desteği
        metadata: { isRefreshRequest: true }
      } as any);
      
      // Yeni access token'ı kaydet
      if (response.data?.token) {
        await saveToken(response.data.token);
        console.log('✅ [API] Yeni access token kaydedildi');
      }
      
      // Yeni refresh token varsa kaydet (rotation)
      if (response.data?.refreshToken) {
        await saveRefreshToken(response.data.refreshToken);
        console.log('🔄 [API] Refresh token rotation: Yeni token kaydedildi');
      }
      
      // Son yenileme zamanını güncelle
      lastTokenRefreshTime = Date.now();
      
      console.log('🔄 [API] Token başarıyla yenilendi (React Native fallback)');
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] Token yenileme hatası:', error);
      
      // Refresh token geçersizse tüm token'ları temizle
      await removeAllTokens();
      
      // NOT: Burada logout_alert_needed flag set ETME!
      // Alert sadece interceptor'da 401/403 durumlarında set edilmeli.
      
      throw error;
    }
  },
  
  // Otomatik giriş yapma (persistent login)
  async persistentLogin(): Promise<LoginResponse> {
    // Persistent login başladığında flag'i set et
    isPersistentLoginInProgress = true;
    
    try {
      console.log('🔄 [API] Persistent login deneniyor (React Native fallback)...');
      
      // React Native için refresh token'ı AsyncStorage'dan al
      const refreshToken = await getRefreshToken();
      
      if (!refreshToken) {
        console.error('❌ [API] Refresh token bulunamadı (persistent login)');
        throw new Error('Refresh token bulunamadı');
      }
      
      // Body'de gönder - Backend fallback mekanizması
      const response = await api.post('/api/auth/persistent-login', {
        refreshToken // Backend fallback için
      }, {
        timeout: 15000, // 15 saniye timeout (daha stabil)
        withCredentials: true, // Web için cookie desteği
        metadata: { isRefreshRequest: true }
      } as any);
      
      if (response.data?.success && response.data?.token) {
        // Yeni access token'ı kaydet
        await saveToken(response.data.token);
        console.log('✅ [API] Persistent login - access token kaydedildi');
        
        // Yeni refresh token varsa kaydet
        if (response.data?.refreshToken) {
          await saveRefreshToken(response.data.refreshToken);
          console.log('🔄 [API] Persistent login - refresh token güncellendi');
        }
        
        // Otomatik token yenilemeyi başlat
        startAutoTokenRefresh();
        lastTokenRefreshTime = Date.now();
        
        console.log('✅ [API] Persistent login başarılı (React Native fallback)');
        
        // Başarılı olunca flag'i temizle - ancak grace period için biraz bekle
        setTimeout(() => {
          isPersistentLoginInProgress = false;
          console.log('🔓 [API] Persistent login flag temizlendi (grace period sonrası)');
        }, TOKEN_REFRESH_GRACE_PERIOD);
        
        return response.data;
      }
      
      throw new Error('Persistent login başarısız');
    } catch (error: any) {
      // Hata durumunda flag'i hemen temizle
      isPersistentLoginInProgress = false;
      console.log('🔓 [API] Persistent login flag temizlendi (hata sonrası)');
      
      console.log('❌ [API] Persistent login hatası:', error.message);
      
      // Geçersiz refresh token'ı temizle
      await removeAllTokens();
      
      // NOT: Burada logout_alert_needed flag set ETME!
      // Çünkü refresh token yoksa kullanıcı zaten normal logout yapmış demektir.
      // Alert sadece gerçek session timeout durumlarında (401/403) gösterilmeli.
      
      throw error;
    }
  },

  // Çıkış yapma
  logout: async (): Promise<LogoutResponse> => {
    try {
      // Backend'e logout isteği gönder (cookie'yi temizlemek için)
      const response = await api.post('/api/auth/logout', {}, {
        withCredentials: true // Cookie silme için gerekli
      });
      
      // Otomatik token yenilemeyi durdur
      stopAutoTokenRefresh();
      
      // Çıkış sonrası sadece access token'ı temizle
      // (Refresh token cookie backend tarafından zaten temizlendi)
      await removeAllTokens();
      
      console.log('✅ [API] Logout başarılı - otomatik yenileme durduruldu');
      console.log('🍪 [API] Refresh token cookie backend tarafından temizlendi');
      
      return response.data;
    } catch (error) {
      // Hata olsa bile otomatik yenilemeyi durdur ve token'ları temizle
      stopAutoTokenRefresh();
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
    console.log(`🔍 [API] Discover users çağrısı - page: ${page}, limit: ${limit}, refresh: ${refresh}`);
    try {
      const response = await api.get(`/api/swipes/discover?refresh=${refresh}&page=${page}&limit=${limit}`, authHeader);
      console.log(`✅ [API] Discover users yanıtı - ${response.data.users?.length || 0} kullanıcı, hasMore: ${response.data.hasMore}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] userApi.getDiscoverUsers hatası:', error);
      
      // Hata durumunda mock data döndür (development için)
      console.warn('⚠️ [API] Mock data döndürülüyor...');
      return createMockDiscoverResponse();
    }
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

// Swipe cleanup API'leri
export const swipeCleanupApi = {
  // Swipe kayıtlarını temizle (2 günlük otomatik)
  async cleanupSwipes(): Promise<{ success: boolean; deletedCount: number; message: string }> {
    console.log('🔄 [API] Swipe cleanup çağrısı (2 günlük)');
    const authHeader = await createAuthHeader();
    try {
      const response = await api.post('/api/swipes/cleanup', {}, authHeader);
      console.log('✅ [API] Swipe cleanup yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] Swipe cleanup hatası:', error.response?.data || error.message);
      throw error;
    }
  },

  // Özel gün sayısı ile swipe kayıtlarını temizle
  async cleanupSwipesByDays(daysOld: number): Promise<{ success: boolean; deletedCount: number; message: string }> {
    console.log(`🔄 [API] Swipe cleanup çağrısı (${daysOld} günlük)`);
    const authHeader = await createAuthHeader();
    try {
      const response = await api.post(`/api/swipes/cleanup?daysOld=${daysOld}`, {}, authHeader);
      console.log('✅ [API] Swipe cleanup yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] Swipe cleanup hatası:', error.response?.data || error.message);
      throw error;
    }
  },

  // Kaç kayıt silineceğini öğren
  async getCleanupStats(daysOld: number = 2): Promise<{ oldSwipesCount: number; message: string }> {
    console.log(`🔄 [API] Swipe cleanup stats çağrısı (${daysOld} günlük)`);
    const authHeader = await createAuthHeader();
    try {
      const response = await api.get(`/api/swipes/cleanup/stats?daysOld=${daysOld}`, authHeader);
      console.log('✅ [API] Swipe cleanup stats yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] Swipe cleanup stats hatası:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Swipe API'leri - Yeni Backend Sistemi
export const swipeApi = {
  // Ana discover endpoint - Yeni backend sistemi (15'li batch desteği)
  getDiscoverUsers: async (
    refresh: boolean = false, 
    showLikedMe: boolean = false, 
    page: number = 1, 
    limit: number = 15
  ): Promise<DiscoverResponse> => {
    console.log('🔄 [API] getDiscoverUsers çağrısı:', { refresh, showLikedMe, page, limit });
    const authHeader = await createAuthHeader();
    
    try {
      // Yeni backend endpoint'i kullan (15'li batch desteği)
      const url = `/api/swipes/discover?refresh=${refresh}&showLikedMe=${showLikedMe}&page=${page}&limit=${limit}&batchSize=15`;
      console.log('🔍 [API] Discover isteği gönderiliyor (15\'li batch):', url);
      
      const response = await api.get(url, authHeader);
      
      // Backend'den gelen response formatını normalize et
      const normalizedResponse = normalizeDiscoverResponse(response.data, refresh, showLikedMe, page, limit);
      
      console.log('✅ [API] getDiscoverUsers yanıtı:', {
        success: normalizedResponse.success,
        userCount: normalizedResponse.users?.length || 0,
        totalCount: normalizedResponse.totalCount,
        returnedCount: normalizedResponse.returnedCount,
        hasMore: normalizedResponse.hasMore,
        cooldownInfo: normalizedResponse.cooldownInfo,
        swipeLimitInfo: normalizedResponse.swipeLimitInfo,
        refresh: refresh,
        showLikedMe: showLikedMe,
        page: page,
        limit: limit,
        endpoint: url
      });
      
      return normalizedResponse;
    } catch (error: any) {
      console.error('❌ [API] getDiscoverUsers hatası:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        requestParams: { refresh, showLikedMe, page, limit }
      });
      
      // Token hatası ise kullanıcıyı bilgilendir
      if (error.message.includes('Token bulunamadı') || error.message.includes('Oturum süresi dolmuş')) {
        console.warn('⚠️ [API] Token hatası - Kullanıcı giriş yapmamış');
        throw new Error('Lütfen önce giriş yapın');
      }
      
      // Diğer hatalarda mock data döndür (development için)
      console.warn('⚠️ [API] Mock data döndürülüyor...');
      return createMockDiscoverResponse();
    }
  },

  // Normal discover - İlk giriş için
  getNormalDiscover: async (page: number = 1, limit: number = 10): Promise<DiscoverResponse> => {
    return swipeApi.getDiscoverUsers(false, false, page, limit);
  },

  // Yenileme - Cooldown süresi geçmiş kullanıcılar için
  getRefreshDiscover: async (page: number = 1, limit: number = 10): Promise<DiscoverResponse> => {
    return swipeApi.getDiscoverUsers(true, false, page, limit);
  },

  // Premium özellik - Beni beğenenleri gör
  getLikedMeDiscover: async (page: number = 1, limit: number = 10): Promise<DiscoverResponse> => {
    return swipeApi.getDiscoverUsers(false, true, page, limit);
  },

  // Eski endpoint'ler - Geriye uyumluluk için
  getAllUsers: async (limit: number = 20): Promise<DiscoverResponse> => {
    console.log('🔄 [API] getAllUsers çağrısı (eski endpoint):', { limit });
    return swipeApi.getNormalDiscover(1, limit);
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
      
      // Hata durumunda boş response döndür
      console.warn('⚠️ [API] Boş response döndürülüyor...');
      return {
        users: [],
        totalCount: 0,
        hasMore: false
      };
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

  // Swipe işlemi yap - Yeni backend sistemi
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
      // Backend'de toUserId alanı bekleniyor
      const requestData = {
        action: swipeData.action,
        toUserId: swipeData.userId || swipeData.toUserId // Backend formatına uygun
      };
      
      console.log('📤 [API] Swipe request data:', requestData);
      
      const response = await api.post('/api/swipes', requestData, authHeader);
      console.log('✅ [API] swipe yanıtı:', response.data);
      
      // Yeni backend sistemi yanıt bilgilerini log'la
      if (response.data.swipeLimitInfo) {
        console.log('📊 [API] Swipe limit bilgisi:', {
          isPremium: response.data.swipeLimitInfo.isPremium,
          remainingSwipes: response.data.swipeLimitInfo.remainingSwipes,
          canSwipe: response.data.swipeLimitInfo.canSwipe,
          nextResetTime: response.data.swipeLimitInfo.nextResetTime
        });
      }
      
      if (response.data.cooldownInfo) {
        console.log('⏰ [API] Cooldown bilgisi:', {
          canRefresh: response.data.cooldownInfo.canRefresh,
          nextRefreshTime: response.data.cooldownInfo.nextRefreshTime,
          remainingSeconds: response.data.cooldownInfo.remainingSeconds
        });
      }
      
      // Eski sistem uyumluluğu için
      if (response.data.remainingSwipes !== undefined) {
        console.log('📊 [API] Kalan swipe hakkı (eski sistem):', response.data.remainingSwipes);
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
      
      // Hata durumunda boş response döndür
      console.warn('⚠️ [API] Boş response döndürülüyor...');
      return {
        matches: [],
        totalCount: 0
      };
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
      
      // Hata durumunda boş response döndür
      console.warn('⚠️ [API] Boş response döndürülüyor...');
      return {
        success: true,
        users: [],
        totalCount: 0,
        hasMore: false,
        currentPage: 1,
        limit: limit
      };
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
      
      // Hata durumunda default değerler döndür
      console.warn('⚠️ [API] Default değerler döndürülüyor...');
      return {
        isPremium: false,
        remainingSwipes: 0,
        dailySwipeCount: 0,
        canSwipe: false
      };
    }
  },

  // Yeni backend sistemi için yardımcı fonksiyonlar
  // Cooldown durumunu kontrol et
  getCooldownInfo: async (): Promise<{ canRefresh: boolean; nextRefreshTime: string; remainingSeconds: number; message: string }> => {
    console.log('🔄 [API] getCooldownInfo çağrısı');
    try {
      // Discover endpoint'inden cooldown bilgisini al
      const response = await swipeApi.getDiscoverUsers(false, false, 1, 1);
      return response.cooldownInfo || {
        canRefresh: true,
        nextRefreshTime: new Date().toISOString(),
        remainingSeconds: 0,
        message: 'Yenileme hazır'
      };
    } catch (error) {
      console.error('❌ [API] getCooldownInfo hatası:', error);
      return {
        canRefresh: true,
        nextRefreshTime: new Date().toISOString(),
        remainingSeconds: 0,
        message: 'Yenileme hazır'
      };
    }
  },

  // Premium durumunu kontrol et
  isPremiumUser: async (): Promise<boolean> => {
    try {
      const limitInfo = await swipeApi.getSwipeLimitInfo();
      return limitInfo.isPremium;
    } catch (error) {
      console.error('❌ [API] isPremiumUser hatası:', error);
      return false;
    }
  },

  // Swipe yapılabilir mi kontrol et
  canSwipe: async (): Promise<boolean> => {
    try {
      const limitInfo = await swipeApi.getSwipeLimitInfo();
      return limitInfo.canSwipe;
    } catch (error) {
      console.error('❌ [API] canSwipe hatası:', error);
      return false;
    }
  },

  // Swipe limit durumunu detaylı kontrol et
  getSwipeLimitStatus: async (): Promise<{
    canSwipe: boolean;
    remainingSwipes: number;
    isLimitReached: boolean;
    limitMessage: string;
    isPremium: boolean;
    nextResetTime: string;
  }> => {
    try {
      const limitInfo = await swipeApi.getSwipeLimitInfo();
      return {
        canSwipe: limitInfo.canSwipe,
        remainingSwipes: limitInfo.remainingSwipes,
        isLimitReached: limitInfo.isLimitReached || false,
        limitMessage: limitInfo.limitMessage || `Kalan swipe: ${limitInfo.remainingSwipes}`,
        isPremium: limitInfo.isPremium,
        nextResetTime: limitInfo.nextResetTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
    } catch (error) {
      console.error('❌ [API] getSwipeLimitStatus hatası:', error);
      return {
        canSwipe: false,
        remainingSwipes: 0,
        isLimitReached: true,
        limitMessage: 'Swipe limit bilgisi alınamadı',
        isPremium: false,
        nextResetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
    }
  },

  // Swipe limit uyarısı göster
  showSwipeLimitWarning: async (): Promise<void> => {
    try {
      const status = await swipeApi.getSwipeLimitStatus();
      
      if (status.isLimitReached) {
        console.warn('⚠️ [SWIPE] Limit doldu:', status.limitMessage);
        
        // Burada kullanıcıya uyarı gösterilebilir
        // Örneğin: Alert, Modal, Toast mesajı
        // showAlert('Swipe Limiti', status.limitMessage);
      } else if (status.remainingSwipes <= 5) {
        console.warn('⚠️ [SWIPE] Limit az kaldı:', status.limitMessage);
        
        // Burada kullanıcıya uyarı gösterilebilir
        // showAlert('Swipe Limiti', status.limitMessage);
      }
    } catch (error) {
      console.error('❌ [API] showSwipeLimitWarning hatası:', error);
    }
  }
};

// ============================================
// BLOCK API - Engelleme İşlemleri
// ============================================

// Block API'leri
export const blockApi = {
  // Kullanıcıyı engelle
  blockUser: async (
    blockedUserId: number,
    reason?: string,
    context?: 'CHAT' | 'PROFILE' | 'SWIPE',
    matchId?: number
  ): Promise<any> => {
    console.log('🔄 [API] blockUser çağrısı:', { blockedUserId, reason, context, matchId });
    const authHeader = await createAuthHeader();
    try {
      const response = await api.post('/api/blocks', {
        blockedUserId,
        reason,
        context: context || 'PROFILE',
        matchId
      }, authHeader);
      
      console.log('✅ [API] blockUser yanıtı:', {
        success: response.data.success,
        blockId: response.data.blockId,
        blockedAt: response.data.blockedAt
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] blockUser hatası:', error.response?.data || error.message);
      
      // Zaten engelli durumu (idempotent)
      if (error.response?.status === 400 && error.response?.data?.error?.includes('zaten')) {
        console.log('ℹ️ [API] Kullanıcı zaten engelli');
        return { success: true, message: 'Kullanıcı zaten engelli' };
      }
      throw error;
    }
  },

  // Engeli kaldır
  unblockUser: async (blockedUserId: number): Promise<any> => {
    console.log('🔄 [API] unblockUser çağrısı:', { blockedUserId });
    const authHeader = await createAuthHeader();
    try {
      const response = await api.delete(`/api/blocks/${blockedUserId}`, authHeader);
      console.log('✅ [API] unblockUser yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] unblockUser hatası:', error.response?.data || error.message);
      throw error;
    }
  },

  // Engellenen kullanıcılar listesi
  getBlockedUsers: async (): Promise<any[]> => {
    console.log('🔄 [API] getBlockedUsers çağrısı');
    const authHeader = await createAuthHeader();
    try {
      const response = await api.get('/api/blocks', authHeader);
      console.log('✅ [API] getBlockedUsers yanıtı:', {
        count: response.data?.length || 0
      });
      return response.data || [];
    } catch (error: any) {
      console.error('❌ [API] getBlockedUsers hatası:', error.response?.data || error.message);
      return [];
    }
  },

  // Engelleme durumunu kontrol et
  checkBlockStatus: async (userId: number): Promise<any> => {
    console.log('🔄 [API] checkBlockStatus çağrısı:', { userId });
    const authHeader = await createAuthHeader();
    try {
      const response = await api.get(`/api/blocks/check/${userId}`, authHeader);
      console.log('✅ [API] checkBlockStatus yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] checkBlockStatus hatası:', error.response?.data || error.message);
      throw error;
    }
  }
};

// ============================================
// UNMATCH API - Eşleşme Kaldırma
// ============================================

// Unmatch API'leri
export const unmatchApi = {
  // Eşleşmeyi kaldır (Body ile)
  unmatchUser: async (matchOrChatRoomId: number): Promise<any> => {
    console.log('🔄 [API] unmatchUser çağrısı (Body):', { matchOrChatRoomId });
    const authHeader = await createAuthHeader();
    try {
      const response = await api.post('/api/unmatch', {
        id: matchOrChatRoomId
      }, authHeader);
      
      console.log('✅ [API] unmatchUser yanıtı:', {
        success: response.data.success,
        matchId: response.data.matchId,
        unmatchedAt: response.data.unmatchedAt
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] unmatchUser hatası:', error.response?.data || error.message);
      
      // 404 = User enumeration koruması
      if (error.response?.status === 404) {
        throw new Error('Bu eşleşme bulunamadı veya erişim yetkiniz yok');
      }
      
      // Zaten unmatch yapılmış (idempotent)
      if (error.response?.status === 400 && error.response?.data?.error?.includes('Eşleşme')) {
        console.log('ℹ️ [API] Eşleşme zaten kaldırılmış (idempotent)');
        return error.response.data;
      }
      
      throw error;
    }
  },

  // Eşleşmeyi kaldır (Path variable ile)
  unmatchUserById: async (matchOrChatRoomId: number): Promise<any> => {
    console.log('🔄 [API] unmatchUserById çağrısı (Path):', { matchOrChatRoomId });
    const authHeader = await createAuthHeader();
    try {
      const response = await api.post(`/api/unmatch/${matchOrChatRoomId}`, {}, authHeader);
      
      console.log('✅ [API] unmatchUserById yanıtı:', {
        success: response.data.success,
        matchId: response.data.matchId
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] unmatchUserById hatası:', error.response?.data || error.message);
      
      // 404 = User enumeration koruması
      if (error.response?.status === 404) {
        throw new Error('Bu eşleşme bulunamadı veya erişim yetkiniz yok');
      }
      
      throw error;
    }
  }
};

// ============================================
// RELATIONSHIP API - Eşleşme İlişkisi (Backward Compatibility)
// ============================================

// Relationship durumu DTO
export interface MatchRelationship {
  matchId: number;
  status: 'ACTIVE' | 'UNMATCHED' | 'ARCHIVED';
  isBlocked: boolean;
  blockedByMe: boolean;
  isUnmatched: boolean;
  unmatchedByMe: boolean;
  canChat: boolean;
  canRematch: boolean;
  cooldownUntil: string | null;
  statusText: string;
  actionText: string;
  
  // Detaylı unmatch bilgileri
  unmatchDetails?: {
    unmatchedAt: string;
    unmatchedBy: number;
    reason?: string;
    canRematchAfter?: string;
  };
  
  // Tekrar eşleşme durumu
  rematchInfo?: {
    isAvailable: boolean;
    previousMatchCount: number;
    lastMatchedAt?: string;
  };
}

// Unmatch response DTO (Backward Compatibility)
export interface UnmatchResponse {
  success: boolean;
  message: string;
  relationship?: MatchRelationship;
  
  // 3 adımlı süreç bilgileri
  operations?: {
    matchStatusUpdated: boolean;
    chatRoomClosed: boolean;
    swipeHistoryCleared: boolean;
  };
  
  // Tekrar eşleşme bilgisi
  canRematchImmediately?: boolean;
}

// Engellenen kullanıcı DTO
export interface BlockedUser {
  userId: number;
  username: string;
  displayName: string;
  profileImageUrl: string | null;
  blockedAt: string;
  context: 'CHAT' | 'PROFILE' | 'SWIPE';
}

// ⚠️ DEPRECATED: Yeni API'ler blockApi ve unmatchApi kullanınız
// Backward compatibility için korunmuştur
export const relationshipApi = {
  // Eşleşme ilişki durumunu getir
  getRelationship: async (matchId: number): Promise<MatchRelationship> => {
    console.log('🔄 [API] getRelationship çağrısı (DEPRECATED):', { matchId });
    const authHeader = await createAuthHeader();
    try {
      const response = await api.get(`/api/matches/${matchId}/relationship`, authHeader);
      console.log('✅ [API] getRelationship yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] getRelationship hatası:', error.response?.data || error.message);
      
      // 404 durumunda özel hata
      if (error.response?.status === 404) {
        throw new Error('Bu eşleşme artık mevcut değil');
      }
      throw error;
    }
  },

  // Kullanıcıyı engelle (DEPRECATED - blockApi.blockUser kullanınız)
  blockUser: async (userId: number, context: 'CHAT' | 'PROFILE' | 'SWIPE' = 'CHAT'): Promise<any> => {
    console.log('🔄 [API] relationshipApi.blockUser çağrısı (DEPRECATED - blockApi kullanınız)');
    return blockApi.blockUser(userId, undefined, context);
  },

  // Engeli kaldır (DEPRECATED - blockApi.unblockUser kullanınız)
  unblockUser: async (userId: number): Promise<any> => {
    console.log('🔄 [API] relationshipApi.unblockUser çağrısı (DEPRECATED - blockApi kullanınız)');
    return blockApi.unblockUser(userId);
  },

  // Eşleşmeyi kaldır (DEPRECATED - unmatchApi.unmatchUser kullanınız)
  unmatchUser: async (idOrChatRoomId: number, reason?: string): Promise<UnmatchResponse> => {
    console.log('🔄 [API] relationshipApi.unmatchUser çağrısı (DEPRECATED - unmatchApi kullanınız)');
    try {
      const response = await unmatchApi.unmatchUser(idOrChatRoomId);
      return {
        success: response.success,
        message: response.message
      };
    } catch (error) {
      throw error;
    }
  },

  // Engellenen kullanıcılar listesi (DEPRECATED - blockApi.getBlockedUsers kullanınız)
  getBlockedUsers: async (): Promise<BlockedUser[]> => {
    console.log('🔄 [API] relationshipApi.getBlockedUsers çağrısı (DEPRECATED - blockApi kullanınız)');
    return blockApi.getBlockedUsers();
  },

  // Kullanıcıyı şikayet et
  reportUser: async (userId: number, reason: string, description?: string): Promise<{ success: boolean; message: string }> => {
    console.log('🔄 [API] reportUser çağrısı:', { userId, reason });
    const authHeader = await createAuthHeader();
    try {
      const response = await api.post(`/api/users/${userId}/report`, { 
        reason, 
        description 
      }, authHeader);
      console.log('✅ [API] reportUser yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] reportUser hatası:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Chat API'leri için interface'ler
export interface ChatUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  profileImageUrl: string | null;
  zodiacSign: string | null;
  zodiacSignDisplay: string | null;
  isPremium: boolean;
  gender: string | null;
  lastActiveTime: string | null;
  activityStatus: string;
  isOnline: boolean;
  displayName: string;
}

export interface PrivateChatRoom {
  id: number;
  type: 'PRIVATE';
  name: string;
  otherUser: ChatUser;
  lastMessage: {
    id: number;
    content: string;
    sentAt: string;
    sender: ChatUser;
  } | null;
  unreadCount: number;
  matchId: number;
  matchType: 'ZODIAC' | 'MUSIC'; // Backend'den gelen match type
  displayName: string;
  timeAgo: string;
  isActive?: boolean; // Chat room aktif mi (unmatch/block sonrası false olur)
  closedReason?: 'UNMATCH' | 'BLOCK' | null; // Chat neden kapatıldı
}

export interface PrivateChatListResponse {
  success: boolean;
  privateChatRooms: PrivateChatRoom[];
  count: number;
  message: string;
}

export interface ChatMessage {
  id: number;
  chatRoomId: number;
  content: string;
  type: 'TEXT' | 'SYSTEM' | 'IMAGE';
  sentAt: string;
  editedAt: string | null;
  isEdited: boolean;
  status: 'SENT' | 'DELIVERED' | 'READ';
  sender: ChatUser;
  timeAgo: string;
  canEdit: boolean;
  canDelete: boolean;
}

export interface MessageLimitInfo {
  canSendMessage: boolean;
  nextAllowedTime: string | null;
  remainingSeconds: number;
  isPremium: boolean;
  isBanned: boolean;
  message: string;
}

export interface GlobalChatResponse {
  chatRoomId: number;
  chatType: 'GLOBAL';
  chatName: string;
  activeUserCount: number;
  messages: ChatMessage[];
  currentPage: number;
  totalPages: number;
  totalMessages: number;
  hasMore: boolean;
  userMessageLimit: MessageLimitInfo;
  isActive: boolean;
  welcomeMessage: string;
}

export interface PrivateChatResponse {
  chatRoomId: number;
  chatName: string;
  createdAt: string;
  otherUser: ChatUser;
  matchId: number;
  matchType: 'ZODIAC' | 'MUSIC'; // Backend'den gelen match type
  compatibilityScore: number;
  messages: ChatMessage[];
  currentPage: number;
  totalPages: number;
  totalMessages: number;
  hasMore: boolean;
  isActive: boolean;
  unreadCount: number;
  lastActivity: string;
  matchDate: string;
  compatibilityMessage: string;
}

export interface SendGlobalMessageRequest {
  content: string;
}

export interface SendPrivateMessageRequest {
  content: string;
  receiverId: number;
}

export interface SendMessageResponse {
  success: boolean;
  message: ChatMessage;
  info: string;
}

export interface ChatListItem {
  chatRoomId: number;
  chatType: 'GLOBAL' | 'PRIVATE';
  chatName: string;
  lastMessage: ChatMessage | null;
  unreadCount: number;
  lastActivity: string;
  otherUser?: ChatUser;
  matchType?: 'ZODIAC' | 'MUSIC';
  activeUserCount?: number;
}

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
      
      // Hata durumunda boş response döndür
      console.warn('⚠️ [API] Boş response döndürülüyor...');
      return {
        matches: []
      };
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
      
      // Hata durumunda hata fırlat (bu fonksiyon için gerekli)
      throw new Error('Eşleşme detayı alınamadı');
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
      
      // Hata durumunda hata fırlat (bu fonksiyon için gerekli)
      throw new Error('Eşleşme silinemedi');
    }
  }
};

// Chat API'leri
export const chatApi = {
  // Private chat listesini getir
  getPrivateChatList: async (): Promise<PrivateChatListResponse> => {
    console.log('🔄 [API] getPrivateChatList çağrısı');
    
    try {
      const authHeader = await createAuthHeader();
      // Backend'den tüm chat'leri al (aktif/inaktif)
      const response = await api.get('/api/chat/private/list', authHeader);
      
      const rooms = response.data.privateChatRooms || [];
      
      // ⚠️ BACKEND BUG FIX: Backend kapalı chat'leri filtrelemiyor
      // Frontend'de filtreleme yap
      const activeRooms = rooms.filter((r: any) => {
        // isActive field'ı varsa ve false ise filtrele
        if (r.isActive === false) return false;
        
        // closedReason varsa filtrele (UNMATCH veya BLOCK)
        if (r.closedReason) return false;
        return true;
      });
      
      const inactiveRooms = rooms.filter((r: any) => !activeRooms.includes(r));
      
      console.log('✅ [API] getPrivateChatList yanıtı:', {
        totalFromBackend: rooms.length,
        activeChats: activeRooms.length,
        filteredOut: inactiveRooms.length,
        success: response.data.success,
        message: response.data.message
      });
      
      // Inactive chat'leri detaylı logla
      if (inactiveRooms.length > 0) {
        console.log('🔍 [API] Filtered out chat rooms:', inactiveRooms.map((r: any) => ({
          id: r.id,
          matchId: r.matchId,
          otherUser: r.otherUser?.username,
          isActive: r.isActive,
          closedReason: r.closedReason
        })));
      }
      
      // Filtrelenmiş response döndür
      return {
        ...response.data,
        privateChatRooms: activeRooms,
        count: activeRooms.length
      };
    } catch (error: any) {
      console.error('❌ [API] getPrivateChatList hatası:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // 500 hatası özel durumu - backend'de kullanıcı bulunamadı
      if (error.response?.status === 500) {
        const errorData = error.response.data;
        if (errorData?.error?.includes('Kullanıcı bulunamadı')) {
          console.error('🔍 [API] Backend kullanıcı bulunamadı hatası - Token problemi tespit edildi');
          
          // Token'ı yeniden kontrol et
          const token = await getToken();
          if (token) {
            const decodedToken = decodeJWT(token);
            console.error('🔍 [API] Problematik token içeriği:', decodedToken);
            
            // Token'da sadece username var, userId yok - bu backend JWT konfigürasyon hatası
            if (decodedToken?.sub && !decodedToken?.userId && !decodedToken?.id) {
              console.error('❌ [API] JWT Token yapılandırma hatası: Token\'da kullanıcı ID\'si yok, sadece username var');
              console.error('🔧 [API] Backend\'de JWT token oluşturulurken userId field\'ı eklenmeli');
              
              // Geçici çözüm: Token'ı yenilemeyi dene
              try {
                console.log('🔄 [API] Token yenileme deneniyor...');
                await authApi.refreshToken();
                
                // Yenilenen token ile tekrar dene
                const newAuthHeader = await createAuthHeader();
                const retryResponse = await api.get('/api/chat/private/list', newAuthHeader);
                
                console.log('✅ [API] Token yenileme sonrası başarılı:', {
                  chatCount: retryResponse.data.privateChatRooms?.length || 0,
                  success: retryResponse.data.success
                });
                
                return retryResponse.data;
              } catch (refreshError) {
                console.error('❌ [API] Token yenileme de başarısız:', refreshError);
              }
            }
          }
          
          // Kullanıcı dostu hata mesajı
          throw new Error('Token yapılandırma sorunu tespit edildi. Backend geliştiricisi ile iletişime geçin.');
        }
      }
      
      // 401 hatası - Token geçersiz
      if (error.response?.status === 401) {
        console.error('🔒 [API] 401 Unauthorized - Token geçersiz');
        throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      }
      
      // Diğer hatalar
      throw error;
    }
  },

  // Genel chat mesajlarını getir
  getGlobalMessages: async (page: number = 0, size: number = 20): Promise<GlobalChatResponse> => {
    console.log('🔄 [API] getGlobalMessages çağrısı:', { page, size });
    const authHeader = await createAuthHeader();
    try {
      const response = await api.get(`/api/chat/global/messages?page=${page}&size=${size}`, authHeader);
      console.log('✅ [API] getGlobalMessages yanıtı:', {
        messageCount: response.data.messages?.length || 0,
        activeUsers: response.data.activeUserCount,
        canSendMessage: response.data.userMessageLimit?.canSendMessage
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] getGlobalMessages hatası:', error.response?.data || error.message);
      throw error;
    }
  },

  // Genel chat'e mesaj gönder
  sendGlobalMessage: async (data: SendGlobalMessageRequest): Promise<SendMessageResponse> => {
    console.log('🔄 [API] sendGlobalMessage çağrısı:', { contentLength: data.content.length });
    const authHeader = await createAuthHeader();
    try {
      const response = await api.post('/api/chat/global/send', data, authHeader);
      console.log('✅ [API] sendGlobalMessage yanıtı: Mesaj gönderildi');
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] sendGlobalMessage hatası:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Özel hata durumları
      if (error.response?.status === 429) {
        const errorMessage = error.response?.data?.error || 'Mesaj gönderme limiti doldu';
        throw new Error(errorMessage);
      }
      
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.error || 'Mesaj içeriği uygunsuz';
        throw new Error(errorMessage);
      }
      
      throw error;
    }
  },

  // Mesaj limiti bilgisini getir
  getMessageLimitInfo: async (): Promise<MessageLimitInfo> => {
    console.log('🔄 [API] getMessageLimitInfo çağrısı');
    const authHeader = await createAuthHeader();
    try {
      const response = await api.get('/api/chat/limit-info', authHeader);
      console.log('✅ [API] getMessageLimitInfo yanıtı:', {
        canSendMessage: response.data.canSendMessage,
        isPremium: response.data.isPremium,
        remainingSeconds: response.data.remainingSeconds
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] getMessageLimitInfo hatası:', error.response?.data || error.message);
      throw error;
    }
  },

  // Mesaj durumlarını güncelle (sadece durum kontrolü için)
  updateMessageStatuses: async (chatRoomId: number, messageIds: number[]): Promise<{ [key: number]: string }> => {
    console.log('🔄 [API] updateMessageStatuses çağrısı:', { chatRoomId, messageCount: messageIds.length });
    const authHeader = await createAuthHeader();
    try {
      const response = await api.post('/api/chat/message-statuses', {
        chatRoomId,
        messageIds
      }, authHeader);
      
      console.log('✅ [API] updateMessageStatuses yanıtı:', {
        updatedCount: Object.keys(response.data).length
      });
      return response.data; // { messageId: status } formatında
    } catch (error: any) {
      console.error('❌ [API] updateMessageStatuses hatası:', error.response?.data || error.message);
      throw error;
    }
  },

  // Özel chat mesajlarını getir
  getPrivateMessages: async (chatRoomId: number, page: number = 0, size: number = 20): Promise<PrivateChatResponse> => {
    console.log('🔄 [API] getPrivateMessages çağrısı:', { chatRoomId, page, size });
    const authHeader = await createAuthHeader();
    try {
      const response = await api.get(`/api/chat/private/${chatRoomId}/messages?page=${page}&size=${size}`, authHeader);
      
      // otherUser veya matchId eksik mi kontrol et
      if (!response.data.otherUser || !response.data.otherUser.id || !response.data.matchId) {
        console.warn('⚠️ [API] getPrivateMessages - otherUser veya matchId eksik:', {
          hasOtherUser: !!response.data.otherUser,
          otherUserId: response.data.otherUser?.id,
          matchId: response.data.matchId
        });
        console.warn('⚠️ [API] Backend /api/chat/private/{id}/messages endpoint\'inde eksik veri döndürüyor. Backend düzeltilmesi gerekli.');
      }
      
      console.log('✅ [API] getPrivateMessages yanıtı:', {
        messageCount: response.data.messages?.length || 0,
        otherUser: response.data.otherUser?.displayName,
        otherUserId: response.data.otherUser?.id,
        matchId: response.data.matchId,
        unreadCount: response.data.unreadCount
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] getPrivateMessages hatası:', {
        status: error.response?.status,
        data: error.response?.data,
        chatRoomId
      });
      
      if (error.response?.status === 403) {
        throw new Error('Bu sohbete erişim yetkiniz yok');
      }
      
      throw error;
    }
  },

  // Özel mesaj gönder
  sendPrivateMessage: async (data: SendPrivateMessageRequest): Promise<SendMessageResponse> => {
    console.log('🔄 [API] sendPrivateMessage çağrısı:', { 
      receiverId: data.receiverId, 
      contentLength: data.content.length 
    });
    const authHeader = await createAuthHeader();
    try {
      const response = await api.post('/api/chat/private/send', data, authHeader);
      console.log('✅ [API] sendPrivateMessage yanıtı: Özel mesaj gönderildi');
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] sendPrivateMessage hatası:', {
        status: error.response?.status,
        data: error.response?.data,
        receiverId: data.receiverId
      });
      
      // Özel hata durumları
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.error || 'Geçersiz mesaj verisi';
        throw new Error(errorMessage);
      }
      
      if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.error || 'Sunucu hatası';
        if (errorMessage.includes('Transaction silently rolled back')) {
          throw new Error('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
        }
        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      }
      
      throw error;
    }
  },

  // Chat listesini getir (hem genel hem özel chatler için)
  getChatList: async (): Promise<ChatListItem[]> => {
    console.log('🔄 [API] getChatList çağrısı');
    const authHeader = await createAuthHeader();
    try {
      // Önce genel chat bilgisini al
      const globalResponse = await api.get('/api/chat/global/messages?page=0&size=1', authHeader);
      
      // Sonra özel chatları al (bu endpoint backend'de oluşturulmalı)
      let privateChats: ChatListItem[] = [];
      try {
        const privateResponse = await api.get('/api/chat/private/list', authHeader);
        privateChats = privateResponse.data.chats || [];
      } catch (error) {
        console.warn('Private chat list alınamadı:', error);
      }

      // Chat listesini birleştir
      const chatList: ChatListItem[] = [
        // Genel chat
        {
          chatRoomId: globalResponse.data.chatRoomId,
          chatType: 'GLOBAL' as const,
          chatName: '🌍 Genel Sohbet',
          lastMessage: globalResponse.data.messages?.[0] || null,
          unreadCount: 0,
          lastActivity: globalResponse.data.messages?.[0]?.sentAt || new Date().toISOString(),
          activeUserCount: globalResponse.data.activeUserCount
        },
        // Özel chatlar
        ...privateChats
      ];

      console.log('✅ [API] getChatList yanıtı:', {
        totalChats: chatList.length,
        globalActiveUsers: globalResponse.data.activeUserCount,
        privateChats: privateChats.length
      });
      
      return chatList;
    } catch (error: any) {
      console.error('❌ [API] getChatList hatası:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Otomatik token yenileme fonksiyonlarını export et
export { checkAndRefreshTokenIfNeeded, startAutoTokenRefresh, stopAutoTokenRefresh };

export default api; 