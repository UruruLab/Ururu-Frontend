'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Package,
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  User,
  Plus,
  Users,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SELLER_PROFILE } from '@/data/seller';
import { useLogout } from '@/hooks/useAuth';
import { LogoutConfirmDialog } from '@/components/common';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const sidebarItems: SidebarItem[] = [
  {
    icon: <TrendingUp className="h-4 w-4" />,
    label: '대시보드',
    href: '/seller',
  },
  {
    icon: <Package className="h-4 w-4" />,
    label: '상품 관리',
    href: '/seller/products',
  },
  {
    icon: <Plus className="h-4 w-4" />,
    label: '상품 등록',
    href: '/seller/products/new',
  },
  {
    icon: <Users className="h-4 w-4" />,
    label: '공구 관리',
    href: '/seller/group-buys',
  },
  {
    icon: <Plus className="h-4 w-4" />,
    label: '공구 등록',
    href: '/seller/group-buys/new',
  },
  {
    icon: <FileText className="h-4 w-4" />,
    label: '주문 관리',
    href: '/seller/orders',
  },
  {
    icon: <BarChart3 className="h-4 w-4" />,
    label: '통계 분석',
    href: '/seller/analytics',
  },
  {
    icon: <User className="h-4 w-4" />,
    label: '프로필',
    href: '/seller/profile',
  },
  {
    icon: <Settings className="h-4 w-4" />,
    label: '스토어 설정',
    href: '/seller/settings',
  },
];

export function SellerSidebar() {
  const pathname = usePathname();
  const { logout } = useLogout();
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

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-72 flex-col bg-bg-100 shadow-sm">
      {/* 상단 프로필 */}
      <div className="flex flex-col items-center gap-3 border-b border-bg-200 px-0 py-8">
        <Image
          src={SELLER_PROFILE.avatar}
          alt={SELLER_PROFILE.name}
          width={56}
          height={56}
          className="h-14 w-14 rounded-full border-2 border-primary-100 shadow-sm"
        />
        <div className="flex flex-col items-center">
          <span className="max-w-[160px] truncate text-base font-semibold text-text-100">
            {SELLER_PROFILE.name}
          </span>
          <span className="max-w-[160px] truncate text-xs text-text-200">
            {SELLER_PROFILE.email}
          </span>
        </div>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 px-0 py-6">
        <ul className="flex flex-col gap-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-7 py-3 text-base font-medium transition-colors',
                    isActive
                      ? 'bg-primary-100 text-primary-300'
                      : 'text-text-200 hover:bg-bg-200 hover:text-text-100',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 로그아웃 버튼 */}
      <div className="mt-auto border-t border-bg-200 px-0 py-6">
        <button
          onClick={handleLogoutClick}
          className="flex w-full items-center gap-3 rounded-md px-7 py-3 text-base font-medium text-text-200 transition-colors hover:bg-bg-200 hover:text-text-100"
          type="button"
        >
          <LogOut className="h-5 w-5" />
          로그아웃
        </button>
      </div>

      {/* 로그아웃 확인 다이얼로그 */}
      <LogoutConfirmDialog
        isOpen={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />
    </aside>
  );
}
