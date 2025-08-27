// 파일 경로: src/types/index.ts

// 공통 타입 정의

export interface ProfileSummary {
  id: string;
  gameType: string;
  region: string;
  playerName: string;
  rating: number;
  isPublic: boolean;
}

export interface GameProfile {
  id: string;
  userId: string;
  gameType: string;
  region: string;
  playerName: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  apiKey?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardResponse {
  profiles: ProfileSummary[];
}

// 폼 관련 타입
export interface SignupFormData {
  email: string;
  name: string;
  image?: string;
  providerAccountId: string;
  provider: string;
}

// 이벤트 핸들러 타입
export type AsyncEventHandler<T = void> = () => Promise<T>;
export type EventHandler<T = void> = () => T;
