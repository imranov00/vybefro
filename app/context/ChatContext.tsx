import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { chatApi, ChatListItem, ChatMessage, GlobalChatResponse, MessageLimitInfo, PrivateChatResponse, PrivateChatRoom } from '../services/api';
import {
    initializeWebSocket,
    VybeWebSocketClient,
    WebSocketMessage,
    WebSocketMessageType,
    WebSocketStatus
} from '../services/websocket';
import { getToken } from '../utils/tokenStorage';

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
  joinChatRoom: (chatRoomId: number) => void;
  leaveChatRoom: (chatRoomId: number) => void;
  sendTypingIndicator: (chatRoomId: number, isTyping: boolean) => void;
  updateMessageStatus: (messageId: number, chatRoomId: number, status: 'DELIVERED' | 'READ') => void;
  
  // Typing indicator'lar
  typingUsers: Map<number, Set<number>>; // chatRoomId -> Set<userId>
  
  // Hata yönetimi
  error: string | null;
  clearError: () => void;
};

// Context oluştur
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Context Provider bileşeni
export function ChatProvider({ children }: { children: ReactNode }) {
  // State'ler
  const [chatList, setChatList] = useState<ChatListItem[]>([]);
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
  const [typingUsers, setTypingUsers] = useState<Map<number, Set<number>>>(new Map());
  
  // Ref'ler
  const wsClientRef = useRef<VybeWebSocketClient | null>(null);
  const typingUsersRef = useRef<Map<number, Set<number>>>(new Map());

  // Chat listesini yükle
  const refreshChatList = async () => {
    try {
      setIsLoadingChatList(true);
      setError(null);
      
      const chatListData = await chatApi.getChatList();
      setChatList(chatListData);
      
      console.log('✅ [CHAT CONTEXT] Chat listesi yüklendi:', chatListData.length);
    } catch (error: any) {
      console.error('❌ [CHAT CONTEXT] Chat listesi yüklenemedi:', error);
      setError('Chat listesi yüklenemedi');
    } finally {
      setIsLoadingChatList(false);
    }
  };

  // Private chat listesini yenile
  const refreshPrivateChats = async () => {
    try {
      setIsLoadingPrivateChats(true);
      console.log('🔄 [CHAT CONTEXT] Private chat listesi yenileniyor...');
      
      const privateChatData = await chatApi.getPrivateChatList();
      setPrivateChatList(privateChatData.privateChatRooms);
      
      console.log('✅ [CHAT CONTEXT] Private chat listesi yüklendi:', privateChatData.privateChatRooms.length);
    } catch (error: any) {
      console.error('❌ [CHAT CONTEXT] Private chat listesi yüklenemedi:', error);
      
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
        
        // Private chat için otherUser kontrolü
        if (!('chatType' in chatData) && (!chatData.otherUser || !chatData.otherUser.id)) {
          console.error('❌ [CHAT CONTEXT] Private chat otherUser eksik:', {
            hasOtherUser: !!chatData.otherUser,
            otherUserId: chatData.otherUser?.id,
            chatData: chatData
          });
          
          // Chat listesinden otherUser bilgisini almaya çalış
          console.log('🔄 [CHAT CONTEXT] Chat listesinden otherUser almaya çalışılıyor...');
          try {
            await refreshPrivateChats();
            const chatRoom = privateChatList.find(chat => chat.id === chatRoomId);
            
            if (chatRoom && chatRoom.otherUser) {
              console.log('✅ [CHAT CONTEXT] Chat listesinden otherUser bulundu:', chatRoom.otherUser);
              chatData.otherUser = chatRoom.otherUser;
            } else {
              console.error('❌ [CHAT CONTEXT] Chat listesinde de otherUser bulunamadı');
              throw new Error('Sohbet bilgileri eksik. Lütfen tekrar deneyin.');
            }
          } catch (fallbackError) {
            console.error('❌ [CHAT CONTEXT] Fallback otherUser alma hatası:', fallbackError);
            throw new Error('Sohbet bilgileri eksik. Lütfen tekrar deneyin.');
          }
        }
      }
      
      setActiveChat(chatData);
      
      console.log('✅ [CHAT CONTEXT] Mesajlar yüklendi:', {
        chatRoomId,
        chatType,
        messageCount: chatData.messages.length
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

  // Genel chat'e mesaj gönder
  const sendGlobalMessage = async (content: string): Promise<boolean> => {
    console.log('🔄 [CHAT CONTEXT] sendGlobalMessage başlatıldı:', {
      content: content.substring(0, 50),
      activeChat: activeChat ? 'var' : 'yok',
      chatType: activeChat && 'chatType' in activeChat ? activeChat.chatType : 'bilinmiyor'
    });
    
    try {
      setError(null);
      
      const response = await chatApi.sendGlobalMessage({ content });
      console.log('✅ [CHAT CONTEXT] API yanıtı alındı:', response.message.id);
      
      // Yeni mesajı aktif chat'e ekle
      if (activeChat && 'chatType' in activeChat && activeChat.chatType === 'GLOBAL') {
        console.log('✅ [CHAT CONTEXT] Mesaj aktif chat\'e ekleniyor');
        addNewMessage(response.message);
      } else {
        console.warn('⚠️ [CHAT CONTEXT] Aktif chat global değil veya yok:', {
          hasActiveChat: !!activeChat,
          hasChatType: activeChat && 'chatType' in activeChat,
          chatType: activeChat && 'chatType' in activeChat ? activeChat.chatType : null
        });
      }
      
      // Chat listesini güncelle (sadece mesaj eklenmediğinde)
      if (!activeChat || !('chatType' in activeChat) || activeChat.chatType !== 'GLOBAL') {
        await refreshChatList();
      }
      
      console.log('✅ [CHAT CONTEXT] Genel mesaj gönderildi');
      
      // Mesaj gönderildikten sonra 10 saniye boyunca çok hızlı polling (500ms)
      const originalFastPolling = fastPolling;
      setFastPolling(true);
      
      // 500ms'lik süper hızlı polling için geçici interval
      const superFastInterval = setInterval(async () => {
        try {
          if (activeChat && 'chatType' in activeChat && activeChat.chatType === 'GLOBAL') {
            const newChatData = await chatApi.getGlobalMessages(0, 5);
            const currentMessageIds = activeChat.messages.map(m => m.id);
            const newMessages = newChatData.messages.filter(m => !currentMessageIds.includes(m.id));
            
            if (newMessages.length > 0) {
              console.log(`⚡ [CHAT CONTEXT] Süper hızlı polling - ${newMessages.length} yeni mesaj`);
              newMessages.reverse().forEach(message => {
                addNewMessage(message);
              });
            }
          }
        } catch (error) {
          console.warn('⚠️ [CHAT CONTEXT] Süper hızlı polling hatası:', error);
        }
      }, 500);
      
      // 10 saniye sonra normal polling'e dön
      setTimeout(() => {
        clearInterval(superFastInterval);
        setFastPolling(originalFastPolling);
        console.log('⏸️ [CHAT CONTEXT] Süper hızlı polling durduruldu');
      }, 10000);
      
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

  // Özel mesaj gönder
  const sendPrivateMessage = async (content: string, receiverId: number): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await chatApi.sendPrivateMessage({ content, receiverId });
      
      // Yeni mesajı aktif chat'e ekle
      if (activeChat && !('chatType' in activeChat)) {
        addNewMessage(response.message);
      }
      
      // Özel chat listesini güncelle
      await refreshPrivateChats();
      
      console.log('✅ [CHAT CONTEXT] Özel mesaj gönderildi');
      return true;
    } catch (error: any) {
      console.error('❌ [CHAT CONTEXT] Özel mesaj gönderilemedi:', error);
      
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
    try {
      const limitInfo = await chatApi.getMessageLimitInfo();
      setMessageLimitInfo(limitInfo);
      
      console.log('✅ [CHAT CONTEXT] Mesaj limiti güncellendi:', {
        canSendMessage: limitInfo.canSendMessage,
        remainingSeconds: limitInfo.remainingSeconds
      });
    } catch (error: any) {
      console.error('❌ [CHAT CONTEXT] Mesaj limiti güncellenemedi:', error);
    }
  };

  // Yeni mesaj ekle (real-time için)
  const addNewMessage = (message: ChatMessage) => {
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
  const joinChatRoom = (chatRoomId: number) => {
    if (wsClientRef.current) {
      wsClientRef.current.joinChat(chatRoomId);
      console.log('👥 [CHAT CONTEXT] Chat odasına katılındı:', chatRoomId);
    }
  };

  const leaveChatRoom = (chatRoomId: number) => {
    if (wsClientRef.current) {
      wsClientRef.current.leaveChat(chatRoomId);
      console.log('👋 [CHAT CONTEXT] Chat odasından çıkıldı:', chatRoomId);
    }
  };

  const sendTypingIndicator = (chatRoomId: number, isTyping: boolean) => {
    if (wsClientRef.current) {
      wsClientRef.current.sendTypingIndicator(chatRoomId, isTyping);
    }
  };

  const updateMessageStatus = (messageId: number, chatRoomId: number, status: 'DELIVERED' | 'READ') => {
    if (wsClientRef.current) {
      wsClientRef.current.updateMessageStatus(messageId, chatRoomId, status);
    }
  };

  // WebSocket event handler'ları
  const setupWebSocketHandlers = (client: VybeWebSocketClient) => {
    client.setEventHandlers({
      onMessageReceived: (message: WebSocketMessage) => {
        console.log('📥 [CHAT CONTEXT] WebSocket mesaj alındı:', message.type);
        
        if (message.type === WebSocketMessageType.MESSAGE_RECEIVED && message.data) {
          const chatMessage = message.data as ChatMessage;
          addNewMessage(chatMessage);
        }
      },
      
      onMessageDelivered: (messageId: number, chatRoomId: number) => {
        console.log('✅ [CHAT CONTEXT] Mesaj iletildi:', messageId, chatRoomId);
        // Mesaj durumunu güncelle
        setActiveChat(prevChat => {
          if (!prevChat) return prevChat;
          
          return {
            ...prevChat,
            messages: prevChat.messages.map(msg => 
              msg.id === messageId ? { ...msg, status: 'DELIVERED' as const } : msg
            )
          };
        });
      },
      
      onMessageRead: (messageId: number, chatRoomId: number) => {
        console.log('👁️ [CHAT CONTEXT] Mesaj okundu:', messageId, chatRoomId);
        // Mesaj durumunu güncelle
        setActiveChat(prevChat => {
          if (!prevChat) return prevChat;
          
          return {
            ...prevChat,
            messages: prevChat.messages.map(msg => 
              msg.id === messageId ? { ...msg, status: 'READ' as const } : msg
            )
          };
        });
      },
      
      onTypingStart: (userId: number, chatRoomId: number, userName: string) => {
        console.log('⌨️ [CHAT CONTEXT] Yazıyor:', userName, chatRoomId);
        
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          const chatUsers = new Set(newMap.get(chatRoomId) || []);
          chatUsers.add(userId);
          newMap.set(chatRoomId, chatUsers);
          return newMap;
        });
      },
      
      onTypingStop: (userId: number, chatRoomId: number) => {
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
      
      onUserOnline: (userId: number) => {
        console.log('🟢 [CHAT CONTEXT] Kullanıcı online:', userId);
        // Private chat listesinde kullanıcıyı online yap
        setPrivateChatList(prev => 
          prev.map(chat => 
            chat.otherUser.id === userId 
              ? { ...chat, otherUser: { ...chat.otherUser, isOnline: true } }
              : chat
          )
        );
      },
      
      onUserOffline: (userId: number) => {
        console.log('🔴 [CHAT CONTEXT] Kullanıcı offline:', userId);
        // Private chat listesinde kullanıcıyı offline yap
        setPrivateChatList(prev => 
          prev.map(chat => 
            chat.otherUser.id === userId 
              ? { ...chat, otherUser: { ...chat.otherUser, isOnline: false } }
              : chat
          )
        );
      },
      
      onConnected: () => {
        console.log('✅ [CHAT CONTEXT] WebSocket bağlandı');
        setWsStatus(WebSocketStatus.CONNECTED);
      },
      
      onDisconnected: () => {
        console.log('🔌 [CHAT CONTEXT] WebSocket bağlantısı kesildi');
        setWsStatus(WebSocketStatus.DISCONNECTED);
      },
      
      onError: (error: string) => {
        console.error('❌ [CHAT CONTEXT] WebSocket hatası:', error);
        setWsStatus(WebSocketStatus.ERROR);
        setError(`WebSocket hatası: ${error}`);
      }
    });
  };

  // WebSocket başlatma
  const initializeWebSocketConnection = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.warn('⚠️ [CHAT CONTEXT] Token bulunamadı, WebSocket başlatılamıyor');
        return;
      }

      console.log('🔌 [CHAT CONTEXT] WebSocket bağlantısı başlatılıyor...');
      setWsStatus(WebSocketStatus.CONNECTING);
      
      const client = await initializeWebSocket(token, 'ws://localhost:8080');
      wsClientRef.current = client;
      setWsClient(client);
      
      setupWebSocketHandlers(client);
      
      console.log('✅ [CHAT CONTEXT] WebSocket bağlantısı başarılı');
    } catch (error) {
      console.error('❌ [CHAT CONTEXT] WebSocket başlatma hatası:', error);
      setWsStatus(WebSocketStatus.ERROR);
      setError('WebSocket bağlantısı kurulamadı');
    }
  };

  // Component mount olduğunda chat listesini ve limit bilgisini yükle
  useEffect(() => {
    refreshChatList();
    refreshPrivateChats();
    refreshMessageLimit();
    initializeWebSocketConnection();
  }, []);

  // Component unmount olduğunda WebSocket'i kapat
  useEffect(() => {
    return () => {
      if (wsClientRef.current) {
        wsClientRef.current.disconnect();
      }
    };
  }, []);

  // Real-time updates için hızlı polling (genel chat için 2 saniye, özel chat için 5 saniye)
  useEffect(() => {
    let interval: any;
    
    const startPolling = () => {
      // Aktif chat'e göre polling süresi belirle
      const chatType = activeChat && 'chatType' in activeChat ? 'GLOBAL' : 'PRIVATE';
      let pollingInterval;
      
      if (chatType === 'GLOBAL') {
        // Genel chat için: hızlı modda 3 saniye, normal modda 10 saniye
        pollingInterval = fastPolling ? 3000 : 10000;
      } else {
        // Özel chat için: hızlı modda 5 saniye, normal modda 15 saniye
        pollingInterval = fastPolling ? 5000 : 15000;
      }
      
      interval = setInterval(async () => {
        try {
          // Sadece aktif chat varsa ve ekran görünürse güncelle
          if (activeChatId && !isLoadingMessages && activeChat) {
            console.log(`🔄 [CHAT CONTEXT] Real-time güncelleme - ${chatType} (${pollingInterval}ms)`);
            
            let newChatData: GlobalChatResponse | PrivateChatResponse;
            
            if (chatType === 'GLOBAL') {
              newChatData = await chatApi.getGlobalMessages(0, 20);
              
              // Global chat için aktif kullanıcı sayısını da güncelle
              setActiveChat(prevChat => {
                if (!prevChat || !('activeUserCount' in prevChat)) return prevChat;
                return {
                  ...prevChat,
                  activeUserCount: (newChatData as GlobalChatResponse).activeUserCount
                };
              });
            } else {
              newChatData = await chatApi.getPrivateMessages(activeChatId, 0, 20);
            }
            
            // Yeni mesajlar varsa güncelle
            const currentMessageIds = activeChat.messages.map(m => m.id);
            const newMessages = newChatData.messages.filter(m => !currentMessageIds.includes(m.id));
            
            if (newMessages.length > 0) {
              console.log(`🆕 [CHAT CONTEXT] ${newMessages.length} yeni mesaj bulundu (${chatType})`);
              
              // Yeni mesajları tek tek ekle (duplicate kontrolü ile)
              newMessages.reverse().forEach(message => {
                addNewMessage(message);
              });
              
              // Chat listesini sadece yeni mesaj geldiğinde güncelle (daha az sıklıkta)
              if (chatType === 'GLOBAL') {
                // Global chat için sadece yeni mesaj geldiğinde güncelle
                setTimeout(() => refreshChatList(), 1000);
              } else {
                // Özel chat için private chat listesini güncelle
                setTimeout(() => refreshPrivateChats(), 1000);
              }
            }
          }
        } catch (error) {
          console.warn('⚠️ [CHAT CONTEXT] Real-time güncelleme hatası:', error);
          // Sessizce geç, kullanıcıyı rahatsız etme
        }
      }, pollingInterval);
    };

    // Aktif chat varsa polling başlat
    if (activeChatId && activeChat) {
      startPolling();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeChatId, isLoadingMessages, activeChat, fastPolling]);

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
        { text: 'Tamam', onPress: clearError }
      ]);
    }
  }, [error]);

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
        clearError
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
