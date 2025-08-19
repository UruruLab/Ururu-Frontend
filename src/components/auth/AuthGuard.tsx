'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireSeller?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = false,
  requireSeller = false,
}) => {
  const { user, isAuthenticated, isCheckingAuth, hasInitialized } = useAuthStore();
  const router = useRouter();

  // 초기화 완료 후 인증 상태에 따른 처리
  useEffect(() => {
    if (!hasInitialized) return;

    if (requireAuth && !isAuthenticated) {
      // 인증이 필요한 페이지인데 로그인되지 않은 경우
      router.replace('/login');
      return;
    }

    if (requireSeller && user?.user_type !== 'SELLER') {
      // 판매자 권한이 필요한 페이지인데 판매자가 아닌 경우
      router.replace('/unauthorized');
      return;
    }
  }, [isAuthenticated, user, requireAuth, requireSeller, router, hasInitialized]);

  // 초기화가 완료되지 않았거나 인증 확인 중인 경우 아무것도 렌더링하지 않음 (백그라운드 처리)
  if (!hasInitialized || isCheckingAuth) {
    return null;
  }

  // 인증이 필요한 페이지인데 인증되지 않은 경우 (리다이렉트 중)
  if (requireAuth && !isAuthenticated) {
    return null; // 리다이렉트 중에는 아무것도 렌더링하지 않음
  }

  // 판매자 권한이 필요한 페이지인데 권한이 없는 경우 (리다이렉트 중)
  if (requireSeller && user?.user_type !== 'SELLER') {
    return null; // 리다이렉트 중에는 아무것도 렌더링하지 않음
  }

  return <>{children}</>;
};
