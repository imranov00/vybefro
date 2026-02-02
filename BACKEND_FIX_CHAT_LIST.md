# Backend Chat List Filtreleme Düzeltmesi

## 🐛 Problem
`/api/chat/private/list` endpoint'i **kapalı chat room'ları** (unmatch/block edilen) da döndürüyor.
Bu yüzden frontend'de unmatch yapıldıktan sonra chat hala listede gözüküyor.

## ✅ Çözüm

### 1. Repository Katmanı (ChatRoomRepository.java)

```java
@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    
    // ✅ Sadece aktif chat'leri getir
    @Query("""
        SELECT cr FROM ChatRoom cr
        WHERE (cr.user1Id = :userId OR cr.user2Id = :userId)
        AND cr.isActive = true
        ORDER BY cr.lastMessageAt DESC
        """)
    List<ChatRoom> findActiveByUserId(@Param("userId") Long userId);
    
    // Veya Spring Data JPA naming convention ile:
    List<ChatRoom> findByUser1IdOrUser2IdAndIsActiveTrueOrderByLastMessageAtDesc(
        Long user1Id, Long user2Id
    );
}
```

### 2. Service Katmanı (ChatService.java)

```java
@Service
public class ChatService {
    
    @Transactional(readOnly = true)
    public PrivateChatListResponse getPrivateChatList(Long userId) {
        // ❌ ESKI KOD - Tüm chat'leri getiriyor
        // List<ChatRoom> chatRooms = chatRoomRepository.findByUserId(userId);
        
        // ✅ YENİ KOD - Sadece aktif chat'leri getir
        List<ChatRoom> chatRooms = chatRoomRepository.findActiveByUserId(userId);
        
        List<PrivateChatRoomDTO> chatRoomDTOs = chatRooms.stream()
            .filter(ChatRoom::getIsActive) // Ekstra güvenlik
            .map(this::convertToDTO)
            .collect(Collectors.toList());
            
        return PrivateChatListResponse.builder()
            .success(true)
            .privateChatRooms(chatRoomDTOs)
            .count(chatRoomDTOs.size())
            .message(chatRoomDTOs.size() + " aktif sohbet bulundu.")
            .build();
    }
    
    private PrivateChatRoomDTO convertToDTO(ChatRoom chatRoom) {
        // DTO dönüşümü
        return PrivateChatRoomDTO.builder()
            .id(chatRoom.getId())
            .matchId(chatRoom.getMatchId())
            .isActive(chatRoom.getIsActive()) // ✅ Bu field'ı mutlaka ekle
            .closedReason(chatRoom.getClosedReason()) // ✅ Bu field'ı da ekle
            .otherUser(getOtherUser(chatRoom))
            .lastMessage(getLastMessage(chatRoom))
            // ... diğer field'lar
            .build();
    }
}
```

### 3. Controller Katmanı (ChatController.java)

```java
@RestController
@RequestMapping("/api/chat")
public class ChatController {
    
    @GetMapping("/private/list")
    public ResponseEntity<PrivateChatListResponse> getPrivateChatList(
        @AuthenticationPrincipal JwtUserDetails userDetails
    ) {
        Long userId = userDetails.getUserId();
        
        // ✅ Sadece aktif chat'leri döndür
        PrivateChatListResponse response = chatService.getPrivateChatList(userId);
        
        return ResponseEntity.ok(response);
    }
    
    // Opsiyonel: Tüm chat'leri görmek için admin endpoint
    @GetMapping("/private/list/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PrivateChatListResponse> getAllPrivateChatList(
        @AuthenticationPrincipal JwtUserDetails userDetails
    ) {
        Long userId = userDetails.getUserId();
        
        // Kapalı chat'ler de dahil
        PrivateChatListResponse response = chatService.getAllPrivateChatList(userId);
        
        return ResponseEntity.ok(response);
    }
}
```

### 4. DTO Güncellemesi (PrivateChatRoomDTO.java)

```java
@Data
@Builder
public class PrivateChatRoomDTO {
    private Long id;
    private String type; // "PRIVATE"
    private String name;
    private UserDTO otherUser;
    private MessageDTO lastMessage;
    private Integer unreadCount;
    private Long matchId;
    private String matchType; // "ZODIAC" veya "MUSIC"
    private String displayName;
    private String timeAgo;
    
    // ✅ Bu field'ları mutlaka ekleyin
    private Boolean isActive; // Chat aktif mi?
    private String closedReason; // "UNMATCH", "BLOCK", veya null
    private LocalDateTime closedAt; // Ne zaman kapatıldı
}
```

## 🧪 Test Senaryoları

### Test 1: Normal Chat Listesi
```bash
GET /api/chat/private/list
Authorization: Bearer {token}

# Beklenen: Sadece aktif chat'ler
Response: {
  "success": true,
  "privateChatRooms": [
    {
      "id": 1,
      "matchId": 10,
      "isActive": true,
      "closedReason": null,
      "otherUser": {...}
    }
  ],
  "count": 1
}
```

### Test 2: Unmatch Sonrası
```bash
# 1. Unmatch yap
POST /api/matches/19/unmatch
Response: {"success": true}

# 2. Chat listesini kontrol et
GET /api/chat/private/list
# Beklenen: Unmatch edilen chat LİSTEDE OLMAMALI
Response: {
  "privateChatRooms": [], // Diğer aktif chat'ler
  "count": 0
}
```

### Test 3: Database Kontrolü
```sql
-- Unmatch edilen chat'in durumunu kontrol et
SELECT id, match_id, is_active, closed_reason, closed_at
FROM chat_rooms
WHERE id = 19;

-- Beklenen:
-- is_active = false
-- closed_reason = 'UNMATCH'
-- closed_at = (timestamp)
```

## 📝 Ek Kontroller

### ChatRoom Entity Kontrolü
```java
@Entity
@Table(name = "chat_rooms")
public class ChatRoom {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true; // ✅ Varsayılan true
    
    @Column(name = "closed_reason")
    private String closedReason; // "UNMATCH", "BLOCK", null
    
    @Column(name = "closed_at")
    private LocalDateTime closedAt;
    
    // ... diğer field'lar
}
```

### Unmatch Metodunun Kontrolü
```java
@Transactional
public void unmatchUser(Long matchId, Long currentUserId, String reason) {
    // 1. Match'i bul
    Match match = matchRepository.findById(matchId).orElse(null);
    if (match == null) return;
    
    Long otherUserId = match.getOtherUserId(currentUserId);
    
    // 2. Chat room'u kapat (ÖNEMLİ!)
    ChatRoom chatRoom = chatRoomRepository.findByMatchId(matchId);
    if (chatRoom != null) {
        chatRoom.setIsActive(false); // ✅
        chatRoom.setClosedReason("UNMATCH"); // ✅
        chatRoom.setClosedAt(LocalDateTime.now()); // ✅
        chatRoomRepository.save(chatRoom);
    }
    
    // 3. Swipe history temizle
    swiperRepository.deleteBySwiperIdAndSwipedId(currentUserId, otherUserId);
    swiperRepository.deleteBySwiperIdAndSwipedId(otherUserId, currentUserId);
    
    // 4. Match'i sil
    matchRepository.delete(match);
}
```

## ⚡ Hızlı Test

Backend'de değişikliği yaptıktan sonra:

1. **Sunucuyu yeniden başlat**
2. **Database'i kontrol et:**
   ```sql
   SELECT * FROM chat_rooms WHERE closed_reason = 'UNMATCH';
   ```
3. **API'yi test et:**
   ```bash
   curl -H "Authorization: Bearer {token}" \
        http://localhost:8080/api/chat/private/list
   ```
4. **Frontend'de test et:**
   - Unmatch yap
   - Chat listesine geri dön
   - Chat listede OLMAMALI

## 🎯 Özet

**Backend'de değişmesi gereken tek satır:**
```java
// ❌ ÖNCE
List<ChatRoom> chatRooms = chatRoomRepository.findByUserId(userId);

// ✅ SONRA
List<ChatRoom> chatRooms = chatRoomRepository.findActiveByUserId(userId);
```

**Ve repository'ye bu metodu ekleyin:**
```java
@Query("SELECT cr FROM ChatRoom cr WHERE (cr.user1Id = :userId OR cr.user2Id = :userId) AND cr.isActive = true")
List<ChatRoom> findActiveByUserId(@Param("userId") Long userId);
```

Bu değişiklik yapıldığında frontend'deki tüm workaround'lar gereksiz hale gelecek ve sistem dokümantasyonda belirtildiği gibi çalışacak.
