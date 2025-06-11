import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';

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
 * JWT token'ın varlığını kontrol eder (oturum açık mı)
 * @returns token varsa true, yoksa false
 */
export const hasToken = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token !== null;
  } catch (error) {
    console.error('Token kontrolü yapılırken hata oluştu:', error);
    return false;
  }
}; 