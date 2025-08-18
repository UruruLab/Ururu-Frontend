'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { initializeAuth, hasInitialized, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    // 초기화가 완료되지 않았고, 인증 확인 중이 아닐 때만 초기화 실행
    if (!hasInitialized && !isCheckingAuth) {
      initializeAuth();
    }
  }, [initializeAuth, hasInitialized, isCheckingAuth]);

  return <>{children}</>;
};
