// 유효성 검사 관련 상수들
export const VALIDATION_CONSTANTS = {
  // 비밀번호 관련
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 50,
    SPECIAL_CHARS: /[@$!%*#?&]/,
    LETTERS: /[a-zA-Z]/,
    NUMBERS: /[0-9]/,
  },

  // 입력 필드 최대 길이
  MAX_LENGTHS: {
    NICKNAME: 14,
    BRAND: 20,
    COMPANY: 20,
    CEO: 20,
    BUSINESS_NUMBER: 10,
    PHONE: 11,
    EMAIL: 100,
  },

  // 전화번호 관련
  PHONE: {
    MAX_LENGTH: 11,
    FORMATTED_MAX_LENGTH: 13,
  },

  // 사업자등록번호 관련
  BUSINESS_NUMBER: {
    MAX_LENGTH: 10,
    FORMATTED_MAX_LENGTH: 12,
  },

  // 생년월일 관련
  BIRTH: {
    MIN_YEAR: 1900,
    MAX_YEAR: new Date().getFullYear(),
  },
} as const;
