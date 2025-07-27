// 파일 경로: src/app/api/dashboard/detail/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { calculateRating } from '@/lib/ratingUtils';
import songData from '@/../data/chunithmSongData.json';

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

    const processList = (list: any[]) => {
      if (!list) return [];
      return list.map(item => {
        const songInfo = songMap.get(item.id.toString());
        const difficultyKey = item.difficulty.toLowerCase();
        
        const songDifficultyInfo = songInfo?.data?.[difficultyKey];

        // --- 수정: 데이터 유효성 검사 강화 ---
        if (songDifficultyInfo && typeof songDifficultyInfo.const === 'number') {
          const constant = songDifficultyInfo.const;
          const level = songDifficultyInfo.level || 'N/A';
          const ratingValue = calculateRating(constant, item.score);
          return { ...item, level, const: constant, ratingValue: ratingValue };
        }
        
        // 유효한 보면 상수 정보를 찾지 못한 모든 경우에 대한 안전한 기본값 반환
        return { ...item, level: 'N/A', const: 0, ratingValue: 0 };
      });
    };

    const enrichedGameData = {
        playlogs: processList(gameProfile.gameData.playlogs),
        ratingLists: {
            best: processList(gameProfile.gameData.ratingLists.best),
            new: processList(gameProfile.gameData.ratingLists.new)
        }
    };
    
    const enrichedProfile = { ...gameProfile, gameData: enrichedGameData };

    return NextResponse.json({ profile: enrichedProfile });

  } catch (error) {
    console.error('API Error in /api/dashboard/detail:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}