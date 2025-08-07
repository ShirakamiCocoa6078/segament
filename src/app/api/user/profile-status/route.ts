// 파일 경로: src/app/api/user/profile-status/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  // 서버 사이드에서 현재 로그인된 사용자의 세션을 가져옵니다.
  const session = await getServerSession(authOptions);

  // 세션이 없으면 -> 로그인되지 않은 사용자
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // DB에서 해당 유저의 gameProfile이 존재하는지 확인합니다.
    const profile = await prisma.gameProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // 프로필 존재 여부에 따라 다른 JSON 응답을 보냅니다.
    if (profile) {
      return NextResponse.json({ hasProfile: true }, { status: 200 });
    } else {
      return NextResponse.json({ hasProfile: false }, { status: 200 });
    }
  } catch (error) {
    console.error('[PROFILE_STATUS_API_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
