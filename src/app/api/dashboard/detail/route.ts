// 파일 경로: src/app/api/dashboard/detail/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

// A-1 단계에서 생성한 유틸리티 함수를 import 합니다.
import { calculateRating } from '@/lib/ratingUtils';
// 마스터 데이터를 import 합니다.
import songData from '@/../data/chunithmSongData.json';

// songData를 idx 기반으로 빠르게 조회할 수 있도록 Map 형태로 변환합니다.
const songMap = new Map(songData.map(song => [song.meta.id.toString(), song]));

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
        gameData: true,
      },
    });

    if (!gameProfile || !gameProfile.gameData) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // --- 레이팅 계산 로직 추가 ---
    const processRatingList = (list: any[]) => {
      if (!list) return [];
      return list.map(item => {
        const songInfo = songMap.get(item.id);
        const difficultyKey = item.difficulty.toLowerCase();

        if (songInfo && songInfo.data[difficultyKey]) {
          const constant = songInfo.data[difficultyKey].const;
          const ratingValue = calculateRating(constant, item.score);
          return { ...item, const: constant, ratingValue: ratingValue };
        }
        return { ...item, const: 0, ratingValue: 0 }; // 마스터 데이터에 없는 경우
      });
    };

    const enrichedGameData = {
        ...gameProfile.gameData,
        ratingLists: {
            best: processRatingList(gameProfile.gameData.ratingLists.best),
            new: processRatingList(gameProfile.gameData.ratingLists.new)
        }
    };
    
    const enrichedProfile = { ...gameProfile, gameData: enrichedGameData };

    return NextResponse.json({ profile: enrichedProfile });

  } catch (error) {
    console.error('API Error in /api/dashboard/detail:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}