'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { MyPageLayout } from '@/components/mypage/MyPageLayout';
import { ProfileFormFields, ProfileImageUpload } from '@/components/mypage/profile-edit';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader, ErrorDialog, SuccessDialog } from '@/components/common';
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
    GENDER_OPTIONS,
  } = useProfileEdit();

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
