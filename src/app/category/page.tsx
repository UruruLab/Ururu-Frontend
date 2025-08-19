'use client';
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { FullLayout } from '@/components/layout/layouts';
import { categoryItems } from '@/data/categories';
import type { GroupBuyTop3 } from '@/types/groupbuy';
import type { Product } from '@/types/product';
import { ProductGrid } from '@/components/product';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

// 세부 카테고리명과 categoryId 매핑
const SUBCATEGORY_ID_MAP: Record<string, number> = {
  '스킨/토너': 2,
  '에센스/세럼/앰플': 3,
  크림: 5,
  로션: 8,
  '미스트/오일': 10,
  스킨케어세트: 13,
  '스킨케어 디바이스': 14,
  시트팩: 16,
  패드: 21,
  페이셜팩: 22,
  코팩: 23,
  패치: 24,
  '클렌징폼/젤': 27,
  '오일/밤': 30,
  '워터/밀크': 33,
  '필링&스크럽': 36,
  '티슈/패드': 40,
  '립&아이리무버': 41,
  '클렌징 디바이스': 42,
  선크림: 44,
  선스틱: 45,
  선쿠션: 47,
  '선스프레이/선패치': 49,
  '태닝/애프터선': 52,
  립메이크업: 56,
  베이스메이크업: 63,
  아이메이크업: 74,
  액체향수: 82,
  고체향수: 83,
  바디퍼퓸: 84,
  헤어퍼퓸: 85,
  '샴푸/린스': 87,
  '트리트먼트/팩': 92,
  '두피앰플/토닉': 95,
  헤어에센스: 97,
  '염색약/펌': 100,
  '헤어기기/브러시': 105,
  스타일링: 109,
  '샤워/입욕': 114,
  '로션/오일/미스트': 119,
  핸드케어: 123,
  풋케어: 126,
  '제모/왁싱': 132,
  데오드란트: 138,
  베이비: 143,
};

// 상품 카드 스켈레톤 컴포넌트
function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

// 상품 그리드 스켈레톤 컴포넌트
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index}>
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
}

function convertToProduct(item: GroupBuyTop3): Product {
  return {
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
  };
}

function CategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sub = searchParams.get('sub');
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollPositionRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [newItemId, setNewItemId] = useState<string | null>(null);

  // 무한 스크롤을 위한 데이터 패칭 함수
  const fetchGroupBuys = useCallback(async (categoryId: number, cursor: string | null = null) => {
    if (!cursor) setLoading(true); // 첫 페이지 로딩일 때만
    setError(null);

    try {
      let url = `/api/groupbuys?limit=20&sort=order_count&categoryId=${categoryId}`;
      if (cursor) {
        url += `&cursor=${cursor}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '데이터를 불러오지 못했습니다.');
      }

      const newProducts = data.data.items.map(convertToProduct);

      if (cursor) {
        setProducts((prev) => {
          const updated = [...prev, ...newProducts];
          if (newProducts.length > 0) setNewItemId(newProducts[0].id);
          return updated;
        });
        setTimeout(() => {
          if (scrollPositionRef.current !== null) {
            window.scrollTo(0, scrollPositionRef.current);
            scrollPositionRef.current = null;
          }
          setIsLoadingMore(false);
        }, 0);
      } else {
        setProducts(newProducts);
      }

      setNextCursor(data.data.nextCursor);
      setHasMore(data.data.hasMore);
    } catch (e: any) {
      setError(e?.message || '공동구매 데이터를 불러오지 못했습니다.');
    } finally {
      if (!cursor) setLoading(false); // 첫 페이지 로딩일 때만
      setIsLoadingMore(false);
    }
  }, []);

  // 카테고리 변경 시 첫 페이지 로드
  const handleSubClick = useCallback(
    async (subTitle: string) => {
      setSelectedSub(subTitle);
      setProducts([]);
      setNextCursor(null);
      setHasMore(true);
      setError(null);
      scrollPositionRef.current = null;
      setIsLoadingMore(false);

      // 카테고리 변경 시 스크롤 위치 초기화
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const categoryId = SUBCATEGORY_ID_MAP[subTitle];
      if (!categoryId) {
        setError('카테고리 ID가 없습니다.');
        return;
      }

      await fetchGroupBuys(categoryId);
    },
    [fetchGroupBuys],
  );

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    if (loading || isLoadingMore || !hasMore || !nextCursor) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // 스크롤이 페이지 하단 근처에 도달했는지 확인
    if (scrollTop + windowHeight >= documentHeight - 100) {
      // 현재 스크롤 위치 저장
      scrollPositionRef.current = scrollTop;
      setIsLoadingMore(true);

      const categoryId = selectedSub ? SUBCATEGORY_ID_MAP[selectedSub] : null;
      if (categoryId) {
        fetchGroupBuys(categoryId, nextCursor);
      }
    }
  }, [loading, isLoadingMore, hasMore, nextCursor, selectedSub, fetchGroupBuys]);

  // 스크롤 이벤트 리스너 등록/해제
  useEffect(() => {
    if (selectedSub && hasMore && nextCursor) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [selectedSub, hasMore, nextCursor, handleScroll]);

  useEffect(() => {
    if (sub && sub !== selectedSub) {
      handleSubClick(sub);
    }
  }, [sub, selectedSub, handleSubClick]);

  useEffect(() => {
    if (newItemId) {
      const el = document.getElementById(`product-${newItemId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
      setNewItemId(null);
    }
  }, [newItemId]);

  return (
    <FullLayout>
      {/* sub가 없을 때만 카테고리 그리드 노출 */}
      {!sub && (
        <>
          {/* 모바일: 세부 카테고리 선택 그리드 */}
          <div className="container mx-auto max-w-[1280px] px-6 py-8 md:hidden md:px-9 md:py-10 xl:px-12">
            {/* 헤더 */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-text-100">카테고리</h1>
              <p className="mt-2 text-sm text-text-200">
                원하는 카테고리를 선택하여 공구를 찾아보세요
              </p>
            </div>
            {/* 카테고리 그리드 */}
            <div className="grid grid-cols-1 gap-6">
              {categoryItems.map((category) => (
                <div
                  key={category.title}
                  className="rounded-xl border border-bg-300 bg-bg-100 p-4 shadow-sm"
                >
                  {/* 메인 카테고리 */}
                  <div className="mb-3">
                    <h2 className="text-lg font-semibold text-text-100">{category.title}</h2>
                  </div>
                  {/* 서브 카테고리 */}
                  <div className="grid grid-cols-2 gap-2">
                    {category.subItems.map((subItem) => (
                      <button
                        key={subItem.title}
                        className="rounded-lg bg-bg-200 px-3 py-2 text-sm text-text-200 active:bg-primary-100"
                        onClick={() =>
                          router.push(`/category?sub=${encodeURIComponent(subItem.title)}`)
                        }
                      >
                        {subItem.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* 데스크탑: 세부 카테고리 선택 그리드 */}
          <div className="container hidden py-6 md:block">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-text-100">카테고리</h1>
              <p className="mt-2 text-sm text-text-200">
                원하는 카테고리를 선택하여 공구를 찾아보세요
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
              {categoryItems.map((category) => (
                <div
                  key={category.title}
                  className="rounded-xl border border-bg-300 bg-bg-100 p-4 shadow-sm"
                >
                  <div className="mb-3">
                    <h2 className="text-lg font-semibold text-text-100">{category.title}</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {category.subItems.map((subItem) => (
                      <button
                        key={subItem.title}
                        className="rounded-lg bg-bg-200 px-3 py-2 text-sm text-text-200 active:bg-primary-100"
                        onClick={() =>
                          router.push(`/category?sub=${encodeURIComponent(subItem.title)}`)
                        }
                      >
                        {subItem.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <div
        className="container mx-auto max-w-[1280px] px-6 py-8 md:px-9 md:py-10 xl:px-12"
        style={{ scrollBehavior: 'auto' }}
      >
        {/* 페이지 헤더 */}
        {selectedSub && (
          <div className="mb-8">
            <h1 className="mb-6 text-2xl font-semibold text-text-100 md:text-3xl">{selectedSub}</h1>
            <p className="text-sm text-text-200 md:text-base">
              공동 구매들을 카테고리별로 확인해보세요!
            </p>
          </div>
        )}
        {/* 공동구매 리스트 */}
        {selectedSub && (
          <div className="mt-8">
            {/* 기존 h3, 설명 p 태그는 제거됨 */}
            {loading && products.length === 0 && <ProductGridSkeleton />}
            {error && error.includes('해당 공동구매를 찾을 수 없습니다.') ? (
              <div className="flex flex-col items-center justify-center py-8 md:py-12">
                <div className="mb-4 text-6xl">💄</div>
                <h2 className="mb-2 text-xl font-semibold text-text-100">
                  해당 카테고리의 공동구매가 없어요
                </h2>
                <p className="text-text-200">다른 카테고리를 선택해보세요!</p>
              </div>
            ) : (
              error && (
                <div className="flex flex-col items-center justify-center py-8 md:py-12">
                  <div className="mb-4 text-6xl">💄</div>
                  <h2 className="mb-2 text-xl font-semibold text-text-100">
                    카테고리 데이터를 불러오지 못했습니다
                  </h2>
                  <p className="text-text-200">잠시 후 다시 시도해주세요!</p>
                </div>
              )
            )}
            {!loading && !error && products.length === 0 && (
              <div className="text-sm text-text-200">공동구매 상품이 없습니다.</div>
            )}
            {!loading && !error && products.length > 0 && (
              <div>
                <ProductGrid products={products} />
                {isLoadingMore && (
                  <div className="mt-4 text-center text-sm text-text-200">더 불러오는 중...</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </FullLayout>
  );
}

export default function CategoryPageWrapper() {
  return (
    <Suspense fallback={null}>
      <CategoryPage />
    </Suspense>
  );
}
