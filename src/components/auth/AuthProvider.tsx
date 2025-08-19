'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { initializeAuth, hasInitialized } = useAuthStore();

  useEffect(() => {
    // 초기화가 완료되지 않았을 때만 초기화 실행
    if (!hasInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, hasInitialized]);

  return <>{children}</>;
};
