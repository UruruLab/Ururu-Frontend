'use client';

import React from 'react';
import type { Product } from '@/types/product';
import { CenteredSectionHeader } from '@/components/common/CenteredSectionHeader';
import { ProductRankingItem } from './ProductRankingItem';
import { Skeleton } from '@/components/ui/skeleton';

interface RealtimeBestSectionProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  className?: string;
}

// 실시간 베스트 스켈레톤 컴포넌트
function RealtimeBestSkeleton({ variant }: { variant: 'mobile' | 'desktop' }) {
  const isMobile = variant === 'mobile';

  return (
    <div
      className={`flex items-center rounded-xl bg-bg-100 ${isMobile ? 'gap-3' : 'flex-1 gap-4'}`}
    >
      {/* 랭킹 번호 스켈레톤 */}
      <div
        className={`flex flex-shrink-0 items-center justify-center text-lg font-bold text-text-100 ${
          isMobile ? 'h-8 w-4' : 'h-10 w-5'
        }`}
      >
        <Skeleton className="h-4 w-3" />
      </div>

      {/* 상품 이미지 스켈레톤 */}
      <div
        className={`relative flex-shrink-0 overflow-hidden rounded-lg ${
          isMobile ? 'h-14 w-14' : 'h-20 w-20'
        }`}
      >
        <Skeleton className="h-full w-full" />
      </div>

      {/* 상품 정보 스켈레톤 */}
      <div className="min-w-0 flex-1">
        <Skeleton className="mb-1 h-5 w-32" />
        <Skeleton className="mb-1 h-4 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-8" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  );
}

export function RealtimeBestSection({
  products,
  loading = false,
  error,
  className = '',
}: RealtimeBestSectionProps) {
  return (
    <section className={`w-full ${className} flex h-full flex-col`}>
      {/* 섹션 헤더 */}
      <CenteredSectionHeader title="실시간 베스트" className="mb-6" />

      {loading ? (
        <>
          {/* 모바일/태블릿: 세로 리스트 스켈레톤 */}
          <div className="block space-y-4 md:hidden">
            {Array.from({ length: 3 }).map((_, index) => (
              <RealtimeBestSkeleton key={index} variant="mobile" />
            ))}
          </div>

          {/* 데스크탑: 세로 리스트 스켈레톤 */}
          <div className="hidden h-full flex-col md:flex">
            <div className="flex h-full flex-col gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <RealtimeBestSkeleton key={index} variant="desktop" />
              ))}
            </div>
          </div>
        </>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-8 md:py-12">
          <div className="mb-4 text-6xl">🏅</div>
          <h2 className="mb-2 text-xl font-semibold text-text-100">
            상품을 찾지 못했습니다
          </h2>
          <p className="text-text-200">잠시 후 다시 시도해주세요!</p>
        </div>
      ) : products.length > 0 ? (
        <>
          {/* 모바일/태블릿: 세로 리스트 */}
          <div className="block space-y-4 md:hidden">
            {products.map((product, index) => (
              <ProductRankingItem
                key={product.id}
                product={product}
                index={index}
                variant="mobile"
              />
            ))}
          </div>

          {/* 데스크탑: 세로 리스트 */}
          <div className="hidden h-full flex-col md:flex">
            <div className="flex h-full flex-col gap-4">
              {products.map((product, index) => (
                <ProductRankingItem
                  key={product.id}
                  product={product}
                  index={index}
                  variant="desktop"
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 md:py-12">
          <div className="mb-4 text-6xl">🏅</div>
          <h2 className="mb-2 text-xl font-semibold text-text-100">상품을 찾지 못했습니다</h2>
          <p className="text-text-200">곧 새로운 베스트 상품을 만나보세요!</p>
        </div>
      )}
    </section>
  );
}
