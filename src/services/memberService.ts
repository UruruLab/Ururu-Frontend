import api from '@/lib/axios';

export interface UpdateProfileRequest {
  nickname: string;
  gender: string;
  birth: string;
  phone: string;
}

export interface ProfileResponse {
  member_id: number;
  email: string;
  nickname: string;
  profile_image: string | null;
  user_type: 'MEMBER' | 'SELLER';
  member_name: string;
  points: number;
  skin_type: string;
  skin_tone: string;
  gender?: string;
  birth?: string;
  phone?: string;
}

export async function checkNicknameDuplicate(nickname: string): Promise<boolean> {
  // 한국어 닉네임을 고려하여 URL 인코딩
  const encodedNickname = encodeURIComponent(nickname);
  const response = await api.get(`/members/nicknames/${encodedNickname}/exists`);
  // exists: true면 중복, false면 사용 가능
  return response.data.data.exists;
}

export async function updateProfile(data: UpdateProfileRequest) {
  const response = await api.patch('/members/me', data);
  return response.data;
}

export async function getProfile() {
  const response = await api.get('/members/me');
  return response.data.data;
}
