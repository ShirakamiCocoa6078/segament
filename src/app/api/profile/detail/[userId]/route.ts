// 파일 경로: src/app/api/profile/detail/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get('gameType');
    const region = searchParams.get('region');
    const { userId } = await params;

    if (!gameType || !region) {
      return NextResponse.json(
        { error: 'gameType과 region이 필요합니다.' },
        { status: 400 }
      );
    }

    // 유저가 존재하는지 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        name: true 
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: '유저를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 세션 확인 - 본인이면 모든 데이터 제공
    const session = await getServerSession();
    const isOwner = session?.user?.email === user.email;

    // 프로필 데이터 가져오기
    const profile = await prisma.gameProfile.findFirst({
      where: {
        userId: userId,
        gameType: gameType,
        region: region,
      },
      include: {
        gameData: true,
      }
    });

    if (!profile) {
      return NextResponse.json(
        { error: '해당 게임의 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비공개 프로필 접근 제한
    if (!profile.isPublic && !isOwner) {
      return NextResponse.json(
        { error: '비공개 프로필입니다.' },
        { status: 403 }
      );
    }

    // 공개용 데이터 구성
    const publicProfile = {
      playerName: profile.playerName,
      rating: profile.rating,
      level: profile.level,
      honors: profile.honors,
      teamName: profile.teamName,
      playCount: profile.playCount,
      gameData: {
        // 레이팅 리스트 제공
        ratingLists: profile.gameData?.ratingLists || { best: [], new: [] },
        // 본인인 경우에만 전체 플레이 로그 제공
        ...(isOwner && {
          playlogs: profile.gameData?.playlogs || []
        })
      }
    };

    return NextResponse.json({ 
      profile: publicProfile,
      accessMode: isOwner ? 'owner' : 'visitor'
    });

  } catch (error) {
    console.error('Profile detail API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
