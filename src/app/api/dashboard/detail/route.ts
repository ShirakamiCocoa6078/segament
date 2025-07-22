// 파일 경로: src/app/api/dashboard/detail/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const gameType = searchParams.get('gameType');
  const region = searchParams.get('region');

  if (!gameType || !region) {
    return NextResponse.json({ error: 'GameType and Region are required' }, { status: 400 });
  }

  try {
    const gameProfile = await prisma.gameProfile.findUnique({
      where: {
        userId_gameType_region: {
          userId: session.user.id,
          gameType: gameType.toUpperCase(),
          region: region.toUpperCase(),
        },
      },
      include: {
        gameData: true, // 상세 페이지이므로 모든 데이터를 포함합니다.
      },
    });

    if (!gameProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile: gameProfile });
  } catch (error) {
    console.error('API Error in /api/dashboard/detail:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}