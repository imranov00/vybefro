import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Alert, DeviceEventEmitter } from 'react-native';
import { chatApi, ChatListItem, ChatMessage, GlobalChatResponse, MessageLimitInfo, PrivateChatResponse, PrivateChatRoom, userApi } from '../services/api';
import {
    initializeWebSocket,
    VybeWebSocketClient,
    WebSocketMessage,
    WebSocketMessageType,
    WebSocketStatus
} from '../services/websocket';
import { getToken } from '../utils/tokenStorage';
import { useAuth } from './AuthContext';

// Context değer tipi
type ChatContextType = {
  // Chat listesi
  chatList: ChatListItem[];
  isLoadingChatList: boolean;
  refreshChatList: () => Promise<void>;
  
  // Private chat listesi
  privateChatList: PrivateChatRoom[];
  isLoadingPrivateChats: boolean;
  refreshPrivateChats: () => Promise<void>;
  
  // Aktif chat
  activeChat: GlobalChatResponse | PrivateChatResponse | null;
  activeChatId: number | null;
  isLoadingMessages: boolean;
  
  // Mesaj işlemleri
  sendGlobalMessage: (content: string) => Promise<boolean>;
  sendPrivateMessage: (content: string, receiverId: number) => Promise<boolean>;
  loadMessages: (chatRoomId: number, chatType: 'GLOBAL' | 'PRIVATE') => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  
  // Mesaj limiti
  messageLimitInfo: MessageLimitInfo | null;
  refreshMessageLimit: () => Promise<void>;
  
  // Real-time güncelleme
  addNewMessage: (message: ChatMessage) => void;
  replaceMessage: (oldId: number, newMessage: ChatMessage) => void;
  markMessagesAsRead: (chatRoomId: number) => void;
  
  // UI durumu
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  
  // Real-time polling kontrolü
  setFastPolling: (enabled: boolean) => void;
  
  // WebSocket durumu
  wsStatus: WebSocketStatus;
  wsClient: VybeWebSocketClient | null;
  
  // WebSocket işlemleri
  joinChatRoom: (chatRoomId: string) => void;
  leaveChatRoom: (chatRoomId: string) => void;
  sendTypingIndicator: (chatRoomId: string, isTyping: boolean) => void;
  updateMessageStatus: (messageId: string, chatRoomId: string, status: 'DELIVERED' | 'READ') => void;
  
  // Typing indicator'lar
  typingUsers: Map<string, Set<string>>; // chatRoomId -> Set<userId>
  
  // Hata yönetimi
  error: string | null;
  clearError: () => void;
  
  // Hybrid yaklaşım için yeni özellikler
  isWebSocketConnected: boolean;
  pendingMessages: Set<string>; // Gönderilen ama henüz WebSocket'ten gelmeyen mesajlar
  forceRefreshMessages: () => Promise<void>;
  updateMessageStatuses: () => Promise<void>;
  
  // Cache temizleme
  clearAllCache: () => void;
  // Aktif chat'i temizle (ekrandan çıkarken loop'u durdurmak için)
  clearActiveChat: () => void;
};

// Context oluştur
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Context Provider bileşeni
export function ChatProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth(); // Login durumunu kontrol et
  
  // State'ler
  const [chatList, setChatList] = useState<ChatListItem[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingChatList, setIsLoadingChatList] = useState(false);
  const [privateChatList, setPrivateChatList] = useState<PrivateChatRoom[]>([]);
  const [isLoadingPrivateChats, setIsLoadingPrivateChats] = useState(false);
  
  const [activeChat, setActiveChat] = useState<GlobalChatResponse | PrivateChatResponse | null>(null);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const [messageLimitInfo, setMessageLimitInfo] = useState<MessageLimitInfo | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fastPolling, setFastPolling] = useState(false);
  
  // WebSocket state'leri
  const [wsStatus, setWsStatus] = useState<WebSocketStatus>(WebSocketStatus.DISCONNECTED);
  const [wsClient, setWsClient] = useState<VybeWebSocketClient | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
  
  // Hybrid yaklaşım için yeni state'ler
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<Set<string>>(new Set());
  
  // Ref'ler
  const wsClientRef = useRef<VybeWebSocketClient | null>(null);
  const typingUsersRef = useRef<Map<string, Set<string>>>(new Map());
  const pendingMessagesRef = useRef<Set<string>>(new Set());
  const lastMessageCheckRef = useRef<number>(0);
  // Aynı mesaj yükleme çağrılarını kısa süre içinde çoğalmaması için guard
  const loadInFlightRef = useRef<{ key: string; ts: number } | null>(null);

  // Chat listesini yükle
  const refreshChatList = async () => {
    // Login olmadıysa API çağrısı yapma
    if (!isLoggedIn) {
      console.log('ℹ️ [CHAT CONTEXT] Kullanıcı login olmadığı için chat listesi yüklenmeyecek');
      return;
    }
    
    try {
      setIsLoadingChatList(true);
      setError(null);
      
      const chatListData = await chatApi.getChatList();
      setChatList(chatListData);
      
      console.log('✅ [CHAT CONTEXT] Chat listesi yüklendi:', chatListData.length);
    } catch (error: any) {
      console.error('❌ [CHAT CONTEXT] Chat listesi yüklenemedi:', error);
      // Login olmadığında hata gösterme
      if (isLoggedIn) {
        setError('Chat listesi yüklenemedi');
      }
    } finally {
      setIsLoadingChatList(false);
    }
  };

  // Private chat listesini yenile
  const refreshPrivateChats = async () => {
    // Login olmadıysa API çağrısı yapma
    if (!isLoggedIn) {
      console.log('ℹ️ [CHAT CONTEXT] Kullanıcı login olmadığı için private chat listesi yüklenmeyecek');
      return;
    }
    
    try {
      setIsLoadingPrivateChats(true);
      console.log('🔄 [CHAT CONTEXT] Private chat listesi yenileniyor...');
      
      const privateChatData = await chatApi.getPrivateChatList();
      setPrivateChatList(privateChatData.privateChatRooms);
      
      console.log('✅ [CHAT CONTEXT] Private chat listesi yüklendi:', privateChatData.privateChatRooms.length);
    } catch (error: any) {
      console.error('❌ [CHAT CONTEXT] Private chat listesi yüklenemedi:', error);
      
      // Login olmadığında hata gösterme
      if (!isLoggedIn) {
        console.log('ℹ️ [CHAT CONTEXT] Private chat hatası görmezden geliniyor (logout)');
        return;
      }
      
      // Oturum problemi varsa kullanıcıyı bilgilendir
      if (error.message?.includes('Oturum bilgilerinizde bir sorun var') || 
          error.message?.includes('Oturum süresi dolmuş')) {
        setError(error.message);
      } else {
        // Diğer hatalar için sessizce geç, kritik değil
        console.log('ℹ️ [CHAT CONTEXT] Private chat hatası görmezden geliniyor');
      }
    } finally {
      setIsLoadingPrivateChats(false);
    }
  };

  // Mesajları yükle
  const loadMessages = async (chatRoomId: number, chatType: 'GLOBAL' | 'PRIVATE') => {
    // Aynı endpoint ve sayfa için kısa süreli tekrarlı çağrıları engelle
    const dedupeKey = `${chatType}:${chatRoomId}:p0s20`;
    const nowTs = Date.now();
    if (loadInFlightRef.current && loadInFlightRef.current.key === dedupeKey && (nowTs - loadInFlightRef.current.ts) < 900) {
      // 900ms içinde aynı çağrı tekrarlandı; yok say
      return;
    }
    loadInFlightRef.current = { key: dedupeKey, ts: nowTs };
    try {
      setIsLoadingMessages(true);
      setError(null);
      setActiveChatId(chatRoomId);
      
      let chatData: GlobalChatResponse | PrivateChatResponse;
      
      if (chatType === 'GLOBAL') {
        chatData = await chatApi.getGlobalMessages(0, 20);
        
        // Global chat için limit bilgisini de güncelle
        if (chatData.userMessageLimit) {
          setMessageLimitInfo(chatData.userMessageLimit);
          console.log('✅ [CHAT CONTEXT] Global chat limit bilgisi güncellendi:', chatData.userMessageLimit);
        }
      } else {
        chatData = await chatApi.getPrivateMessages(chatRoomId, 0, 20);
        
        // Private chat için otherUser veya matchId kontrolü
        if (!('chatType' in chatData) && (!chatData.otherUser || !chatData.otherUser.id || !chatData.matchId)) {
          console.warn('⚠️ [CHAT CONTEXT] Private chat eksik veriler:', {
            hasOtherUser: !!chatData.otherUser,
            otherUserId: chatData.otherUser?.id,
            matchId: chatData.matchId
          });
          
          // Chat listesinden eksik bilgileri almaya çalış
          console.log('🔄 [CHAT CONTEXT] Chat listesinden eksik veriler alınıyor...');
          try {
            await refreshPrivateChats();
            const chatRoom = privateChatList.find(chat => chat.id === chatRoomId);
            
            if (chatRoom) {
              // otherUser eksikse al
              if ((!chatData.otherUser || !chatData.otherUser.id) && chatRoom.otherUser) {
                console.log('✅ [CHAT CONTEXT] Chat listesinden otherUser bulundu:', chatRoom.otherUser);
                chatData.otherUser = chatRoom.otherUser;
              }
              
              // matchId eksikse al
              if (!chatData.matchId && chatRoom.matchId) {
                console.log('✅ [CHAT CONTEXT] Chat listesinden matchId bulundu:', chatRoom.matchId);
                (chatData as any).matchId = chatRoom.matchId;
              }
              
              // matchType eksikse al
              if (!chatData.matchType && chatRoom.matchType) {
                console.log('✅ [CHAT CONTEXT] Chat listesinden matchType bulundu:', chatRoom.matchType);
                (chatData as any).matchType = chatRoom.matchType;
              }
            }
            
            // Hala otherUser yoksa hata fırlat
            if (!chatData.otherUser || !chatData.otherUser.id) {
              console.error('❌ [CHAT CONTEXT] Chat listesinde de otherUser bulunamadı');
              throw new Error('Sohbet bilgileri eksik. Lütfen tekrar deneyin.');
            }
          } catch (fallbackError: any) {
            if (fallbackError.message?.includes('Sohbet bilgileri eksik')) {
              throw fallbackError;
            }
            console.error('❌ [CHAT CONTEXT] Fallback veri alma hatası:', fallbackError);
            throw new Error('Sohbet bilgileri eksik. Lütfen tekrar deneyin.');
          }
        }
      }
      
      setActiveChat(chatData);
      
      console.log('✅ [CHAT CONTEXT] Mesajlar yüklendi:', {
        chatRoomId,
        chatType,
        messageCount: chatData.messages.length,
        matchId: 'chatType' in chatData ? null : (chatData as any).matchId
      });
    } catch (error: any) {
      console.error('❌ [CHAT CONTEXT] Mesajlar yüklenemedi:', error);
      
      // Özel hata mesajları
      if (error.message?.includes('Sohbet bilgileri eksik')) {
        setError('Sohbet bilgileri eksik. Sayfayı yenileyin.');
      } else {
        setError('Mesajlar yüklenemedi');
      }
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Daha fazla mesaj yükle (pagination)
  const loadMoreMessages = async () => {
    if (!activeChat || !activeChatId || isLoadingMessages || !activeChat.hasMore) {
      return;
    }

    try {
      setIsLoadingMessages(true);
      
      const nextPage = activeChat.currentPage + 1;
      let newChatData: GlobalChatResponse | PrivateChatResponse;
      
      if ('chatType' in activeChat && activeChat.chatType === 'GLOBAL') {
        newChatData = await chatApi.getGlobalMessages(nextPage, 20);
      } else {
        newChatData = await chatApi.getPrivateMessages(activeChatId, nextPage, 20);
      }
      
      // Mevcut mesajları yeni mesajlarla birleştir
      setActiveChat(prevChat => {
        if (!prevChat) return newChatData;
        
        return {
          ...prevChat,
          messages: [...prevChat.messages, ...newChatData.messages],
          currentPage: newChatData.currentPage,
          hasMore: newChatData.hasMore
        };
      });
      
      console.log('✅ [CHAT CONTEXT] Daha fazla mesaj yüklendi:', newChatData.messages.length);
    } catch (error: any) {
      console.error('❌ [CHAT CONTEXT] Daha fazla mesaj yüklenemedi:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Genel chat'e mesaj gönder - Gerçek Optimistic Update
  const sendGlobalMessage = async (content: string): Promise<boolean> => {
    console.log('🔄 [CHAT CONTEXT] sendGlobalMessage başlatıldı:', {
      content: content.substring(0, 50),
      activeChat: activeChat ? 'var' : 'yok',
      chatType: activeChat && 'chatType' in activeChat ? activeChat.chatType : 'bilinmiyor',
      wsConnected: isWebSocketConnected
    });
    
    try {
      setError(null);
      
      // 1. OPTIMISTIC UPDATE - Mesajı hemen UI'da göster
      const optimisticMessage: ChatMessage = {
        id: Date.now(), // Geçici ID
        chatRoomId: 1,
        content: content,
        type: 'TEXT',
        sentAt: new Date().toISOString(),
        editedAt: null,
        isEdited: false,
        status: 'SENT',
        sender: {
          id: 24, // Geçici sender ID
          username: 'teo',
          firstName: 'Teo',
          lastName: 'User',
          fullName: 'Teo User',
          profileImageUrl: null,
          zodiacSign: 'GEMINI',
          zodiacSignDisplay: '♊ İkizler',
          isPremium: false,
          gender: 'MALE',
          lastActiveTime: new Date().toISOString(),
          activityStatus: 'ONLINE',
          isOnline: true,
          displayName: 'Teo User'
        },
        timeAgo: 'Şimdi',
        canEdit: false,
        canDelete: false
      };
      
      if (activeChat && 'chatType' in activeChat && activeChat.chatType === 'GLOBAL') {
        console.log('⚡ [CHAT CONTEXT] Optimistic mesaj UI\'da gösteriliyor');
        addNewMessage(optimisticMessage);
      }
      
      // 2. API'ye mesajı gönder
      const response = await chatApi.sendGlobalMessage({ content });
      const messageId = response.message.id.toString();
      
      console.log('✅ [CHAT CONTEXT] API yanıtı alındı:', messageId);
      
      // 3. Optimistic mesajı gerçek mesajla değiştir
      if (activeChat && 'chatType' in activeChat && activeChat.chatType === 'GLOBAL') {
        console.log('🔄 [CHAT CONTEXT] Optimistic mesaj gerçek mesajla değiştiriliyor');
        replaceMessage(optimisticMessage.id, response.message);
        
        // Mesaj durumunu otomatik olarak SENT'ten DELIVERED'a güncelle (2 saniye sonra)
        setTimeout(() => {
          setActiveChat(prevChat => {
            if (!prevChat) return prevChat;
            
            return {
              ...prevChat,
              messages: prevChat.messages.map(msg => 
                msg.id === response.message.id ? { ...msg, status: 'DELIVERED' as const } : msg
              )
            };
          });
          
          // Chat listesinde de güncelle
          setChatList(prevList => 
            prevList.map(chat => {
              if (chat.chatRoomId === response.message.chatRoomId && chat.lastMessage?.id === response.message.id) {
                return {
                  ...chat,
                  lastMessage: chat.lastMessage ? { ...chat.lastMessage, status: 'DELIVERED' as const } : chat.lastMessage
                };
              }
              return chat;
            })
          );
        }, 2000);
      }
      
      // 4. Pending mesajlara ekle (WebSocket'ten gelene kadar)
      setPendingMessages(prev => new Set([...prev, messageId]));
      pendingMessagesRef.current.add(messageId);
      
      // 4. Mesaj gönderimi sonrası hızlı polling (sayfa yenileme sorununu çözer)
      console.log('🔄 [CHAT CONTEXT] Mesaj gönderimi sonrası hızlı polling başlatılıyor...');
      
      // İlk polling: 1 saniye sonra (çok hızlı)
      setTimeout(async () => {
        try {
          if (activeChat && 'chatType' in activeChat && activeChat.chatType === 'GLOBAL') {
            console.log('🔄 [CHAT CONTEXT] İlk hızlı polling yapılıyor...');
            const newChatData = await chatApi.getGlobalMessages(0, 20);
            
            // Yeni mesajları kontrol et ve ekle
            const currentMessageIds = activeChat.messages.map(m => m.id);
            const newMessages = newChatData.messages.filter(m => !currentMessageIds.includes(m.id));
            
            if (newMessages.length > 0) {
              console.log(`🆕 [CHAT CONTEXT] İlk hızlı polling'de ${newMessages.length} yeni mesaj bulundu`);
              newMessages.reverse().forEach(message => {
                addNewMessage(message);
                // Pending mesajlardan çıkar
                pendingMessagesRef.current.delete(message.id.toString());
              });
            }
          }
        } catch (error) {
          console.warn('⚠️ [CHAT CONTEXT] İlk hızlı polling hatası:', error);
        }
      }, 1000);
      
      // İkinci polling: 3 saniye sonra (güvenlik için)
      setTimeout(async () => {
        try {
          if (activeChat && 'chatType' in activeChat && activeChat.chatType === 'GLOBAL') {
            console.log('🔄 [CHAT CONTEXT] İkinci hızlı polling yapılıyor...');
            const newChatData = await chatApi.getGlobalMessages(0, 20);
            
            // Yeni mesajları kontrol et ve ekle
            const currentMessageIds = activeChat.messages.map(m => m.id);
            const newMessages = newChatData.messages.filter(m => !currentMessageIds.includes(m.id));
            
            if (newMessages.length > 0) {
              console.log(`🆕 [CHAT CONTEXT] İkinci hızlı polling'de ${newMessages.length} yeni mesaj bulundu`);
              newMessages.reverse().forEach(message => {
                addNewMessage(message);
                // Pending mesajlardan çıkar
                pendingMessagesRef.current.delete(message.id.toString());
              });
            }
          }
        } catch (error) {
          console.warn('⚠️ [CHAT CONTEXT] İkinci hızlı polling hatası:', error);
        }
      }, 3000);
      
      // 5. Chat listesini güncelle (sadece mesaj eklenmediğinde)
      if (!activeChat || !('chatType' in activeChat) || activeChat.chatType !== 'GLOBAL') {
        await refreshChatList();
      }
      
      console.log('✅ [CHAT CONTEXT] Genel mesaj gönderildi');
      return true;
    } catch (error: any) {
      console.error('❌ [CHAT CONTEXT] Genel mesaj gönderilemedi:', error);
      setError(error.message || 'Mesaj gönderilemedi');
      
      // Limit hatası varsa limit bilgisini güncelle
      if (error.message && error.message.includes('limit')) {
        await refreshMessageLimit();
      }
      
      return false;
    }
  };

  // Özel mesaj gönder - Optimistic Update ile
  const sendPrivateMessage = async (content: string, receiverId: number): Promise<boolean> => {
    console.log('🔄 [CHAT CONTEXT] sendPrivateMessage başlatıldı:', {
      content: content.substring(0, 50),
      receiverId,
      activeChat: activeChat ? 'var' : 'yok',
      chatType: activeChat && !('chatType' in activeChat) ? 'PRIVATE' : 'bilinmiyor'
    });
    
    try {
      setError(null);
      
      // 1. OPTIMISTIC UPDATE - Mesajı hemen UI'da göster
      const optimisticMessage: ChatMessage = {
        id: Date.now(), // Geçici ID
        chatRoomId: activeChatId || 0,
        content: content,
        type: 'TEXT',
        sentAt: new Date().toISOString(),
        editedAt: null,
        isEdited: false,
        status: 'SENT',
        sender: {
          id: userProfile?.id || 0,
          username: userProfile?.username || 'user',
          firstName: userProfile?.firstName || 'User',
          lastName: userProfile?.lastName || '',
          fullName: `${userProfile?.firstName || 'User'} ${userProfile?.lastName || ''}`,
          profileImageUrl: userProfile?.profileImageUrl || null,
          zodiacSign: userProfile?.zodiacSign || 'ARIES',
          zodiacSignDisplay: userProfile?.zodiacSignDisplay || '♈ Koç',
          isPremium: userProfile?.isPremium || false,
          gender: userProfile?.gender || 'UNKNOWN',
          lastActiveTime: new Date().toISOString(),
          activityStatus: 'ONLINE',
          isOnline: true,
          displayName: `${userProfile?.firstName || 'User'} ${userProfile?.lastName || ''}`
        },
        timeAgo: 'Şimdi',
        canEdit: false,
        canDelete: false
      };
      
      if (activeChat && !('chatType' in activeChat)) {
        console.log('⚡ [CHAT CONTEXT] Optimistic özel mesaj UI\'da gösteriliyor');
        addNewMessage(optimisticMessage);
      }
      
      // 2. API'ye mesajı gönder
      const response = await chatApi.sendPrivateMessage({ content, receiverId });
      const messageId = response.message.id.toString();
      
      console.log('✅ [CHAT CONTEXT] Özel mesaj API yanıtı alındı:', messageId);
      
      // 3. Optimistic mesajı gerçek mesajla değiştir
      if (activeChat && !('chatType' in activeChat)) {
        console.log('🔄 [CHAT CONTEXT] Optimistic özel mesaj gerçek mesajla değiştiriliyor');
        replaceMessage(optimisticMessage.id, response.message);
        
        // Mesaj durumunu otomatik olarak SENT'ten DELIVERED'a güncelle (2 saniye sonra)
        setTimeout(() => {
          setActiveChat(prevChat => {
            if (!prevChat) return prevChat;
            
            return {
              ...prevChat,
              messages: prevChat.messages.map(msg => 
                msg.id === response.message.id ? { ...msg, status: 'DELIVERED' as const } : msg
              )
            };
          });
          
          // Private chat listesinde de güncelle
          setPrivateChatList(prevList => 
            prevList.map(chat => {
              if (chat.id === response.message.chatRoomId && chat.lastMessage?.id === response.message.id) {
                return {
                  ...chat,
                  lastMessage: chat.lastMessage ? { ...chat.lastMessage, status: 'DELIVERED' as const } : chat.lastMessage
                };
              }
              return chat;
            })
          );
        }, 2000);
      }
      
      // 4. Pending mesajlara ekle (WebSocket'ten gelene kadar)
      setPendingMessages(prev => new Set([...prev, messageId]));
      pendingMessagesRef.current.add(messageId);
      
      // 5. Özel mesaj gönderimi sonrası hızlı polling
      console.log('🔄 [CHAT CONTEXT] Özel mesaj gönderimi sonrası hızlı polling başlatılıyor...');
      
      // İlk polling: 1 saniye sonra (çok hızlı)
      setTimeout(async () => {
        try {
          if (activeChat && !('chatType' in activeChat)) {
            console.log('🔄 [CHAT CONTEXT] Özel chat ilk hızlı polling yapılıyor...');
            const newChatData = await chatApi.getPrivateMessages(activeChatId || 0, 0, 20);
            
            // Yeni mesajları kontrol et ve ekle
            const currentMessageIds = activeChat.messages.map(m => m.id);
            const newMessages = newChatData.messages.filter(m => !currentMessageIds.includes(m.id));
            
            if (newMessages.length > 0) {
              console.log(`🆕 [CHAT CONTEXT] Özel chat ilk hızlı polling'de ${newMessages.length} yeni mesaj bulundu`);
              newMessages.reverse().forEach(message => {
                addNewMessage(message);
                // Pending mesajlardan çıkar
                pendingMessagesRef.current.delete(message.id.toString());
              });
            }
          }
        } catch (error) {
          console.warn('⚠️ [CHAT CONTEXT] Özel chat ilk hızlı polling hatası:', error);
        }
      }, 1000);
      
      // İkinci polling: 3 saniye sonra (güvenlik için)
      setTimeout(async () => {
        try {
          if (activeChat && !('chatType' in activeChat)) {
            console.log('🔄 [CHAT CONTEXT] Özel chat ikinci hızlı polling yapılıyor...');
            const newChatData = await chatApi.getPrivateMessages(activeChatId || 0, 0, 20);
            
            // Yeni mesajları kontrol et ve ekle
            const currentMessageIds = activeChat.messages.map(m => m.id);
            const newMessages = newChatData.messages.filter(m => !currentMessageIds.includes(m.id));
            
            if (newMessages.length > 0) {
              console.log(`🆕 [CHAT CONTEXT] Özel chat ikinci hızlı polling'de ${newMessages.length} yeni mesaj bulundu`);
              newMessages.reverse().forEach(message => {
                addNewMessage(message);
                // Pending mesajlardan çıkar
                pendingMessagesRef.current.delete(message.id.toString());
              });
            }
          }
        } catch (error) {
          console.warn('⚠️ [CHAT CONTEXT] Özel chat ikinci hızlı polling hatası:', error);
        }
      }, 3000);
      
      // 6. Özel chat listesini güncelle
      await refreshPrivateChats();
      
      console.log('✅ [CHAT CONTEXT] Özel mesaj gönderildi');
      return true;
    } catch (error: any) {
      console.error('❌ [CHAT CONTEXT] Özel mesaj gönderilemedi:', error);
      
      // 6. Hata durumunda optimistic mesajı kaldır
      if (activeChat && !('chatType' in activeChat)) {
        console.log('❌ [CHAT CONTEXT] Optimistic özel mesaj kaldırılıyor (hata)');
        setActiveChat(prevChat => {
          if (!prevChat) return prevChat;
          
          return {
            ...prevChat,
            messages: prevChat.messages.filter(msg => msg.id !== Date.now()) // Geçici ID'yi kaldır
          };
        });
      }
      
      // Özel hata mesajları
      if (error.message?.includes('Transaction silently rolled back') || 
          error.message?.includes('Mesaj gönderilemedi. Lütfen tekrar deneyin.')) {
        setError('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
      } else if (error.message?.includes('Sunucu hatası')) {
        setError('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      } else {
        setError(error.message || 'Mesaj gönderilemedi');
      }
      
      return false;
    }
  };

  // Mesaj limiti bilgisini yenile
  const refreshMessageLimit = async () => {
    // Login olmadıysa API çağrısı yapma
    if (!isLoggedIn) {
      console.log('ℹ️ [CHAT CONTEXT] Kullanıcı login olmadığı için mesaj limiti yüklenmeyecek');
      return;
    }
    
    try {
      const limitInfo = await chatApi.getMessageLimitInfo();
      setMessageLimitInfo(limitInfo);
      
      console.log('✅ [CHAT CONTEXT] Mesaj limiti güncellendi:', {
        canSendMessage: limitInfo.canSendMessage,
        remainingSeconds: limitInfo.remainingSeconds
      });
    } catch (error: any) {
      console.error('❌ [CHAT CONTEXT] Mesaj limiti güncellenemedi:', error);
      // Login olmadığında hata gösterme
      if (isLoggedIn) {
        setError('Mesaj limiti bilgisi alınamadı');
      }
    }
  };

  // Mesajı değiştir (optimistic update için)
  const replaceMessage = (oldId: number, newMessage: ChatMessage) => {
    setActiveChat(prevChat => {
      if (!prevChat) return prevChat;
      
      return {
        ...prevChat,
        messages: prevChat.messages.map(msg => 
          msg.id === oldId ? newMessage : msg
        )
      };
    });
    
    console.log('🔄 [CHAT CONTEXT] Mesaj değiştirildi:', oldId, '->', newMessage.id);
  };

  // Yeni mesaj ekle - Hybrid yaklaşım ile iyileştirildi
  const addNewMessage = (message: ChatMessage) => {
    const messageId = message.id.toString();
    
    // Pending mesajlardan kaldır (WebSocket'ten geldi)
    if (pendingMessagesRef.current.has(messageId)) {
      console.log('✅ [CHAT CONTEXT] Pending mesaj WebSocket\'ten geldi:', messageId);
      setPendingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
      pendingMessagesRef.current.delete(messageId);
    }
    
    setActiveChat(prevChat => {
      if (!prevChat || prevChat.chatRoomId !== message.chatRoomId) {
        console.log('⚠️ [CHAT CONTEXT] Mesaj eklenmedi - chat room uyumsuz:', {
          prevChatId: prevChat?.chatRoomId,
          messageRoomId: message.chatRoomId
        });
        return prevChat;
      }
      
      // Mesaj zaten varsa ekleme (hem ID hem de content kontrolü)
      const messageExists = prevChat.messages.some(m => 
        m.id === message.id || 
        (m.content === message.content && m.sender.id === message.sender.id && 
         Math.abs(new Date(m.sentAt).getTime() - new Date(message.sentAt).getTime()) < 1000)
      );
      
      if (messageExists) {
        console.log('⚠️ [CHAT CONTEXT] Duplicate mesaj engellendi:', message.id);
        return prevChat;
      }
      
      console.log('✅ [CHAT CONTEXT] Yeni mesaj eklendi:', message.id);
      return {
        ...prevChat,
        messages: [message, ...prevChat.messages],
        totalMessages: prevChat.totalMessages + 1
      };
    });
    
    // Chat listesini de güncelle (yeni mesaj geldiğinde)
    if (activeChat && !('chatType' in activeChat)) {
      // Özel chat için private chat listesini güncelle
      setPrivateChatList(prevList => 
        prevList.map(chat => 
          chat.id === message.chatRoomId 
            ? {
                ...chat,
                lastMessage: {
                  id: message.id,
                  content: message.content,
                  sentAt: message.sentAt,
                  sender: message.sender
                },
                lastActivity: message.sentAt,
                timeAgo: 'Şimdi' // Mesaj yeni gönderildiği için "Şimdi" olarak işaretle
              }
            : chat
        )
      );
    } else if (activeChat && 'chatType' in activeChat) {
      // Genel chat için chat listesini güncelle
      setChatList(prevList => 
        prevList.map(chat => 
          chat.chatRoomId === message.chatRoomId 
            ? {
                ...chat,
                lastMessage: message,
                lastActivity: message.sentAt
              }
            : chat
        )
      );
    }
  };

  // Mesajları okundu olarak işaretle
  const markMessagesAsRead = (chatRoomId: number) => {
    // Chat listesinde unread count'u sıfırla
    setChatList(prevList => 
      prevList.map(chat => 
        chat.chatRoomId === chatRoomId 
          ? { ...chat, unreadCount: 0 }
          : chat
      )
    );
    
    console.log('✅ [CHAT CONTEXT] Mesajlar okundu olarak işaretlendi:', chatRoomId);
  };

  // Zaman formatla
  const formatTimeAgo = (dateString: string) => {
    try {
      const now = new Date();
      const messageTime = new Date(dateString);
      
      if (isNaN(messageTime.getTime())) {
        console.warn('⚠️ [CHAT CONTEXT] Invalid date:', dateString);
        return 'Şimdi';
      }
      
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
    } catch (error) {
      console.error('❌ [CHAT CONTEXT] Date format hatası:', error, dateString);
      return 'Şimdi';
    }
  };

  // Hata temizle
  const clearError = () => {
    setError(null);
  };

  // WebSocket fonksiyonları
  const joinChatRoom = (chatRoomId: string) => {
    if (wsClientRef.current) {
      wsClientRef.current.joinChat(chatRoomId);
      console.log('👥 [CHAT CONTEXT] Chat odasına katılındı:', chatRoomId);
      
      // Typing subscription'ı da ekle
      wsClientRef.current.subscribeToChatTyping(chatRoomId);
      console.log('⌨️ [CHAT CONTEXT] Typing subscription eklendi:', chatRoomId);
    } else {
      console.warn('⚠️ [CHAT CONTEXT] WebSocket client yok, chat odasına katılınamadı:', chatRoomId);
    }
  };

  const leaveChatRoom = (chatRoomId: string) => {
    if (wsClientRef.current) {
      wsClientRef.current.leaveChat(chatRoomId);
      console.log('👋 [CHAT CONTEXT] Chat odasından çıkıldı:', chatRoomId);
    }
  };

  const sendTypingIndicator = (chatRoomId: string, isTyping: boolean) => {
    if (wsClientRef.current) {
      wsClientRef.current.sendTypingIndicator(chatRoomId, isTyping);
    }
  };

  const updateMessageStatus = (messageId: string, chatRoomId: string, status: 'DELIVERED' | 'READ') => {
    if (wsClientRef.current) {
      wsClientRef.current.updateMessageStatus(messageId, chatRoomId, status);
    }
  };

  // Zorla mesaj yenileme (fallback mekanizması)
  const forceRefreshMessages = async () => {
    if (!activeChat || !activeChatId) {
      console.log('⚠️ [CHAT CONTEXT] Aktif chat yok, refresh yapılamıyor');
      return;
    }
    
    const now = Date.now();
    if (now - lastMessageCheckRef.current < 2000) {
      console.log('⏰ [CHAT CONTEXT] Çok sık refresh, bekleniyor...');
      return;
    }
    
    lastMessageCheckRef.current = now;
    
    try {
      console.log('🔄 [CHAT CONTEXT] Mesajlar zorla yenileniyor...');
      
      if ('chatType' in activeChat && activeChat.chatType === 'GLOBAL') {
        const newChatData = await chatApi.getGlobalMessages(0, 20);
        setActiveChat(newChatData);
        
        // Limit bilgisini de güncelle
        if (newChatData.userMessageLimit) {
          setMessageLimitInfo(newChatData.userMessageLimit);
        }
      } else {
        const newChatData = await chatApi.getPrivateMessages(activeChatId, 0, 20);
        setActiveChat(newChatData);
      }
      
      console.log('✅ [CHAT CONTEXT] Mesajlar yenilendi');
    } catch (error) {
      console.error('❌ [CHAT CONTEXT] Mesaj yenileme hatası:', error);
    }
  };

  // Mesaj durumlarını hızlı güncelleme fonksiyonu (yeni endpoint ile)
  const updateMessageStatuses = async () => {
    if (!activeChat || !activeChatId) return;
    
    try {
      // Sadece SENT durumundaki mesajların ID'lerini al
      const sentMessageIds = activeChat.messages
        .filter(msg => msg.status === 'SENT')
        .map(msg => msg.id);
      
      if (sentMessageIds.length === 0) {
        return; // Güncellenecek mesaj yok
      }
      
      // Yeni endpoint ile sadece durumları kontrol et
      const statusUpdates = await chatApi.updateMessageStatuses(activeChatId, sentMessageIds);
      
      // Durum güncellemelerini uygula
      const hasChanges = Object.keys(statusUpdates).length > 0;
      
      if (hasChanges) {
        setActiveChat(prevChat => {
          if (!prevChat) return prevChat;
          
          return {
            ...prevChat,
            messages: prevChat.messages.map(msg => {
              const newStatus = statusUpdates[msg.id];
              if (newStatus && newStatus !== msg.status) {
                console.log(`🔄 [CHAT CONTEXT] Durum güncellendi: ${msg.id} ${msg.status} -> ${newStatus}`);
                return { ...msg, status: newStatus as any };
              }
              return msg;
            })
          };
        });
      }
    } catch (error) {
      console.warn('⚠️ [CHAT CONTEXT] Durum güncelleme hatası:', error);
    }
  };

  // WebSocket event handler'ları - Hybrid yaklaşım ile güncellendi
  const setupWebSocketHandlers = (client: VybeWebSocketClient) => {
    client.setEventHandlers({
      onMessageReceived: (message: WebSocketMessage) => {
        console.log('📥 [CHAT CONTEXT] WebSocket mesaj alındı:', message.action);
        
        if (message.action === WebSocketMessageType.MESSAGE_RECEIVED && message.data) {
          const chatMessage = message.data as ChatMessage;
          addNewMessage(chatMessage);
          
          // Pending mesajlardan çıkar (eğer varsa)
          if (pendingMessagesRef.current.has(chatMessage.id.toString())) {
            console.log('✅ [CHAT CONTEXT] Pending mesaj WebSocket ile alındı:', chatMessage.id);
            pendingMessagesRef.current.delete(chatMessage.id.toString());
          }
        }
      },
      
      onMessageDelivered: (messageId: string, chatRoomId: string) => {
        console.log('✅ [CHAT CONTEXT] Mesaj iletildi:', messageId, chatRoomId);
        // Mesaj durumunu güncelle - hem aktif chat hem de chat listesinde
        setActiveChat(prevChat => {
          if (!prevChat) return prevChat;
          
          return {
            ...prevChat,
            messages: prevChat.messages.map(msg => 
              msg.id.toString() === messageId ? { ...msg, status: 'DELIVERED' as const } : msg
            )
          };
        });
        
        // Chat listesinde de güncelle (eğer bu mesaj son mesajsa)
        setChatList(prevList => 
          prevList.map(chat => {
            if (chat.chatRoomId.toString() === chatRoomId && chat.lastMessage?.id.toString() === messageId) {
              return {
                ...chat,
                lastMessage: chat.lastMessage ? { ...chat.lastMessage, status: 'DELIVERED' as const } : chat.lastMessage
              };
            }
            return chat;
          })
        );
      },
      
      onMessageRead: (messageId: string, chatRoomId: string) => {
        console.log('👁️ [CHAT CONTEXT] Mesaj okundu:', messageId, chatRoomId);
        // Mesaj durumunu güncelle - hem aktif chat hem de chat listesinde
        setActiveChat(prevChat => {
          if (!prevChat) return prevChat;
          
          return {
            ...prevChat,
            messages: prevChat.messages.map(msg => 
              msg.id.toString() === messageId ? { ...msg, status: 'READ' as const } : msg
            )
          };
        });
        
        // Chat listesinde de güncelle (eğer bu mesaj son mesajsa)
        setChatList(prevList => 
          prevList.map(chat => {
            if (chat.chatRoomId.toString() === chatRoomId && chat.lastMessage?.id.toString() === messageId) {
              return {
                ...chat,
                lastMessage: chat.lastMessage ? { ...chat.lastMessage, status: 'READ' as const } : chat.lastMessage
              };
            }
            return chat;
          })
        );
        
        // Private chat listesinde de güncelle
        setPrivateChatList(prevList => 
          prevList.map(chat => {
            if (chat.id.toString() === chatRoomId && chat.lastMessage?.id.toString() === messageId) {
              return {
                ...chat,
                lastMessage: chat.lastMessage ? { ...chat.lastMessage, status: 'READ' as const } : chat.lastMessage
              };
            }
            return chat;
          })
        );
      },
      
      onTypingStart: (userId: string, chatRoomId: string, userName: string) => {
        console.log('⌨️ [CHAT CONTEXT] Yazıyor:', userName, chatRoomId);
        
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          const chatUsers = new Set(newMap.get(chatRoomId) || []);
          chatUsers.add(userId);
          newMap.set(chatRoomId, chatUsers);
          return newMap;
        });
      },
      
      onTypingStop: (userId: string, chatRoomId: string) => {
        console.log('⏹️ [CHAT CONTEXT] Yazmayı durdurdu:', userId, chatRoomId);
        
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          const chatUsers = new Set(newMap.get(chatRoomId) || []);
          chatUsers.delete(userId);
          if (chatUsers.size === 0) {
            newMap.delete(chatRoomId);
          } else {
            newMap.set(chatRoomId, chatUsers);
          }
          return newMap;
        });
      },
      
      onUserOnline: (userId: string) => {
        console.log('🟢 [CHAT CONTEXT] Kullanıcı online:', userId);
        // Private chat listesinde kullanıcıyı online yap
        setPrivateChatList(prev => 
          prev.map(chat => 
            chat.otherUser.id.toString() === userId 
              ? { ...chat, otherUser: { ...chat.otherUser, isOnline: true } }
              : chat
          )
        );
      },
      
      onUserOffline: (userId: string) => {
        console.log('🔴 [CHAT CONTEXT] Kullanıcı offline:', userId);
        // Private chat listesinde kullanıcıyı offline yap
        setPrivateChatList(prev => 
          prev.map(chat => 
            chat.otherUser.id.toString() === userId 
              ? { ...chat, otherUser: { ...chat.otherUser, isOnline: false } }
              : chat
          )
        );
      },
      
      onConnected: () => {
        console.log('✅ [CHAT CONTEXT] WebSocket bağlandı');
        setWsStatus(WebSocketStatus.CONNECTED);
        setIsWebSocketConnected(true);
        
        // Bağlantı kurulduğunda pending mesajları hemen kontrol et
        if (pendingMessagesRef.current.size > 0) {
          console.log('🔄 [CHAT CONTEXT] WebSocket bağlandı, pending mesajlar hemen kontrol ediliyor...');
          setTimeout(() => forceRefreshMessages(), 500); // 2 saniye yerine 0.5 saniye
        }
        
        // WebSocket bağlandığında aktif chat'e otomatik katıl
        if (activeChatId) {
          console.log('👥 [CHAT CONTEXT] WebSocket bağlandı, aktif chat\'e katılım:', activeChatId);
          joinChatRoom(activeChatId.toString());
        }
        
        // WebSocket bağlandığında typing subscription'ları yeniden kur
        if (activeChatId) {
          wsClientRef.current?.subscribeToChatTyping(activeChatId.toString());
        }
      },
      
      onDisconnected: () => {
        console.log('🔌 [CHAT CONTEXT] WebSocket bağlantısı kesildi');
        setWsStatus(WebSocketStatus.DISCONNECTED);
        setIsWebSocketConnected(false);
        
        // Bağlantı koptuğunda pending mesajlar için hemen polling başlat
        if (pendingMessagesRef.current.size > 0) {
          console.log('🔄 [CHAT CONTEXT] WebSocket koptu, hemen polling başlatılıyor...');
          setTimeout(() => forceRefreshMessages(), 200); // 1 saniye yerine 0.2 saniye
        }
      },
      
      onError: (error: string) => {
        console.error('❌ [CHAT CONTEXT] WebSocket hatası:', error);
        setWsStatus(WebSocketStatus.ERROR);
        setIsWebSocketConnected(false);
        setError(`WebSocket hatası: ${error}`);
        
        // Hata durumunda da hemen polling başlat
        if (pendingMessagesRef.current.size > 0) {
          setTimeout(() => forceRefreshMessages(), 200); // 1 saniye yerine 0.2 saniye
        }
      }
    });
  };

  // WebSocket başlatma - guard ile korunuyor
  const isInitializingRef = useRef(false);
  const initializeWebSocketConnection = async () => {
    // Zaten bağlanıyorsa veya bağlıysa tekrar başlatma
    if (isInitializingRef.current) {
      console.log('⏸️ [CHAT CONTEXT] WebSocket zaten başlatılıyor, bekleniyor...');
      return;
    }
    
    if (wsStatus === WebSocketStatus.CONNECTED || wsStatus === WebSocketStatus.CONNECTING) {
      console.log('⏸️ [CHAT CONTEXT] WebSocket zaten bağlı/bağlanıyor, tekrar başlatılmıyor');
      return;
    }
    
    try {
      isInitializingRef.current = true;
      const token = await getToken();
      if (!token) {
        console.warn('⚠️ [CHAT CONTEXT] Token bulunamadı, WebSocket başlatılamıyor');
        isInitializingRef.current = false;
        return;
      }

      // Kullanıcı bilgisini al
      let userId: string;
      try {
        const userProfile = await userApi.getProfile();
        userId = userProfile.id.toString();
        console.log('👤 [CHAT CONTEXT] Kullanıcı ID alındı:', userId);
      } catch (error) {
        console.warn('⚠️ [CHAT CONTEXT] Kullanıcı bilgisi alınamadı, token yenileme bekleniyor:', error);
        // Token yenileme sürecinde olduğu için 3 saniye sonra tekrar dene
        setTimeout(() => {
          console.log('🔄 [CHAT CONTEXT] WebSocket başlatma tekrar deneniyor...');
          initializeWebSocketConnection();
        }, 3000);
        return;
      }

      console.log('🔌 [CHAT CONTEXT] WebSocket bağlantısı başlatılıyor...');
      setWsStatus(WebSocketStatus.CONNECTING);
      
      // React Native için query parameter ile token gönder (Cloudflare/proxy header sorunları için)
      const client = await initializeWebSocket(token, userId, undefined, { 
        useQueryParameter: true,  // React Native için önerilen yöntem
        useSockJS: false         // React Native raw WebSocket kullanır
      });
      wsClientRef.current = client;
      setWsClient(client);
      
      setupWebSocketHandlers(client);
      
      console.log('✅ [CHAT CONTEXT] WebSocket bağlantısı başarılı');
      isInitializingRef.current = false;
      
      // Bağlantı başarılı olduğunda online durumunu bildir
      client.sendUserStatus(true);
      console.log('👤 [CHAT CONTEXT] User status (ONLINE) broadcast edildi');
      
      // WebSocket başarıyla bağlandıktan sonra aktif chat'e otomatik katıl
      if (activeChatId) {
        console.log('👥 [CHAT CONTEXT] WebSocket bağlandı, aktif chat\'e katılım:', activeChatId);
        joinChatRoom(activeChatId.toString());
      }
      
    } catch (error: any) {
      setWsStatus(WebSocketStatus.DISCONNECTED);
      setIsWebSocketConnected(false);
      isInitializingRef.current = false;
      // Hata mesajını logla ama kullanıcıya gösterme (polling zaten çalışıyor)
      const errorMessage = error?.message || 'WebSocket bağlantısı kurulamadı';
      console.warn('⚠️ [CHAT CONTEXT] WebSocket bağlantısı başarısız, polling moduna geçiliyor:', errorMessage);
      // Hata durumunda 30 saniye sonra tekrar dene (sessizce, daha uzun süre bekle)
      setTimeout(() => {
        if (isLoggedIn) {
          console.log('🔄 [CHAT CONTEXT] WebSocket başlatma hatası sonrası tekrar deneniyor...');
          initializeWebSocketConnection();
        }
      }, 30000); // 30 saniye
    }
  };

  // Logout event listener'ı ekle
  useEffect(() => {
    const logoutListener = DeviceEventEmitter.addListener('user_logout', (data) => {
      console.log('🗑️ [CHAT CONTEXT] Logout event alındı:', data.reason);
      clearAllCache();
    });

    return () => {
      logoutListener.remove();
    };
  }, []);

  // Login durumuna göre chat listesini ve limit bilgisini yükle
  useEffect(() => {
    if (isLoggedIn) {
      console.log('🔄 [CHAT CONTEXT] Kullanıcı login, chat verileri yükleniyor...');
      
      // Kullanıcı profilini yükle
      const loadUserProfile = async () => {
        try {
          const profile = await userApi.getProfile();
          setUserProfile(profile);
          console.log('✅ [CHAT CONTEXT] Kullanıcı profili yüklendi:', profile.id);
        } catch (error) {
          console.error('❌ [CHAT CONTEXT] Kullanıcı profili yüklenemedi:', error);
        }
      };
      
      loadUserProfile();
      refreshChatList();
      refreshPrivateChats();
      refreshMessageLimit();
      initializeWebSocketConnection();
    } else {
      console.log('ℹ️ [CHAT CONTEXT] Kullanıcı logout, chat verileri yüklenmiyor');
      setUserProfile(null);
    }
  }, [isLoggedIn]);

  // Component unmount olduğunda WebSocket'i kapat
  useEffect(() => {
    return () => {
      if (wsClientRef.current) {
        // Bağlantı kesilmeden önce offline durumunu bildir
        try {
          wsClientRef.current.sendUserStatus(false);
          console.log('👤 [CHAT CONTEXT] User status (OFFLINE) broadcast edildi (unmount)');
        } catch (error) {
          console.warn('⚠️ [CHAT CONTEXT] Offline durumu bildirilemedi:', error);
        }
        wsClientRef.current.disconnect();
      }
    };
  }, []);

  // Akıllı polling: WebSocket çalışmadığında sadece fallback olarak kullan
  useEffect(() => {
    let interval: any;
    
    // Login olmadıysa polling yapma
    if (!isLoggedIn) {
      console.log('ℹ️ [CHAT CONTEXT] Kullanıcı login olmadığı için polling yapılmayacak');
      return;
    }
    
    // WebSocket bağlıysa polling yapma
    if (isWebSocketConnected) {
      console.log('✅ [CHAT CONTEXT] WebSocket bağlı, polling devre dışı');
      return;
    }
    
    const startSmartPolling = () => {
      const chatType = activeChat && 'chatType' in activeChat ? 'GLOBAL' : 'PRIVATE';
      
      // WebSocket çalışmadığında çok daha kısa aralıklarla polling (2-3 saniye)
      const pollingInterval = chatType === 'GLOBAL' ? 3000 : 2000;
      
      console.log(`🔄 [CHAT CONTEXT] Akıllı polling başlatıldı - ${chatType} (${pollingInterval}ms) - WebSocket çalışmıyor`);
      
      interval = setInterval(async () => {
        try {
          if (activeChatId && !isLoadingMessages && activeChat) {
            let newChatData: GlobalChatResponse | PrivateChatResponse;
            
            if (chatType === 'GLOBAL') {
              newChatData = await chatApi.getGlobalMessages(0, 20);
            } else {
              newChatData = await chatApi.getPrivateMessages(activeChatId, 0, 20);
            }
            
            // Yeni mesajları kontrol et ve ekle
            const currentMessageIds = activeChat.messages.map(m => m.id);
            const newMessages = newChatData.messages.filter(m => !currentMessageIds.includes(m.id));
            
            if (newMessages.length > 0) {
              console.log(`🆕 [CHAT CONTEXT] Akıllı polling'de ${newMessages.length} yeni mesaj bulundu`);
              newMessages.reverse().forEach(message => {
                addNewMessage(message);
              });
            }
            
            // Mevcut mesajların durumlarını da güncelle
            const currentMessages = activeChat.messages;
            const updatedMessages = newChatData.messages.map(newMsg => {
              const currentMsg = currentMessages.find(m => m.id === newMsg.id);
              if (currentMsg && currentMsg.status !== newMsg.status) {
                console.log(`🔄 [CHAT CONTEXT] Mesaj durumu güncellendi: ${currentMsg.id} ${currentMsg.status} -> ${newMsg.status}`);
                return newMsg;
              }
              return currentMsg || newMsg;
            });
            
            // Eğer durum güncellemeleri varsa aktif chat'i güncelle
            const hasStatusUpdates = updatedMessages.some((msg, index) => 
              currentMessages[index]?.status !== msg.status
            );
            
            if (hasStatusUpdates) {
              setActiveChat(prevChat => {
                if (!prevChat) return prevChat;
                return {
                  ...prevChat,
                  messages: updatedMessages
                };
              });
            }
          }
        } catch (error) {
          console.warn('⚠️ [CHAT CONTEXT] Akıllı polling hatası:', error);
        }
      }, pollingInterval);
    };

    // Aktif chat varsa ve WebSocket çalışmıyorsa polling başlat
    if (activeChatId && activeChat && !isWebSocketConnected) {
      startSmartPolling();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeChatId, isLoadingMessages, activeChat, isWebSocketConnected, isLoggedIn]);

  // Mesaj limiti countdown'u için interval
  useEffect(() => {
    if (!messageLimitInfo || messageLimitInfo.canSendMessage || messageLimitInfo.remainingSeconds <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setMessageLimitInfo(prevLimit => {
        if (!prevLimit || prevLimit.remainingSeconds <= 0) {
          return prevLimit;
        }

        const newRemainingSeconds = prevLimit.remainingSeconds - 1;
        
        if (newRemainingSeconds <= 0) {
          // Limit doldu, yeniden kontrol et
          refreshMessageLimit();
          return prevLimit;
        }

        // Countdown mesajını güncelle
        const minutes = Math.floor(newRemainingSeconds / 60);
        const seconds = newRemainingSeconds % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        return {
          ...prevLimit,
          remainingSeconds: newRemainingSeconds,
          message: `Sonraki mesaj: ${timeString}`
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [messageLimitInfo]);

  // Hata gösterimi
  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error, [
        { text: 'Tamam', onPress: () => setError(null) }
      ]);
    }
  }, [error]);

  // Cache temizleme fonksiyonu
  const clearAllCache = () => {
    console.log('🗑️ [CHAT CONTEXT] Tüm cache temizleniyor...');
    
    // Chat listesi
    setChatList([]);
    setPrivateChatList([]);
    
    // Aktif chat
    setActiveChat(null);
    setActiveChatId(null);
    
    // Mesaj limiti
    setMessageLimitInfo(null);
    
    // Typing durumu
    setIsTyping(false);
    setTypingUsers(new Map());
    
    // Hata durumu
    setError(null);
    
    // WebSocket bağlantısını tamamen kapat (reconnection'u durdur)
    if (wsClient) {
      // Bağlantı kesilmeden önce offline durumunu bildir
      try {
        wsClient.sendUserStatus(false);
        console.log('👤 [CHAT CONTEXT] User status (OFFLINE) broadcast edildi (logout)');
      } catch (error) {
        console.warn('⚠️ [CHAT CONTEXT] Offline durumu bildirilemedi:', error);
      }
      wsClient.disconnect();
      setWsClient(null);
    }
    setWsStatus(WebSocketStatus.DISCONNECTED);
    
    // WebSocket instance'ını da temizle
    wsClientRef.current = null;
    
    // Pending mesajları temizle
    setPendingMessages(new Set());
    
    console.log('✅ [CHAT CONTEXT] Cache temizlendi');
  };

  // Aktif chat'i temizle (sohbet ekranından çıkarken çağrılır)
  const clearActiveChat = () => {
    setActiveChat(null);
    setActiveChatId(null);
  };

  return (
    <ChatContext.Provider
      value={{
        chatList,
        isLoadingChatList,
        refreshChatList,
        privateChatList,
        isLoadingPrivateChats,
        refreshPrivateChats,
        activeChat,
        activeChatId,
        isLoadingMessages,
        sendGlobalMessage,
        sendPrivateMessage,
        loadMessages,
        loadMoreMessages,
        messageLimitInfo,
        refreshMessageLimit,
        addNewMessage,
        replaceMessage,
        markMessagesAsRead,
        isTyping,
        setIsTyping,
        setFastPolling,
        wsStatus,
        wsClient,
        joinChatRoom,
        leaveChatRoom,
        sendTypingIndicator,
        updateMessageStatus,
        typingUsers,
        error,
        clearError: () => setError(null),
        // Hybrid yaklaşım için yeni özellikler
        isWebSocketConnected,
        pendingMessages,
        forceRefreshMessages,
        updateMessageStatuses,
        // Cache temizleme
        clearAllCache,
        clearActiveChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// Context'i kullanmak için hook
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

// Expo Router uyumluluğu için default export
export default function ChatContextPage() {
  return null;
}
