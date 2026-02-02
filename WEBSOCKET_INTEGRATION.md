# 🚀 WebSocket Entegrasyonu - Vybe Frontend

## 📋 Genel Bakış
Backend'deki WebSocket entegrasyonu ile tam uyumlu, gerçek zamanlı mesajlaşma sistemi. React Native için optimize edilmiş.

## 🔧 Teknik Detaylar

### Kullanılan Teknolojiler
- **@stomp/stompjs** - STOMP protokolü client
- **React Context API** - State yönetimi
- **React Native WebSocket** - Native WebSocket desteği

### WebSocket Endpoints
- **Production**: `wss://pal-advertising-misc-hrs.trycloudflare.com/ws-native`
- **Development**: `ws://localhost:8080/ws-native`

## 🔐 Authentication

### Query Parameter Yöntemi (React Native - Önerilen)
```typescript
const client = await initializeWebSocket(token, userId, undefined, { 
  useQueryParameter: true,  // Token query parametresinde
  useSockJS: false         // Native WebSocket kullan
});
```

**Neden Query Parameter?**
- Cloudflare ve reverse proxy'ler bazen `Authorization` header'ını siler
- React Native'de daha güvenilir
- Backend'de hem `access_token` hem de `token` parametresi desteklenir

### Authorization Header Yöntemi (Browser)
```typescript
const client = await initializeWebSocket(token, userId, undefined, { 
  useQueryParameter: false, // Header'da Authorization
  useSockJS: true          // Browser için SockJS fallback
});
```

## 📡 WebSocket Message Types

Backend'den gelen mesaj formatı:
```typescript
interface WebSocketMessage {
  action: WebSocketMessageType;
  chatRoomId?: string;
  senderId?: string;
  content?: string;
  messageType?: string;
  timestamp: string;
  messageId?: string;
  chatRoomType?: 'GLOBAL' | 'PRIVATE';
  
  // Typing indicator
  isTyping?: boolean;
  typingUserId?: string;
  
  // User status
  isOnline?: boolean;
  userId?: string;
  
  // Message status
  messageStatus?: 'SENT' | 'DELIVERED' | 'READ';
}
```

### Desteklenen Action Tipleri
- **MESSAGE_SENT** - Backend'den gelen yeni mesaj
- **MESSAGE_RECEIVED** - Client tarafından alınan mesaj
- **MESSAGE_DELIVERED** - Mesaj karşı tarafa iletildi
- **MESSAGE_READ** - Mesaj okundu
- **TYPING_START** - Kullanıcı yazmaya başladı
- **TYPING_STOP** - Kullanıcı yazmayı durdurdu
- **USER_ONLINE** - Kullanıcı çevrimiçi oldu
- **USER_OFFLINE** - Kullanıcı çevrimdışı oldu
- **USER_JOINED** - Chat odasına katıldı
- **USER_LEFT** - Chat odasından ayrıldı
- **CHAT_ROOM_CREATED** - Yeni chat odası oluşturuldu
- **CHAT_ROOM_DELETED** - Chat odası silindi
- **PING/PONG** - Bağlantı testi

## 🎯 WebSocket Topics (Backend Subscriptions)

### Global Topics
```typescript
'/topic/chat/global'           // Global chat mesajları
'/topic/chat/global/users'     // Aktif kullanıcı sayısı
'/topic/user/status'           // Online/offline durumları
```

### User-Specific Topics (Queue)
```typescript
`/user/${userId}/queue/chat/private`      // Özel mesajlar
`/user/${userId}/queue/notifications`     // Bildirimler
`/user/${userId}/queue/chat/rooms`        // Chat odası güncellemeleri
`/user/${userId}/queue/message/status`    // Mesaj durumu güncellemeleri
```

### Chat Room Topics
```typescript
`/topic/chat/${chatRoomId}/typing`        // Typing indicator'lar
```

## 🔌 Frontend Kullanımı

### 1. ChatContext ile Otomatik Yönetim (Önerilen)
ChatContext otomatik olarak WebSocket bağlantısını yönetir:

```tsx
import { useChatContext } from '@/app/context/ChatContext';

function ChatScreen() {
  const { 
    wsStatus,           // WebSocket durumu
    wsClient,           // WebSocket client instance
    typingUsers,        // Typing kullanıcılar
    sendGlobalMessage,  // Mesaj gönder
    sendTypingIndicator // Typing indicator gönder
  } = useChatContext();
  
  // Mesaj gönder
  const handleSend = async (text: string) => {
    await sendGlobalMessage(text);
  };
  
  // Typing indicator
  const handleTextChange = (text: string) => {
    if (activeChatId) {
      sendTypingIndicator(activeChatId.toString(), text.length > 0);
    }
  };
  
  return (
    <View>
      {wsStatus === 'CONNECTED' && <Text>🟢 Bağlı</Text>}
      {/* Chat UI */}
    </View>
  );
}
```

### 2. Manuel WebSocket Client Kullanımı
```typescript
import { initializeWebSocket, VybeWebSocketClient } from '@/app/services/websocket';

const setupWebSocket = async () => {
  const token = await getToken();
  const userId = '123';
  
  // React Native için önerilen konfigürasyon
  const client = await initializeWebSocket(token, userId, undefined, {
    useQueryParameter: true,
    useSockJS: false
  });
  
  // Event handler'ları ayarla
  client.setEventHandlers({
    onMessageReceived: (message) => {
      console.log('Yeni mesaj:', message);
    },
    onTypingStart: (userId, chatRoomId, userName) => {
      console.log(`${userName} yazıyor...`);
    },
    onTypingStop: (userId, chatRoomId) => {
      console.log('Yazmayı durdurdu');
    },
    onUserOnline: (userId) => {
      console.log(`User ${userId} online`);
    },
    onUserOffline: (userId) => {
      console.log(`User ${userId} offline`);
    }
  });
  
  // Chat odasına katıl
  client.joinChat('1');
  
  // Online durumunu bildir
  client.sendUserStatus(true);
  
  return client;
};
```

### 3. Typing Indicator Kullanımı
```typescript
const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

const handleInputChange = (text: string) => {
  setMessageText(text);
  
  // Typing başlat
  if (text.length > 0) {
    wsClient?.sendTypingIndicator(chatRoomId, true);
    
    // 3 saniye sonra otomatik durdur
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      wsClient?.sendTypingIndicator(chatRoomId, false);
    }, 3000);
    setTypingTimeout(timeout);
  } else {
    // Text boşsa hemen durdur
    wsClient?.sendTypingIndicator(chatRoomId, false);
  }
};
```

### 4. Message Read Receipt
```typescript
// Mesaj görüntülendiğinde okundu bilgisi gönder
useEffect(() => {
  if (message.status !== 'READ' && isVisible) {
    wsClient?.updateMessageStatus(
      message.id.toString(), 
      chatRoomId.toString(), 
      'READ'
    );
  }
}, [isVisible, message]);
```

### 5. Ping/Pong (Bağlantı Testi)
```typescript
// Her 30 saniyede bir ping gönder
useEffect(() => {
  const pingInterval = setInterval(() => {
    if (wsClient?.getStatus() === WebSocketStatus.CONNECTED) {
      wsClient.sendPing();
    }
  }, 30000);
  
  return () => clearInterval(pingInterval);
}, [wsClient]);
```

## 🎨 UI Entegrasyonu

### Typing Indicator Component
```tsx
function TypingIndicator({ chatRoomId }: { chatRoomId: string }) {
  const { typingUsers } = useChatContext();
  
  const typingInThisRoom = typingUsers.get(chatRoomId);
  
  if (!typingInThisRoom || typingInThisRoom.size === 0) {
    return null;
  }
  
  return (
    <View style={styles.typingContainer}>
      <Text style={styles.typingText}>
        {typingInThisRoom.size} kişi yazıyor...
      </Text>
      <TypingAnimation />
    </View>
  );
}
```

### Online Status Badge
```tsx
function OnlineStatusBadge({ userId }: { userId: string }) {
  const [isOnline, setIsOnline] = useState(false);
  const { wsClient } = useChatContext();
  
  useEffect(() => {
    if (wsClient) {
      wsClient.setEventHandlers({
        onUserOnline: (id) => {
          if (id === userId) setIsOnline(true);
        },
        onUserOffline: (id) => {
          if (id === userId) setIsOnline(false);
        }
      });
    }
  }, [wsClient, userId]);
  
  return (
    <View style={[styles.badge, { backgroundColor: isOnline ? 'green' : 'gray' }]} />
  );
}
```

### Message Status Icons
```tsx
function MessageStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'SENT':
      return <Icon name="check" color="gray" />;
    case 'DELIVERED':
      return <Icon name="check-double" color="gray" />;
    case 'READ':
      return <Icon name="check-double" color="blue" />;
    default:
      return <Icon name="clock" color="gray" />;
  }
}
```

## 🔒 Güvenlik

### Token Yönetimi
- Token'lar `AsyncStorage`'da güvenli şekilde saklanır
- Token yenilenme otomatik olarak yapılır
- WebSocket bağlantısı token yenilendiğinde otomatik güncellenir

### Reconnection Logic
- Otomatik yeniden bağlanma (exponential backoff)
- Maksimum 5 deneme
- Bağlantı kesildiğinde polling moduna geçiş

## 📊 Performans

### Optimizasyonlar
- Message queue (bağlantı olmadan mesaj gönderme)
- Typing debounce (gereksiz mesaj gönderimini engeller)
- Subscription yönetimi (gereksiz topic'leri kaldırma)
- Hybrid yaklaşım (WebSocket + Polling fallback)

### Monitoring
```typescript
// WebSocket durumunu izle
useEffect(() => {
  console.log('WebSocket Status:', wsStatus);
}, [wsStatus]);

// Bağlantı süresini izle
const [connectionDuration, setConnectionDuration] = useState(0);
useEffect(() => {
  if (wsStatus === WebSocketStatus.CONNECTED) {
    const start = Date.now();
    const interval = setInterval(() => {
      setConnectionDuration(Date.now() - start);
    }, 1000);
    return () => clearInterval(interval);
  }
}, [wsStatus]);
```

## 🚀 Yeni Özellikler

### ✅ Gerçek Zamanlı Mesajlaşma
- Anlık mesaj gönderme/alma
- Mesaj durumu tracking (SENT → DELIVERED → READ)
- Typing indicator'lar
- Message queue (offline mesaj gönderme)

### ✅ Online/Offline Durumu
- Kullanıcı online/offline broadcast
- Otomatik status güncelleme (connect/disconnect)
- Son aktif zaman tracking

### ✅ Chat Odası Yönetimi
- Otomatik chat odası subscription
- Chat odasına katılma/ayrılma
- Chat odası güncelleme bildirimleri

### ✅ Bildirimler
- Yeni mesaj bildirimleri
- Chat odası güncellemeleri
- Kullanıcı durumu değişiklikleri
- Custom notification handler

## 🔧 Konfigürasyon

### ChatContext Otomatik Ayarlar
```typescript
// React Native için otomatik konfigürasyon
{
  useQueryParameter: true,  // Cloudflare/proxy için
  useSockJS: false         // Native WebSocket
}
```

### Reconnection Ayarları
```typescript
// VybeWebSocketClient
maxReconnectAttempts: 5
reconnectDelay: 1000ms (exponential backoff)
heartbeatIncoming: 10000ms
heartbeatOutgoing: 10000ms
```

## 🐛 Debugging

### Console Logs
```typescript
🔗 [WEBSOCKET] Native WebSocket URL oluşturuldu
🔌 [WEBSOCKET] STOMP bağlantısı kuruluyor
✅ [WEBSOCKET] STOMP bağlantısı başarılı
📡 [WEBSOCKET] Subscription'lar kuruldu
📤 [WEBSOCKET] Mesaj gönderildi
📥 [WEBSOCKET] Mesaj alındı
👤 [WEBSOCKET] User status (ONLINE) broadcast edildi
🔄 [WEBSOCKET] Yeniden bağlanma deneniyor
❌ [WEBSOCKET] Bağlantı hatası
```

### Hata Yönetimi
```typescript
try {
  await client.connect();
} catch (error) {
  console.error('WebSocket bağlantı hatası:', error);
  // Fallback: Polling moduna geç
  startPolling();
}
```

## 📱 Canlı Örnekler

### Global Chat Ekranı
`app/chat/global.tsx` - WebSocket ile tam entegre global chat
- Gerçek zamanlı mesajlaşma
- Typing indicator
- Online kullanıcı sayısı
- Mesaj durumu tracking

### Private Chat Ekranı
`app/chat/[chatId].tsx` - 1-1 mesajlaşma
- Özel mesajlar
- Okundu bilgisi
- Online durumu
- Typing indicator

## 🎯 Sonraki Adımlar

### Planlanan Özellikler
- Voice messages - Sesli mesaj desteği
- File sharing - Dosya paylaşımı
- Message reactions - Tepki ekleme
- Message threading - Mesaj zincirleme
- Push notifications - Arka planda bildirim

### Optimizasyonlar
- Message compression - Mesaj sıkıştırma
- Image optimization - Görsel optimizasyonu
- Lazy loading - Mesaj lazy loading
- Virtual scrolling - Performans iyileştirme

## 🎉 Sonuç

WebSocket entegrasyonu tamamen backend ile uyumlu ve production-ready! Gerçek zamanlı mesajlaşma, typing indicator'lar, online/offline durumu ve daha fazlası artık çalışıyor. 💬✨

### Backend Uyumluluğu
✅ Query parameter authentication  
✅ /ws-native endpoint (React Native)  
✅ /ws endpoint (Browser SockJS)  
✅ Tüm mesaj tipleri destekleniyor  
✅ Tüm topic'ler subscribe ediliyor  
✅ Otomatik user status broadcast  
✅ Ping/pong mekanizması  
✅ Bildirim sistemi  

### React Native Optimizasyonları
✅ Query parameter ile token (proxy uyumlu)  
✅ Native WebSocket desteği  
✅ Otomatik reconnection  
✅ Hybrid yaklaşım (WebSocket + Polling)  
✅ Offline mesaj queue  
✅ Memory leak prevention  
