# Loading Mekanizması - Kullanım Kılavuzu

## İlk Kurulum

Loading sistemi otomatik olarak uygulamaya entegre edilmiştir. Herhangi bir ek konfigürasyon gerekmez.

## Mevcut Implementasyonlar

### 1️⃣ **Kimlik Doğrulama (Auth)**

#### Giriş - `login.tsx` & `login-music.tsx`
```tsx
const { showLoading, hideLoading } = useLoading();

const handleLogin = async () => {
  try {
    setLoading(true);
    showLoading('Giriş yapılıyor...');
    
    const response = await authApi.login({...});
    
    hideLoading();
    // ... işleme devam et
  } catch (error) {
    hideLoading();
    // ... hata yönetimi
  }
};
```

#### Kayıt - `register.tsx` & `register-music.tsx`
```tsx
showLoading('Kayıt yapılıyor...');
// ... kayıt işlemi
hideLoading();
```

---

### 2️⃣ **Sohbet (Chat)**

#### Chat Listesi Yükleme
```tsx
// ChatContext.tsx
const refreshChatList = async () => {
  showLoading('Sohbetler yükleniyor...');
  const chatListData = await chatApi.getChatList();
  hideLoading();
};
```

#### Özel Sohbetler Yükleme
```tsx
// ChatContext.tsx
const refreshPrivateChats = async () => {
  showLoading('Özel sohbetler yükleniyor...');
  const privateChatData = await chatApi.getPrivateChatList();
  hideLoading();
};
```

#### Mesajlar Yükleme
```tsx
// ChatContext.tsx
const loadMessages = async (chatRoomId, chatType) => {
  showLoading('Mesajlar yükleniyor...');
  const chatData = await chatApi.getGlobalMessages(...);
  hideLoading();
};
```

---

### 3️⃣ **Eşleşme (Swipe)**

#### Eşleşmeler Yükleme
```tsx
// SwipeContext.tsx
const loadUserBatch = async (refresh) => {
  showLoading('Eşleşmeler yükleniyor...');
  const data = await swipeApi.getDiscoverUsers(...);
  hideLoading();
};
```

---

## Yeni Feature Ekleme

Eğer yeni bir işlemde loading göstermek istiyorsanız:

### Adım 1: Hook'u İçe Aktar
```tsx
import { useLoading } from '../context/LoadingContext';
```

### Adım 2: Hook'u Kullan
```tsx
function MyComponent() {
  const { showLoading, hideLoading } = useLoading();
  
  const handleAsyncOperation = async () => {
    showLoading('İşlem yapılıyor...');
    
    try {
      await myAsyncFunction();
      hideLoading();
    } catch (error) {
      hideLoading();
      // Hata mesajı göster
    }
  };
  
  return <TouchableOpacity onPress={handleAsyncOperation}>İşlemi Başlat</TouchableOpacity>;
}
```

### Adım 3: Özel Mesaj Ayarla
```tsx
showLoading('Profiliniz güncelleniyor...');
// veya
showLoading('Veriler senkronize ediliyor...');
```

---

## API Referansı

### `useLoading()` Hook

```tsx
const {
  isLoading,              // boolean - Loading'in görünür olup olmadığı
  loadingMessage,         // string - Gösterilen mesaj
  showLoading,            // (msg?: string) => void
  hideLoading,            // () => void
  setLoadingMessage       // (msg: string) => void
} = useLoading();
```

### Fonksiyon Detayları

#### `showLoading(message?: string)`
Loading overlay'ı gösterir.
- **message**: Gösterilecek mesaj (varsayılan: "Yükleniyor...")
- **Örnek**: `showLoading('Veriler alınıyor...')`

#### `hideLoading()`
Loading overlay'ı gizler.
- **Örnek**: `hideLoading()`

#### `setLoadingMessage(message: string)`
Mevcut loading mesajını günceller (overlay açıkken).
- **Örnek**: `setLoadingMessage('Dosya yükleniyor: 45%')`

---

## Hata Yönetimi Örnekleri

### Try-Catch ile Hata Yönetimi
```tsx
try {
  showLoading('Veri yükleniyor...');
  const data = await fetchData();
  // Başarı
  hideLoading();
} catch (error) {
  hideLoading(); // Hata durumunda da gizle!
  showAlert('Hata', 'Veri yüklenemedi');
}
```

### Finally ile Güvenli Gizleme
```tsx
try {
  showLoading('İşlem yapılıyor...');
  const result = await doSomething();
} catch (error) {
  console.error(error);
} finally {
  hideLoading(); // Her durumda gizlenir
}
```

---

## En İyi Uygulamalar

### ✅ DOĞRU

```tsx
// Her try bloğuna showLoading ekle
showLoading('İşlem yapılıyor...');
try {
  await operation();
  hideLoading();
} catch (error) {
  hideLoading(); // Hata durumunda da gizle!
}
```

### ❌ YANLISS

```tsx
// Loading göster ama gizleme unut
showLoading('İşlem yapılıyor...');
await operation();
// hideLoading() yok! → Loading kalır açık
```

---

## UI Bileşeni

### LoadingOverlay Özellikleri

- **Görünüm**: Semi-transparent modal (50% opak siyah background)
- **İçerik**: ActivityIndicator (spinner) + Metin
- **Renk**: Primary color (#6B7BFF)
- **Position**: Ekranın ortasında, tüm UI üzerine

```tsx
// app/components/LoadingOverlay.tsx
// Manuel değişiklik gerekmez, otomatik olarak çalışır
```

---

## Debugging

### Loading State'i Kontrol Et
```tsx
const { isLoading, loadingMessage } = useLoading();

useEffect(() => {
  console.log('🔄 Loading:', isLoading);
  console.log('📝 Mesaj:', loadingMessage);
}, [isLoading, loadingMessage]);
```

### Console'da Trace Et
```tsx
showLoading('İşlem başlıyor...');
console.log('📍 [OPERATION] Loading gösterildi');

// ... işlem ...

hideLoading();
console.log('📍 [OPERATION] Loading gizlendi');
```

---

## Limitasyonlar & Notlar

⚠️ **Bilmeniz Gerekenler:**

1. **Eş Zamanlı Loading**: Sadece bir loading ekranı gösterilebilir
   - Son `showLoading()` çağrısı mesajı üzerine yazar

2. **Timeout Yok**: Loading manuel gizlenmediyse açık kalır
   - Her zaman `hideLoading()` çağrıldığından emin olun

3. **Provider Gerekli**: `LoadingProvider` içinde olmak zorunlu
   - Ana layout'ta zaten ekli, alt component'lar güvenlidir

4. **Performa**: Çok sık gösterip gizleme yapmayın
   - 500ms altı işlemlerde loading göstermemeyi düşünün

---

## Gelecek Geliştirmeler

Potansiyel iyileştirmeler:

- [ ] Auto-timeout (X saniye sonra otomatik gizle)
- [ ] Progress bar (indeterminate → determinate)
- [ ] Farklı loading animasyonları
- [ ] Nested loading (loading stack)
- [ ] Müzik modu tema renkleri

---

## Sorular & Destek

Eğer loading mekanizmasıyla ilgili sorun yaşarsanız:

1. **Console'u kontrol et** - `showLoading()` ve `hideLoading()` çağrılarını ara
2. **Provider kontrol et** - `LoadingProvider`'ın `_layout.tsx`'te sarılı olduğundan emin ol
3. **Hook'un doğru kullanıldığını kontrol et** - `useLoading()` hook'u context içinde olmalı

---

**Son Güncellenme:** 13 Ocak 2026  
**Sürüm:** 1.0 (Temel Sistem)
