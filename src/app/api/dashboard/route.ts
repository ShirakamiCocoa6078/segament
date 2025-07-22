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
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 수정: GameProfile이 없는 경우를 명시적으로 처리
    if (!user.gameProfiles || user.gameProfiles.length === 0) {
      return NextResponse.json({ profile: null });
    }

    // 기존 로직: 첫 번째 프로필을 반환
    const firstProfile = user.gameProfiles[0];
    return NextResponse.json({ profile: firstProfile });

  } catch (error) {
    console.error('API Error in /api/dashboard:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}