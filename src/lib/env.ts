// 파일 경로: src/lib/env.ts

function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name] || defaultValue;
  
  if (!value) {
    throw new Error(`환경변수 ${name}이 설정되지 않았습니다.`);
  }
  
  return value;
}

export const env = {
  GOOGLE_CLIENT_ID: getEnvVar('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: getEnvVar('GOOGLE_CLIENT_SECRET'),
  NEXTAUTH_SECRET: getEnvVar('NEXTAUTH_SECRET'),
  NEXTAUTH_URL: getEnvVar('NEXTAUTH_URL'),
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
} as const;

// 개발/프로덕션 환경 체크
export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
