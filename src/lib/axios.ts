import axios, { AxiosError, AxiosResponse } from 'axios';
import type { ApiResponse, ApiError } from '@/types/api';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  withCredentials: true, // 쿠키 자동 전송
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 갱신 중인지 체크하는 플래그
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 네트워크 에러 처리
    if (!error.response) {
      return Promise.reject({
        message: '네트워크 연결을 확인해주세요.',
        status: 0,
      });
    }

    const originalRequest = error.config;

    // 401 또는 403 에러 처리 - 토큰 갱신 시도
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 큐에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 토큰 갱신 요청 (기본 axios 사용, 인터셉터 제외)
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        if (refreshResponse.data.success) {
          processQueue(null, refreshResponse.data.data?.access_token);

          // 원래 요청 재시도
          return api(originalRequest);
        } else {
          throw new Error('토큰 갱신 실패');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 서버 에러 처리
    const errorMessage = error.response?.data?.message || '서버 오류가 발생했습니다.';
    const errorStatus = error.response?.status || 500;
    const errorCode = error.response?.data?.code || 'UNKNOWN_ERROR';

    return Promise.reject({
      message: errorMessage,
      status: errorStatus,
      code: errorCode,
    });
  },
);

// API 에러 처리 함수
export const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    return {
      message: axiosError.response?.data?.message || '서버 오류가 발생했습니다.',
      status: axiosError.response?.status || 500,
      code: axiosError.response?.data?.code || 'UNKNOWN_ERROR',
    };
  }

  return {
    message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    status: 500,
    code: 'UNKNOWN_ERROR',
  };
};

export default api;

export const axiosInstance = api;
