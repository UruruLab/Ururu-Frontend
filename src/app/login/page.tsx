'use client';

import { CustomLayout } from '@/components/layout';
import { User, Store } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { SocialLogin } from '@/components/auth/SocialLogin';
import { SellerLogin } from '@/components/auth/SellerLogin';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginPageContent() {
  const { loginType, setLoginType, error, isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 파라미터에서 로그인 타입 확인
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'seller') {
      setLoginType('seller');
    }
  }, [searchParams, setLoginType]);

  // 로그인 성공 시 리다이렉트
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.user_type === 'SELLER') {
        router.replace('/seller');
      } else {
        router.replace('/mypage');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleLoginSuccess = () => {
    // 로그인 성공 시 리다이렉트는 useEffect에서 처리
  };

  const handleLoginError = (error: string) => {
    console.error('Login error:', error);
  };

  return (
    <CustomLayout showTopBar={false} showSearchBar={false} showMainNav={false} showFooter={false}>
      <div className="bg-bg-100">
        {/* 로그인 컨테이너 */}
        <div className="container mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-4 tablet:max-w-lg desktop:max-w-xl">
          {/* 로고 */}
          <div className="mb-6 flex justify-center">
            <Link href="/" aria-label="우르르 홈으로 이동">
              <Image
                src="/ururu-full-logo.png"
                alt="우르르"
                width={120}
                height={32}
                className="h-12 w-auto"
                priority
              />
            </Link>
          </div>

          {/* 안내 문구 */}
          <div className="mb-6 text-center">
            <p className="text-sm font-normal text-text-200">
              {loginType === 'buyer'
                ? '지금 우르르 몰려가 득템하러 가볼까요?'
                : '우르르와 함께 성장하는 비즈니스를 경험하세요'}
            </p>
          </div>

          {/* 로그인 타입 선택 */}
          <div className="mb-6">
            <div
              className="flex rounded-lg bg-bg-200 p-1"
              role="tablist"
              aria-label="로그인 유형 선택"
            >
              <button
                type="button"
                onClick={() => setLoginType('buyer')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md py-3 text-sm font-medium transition-all ${
                  loginType === 'buyer'
                    ? 'bg-bg-100 text-text-100 shadow-sm'
                    : 'text-text-200 hover:text-text-100'
                }`}
                role="tab"
                aria-selected={loginType === 'buyer'}
                aria-label="구매자 로그인"
              >
                <User className="h-4 w-4" aria-hidden="true" />
                구매자 로그인
              </button>
              <button
                type="button"
                onClick={() => setLoginType('seller')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md py-3 text-sm font-medium transition-all ${
                  loginType === 'seller'
                    ? 'bg-bg-100 text-text-100 shadow-sm'
                    : 'text-text-200 hover:text-text-100'
                }`}
                role="tab"
                aria-selected={loginType === 'seller'}
                aria-label="판매자 로그인"
              >
                <Store className="h-4 w-4" aria-hidden="true" />
                판매자 로그인
              </button>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          {/* 소셜 로그인 (구매자 로그인일 때만 표시) */}
          {loginType === 'buyer' && (
            <div className="min-h-[320px] space-y-4" role="region" aria-label="소셜 로그인">
              <div className="space-y-3">
                <SocialLogin
                  provider="kakao"
                  onSuccess={handleLoginSuccess}
                  onError={handleLoginError}
                />
                <SocialLogin
                  provider="google"
                  onSuccess={handleLoginSuccess}
                  onError={handleLoginError}
                />
              </div>
              {/* 약관 동의 문구 */}
              <div className="mt-6 text-center">
                <p className="text-xs text-text-300">
                  계속 진행 시, <span className="underline">이용약관</span> 및{' '}
                  <span className="underline">개인정보처리방침</span>에 동의한 것으로 간주됩니다.
                </p>
              </div>
            </div>
          )}

          {/* 판매자 로그인 폼 */}
          {loginType === 'seller' && (
            <div className="min-h-[320px] space-y-5" role="region" aria-label="판매자 로그인">
              <SellerLogin onSuccess={handleLoginSuccess} onError={handleLoginError} />

              {/* 약관 동의 문구 */}
              <div className="mt-6 text-center">
                <p className="text-xs text-text-300">
                  계속 진행 시, <span className="underline">이용약관</span> 및{' '}
                  <span className="underline">개인정보처리방침</span>에 동의한 것으로 간주됩니다.
                </p>
              </div>

              {/* 회원가입 문구 (판매자 로그인에서만) */}
              <div className="mt-2 text-center">
                <span className="text-sm text-text-200">아직 회원이 아니신가요? </span>
                <Link
                  href="/seller-signup"
                  className="text-sm font-medium text-primary-300 transition-colors hover:text-primary-200"
                  aria-label="판매자 회원가입 페이지로 이동"
                >
                  회원가입
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </CustomLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary-300"></div>
            <p className="mt-2 text-sm text-text-200">로딩 중...</p>
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
