import { create } from 'zustand';
import api from '@/lib/axios';
import type { UserInfo } from '@/types/auth';
import axios from 'axios';

// 인증 상태 타입
interface AuthState {
  // 로그인 상태
  loginType: 'buyer' | 'seller';
  isAuthenticated: boolean;
  user: UserInfo | null;
  isLoading: boolean;
  error: string | null;
  isCheckingAuth: boolean; // 인증 확인 중인지 체크
  hasInitialized: boolean; // 초기 인증 확인 완료 여부

  // 액션들
  setLoginType: (type: 'buyer' | 'seller') => void;
  login: (user: UserInfo) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  checkAuth: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  // 초기 상태
  loginType: 'buyer',
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  isCheckingAuth: false,
  hasInitialized: false,

  // 액션들
  setLoginType: (type) => set({ loginType: type }),
  login: (user) => set({ isAuthenticated: true, user, error: null }),
  logout: () => set({ isAuthenticated: false, user: null, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // 초기 인증 확인 (앱 시작 시 한 번만 호출)
  initializeAuth: async () => {
    const state = get();

    // 이미 초기화되었거나 진행 중이면 스킵
    if (state.hasInitialized || state.isCheckingAuth) {
      return;
    }

    set({ isCheckingAuth: true, isLoading: true });
    try {
      const response = await api.get('/auth/me');

      if (response.data.success && response.data.data?.member_info) {
        set({
          isAuthenticated: true,
          user: response.data.data.member_info,
          error: null,
          hasInitialized: true,
        });
      } else {
        set({
          isAuthenticated: false,
          user: null,
          hasInitialized: true,
        });
      }
    } catch (error: any) {
      // 401 에러인 경우 토큰 갱신을 시도
      if (error?.response?.status === 401) {
        try {
          // 토큰 갱신 시도 (기본 axios 사용, 인터셉터 제외)
          const refreshResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/auth/refresh`,
            {},
            { withCredentials: true },
          );

          if (refreshResponse.data.success) {
            // 토큰 갱신 성공 시 다시 인증 확인
            const authResponse = await api.get('/auth/me');

            if (authResponse.data.success && authResponse.data.data?.member_info) {
              set({
                isAuthenticated: true,
                user: authResponse.data.data.member_info,
                error: null,
                hasInitialized: true,
              });
              return; // 성공적으로 인증됨
            }
          }
        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그아웃 상태로 설정
        }
      }

      // 토큰 갱신 실패 또는 다른 에러인 경우 로그아웃 상태로 설정
      set({
        isAuthenticated: false,
        user: null,
        hasInitialized: true,
      });
    } finally {
      set({ isLoading: false, isCheckingAuth: false });
    }
  },

  // 일반 인증 확인 (idempotent)
  checkAuth: async () => {
    const state = get();

    // 이미 인증 확인 중이면 스킵
    if (state.isCheckingAuth) {
      return;
    }

    set({ isCheckingAuth: true });
    try {
      const response = await api.get('/auth/me');

      if (response.data.success && response.data.data?.member_info) {
        set({
          isAuthenticated: true,
          user: response.data.data.member_info,
          error: null,
        });
      } else {
        set({ isAuthenticated: false, user: null });
      }
    } catch (error: any) {
      // 401 에러인 경우 토큰 갱신을 시도
      if (error?.response?.status === 401) {
        try {
          // 토큰 갱신 시도 (기본 axios 사용, 인터셉터 제외)
          const refreshResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/auth/refresh`,
            {},
            { withCredentials: true },
          );

          if (refreshResponse.data.success) {
            // 토큰 갱신 성공 시 다시 인증 확인
            const authResponse = await api.get('/auth/me');

            if (authResponse.data.success && authResponse.data.data?.member_info) {
              set({
                isAuthenticated: true,
                user: authResponse.data.data.member_info,
                error: null,
              });
              return; // 성공적으로 인증됨
            }
          }
        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그아웃 상태로 설정
        }
      }

      // 토큰 갱신 실패 또는 다른 에러인 경우 로그아웃 상태로 설정
      set({ isAuthenticated: false, user: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
}));
