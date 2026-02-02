/**
 * useBlock Hook
 * Block API işlemlerini yönetmek için custom hook
 */

import { useState } from 'react';
import { blockApi } from '../services/api';
import type { BlockedUser, BlockStatusResponse } from '../types/block';

interface UseBlockReturn {
  blockUser: (blockedUserId: number, context?: 'CHAT' | 'PROFILE' | 'SWIPE', reason?: string, matchId?: number) => Promise<void>;
  unblockUser: (blockedUserId: number) => Promise<void>;
  getBlockedUsers: () => Promise<BlockedUser[]>;
  checkBlockStatus: (userId: number) => Promise<BlockStatusResponse>;
  loading: boolean;
  error: string | null;
}

export const useBlock = (): UseBlockReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blockUser = async (
    blockedUserId: number,
    context: 'CHAT' | 'PROFILE' | 'SWIPE' = 'PROFILE',
    reason?: string,
    matchId?: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 [useBlock] Block işlemi başlatılıyor:', { blockedUserId, context, matchId });
      
      const response = await blockApi.blockUser(blockedUserId, reason, context, matchId);
      
      if (!response.success) {
        throw new Error(response.message || 'Engelleme işlemi başarısız');
      }
      
      console.log('✅ [useBlock] Kullanıcı başarıyla engellendi:', response);
      console.log('ℹ️ [useBlock] Backend chat room\'u kapattı, closedReason=BLOCK olarak işaretlendi');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Engelleme işlemi başarısız oldu';
      console.error('❌ [useBlock] Block hatası:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (blockedUserId: number) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 [useBlock] Unblock işlemi başlatılıyor:', { blockedUserId });
      
      const response = await blockApi.unblockUser(blockedUserId);
      
      if (!response.success) {
        throw new Error(response.message || 'Engel kaldırma işlemi başarısız');
      }
      
      console.log('✅ [useBlock] Engel başarıyla kaldırıldı');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Engel kaldırılamadı';
      console.error('❌ [useBlock] Unblock hatası:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBlockedUsers = async (): Promise<BlockedUser[]> => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 [useBlock] Engellenen kullanıcılar getiriliyor...');
      
      const users = await blockApi.getBlockedUsers();
      
      console.log('✅ [useBlock] Engellenen kullanıcılar getirildi:', users.length);
      return users;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Engellenen kullanıcılar getirilemedi';
      console.error('❌ [useBlock] Blocked users hatası:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkBlockStatus = async (userId: number): Promise<BlockStatusResponse> => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 [useBlock] Block durumu kontrol ediliyor:', { userId });
      
      const status = await blockApi.checkBlockStatus(userId);
      
      console.log('✅ [useBlock] Engelleme durumu:', status);
      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Engelleme durumu kontrol edilemedi';
      console.error('❌ [useBlock] Block status check hatası:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    blockUser,
    unblockUser,
    getBlockedUsers,
    checkBlockStatus,
    loading,
    error
  };
};
