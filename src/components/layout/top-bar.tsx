'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuthStore } from '@/store';
import { useLogout } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { LogoutConfirmDialog } from '@/components/common';

export function TopBar() {
  const { isAuthenticated, user } = useAuthStore();
  const { logout } = useLogout();
  const router = useRouter();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setIsLogoutDialogOpen(false);
    }
  };

  const handleAuthRequiredClick = (href: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push(href);
  };

  return (
    <div className="hidden bg-bg-100 desktop:block">
      <div className="container">
        <div className="flex h-12 items-center justify-end">
          <nav className="flex items-center space-x-6">
            {isAuthenticated ? (
              <button
                onClick={handleLogoutClick}
                className="text-sm text-text-200 transition-colors hover:text-text-100"
              >
                로그아웃
              </button>
            ) : (
              <Link
                href="/login"
                className="text-sm text-text-200 transition-colors hover:text-text-100"
              >
                로그인
              </Link>
            )}
            <button
              onClick={() => handleAuthRequiredClick('/cart')}
              className="text-sm text-text-200 transition-colors hover:text-text-100"
            >
              장바구니
            </button>
            <button
              onClick={() => handleAuthRequiredClick('/history')}
              className="text-sm text-text-200 transition-colors hover:text-text-100"
            >
              히스토리
            </button>
            <button
              onClick={() => handleAuthRequiredClick('/mypage/orders')}
              className="text-sm text-text-200 transition-colors hover:text-text-100"
            >
              주문배송
            </button>
            <button
              onClick={() => handleAuthRequiredClick('/mypage')}
              className="text-sm text-text-200 transition-colors hover:text-text-100"
            >
              마이페이지
            </button>
          </nav>
        </div>
      </div>

      {/* 로그아웃 확인 다이얼로그 */}
      <LogoutConfirmDialog
        isOpen={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />
    </div>
  );
}
