/**
 * 점수를 기반으로 CHUNITHM 랭크 문자열을 반환합니다.
 * @param score - 변환할 점수
 * @returns 랭크 문자열 (예: 'SSS+', 'SS', 'A')
 */
export function scoreToRank(score: number): string {
  if (score >= 1009000) return 'SSS+';
  if (score >= 1007500) return 'SSS';
  if (score >= 1005000) return 'SS+';
  if (score >= 1000000) return 'SS';
  if (score >= 990000) return 'S+';
  if (score >= 975000) return 'S';
  if (score >= 950000) return 'AAA';
  if (score >= 925000) return 'AA';
  if (score >= 900000) return 'A';
  if (score >= 800000) return 'BBB';
  if (score >= 700000) return 'B';
  if (score >= 600000) return 'C';
  return 'D';
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 숫자 포맷팅 함수
export function formatRating(rating: number, decimals: number = 2): string {
  return rating.toFixed(decimals);
}

// 안전한 JSON 파싱
export function safeParseJSON<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}

// 디바운스 함수
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// 로컬 스토리지 헬퍼 (클라이언트 사이드에서만 사용)
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key: string, value: any): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

// URL slug 생성
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
