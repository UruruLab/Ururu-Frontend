'use client';

import React from 'react';
import { FullLayout } from '@/components/layout/layouts';
import { HistoryPageHeader } from '@/components/history/HistoryPageHeader';
import { HistoryProductGrid } from '@/components/history/HistoryProductGrid';
import { EmptyHistoryState } from '@/components/history/EmptyHistoryState';
import { Skeleton } from '@/components/ui/skeleton';
import { useHistory } from '@/hooks/useHistory';
import { AuthGuard } from '@/components/auth/AuthGuard';

// 상품 그리드 스켈레톤 컴포넌트
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function HistoryPageContent() {
  const { historyProducts, hasProducts, isClient } = useHistory();

  // 서버사이드 렌더링 중에는 기본 스켈레톤 표시
  if (!isClient) {
    return (
      <FullLayout>
        <div className="container mx-auto max-w-[1280px] px-6 py-8 md:px-9 md:py-10 xl:px-12">
          <div className="space-y-6">
            {/* 헤더 스켈레톤 */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>

            {/* 상품 그리드 스켈레톤 */}
            <ProductGridSkeleton />
          </div>
        </div>
      </FullLayout>
    );
  }

  return (
    <FullLayout>
      <div className="container mx-auto max-w-[1280px] px-6 py-8 md:px-9 md:py-10 xl:px-12">
        <HistoryPageHeader />
        {hasProducts ? <HistoryProductGrid products={historyProducts} /> : <EmptyHistoryState />}
      </div>
    </FullLayout>
  );
}

export default function HistoryPage() {
  return (
    <AuthGuard requireAuth={true}>
      <HistoryPageContent />
    </AuthGuard>
  );
}
