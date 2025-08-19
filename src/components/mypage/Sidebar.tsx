'use client';

import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { SidebarItem, LogoutConfirmDialog } from '@/components/common';
import { FORM_STYLES } from '@/constants/form-styles';
import { myPageData } from '@/data/mypage';
import { useLogout } from '@/hooks/useAuth';
import { deleteMe } from '@/services/memberService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export function Sidebar() {
  const { navigationSections } = myPageData;
  const { logout } = useLogout();
  const router = useRouter();

  // 다이얼로그 상태
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
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

  // 회원탈퇴 핸들러
  const handleWithdrawClick = () => {
    setIsWithdrawDialogOpen(true);
    setWithdrawError(null);
  };

  // 실제 탈퇴 API 호출
  const handleWithdrawConfirm = async () => {
    setIsWithdrawing(true);
    try {
      await deleteMe();
      setIsWithdrawDialogOpen(false);
      await logout();
      router.push('/');
    } catch (err: any) {
      setWithdrawError(err?.response?.data?.message || err?.message || '탈퇴에 실패했습니다.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // 아이템에 onClick 핸들러 추가
  const processedSections = navigationSections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      if (item.label === '로그아웃') {
        return { ...item, onClick: handleLogoutClick };
      }
      if (item.label === '회원탈퇴') {
        return { ...item, onClick: handleWithdrawClick };
      }
      return item;
    }),
  }));

  return (
    <>
      <aside className="hidden w-[256px] flex-col gap-6 bg-bg-100 lg:flex">
        {processedSections.map((section, idx) => (
          <React.Fragment key={section.title}>
            <div className="flex w-full flex-col items-start gap-3">
              <div className="mb-1 text-base font-semibold text-text-100">{section.title}</div>
              {section.items.map((item) => (
                <SidebarItem key={item.label} item={item} className={FORM_STYLES.hover.bg200} />
              ))}
            </div>
            {idx < processedSections.length - 1 && <Separator className="my-2 bg-bg-300" />}
          </React.Fragment>
        ))}
      </aside>
      {/* 회원탈퇴 다이얼로그 */}
      <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>회원 탈퇴</DialogTitle>
          </DialogHeader>
          {withdrawError ? (
            <div className="mb-4 text-sm text-red-500">{withdrawError}</div>
          ) : (
            <div className="mb-4 text-text-200">정말 회원 탈퇴를 진행하시겠습니까?</div>
          )}
          <DialogFooter>
            <button
              type="button"
              className={FORM_STYLES.button.pinkOutline}
              onClick={() => setIsWithdrawDialogOpen(false)}
              style={{ background: 'white', color: '#E94057', border: '1px solid #E94057' }}
            >
              취소
            </button>
            <button
              type="button"
              className={FORM_STYLES.button.pinkOutline}
              onClick={handleWithdrawConfirm}
              disabled={isWithdrawing}
            >
              탈퇴하기
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 로그아웃 확인 다이얼로그 */}
      <LogoutConfirmDialog
        isOpen={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />
    </>
  );
}
