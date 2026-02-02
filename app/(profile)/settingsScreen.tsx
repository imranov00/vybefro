import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useProfile } from '../context/ProfileContext';
import { authApi } from '../services/api';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(false);
  const { logout, currentMode } = useAuth();
  const { clearAllCache } = useChat();
  const { clearCache } = useProfile();
  
  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // API'yi çağırarak çıkış yap
              const response = await authApi.logout();
              console.log('Çıkış yanıtı:', response);
              
              // Cache temizleme fonksiyonunu hazırla
              const clearAllCaches = () => {
                clearAllCache(); // Chat cache'ini temizle
                clearCache();    // Profile cache'ini temizle
              };
              
              // AuthContext üzerinden çıkış yap ve cache'leri temizle
              await logout(clearAllCaches);
              
            } catch (error: any) {
              console.error('Çıkış yapma hatası:', error);
              
              // Hata olsa bile cache'leri temizle ve çıkış yap
              const clearAllCaches = () => {
                clearAllCache(); // Chat cache'ini temizle
                clearCache();    // Profile cache'ini temizle
              };
              
              // Hata olsa bile AuthContext üzerinden çıkış yap
              await logout(clearAllCaches);
              
              // Kullanıcıya bilgi ver
              Alert.alert(
                'Hata',
                'Çıkış yapılırken bir sorun oluştu, ancak yerel oturumunuz kapatıldı.'
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // Geri düğmesi işlevi
  const handleGoBack = () => {
    // Mevcut moda göre doğru sayfaya yönlendir
    if (currentMode === 'music') {
      router.push('/(tabs)/music');
    } else {
      router.push('/(tabs)/astrology');
    }
  };
  
  // Ana sayfaya dönüş işlevi
  const handleGoHome = () => {
    router.push('/(tabs)/' as any);
  };
  
  // Yükleniyor durumu
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#1e1e3f' : '#f8f8ff' }]}>
        <ActivityIndicator size="large" color={isDark ? '#FFFFFF' : '#2c2c54'} />
        <Text style={[styles.loadingText, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>
          İşlem yapılıyor...
        </Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1e1e3f' : '#f8f8ff' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Üst gezinme çubuğu */}
      <View style={[styles.headerNav, { backgroundColor: isDark ? '#1e1e3f' : '#f8f8ff' }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#2c2c54'} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#2c2c54' }]}>
          Ayarlar
        </Text>
        
        <TouchableOpacity
          style={styles.homeButton}
          onPress={handleGoHome}
        >
          <Ionicons name="home-outline" size={24} color={isDark ? '#FFFFFF' : '#2c2c54'} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.settingsContainer}>
        {/* Gizlilik ve Güvenlik */}
        <View style={[styles.section, { backgroundColor: isDark ? '#2c2c54' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#d0d0ff' : '#2c2c54' }]}>
            Gizlilik ve Güvenlik
          </Text>
          
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => router.push('/(profile)/blockedUsersScreen' as any)}
          >
            <View style={styles.settingsItemLeft}>
              <Ionicons name="ban-outline" size={24} color={isDark ? '#d0d0ff' : '#666'} />
              <Text style={[styles.settingsItemText, { color: isDark ? '#FFFFFF' : '#333' }]}>
                Engellenen Kullanıcılar
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#999' : '#CCC'} />
          </TouchableOpacity>
        </View>
        
        {/* Hesap */}
        <View style={[styles.section, { backgroundColor: isDark ? '#2c2c54' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#d0d0ff' : '#2c2c54' }]}>
            Hesap
          </Text>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  homeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  settingsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 20,
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
}); 