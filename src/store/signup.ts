import { create } from 'zustand';
import type { SignupFormData, AgreementData } from '@/types/form';

// 회원가입 상태 타입
interface SignupState {
  // 회원가입 폼 데이터
  signupFormData: SignupFormData;
  agreements: AgreementData;
  brandGuide: string;
  brandGuideType: 'success' | 'error' | 'guide';

  // 액션들
  setSignupFormData: (data: Partial<SignupFormData>) => void;
  setAgreements: (agreements: Partial<AgreementData>) => void;
  setBrandGuide: (guide: string, type: 'success' | 'error' | 'guide') => void;
  resetSignupForm: () => void;
}

export const useSignupStore = create<SignupState>((set, get) => ({
  // 초기 상태
  signupFormData: {
    email: '',
    password: '',
    passwordConfirm: '',
    brand: '',
    company: '',
    ceo: '',
    businessNumber: '',
    phone: '',
    zonecode: '',
    address1: '',
    address2: '',
    mailOrderNumber: '',
  },
  agreements: {
    all: false,
    terms: false,
    privacy: false,
    marketing: false,
  },
  brandGuide: '',
  brandGuideType: 'guide',

  // 액션들
  setSignupFormData: (data) => set({ signupFormData: { ...get().signupFormData, ...data } }),
  setAgreements: (agreements) => set({ agreements: { ...get().agreements, ...agreements } }),
  setBrandGuide: (guide, type) => set({ brandGuide: guide, brandGuideType: type }),
  resetSignupForm: () =>
    set({
      signupFormData: {
        email: '',
        password: '',
        passwordConfirm: '',
        brand: '',
        company: '',
        ceo: '',
        businessNumber: '',
        phone: '',
        zonecode: '',
        address1: '',
        address2: '',
        mailOrderNumber: '',
      },
      agreements: {
        all: false,
        terms: false,
        privacy: false,
        marketing: false,
      },
      brandGuide: '',
      brandGuideType: 'guide',
    }),
}));
