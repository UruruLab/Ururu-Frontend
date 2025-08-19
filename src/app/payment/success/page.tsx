'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NoFooterLayout } from '@/components/layout/layouts';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { usePaymentSuccess } from '@/hooks/usePayment';

interface PaymentResult {
  paymentId: string;
  orderId?: string;
  status?: string;
  paidAt?: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(true);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasProcessed = useRef(false); // 중복 처리 방지

  // 결제 성공 처리 훅 사용
  const { handlePaymentSuccess, isLoading, error: paymentError } = usePaymentSuccess();

  // URL에서 파라미터 추출 (토스페이먼츠가 자동으로 추가하는 파라미터들)
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setError('결제 정보가 올바르지 않습니다.');
      setIsApproving(false);
      return;
    }

    // 이미 처리된 경우 중복 실행 방지
    if (hasProcessed.current) {
      return;
    }
    hasProcessed.current = true;

    // 결제 성공 처리
    const processPayment = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('📤 [Success Page] 결제 승인 처리 시작:', {
            paymentKey,
            orderId,
            amount,
          });
        }

        const parsedAmount = parseInt(amount, 10);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          throw new Error('유효하지 않은 결제 금액입니다.');
        }
        const result = await handlePaymentSuccess(paymentKey, orderId, parsedAmount);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [Success Page] 결제 승인 처리 완료:', result);
        }

        setPaymentResult(result.data);
        toast.success('결제가 완료되었습니다!');
      } catch (error) {
        console.error('결제 승인 처리 실패:', error);
        setError(error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.');
        toast.error('결제 처리 실패');
      } finally {
        setIsApproving(false);
      }
    };

    processPayment();
  }, [paymentKey, orderId, amount, handlePaymentSuccess]);

  if (isApproving || isLoading) {
    return (
      <NoFooterLayout>
        <div className="container mx-auto max-w-4xl px-6 py-8 md:px-8 md:py-12">
          <div className="flex flex-col items-center justify-center py-16">
            <Skeleton className="mb-4 h-8 w-64" />
            <div className="text-center">
              <div className="mb-2 text-lg font-medium text-text-100">결제 승인 중...</div>
              <div className="text-sm text-text-200">잠시만 기다려 주세요.</div>
            </div>
          </div>
        </div>
      </NoFooterLayout>
    );
  }

  if (error || paymentError) {
    return (
      <NoFooterLayout>
        <div className="container mx-auto max-w-4xl px-6 py-8 md:px-8 md:py-12">
          <Card className="rounded-2xl border-0 bg-bg-100 shadow-none">
            <CardContent className="px-6 py-8 text-center">
              <div className="mb-4 text-4xl">❌</div>
              <h1 className="mb-4 text-2xl font-semibold text-text-100">결제 실패</h1>
              <p className="mb-8 text-text-200">{error || paymentError}</p>
              <div className="space-y-4">
                <Button
                  onClick={() => router.push('/cart')}
                  className="hover:bg-primary-400 w-full bg-primary-300"
                >
                  장바구니로 돌아가기
                </Button>
                <Button onClick={() => router.push('/')} variant="outline" className="w-full">
                  홈으로 가기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </NoFooterLayout>
    );
  }

  return (
    <NoFooterLayout>
      <div className="container mx-auto max-w-4xl px-6 py-8 md:px-8 md:py-12">
        <Card className="rounded-2xl border-0 bg-bg-100 shadow-none">
          <CardContent className="px-6 py-8 text-center">
            <div className="mb-4 text-4xl">✅</div>
            <h1 className="mb-4 text-2xl font-semibold text-text-100">결제 완료!</h1>
            <p className="mb-8 text-text-200">결제가 성공적으로 처리되었습니다.</p>

            {paymentResult && (
              <div className="mb-8 space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-text-200">결제ID:</span>
                  <span className="text-text-100">{paymentResult.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-200">주문번호:</span>
                  <span className="text-text-100">{paymentResult.orderId || orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-200">결제금액:</span>
                  <span className="text-text-100">
                    {amount &&
                      (() => {
                        const parsedAmount = parseInt(amount, 10);
                        return isNaN(parsedAmount) || parsedAmount <= 0
                          ? '0'
                          : parsedAmount.toLocaleString();
                      })()}
                    원
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-200">결제상태:</span>
                  <span className="text-text-100">{paymentResult.status || 'PAID'}</span>
                </div>
                {paymentResult.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-text-200">결제시간:</span>
                    <span className="text-text-100">
                      {new Date(paymentResult.paidAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <Button
                onClick={() => router.push('/mypage/orders')}
                className="hover:bg-primary-400 w-full bg-primary-300"
              >
                주문 내역 확인하기
              </Button>
              <Button onClick={() => router.push('/')} variant="outline" className="w-full">
                홈으로 가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </NoFooterLayout>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<Skeleton className="h-screen" />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
