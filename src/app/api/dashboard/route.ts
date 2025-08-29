// 파일 경로: src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { DashboardResponse } from '@/types';

export async function GET(): Promise<NextResponse<DashboardResponse | { error: string }>> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 데이터베이스 연결 재시도 로직
    let user;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        user = await prisma.user.findUnique({
          where: { id: session.user.id },
          include: {
            gameProfiles: {
              select: {
                id: true,
                gameType: true,
                region: true,
                playerName: true,
                rating: true,
                  isPublic: true,
              },
              orderBy: {
                updatedAt: 'desc',
              },
            },
          },
        });
        break; // 성공시 루프 종료
      } catch (dbError) {
        retryCount++;
        console.error(`Database connection attempt ${retryCount} failed:`, dbError);
        
        if (retryCount >= maxRetries) {
          throw dbError; // 최대 재시도 횟수 초과시 에러 던지기
        }
        
        // 재시도 전 대기 (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 각 프로필에 isPublic 포함
    const profiles = (user.gameProfiles || []).map((p: any) => ({
      ...p,
      isPublic: typeof p.isPublic === 'boolean' ? p.isPublic : true
    }));
    return NextResponse.json({ profiles });

  } catch (error) {
    console.error('API Error in /api/dashboard:', error);
    
    // 더 자세한 에러 정보 로깅
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}