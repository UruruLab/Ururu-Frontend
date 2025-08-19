import { useCallback } from 'react';
import { useAuthStore } from '@/store';
import { AuthService } from '@/services/authService';
import type { UserInfo, SellerSignupData } from '@/types/auth';

// 소셜 로그인 훅
export const useSocialLogin = () => {
  const setLoading = useAuthStore((s) => s.setLoading);
  const setError = useAuthStore((s) => s.setError);

  const initiateSocialLogin = useCallback(
    async (provider: 'kakao' | 'google') => {
      try {
        setLoading(true);
        setError(null);

        const authUrlData = await AuthService.getSocialAuthUrl(provider);
        window.location.href = authUrlData.authUrl;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '소셜 로그인을 시작할 수 없습니다.';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError],
  );

  return { initiateSocialLogin };
};

// 판매자 로그인 훅
export const useSellerLogin = () => {
  const setLoading = useAuthStore((s) => s.setLoading);
  const setError = useAuthStore((s) => s.setError);
  const login = useAuthStore((s) => s.login);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  const sellerLogin = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await AuthService.sellerLogin({ email, password });

        // 사용자 정보 저장 (토큰은 쿠키로 자동 관리)
        login(response.member_info);

        // 로그인 성공 후 인증 상태 다시 확인
        await checkAuth();

        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '로그인에 실패했습니다.';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, login, checkAuth],
  );

  return { sellerLogin };
};

// 판매자 회원가입 훅
export const useSellerSignup = () => {
  const setLoading = useAuthStore((s) => s.setLoading);
  const setError = useAuthStore((s) => s.setError);
  const login = useAuthStore((s) => s.login);

  const sellerSignup = useCallback(
    async (signupData: SellerSignupData) => {
      try {
        setLoading(true);
        setError(null);

        const user = await AuthService.sellerSignup(signupData);
        login(user);

        return user;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '회원가입에 실패했습니다.';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, login],
  );

  return { sellerSignup };
};

// 중복 체크 훅
export const useAvailabilityCheck = () => {
  const setError = useAuthStore((s) => s.setError);

  const checkEmail = useCallback(
    async (email: string): Promise<boolean> => {
      try {
        return await AuthService.checkEmailAvailability(email);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '이메일 중복 확인에 실패했습니다.';
        setError(errorMessage);
        return false;
      }
    },
    [setError],
  );

  const checkBusinessNumber = useCallback(
    async (businessNumber: string): Promise<boolean> => {
      try {
        return await AuthService.checkBusinessNumberAvailability(businessNumber);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '사업자등록번호 중복 확인에 실패했습니다.';
        setError(errorMessage);
        return false;
      }
    },
    [setError],
  );

  const checkBrandName = useCallback(
    async (name: string): Promise<boolean> => {
      try {
        return await AuthService.checkBrandNameAvailability(name);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '브랜드명 중복 확인에 실패했습니다.';
        setError(errorMessage);
        return false;
      }
    },
    [setError],
  );

  return { checkEmail, checkBusinessNumber, checkBrandName };
};

// 로그아웃 훅
export const useLogout = () => {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const handleLogout = useCallback(async () => {
    try {
      // 사용자 타입에 따라 적절한 로그아웃 API 호출
      if (user?.user_type === 'SELLER') {
        await AuthService.sellerLogout();
      } else {
        await AuthService.logout();
      }

      // 클라이언트 상태 초기화
      logout();
    } catch (error) {
      // 에러가 발생해도 클라이언트 상태는 초기화
      logout();
    }
  }, [logout, user]);

  return { logout: handleLogout };
};

// 판매자 프로필 조회 훅
export const useSellerProfile = () => {
  const setLoading = useAuthStore((s) => s.setLoading);
  const setError = useAuthStore((s) => s.setError);

  const getSellerProfile = useCallback(
    async (sellerId: number) => {
      try {
        setLoading(true);
        setError(null);

        const response = await AuthService.getSellerProfile(sellerId);
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '프로필 조회에 실패했습니다.';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError],
  );

  return { getSellerProfile };
};
