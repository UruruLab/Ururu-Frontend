import { Metadata } from 'next';
import { Suspense } from 'react';
import { FullLayout } from '@/components/layout';
import {
  HeroCarousel,
  RealtimeBestSection,
  PersonalizedSection,
  CategoryRankingSection,
  ShortFormSection,
} from '@/components/home';
import {
  heroBanners,
  personalizedProducts,
} from '@/data/home';
import { WithdrawnMemberAlert } from '@/components/common/WithdrawnMemberAlert';
import RealtimeBestFetcher from '@/components/home/RealtimeBestFetcher';

export const metadata: Metadata = {
  title: '우르르 - 뷰티 공동구매 커머스',
  description:
    '함께하면 더 저렴한 뷰티 상품을 만나보세요. 스킨케어, 메이크업, 마스크팩 등 다양한 뷰티 상품을 공동구매로 합리적인 가격에 구매하세요.',
  keywords: [
    '뷰티',
    '공동구매',
    '스킨케어',
    '메이크업',
    '마스크팩',
    '클렌징',
    '선케어',
    '향수',
    '헤어케어',
    '바디케어',
    '우르르',
  ],
  openGraph: {
    title: '우르르 - 뷰티 공동구매 커머스',
    description: '함께하면 더 저렴한 뷰티 상품을 만나보세요.',
    type: 'website',
    url: 'https://www.ururu.shop',
  },
};

export default function Home() {
  return (
    <FullLayout>
      <div className="container mx-auto max-w-[1280px] px-6 py-8 md:px-9 md:py-10 xl:px-12">
        {/* 히어로 섹션 */}
        <section className="mb-12">
          {/* 모바일/태블릿: 히어로 캐러셀만 */}
          <div className="lg:hidden">
            <div className="aspect-[16/9] w-full">
              <HeroCarousel banners={heroBanners} className="h-full" />
            </div>
          </div>

          {/* 데스크탑: 히어로 캐러셀 + 실시간 베스트 나란히 */}
          <div className="hidden items-stretch gap-6 lg:flex">
            {/* 캐러셀: 실시간 베스트와 세로 길이 맞춤 */}
            <div className="h-[360px] min-w-0 flex-[1.2]">
              <HeroCarousel banners={heroBanners} className="h-full" />
            </div>
            {/* 실시간 베스트: 더 넓게 */}
            <div className="h-[360px] w-[480px] flex-shrink-0">
              <RealtimeBestFetcher className="h-full" />
            </div>
          </div>
        </section>

        {/* 메인 콘텐츠 영역 */}
        <main className="space-y-20">
          {/* 실시간 베스트 (모바일/태블릿만) */}
          <section className="lg:hidden">
            <RealtimeBestFetcher />
          </section>

          {/* 개인화 추천 */}
          <PersonalizedSection products={personalizedProducts} />

          {/* 카테고리 랭킹 */}
          <CategoryRankingSection />

          {/* 숏구(숏폼) 섹션 */}
          <ShortFormSection />
        </main>
      </div>

      {/* 탈퇴한 회원 알림 */}
      <Suspense fallback={null}>
        <WithdrawnMemberAlert />
      </Suspense>
    </FullLayout>
  );
}
