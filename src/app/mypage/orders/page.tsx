'use client';

import React, { useState, useMemo } from 'react';
import { OrderStatusTabs, OrderCard } from '@/components/orders';
import { EmptyState, PageHeader } from '@/components/common';
import { OrderStatusFilter } from '@/types/order';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useOrders } from '@/hooks/useOrders';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Skeleton } from '@/components/ui/skeleton';

// 통계 정보 스켈레톤 컴포넌트
function SummarySkeleton() {
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="flex justify-center gap-4 md:gap-16">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center">
            <Skeleton className="h-8 w-12 md:h-12 md:w-16" />
            <Skeleton className="mt-2 h-4 w-20 md:h-6 md:w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

// 주문 카드 스켈레톤 컴포넌트
function OrderCardSkeleton() {
  return (
    <div className="rounded-lg bg-bg-100 p-0">
      {/* 주문 헤더 스켈레톤 */}
      <div className="mb-4 flex flex-col gap-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* 주문 상품들 스켈레톤 */}
      <div className="space-y-6">
        <div>
          {/* 상품별 뱃지 스켈레톤 */}
          <div className="mb-2 flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>

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
              {/* 모바일 리뷰 버튼 스켈레톤 */}
              <div className="mt-3 flex items-center lg:hidden">
                <Skeleton className="h-8 w-16" />
              </div>
            </div>

            {/* 데스크톱 리뷰 버튼 스켈레톤 */}
            <div className="hidden items-center lg:flex">
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* 주문 요약 스켈레톤 */}
      <div className="mt-4 border-t border-bg-300 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

function OrdersPageContent() {
  const [activeFilter, setActiveFilter] = useState<OrderStatusFilter>('all');
  const { orders, summary, loading, loadingMore, error, hasMore, loadMore } =
    useOrders(activeFilter);

  // 무한 스크롤 감지
  const sentinelRef = useInfiniteScroll({
    hasMore,
    loading: loadingMore,
    onLoadMore: loadMore,
  });

  // activeFilter에 맞는 주문만 필터링
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (order.status === 'failed') return false;

      if (activeFilter === 'all') return true;

      return order.status === activeFilter;
    });
  }, [orders, activeFilter]);

  const handleFilterChange = (filter: OrderStatusFilter) => {
    setActiveFilter(filter);
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-6 py-4 md:py-6">
        <PageHeader title="주문/배송 조회" />
        <SummarySkeleton />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-6 py-4 md:py-6">
      <PageHeader title="주문/배송 조회" />

      <div className="flex flex-col items-center gap-6 py-4">
        <div className="flex justify-center gap-4 md:gap-16">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-text-100 md:text-4xl">
              {summary.inProgress}
            </span>
            <span className="mt-2 whitespace-nowrap text-center text-sm font-medium text-text-200 md:text-lg">
              공구 진행중
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-text-100 md:text-4xl">
              {summary.confirmed}
            </span>
            <span className="mt-2 whitespace-nowrap text-center text-sm font-medium text-text-200 md:text-lg">
              공구 확정
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-text-100 md:text-4xl">
              {summary.refundPending}
            </span>
            <span className="mt-2 whitespace-nowrap text-center text-sm font-medium text-text-200 md:text-lg">
              환불 대기중
            </span>
          </div>
        </div>
      </div>

      <OrderStatusTabs
        summary={summary}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      <div className="space-y-12">
        {filteredOrders.length === 0 ? (
          <EmptyState title="주문 내역이 없습니다." description="첫 주문을 시작해보세요!" />
        ) : (
          <>
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}

            <div ref={sentinelRef} className="h-0" />

            {loadingMore && (
              <div className="space-y-12">
                {Array.from({ length: 2 }).map((_, index) => (
                  <OrderCardSkeleton key={index} />
                ))}
              </div>
            )}

            {!hasMore && filteredOrders.length > 0 && (
              <div className="p-4 text-center text-gray-400">모든 주문 내역을 확인했습니다.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard requireAuth={true}>
      <OrdersPageContent />
    </AuthGuard>
  );
}
