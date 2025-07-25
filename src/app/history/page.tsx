'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CustomLayout } from '@/components/layout/layouts';
import { HistoryPageHeader, HistoryProductGrid, EmptyHistoryState } from '@/components/history';
import { useHistory } from '@/hooks';
import { useAuthStore } from '@/store';
import { AuthGuard } from '@/components/auth/AuthGuard';

function HistoryPageContent() {
  const { historyProducts, hasProducts, isClient } = useHistory();

  // 서버사이드 렌더링 중에는 로딩 상태 표시
  if (!isClient) {
    return (
      <CustomLayout
        showTopBar={true}
        showSearchBar={true}
        showMainNav={true}
        showFooter={true}
        showBottomNav={true}
      >
        <div className="mx-auto w-full max-w-[1280px] px-6 py-8 md:px-9 md:py-10 xl:px-12">
          <HistoryPageHeader />
          <div className="flex items-center justify-center py-20">
            <div className="text-sm text-text-200">로딩 중...</div>
          </div>
        </div>
      </CustomLayout>
    );
  }

  return (
    <CustomLayout
      showTopBar={true}
      showSearchBar={true}
      showMainNav={true}
      showFooter={true}
      showBottomNav={true}
    >
      <div className="mx-auto w-full max-w-[1280px] px-6 py-8 md:px-9 md:py-10 xl:px-12">
        <HistoryPageHeader />

        {hasProducts ? <HistoryProductGrid products={historyProducts} /> : <EmptyHistoryState />}
      </div>
    </CustomLayout>
  );
}

export default function HistoryPage() {
  return (
    <AuthGuard requireAuth={true}>
      <HistoryPageContent />
    </AuthGuard>
  );
}