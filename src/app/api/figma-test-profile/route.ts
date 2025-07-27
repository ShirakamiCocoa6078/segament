// 파일 경로: src/app/api/figma-test-profile/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// 이 API는 오직 JP CHUNITHM 프로필만 불러옵니다.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const gameProfile = await prisma.gameProfile.findFirst({
      where: {
        userId: session.user.id,
        gameType: 'CHUNITHM',
        region: 'JP',
      },
    });

    if (!gameProfile) {
      return NextResponse.json({ error: 'JP CHUNITHM Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile: gameProfile });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}