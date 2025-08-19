'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { MyPageLayout } from '@/components/mypage/MyPageLayout';
import { BeautyProfileFormFields } from '@/components/mypage/beauty-profile-edit';
import { Card, CardContent } from '@/components/ui/card';
import { NoticeBanner, PageHeader, ErrorDialog, SuccessDialog } from '@/components/common';
import { Skeleton } from '@/components/ui/skeleton';
import { FORM_STYLES } from '@/constants/form-styles';
import { useBeautyProfileEdit } from '@/hooks/useBeautyProfileEdit';
import { AuthGuard } from '@/components/auth/AuthGuard';

function BeautyProfileEditPageContent() {
  const {
    beautyProfileData,
    isLoading,
    errorDialog,
    successDialog,
    handleInputChange,
    handleSkinConcernToggle,
    handleInterestCategoryToggle,
    handleSubmit,
    closeErrorDialog,
    closeSuccessDialog,
    SKIN_TYPE_OPTIONS,
    SKIN_TONE_OPTIONS,
    SKIN_CONCERN_OPTIONS,
    SKIN_REACTION_OPTIONS,
    INTEREST_CATEGORY_OPTIONS,
    BEAUTY_PROFILE_CONSTANTS,
  } = useBeautyProfileEdit();

  if (isLoading) {
    return (
      <MyPageLayout>
        <Card className={FORM_STYLES.card.base}>
          <CardContent className={FORM_STYLES.card.content}>
            <PageHeader title="뷰티프로필 수정" />

            {/* 알림 박스 */}
            <NoticeBanner
            message="뷰티 프로필을 설정하면 회원님만의 맞춤 서비스가 제공돼요!"
            className="mb-8"
          />

            {/* 폼 필드들 */}
            <div className="w-full space-y-6">
              {/* 피부 타입 */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full" />
                  ))}
                </div>
              </div>

              {/* 피부 톤 */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-16" />
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full" />
                  ))}
                </div>
              </div>

              {/* 피부 고민 */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full" />
                  ))}
                </div>
              </div>

              {/* 특정 화장품 사용 후 이상 경험 여부 */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-4 w-96" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              </div>

              {/* 관심 카테고리 */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full" />
                  ))}
                </div>
              </div>

              {/* 선호 가격대 */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <div className="flex gap-4">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-3 w-64" />
              </div>

              {/* 상품 추천 요청 */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-32 w-full" />
              </div>

              {/* 저장 버튼 */}
              <Skeleton className="mt-6 h-12 w-32" />
            </div>
          </CardContent>
        </Card>
      </MyPageLayout>
    );
  }

  return (
    <MyPageLayout>
      <Card className={FORM_STYLES.card.base}>
        <CardContent className={FORM_STYLES.card.content}>
          <PageHeader title="뷰티프로필 수정" />

          {/* 알림 박스 */}
          <NoticeBanner
            message="뷰티 프로필을 설정하면 회원님만의 맞춤 서비스가 제공돼요!"
            className="mb-8"
          />

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <BeautyProfileFormFields
              beautyProfileData={beautyProfileData}
              onInputChange={handleInputChange}
              onSkinConcernToggle={handleSkinConcernToggle}
              onInterestCategoryToggle={handleInterestCategoryToggle}
              skinTypeOptions={SKIN_TYPE_OPTIONS}
              skinToneOptions={SKIN_TONE_OPTIONS}
              skinConcernOptions={SKIN_CONCERN_OPTIONS}
              skinReactionOptions={SKIN_REACTION_OPTIONS}
              interestCategoryOptions={INTEREST_CATEGORY_OPTIONS}
              productRequestMaxLength={BEAUTY_PROFILE_CONSTANTS.PRODUCT_REQUEST_MAX_LENGTH}
            />

            {/* 저장 버튼 */}
            <Button
              type="submit"
              className={FORM_STYLES.button.submit + ' mt-6 text-sm font-medium'}
            >
              저장하기
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 에러 다이얼로그 */}
      <ErrorDialog
        isOpen={errorDialog.isOpen}
        onClose={closeErrorDialog}
        title={errorDialog.title}
        message={errorDialog.message}
        errorDetails={errorDialog.errorDetails}
      />

      {/* 성공 다이얼로그 */}
      <SuccessDialog
        isOpen={successDialog.isOpen}
        onClose={closeSuccessDialog}
        title={successDialog.title}
        message={successDialog.message}
      />
    </MyPageLayout>
  );
}

export default function BeautyProfileEditPage() {
  return (
    <AuthGuard requireAuth={true}>
      <BeautyProfileEditPageContent />
    </AuthGuard>
  );
}
