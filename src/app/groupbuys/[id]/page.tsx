'use client';

import React, { useState, useEffect } from 'react';
import { DetailMain, OrderBox, OrderFloatingBar } from '@/components/product';
import { CustomLayout } from '@/components/layout/layouts';
import { getGroupBuyDetail } from '@/services/groupbuyService';
import type { GroupBuyDetail } from '@/types/groupbuy';
import type { Product } from '@/types/product';

interface GroupBuyDetailPageProps {
  params: {
    id: string;
  };
}

export default function GroupBuyDetailPage({ params }: GroupBuyDetailPageProps) {
  const [groupBuyData, setGroupBuyData] = useState<GroupBuyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // GroupBuy 데이터를 Product 형태로 변환하는 함수
  const convertGroupBuyToProduct = (groupBuy: GroupBuyDetail): Product => {
    // 남은 일수 계산
    const remainingDays = Math.max(
      0,
      Math.ceil((new Date(groupBuy.endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    );

    // 이미지 배열 생성
    // thumbnails: 메인 썸네일만 포함 (캐러셀용)
    // detailImages: API의 images 배열 (상세 탭용)
    const sortedImages = [...groupBuy.images].sort((a, b) => a.displayOrder - b.displayOrder);
    const thumbnails = [groupBuy.thumbnailUrl]; // 메인 썸네일만
    const detailImages = sortedImages.map((img) => img.imageUrl); // 상세 이미지들

    // 옵션 변환 - API 데이터의 모든 필드를 활용
    const options = groupBuy.options.map((option) => ({
      id: String(option.id),
      name: option.optionName,
      price: option.salePrice, // 할인된 가격 사용
      image: null, // API에서 이미지 URL을 받지만 File 형태가 필요하므로 null
      imageUrl: option.optionImageUrl, // 옵션 이미지 URL 추가
      fullIngredients: option.fullIngredients || '',
      maxQuantity: groupBuy.limitQuantityPerMember, // 회원당 최대 구매 수량 제한
      initialStock: option.initialStock, // 초기 재고
      currentStock: option.currentStock, // 현재 재고
      soldQuantity: option.soldQuantity, // 옵션별 판매량
      currentOrderCount: groupBuy.currentOrderCount, // 공동구매 총 판매량
      priceOverride: option.priceOverride, // 공동구매 시작가
      isOutOfStock: option.isOutOfStock, // 품절 여부
    }));

    // 할인 단계를 rewardTiers로 변환 (실제 달성 여부만 반영)
    const rewardTiers = groupBuy.discountStages.map((stage) => ({
      participants: stage.count,
      discount: `${stage.rate}% 할인`,
      discountRate: stage.rate, // 숫자형 할인율 추가
      achieved: groupBuy.currentOrderCount >= stage.count,
    }));

    // productNotice 정보를 Product 타입 필드로 매핑
    const productNoticeMapping = {
      capacity: groupBuy.product.productNotice?.capacity,
      specification: groupBuy.product.productNotice?.spec,
      expiryDate: groupBuy.product.productNotice?.expiry,
      usage: groupBuy.product.productNotice?.usage,
      manufacturer: groupBuy.product.productNotice?.manufacturer,
      seller: groupBuy.product.productNotice?.responsibleSeller,
      country: groupBuy.product.productNotice?.countryOfOrigin,
      functionalTest: groupBuy.product.productNotice?.functionalCosmetics
        ? ('yes' as const)
        : ('no' as const),
      precautions: groupBuy.product.productNotice?.caution,
      qualityStandard: groupBuy.product.productNotice?.warranty,
      customerService: groupBuy.product.productNotice?.customerServiceNumber,
    };

    const convertedProduct = {
      id: String(groupBuy.id),
      name: groupBuy.title,
      mainImage: groupBuy.thumbnailUrl,
      thumbnails,
      detailImages,
      price: groupBuy.displayFinalPrice,
      originalPrice: groupBuy.startPrice,
      discountRate: groupBuy.maxDiscountRate,
      point: 0, // API에 point 정보가 없으므로 0으로 설정
      participants: groupBuy.currentOrderCount,
      targetParticipants: groupBuy.discountStages[0]?.count || 0,
      remainingDays,
      category: {
        main: groupBuy.product.categoryIds[0] || 'general',
        sub: groupBuy.product.categoryIds[1] || '',
      },
      categoryIds: groupBuy.product.categoryIds, // 카테고리 ID 배열 추가
      shippingInfo: {
        type: '우르르 배송 상품',
        description: '공구 마감 후 평균 4일 이내 배송',
        shippingFee: '기본 배송비 3,000원',
      },
      rewardTiers,
      options,
      tags: groupBuy.product.tags || [], // 상품 태그 추가
      ...productNoticeMapping,
    };

    return convertedProduct;
  };

  useEffect(() => {
    const fetchGroupBuyData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const groupBuyId = parseInt(params.id, 10);

        if (isNaN(groupBuyId)) {
          setError('잘못된 공동구매 ID입니다.');
          return;
        }

        const response = await getGroupBuyDetail(groupBuyId);
        setGroupBuyData(response.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
        setError(errorMessage || '공동구매 정보를 불러오는데 실패했습니다.');
        // TODO: 에러 로깅 서비스 연동
        console.error('공구상세 정보 조회 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupBuyData();
  }, [params.id]);

  // 로딩 상태
  if (isLoading) {
    return (
      <CustomLayout
        showTopBar={true}
        showSearchBar={true}
        showMainNav={true}
        showFooter={true}
        showBottomNav={false}
      >
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-6 py-10 pb-24 md:px-9 md:py-12 md:pb-28 xl:flex-row xl:items-start xl:gap-12 xl:px-12 xl:pb-10">
          <div className="py-20 text-center">로딩 중...</div>
        </div>
      </CustomLayout>
    );
  }

  // 에러 상태
  if (error || !groupBuyData) {
    return (
      <CustomLayout
        showTopBar={true}
        showSearchBar={true}
        showMainNav={true}
        showFooter={true}
        showBottomNav={false}
      >
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-6 py-10 pb-24 md:px-9 md:py-12 md:pb-28 xl:flex-row xl:items-start xl:gap-12 xl:px-12 xl:pb-10">
          <div className="py-20 text-center text-red-500">
            {error || '공동구매 정보를 불러올 수 없습니다.'}
          </div>
        </div>
      </CustomLayout>
    );
  }

  return (
    <CustomLayout
      showTopBar={true}
      showSearchBar={true}
      showMainNav={true}
      showFooter={true}
      showBottomNav={false}
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-6 py-10 pb-24 md:px-9 md:py-12 md:pb-28 xl:flex-row xl:items-start xl:gap-12 xl:px-12 xl:pb-10">
        {/* 왼쪽: 상세/리뷰/컨텐츠 */}
        <section className="w-full xl:w-[60%]">
          <DetailMain product={convertGroupBuyToProduct(groupBuyData)} />
        </section>
        {/* 오른쪽: 주문/상품 정보 (데스크탑만) */}
        <aside className="hidden w-full xl:block xl:w-[40%]">
          <OrderBox product={convertGroupBuyToProduct(groupBuyData)} />
        </aside>
      </div>
      {/* 모바일/태블릿 하단 플로팅 바 */}
      <OrderFloatingBar product={convertGroupBuyToProduct(groupBuyData)} />
    </CustomLayout>
  );
}
