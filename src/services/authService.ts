import api from '@/lib/axios';
import type { UserInfo, SellerSignupData, SocialProvider, SellerProfile } from '@/types/auth';
import type { ApiResponse } from '@/types/api';

export interface SocialLoginResponse {
  member_info: UserInfo;
}

export interface SocialProviderInfo {
  id: string;
  name: string;
  authUrl: string;
  state: string;
}

export interface GetSocialProvidersResponse {
  providers: SocialProviderInfo[];
}

export class AuthService {
  // 소셜 로그인 URL 생성
  static async getSocialAuthUrl(provider: SocialProvider): Promise<SocialProviderInfo> {
    const response = await api.get<ApiResponse<SocialProviderInfo>>(
      `/auth/social/auth-url/${provider}`,
    );

    if (!response.data.success) {
      throw new Error(response.data.message || '소셜 로그인 URL을 가져올 수 없습니다.');
    }

    return response.data.data!;
  }

  // 소셜 로그인 처리
  static async processSocialLogin(
    provider: SocialProvider,
    code: string,
  ): Promise<SocialLoginResponse> {
    const response = await api.post<ApiResponse<SocialLoginResponse>>(
      `/auth/social/login/${provider}?code=${code}`,
      {},
    );

    if (!response.data.success) {
      throw new Error(response.data.message || '소셜 로그인에 실패했습니다.');
    }

    return response.data.data!;
  }

  // 판매자 로그인
  static async sellerLogin(credentials: {
    email: string;
    password: string;
  }): Promise<SocialLoginResponse> {
    const response = await api.post<ApiResponse<SocialLoginResponse>>(
      '/auth/seller/login',
      credentials,
    );

    if (!response.data.success) {
      throw new Error(response.data.message || '로그인에 실패했습니다.');
    }

    return response.data.data!;
  }

  // 로그아웃
  static async logout(): Promise<void> {
    try {
      await api.post<ApiResponse<void>>('/auth/logout');
    } catch (error) {
      // 로그아웃 요청 실패 시에도 클라이언트 로그아웃 진행
    }
  }

  // 판매자 로그아웃
  static async sellerLogout(): Promise<void> {
    try {
      await api.post<ApiResponse<void>>('/auth/seller/logout');
    } catch (error) {
      // 로그아웃 요청 실패 시에도 클라이언트 로그아웃 진행
    }
  }

  // 소셜 제공자 목록 조회
  static async getSocialProviders(): Promise<GetSocialProvidersResponse> {
    const response =
      await api.get<ApiResponse<GetSocialProvidersResponse>>('/auth/social/providers');

    if (!response.data.success) {
      throw new Error(response.data.message || '소셜 제공자 목록을 가져올 수 없습니다.');
    }

    return response.data.data!;
  }

  // 판매자 회원가입
  static async sellerSignup(signupData: SellerSignupData): Promise<UserInfo> {
    const response = await api.post<ApiResponse<UserInfo>>('/sellers/signup', signupData);

    if (!response.data.success) {
      throw new Error(response.data.message || '회원가입에 실패했습니다.');
    }

    return response.data.data!;
  }

  // 이메일 중복 확인
  static async checkEmailAvailability(email: string): Promise<boolean> {
    const response = await api.get<ApiResponse<{ is_available: boolean }>>(
      `/sellers/check/email?email=${encodeURIComponent(email)}`,
    );

    if (!response.data.success) {
      throw new Error(response.data.message || '이메일 중복 확인에 실패했습니다.');
    }

    return response.data.data!.is_available;
  }

  // 사업자등록번호 중복 확인
  static async checkBusinessNumberAvailability(businessNumber: string): Promise<boolean> {
    const response = await api.get<ApiResponse<{ is_available: boolean }>>(
      `/sellers/check/business-number?businessNumber=${encodeURIComponent(businessNumber)}`,
    );

    if (!response.data.success) {
      throw new Error(response.data.message || '사업자등록번호 중복 확인에 실패했습니다.');
    }

    return response.data.data!.is_available;
  }

  // 브랜드명 중복 확인
  static async checkBrandNameAvailability(name: string): Promise<boolean> {
    const response = await api.get<ApiResponse<{ is_available: boolean }>>(
      `/sellers/check/name?name=${encodeURIComponent(name)}`,
    );

    if (!response.data.success) {
      throw new Error(response.data.message || '브랜드명 중복 확인에 실패했습니다.');
    }

    return response.data.data!.is_available;
  }

  // 판매자 프로필 조회
  static async getSellerProfile(sellerId: number): Promise<SellerProfile> {
    const response = await api.get<ApiResponse<SellerProfile>>(`/sellers/${sellerId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || '판매자 프로필 조회에 실패했습니다.');
    }

    return response.data.data!;
  }
}
