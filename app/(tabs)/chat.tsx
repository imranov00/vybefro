import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { ChatListItem } from '../services/api';

export default function ChatScreen() {
  const { currentMode } = useAuth();
  const { 
    chatList, 
    isLoadingChatList, 
    refreshChatList, 
    loadMessages,
    markMessagesAsRead 
  } = useChat();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Tema renklerini belirle
  const theme = {
    astrology: {
      primary: '#8000FF',
      secondary: '#5B00B5',
      accent: '#FFD700',
      gradient: ['#8000FF', '#5B00B5', '#3D007A']
    },
    music: {
      primary: '#1DB954',
      secondary: '#1ED760', 
      accent: '#FFD700',
      gradient: ['#1DB954', '#1ED760', '#1AA34A']
    }
  };

  const currentTheme = theme[currentMode];

  // Sayfa her fokuslandığında chat listesini yenile
  useFocusEffect(
    useCallback(() => {
      console.log('💬 [CHAT] Chat screen focused - refreshing chat list');
      refreshChatList();
    }, [])
  );

  // Pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshChatList();
    setRefreshing(false);
  };

  // Chat'e tıklama
  const handleChatPress = async (chat: ChatListItem) => {
    try {
      console.log('💬 [CHAT] Chat açılıyor:', {
        chatRoomId: chat.chatRoomId,
        chatType: chat.chatType,
        chatName: chat.chatName
      });

      // Mesajları okundu olarak işaretle
      if (chat.unreadCount > 0) {
        markMessagesAsRead(chat.chatRoomId);
      }

             // Chat ekranına yönlendir
       if (chat.chatType === 'GLOBAL') {
         router.push('/chat/global' as any);
       } else {
         router.push(`/chat/${chat.chatRoomId}` as any);
       }
    } catch (error) {
      console.error('❌ [CHAT] Chat açma hatası:', error);
    }
  };

  // Match type ikonunu belirle
  const getMatchTypeIcon = (matchType?: 'ASTROLOGY' | 'MUSIC') => {
    if (!matchType) return null;
    
    switch (matchType) {
      case 'ASTROLOGY':
        return '🌟';
      case 'MUSIC':
        return '🎵';
      default:
        return null;
    }
  };

  // Son mesaj zamanını formatla
  const formatLastActivity = (lastActivity: string) => {
    const now = new Date();
    const messageTime = new Date(lastActivity);
    const diffMs = now.getTime() - messageTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins}dk`;
    if (diffHours < 24) return `${diffHours}s`;
    if (diffDays < 7) return `${diffDays}g`;
    
    return messageTime.toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  // Chat item render
  const renderChatItem = ({ item }: { item: ChatListItem }) => {
    const isGlobalChat = item.chatType === 'GLOBAL';
    const matchIcon = getMatchTypeIcon(item.matchType);
    const lastMessage = item.lastMessage;

    return (
      <TouchableOpacity 
        style={styles.chatItem}
        onPress={() => handleChatPress(item)}
      >
        <View style={styles.chatItemContent}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {isGlobalChat ? (
              <View style={[styles.globalChatAvatar, { backgroundColor: currentTheme.primary }]}>
                <Text style={styles.globalChatIcon}>🌍</Text>
              </View>
            ) : item.otherUser?.profileImageUrl ? (
              <Image 
                source={{ uri: item.otherUser.profileImageUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: currentTheme.secondary }]}>
                <Text style={styles.avatarText}>
                  {item.otherUser?.displayName?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}

            {/* Online indicator (sadece private chatler için) */}
            {!isGlobalChat && item.otherUser?.isOnline && (
              <View style={styles.onlineIndicator} />
            )}
          </View>

          {/* Chat bilgileri */}
          <View style={styles.chatInfo}>
            {/* Üst satır: İsim, match icon, premium badge, zaman */}
            <View style={styles.chatHeader}>
              <View style={styles.chatNameContainer}>
                <Text style={styles.chatName} numberOfLines={1}>
                  {isGlobalChat ? item.chatName : item.otherUser?.displayName || 'Bilinmeyen'}
                </Text>
                
                {/* Match type icon */}
                {matchIcon && (
                  <Text style={styles.matchIcon}>{matchIcon}</Text>
                )}
                
                {/* Premium badge */}
                {!isGlobalChat && item.otherUser?.isPremium && (
                  <Text style={styles.premiumBadge}>👑</Text>
                )}
              </View>

              <View style={styles.timeContainer}>
                {/* Aktif kullanıcı sayısı (genel chat için) */}
                {isGlobalChat && item.activeUserCount && (
                  <View style={styles.activeUsersContainer}>
                    <View style={styles.activeIndicator} />
                    <Text style={styles.activeUsersText}>
                      {item.activeUserCount}
                    </Text>
                  </View>
                )}
                
                {/* Son mesaj zamanı */}
                <Text style={styles.timeText}>
                  {formatLastActivity(item.lastActivity)}
                </Text>
              </View>
            </View>

            {/* Alt satır: Son mesaj */}
            <View style={styles.messagePreview}>
              <Text 
                style={[
                  styles.lastMessageText,
                  item.unreadCount > 0 && styles.unreadMessageText
                ]} 
                numberOfLines={1}
              >
                {lastMessage?.content || (isGlobalChat ? 'Sohbete katılın!' : 'Henüz mesaj yok')}
              </Text>
              
              {/* Unread badge */}
              {item.unreadCount > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: currentTheme.primary }]}>
                  <Text style={styles.unreadBadgeText}>
                    {item.unreadCount > 99 ? '99+' : item.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Boş liste gösterimi
  const renderEmpty = () => {
    if (isLoadingChatList) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
          <Text style={styles.emptyText}>Sohbetler yükleniyor...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubbles-outline" size={80} color="#CCC" />
        <Text style={styles.emptyText}>Henüz sohbet yok</Text>
        <Text style={styles.emptySubtext}>
          Yeni eşleşmeler yaptığınızda burada görünecek
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Arka plan gradient */}
      <LinearGradient colors={currentTheme.gradient as any} style={styles.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 Mesajlar</Text>
      </View>

      {/* Chat listesi */}
      <View style={styles.chatListContainer}>
        <FlatList
          data={chatList}
          renderItem={renderChatItem}
          keyExtractor={(item) => `${item.chatType}-${item.chatRoomId}`}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={currentTheme.primary}
              colors={[currentTheme.primary]}
            />
          }
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={chatList.length === 0 ? styles.emptyContentContainer : styles.listContent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  // Header
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },

  // Chat listesi
  chatListContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
  },
  listContent: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },

  // Chat item
  chatItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  chatItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Avatar
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  globalChatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  globalChatIcon: {
    fontSize: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00FF7F',
    borderWidth: 2,
    borderColor: 'white',
  },

  // Chat info
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 6,
  },
  matchIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  premiumBadge: {
    fontSize: 14,
  },

  // Time container
  timeContainer: {
    alignItems: 'flex-end',
  },
  activeUsersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF7F',
    marginRight: 4,
  },
  activeUsersText: {
    fontSize: 11,
    color: '#00FF7F',
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },

  // Message preview
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessageText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  unreadMessageText: {
    fontWeight: '600',
    color: '#333',
  },

  // Unread badge
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
