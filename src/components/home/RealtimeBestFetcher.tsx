'use client';

import { useEffect, useState } from 'react';
import { fetchGroupBuyTop3 } from '@/services/groupbuyService';
import type { GroupBuyTop3 } from '@/types/groupbuy';
import { RealtimeBestSection } from './RealtimeBestSection';
import type { Product } from '@/types/product';

export default function RealtimeBestFetcher({ className = '' }: { className?: string }) {
  const [groupBuyTop3, setGroupBuyTop3] = useState<GroupBuyTop3[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroupBuyTop3()
      .then((res) => {
        setGroupBuyTop3(res.data);
        setError(null);
      })
      .catch(() => {
        setError('실시간 베스트 데이터를 불러오지 못했습니다.');
      })
      .finally(() => setLoading(false));
  }, []);

  // GroupBuyTop3 -> Product 변환
  const convertToProduct = (item: GroupBuyTop3): Product => ({
    id: String(item.id),
    name: item.title,
    mainImage: item.thumbnailUrl,
    thumbnails: [],
    detailImages: [],
    price: item.displayFinalPrice,
    originalPrice: item.startPrice,
    discountRate: item.maxDiscountRate,
    point: 0,
    participants: item.orderCount,
    targetParticipants: 0,
    remainingDays: Math.max(
      0,
      Math.ceil((new Date(item.endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    ),
    category: { main: '', sub: '' },
    shippingInfo: { type: '', description: '', shippingFee: '' },
    rewardTiers: [],
    options: [],
  });
  const realtimeBestProducts = groupBuyTop3.map(convertToProduct);

  return (
    <RealtimeBestSection
      products={realtimeBestProducts}
      loading={loading}
      error={error}
      className={className}
    />
  );
}
