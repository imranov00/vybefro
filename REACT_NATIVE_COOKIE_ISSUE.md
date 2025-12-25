# ⚠️ React Native Cookie Limitation - Critical Issue

## 🚨 Problem

React Native'de **cookie yönetimi YOKTUR!**

```typescript
// ❌ React Native'de ÇALIŞMAZ
axios.create({
  withCredentials: true  // Sadece browser'larda çalışır
});
```

## 🔍 Neden?

- React Native **WebView veya browser değil** - native platform
- `XMLHttpRequest` yok → `withCredentials` desteği yok
- Cookie storage API'si yok
- HttpOnly cookie'ler gönderilmez/alınamaz

## ✅ Çözüm: Backend Fallback Mekanizması

Backend öncelik sırası:
1. **Cookie'den oku** (web için)
2. **Body'den oku** (React Native için) ⬅️ Bunu kullanıyoruz

### Frontend Implementasyonu

```typescript
// ✅ DOĞRU: React Native için body'de gönder
const performTokenRefresh = async () => {
  const refreshToken = await getRefreshToken(); // AsyncStorage'dan
  
  const response = await api.post('/api/auth/refresh', {
    refreshToken // Backend fallback için body'de gönder
  });
  
  // Yeni token'ları AsyncStorage'a kaydet
  await saveToken(response.data.token);
  await saveRefreshToken(response.data.refreshToken);
};
```

### Backend Fallback Kontrolü

Backend kodunda şöyle olmalı:

```java
@PostMapping("/api/auth/refresh")
public ResponseEntity<?> refresh(
    @CookieValue(value = "refresh_token", required = false) String cookieToken,
    @RequestBody(required = false) RefreshRequest bodyRequest
) {
    // 1. Önce cookie'den oku (web için)
    String refreshToken = cookieToken;
    
    // 2. Cookie yoksa body'den oku (React Native için)
    if (refreshToken == null && bodyRequest != null) {
        refreshToken = bodyRequest.getRefreshToken();
    }
    
    if (refreshToken == null) {
        return ResponseEntity.status(401).body("Refresh token bulunamadı");
    }
    
    // Token validation ve yenileme...
}
```

## 📊 Karşılaştırma

| Özellik | Web (Browser) | React Native |
|---------|---------------|--------------|
| Cookie Desteği | ✅ Otomatik | ❌ Yok |
| withCredentials | ✅ Çalışır | ❌ Çalışmaz |
| HttpOnly Cookie | ✅ Güvenli | ❌ Kullanılamaz |
| Storage | Cookie | AsyncStorage |
| Token Gönderimi | Otomatik (cookie) | Manuel (body) |
| XSS Koruması | %100 (HttpOnly) | %80 (AsyncStorage) |
| Implementasyon | Kolay | Fallback gerekli |

## 🔄 Migration Checklist

Eğer cookie-based sistemden hybrid'e geçiyorsanız:

- [ ] Backend fallback mekanizması eklendi mi?
- [ ] Frontend AsyncStorage kullanıyor mu?
- [ ] Login'de refreshToken response body'de dönüyor mu?
- [ ] Refresh isteklerinde body'de refreshToken gönderiliyor mu?
- [ ] Persistent login body'de refreshToken gönderiyor mu?
- [ ] Token rotation çalışıyor mu? (yeni refreshToken kaydediliyor mu?)

## 🎯 Best Practice: Hybrid Approach

En iyi çözüm **hem cookie hem body desteği**:

```typescript
// Frontend: Her iki durumu da destekle
const api = axios.create({
  withCredentials: true, // Web için (React Native'de zarar vermez)
});

// Body'de de gönder (React Native için)
const refreshToken = await getRefreshToken();
await api.post('/api/auth/refresh', {
  refreshToken // Fallback
});
```

Backend her iki kaynağı da kontrol eder:
- Web → Cookie'den okur
- React Native → Body'den okur

## 📚 Referanslar

- [COOKIE_BASED_AUTH.md](./COOKIE_BASED_AUTH.md) - Detaylı dokümantasyon
- [Axios Credentials Support](https://github.com/axios/axios/issues/191) - withCredentials React Native'de çalışmaz
- [React Native Networking](https://reactnative.dev/docs/network) - Cookie yönetimi yok

---

**Önemli Not:** Bu limitation React Native'in tasarımından kaynaklanıyor ve değiştirilemez. Tek çözüm backend fallback mekanizması kullanmak.
