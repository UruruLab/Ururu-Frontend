import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { encodeRedirectPath } from '@/lib/utils';

export interface AuthRedirectOptions {
  fallbackPath?: string;
  loginPath?: string;
}

/**
 * 서버 컴포넌트에서 403 에러 발생 시 로그인 페이지로 리다이렉트하는 유틸리티
 * @param error - 발생한 에러 객체
 * @param options - 리다이렉트 옵션
 */
export const handleAuthError = (error: any, options: AuthRedirectOptions = {}): never => {
  const { fallbackPath = '/', loginPath = '/login' } = options;

  if (typeof error.message === 'string' && error.message.includes('status: 403')) {
    try {
      const headersList = headers();
      const pathname = headersList.get('x-pathname') || fallbackPath;
      redirect(`${loginPath}?redirect=${encodeRedirectPath(pathname)}`);
    } catch {
      // headers() 사용 불가능한 경우 fallback 사용
      redirect(`${loginPath}?redirect=${encodeRedirectPath(fallbackPath)}`);
    }
  }

  // 403이 아닌 다른 에러는 그대로 throw
  throw error;
};
