'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store';
import { CustomLayout } from '@/components/layout';

const AuthCallbackContent = () => {
  const { login, checkAuth } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const result = searchParams.get('result');
      const reason = searchParams.get('reason');
      const provider = searchParams.get('provider');

      if (process.env.NODE_ENV === 'development') {
        console.log('Auth callback:', { result, reason, provider });
      }

      // 탈퇴한 회원인 경우
      if (result === 'error' && reason === 'withdrawn_member') {
        // 메인 페이지로 이동 (파라미터 포함)
        router.replace(`/?result=error&reason=withdrawn_member&provider=${provider || 'unknown'}`);
        return;
      }

      // 기타 에러인 경우
      if (result === 'error') {
        console.error('Auth error:', reason);
        router.replace('/login?error=auth_failed');
        return;
      }

      // 성공인 경우 기존 로직과 동일하게 처리
      try {
        await checkAuth();
        const { user } = useAuthStore.getState();

        if (user) {
          if (user.user_type === 'SELLER') {
            router.replace('/seller');
          } else {
            router.replace('/mypage');
          }
        } else {
          throw new Error('Invalid auth response structure');
        }
      } catch (error) {
        console.error('Auth status check failed:', error);
        router.replace('/login?error=auth_failed');
      }
    };

    handleCallback();
  }, [router, searchParams, checkAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-100">
      <div className="text-center">
        <div className="mb-4 text-6xl">⏳</div>
        <h1 className="mb-2 text-xl font-semibold text-text-100">로그인 처리 중...</h1>
        <p className="text-text-200">잠시 후 자동으로 이동됩니다...</p>
      </div>
    </div>
  );
};

export default function AuthCallbackPage() {
  return (
    <CustomLayout showTopBar={false} showSearchBar={false} showMainNav={false} showFooter={false}>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-bg-100">
            <div className="text-center">
              <div className="mb-4 text-6xl">⏳</div>
              <h1 className="mb-2 text-xl font-semibold text-text-100">로그인 처리 중...</h1>
              <p className="text-text-200">잠시 후 자동으로 이동됩니다...</p>
            </div>
          </div>
        }
      >
        <AuthCallbackContent />
      </Suspense>
    </CustomLayout>
  );
}
