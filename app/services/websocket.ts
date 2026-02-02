import { Client, StompSubscription } from '@stomp/stompjs';

// WebSocket mesaj tipleri (Backend ile uyumlu)
export enum WebSocketMessageType {
  // Mesaj işlemleri
  MESSAGE_SENT = 'MESSAGE_SENT',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  MESSAGE_DELIVERED = 'MESSAGE_DELIVERED',
  MESSAGE_READ = 'MESSAGE_READ',
  
  // Typing indicator'lar
  TYPING_START = 'TYPING_START',
  TYPING_STOP = 'TYPING_STOP',
  
  // Online/offline durumu
  USER_ONLINE = 'USER_ONLINE',
  USER_OFFLINE = 'USER_OFFLINE',
  
  // Chat odası yönetimi
  CHAT_ROOM_CREATED = 'CHAT_ROOM_CREATED',
  CHAT_ROOM_DELETED = 'CHAT_ROOM_DELETED',
  USER_JOINED = 'USER_JOINED',
  USER_LEFT = 'USER_LEFT',
  
  // Sistem mesajları
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
  PING = 'PING',
  PONG = 'PONG'
}

// WebSocket mesaj interface'i (Backend DTO ile uyumlu)
export interface WebSocketMessage {
  action?: WebSocketMessageType;
  chatRoomId?: string;
  senderId?: string;
  receiverId?: string;
  content?: string;
  messageType?: string;
  timestamp?: string;
  messageId?: string;
  data?: any;
  error?: string;
  
  // Typing indicator için
  isTyping?: boolean;
  typingUserId?: string;
  
  // Online/offline durumu için
  isOnline?: boolean;
  userId?: string;
  lastSeen?: string;
  
  // Message status için
  messageStatus?: string; // SENT, DELIVERED, READ
  
  // Chat room bilgileri için
  chatRoomName?: string;
  chatRoomType?: string; // GLOBAL, PRIVATE
}

// WebSocket event handler'ları
export interface WebSocketEventHandlers {
  onMessageReceived?: (message: WebSocketMessage) => void;
  onMessageDelivered?: (messageId: string, chatRoomId: string) => void;
  onMessageRead?: (messageId: string, chatRoomId: string) => void;
  onTypingStart?: (userId: string, chatRoomId: string, userName: string) => void;
  onTypingStop?: (userId: string, chatRoomId: string) => void;
  onUserOnline?: (userId: string) => void;
  onUserOffline?: (userId: string) => void;
  onUserJoined?: (userId: string, chatRoomId: string, userName: string) => void;
  onUserLeft?: (userId: string, chatRoomId: string, userName: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: string) => void;
  onNotification?: (notification: any) => void;
}

// WebSocket bağlantı durumu
export enum WebSocketStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR'
}

// VybeWebSocketClient sınıfı
export class VybeWebSocketClient {
  private stompClient: Client | null = null;
  private url: string;
  private token: string;
  private userId: string | null = null;
  private status: WebSocketStatus = WebSocketStatus.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 2; // Sadece 2 kez dene, sonra polling'e geç
  private reconnectDelay: number = 5000; // 5 saniye (daha uzun bekle)
  private eventHandlers: WebSocketEventHandlers = {};
  private joinedChats: Set<string> = new Set();
  private typingTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private messageQueue: WebSocketMessage[] = [];
  private isProcessingQueue: boolean = false;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private shouldReconnect: boolean = true; // Reconnection kontrolü için flag
  private useQueryParameter: boolean = false; // Query parameter ile token gönderimi
  private useSockJS: boolean = false; // SockJS kullanımı (browser için)

  constructor(token: string, userId: string, baseUrl?: string, options?: { useQueryParameter?: boolean; useSockJS?: boolean }) {
    this.token = token;
    this.userId = userId;
    this.useQueryParameter = options?.useQueryParameter || false;
    this.useSockJS = options?.useSockJS || false;
    
    // Eğer baseUrl verilmemişse, API servisinden al
    if (!baseUrl) {
      // API servisinden URL'i al (circular dependency'yi önlemek için dinamik import)
      const apiModule = require('./api');
      baseUrl = apiModule.getWebSocketUrl();
    }
    
    // SockJS veya Native WebSocket endpoint'i seç
    // React Native için /ws-native (raw WebSocket), browser için /ws (SockJS)
    const endpoint = this.useSockJS ? '/ws' : '/ws-native';
    
    // Query parameter ile token ekle (React Native/proxy için önerilen)
    if (this.useQueryParameter) {
      this.url = `${baseUrl}${endpoint}?access_token=${encodeURIComponent(token)}`;
      console.log('🔗 [WEBSOCKET] Query parameter ile URL oluşturuldu:', this.url.replace(token, '***'));
    } else {
      this.url = `${baseUrl}${endpoint}`;
      console.log('🔗 [WEBSOCKET] Authorization header ile URL oluşturuldu:', this.url);
    }
  }

  // Event handler'ları ayarla
  public setEventHandlers(handlers: WebSocketEventHandlers) {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  // WebSocket'e bağlan
  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.status === WebSocketStatus.CONNECTED) {
        resolve();
        return;
      }

      // Timeout ekle (30 saniye - backend yanıt vermesi için daha uzun süre)
      const connectionTimeout = setTimeout(() => {
        if (this.status !== WebSocketStatus.CONNECTED) {
          console.warn('❌ [WEBSOCKET] Bağlantı timeout (30 saniye)');
          this.status = WebSocketStatus.ERROR;
          this.eventHandlers.onError?.('Bağlantı zaman aşımına uğradı');
          if (this.stompClient) {
            this.stompClient.deactivate();
          }
          reject(new Error('Bağlantı zaman aşımına uğradı'));
        }
      }, 30000);

      try {
        this.status = WebSocketStatus.CONNECTING;
        console.log('🔌 [WEBSOCKET] Native WebSocket bağlantısı kuruluyor:', this.url);

        // STOMP Client oluştur
        const clientConfig: any = {
          brokerURL: this.url,
          reconnectDelay: 0, // STOMP'un kendi reconnect'ini KAPAT
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
          debug: (str: string) => {
            // Sadece önemli mesajları logla
            if (str.includes('CONNECTED') || str.includes('ERROR') || str.includes('DISCONNECT')) {
              console.log('🔍 [STOMP]', str);
            }
          }
        };
        
        // Query parameter kullanılmıyorsa Authorization header ekle
        if (!this.useQueryParameter) {
          clientConfig.connectHeaders = {
            'Authorization': `Bearer ${this.token}`
          };
        }
        
        this.stompClient = new Client(clientConfig);

        // Bağlantı başarılı olduğunda
        this.stompClient.onConnect = (frame) => {
          clearTimeout(connectionTimeout);
          console.log('✅ [WEBSOCKET] STOMP bağlantısı başarılı:', frame);
          this.status = WebSocketStatus.CONNECTED;
          this.reconnectAttempts = 0;
          this.processMessageQueue();
          this.setupSubscriptions();
          this.eventHandlers.onConnected?.();
          resolve();
        };

        // Bağlantı hatası
        this.stompClient.onStompError = (frame) => {
          clearTimeout(connectionTimeout);
          console.warn('❌ [WEBSOCKET] STOMP bağlantı hatası:', frame);
          this.status = WebSocketStatus.ERROR;
          const errorMessage = frame.headers?.message || frame.body || 'Bağlantı hatası';
          this.eventHandlers.onError?.(errorMessage);
          reject(new Error(errorMessage));
        };

        // WebSocket bağlantı hatası
        this.stompClient.onWebSocketError = (event) => {
          clearTimeout(connectionTimeout);
          console.warn('❌ [WEBSOCKET] WebSocket bağlantı hatası:', event);
          this.status = WebSocketStatus.ERROR;
          this.eventHandlers.onError?.('WebSocket bağlantı hatası');
          reject(new Error('WebSocket bağlantı hatası'));
        };

        // Bağlantı kesildiğinde
        this.stompClient.onDisconnect = () => {
          clearTimeout(connectionTimeout);
          console.log('🔌 [WEBSOCKET] STOMP bağlantısı kesildi');
          this.status = WebSocketStatus.DISCONNECTED;
          this.eventHandlers.onDisconnected?.();
          // Sadece shouldReconnect true ise yeniden bağlanmaya çalış
          if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        // WebSocket bağlantısı
        this.stompClient.activate();

      } catch (error) {
        clearTimeout(connectionTimeout);
        console.warn('❌ [WEBSOCKET] Bağlantı kurma hatası:', error);
        this.status = WebSocketStatus.ERROR;
        reject(error);
      }
    });
  }

  // WebSocket'ten çık
  public disconnect(): void {
    console.log('🔌 [WEBSOCKET] STOMP bağlantısı kapatılıyor');
    
    // Reconnection'u durdur
    this.shouldReconnect = false;
    
    if (this.status === WebSocketStatus.CONNECTED && this.stompClient) {
      this.stompClient.deactivate();
    }
    
    this.status = WebSocketStatus.DISCONNECTED;
    this.clearTypingTimeouts();
    this.clearSubscriptions();
    this.stompClient = null;
  }

  // Chat odasına katıl
  public joinChat(chatRoomId: string): void {
    if (this.status !== WebSocketStatus.CONNECTED) {
      console.warn('⚠️ [WEBSOCKET] Bağlantı yok, chat katılımı erteleniyor');
      this.messageQueue.push({
        action: WebSocketMessageType.USER_JOINED,
        chatRoomId: chatRoomId,
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Backend'e join mesajı gönder
    this.sendMessage({
      action: WebSocketMessageType.USER_JOINED,
      chatRoomId: chatRoomId,
      timestamp: new Date().toISOString()
    });

    this.joinedChats.add(chatRoomId);
    console.log('👥 [WEBSOCKET] Chat odasına katılındı:', chatRoomId);
  }

  // Chat odasından çık
  public leaveChat(chatRoomId: string): void {
    if (this.status !== WebSocketStatus.CONNECTED) {
      return;
    }

    // Backend'e leave mesajı gönder
    this.sendMessage({
      action: WebSocketMessageType.USER_LEFT,
      chatRoomId: chatRoomId,
      timestamp: new Date().toISOString()
    });

    this.joinedChats.delete(chatRoomId);
    console.log('👋 [WEBSOCKET] Chat odasından çıkıldı:', chatRoomId);
  }

  // Mesaj gönder
  public sendMessage(message: WebSocketMessage): void {
    if (this.status !== WebSocketStatus.CONNECTED) {
      console.warn('⚠️ [WEBSOCKET] Bağlantı yok, mesaj kuyruğa eklendi');
      this.messageQueue.push(message);
      return;
    }

    try {
      // Backend destination'larına göre gönder
      let destination = '/app/chat/message';
      
      if (message.action === WebSocketMessageType.TYPING_START || message.action === WebSocketMessageType.TYPING_STOP) {
        destination = '/app/chat/typing';
      } else if (message.action === WebSocketMessageType.MESSAGE_READ) {
        destination = '/app/chat/message/read';
      } else if (message.action === WebSocketMessageType.USER_JOINED) {
        destination = '/app/chat/join';
      } else if (message.action === WebSocketMessageType.USER_LEFT) {
        destination = '/app/chat/leave';
      } else if (message.action === WebSocketMessageType.USER_ONLINE || message.action === WebSocketMessageType.USER_OFFLINE) {
        destination = '/app/user/status';
      } else if (message.action === WebSocketMessageType.PING) {
        destination = '/app/ping';
      }

      this.stompClient?.publish({
        destination: destination,
        body: JSON.stringify(message)
      });
      
      console.log('📤 [WEBSOCKET] Mesaj gönderildi:', message.action, 'to', destination);
    } catch (error) {
      console.error('❌ [WEBSOCKET] Mesaj gönderme hatası:', error);
      this.messageQueue.push(message);
    }
  }

  // Typing indicator gönder
  public sendTypingIndicator(chatRoomId: string, isTyping: boolean): void {
    const key = `${chatRoomId}-${this.token}`;

    // Önceki typing timeout'u temizle
    if (this.typingTimeouts.has(key)) {
      clearTimeout(this.typingTimeouts.get(key)!);
      this.typingTimeouts.delete(key);
    }

    // Typing başlatıldıysa otomatik durdurma zamanlayıcısı kur
    if (isTyping) {
      const timeout = setTimeout(() => {
        this.sendTypingIndicator(chatRoomId, false);
        this.typingTimeouts.delete(key);
      }, 5000); // 5 saniye sonra otomatik durdur

      this.typingTimeouts.set(key, timeout);
    }

    this.sendMessage({
      action: isTyping ? WebSocketMessageType.TYPING_START : WebSocketMessageType.TYPING_STOP,
      chatRoomId: chatRoomId,
      isTyping: isTyping,
      timestamp: new Date().toISOString()
    });
  }

  // Mesaj durumu güncelle
  public updateMessageStatus(messageId: string, chatRoomId: string, status: 'DELIVERED' | 'READ'): void {
    this.sendMessage({
      action: status === 'DELIVERED' ? WebSocketMessageType.MESSAGE_DELIVERED : WebSocketMessageType.MESSAGE_READ,
      messageId: messageId,
      chatRoomId: chatRoomId,
      messageStatus: status,
      timestamp: new Date().toISOString()
    });
  }
  
  // Kullanıcı online/offline durumunu bildir
  public sendUserStatus(isOnline: boolean): void {
    if (this.status !== WebSocketStatus.CONNECTED) {
      console.warn('⚠️ [WEBSOCKET] Bağlantı yok, user status gönderilemedi');
      return;
    }
    
    this.sendMessage({
      action: isOnline ? WebSocketMessageType.USER_ONLINE : WebSocketMessageType.USER_OFFLINE,
      userId: this.userId!,
      isOnline: isOnline,
      timestamp: new Date().toISOString()
    });
    
    console.log(`👤 [WEBSOCKET] User status gönderildi: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
  }
  
  // Ping gönder (sunucu ile bağlantıyı test et)
  public sendPing(): void {
    if (this.status !== WebSocketStatus.CONNECTED) {
      console.warn('⚠️ [WEBSOCKET] Bağlantı yok, ping gönderilemedi');
      return;
    }
    
    this.sendMessage({
      action: WebSocketMessageType.PING,
      timestamp: new Date().toISOString()
    });
    
    console.log('🏓 [WEBSOCKET] Ping gönderildi');
  }

  // Subscription'ları kur
  private setupSubscriptions(): void {
    if (!this.userId || !this.stompClient) {
      console.warn('⚠️ [WEBSOCKET] User ID veya STOMP client yok, subscription kurulamıyor');
      return;
    }

    try {
      // Private chat mesajları için
      const privateChatSubscription = this.stompClient.subscribe(
        `/user/${this.userId}/queue/chat/private`,
        (message) => {
          this.handleMessage(message);
        }
      );
      this.subscriptions.set('private-chat', privateChatSubscription);

      // Mesaj durumu güncellemeleri için
      const messageStatusSubscription = this.stompClient.subscribe(
        `/user/${this.userId}/queue/message/status`,
        (message) => {
          this.handleMessage(message);
        }
      );
      this.subscriptions.set('message-status', messageStatusSubscription);

      // Kullanıcı durumu güncellemeleri için
      const userStatusSubscription = this.stompClient.subscribe(
        '/topic/user/status',
        (message) => {
          this.handleMessage(message);
        }
      );
      this.subscriptions.set('user-status', userStatusSubscription);

      // Global chat için
      const globalChatSubscription = this.stompClient.subscribe(
        '/topic/chat/global',
        (message) => {
          this.handleMessage(message);
        }
      );
      this.subscriptions.set('global-chat', globalChatSubscription);

      // Aktif kullanıcı sayısı için
      const userCountSubscription = this.stompClient.subscribe(
        '/topic/chat/global/users',
        (message) => {
          this.handleMessage(message);
        }
      );
      this.subscriptions.set('user-count', userCountSubscription);
      
      // Bildirimler için
      const notificationSubscription = this.stompClient.subscribe(
        `/user/${this.userId}/queue/notifications`,
        (message) => {
          this.handleNotification(message);
        }
      );
      this.subscriptions.set('notifications', notificationSubscription);
      
      // Chat odası güncellemeleri için
      const chatRoomSubscription = this.stompClient.subscribe(
        `/user/${this.userId}/queue/chat/rooms`,
        (message) => {
          this.handleMessage(message);
        }
      );
      this.subscriptions.set('chat-rooms', chatRoomSubscription);

      console.log('📡 [WEBSOCKET] Subscription\'lar kuruldu');
    } catch (error) {
      console.error('❌ [WEBSOCKET] Subscription kurma hatası:', error);
    }
  }

  // Chat odasına typing subscription ekle
  public subscribeToChatTyping(chatRoomId: string): void {
    if (!this.stompClient || this.subscriptions.has(`${chatRoomId}-typing`)) {
      return;
    }

    try {
      const typingSubscription = this.stompClient.subscribe(
        `/topic/chat/${chatRoomId}/typing`,
        (message) => {
          this.handleMessage(message);
        }
      );
      
      this.subscriptions.set(`${chatRoomId}-typing`, typingSubscription);
      console.log('📡 [WEBSOCKET] Chat typing subscription eklendi:', chatRoomId);
    } catch (error) {
      console.error('❌ [WEBSOCKET] Typing subscription hatası:', error);
    }
  }

  // Chat odasından typing subscription kaldır
  public unsubscribeFromChatTyping(chatRoomId: string): void {
    const subscription = this.subscriptions.get(`${chatRoomId}-typing`);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(`${chatRoomId}-typing`);
      console.log('📡 [WEBSOCKET] Chat typing subscription kaldırıldı:', chatRoomId);
    }
  }

  // Tüm subscription'ları temizle
  private clearSubscriptions(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }

  // Bildirim işleme
  private handleNotification(message: any): void {
    try {
      const notification = JSON.parse(message.body);
      console.log('🔔 [WEBSOCKET] Bildirim alındı:', notification);
      this.eventHandlers.onNotification?.(notification);
    } catch (error) {
      console.error('❌ [WEBSOCKET] Bildirim işleme hatası:', error);
    }
  }
  
  // Mesaj işleme
  private handleMessage(message: any): void {
    try {
      const wsMessage: WebSocketMessage = JSON.parse(message.body);
      console.log('📥 [WEBSOCKET] Mesaj alındı:', wsMessage.action);

      switch (wsMessage.action) {
        case WebSocketMessageType.MESSAGE_SENT:
        case WebSocketMessageType.MESSAGE_RECEIVED:
          this.eventHandlers.onMessageReceived?.(wsMessage);
          break;

        case WebSocketMessageType.MESSAGE_DELIVERED:
          this.eventHandlers.onMessageDelivered?.(wsMessage.messageId!, wsMessage.chatRoomId!);
          break;

        case WebSocketMessageType.MESSAGE_READ:
          this.eventHandlers.onMessageRead?.(wsMessage.messageId!, wsMessage.chatRoomId!);
          break;

        case WebSocketMessageType.TYPING_START:
          this.eventHandlers.onTypingStart?.(
            wsMessage.typingUserId!,
            wsMessage.chatRoomId!,
            wsMessage.data?.userName || 'Birisi'
          );
          break;

        case WebSocketMessageType.TYPING_STOP:
          this.eventHandlers.onTypingStop?.(wsMessage.typingUserId!, wsMessage.chatRoomId!);
          break;

        case WebSocketMessageType.USER_ONLINE:
          this.eventHandlers.onUserOnline?.(wsMessage.userId!);
          break;

        case WebSocketMessageType.USER_OFFLINE:
          this.eventHandlers.onUserOffline?.(wsMessage.userId!);
          break;

        case WebSocketMessageType.USER_JOINED:
          this.eventHandlers.onUserJoined?.(
            wsMessage.userId!,
            wsMessage.chatRoomId!,
            wsMessage.data?.userName || 'Birisi'
          );
          break;

        case WebSocketMessageType.USER_LEFT:
          this.eventHandlers.onUserLeft?.(
            wsMessage.userId!,
            wsMessage.chatRoomId!,
            wsMessage.data?.userName || 'Birisi'
          );
          break;
          
        case WebSocketMessageType.CHAT_ROOM_CREATED:
          console.log('🏠 [WEBSOCKET] Chat odası oluşturuldu:', wsMessage.chatRoomId);
          this.eventHandlers.onNotification?.({
            type: 'CHAT_ROOM_CREATED',
            chatRoomId: wsMessage.chatRoomId,
            chatRoomName: wsMessage.chatRoomName
          });
          break;
          
        case WebSocketMessageType.CHAT_ROOM_DELETED:
          console.log('🚪 [WEBSOCKET] Chat odası silindi:', wsMessage.chatRoomId);
          this.eventHandlers.onNotification?.({
            type: 'CHAT_ROOM_DELETED',
            chatRoomId: wsMessage.chatRoomId
          });
          break;

        default:
          console.log('ℹ️ [WEBSOCKET] Bilinmeyen mesaj tipi:', wsMessage.action);
      }
    } catch (error) {
      console.error('❌ [WEBSOCKET] Mesaj işleme hatası:', error);
    }
  }

  // Typing timeout'ları temizle
  private clearTypingTimeouts(): void {
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();
  }

  // Mesaj kuyruğunu işle
  private async processMessageQueue(): Promise<void> {
    if (this.isProcessingQueue || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.messageQueue.length > 0 && this.status === WebSocketStatus.CONNECTED) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          this.sendMessage(message);
          console.log('📤 [WEBSOCKET] Kuyruk mesajı gönderildi:', message.action);
        } catch (error) {
          console.error('❌ [WEBSOCKET] Kuyruk mesajı gönderme hatası:', error);
          // Mesajı tekrar kuyruğa ekle
          this.messageQueue.unshift(message);
          break;
        }
      }
    }

    this.isProcessingQueue = false;
  }

  // Yeniden bağlanma zamanla
  private scheduleReconnect(): void {
    // Eğer reconnection durdurulduysa, çık
    if (!this.shouldReconnect) {
      console.log('🚫 [WEBSOCKET] Reconnection durduruldu, yeniden bağlanma yapılmayacak');
      return;
    }
    
    // Max deneme sayısını aştıysak dur
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('🚫 [WEBSOCKET] Maksimum yeniden bağlanma denemesi aşıldı, polling moduna geçiliyor');
      this.shouldReconnect = false;
      this.status = WebSocketStatus.DISCONNECTED;
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`🔄 [WEBSOCKET] ${delay}ms sonra yeniden bağlanma denemesi ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    setTimeout(() => {
      if (this.shouldReconnect && this.status === WebSocketStatus.DISCONNECTED) {
        this.reconnect();
      }
    }, delay);
  }

  // Yeniden bağlan
  private async reconnect(): Promise<void> {
    if (!this.shouldReconnect || this.status === WebSocketStatus.CONNECTING || this.status === WebSocketStatus.CONNECTED) {
      return;
    }

    this.status = WebSocketStatus.RECONNECTING;
    console.log('🔄 [WEBSOCKET] Yeniden bağlanma deneniyor...');

    try {
      await this.connect();
      
      // Katılılan chat odalarını tekrar katıl
      this.joinedChats.forEach(chatRoomId => {
        this.joinChat(chatRoomId);
      });
      
    } catch (error) {
      console.error('❌ [WEBSOCKET] Yeniden bağlanma başarısız:', error);
      this.status = WebSocketStatus.ERROR;
    }
  }

  // Bağlantı durumunu al
  public getStatus(): WebSocketStatus {
    return this.status;
  }

  // Katılılan chat odalarını al
  public getJoinedChats(): string[] {
    return Array.from(this.joinedChats);
  }
}

// WebSocket client instance'ı (singleton)
let wsClientInstance: VybeWebSocketClient | null = null;
let isInitializing = false; // Başlatma kilidi

// WebSocket client'ı başlat
export const initializeWebSocket = async (
  token: string, 
  userId: string, 
  baseUrl?: string, 
  options?: { useQueryParameter?: boolean; useSockJS?: boolean }
): Promise<VybeWebSocketClient> => {
  // Eğer zaten bağlı bir instance varsa, yeni bağlantı açma
  if (wsClientInstance && wsClientInstance.getStatus() === WebSocketStatus.CONNECTED) {
    console.log('✅ [WEBSOCKET] Mevcut bağlantı kullanılıyor');
    return wsClientInstance;
  }
  
  // Zaten başlatılıyorsa, bekle ama yeni bağlantı açma
  if (isInitializing) {
    console.log('⏸️ [WEBSOCKET] Bağlantı zaten başlatılıyor, bekleniyor...');
    // Max 35 saniye bekle
    let attempts = 0;
    while (attempts < 70 && isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
    
    if (wsClientInstance && wsClientInstance.getStatus() === WebSocketStatus.CONNECTED) {
      return wsClientInstance;
    }
    
    // Bağlantı başarısız - hata fırlat, yeni deneme yapma
    throw new Error('WebSocket bağlantısı kurulamadı');
  }

  // Başlatma kilidini al
  isInitializing = true;

  try {
    // Eski instance varsa kapat
    if (wsClientInstance) {
      console.log('🔌 [WEBSOCKET] Eski bağlantı kapatılıyor...');
      wsClientInstance.disconnect();
      wsClientInstance = null;
    }

    wsClientInstance = new VybeWebSocketClient(token, userId, baseUrl, options);
    await wsClientInstance.connect();
    
    return wsClientInstance;
  } finally {
    isInitializing = false;
  }
};

// WebSocket client'ı al
export const getWebSocketClient = (): VybeWebSocketClient | null => {
  return wsClientInstance;
};

// WebSocket client'ı kapat
export const closeWebSocket = (): void => {
  if (wsClientInstance) {
    wsClientInstance.disconnect();
    wsClientInstance = null;
  }
  console.log('🔌 [WEBSOCKET] WebSocket instance tamamen kapatıldı');
};

// Default export
export default {
  initializeWebSocket,
  VybeWebSocketClient,
  WebSocketStatus,
  WebSocketMessageType
};
