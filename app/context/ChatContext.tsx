import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { chatApi, ChatListItem, ChatMessage, GlobalChatResponse, MessageLimitInfo, PrivateChatResponse } from '../services/api';

// Context değer tipi
type ChatContextType = {
  // Chat listesi
  chatList: ChatListItem[];
  isLoadingChatList: boolean;
  refreshChatList: () => Promise<void>;
  
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
  
  const [activeChat, setActiveChat] = useState<GlobalChatResponse | PrivateChatResponse | null>(null);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const [messageLimitInfo, setMessageLimitInfo] = useState<MessageLimitInfo | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      }
      
      setActiveChat(chatData);
      
      console.log('✅ [CHAT CONTEXT] Mesajlar yüklendi:', {
        chatRoomId,
        chatType,
        messageCount: chatData.messages.length
      });
    } catch (error: any) {
      console.error('❌ [CHAT CONTEXT] Mesajlar yüklenemedi:', error);
      setError('Mesajlar yüklenemedi');
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
      
      // Chat listesini güncelle
      await refreshChatList();
      
      console.log('✅ [CHAT CONTEXT] Özel mesaj gönderildi');
      return true;
    } catch (error: any) {
      console.error('❌ [CHAT CONTEXT] Özel mesaj gönderilemedi:', error);
      setError(error.message || 'Mesaj gönderilemedi');
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

  // Hata temizle
  const clearError = () => {
    setError(null);
  };

  // Component mount olduğunda chat listesini ve limit bilgisini yükle
  useEffect(() => {
    refreshChatList();
    refreshMessageLimit();
  }, []);

  // Real-time updates için polling (her 10 saniyede bir)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Sadece aktif chat varsa ve ekran görünürse güncelle
        if (activeChatId && !isLoadingMessages) {
          console.log('🔄 [CHAT CONTEXT] Real-time güncelleme - polling');
          
          // Chat listesini sessizce güncelle
          await refreshChatList();
          
          // Aktif chat'i güncelle (sadece yeni mesajlar varsa)
          if (activeChat) {
            const chatType = 'chatType' in activeChat ? 'GLOBAL' : 'PRIVATE';
            
            let newChatData: GlobalChatResponse | PrivateChatResponse;
            
            if (chatType === 'GLOBAL') {
              newChatData = await chatApi.getGlobalMessages(0, 20);
            } else {
              newChatData = await chatApi.getPrivateMessages(activeChatId, 0, 20);
            }
            
            // Yeni mesajlar varsa güncelle
            const currentMessageIds = activeChat.messages.map(m => m.id);
            const newMessages = newChatData.messages.filter(m => !currentMessageIds.includes(m.id));
            
            if (newMessages.length > 0) {
              console.log(`✅ [CHAT CONTEXT] ${newMessages.length} yeni mesaj bulundu`);
              
              setActiveChat(prevChat => {
                if (!prevChat) return newChatData;
                
                return {
                  ...prevChat,
                  messages: [...newMessages, ...prevChat.messages],
                  totalMessages: newChatData.totalMessages
                };
              });
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ [CHAT CONTEXT] Real-time güncelleme hatası:', error);
        // Sessizce geç, kullanıcıyı rahatsız etme
      }
    }, 10000); // 10 saniye

    return () => clearInterval(interval);
  }, [activeChatId, isLoadingMessages, activeChat]);

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
