/**
 * Unmatch API Type Definitions
 * Eşleşmeleri kaldırma ile ilgili tüm interface'ler
 */

// Request Types
export interface UnmatchRequest {
  id: number; // Match ID veya Chat Room ID (Universal ID System)
}

// Response Types
export interface UnmatchResponse {
  success: boolean;
  message: string;
  matchId: number;
  unmatchedAt: string; // ISO 8601 formatında tarih
}

export interface UnmatchResponseSimple {
  success: boolean;
  message: string;
  matchId: number;
}
