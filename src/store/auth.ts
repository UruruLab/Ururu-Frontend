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
  error: string | null;
  loading: boolean; // 로딩 상태
  isCheckingAuth: boolean; // 인증 확인 중인지 체크
  hasInitialized: boolean; // 초기 인증 확인 완료 여부

  // 액션들
  setLoginType: (type: 'buyer' | 'seller') => void;
  setLoading: (loading: boolean) => void;
  login: (user: UserInfo) => void;
  logout: () => void;
  setError: (error: string | null) => void;
  checkAuth: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  // 초기 상태
  loginType: 'buyer',
  isAuthenticated: false,
  user: null,
  error: null,
  loading: false,
  isCheckingAuth: false,
  hasInitialized: false,

  // 액션들
  setLoginType: (type) => set({ loginType: type }),
  setLoading: (loading) => set({ loading }),
  login: (user) => set({ isAuthenticated: true, user, error: null }),
  logout: () => set({ isAuthenticated: false, user: null, error: null }),
  setError: (error) => set({ error }),

  // 초기 인증 확인 (앱 시작 시 한 번만 호출)
  initializeAuth: async () => {
    const state = get();

    // 이미 초기화되었거나 진행 중이면 스킵
    if (state.hasInitialized || state.isCheckingAuth) {
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
      // 인터셉터가 토큰 갱신을 시도했지만 실패한 것으로 간주하고 비인증 상태로 설정
      set({
        isAuthenticated: false,
        user: null,
        hasInitialized: true,
      });
    } finally {
      set({ isCheckingAuth: false });
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
      // 인터셉터가 토큰 갱신을 시도했지만 실패한 것으로 간주하고 비인증 상태로 설정
      set({
        isAuthenticated: false,
        user: null,
        hasInitialized: true,
      });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
}));
