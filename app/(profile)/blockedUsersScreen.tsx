import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { BlockedUser, relationshipApi, blockApi } from '../services/api';
import { useBlock } from '../hooks/useBlock';

export default function BlockedUsersScreen() {
  const { currentMode } = useAuth();
  const router = useRouter();
  const { getBlockedUsers, unblockUser: performUnblockUser, loading: blockLoading } = useBlock();
  
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unblockingUserId, setUnblockingUserId] = useState<number | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Tema
  const theme = {
    astrology: {
      primary: '#8000FF',
      secondary: '#5B00B5',
    },
    music: {
      primary: '#1DB954',
      secondary: '#1ED760',
    }
  };
  const currentTheme = theme[currentMode];

  // Veri yükle
  const loadBlockedUsers = async () => {
    // Eğer zaten yükleme yapılıyorsa tekrar yapma
    if (isLoading && hasLoadedOnce) {
      console.log('ℹ️ [BLOCKED USERS] Zaten yükleme yapılıyor, tekrar yapılmayacak');
      return;
    }
    
    try {
      setIsLoading(true);
      const users = await getBlockedUsers();

      // Backend'den gelen veriyi normalize et
      const normalized = (users || [])
        .map((user: any, index: number) => {
          // Yeni API yapısı: { id, blockedUserId, blockedUser: {...}, blockedAt, reason, context }
          return {
            userId: user.blockedUserId || user.userId || user.id || index,
            username: user.blockedUser?.username || user.username || `user-${user.blockedUserId || index}`,
            displayName: user.blockedUser?.displayName || user.blockedUser?.firstName + ' ' + user.blockedUser?.lastName || user.displayName || user.username || 'Bilinmiyor',
            profileImageUrl: user.blockedUser?.profileImageUrl || user.profileImageUrl || null,
            blockedAt: user.blockedAt || new Date().toISOString(),
            context: user.context || 'PROFILE'
          } as BlockedUser;
        })
        .filter((u: BlockedUser) => u.userId !== undefined && u.userId !== null);

      setBlockedUsers(normalized);
      setHasLoadedOnce(true);
    } catch (error: any) {
      console.error('❌ [BLOCKED USERS] Yükleme hatası:', error);
      
      // Token hatalarını kullanıcıya bildir
      if (error?.message?.includes('Token bulunamadı') || 
          error?.message?.includes('Oturum süresi dolmuş') ||
          error?.message?.includes('giriş yapın')) {
        Alert.alert(
          'Oturum Hatası',
          'Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.',
          [{ text: 'Tamam', onPress: () => router.replace('/(auth)/login') }]
        );
      } else {
        // Diğer hatalar için sessizce geç
        console.log('ℹ️ [BLOCKED USERS] Hata görmezden geliniyor (kritik değil)');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Sadece ilk mount'ta bir kez çalıştır
    if (!hasLoadedOnce) {
      loadBlockedUsers();
    }
  }, []);

  // Pull to refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadBlockedUsers();
  };

  // Engeli kaldır
  const handleUnblock = (user: BlockedUser) => {
    Alert.alert(
      'Engeli Kaldır',
      `${user.displayName} kullanıcısının engelini kaldırmak istediğinize emin misiniz?\n\n⚠️ Not: Engeli kaldırmak önceki sohbetleri geri getirmez. Sadece swipe feed'de tekrar görünme ihtimali olur.`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Engeli Kaldır', 
          style: 'destructive',
          onPress: async () => {
            setUnblockingUserId(user.userId);
            try {
              await performUnblockUser(user.userId);
              
              // Listeden kaldır
              setBlockedUsers(prev => prev.filter(u => u.userId !== user.userId));
              
              Alert.alert('Başarılı', 'Engel kaldırıldı');
            } catch (error: any) {
              console.error('❌ [BLOCKED USERS] Unblock hatası:', error);
              
              // Token hatalarını kullanıcıya bildir
              if (error?.message?.includes('Token bulunamadı') || 
                  error?.message?.includes('Oturum süresi dolmuş') ||
                  error?.message?.includes('giriş yapın')) {
                Alert.alert(
                  'Oturum Hatası',
                  'Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.',
                  [{ text: 'Tamam', onPress: () => router.replace('/(auth)/login') }]
                );
              } else {
                Alert.alert('Hata', error?.message || 'Engel kaldırılamadı');
              }
            } finally {
              setUnblockingUserId(null);
            }
          }
        }
      ]
    );
  };

  // Context metni
  const getContextText = (context: 'CHAT' | 'PROFILE' | 'SWIPE') => {
    switch (context) {
      case 'CHAT': return 'Sohbetten engellendi';
      case 'PROFILE': return 'Profilden engellendi';
      case 'SWIPE': return 'Swipe\'dan engellendi';
      default: return 'Engellendi';
    }
  };

  // Tarih formatla
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  // Render item
  const renderItem = ({ item }: { item: BlockedUser }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        {/* Avatar */}
        {item.profileImageUrl ? (
          <Image source={{ uri: item.profileImageUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: currentTheme.secondary }]}>
            <Text style={styles.avatarText}>
              {item.displayName?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        )}
        
        {/* Kullanıcı bilgileri */}
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.displayName}</Text>
          <Text style={styles.userUsername}>@{item.username}</Text>
          <Text style={styles.contextText}>{getContextText(item.context)}</Text>
          <Text style={styles.dateText}>{formatDate(item.blockedAt)}</Text>
        </View>
      </View>
      
      {/* Engeli kaldır butonu */}
      <TouchableOpacity
        style={[styles.unblockButton, { borderColor: currentTheme.primary }]}
        onPress={() => handleUnblock(item)}
        disabled={unblockingUserId === item.userId}
      >
        {unblockingUserId === item.userId ? (
          <ActivityIndicator size="small" color={currentTheme.primary} />
        ) : (
          <Text style={[styles.unblockButtonText, { color: currentTheme.primary }]}>
            Engeli Kaldır
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="shield-checkmark" size={64} color="#CCC" />
      <Text style={styles.emptyTitle}>Engellenen Kullanıcı Yok</Text>
      <Text style={styles.emptyText}>
        Engellediğiniz kullanıcılar burada görünecek
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Engellenen Kullanıcılar</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Bilgi notu */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#666" />
        <Text style={styles.infoText}>
          Engeli kaldırdığınızda önceki sohbetler geri gelmez. Kullanıcı sadece swipe feed'de tekrar görünebilir.
        </Text>
      </View>

      {/* Liste */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          renderItem={renderItem}
          keyExtractor={(item, index) => (item.userId ?? index).toString()}
          contentContainerStyle={blockedUsers.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[currentTheme.primary]}
              tintColor={currentTheme.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FF',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  
  // Info box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    margin: 16,
    padding: 12,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    lineHeight: 18,
  },
  
  // List
  list: {
    paddingHorizontal: 16,
  },
  emptyList: {
    flex: 1,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // User card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userUsername: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  contextText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#CCC',
    marginTop: 2,
  },
  unblockButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    marginLeft: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  unblockButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});
