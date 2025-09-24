// 파일 경로: src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// TypeScript 환경에서 전역 객체(globalThis)에 'prisma' 속성을 확장합니다.
declare global {
  var prisma: PrismaClient | undefined;
}

// PrismaClient 설정
const createPrismaClient = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// globalThis.prisma가 이미 존재하면 그대로 사용하고,
// 존재하지 않으면 새로운 PrismaClient 인스턴스를 생성하여 할당합니다.
// 개발 환경에서만 globalThis를 사용하여,
// Next.js의 빠른 새로고침(Fast Refresh) 시 불필요하게 많은 인스턴스가 생성되는 것을 방지합니다.
const client = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = client;
}

// 애플리케이션 종료 시 Prisma 연결 정리
// Edge Runtime(서버리스) 환경에서는 process.on 사용 금지
// if (typeof window === 'undefined' && typeof process !== 'undefined' && process.on) {
//   process.on('beforeExit', async () => {
//     await client.$disconnect();
//   });
// }

export default client;
