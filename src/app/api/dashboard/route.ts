// 파일 경로: src/app/api/dashboard/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  // 서버 사이드에서 현재 로그인된 사용자의 세션을 가져옵니다.
  const session = await getServerSession(authOptions);

  // 세션이 없으면 -> 로그인되지 않은 사용자
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // 1. 해당 유저의 CHUNITHM 프로필 정보 조회
    const chunithmProfile = await prisma.chunithmProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // 프로필이 없으면 404 에러 반환
    if (!chunithmProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 2. 해당 유저의 모든 플레이로그 조회
    const chunithmPlaylogs = await prisma.chunithmPlaylog.findMany({
      where: {
        profileId: chunithmProfile.id,
      },
      orderBy: {
        // 최신 플레이 기록부터 정렬 (createdAt이 없으므로 musicId로 임시 정렬)
        musicId: 'desc',
      },
    });

    // 3. 조회한 데이터를 하나의 객체로 묶어서 반환
    const dashboardData = {
      profile: chunithmProfile,
      playlogs: chunithmPlaylogs,
    };

    return NextResponse.json(dashboardData, { status: 200 });

  } catch (error) {
    console.error('[DASHBOARD_API_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
