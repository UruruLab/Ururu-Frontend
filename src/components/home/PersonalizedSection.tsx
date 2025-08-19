'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/types/product';
import { FORM_STYLES } from '@/constants/form-styles';
import { CenteredSectionHeader } from '@/components/common/CenteredSectionHeader';
import { useAiPersonalizedProducts } from '@/hooks/useAiPersonalizedProducts';

interface PersonalizedSectionProps {
  products?: Product[];
  className?: string;
}

// ProductGridSkeleton 컴포넌트 정의
function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {/* 모바일/태블릿: 가로 스크롤 스켈레톤 */}
      <div className="relative md:hidden">
        <div
          className="scrollbar-hide flex gap-4 overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="w-60 flex-shrink-0">
              <div className="rounded-lg p-4">
                <div className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 데스크탑: 그리드 스켈레톤 */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="rounded-lg p-4">
              <div className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function PersonalizedSection({
  products: propProducts,
  className = '',
}: PersonalizedSectionProps) {
  const { products: apiProducts, loading, error } = useAiPersonalizedProducts();

  // API 결과가 있으면 API 결과를 사용, 없으면 fallback 데이터 사용
  const products = loading ? [] : apiProducts.length > 0 ? apiProducts : propProducts || [];
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 페이지네이션 상태
  const PAGE_SIZE = 8;
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const pagedProducts = products.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  // products가 바뀔 때마다 currentPage를 0으로 리셋
  useEffect(() => {
    setCurrentPage(0);
  }, [products]);

  const handleNextPage = () => {
    if (currentPage + 1 >= totalPages) {
      setCurrentPage(0);
    } else {
      setCurrentPage((prev) => prev + 1);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }
  };

  // 에러가 있으면 에러 메시지 표시
  if (error) {
    return (
      <section className={`w-full ${className}`}>
        <CenteredSectionHeader
          title="취향 맞춤"
          description="회원님만을 위한 맞춤 상품을 추천해드려요"
          className="mb-6"
        />
        <div className="flex flex-col items-center justify-center py-8 md:py-12">
          <div className="mb-4 text-6xl">💄</div>
          <h2 className="mb-2 text-xl font-semibold text-text-100">추천 상품을 찾지 못했습니다</h2>
          <p className="text-text-200">곧 맞춤 상품을 찾아올게요!</p>
        </div>
      </section>
    );
  }

  // 로딩 중이면 스켈레톤 표시
  if (loading) {
    return (
      <section className={`w-full ${className}`}>
        <CenteredSectionHeader
          title="취향 맞춤"
          description="회원님만을 위한 맞춤 상품을 추천해드려요"
          className="mb-6"
        />
        <ProductGridSkeleton count={8} />
      </section>
    );
  }

  // 상품이 없으면 빈 상태 표시
  if (!loading && !products.length) {
    return (
      <section className={`w-full ${className}`}>
        <CenteredSectionHeader
          title="취향 맞춤"
          description="회원님만을 위한 맞춤 상품을 추천해드려요"
          className="mb-6"
        />
        <div className="flex flex-col items-center justify-center py-8 md:py-12">
          <div className="mb-4 text-6xl">💄</div>
          <h2 className="mb-2 text-xl font-semibold text-text-100">추천 상품을 찾지 못했습니다</h2>
          <p className="text-text-200">곧 맞춤 상품을 찾아올게요!</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`w-full ${className}`}>
      {/* 섹션 헤더 */}
      <CenteredSectionHeader
        title="취향 맞춤"
        description="회원님만을 위한 맞춤 상품을 추천해드려요"
        className="mb-6"
      />

      {/* 모바일/태블릿: 가로 스크롤 */}
      <div className="relative md:hidden">
        <div
          ref={scrollContainerRef}
          className="scrollbar-hide flex gap-4 overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {pagedProducts.map((product) => (
            <div key={product.id} className="w-60 flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* 데스크탑: 그리드 레이아웃 */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {pagedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* 더보기/페이지 버튼 */}
        {totalPages > 1 && (
          <div className="mt-8 text-center">
            <Button className={FORM_STYLES.button.pinkOutline} onClick={handleNextPage}>
              {`AI 추천 더보기 ${currentPage + 1} | ${totalPages}`}
            </Button>
          </div>
        )}
      </div>

      {/* 모바일: 더보기/페이지 버튼 */}
      {totalPages > 1 && (
        <div className="mt-8 text-center md:hidden">
          <Button className={FORM_STYLES.button.pinkOutline} onClick={handleNextPage}>
            {`AI 추천 더보기 ${currentPage + 1} | ${totalPages}`}
          </Button>
        </div>
      )}
    </section>
  );
}
