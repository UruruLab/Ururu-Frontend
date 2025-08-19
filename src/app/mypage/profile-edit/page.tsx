'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { MyPageLayout } from '@/components/mypage/MyPageLayout';
import { ProfileFormFields, ProfileImageUpload } from '@/components/mypage/profile-edit';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader, ErrorDialog, SuccessDialog } from '@/components/common';
import { Skeleton } from '@/components/ui/skeleton';
import { FORM_STYLES } from '@/constants/form-styles';
import { useProfileEdit } from '@/hooks/useProfileEdit';
import { AuthGuard } from '@/components/auth/AuthGuard';

function ProfileEditPageContent() {
  const {
    nickname,
    gender,
    birth,
    phone,
    agreements,
    profileImg,
    nicknameGuide,
    nicknameGuideType,
    loading,
    errorDialog,
    successDialog,
    handleNicknameChange,
    handleNicknameCheck,
    setGender,
    setBirth,
    handlePhoneChange,
    handleAgreementChange,
    handleSubmit,
    closeErrorDialog,
    closeSuccessDialog,
    isNicknameChanged,
    GENDER_OPTIONS,
  } = useProfileEdit();

  // 로딩 중
  if (loading) {
    return (
      <MyPageLayout>
        <Card className={FORM_STYLES.card.base}>
          <CardContent className={FORM_STYLES.card.content}>
            {/* 페이지 헤더 */}
            <PageHeader title="프로필 수정" />

            {/* 프로필 이미지 */}
            <div className="relative mb-8 flex flex-col items-center">
              <Skeleton className="h-28 w-28 rounded-full md:h-36 md:w-36" />
            </div>

            {/* 폼 필드들 */}
            <div className="w-full space-y-6">
              {/* 닉네임 */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-16" />
                <div className="flex gap-2">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 w-32" />
                </div>
              </div>

              {/* 성별 */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-12" />
                <div className="flex gap-2">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 flex-1" />
                </div>
              </div>

              {/* 생년월일 */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-12 w-full" />
              </div>

              {/* 휴대폰 번호 */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>

              {/* 약관 동의 */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-56" />
                </div>
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
          <PageHeader title="프로필 수정" />

          {/* 프로필 이미지 */}
          <ProfileImageUpload profileImg={profileImg} />

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <ProfileFormFields
              nickname={nickname}
              gender={gender}
              birth={birth}
              phone={phone}
              agreements={agreements}
              nicknameGuide={nicknameGuide}
              nicknameGuideType={nicknameGuideType}
              isNicknameChanged={isNicknameChanged()}
              onNicknameChange={handleNicknameChange}
              onNicknameCheck={handleNicknameCheck}
              onGenderChange={setGender}
              onBirthChange={setBirth}
              onPhoneChange={handlePhoneChange}
              onAgreementChange={handleAgreementChange}
              genderOptions={GENDER_OPTIONS}
            />

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

export default function ProfileEditPage() {
  return (
    <AuthGuard requireAuth={true}>
      <ProfileEditPageContent />
    </AuthGuard>
  );
}
