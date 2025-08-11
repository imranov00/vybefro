
// WebSocket mesaj tipleri
export enum WebSocketMessageType {
  // Mesaj işlemleri
  SEND_MESSAGE = 'SEND_MESSAGE',
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
  JOIN_CHAT = 'JOIN_CHAT',
  LEAVE_CHAT = 'LEAVE_CHAT',
  USER_JOINED = 'USER_JOINED',
  USER_LEFT = 'USER_LEFT',
  
  // Sistem mesajları
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
  PING = 'PING',
  PONG = 'PONG',
  
  // Bildirimler
  NOTIFICATION = 'NOTIFICATION',
  MESSAGE_UPDATE = 'MESSAGE_UPDATE'
}

// WebSocket mesaj interface'i
export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: any;
  timestamp: string;
  chatRoomId?: number;
  senderId?: number;
  receiverId?: number;
}

// WebSocket event handler'ları
export interface WebSocketEventHandlers {
  onMessageReceived?: (message: WebSocketMessage) => void;
  onMessageDelivered?: (messageId: number, chatRoomId: number) => void;
  onMessageRead?: (messageId: number, chatRoomId: number) => void;
  onTypingStart?: (userId: number, chatRoomId: number, userName: string) => void;
  onTypingStop?: (userId: number, chatRoomId: number) => void;
  onUserOnline?: (userId: number) => void;
  onUserOffline?: (userId: number) => void;
  onUserJoined?: (userId: number, chatRoomId: number, userName: string) => void;
  onUserLeft?: (userId: number, chatRoomId: number, userName: string) => void;
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
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private status: WebSocketStatus = WebSocketStatus.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000; // 1 saniye
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private pongTimeout: ReturnType<typeof setTimeout> | null = null;
  private eventHandlers: WebSocketEventHandlers = {};
  private joinedChats: Set<number> = new Set();
  private typingTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private messageQueue: WebSocketMessage[] = [];
  private isProcessingQueue: boolean = false;

  constructor(token: string, baseUrl: string = 'ws://localhost:8080') {
    this.token = token;
    this.url = `${baseUrl}/ws?token=${token}`;
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

      try {
        this.status = WebSocketStatus.CONNECTING;
        console.log('🔌 [WEBSOCKET] Bağlantı kuruluyor:', this.url);

        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('✅ [WEBSOCKET] Bağlantı başarılı');
          this.status = WebSocketStatus.CONNECTED;
          this.reconnectAttempts = 0;
          this.startPingPong();
          this.processMessageQueue();
          this.eventHandlers.onConnected?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
          console.log('🔌 [WEBSOCKET] Bağlantı kapandı:', event.code, event.reason);
          this.status = WebSocketStatus.DISCONNECTED;
          this.stopPingPong();
          this.eventHandlers.onDisconnected?.();
          
          // Otomatik yeniden bağlanma
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ [WEBSOCKET] Bağlantı hatası:', error);
          this.status = WebSocketStatus.ERROR;
          this.eventHandlers.onError?.(error.toString());
          reject(error);
        };

      } catch (error) {
        console.error('❌ [WEBSOCKET] Bağlantı kurma hatası:', error);
        this.status = WebSocketStatus.ERROR;
        reject(error);
      }
    });
  }

  // WebSocket'ten çık
  public disconnect(): void {
    console.log('🔌 [WEBSOCKET] Bağlantı kapatılıyor');
    this.status = WebSocketStatus.DISCONNECTED;
    this.stopPingPong();
    this.clearTypingTimeouts();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  // Chat odasına katıl
  public joinChat(chatRoomId: number): void {
    if (this.status !== WebSocketStatus.CONNECTED) {
      console.warn('⚠️ [WEBSOCKET] Bağlantı yok, chat katılımı erteleniyor');
      this.messageQueue.push({
        type: WebSocketMessageType.JOIN_CHAT,
        data: { chatRoomId },
        timestamp: new Date().toISOString()
      });
      return;
    }

    this.sendMessage({
      type: WebSocketMessageType.JOIN_CHAT,
      data: { chatRoomId },
      timestamp: new Date().toISOString()
    });

    this.joinedChats.add(chatRoomId);
    console.log('👥 [WEBSOCKET] Chat odasına katılındı:', chatRoomId);
  }

  // Chat odasından çık
  public leaveChat(chatRoomId: number): void {
    if (this.status !== WebSocketStatus.CONNECTED) {
      return;
    }

    this.sendMessage({
      type: WebSocketMessageType.LEAVE_CHAT,
      data: { chatRoomId },
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
      this.ws?.send(JSON.stringify(message));
      console.log('📤 [WEBSOCKET] Mesaj gönderildi:', message.type);
    } catch (error) {
      console.error('❌ [WEBSOCKET] Mesaj gönderme hatası:', error);
      this.messageQueue.push(message);
    }
  }

  // Typing indicator gönder
  public sendTypingIndicator(chatRoomId: number, isTyping: boolean): void {
    const messageType = isTyping ? WebSocketMessageType.TYPING_START : WebSocketMessageType.TYPING_STOP;
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
      type: messageType,
      data: { chatRoomId },
      timestamp: new Date().toISOString()
    });
  }

  // Mesaj durumu güncelle
  public updateMessageStatus(messageId: number, chatRoomId: number, status: 'DELIVERED' | 'READ'): void {
    const messageType = status === 'DELIVERED' ? WebSocketMessageType.MESSAGE_DELIVERED : WebSocketMessageType.MESSAGE_READ;
    
    this.sendMessage({
      type: messageType,
      data: { messageId, chatRoomId },
      timestamp: new Date().toISOString()
    });
  }

  // Ping-pong mekanizması başlat
  private startPingPong(): void {
    this.pingInterval = setInterval(() => {
      if (this.status === WebSocketStatus.CONNECTED) {
        this.sendMessage({
          type: WebSocketMessageType.PING,
          data: { timestamp: Date.now() },
          timestamp: new Date().toISOString()
        });

        // Pong timeout'u kur
        this.pongTimeout = setTimeout(() => {
          console.warn('⚠️ [WEBSOCKET] Pong timeout, bağlantı yeniden kuruluyor');
          this.reconnect();
        }, 10000); // 10 saniye
      }
    }, 30000); // 30 saniyede bir ping
  }

  // Ping-pong mekanizması durdur
  private stopPingPong(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  // Typing timeout'ları temizle
  private clearTypingTimeouts(): void {
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();
  }

  // Mesaj işleme
  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      console.log('📥 [WEBSOCKET] Mesaj alındı:', message.type);

      switch (message.type) {
        case WebSocketMessageType.MESSAGE_RECEIVED:
          this.eventHandlers.onMessageReceived?.(message);
          break;

        case WebSocketMessageType.MESSAGE_DELIVERED:
          this.eventHandlers.onMessageDelivered?.(message.data.messageId, message.data.chatRoomId);
          break;

        case WebSocketMessageType.MESSAGE_READ:
          this.eventHandlers.onMessageRead?.(message.data.messageId, message.data.chatRoomId);
          break;

        case WebSocketMessageType.TYPING_START:
          this.eventHandlers.onTypingStart?.(
            message.senderId!,
            message.chatRoomId!,
            message.data.userName || 'Birisi'
          );
          break;

        case WebSocketMessageType.TYPING_STOP:
          this.eventHandlers.onTypingStop?.(message.senderId!, message.chatRoomId!);
          break;

        case WebSocketMessageType.USER_ONLINE:
          this.eventHandlers.onUserOnline?.(message.senderId!);
          break;

        case WebSocketMessageType.USER_OFFLINE:
          this.eventHandlers.onUserOffline?.(message.senderId!);
          break;

        case WebSocketMessageType.USER_JOINED:
          this.eventHandlers.onUserJoined?.(
            message.senderId!,
            message.chatRoomId!,
            message.data.userName || 'Birisi'
          );
          break;

        case WebSocketMessageType.USER_LEFT:
          this.eventHandlers.onUserLeft?.(
            message.senderId!,
            message.chatRoomId!,
            message.data.userName || 'Birisi'
          );
          break;

        case WebSocketMessageType.PONG:
          if (this.pongTimeout) {
            clearTimeout(this.pongTimeout);
            this.pongTimeout = null;
          }
          break;

        case WebSocketMessageType.NOTIFICATION:
          this.eventHandlers.onNotification?.(message.data);
          break;

        case WebSocketMessageType.ERROR:
          console.error('❌ [WEBSOCKET] Sunucu hatası:', message.data);
          this.eventHandlers.onError?.(message.data.error || 'Bilinmeyen hata');
          break;

        default:
          console.log('ℹ️ [WEBSOCKET] Bilinmeyen mesaj tipi:', message.type);
      }
    } catch (error) {
      console.error('❌ [WEBSOCKET] Mesaj işleme hatası:', error);
    }
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
          this.ws?.send(JSON.stringify(message));
          console.log('📤 [WEBSOCKET] Kuyruk mesajı gönderildi:', message.type);
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
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`🔄 [WEBSOCKET] ${delay}ms sonra yeniden bağlanma denemesi ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    setTimeout(() => {
      if (this.status === WebSocketStatus.DISCONNECTED) {
        this.reconnect();
      }
    }, delay);
  }

  // Yeniden bağlan
  private async reconnect(): Promise<void> {
    if (this.status === WebSocketStatus.CONNECTING || this.status === WebSocketStatus.CONNECTED) {
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
  public getJoinedChats(): number[] {
    return Array.from(this.joinedChats);
  }
}

// WebSocket client instance'ı (singleton)
let wsClientInstance: VybeWebSocketClient | null = null;

// WebSocket client'ı başlat
export const initializeWebSocket = async (token: string, baseUrl?: string): Promise<VybeWebSocketClient> => {
  if (wsClientInstance) {
    wsClientInstance.disconnect();
  }

  wsClientInstance = new VybeWebSocketClient(token, baseUrl);
  await wsClientInstance.connect();
  
  return wsClientInstance;
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
};
