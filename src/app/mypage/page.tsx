'use client';

import React, { useEffect, useState } from 'react';
import { MyPageLayout } from '@/components/mypage/MyPageLayout';
import { ProfileCard } from '@/components/mypage/ProfileCard';
import { BeautyProfileSummary } from '@/components/mypage/beauty-profile';
import { MobileSidebarList } from '@/components/mypage/MobileSidebarList';
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

        // 마이페이지 데이터 조회
        const mypageResponse = await api.get('/members/me/mypage');
        setMypageData(mypageResponse.data.data);

        // 뷰티프로필 데이터 조회
        try {
          const beautyProfileResponse = await getBeautyProfile();
          setBeautyProfileData(beautyProfileResponse);
        } catch (beautyError) {
          // 뷰티프로필이 없는 경우 무시
          console.log('뷰티프로필이 없습니다.');
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

  // 로딩 중
  if (loading) {
    return (
      <MyPageLayout>
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="text-sm text-text-200">로딩 중...</div>
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
