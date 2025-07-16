import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

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
 * @param refreshToken Refresh token
 */
export const saveRefreshToken = async (refreshToken: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    console.log('Refresh token başarıyla kaydedildi');
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