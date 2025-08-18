'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { NoFooterLayout } from '@/components/layout/layouts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { OrderItem, PointUsage, PaymentSummary, DeliveryAddress } from '@/components/order';
import { PaymentWindow } from '@/components/payment/PaymentWindow';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Skeleton } from '@/components/ui/skeleton';
import { getShippingAddresses } from '@/services/memberService';
import { toast } from 'sonner';
import type { CartItem as CartItemType } from '@/types/cart';
import type { ApiCreateOrderResponse, ShippingAddress } from '@/types/api';

// 주문 페이지 로딩 상태 컴포넌트
function OrderPageLoading() {
  return (
    <NoFooterLayout>
      <div className="container mx-auto max-w-4xl px-6 py-8 md:px-8 md:py-12">
        {/* 페이지 타이틀 */}
        <h1 className="mb-8 text-center text-2xl font-semibold text-text-100 md:text-3xl">
          주문/결제
        </h1>

        <div className="space-y-6">
          {/* 스켈레톤 UI */}
          <div className="space-y-6">
            <Skeleton className="h-32 rounded-2xl bg-bg-100 p-6" />
            <Skeleton className="h-40 rounded-2xl bg-bg-100 p-6" />
            <Skeleton className="h-24 rounded-2xl bg-bg-100 p-6" />
          </div>
        </div>
      </div>
    </NoFooterLayout>
  );
}

// UUID 형태 검증 함수
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function OrderPageContent() {
  // URL에서 orderId 추출
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  // 초기화 여부 체크 (React StrictMode 대응)
  const hasInitialized = useRef(false);

  // 주문 검증 상태
  const [isValidating, setIsValidating] = useState(true);
  const [isValidOrder, setIsValidOrder] = useState(false);

  // 주문 데이터 상태
  const [orderData, setOrderData] = useState<ApiCreateOrderResponse | null>(null);

  // 배송지 관련 상태
  const [shippingAddresses, setShippingAddresses] = useState<ShippingAddress[] | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'existing' | 'new'>('existing');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('1');
  const [newAddressData, setNewAddressData] = useState({
    addressName: '',
    isDefault: true,
    phone: '',
    zonecode: '',
    address1: '',
    address2: '',
  });

  // 배송지 타입 변경 시 처리
  const handleDeliveryTypeChange = (type: 'existing' | 'new') => {
    setDeliveryType(type);

    if (type === 'new') {
      // "신규 배송지"로 변경될 때 폼 초기화
      setNewAddressData({
        addressName: '',
        isDefault: false,
        phone: '',
        zonecode: '',
        address1: '',
        address2: '',
      });
    } else if (type === 'existing' && shippingAddresses && shippingAddresses.length > 0) {
      // "기존 배송지"로 변경될 때 기본 배송지 또는 첫 번째 배송지로 자동 선택
      const defaultAddress = shippingAddresses.find((addr) => addr.is_default);
      const targetAddress = defaultAddress || shippingAddresses[0];

      setSelectedAddressId(targetAddress.id.toString());
      setNewAddressData({
        addressName: targetAddress.label,
        isDefault: targetAddress.is_default,
        phone: targetAddress.phone,
        zonecode: targetAddress.zonecode,
        address1: targetAddress.address1,
        address2: targetAddress.address2,
      });
    }
  };

  // 기존 배송지 선택 시 폼 데이터 자동 업데이트
  const handleAddressIdChange = (id: string) => {
    setSelectedAddressId(id);
    const selectedAddress = shippingAddresses?.find((addr) => addr.id.toString() === id);
    if (selectedAddress) {
      setNewAddressData({
        addressName: selectedAddress.label,
        isDefault: selectedAddress.is_default,
        phone: selectedAddress.phone,
        zonecode: selectedAddress.zonecode,
        address1: selectedAddress.address1,
        address2: selectedAddress.address2,
      });
    }
  };

  // 포인트 관련 상태
  const [pointAmount, setPointAmount] = useState<number>(0);

  // 결제 성공 처리 함수
  const handlePaymentSuccess = (paymentKey: string, orderId: string, amount: number) => {
    // 결제 완료 시 이탈 경고 제거
    if ((window as any).orderPageBeforeUnload) {
      window.removeEventListener('beforeunload', (window as any).orderPageBeforeUnload);
      (window as any).orderPageBeforeUnload = null;
    }

    // 결제 성공 시 성공 페이지로 이동
    router.push(`/payment/success?paymentKey=${paymentKey}&orderId=${orderId}&amount=${amount}`);
  };

  // 페이지 이탈 시 경고 메시지
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '페이지를 나가면 주문 정보가 사라집니다. 계속하시겠습니까?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // 결제 완료 시 이벤트 리스너 제거용으로 전역에 저장
    (window as any).orderPageBeforeUnload = handleBeforeUnload;

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // orderId 유효성 검증 및 주문 데이터 로드
  useEffect(() => {
    const validateAndLoadOrder = async () => {
      // React StrictMode로 인한 중복 실행 방지
      if (hasInitialized.current) {
        return;
      }
      hasInitialized.current = true;

      if (!orderId || !isValidUUID(orderId)) {
        // 유효하지 않은 orderId인 경우 404로 리다이렉트
        router.replace('/404');
        return;
      }

      try {
        // sessionStorage에서 주문 데이터 읽기
        const storedOrderData = sessionStorage.getItem('orderData');

        if (!storedOrderData) {
          // 주문 데이터가 없으면 404로 리다이렉트
          router.replace('/404');
          return;
        }

        const parsedOrderData = JSON.parse(storedOrderData);

        // orderId 일치 여부 확인
        if (parsedOrderData.orderId !== orderId) {
          router.replace('/404');
          return;
        }

        setOrderData(parsedOrderData);
        setIsValidOrder(true);

        // 배송지 목록 로드
        try {
          setIsLoadingAddresses(true);
          const addressResponse = await getShippingAddresses();

          const addresses = addressResponse.addresses || [];
          setShippingAddresses(addresses);

          if (addresses.length === 0) {
            // 등록된 배송지가 없으면 "신규 배송지"로 전환
            setDeliveryType('new');
          } else {
            // 기본 배송지가 있으면 자동 선택
            const defaultAddress = addresses.find((addr: ShippingAddress) => addr.is_default);
            const targetAddress = defaultAddress || addresses[0];

            setSelectedAddressId(targetAddress.id.toString());
            setNewAddressData({
              addressName: targetAddress.label,
              isDefault: targetAddress.is_default,
              phone: targetAddress.phone,
              zonecode: targetAddress.zonecode,
              address1: targetAddress.address1,
              address2: targetAddress.address2,
            });
            setDeliveryType('existing');
          }
        } catch (addressError) {
          console.error('배송지 목록 로드 실패:', addressError);
          // 배송지 로드 실패 시 "신규 배송지" 모드로 전환
          setDeliveryType('new');
        } finally {
          setIsLoadingAddresses(false);
        }
      } catch (error) {
        console.error('주문 데이터 로드 실패:', error);
        router.replace('/404');
      } finally {
        setIsValidating(false);
      }
    };

    validateAndLoadOrder();

    // cleanup 함수 - 컴포넌트 언마운트 시 초기화 상태 리셋
    return () => {
      hasInitialized.current = false;
    };
  }, [orderId, router]);

  // 검증 중이거나 주문 데이터가 없는 경우 로딩 화면
  if (isValidating || !orderData) {
    return <OrderPageLoading />;
  }

  // 가격 계산 (API 응답 데이터 사용)
  const totalProductPrice = orderData.totalAmount - orderData.shippingFee;
  const shippingFee = orderData.shippingFee;
  const finalPrice = orderData.totalAmount - pointAmount;

  // 포인트 전액 사용
  const handleUseAllPoints = () => {
    setPointAmount(Math.min(orderData.availablePoints, finalPrice));
  };

  // 포인트 입력 핸들러 (보유 포인트 초과 방지)
  const handlePointAmountChange = (amount: number) => {
    // PointUsage 컴포넌트에서 이미 제한 처리했으므로 간단하게 설정
    setPointAmount(Math.max(0, Math.min(amount, orderData.availablePoints)));
  };

  // 결제하기
  const handlePayment = () => {
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
            shippingAddresses={shippingAddresses}
            isLoading={isLoadingAddresses}
            newAddressData={newAddressData}
            onDeliveryTypeChange={handleDeliveryTypeChange}
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
                {orderData.orderItems.map((item, index) => (
                  <OrderItem key={`${item.groupbuyOptionId}-${index}`} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 포인트 사용 */}
          <Card className="rounded-2xl border-0 bg-bg-100 shadow-none">
            <CardContent className="px-0 py-4 md:py-6">
              <h2 className="mb-4 text-lg font-semibold text-text-100">포인트 사용</h2>

              <PointUsage
                availablePoint={orderData.availablePoints}
                pointAmount={pointAmount}
                onPointAmountChange={handlePointAmountChange}
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

          {/* 결제 */}
          <PaymentWindow
            orderId={orderId}
            usePoints={pointAmount}
            phone={
              deliveryType === 'new'
                ? newAddressData.phone
                : shippingAddresses?.find((addr) => addr.id.toString() === selectedAddressId)
                    ?.phone || ''
            }
            zonecode={
              deliveryType === 'new'
                ? newAddressData.zonecode
                : shippingAddresses?.find((addr) => addr.id.toString() === selectedAddressId)
                    ?.zonecode || ''
            }
            address1={
              deliveryType === 'new'
                ? newAddressData.address1
                : shippingAddresses?.find((addr) => addr.id.toString() === selectedAddressId)
                    ?.address1 || ''
            }
            address2={
              deliveryType === 'new'
                ? newAddressData.address2
                : shippingAddresses?.find((addr) => addr.id.toString() === selectedAddressId)
                    ?.address2 || ''
            }
            amount={finalPrice}
            orderName={
              orderData.orderItems.length > 0
                ? orderData.orderItems.length === 1
                  ? orderData.orderItems[0].productName
                  : `${orderData.orderItems[0].productName} 외 ${orderData.orderItems.length - 1}건`
                : '주문상품'
            }
            onPaymentSuccess={handlePaymentSuccess}
          />
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
