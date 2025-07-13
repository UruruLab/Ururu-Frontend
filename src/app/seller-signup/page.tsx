'use client';

import { CustomLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, PasswordStrengthIndicator } from '@/components/form';
import { Store } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  checkPasswordLength,
  checkPasswordHasLetter,
  checkPasswordHasNumber,
  checkPasswordHasSpecial,
} from '@/lib/password-utils';
import { formatPhoneNumber, formatBusinessNumber } from '@/lib/format-utils';
import { FORM_STYLES } from '@/constants/form-styles';
import { useSignupForm } from '@/hooks/useSignupForm';
import { useSellerSignup, useAvailabilityCheck } from '@/hooks/useAuth';
import { usePostcode } from '@/hooks/usePostcode';
import { FormFieldType, AgreementType } from '@/types/form';
import { useAuthStore } from '@/store';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SellerSignUpPage() {
  const {
    signupFormData,
    agreements,
    brandGuide,
    brandGuideType,
    handleInputChange,
    handleAgreementChange,
    handleBrandDuplicateCheck,
    isFormValid,
  } = useSignupForm();

  const { sellerSignup } = useSellerSignup();
  const { checkEmail, checkBusinessNumber, checkBrandName } = useAvailabilityCheck();
  const { error, setError } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // 우편번호 검색 기능
  const handlePostcodeComplete = (data: any) => {
    handleInputChange('zonecode' as FormFieldType, data.zonecode);
    handleInputChange('address1' as FormFieldType, data.address);
  };

  const { openPostcode } = usePostcode({
    onComplete: handlePostcodeComplete,
  });

  const handleBrandDuplicateCheckWithAPI = async () => {
    if (!signupFormData.brand) {
      handleBrandDuplicateCheck();
      return;
    }

    try {
      const isAvailable = await checkBrandName(signupFormData.brand);
      if (isAvailable) {
        // 사용 가능한 브랜드명임을 UI에 표시
        handleBrandDuplicateCheck(true);
      } else {
        // 이미 사용중인 브랜드명임을 UI에 표시
        handleBrandDuplicateCheck(false);
      }
    } catch (error) {
      // API 에러 발생시 에러 메시지 표시
      setError('브랜드명 중복 확인에 실패했습니다.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !isFormValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // 중복 체크
      const [emailAvailable, businessNumberAvailable, brandNameAvailable] = await Promise.all([
        checkEmail(signupFormData.email),
        checkBusinessNumber(signupFormData.businessNumber),
        checkBrandName(signupFormData.brand),
      ]);

      if (!emailAvailable) {
        setError('이미 사용 중인 이메일입니다.');
        return;
      }

      if (!businessNumberAvailable) {
        setError('이미 사용 중인 사업자등록번호입니다.');
        return;
      }

      if (!brandNameAvailable) {
        setError('이미 사용 중인 브랜드명입니다.');
        return;
      }

      // 통신판매업 신고번호 검증
      if (!signupFormData.mailOrderNumber.trim()) {
        setError('통신판매업 신고번호를 입력해주세요.');
        return;
      }

      if (signupFormData.mailOrderNumber.length > 50) {
        setError('통신판매업 신고번호는 50자 이하여야 합니다.');
        return;
      }

      // 우편번호 검증
      if (!signupFormData.zonecode || !signupFormData.zonecode.trim()) {
        setError('우편번호를 입력해주세요.');
        return;
      }

      // 기본주소 검증
      if (!signupFormData.address1 || !signupFormData.address1.trim()) {
        setError('기본주소를 입력해주세요.');
        return;
      }

      // 상세주소 검증
      if (!signupFormData.address2 || !signupFormData.address2.trim()) {
        setError('상세주소를 입력해주세요.');
        return;
      }

      // 회원가입 데이터 변환
      const signupData = {
        name: signupFormData.brand,
        businessName: signupFormData.company,
        ownerName: signupFormData.ceo,
        businessNumber: signupFormData.businessNumber.replace(/[^0-9]/g, ''),
        email: signupFormData.email,
        password: signupFormData.password,
        phone: signupFormData.phone.replace(/[^0-9]/g, ''),
        zonecode: signupFormData.zonecode,
        address1: signupFormData.address1,
        address2: signupFormData.address2,
        mailOrderNumber: signupFormData.mailOrderNumber,
      };

      await sellerSignup(signupData);

      // 회원가입 성공 시 로그인 페이지로 이동
      router.push('/login?type=seller');
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : '회원가입에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomLayout showTopBar={false} showSearchBar={false} showMainNav={false} showFooter={false}>
      <div className="bg-bg-100">
        {/* 회원가입 컨테이너 */}
        <div className="container mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-4 tablet:max-w-lg desktop:max-w-xl">
          {/* 로고 */}
          <div className="mb-6 flex justify-center pt-8">
            <Link href="/" aria-label="우르르 홈으로 이동">
              <Image
                src="/ururu-full-logo.png"
                alt="우르르"
                width={120}
                height={32}
                className="h-12 w-auto"
                priority
              />
            </Link>
          </div>

          {/* 안내 문구 */}
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-xl font-semibold text-text-100">회원가입</h1>
            <p className="text-sm font-normal text-text-200">
              우르르와 함께 성장하는 비즈니스를 경험하세요
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          {/* 회원가입 폼 */}
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* 이메일 */}
            <FormField label="이메일" required>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={signupFormData.email}
                onChange={(e) => handleInputChange('email' as FormFieldType, e.target.value)}
                className={FORM_STYLES.input.base + ' ' + FORM_STYLES.input.focus}
                required
                disabled={isSubmitting}
              />
            </FormField>

            {/* 비밀번호 */}
            <FormField
              label="비밀번호"
              required
              helperText="영문, 숫자, 특수문자 포함 8자 이상"
              characterCount={{ current: signupFormData.password?.length || 0, max: 50 }}
            >
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={signupFormData.password}
                onChange={(e) => handleInputChange('password' as FormFieldType, e.target.value)}
                className={FORM_STYLES.input.base}
                maxLength={50}
                required
                disabled={isSubmitting}
              />
            </FormField>
            <PasswordStrengthIndicator
              password={signupFormData.password}
              checkPasswordLength={checkPasswordLength}
              checkPasswordHasLetter={checkPasswordHasLetter}
              checkPasswordHasNumber={checkPasswordHasNumber}
              checkPasswordHasSpecial={checkPasswordHasSpecial}
            />

            {/* 비밀번호 확인 */}
            <FormField
              label="비밀번호 확인"
              required
              helperText={
                signupFormData.passwordConfirm
                  ? signupFormData.password === signupFormData.passwordConfirm
                    ? '비밀번호가 일치합니다.'
                    : '비밀번호가 일치하지 않습니다.'
                  : undefined
              }
              helperTextType={
                signupFormData.passwordConfirm
                  ? signupFormData.password === signupFormData.passwordConfirm
                    ? 'success'
                    : 'error'
                  : 'base'
              }
              characterCount={{ current: signupFormData.passwordConfirm?.length || 0, max: 50 }}
            >
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={signupFormData.passwordConfirm}
                onChange={(e) =>
                  handleInputChange('passwordConfirm' as FormFieldType, e.target.value)
                }
                className={FORM_STYLES.input.base}
                maxLength={50}
                required
                disabled={isSubmitting}
              />
            </FormField>

            {/* 브랜드명 */}
            <FormField
              label="브랜드명"
              required
              helperText={brandGuide || undefined}
              helperTextType={brandGuideType === 'guide' ? 'base' : brandGuideType}
              characterCount={{ current: signupFormData.brand?.length || 0, max: 50 }}
            >
              <div className="flex gap-2">
                <Input
                  id="brand"
                  type="text"
                  placeholder="브랜드명을 입력해주세요"
                  value={signupFormData.brand}
                  onChange={(e) => handleInputChange('brand' as FormFieldType, e.target.value)}
                  className={FORM_STYLES.input.base + ' flex-1'}
                  maxLength={50}
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className={FORM_STYLES.button.pinkOutline + ' h-12 min-w-[120px] rounded-lg'}
                  onClick={handleBrandDuplicateCheckWithAPI}
                  disabled={isSubmitting}
                >
                  중복 확인
                </button>
              </div>
            </FormField>

            <FormField
              label="상호명"
              required
              characterCount={{ current: signupFormData.company?.length || 0, max: 100 }}
            >
              <Input
                id="company"
                type="text"
                placeholder="상호명을 입력해주세요"
                value={signupFormData.company}
                onChange={(e) => handleInputChange('company' as FormFieldType, e.target.value)}
                className={FORM_STYLES.input.base}
                maxLength={100}
                required
                disabled={isSubmitting}
              />
            </FormField>

            <FormField
              label="대표이름"
              required
              characterCount={{ current: signupFormData.ceo?.length || 0, max: 50 }}
            >
              <Input
                id="ceo"
                type="text"
                placeholder="대표 이름을 입력해주세요"
                value={signupFormData.ceo}
                onChange={(e) => handleInputChange('ceo' as FormFieldType, e.target.value)}
                className={FORM_STYLES.input.base}
                maxLength={50}
                required
                disabled={isSubmitting}
              />
            </FormField>

            {/* 사업자 등록번호 */}
            <FormField
              label="사업자 등록번호"
              required
              helperText="하이픈(-)을 제외하고 숫자만 입력해주세요"
              characterCount={{ current: signupFormData.businessNumber?.length || 0, max: 10 }}
            >
              <Input
                id="businessNumber"
                type="text"
                placeholder="123-45-67890"
                value={formatBusinessNumber(signupFormData.businessNumber)}
                onChange={(e) =>
                  handleInputChange(
                    'businessNumber' as FormFieldType,
                    e.target.value.replace(/[^0-9]/g, ''),
                  )
                }
                className={FORM_STYLES.input.base}
                maxLength={12}
                required
                disabled={isSubmitting}
              />
            </FormField>

            {/* 통신판매업 신고번호 */}
            <FormField
              label="통신판매업 신고번호"
              required
              characterCount={{ current: signupFormData.mailOrderNumber?.length || 0, max: 50 }}
            >
              <Input
                id="mailOrderNumber"
                type="text"
                placeholder="2024-서울강남-12"
                value={signupFormData.mailOrderNumber}
                onChange={(e) =>
                  handleInputChange('mailOrderNumber' as FormFieldType, e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    // 다음 필드로 포커스 이동
                    const nextField =
                      e.currentTarget.parentElement?.nextElementSibling?.querySelector('input');
                    if (nextField) {
                      (nextField as HTMLInputElement).focus();
                    }
                  }
                }}
                className={FORM_STYLES.input.base}
                maxLength={50}
                required
                disabled={isSubmitting}
                aria-label="통신판매업 신고번호"
                aria-describedby="mailOrderNumber-help"
                autoComplete="off"
                spellCheck="false"
                data-testid="mail-order-number-input"
              />
              <div id="mailOrderNumber-help" className="sr-only">
                통신판매업 신고번호는 온라인에서 상품을 판매하는 사업자가 전자상거래 등에서의
                소비자보호에 관한 법률에 따라 관할 시/도에 신고하고 받는 번호입니다.
              </div>
            </FormField>

            {/* 전화 번호 */}
            <FormField
              label="휴대폰 번호"
              required
              helperText="하이픈(-)을 제외하고 숫자만 입력해주세요"
              characterCount={{ current: signupFormData.phone?.length || 0, max: 20 }}
            >
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                value={formatPhoneNumber(signupFormData.phone)}
                onChange={(e) =>
                  handleInputChange('phone' as FormFieldType, e.target.value.replace(/[^0-9]/g, ''))
                }
                className={FORM_STYLES.input.base}
                maxLength={20}
                required
                disabled={isSubmitting}
              />
            </FormField>

            {/* 주소 */}
            <FormField label="주소" required>
              <div className="mb-2 flex gap-2">
                <Input
                  type="text"
                  placeholder="우편번호"
                  value={signupFormData.zonecode}
                  onChange={(e) =>
                    handleInputChange(
                      'zonecode' as FormFieldType,
                      e.target.value.replace(/[^0-9]/g, ''),
                    )
                  }
                  className={FORM_STYLES.input.base + ' flex-1'}
                  maxLength={5}
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className={FORM_STYLES.button.pinkOutline + ' h-12 min-w-[120px] rounded-lg'}
                  onClick={openPostcode}
                  disabled={isSubmitting}
                >
                  우편 번호
                </button>
              </div>
              <Input
                type="text"
                placeholder="기본주소"
                value={signupFormData.address1}
                onChange={(e) => handleInputChange('address1' as FormFieldType, e.target.value)}
                className={FORM_STYLES.input.base + ' mb-2'}
                maxLength={100}
                required
                disabled={isSubmitting}
              />
              <Input
                type="text"
                placeholder="상세주소를 입력해주세요"
                value={signupFormData.address2}
                onChange={(e) => handleInputChange('address2' as FormFieldType, e.target.value)}
                className={FORM_STYLES.input.base}
                maxLength={100}
                required
                disabled={isSubmitting}
                aria-label="상세주소"
                aria-describedby="address-detail-help"
              />
              <div id="address-detail-help" className="sr-only">
                상세주소는 건물명, 층수, 호수 등을 포함하여 정확한 위치를 입력해주세요.
              </div>
            </FormField>

            {/* 약관 동의 */}
            <div className="mt-6 space-y-3">
              <label className={FORM_STYLES.checkbox.container}>
                <input
                  type="checkbox"
                  checked={agreements.all}
                  onChange={(e) => handleAgreementChange('all' as AgreementType, e.target.checked)}
                  className={FORM_STYLES.checkbox.base}
                  disabled={isSubmitting}
                />
                <span className="text-sm font-medium leading-relaxed text-text-100">
                  전체 약관에 동의합니다
                </span>
              </label>

              <div className="ml-7 space-y-2">
                <label className={FORM_STYLES.checkbox.container}>
                  <input
                    type="checkbox"
                    checked={agreements.terms}
                    onChange={(e) =>
                      handleAgreementChange('terms' as AgreementType, e.target.checked)
                    }
                    className={FORM_STYLES.checkbox.base}
                    disabled={isSubmitting}
                  />
                  <span className={FORM_STYLES.checkbox.label}>
                    <span className="text-primary-300 underline">이용약관</span>에 동의합니다 (필수)
                  </span>
                </label>

                <label className={FORM_STYLES.checkbox.container}>
                  <input
                    type="checkbox"
                    checked={agreements.privacy}
                    onChange={(e) =>
                      handleAgreementChange('privacy' as AgreementType, e.target.checked)
                    }
                    className={FORM_STYLES.checkbox.base}
                    disabled={isSubmitting}
                  />
                  <span className={FORM_STYLES.checkbox.label}>
                    <span className="text-primary-300 underline">개인정보처리방침</span>에
                    동의합니다 (필수)
                  </span>
                </label>

                <label className={FORM_STYLES.checkbox.container}>
                  <input
                    type="checkbox"
                    checked={agreements.marketing}
                    onChange={(e) =>
                      handleAgreementChange('marketing' as AgreementType, e.target.checked)
                    }
                    className={FORM_STYLES.checkbox.base}
                    disabled={isSubmitting}
                  />
                  <span className={FORM_STYLES.checkbox.label}>
                    마케팅 정보 수신에 동의합니다 (선택)
                  </span>
                </label>
              </div>
            </div>

            {/* 회원가입 버튼 */}
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={FORM_STYLES.button.submit}
            >
              <Store className="h-4 w-4" />
              {isSubmitting ? '회원가입 중...' : '판매자 회원가입'}
            </Button>
          </form>

          {/* 로그인 이동 */}
          <div className="mt-6 text-center">
            <span className="text-sm text-text-200">이미 계정이 있으신가요? </span>
            <Link
              href="/login"
              className="text-sm font-medium text-primary-300 transition-colors hover:text-primary-200"
            >
              로그인
            </Link>
          </div>

          {/* 안내 문구 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-text-300">
              회원가입 시, <span className="underline">이용약관</span> 및{' '}
              <span className="underline">개인정보처리방침</span>에 동의한 것으로 간주됩니다.
            </p>
          </div>
        </div>
      </div>
    </CustomLayout>
  );
}
