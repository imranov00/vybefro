# Loading Ekranı Geliştirmesi

## Yapılan Değişiklikler

### 1. **LoadingContext.tsx** (Yeni Dosya)
- Global loading state management sistemi oluşturuldu
- `showLoading()` - Loading göster (özel mesaj ile)
- `hideLoading()` - Loading gizle
- `setLoadingMessage()` - Loading mesajını güncelle

### 2. **LoadingOverlay.tsx** (Yeni Dosya)
- Loading UI component'i oluşturuldu
- Modal ile transparent overlay gösterir
- ActivityIndicator + özel mesaj gösterir
- Tüm uygulama üzerine kapanır

### 3. **_layout.tsx** (Güncellenmiş)
- `LoadingProvider` sarmalayıcısı eklendi (en üst seviye)
- `LoadingOverlay` component'i ana layout'a eklendi
- Tüm app'in her yerinden erişilebilir hale getirildi

### 4. **Login/Register Sayfaları**
Aşağıdaki dosyalar `useLoading()` hook'u ile entegre edildi:
- ✅ `login.tsx`
- ✅ `login-music.tsx`
- ✅ `register.tsx`
- ✅ `register-music.tsx`

**Loading mesajları:**
- "Giriş yapılıyor..." (login sırasında)
- "Kayıt yapılıyor..." (register sırasında)

### 5. **ChatContext.tsx** (Güncellenmiş)
- `refreshChatList()` - "Sohbetler yükleniyor..."
- `loadMessages()` - "Mesajlar yükleniyor..."
- Hata durumlarında otomatik gizleniyor

### 6. **SwipeContext.tsx** (Güncellenmiş)
- `loadUserBatch()` - "Eşleşmeler yükleniyor..."
- Batch yüklemede loading gösterilir
- Hata durumlarında otomatik gizleniyor

## Kullanım Örneği

```tsx
import { useLoading } from '../context/LoadingContext';

function MyComponent() {
  const { showLoading, hideLoading } = useLoading();
  
  const handleAction = async () => {
    showLoading('Veriler yükleniyor...');
    
    try {
      // API isteği veya uzun işlem
      await someAsyncOperation();
      hideLoading();
    } catch (error) {
      hideLoading();
      // Hata yönetimi
    }
  };
}
```

## Temel Özellikler

✅ **Basit API** - `showLoading()` ve `hideLoading()` fonksiyonları  
✅ **Global State** - Uygulama genelinde erişilebilir  
✅ **Özel Mesajlar** - Her işlem için farklı mesajlar gösterilebilir  
✅ **Otomatik Gizleme** - Hata durumlarında otomatik gizlenir  
✅ **Modal Overlay** - Transparent arka plan ile tüm UI üzerini kaplar  
✅ **TypeScript Desteği** - Type-safe hook'lar  

## İşlem Akışları

### 1. Giriş / Kayıt
```
User tıklar → showLoading() → API isteği → hideLoading() → Splash/Tab
```

### 2. Sohbet Listesi
```
useFocusEffect → refreshChatList() → showLoading() → Veriler → hideLoading()
```

### 3. Mesaj Yükleme
```
loadMessages() → showLoading() → API isteği → setActiveChat → hideLoading()
```

### 4. Eşleşme Yükleme
```
loadUserBatch() → showLoading() → Batch API → Filtre → hideLoading()
```

## Hata Yönetimi

- **Ağ hatası**: Loading otomatik gizlenir, hata mesajı gösterilir
- **Token hatası**: Loading gizlenir, kullanıcı çıkış yapması sağlanır
- **Validasyon hatası**: Loading gizlenir, alert gösterilir

## Sonraki Adımlar (İsteğe Bağlı)

1. **Progress Bar** - Indeterminate yerine % gösterimi
2. **Loading Animations** - Farklı loading stili (pulse, skeleton, etc.)
3. **Timeout** - Uzun işlemlerde otomatik iptal
4. **Analytics** - Loading sürelerini izleme
5. **Theme Desteği** - Dark/Light mode'a uyarlanabilir renk
