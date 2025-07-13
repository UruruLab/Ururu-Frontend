import { useCallback } from 'react';
import { useSignupStore } from '@/store';
import { isPasswordValid } from '@/lib/password-utils';
import { FormFieldType, AgreementType, SignupFormData, AgreementData } from '@/types/form';

export const useSignupForm = () => {
  const {
    signupFormData,
    agreements,
    brandGuide,
    brandGuideType,
    setSignupFormData,
    setAgreements,
    setBrandGuide,
  } = useSignupStore();

  // 입력 필드 변경 핸들러
  const handleInputChange = useCallback(
    (field: FormFieldType, value: string) => {
      setSignupFormData({ [field]: value } as Partial<SignupFormData>);

      if (field === 'brand') {
        setBrandGuide('', 'guide');
      }
    },
    [setSignupFormData, setBrandGuide],
  );

  // 약관 동의 변경 핸들러
  const handleAgreementChange = useCallback(
    (field: AgreementType, checked: boolean) => {
      if (field === 'all') {
        // 전체 체크박스 클릭 시 모든 약관 체크/해제
        setAgreements({
          all: checked,
          terms: checked,
          privacy: checked,
          marketing: checked,
        });
      } else {
        // 개별 약관 체크/해제
        const newAgreements = { [field]: checked } as Partial<AgreementData>;

        // 필수 약관(terms, privacy)이 모두 체크되었는지 확인
        const updatedAgreements = {
          ...agreements,
          ...newAgreements,
        };

        // 필수 약관이 모두 체크되면 전체도 체크
        const allRequiredChecked = updatedAgreements.terms && updatedAgreements.privacy;
        const allChecked = allRequiredChecked && updatedAgreements.marketing;

        setAgreements({
          ...newAgreements,
          all: allChecked,
        });
      }
    },
    [setAgreements, agreements],
  );

  // 브랜드명 중복 확인 핸들러
  const handleBrandDuplicateCheck = useCallback(
    async (isAvailable?: boolean) => {
      if (!signupFormData.brand.trim()) {
        setBrandGuide('브랜드명을 입력해주세요.', 'error');
        return;
      }

      if (isAvailable === undefined) {
        // API 호출 없이 기본 검증만 수행
        setBrandGuide('브랜드명을 입력해주세요.', 'error');
        return;
      }

      if (isAvailable) {
        setBrandGuide('사용 가능한 브랜드명입니다.', 'success');
      } else {
        setBrandGuide('이미 사용 중인 브랜드명입니다.', 'error');
      }
    },
    [signupFormData.brand, setBrandGuide],
  );

  // 폼 유효성 검사
  const isFormValid = useCallback(() => {
    return (
      signupFormData.email &&
      signupFormData.password &&
      signupFormData.passwordConfirm &&
      signupFormData.password === signupFormData.passwordConfirm &&
      isPasswordValid(signupFormData.password) &&
      signupFormData.brand &&
      signupFormData.company &&
      signupFormData.ceo &&
      signupFormData.businessNumber &&
      signupFormData.phone &&
      signupFormData.mailOrderNumber &&
      signupFormData.zonecode &&
      signupFormData.zonecode.trim() &&
      signupFormData.address1 &&
      signupFormData.address1.trim() &&
      signupFormData.address2 &&
      signupFormData.address2.trim() &&
      agreements.terms &&
      agreements.privacy
    );
  }, [signupFormData, agreements]);

  return {
    // 상태
    signupFormData,
    agreements,
    brandGuide,
    brandGuideType,

    // 핸들러
    handleInputChange,
    handleAgreementChange,
    handleBrandDuplicateCheck,

    // 유효성 검사
    isFormValid: isFormValid(),
  };
};
