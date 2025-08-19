'use client';

import React, { useState } from 'react';
import { RefundStatusTabs, RefundCard } from '@/components/refunds';
import { EmptyState, PageHeader } from '@/components/common';
import { Skeleton } from '@/components/ui/skeleton';
import { useRefunds, useInfiniteScroll } from '@/hooks';
import { RefundStatusFilter } from '@/types/refund';
import { AuthGuard } from '@/components/auth/AuthGuard';

// 필터 탭 스켈레톤 컴포넌트
function RefundStatusTabsSkeleton() {
  return <Skeleton className="h-10 w-20 rounded-lg" />;
}

// 환불 카드 스켈레톤 컴포넌트
function RefundCardSkeleton() {
  return (
    <div className="rounded-lg bg-bg-100 py-6">
      {/* 환불 헤더 스켈레톤 */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="mb-1 h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="hidden md:block">
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
        <div className="mt-3 flex md:hidden">
          <Skeleton className="h-6 w-16" />
        </div>
      </div>

      {/* 환불 상품 스켈레톤 */}
      <div className="space-y-6">
        <div>
          <div className="flex gap-3">
            {/* 상품 이미지 스켈레톤 */}
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-bg-200 bg-bg-100">
              <Skeleton className="h-full w-full" />
            </div>

            {/* 상품 정보 스켈레톤 */}
            <div className="flex flex-1 flex-col justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 환불 요약 스켈레톤 */}
      <div className="mt-4 border-t border-bg-300 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

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

        {/* 필터 탭 스켈레톤 */}
        <RefundStatusTabsSkeleton />

        {/* 환불 카드 스켈레톤들 */}
        <div className="space-y-12">
          {Array.from({ length: 3 }).map((_, index) => (
            <RefundCardSkeleton key={index} />
          ))}
        </div>
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
            {loadingMore && <RefundCardSkeleton />}
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
