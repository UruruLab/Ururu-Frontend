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
  | 'zipcode'
  | 'addressRoad'
  | 'addressJibun'
  | 'addressDetail';

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
  zipcode: string;
  addressRoad: string;
  addressJibun: string;
  addressDetail: string;
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
