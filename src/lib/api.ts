// 파일 경로: src/lib/api.ts

import type { ApiResponse } from '@/types';

// API 호출을 위한 공통 함수
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 공통 fetch 함수
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData.code
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('네트워크 오류가 발생했습니다.');
  }
}

// GET 요청
export async function apiGet<T>(url: string, options?: RequestInit): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'GET' });
}

// POST 요청
export async function apiPost<T>(
  url: string,
  data?: any,
  options?: RequestInit
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// PUT 요청
export async function apiPut<T>(
  url: string,
  data?: any,
  options?: RequestInit
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// DELETE 요청
export async function apiDelete<T>(url: string, options?: RequestInit): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'DELETE' });
}

// API 응답 래퍼
export function createApiResponse<T>(
  data?: T,
  error?: string,
  success: boolean = !error
): ApiResponse<T> {
  return {
    success,
    data,
    error,
  };
}
