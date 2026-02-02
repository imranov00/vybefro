import React, { createContext, ReactNode, useContext, useState } from 'react';

// Loading context değer tipi
type LoadingContextType = {
  isLoading: boolean;
  loadingMessage: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  setLoadingMessage: (message: string) => void;
};

// Context oluştur
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Context Provider bileşeni
export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Yükleniyor...');

  const showLoading = (message: string = 'Yükleniyor...') => {
    console.log('📍 [LOADING] Gösteriliyor:', message);
    setLoadingMessage(message);
    setIsLoading(true);
  };

  const hideLoading = () => {
    console.log('📍 [LOADING] Gizleniyor');
    setIsLoading(false);
    setLoadingMessage('Yükleniyor...');
  };

  const value: LoadingContextType = {
    isLoading,
    loadingMessage,
    showLoading,
    hideLoading,
    setLoadingMessage,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

// Hook - Loading context'i kullan
export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading hook\'u LoadingProvider içinde kullanılmalı');
  }
  return context;
}
