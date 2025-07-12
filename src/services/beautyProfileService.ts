import api from '@/lib/axios';

export interface BeautyProfileRequest {
  skinType: string;
  skinTone: string;
  concerns: string[];
  hasAllergy: boolean;
  allergies: string[];
  interestCategories: string[];
  minPrice: number;
  maxPrice: number;
  additionalInfo: string;
}

export interface BeautyProfileResponse {
  id: number;
  member_id: number;
  skin_type: string;
  skin_tone: string;
  concerns: string[];
  has_allergy: boolean;
  allergies: string[];
  interest_categories: string[];
  min_price: number;
  max_price: number;
  additional_info: string;
  created_at: string;
  updated_at: string;
}

export async function updateBeautyProfile(data: BeautyProfileRequest) {
  const response = await api.patch('/members/beauty-profile', data);
  return response.data;
}

export async function getBeautyProfile() {
  const response = await api.get('/members/beauty-profile');
  return response.data.data;
}
