# 🚀 Yeni Backend Swipe Sistemi

## 📋 Genel Bakış

Bu dokümantasyon, yeni backend swipe sisteminin nasıl çalıştığını ve frontend'de nasıl kullanılacağını açıklar. Sistem Tinder benzeri profesyonel bir swipe deneyimi sunar.

## 🔄 API Endpoint'leri

### 1. Ana Discover Endpoint
```
GET /api/swipes/discover?refresh={boolean}&showLikedMe={boolean}&page={number}&limit={number}
```

**Parametreler:**
- `refresh`: Yenileme modu (true/false)
- `showLikedMe`: Premium özellik - Beni beğenenleri göster (true/false)
- `page`: Sayfa numarası (varsayılan: 1)
- `limit`: Sayfa başına kullanıcı sayısı (varsayılan: 10)

### 2. Swipe İşlemi
```
POST /api/swipes
```

**Request Body:**
```json
{
  "action": "LIKE" | "DISLIKE",
  "toUserId": 123
}
```

**Not:** Backend'de `toUserId` alanı beklenir, `userId` değil.

## 🎯 Kullanım Senaryoları

### Normal Kullanıcı Akışı

#### İlk Giriş
```typescript
// Hiç swipe yapmadığı kullanıcıları göster
const response = await swipeApi.getNormalDiscover(1, 10);
```

#### Yenileme
```typescript
// Cooldown süresi geçmiş kullanıcıları göster
const response = await swipeApi.getRefreshDiscover(1, 10);
```

### Premium Kullanıcı Özellikleri

#### Beni Beğenenleri Gör
```typescript
// Sadece onu beğenmiş kullanıcıları göster
const response = await swipeApi.getLikedMeDiscover(1, 10);
```

#### Sınırsız Swipe
- Günlük limit yok
- Daha kısa cooldown süreleri
- Öncelikli gösterim

## 📱 Frontend Kullanımı

### Temel Kullanım
```typescript
import { swipeApi } from '../services/api';

// Normal discover
const normalUsers = await swipeApi.getNormalDiscover();

// Yenileme
const refreshUsers = await swipeApi.getRefreshDiscover();

// Premium özellik
const likedMeUsers = await swipeApi.getLikedMeDiscover();
```

### Swipe Limit Kontrolü
```typescript
// Swipe yapmadan önce limit kontrolü
const limitStatus = await swipeApi.getSwipeLimitStatus();

if (limitStatus.isLimitReached) {
  // Limit doldu, kullanıcıya uyarı göster
  showSwipeLimitModal({
    message: limitStatus.limitMessage,
    isPremium: limitStatus.isPremium,
    nextResetTime: limitStatus.nextResetTime
  });
  return;
}

// Swipe yap
const swipeResponse = await swipeApi.swipe({
  action: 'LIKE',
  toUserId: 123
});

// Swipe sonrası limit kontrolü
if (swipeResponse.swipeLimitInfo) {
  console.log('Kalan swipe:', swipeResponse.swipeLimitInfo.remainingSwipes);
  
  if (swipeResponse.swipeLimitInfo.isLimitReached) {
    // Limit doldu, kullanıcıya bilgi ver
    showSwipeLimitReachedModal();
  }
}
```

### Swipe Yapma
```typescript
// Like
const likeResponse = await swipeApi.swipe({
  action: 'LIKE',
  toUserId: 123  // Backend'de beklenen alan
});

// Dislike
const dislikeResponse = await swipeApi.swipe({
  action: 'DISLIKE',
  toUserId: 123  // Backend'de beklenen alan
});

// Geriye uyumluluk için userId de kullanılabilir
const likeResponse2 = await swipeApi.swipe({
  action: 'LIKE',
  userId: 123    // Otomatik olarak toUserId'ye dönüştürülür
});
```

### Durum Kontrolü
```typescript
// Swipe yapılabilir mi?
const canSwipe = await swipeApi.canSwipe();

// Premium kullanıcı mı?
const isPremium = await swipeApi.isPremiumUser();

// Cooldown durumu
const cooldownInfo = await swipeApi.getCooldownInfo();

// Detaylı swipe limit durumu
const limitStatus = await swipeApi.getSwipeLimitStatus();
console.log('Kalan swipe:', limitStatus.remainingSwipes);
console.log('Limit doldu mu:', limitStatus.isLimitReached);
console.log('Limit mesajı:', limitStatus.limitMessage);

// Swipe limit uyarısı göster
await swipeApi.showSwipeLimitWarning();
```

## 🔧 Yeni Özellikler

### 1. Cooldown Sistemi
- Kullanıcılar belirli süre sonra tekrar gösterilir
- Premium kullanıcılar için daha kısa süreler
- Yenileme butonu ile manuel kontrol
- **Backend Formatı**: `likeCooldownMinutes`, `dislikeCooldownMinutes`, `isPremiumCooldown`

### 2. Akıllı Filtreleme
- Gender ve yaş tercihine göre filtreleme
- Burç uyumluluğuna göre sıralama
- Konum bazlı filtreleme
- Aktiflik durumuna göre önceliklendirme

### 3. Premium Özellikler
- Beni beğenenleri görme
- Sınırsız swipe
- Öncelikli gösterim
- Gelişmiş filtreler

### 4. Performans Optimizasyonu
- SQL query optimizasyonu
- Pagination desteği
- Cache mekanizması
- Rate limiting

### 5. Backend Format Uyumluluğu
- **Tek Kullanıcı Formatı**: Backend tek kullanıcı döndürür (`user` objesi)
- **Otomatik Normalizasyon**: Frontend'de `users` array'i formatına dönüştürülür
- **Geriye Uyumluluk**: Eski `users` array formatı da desteklenir
- **Cooldown Bilgileri**: `likeCooldownMinutes`, `dislikeCooldownMinutes` gibi detaylı bilgiler
- **Request Formatı**: Backend'de `toUserId` alanı beklenir, `userId` değil

### 6. Swipe Limit Kontrolü
- **Otomatik Limit Kontrolü**: Her swipe sonrası kalan hak kontrol edilir
- **Kullanıcı Bilgilendirmesi**: Limit dolduğunda otomatik uyarı
- **Premium Teşvik**: Limit dolduğunda premium üyelik önerisi
- **Reset Zamanı**: Bir sonraki limit sıfırlanma zamanı
- **Limit Mesajları**: Kullanıcı dostu limit bilgilendirmeleri

### 7. Gelişmiş Token Yönetimi
- **Otomatik Token Yenileme**: Süresi dolan token'lar otomatik yenilenir
- **Refresh Token Kontrolü**: Refresh token geçerliliği kontrol edilir
- **Hata Yönetimi**: Token hatalarında otomatik logout
- **Queue Sistemi**: Eşzamanlı istekler için kuyruk yönetimi

## 📊 Response Formatları

### Discover Response
```typescript
interface DiscoverResponse {
  success: boolean;
  users: DiscoverUser[];
  totalCount: number;
  returnedCount: number;
  message: string;
  hasMore?: boolean;
  cooldownInfo?: {
    canRefresh: boolean;
    nextRefreshTime: string;
    remainingSeconds: number;
    message: string;
    // Backend'den gelen ek alanlar
    likeCooldownMinutes?: number;
    dislikeCooldownMinutes?: number;
    isPremiumCooldown?: boolean;
    matchExpiryHours?: number;
  };
  swipeLimitInfo?: {
    isPremium: boolean;
    remainingSwipes: number;
    dailySwipeCount: number;
    canSwipe: boolean;
    nextResetTime: string;
    resetMessage: string;
    // Backend'den gelen ek alanlar
    backwardCompatibility?: boolean;
  };
}
```

### Backend Response Formatı
Backend'den gelen response formatı şu şekildedir:
```typescript
{
  success: true,
  user: {                    // Tek kullanıcı objesi (users array'i değil)
    id: 24,
    firstName: "teo",
    lastName: "teo",
    fullName: "teo teo",
    age: 53,
    gender: "MALE",
    zodiacSign: "PISCES",
    compatibilityScore: 45,
    compatibilityMessage: "Düşük Uyum (45%)",
    // ... diğer alanlar
  },
  cooldownInfo: {
    likeCooldownMinutes: 10,
    dislikeCooldownMinutes: 10,
    isPremiumCooldown: false,
    matchExpiryHours: 36
  },
  swipeLimitInfo: {
    isPremium: false,
    remainingSwipes: 20,
    backwardCompatibility: true
  },
  hasMoreUsers: true,
  totalRemainingUsers: 28
}
```

**Not:** Frontend'de bu format otomatik olarak normalize edilir ve `users` array'i formatına dönüştürülür.

### Swipe Response
```typescript
interface SwipeResponse {
  success: boolean;
  isMatch: boolean;
  status: 'LIKED' | 'DISLIKED' | 'MATCHED';
  matchId?: number;
  message: string;
  swipeLimitInfo?: SwipeLimitInfo;
  cooldownInfo?: CooldownInfo;
}
```

## 🎨 UI Entegrasyonu

### UserDetailPanel Güncellemeleri
- Uyumluluk skoru gösterimi
- Mesafe bilgisi
- Aktiflik durumu
- Premium özellikler

### Swipe Ekranı Güncellemeleri
- Cooldown bilgisi
- Swipe limit göstergesi
- Premium özellik butonları
- Yenileme butonu

## 🚨 Hata Yönetimi

### Yaygın Hata Kodları
- `400`: Geçersiz request
- `401`: Yetkilendirme hatası
- `403`: Yetki hatası
- `409`: Duplicate swipe
- `412`: Swipe limit aşımı
- `429`: Rate limit

### Hata Mesajları
```typescript
try {
  const response = await swipeApi.swipe(swipeData);
} catch (error) {
  if (error.response?.status === 412) {
    // Swipe limit aşımı
    showPremiumUpgradeModal();
  } else if (error.response?.status === 409) {
    // Zaten swipe yapılmış
    showAlreadySwipedMessage();
  }
}
```

## 🔄 Geriye Uyumluluk

Eski sistem ile uyumluluk korunmuştur:
- Eski endpoint'ler çalışmaya devam eder
- Eski response formatları desteklenir
- Kademeli geçiş mümkündür

### Request Format Uyumluluğu
```typescript
// Backend'de beklenen format
{
  action: 'LIKE',
  toUserId: 123
}

// Frontend'de desteklenen formatlar
{
  action: 'LIKE',
  toUserId: 123    // ✅ Önerilen
}

{
  action: 'LIKE',
  userId: 123      // ✅ Otomatik dönüştürülür
}

{
  action: 'LIKE',
  targetUserId: 123 // ✅ Eski sistem uyumluluğu
}
```

### Backend Format Uyumluluğu
```typescript
// Yeni backend formatı (tek kullanıcı)
{
  success: true,
  user: { /* kullanıcı bilgileri */ },
  cooldownInfo: { /* cooldown bilgileri */ },
  swipeLimitInfo: { /* swipe limit bilgileri */ }
}

// Eski format (users array)
{
  success: true,
  users: [/* kullanıcı array'i */],
  totalCount: 10,
  returnedCount: 5
}

// Frontend'de her iki format da desteklenir
const response = await swipeApi.getDiscoverUsers();
// response.users her zaman array olarak gelir
```

## 📈 Performans İpuçları

1. **Pagination Kullanın**: Büyük listeler için sayfalama yapın
2. **Cache Yapın**: Kullanıcı bilgilerini cache'leyin
3. **Lazy Loading**: Görünür kullanıcıları yükleyin
4. **Debounce**: Swipe işlemlerini debounce edin

## 🧪 Test

### Unit Test Örnekleri
```typescript
describe('Swipe API', () => {
  it('should handle normal discover', async () => {
    const response = await swipeApi.getNormalDiscover();
    expect(response.success).toBe(true);
    expect(response.users).toBeDefined();
  });

  it('should handle swipe action', async () => {
    const response = await swipeApi.swipe({
      action: 'LIKE',
      toUserId: 123
    });
    expect(response.success).toBe(true);
  });
});
```

## 🔮 Gelecek Özellikler

- [ ] Gelişmiş filtreler
- [ ] AI tabanlı eşleştirme
- [ ] Video profilleri
- [ ] Grup eşleştirme
- [ ] Event tabanlı eşleştirme

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Console log'larını kontrol edin
2. Network tab'ını inceleyin
3. Backend log'larını kontrol edin
4. Geliştirici ekibi ile iletişime geçin

---

**Son Güncelleme:** $(date)
**Versiyon:** 2.0.0
**Backend Uyumluluğu:** ✅ Tam Uyumlu
