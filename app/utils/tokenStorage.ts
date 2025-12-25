import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Token Storage Utility
 * 
 * ⚠️ ÖNEMLI: REFRESH TOKEN ARTIK HttpOnly COOKIE İLE YÖNETİLİYOR
 * 
 * Backend değişiklikleri (2025):
 * - Refresh token artık HttpOnly Cookie ile gönderiliyor (XSS koruması)
 * - Refresh token rotation uygulandı (güvenlik)
 * - Cookie-based authentication (withCredentials: true)
 * 
 * Frontend'de:
 * - Sadece ACCESS TOKEN AsyncStorage'da saklanıyor
 * - Refresh token cookie backend tarafından otomatik yönetiliyor
 * - Refresh token ile ilgili fonksiyonlar geriye dönük uyumluluk için @deprecated
 * 
 * API Kullanımı:
 * - Login: Access token body'de, refresh token cookie'de
 * - Refresh: Body boş, refresh token cookie'den okunur
 * - Logout: Backend'e istek gönderilmeli (cookie temizleme için)
 */

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token'; // Geriye dönük uyumluluk için korundu

/**
 * JWT token'ı AsyncStorage'a kaydeder
 * @param token JWT token
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    console.log('Token başarıyla kaydedildi');
  } catch (error) {
    console.error('Token kaydedilirken hata oluştu:', error);
    throw error;
  }
};

/**
 * Refresh token'ı AsyncStorage'a kaydeder
 * NOT: React Native'de cookie çalışmadığı için AsyncStorage kullanmak zorundayız.
 * Backend'in fallback mekanizması (body'de token) ile çalışır.
 * @param refreshToken Refresh token
 */
export const saveRefreshToken = async (refreshToken: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    console.log('✅ Refresh token başarıyla kaydedildi (React Native fallback)');
  } catch (error) {
    console.error('Refresh token kaydedilirken hata oluştu:', error);
    throw error;
  }
};

/**
 * JWT token'ı AsyncStorage'dan alır
 * @returns JWT token veya null (token yoksa)
 */
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Token alınırken hata oluştu:', error);
    return null;
  }
};

/**
 * Refresh token'ı AsyncStorage'dan alır
 * NOT: React Native'de cookie çalışmadığı için AsyncStorage kullanılır.
 * @returns Refresh token veya null (token yoksa)
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    return refreshToken;
  } catch (error) {
    console.error('Refresh token alınırken hata oluştu:', error);
    return null;
  }
};

/**
 * JWT token'ı AsyncStorage'dan siler
 */
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    console.log('Token başarıyla silindi');
  } catch (error) {
    console.error('Token silinirken hata oluştu:', error);
    throw error;
  }
};

/**
 * Refresh token'ı AsyncStorage'dan siler
 * NOT: React Native'de AsyncStorage kullanılır.
 */
export const removeRefreshToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    console.log('Refresh token başarıyla silindi');
  } catch (error) {
    console.error('Refresh token silinirken hata oluştu:', error);
    throw error;
  }
};

/**
 * Hem access token hem refresh token'ı siler
 */
export const removeAllTokens = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(REFRESH_TOKEN_KEY)
    ]);
    console.log('Tüm token\'lar başarıyla silindi');
  } catch (error) {
    console.error('Token\'lar silinirken hata oluştu:', error);
    throw error;
  }
};

/**
 * JWT token'ın varlığını kontrol eder (oturum açık mı)
 * @returns token varsa true, yoksa false
 */
export const hasToken = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token !== null;
  } catch (error) {
    console.error('Token kontrol edilirken hata oluştu:', error);
    return false;
  }
};

/**
 * Refresh token'ın varlığını kontrol eder
 * @returns refresh token varsa true, yoksa false
 */
export const hasRefreshToken = async (): Promise<boolean> => {
  try {
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    return refreshToken !== null;
  } catch (error) {
    console.error('Refresh token kontrol edilirken hata oluştu:', error);
    return false;
  }
};

/**
 * JWT token'ın süresini kontrol eder
 * @param token JWT token
 * @returns token geçerliyse true, süresi dolmuşsa false
 */
export const isTokenValid = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Token'ın süresi dolmuş mu kontrol et
    if (payload.exp && payload.exp < currentTime) {
      console.log('⚠️ [TOKEN] Token süresi dolmuş');
      return false;
    }
    
    console.log('✅ [TOKEN] Token geçerli');
    return true;
  } catch (error) {
    console.error('❌ [TOKEN] Token parse hatası:', error);
    return false;
  }
};

/**
 * Token'ın ne kadar süre sonra dolacağını hesaplar
 * @param token JWT token
 * @returns saniye cinsinden kalan süre
 */
export const getTokenTimeRemaining = (token: string): number => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    if (payload.exp) {
      const remaining = payload.exp - currentTime;
      return Math.max(0, remaining);
    }
    
    return 0;
  } catch (error) {
    console.error('❌ [TOKEN] Token süre hesaplama hatası:', error);
    return 0;
  }
};

/**
 * Token'ın 5 dakika içinde dolup dolmayacağını kontrol eder
 * @param token JWT token
 * @returns 5 dakika içinde dolacaksa true
 */
export const isTokenExpiringSoon = (token: string): boolean => {
  const remaining = getTokenTimeRemaining(token);
  return remaining < 300; // 5 dakika = 300 saniye
};

// Default export
export default {
  getToken,
  saveToken,
  removeToken,
  getRefreshToken,
  saveRefreshToken,
  removeRefreshToken,
  removeAllTokens,
  hasToken,
  hasRefreshToken,
  isTokenValid,
  getTokenTimeRemaining,
  isTokenExpiringSoon
}; 