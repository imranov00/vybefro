/**
 * Block API Type Definitions
 * Kullanıcıları engelleme ve engel yönetimi ile ilgili tüm interface'ler
 */

// Request Types
export interface BlockUserRequest {
  blockedUserId: number;  // Zorunlu - Engellenecek kullanıcı ID'si
  reason?: string;        // İsteğe bağlı - Engelleme nedeni
  context?: 'CHAT' | 'PROFILE' | 'SWIPE';  // İsteğe bağlı - Nereden bloklandı
  matchId?: number;       // İsteğe bağlı - Hangi match'ten bloklandı
}

// Response Types
export interface BlockResponse {
  success: boolean;
  message: string;
  blockId: number;
  blockedAt: string; // ISO 8601 formatında tarih
}

export interface UnblockResponse {
  success: boolean;
  message: string;
}

export interface BlockedUser {
  id: number;
  blockedUserId: number;
  blockedUser: UserProfile;
  blockedAt: string;
  reason?: string;
  context?: 'CHAT' | 'PROFILE' | 'SWIPE';
  matchId?: number;
}

export interface BlockStatusResponse {
  isBlocked: boolean;        // Her iki yönde de engelleme var mı?
  blockedByMe: boolean;      // Ben bu kullanıcıyı engelledim mi?
  blockedByThem: boolean;    // Bu kullanıcı beni engelledi mi?
}

export type BlockedUsersResponse = BlockedUser[];

// User Profile (BlockedUser içinde kullanılıyor)
export interface UserProfile {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  bio?: string;
  birthDate?: string;
  gender?: string;
  zodiacSign?: string;
  isPremium?: boolean;
}
