import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth';
import { getBeautyProfile } from '@/services/beautyProfileService';
import type { Product } from '@/types/product';

// API 응답 타입 정의
interface GroupBuyResponse {
  data: {
    items: Array<{
      id: string;
      name: string;
      mainImage: string;
      thumbnails: string[];
      detailImages: string[];
      price: number;
      originalPrice: number;
      discountRate: number;
      point: number;
      participants: number;
      targetParticipants: number;
      remainingDays: number;
      category: {
        main: string;
        sub?: string;
      };
      shippingInfo: {
        type: string;
        description: string;
        shippingFee: string;
      };
      rewardTiers: Array<{
        participants: number;
        discount: string;
        achieved: boolean;
      }>;
      options: Array<{
        id: string;
        name: string;
        price: number;
        image: File | null;
        fullIngredients: string;
      }>;
    }>;
  };
}

// AI 추천 응답 타입 실제 구조에 맞게 수정
interface AiRecommendationResponse {
  data: {
    recommendedGroupBuys: Array<{
      groupBuyId: string;
      groupBuyTitle: string;
      productName: string;
      imageUrl: string;
      discountedPrice: number;
      originalPrice: number;
      currentParticipants: number;
      minParticipants: number;
      endDate: string;
      category: string;
      // ... 실제 응답 필드에 맞게 추가
    }>;
    recommendationReason?: string;
  };
}

// 이미지 URL을 절대 경로로 변환하는 함수
const getAbsoluteImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;

  // 환경에 따른 API 기본 URL 결정
  const isProd = process.env.NODE_ENV === 'production';
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  return `${baseUrl}${imageUrl}`;
};

export function useAiPersonalizedProducts() {
  const { isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        if (isAuthenticated) {
          const profile = await getBeautyProfile();

          if (profile) {
            // AI 추천 호출
            const res = await api.get('/ai/groupbuy-recommendations/by-profile', {
              params: { topK: 40 },
            });
            const apiResponse = res.data as AiRecommendationResponse;

            if (!ignore) {
              const recommended: Product[] = Array.isArray(apiResponse.data.recommendedGroupBuys)
                ? apiResponse.data.recommendedGroupBuys.map((item) => ({
                    id: String(item.groupBuyId),
                    name: item.groupBuyTitle || item.productName,
                    mainImage: getAbsoluteImageUrl(item.imageUrl),
                    thumbnails: [getAbsoluteImageUrl(item.imageUrl)],
                    detailImages: [],
                    price: item.discountedPrice,
                    originalPrice: item.originalPrice,
                    discountRate:
                      item.originalPrice && item.discountedPrice
                        ? Math.round(
                            ((item.originalPrice - item.discountedPrice) / item.originalPrice) *
                              100,
                          )
                        : 0,
                    point: 0,
                    participants: item.currentParticipants ?? 0,
                    targetParticipants: item.minParticipants ?? 0,
                    remainingDays: item.endDate
                      ? Math.max(
                          0,
                          Math.ceil(
                            (new Date(item.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                          ),
                        )
                      : 0,
                    category: { main: item.category || '', sub: undefined },
                    shippingInfo: { type: '', description: '', shippingFee: '' },
                    rewardTiers: [],
                    options: [],
                  }))
                : [];

              // id 기준으로 중복 제거
              const uniqueProducts = recommended.filter(
                (item: Product, idx: number, arr: Product[]) =>
                  arr.findIndex((p: Product) => p.id === item.id) === idx,
              );
              setProducts(uniqueProducts);
            }
            setLoading(false);
            return;
          }
        }

        // groupbuys 호출
        const res = await api.get('/groupbuys', { params: { limit: 8, sort: 'order_count' } });

        if (!ignore) {
          const mappedProducts: Product[] = Array.isArray(res.data.data.items)
            ? res.data.data.items.map((item: any) => ({
                id: String(item.id),
                name: item.title,
                mainImage: getAbsoluteImageUrl(item.thumbnailUrl),
                thumbnails: [getAbsoluteImageUrl(item.thumbnailUrl)],
                detailImages: [],
                price: item.displayFinalPrice,
                originalPrice: item.startPrice,
                discountRate:
                  item.startPrice && item.displayFinalPrice
                    ? Math.round(
                        ((item.startPrice - item.displayFinalPrice) / item.startPrice) * 100,
                      )
                    : 0,
                point: 0,
                participants: item.orderCount ?? 0,
                targetParticipants: 0,
                remainingDays: item.endsAt
                  ? Math.max(
                      0,
                      Math.ceil(
                        (new Date(item.endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                      ),
                    )
                  : 0,
                category: { main: '', sub: undefined },
                shippingInfo: { type: '', description: '', shippingFee: '' },
                rewardTiers: [],
                options: [],
              }))
            : [];

          // id 기준으로 중복 제거
          const uniqueProducts = mappedProducts.filter(
            (item: Product, idx: number, arr: Product[]) =>
              arr.findIndex((p: Product) => p.id === item.id) === idx,
          );
          setProducts(uniqueProducts);
        }
      } catch (e) {
        setError('추천 상품을 불러오는데 실패했습니다.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  return { products, loading, error };
}
