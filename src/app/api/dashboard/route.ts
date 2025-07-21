// 파일 경로: src/app/api/dashboard/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // 현재는 CHUNITHM JP 프로필을 기본으로 가져옵니다.
    const gameProfile = await prisma.gameProfile.findUnique({
      where: {
        userId_gameType_region: {
          userId: session.user.id,
          gameType: 'CHUNITHM',
          region: 'JP', // 추후 이 부분을 동적으로 변경할 수 있습니다.
        },
      },
    });

    if (!gameProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const playlogs = await prisma.gamePlaylog.findMany({
      where: {
        profileId: gameProfile.id,
      },
    });

    return NextResponse.json({ gameProfile, playlogs }, { status: 200 });

  } catch (error) {
    console.error('[DASHBOARD_API_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}