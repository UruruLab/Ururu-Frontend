'use client';

import React, { useState } from 'react';
import { NoFooterLayout } from '@/components/layout/layouts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { OrderItem, PointUsage, PaymentSummary, DeliveryAddress } from '@/components/order';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { mockCartData } from '@/data/cart';
import { mockAddressData } from '@/data/address';
import type { CartItem as CartItemType } from '@/types/cart';

function OrderPageContent() {
  // 배송지 관련 상태
  const [deliveryType, setDeliveryType] = useState<'existing' | 'new'>('new');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('1');
  const [newAddressData, setNewAddressData] = useState({
    addressName: '',
    isDefault: true,
    phone: '',
    zonecode: '',
    address1: '',
    address2: '',
    addressDetail: '',
  });

  // 기존 배송지 선택 시 폼 데이터 자동 업데이트
  const handleAddressIdChange = (id: string) => {
    setSelectedAddressId(id);
    const selectedAddress = mockAddressData[Number(id)];
    if (selectedAddress) {
      setNewAddressData({
        addressName: selectedAddress.addressName,
        isDefault: selectedAddress.isDefault,
        phone: selectedAddress.phone,
        zonecode: selectedAddress.zonecode,
        address1: selectedAddress.address1,
        address2: selectedAddress.address2,
        addressDetail: selectedAddress.addressDetail,
      });
    }
  };

  // 포인트 관련 상태
  const [pointAmount, setPointAmount] = useState<number>(0);
  const availablePoint = 12345; // 보유 포인트

  // 주문 상품 (장바구니에서 선택된 상품들)
  const orderItems: CartItemType[] = mockCartData.slice(0, 2); // 예시로 2개 상품

  // 가격 계산
  const totalProductPrice = orderItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const shippingFee = totalProductPrice >= 50000 ? 0 : 3000;
  const finalPrice = totalProductPrice + shippingFee - pointAmount;

  // 포인트 전액 사용
  const handleUseAllPoints = () => {
    setPointAmount(Math.min(availablePoint, finalPrice));
  };

  // 결제하기
  const handlePayment = () => {
    console.log('결제하기 클릭');
    // TODO: 결제 플로우 구현
  };

  return (
    <NoFooterLayout>
      <div className="container mx-auto max-w-4xl px-6 py-8 md:px-8 md:py-12">
        {/* 페이지 타이틀 */}
        <h1 className="mb-8 text-center text-2xl font-semibold text-text-100 md:text-3xl">
          주문/결제
        </h1>

        <div className="space-y-6">
          {/* 배송지 정보 */}
          <DeliveryAddress
            deliveryType={deliveryType}
            selectedAddressId={selectedAddressId}
            newAddressData={newAddressData}
            onDeliveryTypeChange={setDeliveryType}
            onAddressIdChange={handleAddressIdChange}
            onNewAddressChange={(field, value) =>
              setNewAddressData((prev) => ({ ...prev, [field]: value }))
            }
          />

          {/* 주문 상품 */}
          <Card className="rounded-2xl border-0 bg-bg-100 shadow-none">
            <CardContent className="px-0 py-4 md:py-6">
              <h2 className="mb-4 text-lg font-semibold text-text-100">주문 상품</h2>

              <div className="space-y-4">
                {orderItems.map((item) => (
                  <OrderItem key={item.id} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 포인트 사용 */}
          <Card className="rounded-2xl border-0 bg-bg-100 shadow-none">
            <CardContent className="px-0 py-4 md:py-6">
              <h2 className="mb-4 text-lg font-semibold text-text-100">포인트 사용</h2>

              <PointUsage
                availablePoint={availablePoint}
                pointAmount={pointAmount}
                onPointAmountChange={setPointAmount}
                onUseAllPoints={handleUseAllPoints}
              />
            </CardContent>
          </Card>

          {/* 최종 결제 금액 */}
          <PaymentSummary
            totalProductPrice={totalProductPrice}
            pointAmount={pointAmount}
            shippingFee={shippingFee}
            finalPrice={finalPrice}
          />

          {/* 결제하기 버튼 */}
          <Button
            onClick={handlePayment}
            className="h-12 w-full rounded-lg bg-primary-300 text-sm font-medium text-text-on transition hover:opacity-80 focus:ring-primary-300 active:opacity-90 md:h-14 md:text-base"
          >
            결제하기
          </Button>
        </div>
      </div>
    </NoFooterLayout>
  );
}

export default function OrderPage() {
  return (
    <AuthGuard requireAuth={true}>
      <OrderPageContent />
    </AuthGuard>
  );
}
