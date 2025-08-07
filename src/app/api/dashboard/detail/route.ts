// 파일 경로: src/app/api/dashboard/detail/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { calculateRating } from '@/lib/ratingUtils';
import songData from '@/../data/chunithmSongData.json';

// 타입 정의
interface SongInfo {
  meta: { 
    id: string;
    title: string;
    genre: string;
    version: string;
  };
  data: {
    [key: string]: {
      const: number;
      level: string;
    };
  };
}

interface RatingItem {
  id: string | number;
  difficulty: string;
  score?: number;
}

interface GameDataStructure {
  ratingLists: {
    best?: RatingItem[];
    new?: RatingItem[];
  };
  playlogs?: RatingItem[];
}

const songMap = new Map((songData as SongInfo[]).map(song => [song.meta.id.toString(), song]));

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

    if (!gameProfile || !gameProfile.gameData || !gameProfile.gameData.ratingLists) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    
    // JSON 데이터에 대한 안전한 타입 캐스팅
    const gameData = gameProfile.gameData as unknown as GameDataStructure;
    const ratingLists = gameData.ratingLists;
    
    // null 체크를 포함한 안전한 맵핑
    const safeBest = Array.isArray(ratingLists.best) ? ratingLists.best : [];
    const safeNew = Array.isArray(ratingLists.new) ? ratingLists.new : [];
    
    const bestSet = new Set(safeBest.map((s: RatingItem) => `${s.id}-${s.difficulty}`));
    const newSet = new Set(safeNew.map((s: RatingItem) => `${s.id}-${s.difficulty}`));

    const processList = (list: RatingItem[] | undefined, isPlaylog = false) => {
      if (!list || !Array.isArray(list)) return [];
      return list.map(item => {
        const songInfo = songMap.get(item.id.toString());
        const difficultyKey = item.difficulty.toLowerCase();
        const songDifficultyInfo = songInfo?.data?.[difficultyKey];
        
        const enrichedItem: any = { ...item, level: 'N/A', const: 0, ratingValue: 0 };

        if (songDifficultyInfo && typeof songDifficultyInfo.const === 'number') {
          enrichedItem.const = songDifficultyInfo.const;
          enrichedItem.level = songDifficultyInfo.level || 'N/A';
          enrichedItem.ratingValue = calculateRating(enrichedItem.const, item.score || 0);
        }

        if (isPlaylog) {
          const key = `${item.id}-${item.difficulty}`;
          if (bestSet.has(key)) {
            enrichedItem.ratingListType = 'best';
          } else if (newSet.has(key)) {
            enrichedItem.ratingListType = 'new';
          } else {
            enrichedItem.ratingListType = null;
          }
        }
        
        return enrichedItem;
      });
    };

    const enrichedGameData = {
        playlogs: processList(Array.isArray(gameData.playlogs) ? gameData.playlogs : [], true),
        ratingLists: {
            best: processList(safeBest),
            new: processList(safeNew)
        }
    };
    
    const enrichedProfile = { ...gameProfile, gameData: enrichedGameData };

    return NextResponse.json({ profile: enrichedProfile });

  } catch (error) {
    console.error('API Error in /api/dashboard/detail:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}