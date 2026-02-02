import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';

import ChatActionModal from '../components/chat/ChatActionModal';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useBlock } from '../hooks/useBlock';
import { useUnmatch } from '../hooks/useUnmatch';
import { ChatListItem } from '../services/api';
import { calculateActiveUserCount } from '../utils/activeUserCount';

// Evren temalı arka plan bileşenleri
const AstrologyUniverse = () => {
  const starRotation = useSharedValue(0);
  const planetRotation = useSharedValue(0);
  const zodiacRotation = useSharedValue(0);

  useEffect(() => {
    // Yıldızların yavaş dönüşü
    starRotation.value = withRepeat(
      withTiming(360, { duration: 120000, easing: Easing.linear }),
      -1,
      false
    );

    // Gezegenlerin dönüşü
    planetRotation.value = withRepeat(
      withTiming(360, { duration: 80000, easing: Easing.linear }),
      -1,
      false
    );

    // Burç çarkının dönüşü
    zodiacRotation.value = withRepeat(
      withTiming(360, { duration: 180000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${starRotation.value}deg` }],
  }));

  const planetStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${planetRotation.value}deg` }],
  }));

  const zodiacStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${zodiacRotation.value}deg` }],
  }));

  return (
    <View style={styles.universeContainer}>
      {/* Uzak yıldızlar */}
      <Animated.View style={[styles.starField, starStyle]}>
        {Array.from({ length: 100 }).map((_, i) => (
          <View
            key={`star-${i}`}
            style={[
              styles.star,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.8 + 0.2,
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Gezegenler */}
      <Animated.View style={[styles.planetField, planetStyle]}>
        <View style={[styles.planet, styles.planet1]} />
        <View style={[styles.planet, styles.planet2]} />
        <View style={[styles.planet, styles.planet3]} />
        <View style={[styles.planet, styles.planet4]} />
      </Animated.View>

      {/* Burç sembolleri */}
      <Animated.View style={[styles.zodiacField, zodiacStyle]}>
        {['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map((symbol, i) => (
          <View
            key={`zodiac-${i}`}
            style={[
              styles.zodiacSymbol,
              {
                transform: [
                  { rotate: `${(i * 30)}deg` },
                  { translateY: -120 },
                ],
              },
            ]}
          >
            <Text style={styles.zodiacText}>{symbol}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Nebula efektleri */}
      <View style={styles.nebula1} />
      <View style={styles.nebula2} />
      <View style={styles.nebula3} />
    </View>
  );
};

const MusicUniverse = () => {
  const noteRotation = useSharedValue(0);
  const instrumentRotation = useSharedValue(0);
  const waveAnimation = useSharedValue(0);

  useEffect(() => {
    // Notaların dönüşü
    noteRotation.value = withRepeat(
      withTiming(360, { duration: 90000, easing: Easing.linear }),
      -1,
      false
    );

    // Enstrümanların dönüşü
    instrumentRotation.value = withRepeat(
      withTiming(360, { duration: 150000, easing: Easing.linear }),
      -1,
      false
    );

    // Ses dalgası animasyonu
    waveAnimation.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const noteStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${noteRotation.value}deg` }],
  }));

  const instrumentStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${instrumentRotation.value}deg` }],
  }));

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.8 + (waveAnimation.value * 0.4) }],
    opacity: 0.3 - (waveAnimation.value * 0.2),
  }));

  return (
    <View style={styles.universeContainer}>
      {/* Müzik notaları */}
      <Animated.View style={[styles.noteField, noteStyle]}>
        {['♪', '♫', '♬', '♩', '♭', '♯', '♮'].map((note, i) => (
          <View
            key={`note-${i}`}
            style={[
              styles.musicNote,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: [{ rotate: `${Math.random() * 360}deg` }],
              },
            ]}
          >
            <Text style={styles.noteText}>{note}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Enstrümanlar */}
      <Animated.View style={[styles.instrumentField, instrumentStyle]}>
        {['🎸', '🎹', '🎻', '🎺', '🥁', '🎤', '🎧', '🎼'].map((instrument, i) => (
          <View
            key={`instrument-${i}`}
            style={[
              styles.instrument,
              {
                transform: [
                  { rotate: `${(i * 45)}deg` },
                  { translateY: -100 },
                ],
              },
            ]}
          >
            <Text style={styles.instrumentText}>{instrument}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Ses dalgaları */}
      <Animated.View style={[styles.soundWave1, waveStyle]} />
      <Animated.View style={[styles.soundWave2, waveStyle]} />
      <Animated.View style={[styles.soundWave3, waveStyle]} />

      {/* Müzik parçacıkları */}
      {Array.from({ length: 50 }).map((_, i) => (
        <View
          key={`particle-${i}`}
          style={[
            styles.musicParticle,
            {
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ['#1DB954', '#1ED760', '#FFD700', '#FF6B6B'][Math.floor(Math.random() * 4)],
            },
          ]}
        />
      ))}
    </View>
  );
};

export default function ChatScreen() {
  const { currentMode } = useAuth();
  const { 
    chatList, 
    isLoadingChatList, 
    refreshChatList,
    privateChatList,
    isLoadingPrivateChats,
    refreshPrivateChats,
    loadMessages,
    markMessagesAsRead
  } = useChat();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'matches' | 'global'>('matches');
  const [globalActiveUserCount, setGlobalActiveUserCount] = useState<number>(() => calculateActiveUserCount());
  
  // Modal state'leri
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatListItem | null>(null);
  
  // Block ve Unmatch hook'ları
  const { blockUser, loading: blockLoading } = useBlock();
  const { unmatchUser, loading: unmatchLoading } = useUnmatch();


  // Tema renklerini belirle
  const theme = {
    astrology: {
      primary: '#8000FF',
      secondary: '#5B00B5',
      accent: '#FFD700',
      gradient: ['#8000FF', '#5B00B5', '#3D007A'] as const,
      cardGradient: ['rgba(128, 0, 255, 0.1)', 'rgba(91, 0, 181, 0.05)'] as const,
      shadowColor: '#8000FF'
    },
    music: {
      primary: '#1DB954',
      secondary: '#1ED760', 
      accent: '#FFD700',
      gradient: ['#1DB954', '#1ED760', '#1AA34A'] as const,
      cardGradient: ['rgba(29, 185, 84, 0.1)', 'rgba(30, 215, 96, 0.05)'] as const,
      shadowColor: '#1DB954'
    }
  };

  const currentTheme = theme[currentMode];

  // Son mesaj zamanını formatla
  const formatLastActivity = (lastActivity: string) => {
    if (!lastActivity) return 'Şimdi';
    
    try {
      const now = new Date();
      
      // Backend'den gelen tarih Türkiye saati (UTC+3) formatında geliyor
      // Bunu UTC'ye çevirmemiz gerekiyor
      let messageTime;
      if (lastActivity.includes('Z') || lastActivity.includes('+')) {
        // UTC formatında geliyor
        messageTime = new Date(lastActivity);
      } else {
        // Türkiye saati (UTC+3) formatında geliyor, UTC'ye çevir
        const localTime = new Date(lastActivity);
        // Türkiye UTC+3 olduğu için 3 saat çıkar
        const utcTime = new Date(localTime.getTime() - (3 * 60 * 60 * 1000));
        messageTime = utcTime;
      }
      
      // Invalid date kontrolü
      if (isNaN(messageTime.getTime())) {
        console.warn('⚠️ [CHAT] Invalid date:', lastActivity);
        return 'Şimdi';
      }
      
      const diffMs = now.getTime() - messageTime.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      // Debug log'u kaldırıldı - artık doğru çalışıyor

      if (diffMins < 1) return 'Şimdi';
      if (diffMins < 60) return `${diffMins}dk`;
      if (diffHours < 24) return `${diffHours}s`;
      if (diffDays < 7) return `${diffDays}g`;
      
      return messageTime.toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    } catch (error) {
      console.error('❌ [CHAT] Date format hatası:', error, lastActivity);
      return 'Şimdi';
    }
  };

  // Kombine chat listesi oluştur (genel chat + private chat'ler)
  const combinedChatList = React.useMemo(() => {
    const combined: any[] = [];
    
    if (activeTab === 'global') {
      // Sadece genel chat'i göster
      const globalChatList = chatList.map(item =>
        item.chatType === 'GLOBAL'
          ? { ...item, activeUserCount: globalActiveUserCount }
          : item
      );
      combined.push(...globalChatList);
    } else {
      // Sadece private chat'leri göster
      privateChatList.forEach(privateChat => {
        // Son mesaj zamanını dinamik olarak hesapla
        let lastMessageTime = 'Şimdi';
        if (privateChat.lastMessage?.sentAt) {
          lastMessageTime = formatLastActivity(privateChat.lastMessage.sentAt);
        } else if (privateChat.timeAgo && privateChat.timeAgo !== 'Şimdi') {
          lastMessageTime = privateChat.timeAgo;
        }
        
        const chatListItem = {
          chatRoomId: privateChat.id,
          chatType: 'PRIVATE' as const,
          chatName: privateChat.displayName,
          lastMessage: privateChat.lastMessage?.content || 'Henüz mesaj yok',
          lastMessageTime: lastMessageTime as any,
          lastActivity: privateChat.lastMessage?.sentAt || (privateChat as any).lastActivity || new Date().toISOString(),
          unreadCount: privateChat.unreadCount,
          isOnline: privateChat.otherUser.isOnline,
          avatar: privateChat.otherUser.profileImageUrl,
          matchType: privateChat.matchType as 'ZODIAC' | 'MUSIC' || 'ZODIAC' as const,
          isPremium: privateChat.otherUser.isPremium,
          activeUserCount: null,
          otherUser: privateChat.otherUser
        };
        combined.push(chatListItem);
      });
    }
    
    return combined;
  }, [chatList, privateChatList, formatLastActivity, activeTab, globalActiveUserCount]);

  // Sayfa her fokuslandığında chat listesini yenile
  // Ref kullanarak sadece bir kez çalışmasını sağla
  const hasLoadedRef = useRef(false);
  
  useFocusEffect(
    useCallback(() => {
      // İlk yüklemede veya sayfa tekrar focus olduğunda sadece bir kez çalıştır
      if (!hasLoadedRef.current) {
        console.log('💬 [CHAT] Chat screen focused - refreshing chat list');
        hasLoadedRef.current = true;
        refreshChatList();
        refreshPrivateChats();
      }
      
      // Cleanup fonksiyonu
      return () => {
        console.log('💬 [CHAT] Chat screen unfocused');
        hasLoadedRef.current = false;
      };
    }, [refreshChatList, refreshPrivateChats])
  );

  // Pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshChatList(),
      refreshPrivateChats()
    ]);
    setRefreshing(false);
  };

  // Modal handler'ları
  const confirmBlockUser = () => {
    // Önce aksiyon modalını kapat, seçimi koru
    setModalVisible(false);
    Alert.alert(
      'Kullanıcıyı Engelle',
      "Bu kullanıcıyı engellerseniz birbirinizi göremez ve mesajlaşamazsınız. Engeli Ayarlar'dan kaldırabilirsiniz. Devam etmek istiyor musunuz?",
      [
        { text: 'İptal', style: 'cancel', onPress: () => setSelectedChat(null) },
        { text: 'Evet, Engelle', style: 'destructive', onPress: () => handleBlockUser() }
      ]
    );
  };

  const confirmUnmatch = () => {
    // Önce aksiyon modalını kapat, seçimi koru
    setModalVisible(false);
    Alert.alert(
      'Eşleşmeyi Kaldır',
      'Bu eşleşmeyi kaldırırsanız sohbet kapanacak. Karşınıza 7 gün sonra tekrar çıkabilir. Devam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel', onPress: () => setSelectedChat(null) },
        { text: 'Evet, Kaldır', style: 'destructive', onPress: () => handleUnmatch() }
      ]
    );
  };

  const handleBlockUser = async () => {
    if (!selectedChat || !selectedChat.otherUser) return;
    
    try {
      console.log('🚫 [CHAT] Kullanıcı engelleniyor:', selectedChat.otherUser.id);
      
      await blockUser(
        selectedChat.otherUser.id, 
        'CHAT', 
        'Sohbet listesinden engellendi',
        selectedChat.chatRoomId
      );
      
      // Modal'ı kapat
      setModalVisible(false);
      setSelectedChat(null);
      
      // Chat listesini yenile
      await Promise.all([
        refreshChatList(),
        refreshPrivateChats()
      ]);
      
      console.log('✅ [CHAT] Kullanıcı başarıyla engellendi ve chat listesi güncellendi');
    } catch (error) {
      console.error('❌ [CHAT] Block hatası:', error);
      // Hata durumunda da modal'ı kapat
      setModalVisible(false);
      setSelectedChat(null);
    }
  };

  const handleUnmatch = async () => {
    if (!selectedChat) return;
    
    try {
      console.log('💔 [CHAT] Eşleşme kaldırılıyor:', selectedChat.chatRoomId);
      
      await unmatchUser(selectedChat.chatRoomId);
      
      // Modal'ı kapat
      setModalVisible(false);
      setSelectedChat(null);
      
      // Chat listesini yenile
      await Promise.all([
        refreshChatList(),
        refreshPrivateChats()
      ]);
      
      console.log('✅ [CHAT] Eşleşme başarıyla kaldırıldı ve chat listesi güncellendi');
    } catch (error) {
      console.error('❌ [CHAT] Unmatch hatası:', error);
      // Hata durumunda da modal'ı kapat
      setModalVisible(false);
      setSelectedChat(null);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedChat(null);
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
         router.navigate('/chat/global' as any);
       } else {
         router.navigate(`/chat/${chat.chatRoomId}` as any);
       }
    } catch (error) {
      console.error('❌ [CHAT] Chat açma hatası:', error);
    }
  };

  // Burç simgelerini tanımla
  const getZodiacEmoji = (zodiacSign?: string) => {
    if (!zodiacSign) return '⭐';
    
    // Emoji yerine text kullan (daha güvenilir)
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
    
    // Eğer emoji render edilmiyorsa, kısa isim kullan
    const zodiacNames: { [key: string]: string } = {
      'ARIES': 'KOÇ',
      'TAURUS': 'BOĞA', 
      'GEMINI': 'İKİZLER',
      'CANCER': 'YENGEÇ',
      'LEO': 'ASLAN',
      'VIRGO': 'BAŞAK',
      'LIBRA': 'TERAZİ',
      'SCORPIO': 'AKREP',
      'SAGITTARIUS': 'YAY',
      'CAPRICORN': 'OĞLAK',
      'AQUARIUS': 'KOVA',
      'PISCES': 'BALIK'
    };
    
    const result = zodiacEmojis[zodiacSign.toUpperCase()] || zodiacNames[zodiacSign.toUpperCase()] || '⭐';
    
    return result;
  };

  // Match type ikonunu belirle
  const getMatchTypeIcon = (matchType?: 'ZODIAC' | 'MUSIC', zodiacSign?: string, zodiacSignDisplay?: string) => {
    if (!matchType) return null;
    
    switch (matchType) {
      case 'ZODIAC':
        // Backend'den gelen zodiacSignDisplay'i kullan (zaten doğru simgeyi içeriyor)
        if (zodiacSignDisplay && zodiacSignDisplay.includes('♓')) {
          return '♓'; // Balık
        } else if (zodiacSignDisplay && zodiacSignDisplay.includes('♈')) {
          return '♈'; // Koç
        } else {
          return getZodiacEmoji(zodiacSign); // Fallback
        }
      case 'MUSIC':
        return '🎵';
      default:
        return null;
    }
  };

  // Chat item render
  const renderChatItem = ({ item, index }: { item: ChatListItem; index: number }) => {
    const isGlobalChat = item.chatType === 'GLOBAL';
    
    const matchIcon = getMatchTypeIcon(item.matchType, item.otherUser?.zodiacSign || undefined, item.otherUser?.zodiacSignDisplay || undefined);
    const lastMessage = item.lastMessage;
    
    // Zamanı dinamik olarak hesapla
    const getTimeDisplay = () => {
      if (isGlobalChat) {
        return formatLastActivity(item.lastActivity);
      } else {
        // Özel chat için lastActivity varsa onu kullan, yoksa lastMessageTime
        if (item.lastActivity) {
          return formatLastActivity(item.lastActivity);
        }
        return (item as any).lastMessageTime || 'Şimdi';
      }
    };

    const handlePressIn = () => {
      // Basit scale animasyonu için Animated API kullan
    };

    const handlePressOut = () => {
      // Basit scale animasyonu için Animated API kullan
    };

    return (
      <View style={styles.chatItemWrapper}>
        <TouchableOpacity 
          style={styles.chatItem}
          onPress={() => handleChatPress(item)}
          onLongPress={() => {
            if (!isGlobalChat) {
              setSelectedChat(item);
              setModalVisible(true);
            }
          }}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          delayLongPress={500}
        >
          {/* Card Background */}
          <LinearGradient
            colors={currentTheme.cardGradient as any}
            style={styles.chatItemBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          <View style={styles.chatItemContent}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {isGlobalChat ? (
                                 <LinearGradient
                   colors={currentTheme.gradient as any}
                   style={styles.globalChatAvatar}
                   start={{ x: 0, y: 0 }}
                   end={{ x: 1, y: 1 }}
                 >
                  <Text style={styles.globalChatIcon}>🌍</Text>
                </LinearGradient>
              ) : item.otherUser?.profileImageUrl ? (
                <View style={styles.avatarWrapper}>
                  {/* Avatar border gradient - arkada */}
                  <LinearGradient
                     colors={currentTheme.gradient as any}
                     style={styles.avatarBorder}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 1 }}
                   />
                  <Image 
                    source={{ uri: item.otherUser.profileImageUrl }}
                    style={styles.avatar}
                  />
                </View>
              ) : (
                <View style={styles.avatarWrapper}>
                                    <LinearGradient
                    colors={currentTheme.gradient as any}
                    style={styles.avatarPlaceholder}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.avatarText}>
                      {item.otherUser?.displayName?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </LinearGradient>
                </View>
              )}

              {/* Online indicator (sadece private chatler için) */}
              {!isGlobalChat && item.otherUser?.isOnline && (
                <View style={styles.onlineIndicator}>
                  <View style={styles.onlinePulse} />
                </View>
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
                    <View style={styles.matchIconContainer}>
                      <Text style={styles.matchIcon}>{matchIcon}</Text>
                    </View>
                  )}
                  
                  {/* Premium badge */}
                  {!isGlobalChat && item.otherUser?.isPremium && (
                    <View style={styles.premiumBadgeContainer}>
                      <Text style={styles.premiumBadge}>👑</Text>
                    </View>
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
                    {getTimeDisplay()}
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
                  {typeof lastMessage === 'string' ? lastMessage : lastMessage?.content || (isGlobalChat ? 'Sohbete katılın!' : 'Henüz mesaj yok')}
                </Text>
                
                {/* Unread badge */}
                {item.unreadCount > 0 && (
                                    <LinearGradient
                    colors={currentTheme.gradient as any}
                    style={styles.unreadBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.unreadBadgeText}>
                      {item.unreadCount > 99 ? '99+' : item.unreadCount}
                    </Text>
                  </LinearGradient>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Boş liste gösterimi
  const renderEmpty = () => {
    if (isLoadingChatList || isLoadingPrivateChats) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
          <Text style={styles.emptyText}>Sohbetler yükleniyor...</Text>
        </View>
      );
    }

    if (activeTab === 'global') {
      return (
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={currentTheme.cardGradient as any}
            style={styles.emptyCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="globe-outline" size={80} color={currentTheme.primary} />
            <Text style={styles.emptyText}>Genel Sohbet</Text>
            <Text style={styles.emptySubtext}>
              Herkesle sohbet etmeye başlayın! 🌍
            </Text>
          </LinearGradient>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <LinearGradient
          colors={currentTheme.cardGradient as any}
          style={styles.emptyCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="people-outline" size={80} color={currentTheme.primary} />
          <Text style={styles.emptyText}>Henüz eşleşme yok</Text>
          <Text style={styles.emptySubtext}>
            Yeni eşleşmeler yaptığınızda burada görünecek
          </Text>
        </LinearGradient>
      </View>
    );
  };

  // Update global active user count every minute
  useEffect(() => {
    setGlobalActiveUserCount(calculateActiveUserCount());
    const interval = setInterval(() => {
      setGlobalActiveUserCount(calculateActiveUserCount());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Arka plan gradient */}
      <LinearGradient colors={currentTheme.gradient as any} style={styles.background} />

      {/* Evren temalı arka plan */}
      {currentMode === 'astrology' ? <AstrologyUniverse /> : <MusicUniverse />}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 Mesajlar</Text>
        
        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'matches' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('matches')}
          >
            <Text style={[
              styles.tabIcon,
              activeTab === 'matches' && { color: currentTheme.primary }
            ]}>
              👥
            </Text>
            <Text style={[
              styles.tabText,
              activeTab === 'matches' && { color: currentTheme.primary }
            ]}>
              Eşleşmelerim
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'global' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('global')}
          >
            <Text style={[
              styles.tabIcon,
              activeTab === 'global' && { color: currentTheme.primary }
            ]}>
              🌍
            </Text>
            <Text style={[
              styles.tabText,
              activeTab === 'global' && { color: currentTheme.primary }
            ]}>
              Genel Sohbet
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat listesi */}
      <View style={styles.chatListContainer}>
        <FlatList
          data={combinedChatList}
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
          contentContainerStyle={combinedChatList.length === 0 ? styles.emptyContentContainer : styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
      
      {/* Chat Action Modal */}
      <ChatActionModal
        visible={modalVisible}
        onClose={handleCloseModal}
        userName={selectedChat?.otherUser?.displayName || selectedChat?.chatName || ''}
        onViewProfile={() => {
          if (selectedChat?.otherUser?.id) {
            router.push(`/profile/${selectedChat.otherUser.id}?chatRoomId=${selectedChat.chatRoomId}` as any);
          }
          setModalVisible(false);
          setSelectedChat(null);
        }}
        onBlock={confirmBlockUser}
        onUnmatch={confirmUnmatch}
        isLoading={blockLoading || unmatchLoading}
        themeColors={{
          primary: currentTheme.primary,
          gradient: currentTheme.gradient
        }}
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

  // Evren temalı arka plan stilleri
  universeContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },

  // Astroloji evreni
  starField: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  star: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 1,
  },
  planetField: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planet: {
    position: 'absolute',
    borderRadius: 50,
  },
  planet1: {
    width: 20,
    height: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.6)',
    top: '20%',
    left: '15%',
  },
  planet2: {
    width: 15,
    height: 15,
    backgroundColor: 'rgba(255, 165, 0, 0.5)',
    top: '60%',
    right: '20%',
  },
  planet3: {
    width: 25,
    height: 25,
    backgroundColor: 'rgba(138, 43, 226, 0.4)',
    bottom: '30%',
    left: '10%',
  },
  planet4: {
    width: 18,
    height: 18,
    backgroundColor: 'rgba(255, 20, 147, 0.5)',
    top: '40%',
    right: '10%',
  },
  zodiacField: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zodiacSymbol: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zodiacText: {
    fontSize: 24,
    color: 'rgba(255, 215, 0, 0.8)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  nebula1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    top: '10%',
    right: '10%',
  },
  nebula2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 20, 147, 0.08)',
    bottom: '20%',
    left: '5%',
  },
  nebula3: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 215, 0, 0.06)',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -90 }, { translateY: -90 }],
  },

  // Müzik evreni
  noteField: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  musicNote: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteText: {
    fontSize: 20,
    color: 'rgba(29, 185, 84, 0.8)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  instrumentField: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instrument: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instrumentText: {
    fontSize: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  soundWave1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 2,
    borderColor: 'rgba(29, 185, 84, 0.2)',
    top: '20%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -150 }],
  },
  soundWave2: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    borderWidth: 1,
    borderColor: 'rgba(30, 215, 96, 0.15)',
    top: '30%',
    left: '50%',
    transform: [{ translateX: -200 }, { translateY: -200 }],
  },
  soundWave3: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    borderWidth: 1,
    borderColor: 'rgba(26, 163, 74, 0.1)',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -250 }, { translateY: -250 }],
  },
  musicParticle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.6,
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
    marginBottom: 20,
  },
  
  // Tab Container
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    padding: 4,
    width: '80%',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 21,
  },
  activeTabButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
    color: 'white',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },

  // Chat listesi
  chatListContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  separator: {
    height: 12,
  },

  // Chat item wrapper
  chatItemWrapper: {
    marginBottom: 8,
  },

  // Chat item
  chatItem: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  chatItemBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  chatItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },

  // Avatar
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    zIndex: 1, // Border'ın üstünde kalması için
  },
  avatarBorder: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 62,
    height: 62,
    borderRadius: 31,
    zIndex: 0, // Avatar'ın arkasında kalması için
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
  globalChatAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  globalChatIcon: {
    fontSize: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00FF7F',
    borderWidth: 3,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2, // En üstte kalması için
  },
  onlinePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
  },

  // Chat info
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chatNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginRight: 8,
  },
  matchIconContainer: {
    backgroundColor: 'rgba(128, 0, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  matchIcon: {
    fontSize: 14,
    fontWeight: '600',
  },
  premiumBadgeContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  premiumBadge: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Time container
  timeContainer: {
    alignItems: 'flex-end',
  },
  activeUsersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: 'rgba(0, 255, 127, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    color: '#666',
    fontWeight: '500',
  },

  // Message preview
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessageText: {
    fontSize: 15,
    color: '#666',
    flex: 1,
    marginRight: 12,
    lineHeight: 20,
  },
  unreadMessageText: {
    fontWeight: '600',
    color: '#333',
  },

  // Unread badge
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 12,
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
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
});
