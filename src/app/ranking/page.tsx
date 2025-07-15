'use client';

import React from 'react';
import { FullLayout } from '@/components/layout';
import { CategorySelector } from '@/components/ranking';
import { ProductGrid } from '@/components/product';
import { useRanking } from '@/hooks/useRanking';

export default function RankingPage() {
  const { categories, selectedCategory, rankingProducts, loading, error, handleCategoryChange } =
    useRanking();

  return (
    <FullLayout>
      <div className="container mx-auto max-w-[1280px] px-6 py-8 md:px-9 md:py-10 xl:px-12">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="mb-6 text-2xl font-semibold text-text-100 md:text-3xl">랭킹 TOP 100</h1>
          <p className="text-sm text-text-200 md:text-base">
            인기 상품들을 카테고리별로 확인해보세요!
          </p>
        </div>

        {/* 카테고리 선택 */}
        <div className="mb-8">
          <CategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* 랭킹 상품 그리드 */}
        <div className="mb-8">
          {loading && <div className="text-center text-sm text-text-200">로딩 중...</div>}
          {error && <div className="text-center text-sm text-red-400">{error}</div>}
          {!loading && !error && (
            <ProductGrid
              products={rankingProducts.map((item) => item.product)}
              showRanking={true}
            />
          )}
        </div>

        {/* 빈 상태 처리 */}
        {!loading && !error && rankingProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 text-6xl">🏆</div>
            <h2 className="mb-2 text-xl font-semibold text-text-100">랭킹 데이터가 없습니다</h2>
            <p className="text-text-200">다른 카테고리를 선택해보세요!</p>
          </div>
        )}
      </div>
    </FullLayout>
  );
}
