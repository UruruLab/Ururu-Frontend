// 상품 관련 공통 타입 정의

export interface SelectedOption {
  value: string;
  label: string;
  quantity: number;
}

export interface ProductOption {
  label: string;
  value: string;
}

export interface RewardTier {
  participants: number;
  discount: string;
  achieved: boolean;
}

export interface ProductCategory {
  main: string;
  sub?: string;
}

export interface ShippingInfo {
  type: string;
  description: string;
  shippingFee: string;
}

export interface Product {
  id: string;
  name: string;
  mainImage: string;
  thumbnails: string[];
  detailImages: string[];
  price: number;
  originalPrice: number;
  discountRate: number;
  point: number;
  participants: number;
  targetParticipants: number;
  remainingDays: number;
  category: ProductCategory;
  shippingInfo: ShippingInfo;
  rewardTiers: RewardTier[];
  options: ProductOption[];
}

// 진행률 계산 유틸리티 함수
export const calculateProgress = (participants: number, targetParticipants: number): number => {
  if (targetParticipants <= 0) return 0;
  return Math.min(100, Math.round((participants / targetParticipants) * 100));
};

// 할인율 계산 유틸리티 함수
export const calculateDiscountRate = (originalPrice: number, currentPrice: number): number => {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

// 카테고리 타입
export interface Category {
  value: number;
  label: string;
  children: Category[];
}

// 태그 타입
export interface Tag {
  value: number;
  label: string;
}

// 상품 메타데이터 응답 타입
export interface ProductMetadataResponse {
  categories: Category[];
  tags: Tag[];
}

// 선택된 카테고리 타입
export interface SelectedCategory {
  mainCategory: Category | null;
  subCategory: Category | null;
  detailCategory: Category | null;
}

// 선택된 태그 타입 (최대 3개)
export type SelectedTags = Tag[];
