// 파일 경로: src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        gameProfiles: {
          include: {
            gameData: false, // 메인 대시보드에서는 무거운 상세 데이터는 제외합니다.
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    });

    if (!user || !user.gameProfiles || user.gameProfiles.length === 0) {
      // 수정: profiles 배열을 반환하도록 통일합니다.
      return NextResponse.json({ profiles: [] });
    }

    // 수정: 모든 프로필 목록을 반환합니다.
    return NextResponse.json({ profiles: user.gameProfiles });

  } catch (error) {
    console.error('API Error in /api/dashboard:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}