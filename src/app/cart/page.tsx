'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { NoFooterLayout } from '@/components/layout/layouts';
import { CartItem as CartItemComponent, CartSelectAll, CartSummary } from '@/components/cart';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/store';
import { calculateCartSummary } from '@/data/cart';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ErrorDialog } from '@/components/common/ErrorDialog';
import type { CartItem } from '@/types/cart';

// 빈 장바구니 컴포넌트
function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-4 text-6xl">🛒</div>
      <h2 className="mb-2 text-xl font-semibold text-text-100">장바구니가 비어있습니다</h2>
      <p className="text-text-200">상품을 추가해보세요!</p>
    </div>
  );
}

// 장바구니 목록 컴포넌트
function CartList({
  cartItems,
  updatingItems,
  onToggleSelect,
  onUpdateQuantity,
  onRemove,
}: {
  cartItems: CartItem[];
  updatingItems: Set<string>;
  onToggleSelect: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {cartItems.map((item) => (
        <CartItemComponent
          key={item.id}
          item={item}
          isUpdating={updatingItems.has(item.id)}
          onToggleSelect={onToggleSelect}
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

function CartPageContent() {
  // 장바구니 훅을 먼저 호출 (React Hook 규칙)
  const {
    cartItems,
    isLoading,
    isCreatingOrder,
    error,
    updatingItems,
    loadCartItems,
    toggleSelectAll,
    toggleSelectItem,
    updateQuantity,
    removeItem,
    createOrder,
    isAllSelected,
    isPartiallySelected,
    errorDialog,
    closeErrorDialog,
  } = useCart();

  const summary = calculateCartSummary(cartItems);

  const handlePurchase = () => {
    createOrder();
  };

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <NoFooterLayout>
        <div className="container mx-auto max-w-4xl px-6 py-8 md:px-8 md:py-12">
          <h1 className="mb-8 text-center text-2xl font-semibold text-text-100 md:text-3xl">
            장바구니
          </h1>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-20 w-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </NoFooterLayout>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <NoFooterLayout>
        <div className="container mx-auto max-w-4xl px-6 py-8 md:px-8 md:py-12">
          <h1 className="mb-8 text-center text-2xl font-semibold text-text-100 md:text-3xl">
            장바구니
          </h1>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 text-6xl">⚠️</div>
            <h2 className="mb-2 text-xl font-semibold text-text-100">오류가 발생했습니다</h2>
            <p className="mb-4 text-text-200">{error}</p>
            <button
              onClick={loadCartItems}
              className="rounded-lg bg-primary-300 px-4 py-2 text-text-on transition hover:opacity-80"
            >
              다시 시도
            </button>
          </div>
        </div>
      </NoFooterLayout>
    );
  }

  // 빈 장바구니 상태 처리
  if (cartItems.length === 0) {
    return (
      <NoFooterLayout>
        <div className="container mx-auto max-w-4xl px-6 py-8 md:px-8 md:py-12">
          <h1 className="mb-8 text-center text-2xl font-semibold text-text-100 md:text-3xl">
            장바구니
          </h1>
          <EmptyCart />
        </div>
      </NoFooterLayout>
    );
  }

  return (
    <NoFooterLayout>
      <div className="container mx-auto max-w-4xl px-6 py-8 md:px-8 md:py-12">
        {/* 페이지 타이틀 */}
        <h1 className="mb-8 text-center text-2xl font-semibold text-text-100 md:text-3xl">
          장바구니
        </h1>

        <div className="space-y-6">
          {/* 전체 선택 */}
          <CartSelectAll
            isAllSelected={isAllSelected}
            isPartiallySelected={isPartiallySelected}
            onToggleSelectAll={toggleSelectAll}
            selectedCount={summary.selectedCount}
            totalCount={cartItems.length}
          />

          {/* 상품 리스트 */}
          <CartList
            cartItems={cartItems}
            updatingItems={updatingItems}
            onToggleSelect={toggleSelectItem}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />

          {/* 결제 요약 */}
          <CartSummary
            totalProductPrice={summary.totalProductPrice}
            shippingFee={summary.shippingFee}
            totalPrice={summary.totalPrice}
            selectedCount={summary.selectedCount}
            isLoading={isCreatingOrder}
            onPurchase={handlePurchase}
          />
        </div>
      </div>

      {/* 에러 다이얼로그 */}
      <ErrorDialog
        isOpen={errorDialog.isOpen}
        onClose={closeErrorDialog}
        title={errorDialog.title}
        message={errorDialog.message}
      />
    </NoFooterLayout>
  );
}

export default function CartPage() {
  return (
    <AuthGuard requireAuth={true}>
      <CartPageContent />
    </AuthGuard>
  );
}
