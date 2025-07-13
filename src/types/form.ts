// 폼 필드 타입 정의
export type FormFieldType =
  | 'email'
  | 'password'
  | 'passwordConfirm'
  | 'brand'
  | 'company'
  | 'ceo'
  | 'businessNumber'
  | 'phone'
  | 'zonecode'
  | 'address1'
  | 'address2'
  | 'mailOrderNumber';

// 약관 동의 타입 정의
export type AgreementType = 'all' | 'terms' | 'privacy' | 'marketing';

// 브랜드 가이드 타입 정의
export type BrandGuideType = 'guide' | 'success' | 'error';

// 헬퍼 텍스트 타입 정의
export type HelperTextType = 'base' | 'success' | 'error';

// 회원가입 폼 데이터 타입 정의
export interface SignupFormData {
  email: string;
  password: string;
  passwordConfirm: string;
  brand: string;
  company: string;
  ceo: string;
  businessNumber: string;
  phone: string;
  zonecode: string;
  address1: string;
  address2: string;
  mailOrderNumber: string;
}

// 뷰티프로필 폼 데이터 타입 정의
export interface BeautyProfileFormData {
  skinType: string;
  skinTone: string;
  skinConcerns: string[];
  skinReaction: string;
  interestCategories: string[];
  minPrice: string;
  maxPrice: string;
  productRequest: string;
  allergyInput?: string; // 알러지 입력값
}

// 약관 동의 데이터 타입 정의
export interface AgreementData {
  all: boolean;
  terms: boolean;
  privacy: boolean;
  marketing: boolean;
}

// 폼 필드 설정 타입 정의
export interface FormFieldConfig {
  label: string;
  required: boolean;
  maxLength: number;
  placeholder: string;
  type: 'text' | 'email' | 'password' | 'tel';
  helperText?: string;
  characterCount?: boolean;
}
