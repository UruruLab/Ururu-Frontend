'use client';

import { useState } from 'react';
import { AuthService } from '@/services/authService';
import { SocialProvider } from '@/types/auth';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface SocialLoginProps {
  provider: SocialProvider;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export const SocialLogin: React.FC<SocialLoginProps> = ({
  provider,
  onSuccess,
  onError,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialLogin = async () => {
    try {
      setIsLoading(true);

      // 1. 인증 URL 생성
      const authInfo = await AuthService.getSocialAuthUrl(provider);

      // 2. 소셜 로그인 페이지로 즉시 리다이렉트
      window.location.href = authInfo.authUrl;
    } catch (error) {
      console.error('Social login error:', error);
      setIsLoading(false); // 에러 시에만 로딩 상태 해제
      onError?.(error instanceof Error ? error.message : '소셜 로그인에 실패했습니다.');
    }
  };

  const getProviderInfo = (provider: SocialProvider) => {
    switch (provider) {
      case 'kakao':
        return {
          name: '카카오',
          icon: '/kakao-talk.svg',
          bgColor: 'bg-[#FEE500]',
          textColor: 'text-[#3C1E1E]',
          hoverColor: 'hover:brightness-95',
        };
      case 'google':
        return {
          name: '구글',
          icon: '/google-logo.svg',
          bgColor: 'bg-bg-100',
          textColor: 'text-text-200',
          hoverColor: 'hover:bg-bg-200',
          border: 'border border-bg-300',
        };
      default:
        return {
          name: provider,
          icon: '',
          bgColor: 'bg-bg-100',
          textColor: 'text-text-200',
          hoverColor: 'hover:bg-bg-200',
        };
    }
  };

  const providerInfo = getProviderInfo(provider);

  return (
    <Button
      onClick={handleSocialLogin}
      disabled={isLoading}
      className={`flex h-12 w-full items-center justify-center gap-3 rounded-lg text-sm font-medium shadow transition disabled:opacity-50 ${providerInfo.bgColor} ${providerInfo.textColor} ${providerInfo.hoverColor} ${providerInfo.border || ''} ${className}`}
      aria-label={`${providerInfo.name} 계정으로 로그인`}
    >
      {providerInfo.icon && (
        <Image
          src={providerInfo.icon}
          alt={providerInfo.name}
          width={20}
          height={20}
          className="h-5 w-5"
          aria-hidden="true"
        />
      )}
      {isLoading ? '로그인 중...' : `${providerInfo.name} 계정으로 로그인하기`}
    </Button>
  );
};
