import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import MessageInput from '../components/chat/MessageInput';
import MessageList from '../components/chat/MessageList';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useProfile } from '../context/ProfileContext';

export default function PrivateChatScreen() {
  const { currentMode } = useAuth();
  const { userProfile } = useProfile();
  const { 
    activeChat, 
    isLoadingMessages, 
    loadMessages, 
    loadMoreMessages,
    sendPrivateMessage,
    markMessagesAsRead
  } = useChat();
  const router = useRouter();
  const { chatId } = useLocalSearchParams();
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

  // Chat ID'yi number'a çevir
  const chatRoomId = parseInt(chatId as string, 10);

  // Sayfa yüklendiğinde özel chat mesajlarını getir
  useFocusEffect(
    useCallback(() => {
      if (!isNaN(chatRoomId)) {
        console.log('💬 [PRIVATE CHAT] Screen focused - loading private messages:', chatRoomId);
        loadMessages(chatRoomId, 'PRIVATE');
        markMessagesAsRead(chatRoomId);
      }
    }, [chatRoomId])
  );

  // Pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (!isNaN(chatRoomId)) {
        await loadMessages(chatRoomId, 'PRIVATE');
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Mesaj gönderme
  const handleSendMessage = async (message: string) => {
    if (!activeChat || 'chatType' in activeChat) {
      console.error('❌ [PRIVATE CHAT] Aktif chat private chat değil');
      return false;
    }

    const receiverId = activeChat.otherUser.id;
    console.log('💬 [PRIVATE CHAT] Mesaj gönderiliyor:', {
      receiverId,
      message: message.substring(0, 50)
    });
    
    try {
      const success = await sendPrivateMessage(message, receiverId);
      return success;
    } catch (error: any) {
      console.error('❌ [PRIVATE CHAT] Mesaj gönderme hatası:', error);
      
      Alert.alert(
        'Hata',
        error.message || 'Mesaj gönderilemedi',
        [{ text: 'Tamam', style: 'default' }]
      );
      
      return false;
    }
  };

  // Geri gitme
  const handleGoBack = () => {
    router.back();
  };

  // Profil görüntüleme
  const handleViewProfile = () => {
    if (activeChat && !('chatType' in activeChat)) {
      // TODO: Kullanıcı profil ekranına yönlendir
      console.log('👤 [PRIVATE CHAT] Profil görüntüle:', activeChat.otherUser.id);
      Alert.alert(
        'Profil',
        'Profil görüntüleme özelliği yakında eklenecek!',
        [{ text: 'Tamam', style: 'default' }]
      );
    }
  };

  // Chat bilgilerini al
  const getChatInfo = () => {
    if (!activeChat || 'chatType' in activeChat) {
      return {
        otherUser: null,
        matchType: null,
        compatibilityScore: null,
        matchDate: null
      };
    }

    return {
      otherUser: activeChat.otherUser,
      matchType: activeChat.matchId ? 'ASTROLOGY' as const : 'MUSIC' as const, // Bu backend'den gelmeli
      compatibilityScore: activeChat.compatibilityScore,
      matchDate: activeChat.matchDate
    };
  };

  const chatInfo = getChatInfo();

  // Match type ikonunu belirle
  const getMatchTypeIcon = (matchType: 'ASTROLOGY' | 'MUSIC' | null) => {
    if (!matchType) return '';
    
    switch (matchType) {
      case 'ASTROLOGY':
        return '🌟';
      case 'MUSIC':
        return '🎵';
      default:
        return '';
    }
  };

  // Geçersiz chat ID kontrolü
  if (isNaN(chatRoomId)) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Geçersiz chat ID</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Arka plan gradient */}
      <LinearGradient colors={currentTheme.gradient as any} style={styles.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerInfo} onPress={handleViewProfile}>
          <View style={styles.avatarContainer}>
            {chatInfo.otherUser?.profileImageUrl ? (
              <Image 
                source={{ uri: chatInfo.otherUser.profileImageUrl }}
                style={styles.headerAvatar}
              />
            ) : (
              <View style={[styles.headerAvatarPlaceholder, { backgroundColor: currentTheme.secondary }]}>
                <Text style={styles.headerAvatarText}>
                  {chatInfo.otherUser?.displayName?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
            
            {/* Online indicator */}
            {chatInfo.otherUser?.isOnline && (
              <View style={styles.onlineIndicator} />
            )}
          </View>

          <View style={styles.userInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.userName} numberOfLines={1}>
                {chatInfo.otherUser?.displayName || 'Bilinmeyen Kullanıcı'}
              </Text>
              
              {/* Match type icon */}
              <Text style={styles.matchIcon}>
                {getMatchTypeIcon(chatInfo.matchType)}
              </Text>
              
              {/* Premium badge */}
              {chatInfo.otherUser?.isPremium && (
                <Text style={styles.premiumBadge}>👑</Text>
              )}
            </View>
            
            <Text style={styles.userStatus}>
              {chatInfo.otherUser?.activityStatus || 'Bilinmeyen'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Uyumluluk bilgisi */}
      {chatInfo.compatibilityScore && (
        <View style={styles.compatibilityContainer}>
          <Text style={styles.compatibilityText}>
            💫 Uyumluluk: %{chatInfo.compatibilityScore}
          </Text>
          {chatInfo.matchDate && (
            <Text style={styles.matchDateText}>
              Eşleşme: {chatInfo.matchDate}
            </Text>
          )}
        </View>
      )}

      {/* Mesaj listesi */}
      <View style={styles.messagesContainer}>
        {activeChat && (
          <MessageList
            messages={activeChat.messages || []}
            currentUserId={userProfile?.id || 0}
            isLoading={isLoadingMessages}
            hasMore={activeChat.hasMore}
            onLoadMore={loadMoreMessages}
            onRefresh={handleRefresh}
            isRefreshing={refreshing}
            emptyMessage={`${chatInfo.otherUser?.displayName || 'Bu kişi'} ile sohbet başlasın! 💬`}
          />
        )}
      </View>

      {/* Mesaj input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        limitInfo={null} // Özel mesajlarda limit yok
        placeholder={`${chatInfo.otherUser?.displayName || 'Kullanıcı'}'ya mesaj yaz...`}
        disabled={isLoadingMessages}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00FF7F',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 6,
  },
  matchIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  premiumBadge: {
    fontSize: 14,
  },
  userStatus: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Compatibility info
  compatibilityContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  compatibilityText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  matchDateText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },

  // Messages container
  messagesContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#8000FF',
    fontWeight: '600',
  },
});
