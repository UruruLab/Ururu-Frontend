import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { CartItem } from '@/types/cart';
import {
  getCart,
  updateCartQuantity,
  deleteCartItem,
  createOrderFromCart,
} from '@/services/cartService';
import { convertApiCartItemsToCartItems } from '@/lib/cart-utils';

export const useCart = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // 에러 다이얼로그 상태
  const [errorDialog, setErrorDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
  });

  // 장바구니 데이터 로드
  const loadCartItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getCart();
      if (response.success) {
        const convertedItems = convertApiCartItemsToCartItems(response.data.cartItems);
        setCartItems(convertedItems);
      } else {
        setError('장바구니를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
      setError(errorMessage || '장바구니를 불러오는데 실패했습니다.');
      // TODO: 에러 로깅 서비스 연동
      console.error('장바구니 조회 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 장바구니 로드
  useEffect(() => {
    loadCartItems();
  }, [loadCartItems]);

  // 전체 선택/해제
  const toggleSelectAll = useCallback(() => {
    const allSelected = cartItems.every((item) => item.isSelected);
    setCartItems((prev) => prev.map((item) => ({ ...item, isSelected: !allSelected })));
  }, [cartItems]);

  // 개별 상품 선택/해제
  const toggleSelectItem = useCallback((itemId: string) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, isSelected: !item.isSelected } : item)),
    );
  }, []);

  // 수량 변경
  const updateQuantity = useCallback(
    async (itemId: string, newQuantity: number) => {
      if (newQuantity < 1) return;

      // 현재 아이템 찾기
      const currentItem = cartItems.find((item) => item.id === itemId);
      if (!currentItem) return;

      const quantityChange = newQuantity - currentItem.quantity;
      if (quantityChange === 0) return;

      // 로딩 상태 시작
      setUpdatingItems((prev) => new Set(prev).add(itemId));

      try {
        // 즉시 UI 업데이트 (낙관적 업데이트)
        setCartItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)),
        );

        // API 호출
        const response = await updateCartQuantity(Number(itemId), quantityChange);

        if (!response.success) {
          // API 실패시 이전 상태로 복원
          setCartItems((prev) =>
            prev.map((item) =>
              item.id === itemId ? { ...item, quantity: currentItem.quantity } : item,
            ),
          );
          throw new Error(response.message || '수량 변경에 실패했습니다.');
        }
      } catch (error: any) {
        // 에러 메시지 생성
        let errorMessage = '수량 변경에 실패했습니다.';
        let errorTitle = '수량 변경 실패';

        if (error?.status === 409) {
          // 409 에러 (개인 구매 제한 초과)의 경우
          errorTitle = '구매 제한 초과';

          // 서버 메시지 처리
          if (error.message) {
            if (error.message.includes('%d')) {
              // %d를 현재 수량으로 치환 (현재 수량이 최대 개수일 가능성이 높음)
              errorMessage = error.message.replace('%d', currentItem.quantity.toString());
            } else {
              // 서버 메시지에서 숫자를 추출 시도
              const numberMatch = error.message.match(/최대\s*(\d+)개/);
              if (numberMatch) {
                errorMessage = error.message;
              } else {
                // 숫자를 찾을 수 없으면 현재 수량 사용
                errorMessage = `개인 구매 제한을 초과했습니다. 최대 ${currentItem.quantity}개까지 구매 가능합니다.`;
              }
            }
          } else {
            errorMessage = `개인 구매 제한을 초과했습니다. 최대 ${currentItem.quantity}개까지 구매 가능합니다.`;
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }

        // 에러 다이얼로그 표시
        setErrorDialog({
          isOpen: true,
          title: errorTitle,
          message: errorMessage,
        });

        // 에러 발생시 전체 장바구니 데이터 다시 로드
        loadCartItems();
      } finally {
        // 로딩 상태 종료
        setUpdatingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    },
    [cartItems, loadCartItems],
  );

  // 상품 삭제
  const removeItem = useCallback(
    async (itemId: string) => {
      // 낙관적 업데이트 - 즉시 UI에서 제거
      const originalItems = cartItems;
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));

      // 로딩 상태 시작
      setUpdatingItems((prev) => new Set(prev).add(itemId));

      try {
        // API 호출 - cartItemId는 itemId와 동일하다고 가정
        const cartItemId = parseInt(itemId);
        if (isNaN(cartItemId)) {
          throw new Error(`Invalid cart item ID: ${itemId}`);
        }
        const response = await deleteCartItem(cartItemId);

        if (response.success) {
          // 성공 시 특별한 처리 없음 (이미 UI에서 제거됨)
        } else {
          throw new Error(response.message || '삭제에 실패했습니다.');
        }
      } catch (error: any) {
        // 에러 발생 시 원래 상태로 복원
        setCartItems(originalItems);

        // 에러 처리
        let errorTitle = '삭제 실패';
        let errorMessage = '알 수 없는 오류가 발생했습니다.';

        if (error?.status === 404) {
          errorTitle = '아이템을 찾을 수 없음';
          errorMessage = '이미 삭제된 아이템이거나 존재하지 않는 아이템입니다.';
        } else if (error?.message) {
          errorMessage = error.message;
        }

        // 에러 다이얼로그 표시
        setErrorDialog({
          isOpen: true,
          title: errorTitle,
          message: errorMessage,
        });

        // 에러 발생시 전체 장바구니 데이터 다시 로드
        loadCartItems();
      } finally {
        // 로딩 상태 종료
        setUpdatingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    },
    [cartItems, loadCartItems],
  );

  // 에러 다이얼로그 닫기
  const closeErrorDialog = useCallback(() => {
    setErrorDialog({
      isOpen: false,
      title: '',
      message: '',
    });
  }, []);

  // 장바구니에서 주문 생성
  const createOrder = useCallback(async () => {
    // 선택된 아이템들 필터링
    const selectedItems = cartItems.filter((item) => item.isSelected);

    if (selectedItems.length === 0) {
      setErrorDialog({
        isOpen: true,
        title: '주문 불가',
        message: '주문할 상품을 선택해주세요.',
      });
      return;
    }

    // 선택된 아이템들의 ID 추출 (문자열 ID를 숫자로 변환)
    const cartItemIds = selectedItems.map((item) => {
      const id = parseInt(item.id);
      if (isNaN(id)) {
        throw new Error(`Invalid cart item ID: ${item.id}`);
      }
      return id;
    });

    // 주문 생성 로딩 상태 시작
    setIsCreatingOrder(true);

    try {
      const response = await createOrderFromCart(cartItemIds);

      if (response.success) {
        // 주문 생성 전 현재 페이지 저장 (만료 시 돌아갈 페이지)
        sessionStorage.setItem('orderReferrer', window.location.pathname);

        // 주문 데이터에 생성 시간 추가
        const orderDataWithTimestamp = {
          ...response.data,
          createdAt: Date.now(),
        };

        // 주문 데이터를 sessionStorage에 저장
        sessionStorage.setItem('orderData', JSON.stringify(orderDataWithTimestamp));

        // 주문 생성 성공 시 order 페이지로 이동
        router.push(`/order/${response.data.orderId}`);
      } else {
        throw new Error(response.message || '주문 생성에 실패했습니다.');
      }
    } catch (error: any) {
      // 에러 처리
      let errorTitle = '주문 생성 실패';
      let errorMessage = '알 수 없는 오류가 발생했습니다.';

      if (error?.status === 400) {
        errorTitle = '잘못된 요청';
        errorMessage = error.message || '유효하지 않은 상품이 포함되어 있습니다.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // 에러 다이얼로그 표시
      setErrorDialog({
        isOpen: true,
        title: errorTitle,
        message: errorMessage,
      });
    } finally {
      // 주문 생성 로딩 상태 종료
      setIsCreatingOrder(false);
    }
  }, [cartItems, router]);

  // 전체 선택 여부
  const isAllSelected = cartItems.length > 0 && cartItems.every((item) => item.isSelected);

  // 부분 선택 여부
  const isPartiallySelected = cartItems.some((item) => item.isSelected) && !isAllSelected;

  return {
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
  };
};
