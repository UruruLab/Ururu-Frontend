'use client';

import Link from 'next/link';
import { Search, Bell, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useUIStore, useAuthStore } from '@/store';
import { useLogout } from '@/hooks/useAuth';
// import { useCartBadge } from '@/hooks/useCartBadge'; // TODO: API 연동 완료 후 활성화

// 태블릿/모바일 헤더 컴포넌트
function MobileHeader() {
  const { searchOpen, toggleSearch } = useUIStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { logout } = useLogout();
  // const { cartItemCount } = useCartBadge(); // TODO: API 연동 완료 후 활성화

  return (
    <header className="sticky top-0 z-40 bg-bg-100 desktop:hidden" role="banner">
      <div className="px-6">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <div className="flex items-center">
            <Link href="/" aria-label="우르르 홈으로 이동">
              <Image
                src="/ururu-text-logo.png"
                alt="우르르"
                width={80}
                height={24}
                className="h-[18px] w-auto"
                priority
              />
            </Link>
          </div>

          {/* 우측 아이콘들 */}
          <nav className="flex items-center space-x-3" role="navigation" aria-label="주요 기능">
            {/* 검색 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSearch}
              className="p-2"
              aria-label="검색"
              aria-expanded={searchOpen}
              aria-controls="search-input"
            >
              <Search className="h-5 w-5 text-text-200" aria-hidden="true" />
            </Button>

            {/* 알림 */}
            <Button variant="ghost" size="sm" className="p-2" aria-label="알림">
              <Bell className="h-5 w-5 text-text-200" aria-hidden="true" />
            </Button>

            {/* 장바구니 */}
            <Link href="/cart" aria-label="장바구니로 이동">
              <Button variant="ghost" size="sm" className="relative p-2" aria-label="장바구니">
                <ShoppingCart className="h-5 w-5 text-text-200" aria-hidden="true" />
                {/* TODO: API 연동 완료 후 뱃지 활성화 */}
                {/* {cartItemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-300 text-xs font-medium text-text-on">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )} */}
              </Button>
            </Link>
          </nav>
        </div>

        {/* 검색바 */}
        {searchOpen && (
          <div className="pb-4" role="search">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-text-300"
                aria-hidden="true"
              />
              <Input
                id="search-input"
                placeholder="상품, 브랜드, 성분을 검색하세요"
                className="h-12 rounded-[36px] border border-primary-300 bg-bg-100 pl-10 pr-12 text-base focus:ring-2 focus:ring-primary-300 focus:ring-offset-0"
                aria-label="상품, 브랜드, 성분을 검색하세요"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export function Header() {
  return <MobileHeader />;
}
