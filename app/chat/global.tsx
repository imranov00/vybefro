import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { AlertButton } from 'react-native';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    KeyboardEvent,
    Platform,
    SafeAreaView,
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
import { calculateActiveUserCount } from '../utils/activeUserCount';

export default function GlobalChatScreen() {
  const { currentMode } = useAuth();
  const { userProfile, currentUserId, refreshProfile } = useProfile();
  const isPremium = userProfile?.isPremium || false;
  const { 
    activeChat, 
    isLoadingMessages, 
    loadMessages, 
    loadMoreMessages,
    sendGlobalMessage,
    messageLimitInfo,
    refreshMessageLimit,
    setFastPolling,
    joinChatRoom,
    leaveChatRoom,
    sendTypingIndicator,
    typingUsers,
    wsStatus,
    wsClient,
    updateMessageStatuses,
    setChatScreenActive
  } = useChat();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const messageListRef = useRef<any>(null);
  const [activeUserCount, setActiveUserCount] = useState(0);

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

  // Klavye event listener'ları
  useEffect(() => {
    const keyboardWillShow = (event: KeyboardEvent) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);
      
      // Klavye açıldığında mesaj listesini en alta kaydır
      setTimeout(() => {
        messageListRef.current?.scrollToOffset?.({ offset: 0, animated: true });
      }, 100);
    };

    const keyboardWillHide = () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    };

    const keyboardDidShow = (event: KeyboardEvent) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);
      
      // Klavye açıldığında mesaj listesini en alta kaydır
      setTimeout(() => {
        messageListRef.current?.scrollToOffset?.({ offset: 0, animated: true });
      }, 100);
    };

    const keyboardDidHide = () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    };

    if (Platform.OS === 'ios') {
      const showSubscription = Keyboard.addListener('keyboardWillShow', keyboardWillShow);
      const hideSubscription = Keyboard.addListener('keyboardWillHide', keyboardWillHide);
      
      return () => {
        showSubscription?.remove();
        hideSubscription?.remove();
      };
    } else {
      const showSubscription = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
      const hideSubscription = Keyboard.addListener('keyboardDidHide', keyboardDidHide);
      
      return () => {
        showSubscription?.remove();
        hideSubscription?.remove();
      };
    }
  }, []);

  // Sayfa yüklendiğinde genel chat mesajlarını getir ve WebSocket'e katıl
  const joinedOnceRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      console.log('🌍 [GLOBAL CHAT] Screen focused - loading global messages');

      // Chat ekranı aktif olduğunu bildir
      setChatScreenActive(true);

      // Profil güncellemesi yap (token değişmiş olabilir)
      if (!joinedOnceRef.current) {
        refreshProfile();
      }
      
      // Mesajları sadece bir kez yükle; kullanıcı manuel yenilerse handleRefresh var
      if (!joinedOnceRef.current) {
        loadMessages(1, 'GLOBAL'); // Global chat room ID genellikle 1
        refreshMessageLimit();
      }
      
      // WebSocket'e global chat odasına katıl
      if (!joinedOnceRef.current) {
        joinChatRoom('1');
        joinedOnceRef.current = true;
      }
      
      // Typing subscription ekle
      wsClient?.subscribeToChatTyping('1');
      
      console.log('🚀 [GLOBAL CHAT] Fast enter - subscriptions ready');
      
      return () => {
        // Sayfa kapatıldığında normal polling'e dön ve chat odasından çık
        leaveChatRoom('1');
        joinedOnceRef.current = false;
        
        // Typing subscription'ı kaldır
        wsClient?.unsubscribeFromChatTyping('1');
        
        // Chat ekranı artık aktif değil
        setChatScreenActive(false);
        
        console.log('⏸️ [GLOBAL CHAT] Screen blurred - normal polling (10 saniye)');
      };
    }, [setChatScreenActive])
  );

  // Mesaj durumlarını akıllı güncelleme (WebSocket çalışmıyorsa 10 saniyede bir)
  useEffect(() => {
    if (!activeChat) return;
    
    // WebSocket bağlıysa durum güncellemesi yapma (WebSocket zaten yapıyor)
    if (wsStatus === 'CONNECTED') {
      console.log('✅ [GLOBAL CHAT] WebSocket bağlı, durum güncellemesi devre dışı');
      return;
    }
    
    console.log('🔄 [GLOBAL CHAT] WebSocket çalışmıyor, durum güncellemesi başlatıldı (10s)');
    const statusInterval = setInterval(() => {
      updateMessageStatuses();
    }, 10000); // 10 saniye
    
    return () => {
      clearInterval(statusInterval);
    };
  }, [activeChat, wsStatus]);

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
      
      // Özel hata mesajları - Premium kullanıcılara "Premium Ol" butonu gösterme
      if (error.message.includes('limit')) {
        const alertButtons: AlertButton[] = [
          { text: 'Tamam', style: 'default' }
        ];
        // Sadece premium olmayan kullanıcılara "Premium Ol" butonu göster
        if (!isPremium) {
          alertButtons.push({
            text: 'Premium Ol',
            onPress: () => {
              console.log('👑 [GLOBAL CHAT] Premium butonuna tıklandı');
              router.push('/(profile)/premiumScreen');
            },
            style: 'default'
          });
        }
        Alert.alert(
          '⏰ Mesaj Limiti',
          error.message,
          alertButtons
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

  // Aktif kullanıcı sayısını güncelle (her dakika)
  useEffect(() => {
    // İlk değeri ayarla
    setActiveUserCount(calculateActiveUserCount());
    // Her dakika güncelle
    const interval = setInterval(() => {
      setActiveUserCount(calculateActiveUserCount());
    }, 60000); // 60 saniye
    return () => clearInterval(interval);
  }, []);

  // Global sohbet mesajlarını her 1 saatte bir temizle ve yenile
  useEffect(() => {
    // Her 1 saatte bir mesajları yenile (cache'i temizle)
    const HOUR_IN_MS = 60 * 60 * 1000; // 1 saat
    
    const cleanupInterval = setInterval(async () => {
      console.log('🧹 [GLOBAL CHAT] 1 saatlik temizlik - mesajlar yenileniyor...');
      try {
        await loadMessages(1, 'GLOBAL');
        console.log('✅ [GLOBAL CHAT] Mesajlar başarıyla yenilendi');
      } catch (error) {
        console.error('❌ [GLOBAL CHAT] Mesaj yenileme hatası:', error);
      }
    }, HOUR_IN_MS);
    
    return () => clearInterval(cleanupInterval);
  }, [loadMessages]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
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
            {/* Aktif kullanıcı sayısını saatlere göre göster */}
            <View style={styles.activeUsersContainer}>
              <View style={styles.activeIndicator} />
              <Text style={styles.activeUsersText}>
                {activeUserCount} aktif kullanıcı
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.infoButton}>
            <Ionicons name="information-circle-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Mesaj listesi */}
        <View style={[styles.messagesContainer, { marginBottom: isKeyboardVisible ? 0 : 0 }]}> 
          <MessageList
            ref={messageListRef}
            messages={activeChat?.messages || []}
            currentUserId={userProfile?.id || parseInt(currentUserId || '0')}
            isLoading={isLoadingMessages}
            hasMore={activeChat?.hasMore || false}
            onLoadMore={loadMoreMessages}
            onRefresh={handleRefresh}
            isRefreshing={refreshing}
            emptyMessage="Genel sohbete hoş geldiniz! İlk mesajı sen gönder! 🌍"
            typingUsers={typingUsers.get('1')}
            otherUserName="Birisi"
            hideTime={true}
          />
        </View>
        

        


        {/* Mesaj input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          limitInfo={messageLimitInfo}
          placeholder="Herkesle sohbet et..."
          disabled={isLoadingMessages || !activeChat}
          chatRoomId={1}
          onTypingChange={(isTyping) => sendTypingIndicator('1', isTyping)}
          showPremiumNotice={true}
        />

        {/* Hoş geldin mesajı (sadece ilk yükleme) */}
        {activeChat && 'welcomeMessage' in activeChat && activeChat.welcomeMessage && (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeMessage}>
              {activeChat.welcomeMessage}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#8000FF',
  },
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
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
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
