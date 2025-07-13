import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 리다이렉트 경로 보안 검증
export const isSafeRedirectPath = (path: string): boolean => {
  const safePaths = ['/seller', '/mypage', '/cart', '/order', '/product', '/category', '/ranking'];
  return safePaths.some((safePath) => path.startsWith(safePath));
};

// URL 파라미터에서 안전한 리다이렉트 경로 추출
export const getSafeRedirectPath = (redirectParam: string | null): string | null => {
  if (!redirectParam) return null;

  try {
    const decodedPath = decodeURIComponent(redirectParam);
    return isSafeRedirectPath(decodedPath) ? decodedPath : null;
  } catch {
    return null;
  }
};

// 현재 경로를 리다이렉트 파라미터로 인코딩
export const encodeRedirectPath = (path: string): string => {
  return encodeURIComponent(path);
};
