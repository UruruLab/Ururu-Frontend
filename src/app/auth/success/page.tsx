'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';

export default function AuthSuccessPage() {
  const { checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        // 인증 상태 확인
        await checkAuth();

        // 성공 시 적절한 페이지로 즉시 리다이렉트
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

        // 에러 메시지에 "탈퇴" 관련 문구가 포함되어 있는지 확인
        const errorMessage = error instanceof Error ? error.message : '';
        if (
          errorMessage.includes('탈퇴') ||
          errorMessage.includes('withdrawn') ||
          errorMessage.includes('이미 사용 중인 정보')
        ) {
          // 메인 페이지로 이동
          router.replace('/');
          // 탈퇴한 회원 알림 (약간의 지연을 두어 페이지 이동 후 표시)
          setTimeout(() => {
            alert('탈퇴한 회원입니다. 다시 가입해주세요.');
          }, 100);
        } else {
          router.replace('/login?error=auth_failed');
        }
      }
    };

    handleAuthSuccess();
  }, [router, checkAuth]);

  // 리다이렉트 중에는 아무것도 렌더링하지 않음
  return null;
}
