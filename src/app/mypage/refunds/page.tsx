'use client';

import React, { useState } from 'react';
import { RefundStatusTabs, RefundCard } from '@/components/refunds';
import { EmptyState, PageHeader } from '@/components/common';
import { Skeleton } from '@/components/ui/skeleton';
import { useRefunds, useInfiniteScroll } from '@/hooks';
import { RefundStatusFilter } from '@/types/refund';
import { AuthGuard } from '@/components/auth/AuthGuard';

function RefundsPageContent() {
  const [activeFilter, setActiveFilter] = useState<RefundStatusFilter>('all');
  const { refunds, summary, loading, loadingMore, error, hasMore, loadMore } =
    useRefunds(activeFilter);

  // 무한 스크롤 설정
  useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    loading: loadingMore,
  });

  const handleFilterChange = (filter: RefundStatusFilter) => {
    setActiveFilter(filter);
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-6 py-4 md:py-6">
        <PageHeader title="취소/환불 내역" />
        <Skeleton className="h-full" />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-6 py-4 md:py-6">
        <PageHeader title="취소/환불 내역" />
        <EmptyState title="데이터를 불러오는 중 오류가 발생했습니다." description={error} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 py-4 md:py-6">
      {/* 페이지 헤더 */}
      <PageHeader title="취소/환불 내역" />

      {/* 상태별 필터 탭 */}
      <RefundStatusTabs
        summary={summary}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* 취소/환불 내역 리스트 */}
      <div className="space-y-12">
        {refunds.length === 0 ? (
          <EmptyState title="취소/환불 내역이 없습니다." description="안전한 쇼핑을 도와드려요!" />
        ) : (
          <>
            {refunds.map((refund) => (
              <RefundCard key={refund.id} refund={refund} />
            ))}
            {loadingMore && <Skeleton className="h-full" />}
          </>
        )}
      </div>
    </div>
  );
}

export default function RefundsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <RefundsPageContent />
    </AuthGuard>
  );
}
