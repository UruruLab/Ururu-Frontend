'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { MyPageLayout } from '@/components/mypage/MyPageLayout';
import { BeautyProfileFormFields } from '@/components/mypage/beauty-profile-edit';
import { Card, CardContent } from '@/components/ui/card';
import {
  NoticeBanner,
  PageHeader,
  LoadingSkeleton,
  ErrorDialog,
  SuccessDialog,
} from '@/components/common';
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
            <LoadingSkeleton className="h-96" />
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
