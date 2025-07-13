// 클라이언트 컴포넌트에서 403 에러 발생 시 로그인 페이지로 리다이렉트하는 유틸리티
// (Server Component 전용 로직은 별도 serverAuthUtils.ts로 분리)
import { encodeRedirectPath } from '@/lib/utils';

interface AuthRedirectOptions {
  loginPath?: string;
}

export const handleClientAuthError = (
  error: any,
  router: any,
  currentPath: string,
  options: AuthRedirectOptions = {},
): void => {
  const { loginPath = '/login' } = options;

  if (typeof error.message === 'string' && error.message.includes('status: 403')) {
    router.push(`${loginPath}?redirect=${encodeRedirectPath(currentPath)}`);
  } else {
    throw error;
  }
};
