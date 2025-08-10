import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
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

export default function GlobalChatScreen() {
  const { currentMode } = useAuth();
  const { userProfile } = useProfile();
  const { 
    activeChat, 
    isLoadingMessages, 
    loadMessages, 
    loadMoreMessages,
    sendGlobalMessage,
    messageLimitInfo,
    refreshMessageLimit,
    setFastPolling
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

  // Sayfa yüklendiğinde genel chat mesajlarını getir
  useFocusEffect(
    useCallback(() => {
      console.log('🌍 [GLOBAL CHAT] Screen focused - loading global messages');
      loadMessages(1, 'GLOBAL'); // Global chat room ID genellikle 1
      refreshMessageLimit();
      
      // Focus olduğunda polling'i hızlandır (1 saniye)
      setFastPolling(true);
      console.log('🚀 [GLOBAL CHAT] Hızlı polling başlatıldı (1 saniye)');
      
      return () => {
        // Sayfa kapatıldığında normal polling'e dön
        setFastPolling(false);
        console.log('⏸️ [GLOBAL CHAT] Screen blurred - normal polling (3 saniye)');
      };
    }, [])
  );

  // Pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadMessages(1, 'GLOBAL');
      await refreshMessageLimit();
    } finally {
      setRefreshing(false);
    }
  };

  // Mesaj gönderme
  const handleSendMessage = async (message: string) => {
    console.log('🌍 [GLOBAL CHAT] Mesaj gönderiliyor:', message.substring(0, 50));
    
    // Aktif chat kontrolü
    if (!activeChat) {
      console.error('❌ [GLOBAL CHAT] Aktif chat yok, mesaj gönderilemedi');
      Alert.alert('Hata', 'Chat yüklenmedi, lütfen tekrar deneyin');
      return false;
    }
    
    try {
      const success = await sendGlobalMessage(message);
      
      if (!success) {
        // Hata durumunda limit bilgisini yenile
        await refreshMessageLimit();
      }
      
      return success;
    } catch (error: any) {
      console.error('❌ [GLOBAL CHAT] Mesaj gönderme hatası:', error);
      
      // Özel hata mesajları
      if (error.message.includes('limit')) {
        Alert.alert(
          '⏰ Mesaj Limiti',
          error.message,
          [
            { text: 'Tamam', style: 'default' },
            { 
              text: 'Premium Ol', 
              style: 'default', 
              onPress: () => {
                console.log('👑 [GLOBAL CHAT] Premium butonuna tıklandı');
                router.push('/(profile)/premiumScreen');
              }
            }
          ]
        );
      } else if (error.message.includes('uygunsuz')) {
        Alert.alert(
          '⚠️ İçerik Uyarısı',
          error.message,
          [{ text: 'Tamam', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Hata',
          'Mesaj gönderilemedi: ' + (error.message || 'Bilinmeyen hata'),
          [{ text: 'Tamam', style: 'default' }]
        );
      }
      
      return false;
    }
  };

  // Geri gitme
  const handleGoBack = () => {
    // Chat listesine dön
    router.navigate('/(tabs)/chat' as any);
  };

  // Aktif kullanıcı sayısını al
  const getActiveUserCount = () => {
    if (activeChat && 'activeUserCount' in activeChat) {
      return activeChat.activeUserCount;
    }
    return 0;
  };

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
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>🌍 Genel Sohbet</Text>
          <View style={styles.activeUsersContainer}>
            <View style={styles.activeIndicator} />
            <Text style={styles.activeUsersText}>
              {getActiveUserCount()} aktif kullanıcı
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Mesaj listesi */}
      <View style={styles.messagesContainer}>
        <MessageList
          messages={activeChat?.messages || []}
          currentUserId={userProfile?.id || 0}
          isLoading={isLoadingMessages}
          hasMore={activeChat?.hasMore || false}
          onLoadMore={loadMoreMessages}
          onRefresh={handleRefresh}
          isRefreshing={refreshing}
          emptyMessage="Genel sohbete hoş geldiniz! İlk mesajı sen gönder! 🌍"
        />
      </View>

      {/* Mesaj input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        limitInfo={messageLimitInfo}
        placeholder="Herkesle sohbet et..."
        disabled={isLoadingMessages || !activeChat}
      />

      {/* Hoş geldin mesajı (sadece ilk yükleme) */}
      {activeChat && 'welcomeMessage' in activeChat && activeChat.welcomeMessage && (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeMessage}>
            {activeChat.welcomeMessage}
          </Text>
        </View>
      )}
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
    justifyContent: 'space-between',
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
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  activeUsersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF7F',
    marginRight: 6,
  },
  activeUsersText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Messages container
  messagesContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  // Welcome message
  welcomeContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    padding: 12,
    zIndex: 1000,
  },
  welcomeMessage: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
});
