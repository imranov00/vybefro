/**
 * useUnmatch Hook
 * Unmatch API işlemlerini yönetmek için custom hook
 */

import { useState } from 'react';
import { unmatchApi } from '../services/api';

interface UseUnmatchReturn {
  unmatchUser: (matchOrChatRoomId: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useUnmatch = (): UseUnmatchReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unmatchUser = async (matchOrChatRoomId: number) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 [useUnmatch] Unmatch işlemi başlatılıyor:', { matchOrChatRoomId });
      
      const response = await unmatchApi.unmatchUser(matchOrChatRoomId);
      
      if (!response.success) {
        throw new Error(response.message || 'Eşleşme kaldırma işlemi başarısız');
      }
      
      console.log('✅ [useUnmatch] Eşleşme başarıyla kaldırıldı:', response);
      console.log('ℹ️ [useUnmatch] Backend chat room\'u kapattı, closedReason=UNMATCH olarak işaretlendi');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Eşleşme kaldırma işlemi başarısız oldu';
      console.error('❌ [useUnmatch] Unmatch hatası:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    unmatchUser,
    loading,
    error
  };
};
