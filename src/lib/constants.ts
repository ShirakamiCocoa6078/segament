// 파일 경로: src/lib/constants.ts

// 애플리케이션 상수
export const APP_NAME = 'Segament';
export const APP_DESCRIPTION = '내수/국제판 프로필 등록 시스템';

// 게임 관련 상수
export const GAME_TYPES = {
  CHUNITHM: 'CHUNITHM',
  MAIMAI: 'MAIMAI',
} as const;

export const REGIONS = {
  JP: 'JP',
  INTL: 'INTL',
} as const;

// UI 관련 상수
export const MOBILE_BREAKPOINT = 768;

// API 관련 상수
export const API_ENDPOINTS = {
  DASHBOARD: '/api/dashboard',
  AUTH: {
    CHECK_USERNAME: '/api/auth/check-username',
    REGISTER: '/api/auth/register',
  },
  V1: {
    IMPORT_CHUNITHM: '/api/v1/import/chunithm',
  },
} as const;

// 메시지 상수
export const MESSAGES = {
  LOADING: '데이터를 불러오는 중...',
  ERROR: {
    GENERIC: '오류가 발생했습니다.',
    NETWORK: '네트워크 오류가 발생했습니다.',
    UNAUTHORIZED: '로그인이 필요합니다.',
    NOT_FOUND: '요청한 데이터를 찾을 수 없습니다.',
  },
  SUCCESS: {
    COPY: '클립보드에 복사되었습니다!',
    SAVE: '저장되었습니다.',
  },
} as const;

// 타입 가드
export type GameType = typeof GAME_TYPES[keyof typeof GAME_TYPES];
export type Region = typeof REGIONS[keyof typeof REGIONS];
