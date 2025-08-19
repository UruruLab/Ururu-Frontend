'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/authService';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SellerLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export const SellerLogin: React.FC<SellerLoginProps> = ({ onSuccess, onError, className = '' }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const response = await AuthService.sellerLogin(credentials);
      login(response.member_info);

      // 성공 시 즉시 판매자 페이지로 리다이렉트
      router.replace('/seller');
      onSuccess?.();
    } catch (error) {
      console.error('Seller login error:', error);
      setIsLoading(false); // 에러 시에만 로딩 상태 해제
      onError?.(error instanceof Error ? error.message : '로그인에 실패했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-text-100">
          이메일
        </label>
        <Input
          type="email"
          id="email"
          value={credentials.email}
          onChange={(e) => setCredentials((prev) => ({ ...prev, email: e.target.value }))}
          required
          className="h-12 rounded-lg border-bg-300 bg-bg-100 px-4 py-3 text-base text-text-100 placeholder:text-text-300 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-0"
          placeholder="이메일을 입력하세요"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-text-100">
          비밀번호
        </label>
        <Input
          type="password"
          id="password"
          value={credentials.password}
          onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
          required
          className="h-12 rounded-lg border-bg-300 bg-bg-100 px-4 py-3 text-base text-text-100 placeholder:text-text-300 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-0"
          placeholder="비밀번호를 입력하세요"
          disabled={isLoading}
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="h-12 w-full rounded-lg border border-primary-300 bg-bg-100 text-primary-300 transition-colors hover:bg-primary-100 disabled:opacity-50"
        aria-label="판매자 센터로 이동"
      >
        {isLoading ? '로그인 중...' : '판매자 센터로 이동'}
      </Button>
    </form>
  );
};
