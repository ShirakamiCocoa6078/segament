// 파일 경로: src/types/index.ts

// 공통 타입 정의



// id: cuid(내부 고유 id), userId: 공개용 id(고유, 변경 가능성 있음)
export interface ProfileSummary {
  id: string; // 내부 DB용 cuid
  userId: string; // 공개용 userId 
  gameType: string;
  region: string;
  playerName: string;
  rating: number;
  isPublic: boolean;
}



// id: cuid(내부 고유 id), userId: 공개용 id(고유, 변경 가능성 있음)
export interface GameProfile {
  id: string; // 내부 DB용 cuid
  userId: string; // 공개용 userId 
  gameType: string;
  region: string;
  playerName: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}



// id: cuid(내부 고유 id), userId: 공개용 id(고유, 변경 가능성 있음)
export interface User {
  id: string; // 내부 DB용 cuid
  userId: string; // 공개용 userId (URL, 외부 노출 등에서만 사용)
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
