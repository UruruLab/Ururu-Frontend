'use client';

import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { SidebarItem, LogoutConfirmDialog } from '@/components/common';
import { myPageData } from '@/data/mypage';
import { useLogout } from '@/hooks/useAuth';

export function MobileSidebarList() {
  const { navigationSections } = myPageData;
  const { logout } = useLogout();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 로그아웃 핸들러
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

  // 아이템에 onClick 핸들러 추가
  const processedSections = navigationSections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      if (item.label === '로그아웃') {
        return { ...item, onClick: handleLogoutClick };
      }
      return item;
    }),
  }));

  return (
    <aside className="mt-4 flex w-full flex-col gap-6 bg-bg-100 lg:hidden">
      {processedSections.map((section, idx) => (
        <React.Fragment key={section.title}>
          <div className="flex w-full flex-col items-start gap-3">
            <div className="mb-1 text-base font-semibold text-text-100">{section.title}</div>
            {section.items.map((item) => (
              <SidebarItem key={item.label} item={item} />
            ))}
          </div>
          {idx < processedSections.length - 1 && <Separator className="my-2 bg-bg-300" />}
        </React.Fragment>
      ))}

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
