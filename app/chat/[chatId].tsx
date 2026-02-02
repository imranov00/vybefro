import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActionSheetIOS,
    Alert,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    KeyboardEvent,
    Modal,
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
import { useLoading } from '../context/LoadingContext';
import { useProfile } from '../context/ProfileContext';
import { useBlock } from '../hooks/useBlock';
import { useUnmatch } from '../hooks/useUnmatch';
import { MatchRelationship, relationshipApi } from '../services/api';

export default function PrivateChatScreen() {
  const { currentMode } = useAuth();
  const { userProfile, currentUserId, refreshProfile } = useProfile();
  const { blockUser: performBlockUser, loading: blockLoading } = useBlock();
  const { unmatchUser: performUnmatchUser, loading: unmatchLoading } = useUnmatch();
  const { showLoading, hideLoading } = useLoading();
  const { 
    activeChat, 
    isLoadingMessages, 
    loadMessages, 
    loadMoreMessages,
    sendPrivateMessage,
    markMessagesAsRead,
    joinChatRoom,
    leaveChatRoom,
    sendTypingIndicator,
    typingUsers,
    wsStatus,
    wsClient,
    updateMessageStatuses,
    clearActiveChat,
    refreshPrivateChats,
    setChatScreenActive
  } = useChat();
  const router = useRouter();
  const { chatId } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  // Relationship state
  const [relationship, setRelationship] = useState<MatchRelationship | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnmatchModal, setShowUnmatchModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const messageListRef = useRef<any>(null);

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

  // Sayfa yüklendiğinde özel chat mesajlarını getir ve WebSocket'e katıl
  const joinedOnceRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!isNaN(chatRoomId)) {
        console.log('💬 [PRIVATE CHAT] Screen focused - loading private messages:', chatRoomId);
        
        // Chat ekranı aktif olduğunu bildir
        setChatScreenActive(true);
        
        // Loading başlat - veriler tamamen yüklenene kadar göster
        showLoading('Sohbet yükleniyor...');
        
        // Profil güncellemesi yap (token değişmiş olabilir)
        if (!joinedOnceRef.current) {
          refreshProfile();
        }
        
        // Mesajları sadece bir kez yükle; kullanıcı manuel yenilerse handleRefresh var
        if (!joinedOnceRef.current) {
          loadMessages(chatRoomId, 'PRIVATE').then(() => {
            // Mesajlar yüklendikten sonra loading kapat
            hideLoading();
          }).catch(() => {
            // Hata olsa da loading kapat
            hideLoading();
          });
          markMessagesAsRead(chatRoomId);
          
          // Relationship durumunu yükle (matchId varsa)
          fetchRelationship();
        }
        
        // WebSocket'e chat odasına katıl
        if (!joinedOnceRef.current) {
          joinChatRoom(chatRoomId.toString());
          joinedOnceRef.current = true;
        }
        
        // Typing subscription ekle
        wsClient?.subscribeToChatTyping(chatRoomId.toString());
      }
      
      // Cleanup: Chat odasından çık
      return () => {
        if (!isNaN(chatRoomId)) {
          leaveChatRoom(chatRoomId.toString());
          joinedOnceRef.current = false;
          hideLoading(); // Sayfadan çıkışta loading'i de kapat
          setChatScreenActive(false); // Chat ekranı artık aktif değil
        }
      };
    }, [chatRoomId, setChatScreenActive])
  );

  // Mesaj durumlarını akıllı güncelleme (WebSocket çalışmıyorsa 10 saniyede bir)
  useEffect(() => {
    if (!activeChat || !chatRoomId) return;
    
    // WebSocket bağlıysa durum güncellemesi yapma (WebSocket zaten yapıyor)
    if (wsStatus === 'CONNECTED') {
      console.log('✅ [PRIVATE CHAT] WebSocket bağlı, durum güncellemesi devre dışı');
      return;
    }
    
    console.log('🔄 [PRIVATE CHAT] WebSocket çalışmıyor, durum güncellemesi başlatıldı (10s)');
    const statusInterval = setInterval(() => {
      updateMessageStatuses();
    }, 10000); // 10 saniye
    
    return () => {
      clearInterval(statusInterval);
    };
  }, [activeChat, chatRoomId, wsStatus]);

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

    // otherUser kontrolü ekle
    if (!activeChat.otherUser || !activeChat.otherUser.id) {
      console.error('❌ [PRIVATE CHAT] otherUser veya otherUser.id bulunamadı:', {
        hasActiveChat: !!activeChat,
        hasOtherUser: !!activeChat.otherUser,
        otherUserId: activeChat.otherUser?.id
      });
      return false;
    }

    const receiverId = activeChat.otherUser.id;
    console.log('💬 [PRIVATE CHAT] Mesaj gönderiliyor:', {
      receiverId,
      message: message.substring(0, 50),
      otherUser: activeChat.otherUser
    });
    
    try {
      const success = await sendPrivateMessage(message, receiverId);
      return success;
         } catch (error: any) {
       console.error('❌ [PRIVATE CHAT] Mesaj gönderme hatası:', error);
       
       // Kullanıcıya uygun hata mesajı göster
       if (error.message?.includes('Sohbet bilgileri eksik')) {
         Alert.alert(
           'Sohbet Sorunu',
           'Sohbet bilgileri eksik. Sayfayı yenilemek ister misiniz?',
           [
             { text: 'İptal', style: 'cancel' },
             { text: 'Yenile', style: 'default', onPress: () => handleRefresh() }
           ]
         );
       } else if (error.message?.includes('limit')) {
         Alert.alert(
           '⏰ Mesaj Limiti',
           error.message,
           [
             { text: 'Tamam', style: 'default' },
             { 
               text: 'Premium Ol', 
               style: 'default', 
               onPress: () => {
                 console.log('👑 [PRIVATE CHAT] Premium butonuna tıklandı');
                 router.push('/(profile)/premiumScreen');
               }
             }
           ]
         );
       } else if (error.message?.includes('Transaction silently rolled back') || 
                  error.message?.includes('Mesaj gönderilemedi. Lütfen tekrar deneyin.')) {
         Alert.alert(
           'Mesaj Hatası',
           'Mesaj gönderilemedi. Lütfen tekrar deneyin.',
           [{ text: 'Tamam', style: 'default' }]
         );
       } else if (error.message?.includes('Sunucu hatası')) {
         Alert.alert(
           'Sunucu Hatası',
           'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
           [{ text: 'Tamam', style: 'default' }]
         );
       } else {
         Alert.alert('Hata', error.message || 'Mesaj gönderilemedi');
       }
       
       return false;
     }
  };

  // Geri gitme
  const handleGoBack = () => {
    // Chat listesine dön
    router.navigate('/(tabs)/chat' as any);
  };

  // Relationship durumunu yükle
  const fetchRelationship = async () => {
    if (!activeChat || 'chatType' in activeChat) return;
    
    const matchId = (activeChat as any).matchId;
    if (!matchId) return;
    
    try {
      const relationshipData = await relationshipApi.getRelationship(matchId);
      setRelationship(relationshipData);
      console.log('✅ [PRIVATE CHAT] Relationship yüklendi:', relationshipData);
    } catch (error: any) {
      console.error('❌ [PRIVATE CHAT] Relationship yüklenemedi:', error.message);
      // 404 = eşleşme artık yok, chat listesine dön
      if (error.message?.includes('mevcut değil')) {
        Alert.alert(
          'Eşleşme Bulunamadı',
          'Bu eşleşme artık mevcut değil.',
          [{ text: 'Tamam', onPress: () => router.navigate('/(tabs)/chat' as any) }]
        );
      }
    }
  };

  // Profil görüntüleme - User Profile ekranına yönlendir (userId ile)
  const handleViewProfile = () => {
    if (activeChat && !('chatType' in activeChat)) {
      const otherUserId = activeChat.otherUser?.id;
      if (otherUserId) {
        // chatRoomId'yi de gönder ki geri mesaj gönderebilsin
        router.push(`/profile/${otherUserId}?chatRoomId=${chatRoomId}` as any);
      } else {
        Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı');
      }
    }
  };

  // Action Sheet göster (Header'daki 3 nokta menüsü)
  const handleShowActionSheet = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['İptal', 'Profili Görüntüle', 'Şikayet Et', 'Eşleşmeyi Kaldır', 'Engelle'],
          destructiveButtonIndex: 4,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              handleViewProfile();
              break;
            case 2:
              setShowReportModal(true);
              break;
            case 3:
              setShowUnmatchModal(true);
              break;
            case 4:
              setShowBlockModal(true);
              break;
          }
        }
      );
    } else {
      // Android için custom modal
      setShowActionSheet(true);
    }
  };

  // Block işlemi
  const handleBlock = async () => {
    if (!activeChat || 'chatType' in activeChat) return;
    
    const otherUserId = activeChat.otherUser?.id;
    const matchId = (activeChat as any).matchId;
    if (!otherUserId) return;
    
    try {
      console.log('🔄 [PRIVATE CHAT] Block işlemi başlatılıyor...');
      
      await performBlockUser(otherUserId, 'CHAT', undefined, matchId);
      setShowBlockModal(false);
      
      console.log('✅ [PRIVATE CHAT] Block başarılı, chat listesi yenileniyor...');
      
      // ⚠️ ÖNEMLİ: Backend chat'i kapattı (closedReason=BLOCK)
      // Chat listesini yenile - Kapalı chat'ler artık filtrelenecek
      try {
        await refreshPrivateChats();
        console.log('✅ [PRIVATE CHAT] Chat listesi başarıyla yenilendi');
      } catch (refreshError) {
        console.error('❌ [PRIVATE CHAT] Chat listesi yenileme hatası:', refreshError);
        // Yenileme hatası olsa bile kullanıcıyı chat listesine gönder
      }
      
      // Kullanıcıyı chat listesine yönlendir
      router.navigate('/(tabs)/chat' as any);
      
      Alert.alert('Başarılı', 'Kullanıcı engellendi ve sohbet sonlandırıldı');
    } catch (error: any) {
      console.error('❌ [PRIVATE CHAT] Block hatası:', error);
      Alert.alert('Hata', 'Engelleme işlemi başarısız oldu');
    }
  };

  // Unmatch işlemi
  const handleUnmatch = async () => {
    if (!activeChat || 'chatType' in activeChat) return;
    
    // Backend Universal ID sistemi: Chat Room ID veya Match ID gönderebiliriz
    const idToUse = !isNaN(chatRoomId) ? chatRoomId : (activeChat as any).matchId;
    
    if (!idToUse) return;
    
    try {
      console.log('🔄 [PRIVATE CHAT] Unmatch işlemi başlatılıyor (Universal ID):', { idToUse });
      
      await performUnmatchUser(idToUse);
      setShowUnmatchModal(false);
      
      console.log('✅ [PRIVATE CHAT] Unmatch başarılı, chat listesi yenileniyor...');
      
      // ⚠️ ÖNEMLİ: Backend chat'i kapattı (closedReason=UNMATCH)
      // Chat listesini yenile - Kapalı chat'ler artık filtrelenecek
      try {
        await refreshPrivateChats();
        console.log('✅ [PRIVATE CHAT] Chat listesi başarıyla yenilendi');
      } catch (refreshError) {
        console.error('❌ [PRIVATE CHAT] Chat listesi yenileme hatası:', refreshError);
        // Yenileme hatası olsa bile kullanıcıyı chat listesine gönder
      }
      
      // Kullanıcıyı chat listesine yönlendir
      router.navigate('/(tabs)/chat' as any);
      
      Alert.alert('Başarılı', 'Eşleşme kaldırıldı ve sohbet sonlandırıldı. 7 gün sonra tekrar karşınıza çıkabilir.');
    } catch (error: any) {
      console.error('❌ [PRIVATE CHAT] Unmatch hatası:', error);
      Alert.alert('Hata', 'Eşleşme kaldırma işlemi başarısız oldu');
    }
  };

  // Report işlemi
  const handleReport = async (reason: string) => {
    if (!activeChat || 'chatType' in activeChat) return;
    
    const otherUserId = activeChat.otherUser?.id;
    if (!otherUserId) return;
    
    setIsActionLoading(true);
    try {
      await relationshipApi.reportUser(otherUserId, reason);
      setShowReportModal(false);
      Alert.alert('Başarılı', 'Şikayetiniz alındı. İnceleme sonrasında gerekli işlemler yapılacaktır.');
    } catch (error: any) {
      console.error('❌ [PRIVATE CHAT] Report hatası:', error);
      Alert.alert('Hata', 'Şikayet gönderilemedi');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Chat bilgilerini al
  const getChatInfo = () => {
    if (!activeChat || 'chatType' in activeChat) {
      return {
        otherUser: null,
        matchType: null,
        compatibilityScore: null,
        matchDate: null,
        matchId: null
      };
    }

    return {
      otherUser: activeChat.otherUser,
      matchType: activeChat.matchType as 'ZODIAC' | 'MUSIC' | null, // Backend'den gelen gerçek matchType
      compatibilityScore: activeChat.compatibilityScore,
      matchDate: activeChat.matchDate,
      matchId: (activeChat as any).matchId
    };
  };

  const chatInfo = getChatInfo();
  
  // canChat kontrolü - Backend'den gelen relationship'e göre
  const canChat = relationship?.canChat !== false; // undefined ise true varsay

  // Burç simgelerini tanımla
  const getZodiacEmoji = (zodiacSign?: string) => {
    if (!zodiacSign) return '⭐';
    
    const zodiacEmojis: { [key: string]: string } = {
      'ARIES': '♈',
      'TAURUS': '♉', 
      'GEMINI': '♊',
      'CANCER': '♋',
      'LEO': '♌',
      'VIRGO': '♍',
      'LIBRA': '♎',
      'SCORPIO': '♏',
      'SAGITTARIUS': '♐',
      'CAPRICORN': '♑',
      'AQUARIUS': '♒',
      'PISCES': '♓'
    };
    
    return zodiacEmojis[zodiacSign.toUpperCase()] || '⭐';
  };

  // Match type ikonunu belirle
  const getMatchTypeIcon = (matchType: 'ZODIAC' | 'MUSIC' | null) => {
    if (!matchType) return '';
    
    switch (matchType) {
      case 'ZODIAC':
        // Eşleştiği kişinin burç simgesini göster
        const zodiacSign = chatInfo.otherUser?.zodiacSign;
        const zodiacSignDisplay = chatInfo.otherUser?.zodiacSignDisplay;
        
        if (zodiacSignDisplay && zodiacSignDisplay.includes('♓')) {
          return '♓'; // Balık
        } else if (zodiacSignDisplay && zodiacSignDisplay.includes('♈')) {
          return '♈'; // Koç
        } else {
          return getZodiacEmoji(zodiacSign || undefined);
        }
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

  // Veriler yükleniyor iken full screen loading göster
  // Hiçbir şey (header, mesajlar, vs) gösterme - sadece loading ekranı
  if (isLoadingMessages) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.primary, justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient colors={currentTheme.gradient as any} style={styles.background} />
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        {/* Loading gösterilir otomatik olarak LoadingOverlay tarafından */}
      </View>
    );
  }

  // Veriler hazırlanmadıysa ekranı açma - activeChat olmadıysa sadece loading göster
  if (!activeChat) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.primary, justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient colors={currentTheme.gradient as any} style={styles.background} />
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      </View>
    );
  }

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
          
          {/* Avatar - Tıklayınca direkt profil açılır */}
          <TouchableOpacity style={styles.avatarContainer} onPress={handleViewProfile}>
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
          </TouchableOpacity>

          {/* İsim - Tıklayınca action sheet açılır */}
          <TouchableOpacity style={styles.headerInfo} onPress={handleShowActionSheet}>
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
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moreButton} onPress={handleShowActionSheet}>
            <Ionicons name="ellipsis-vertical" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Chat kapalı uyarısı */}
        {!canChat && (
          <View style={styles.chatClosedContainer}>
            <Ionicons name="lock-closed" size={20} color="#FF6B6B" />
            <Text style={styles.chatClosedText}>Bu sohbet kapatıldı</Text>
          </View>
        )}

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
        <View style={[styles.messagesContainer, { marginBottom: isKeyboardVisible ? 0 : 0 }]}>
          {activeChat && (
            <MessageList
              ref={messageListRef}
              messages={activeChat.messages || []}
              currentUserId={userProfile?.id || parseInt(currentUserId || '0')}
              isLoading={isLoadingMessages}
              hasMore={activeChat.hasMore}
              onLoadMore={loadMoreMessages}
              onRefresh={handleRefresh}
              isRefreshing={refreshing}
              emptyMessage={`${chatInfo.otherUser?.displayName || 'Bu kişi'} ile sohbet başlasın! 💬`}
              typingUsers={typingUsers.get(chatRoomId.toString())}
              otherUserName={chatInfo.otherUser?.displayName}
            />
          )}
        </View>

        {/* Mesaj input - canChat false ise gizle */}
        {canChat ? (
          <MessageInput
            onSendMessage={handleSendMessage}
            limitInfo={null} // Özel mesajlarda limit yok
            placeholder={`${chatInfo.otherUser?.displayName || 'Kullanıcı'}'ya mesaj yaz...`}
            disabled={isLoadingMessages}
            chatRoomId={chatRoomId}
            onTypingChange={(isTyping) => sendTypingIndicator(chatRoomId.toString(), isTyping)}
          />
        ) : (
          <View style={styles.chatClosedInputContainer}>
            <Text style={styles.chatClosedInputText}>
              Bu sohbete mesaj gönderemezsiniz
            </Text>
          </View>
        )}

        {/* Android Action Sheet Modal */}
        <Modal
          visible={showActionSheet}
          transparent
          animationType="slide"
          onRequestClose={() => setShowActionSheet(false)}
        >
          <TouchableOpacity 
            style={styles.actionSheetOverlay} 
            activeOpacity={1} 
            onPress={() => setShowActionSheet(false)}
          >
            <View style={styles.actionSheetContainer}>
              <TouchableOpacity 
                style={styles.actionSheetItem}
                onPress={() => {
                  setShowActionSheet(false);
                  handleViewProfile();
                }}
              >
                <Ionicons name="person-outline" size={24} color="#333" />
                <Text style={styles.actionSheetItemText}>Profili Görüntüle</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionSheetItem}
                onPress={() => {
                  setShowActionSheet(false);
                  setShowReportModal(true);
                }}
              >
                <Ionicons name="flag-outline" size={24} color="#333" />
                <Text style={styles.actionSheetItemText}>Şikayet Et</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionSheetItem}
                onPress={() => {
                  setShowActionSheet(false);
                  setShowUnmatchModal(true);
                }}
              >
                <Ionicons name="heart-dislike-outline" size={24} color="#FF9500" />
                <Text style={[styles.actionSheetItemText, { color: '#FF9500' }]}>Eşleşmeyi Kaldır</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionSheetItem}
                onPress={() => {
                  setShowActionSheet(false);
                  setShowBlockModal(true);
                }}
              >
                <Ionicons name="ban-outline" size={24} color="#FF3B30" />
                <Text style={[styles.actionSheetItemText, { color: '#FF3B30' }]}>Engelle</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionSheetItem, styles.actionSheetCancel]}
                onPress={() => setShowActionSheet(false)}
              >
                <Text style={styles.actionSheetCancelText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Block Confirmation Modal */}
        <Modal
          visible={showBlockModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowBlockModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="ban" size={48} color="#FF3B30" />
              </View>
              <Text style={styles.modalTitle}>Kullanıcıyı Engelle</Text>
              <Text style={styles.modalMessage}>
                Bu kullanıcıyı engellerseniz mesajlaşamazsınız ve bir daha karşınıza çıkmaz.{'\n\n'}
                Engeli Ayarlar'dan kaldırabilirsiniz.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowBlockModal(false)}
                  disabled={blockLoading}
                >
                  <Text style={styles.modalButtonCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonDestructive]}
                  onPress={handleBlock}
                  disabled={blockLoading}
                >
                  <Text style={styles.modalButtonDestructiveText}>
                    {blockLoading ? 'Engelleniyor...' : 'Engelle'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Unmatch Confirmation Modal */}
        <Modal
          visible={showUnmatchModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowUnmatchModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="heart-dislike" size={48} color="#FF9500" />
              </View>
              <Text style={styles.modalTitle}>Eşleşmeyi Kaldır</Text>
              <Text style={styles.modalMessage}>
                Bu eşleşme kaldırılacak.{'\n\n'}
                7 gün sonra tekrar karşınıza çıkabilir.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowUnmatchModal(false)}
                  disabled={unmatchLoading}
                >
                  <Text style={styles.modalButtonCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonWarning]}
                  onPress={handleUnmatch}
                  disabled={unmatchLoading}
                >
                  <Text style={styles.modalButtonWarningText}>
                    {unmatchLoading ? 'Kaldırılıyor...' : 'Kaldır'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Report Modal */}
        <Modal
          visible={showReportModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowReportModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="flag" size={48} color="#FF9500" />
              </View>
              <Text style={styles.modalTitle}>Kullanıcıyı Şikayet Et</Text>
              <Text style={styles.modalMessage}>Şikayet nedenini seçin:</Text>
              
              <TouchableOpacity 
                style={styles.reportOption}
                onPress={() => handleReport('INAPPROPRIATE_CONTENT')}
                disabled={isActionLoading}
              >
                <Text style={styles.reportOptionText}>Uygunsuz İçerik</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.reportOption}
                onPress={() => handleReport('HARASSMENT')}
                disabled={isActionLoading}
              >
                <Text style={styles.reportOptionText}>Taciz</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.reportOption}
                onPress={() => handleReport('SPAM')}
                disabled={isActionLoading}
              >
                <Text style={styles.reportOptionText}>Spam</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.reportOption}
                onPress={() => handleReport('FAKE_PROFILE')}
                disabled={isActionLoading}
              >
                <Text style={styles.reportOptionText}>Sahte Profil</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel, { marginTop: 16 }]}
                onPress={() => setShowReportModal(false)}
                disabled={isActionLoading}
              >
                <Text style={styles.modalButtonCancelText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  
  // Chat closed state
  chatClosedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,107,107,0.15)',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  chatClosedText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  chatClosedInputContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  chatClosedInputText: {
    color: '#999',
    fontSize: 14,
  },
  
  // Action Sheet (Android)
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  actionSheetContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  actionSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionSheetItemText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#333',
  },
  actionSheetCancel: {
    borderBottomWidth: 0,
    marginTop: 8,
    justifyContent: 'center',
  },
  actionSheetCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  modalButtonCancel: {
    backgroundColor: '#F0F0F0',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalButtonDestructive: {
    backgroundColor: '#FF3B30',
  },
  modalButtonDestructiveText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  modalButtonWarning: {
    backgroundColor: '#FF9500',
  },
  modalButtonWarningText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  
  // Report options
  reportOption: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 8,
  },
  reportOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});
