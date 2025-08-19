'use client';

import React, { useEffect, useState } from 'react';
import { MyPageLayout } from '@/components/mypage/MyPageLayout';
import { ProfileCard } from '@/components/mypage/ProfileCard';
import { BeautyProfileSummary } from '@/components/mypage/beauty-profile';
import { MobileSidebarList } from '@/components/mypage/MobileSidebarList';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyPage } from '@/hooks/useMyPage';
import { useAuthStore } from '@/store';
import { AuthGuard } from '@/components/auth/AuthGuard';
import api from '@/lib/axios';
import type { UserInfo } from '@/types/auth';
import { getBeautyProfile } from '@/services/beautyProfileService';
import { SKIN_TYPE_OPTIONS, SKIN_TONE_OPTIONS } from '@/constants/beauty-profile';

function MyPageContent() {
  const { hasBeautyProfile, summaryInfo } = useMyPage();
  const { user } = useAuthStore();
  const [mypageData, setMypageData] = useState<UserInfo | null>(null);
  const [beautyProfileData, setBeautyProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const mypageResponse = await api.get('/members/me/mypage');
        setMypageData(mypageResponse.data.data);

        try {
          const beautyProfileResponse = await getBeautyProfile();
          setBeautyProfileData(beautyProfileResponse);
        } catch (beautyError) {
          // 뷰티프로필이 없는 경우 무시
        }

        setError(null);
      } catch (err) {
        console.error('데이터 조회 실패:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 뷰티프로필 요약 정보 생성
  const beautyProfileSummary = beautyProfileData
    ? {
        skinType:
          SKIN_TYPE_OPTIONS.find((opt) => opt.value === beautyProfileData.skin_type)?.label ||
          beautyProfileData.skin_type ||
          '없음',
        skinTone:
          SKIN_TONE_OPTIONS.find((opt) => opt.value === beautyProfileData.skin_tone)?.label ||
          beautyProfileData.skin_tone ||
          '없음',
        skinConcerns: beautyProfileData.concerns || [],
        interests: beautyProfileData.interest_categories || [],
        skinReaction: beautyProfileData.has_allergy ? '있음' : '없음',
        priceRange:
          beautyProfileData.min_price && beautyProfileData.max_price
            ? `${beautyProfileData.min_price.toLocaleString()}원 ~ ${beautyProfileData.max_price.toLocaleString()}원`
            : '없음',
      }
    : null;

  if (loading) {
    return (
      <MyPageLayout>
        <div className="space-y-6">
          {/* 프로필 카드 스켈레톤 */}
          <div className="w-full rounded-2xl px-4 py-6 md:px-8">
            <div className="mb-6 flex items-center justify-between">
              {/* 아바타/닉네임/뱃지 스켈레톤 */}
              <div className="flex items-center gap-4 md:gap-6">
                <Skeleton className="h-12 w-12 rounded-full md:h-16 md:w-16" />
                <div>
                  <Skeleton className="mb-1 h-6 w-24 md:h-8 md:w-32" />
                  <div className="flex gap-1 md:gap-2">
                    <Skeleton className="h-5 w-12 rounded-full md:h-6 md:w-16" />
                    <Skeleton className="h-5 w-12 rounded-full md:h-6 md:w-16" />
                  </div>
                </div>
              </div>
              {/* 포인트 스켈레톤 */}
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="mb-1 h-6 w-6 rounded-full md:h-8 md:w-8" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            {/* 하단 버튼 스켈레톤 */}
            <div className="flex w-full flex-col gap-2 md:flex-row md:gap-4">
              <Skeleton className="h-10 w-full md:h-10" />
              <Skeleton className="h-10 w-full md:h-10" />
            </div>
          </div>

          {/* 뷰티 프로필 스켈레톤 */}
          <div className="rounded-xl p-6">
            <div className="mb-4 flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {/* 기본 정보 스켈레톤 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </div>
              {/* 관심사 및 설정 스켈레톤 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </MyPageLayout>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <MyPageLayout>
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="text-sm text-text-200">데이터를 불러올 수 없습니다.</div>
        </div>
      </MyPageLayout>
    );
  }

  // 사용자 정보가 없는 경우
  if (!user) {
    return (
      <MyPageLayout>
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="text-sm text-text-200">사용자 정보를 불러올 수 없습니다.</div>
        </div>
      </MyPageLayout>
    );
  }

  return (
    <MyPageLayout>
      {/* 프로필 카드 - API에서 받아온 데이터 전달 */}
      <ProfileCard user={mypageData} />

      {/* 뷰티 프로필 요약 카드 */}
      {beautyProfileData && <BeautyProfileSummary summaryInfo={beautyProfileSummary} />}

      {/* 모바일/태블릿: 사이드바 리스트 */}
      <MobileSidebarList />
    </MyPageLayout>
  );
}

export default function MyPage() {
  return (
    <AuthGuard requireAuth={true}>
      <MyPageContent />
    </AuthGuard>
  );
}
