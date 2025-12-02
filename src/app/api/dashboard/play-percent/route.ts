import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { GameType, Region } from '@prisma/client';
import songData from '@/lib/chunithmSongData.json';

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
        userSystemId_gameType_region: {
          userSystemId: session.user.id,
          gameType: gameType.toUpperCase() as GameType,
          region: region.toUpperCase() as Region,
        },
      },
    });

    if (!gameProfile || !gameProfile.playlogs) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 곡 전체 개수
    const totalSongs = Array.isArray(songData) ? songData.length : 0;
    // 플레이한 곡 개수
    const playedSongs = Array.isArray(gameProfile.playlogs)
      ? (gameProfile.playlogs as any[]).length
      : 0;
    // 플레이 퍼센트
    const playPercentage = totalSongs > 0 ? Math.round((playedSongs / totalSongs) * 10000) / 100 : 0;

    // 난이도별 breakdown
    const difficultyBreakdown: Record<string, { total: number; played: number; percentage: number }> = {};
    if (Array.isArray(songData)) {
      for (const song of songData) {
        for (const diffKey of Object.keys(song.data)) {
          if (!difficultyBreakdown[diffKey]) {
            difficultyBreakdown[diffKey] = { total: 0, played: 0, percentage: 0 };
          }
          difficultyBreakdown[diffKey].total += 1;
        }
      }
      if (Array.isArray(gameProfile.playlogs)) {
        for (const log of gameProfile.playlogs as any[]) {
          if (log && typeof log === 'object' && 'difficulty' in log && typeof log.difficulty === 'string') {
            const diffKey = log.difficulty.toLowerCase();
            if (difficultyBreakdown[diffKey]) {
              difficultyBreakdown[diffKey].played += 1;
            }
          }
        }
      }
      for (const diffKey of Object.keys(difficultyBreakdown)) {
        const { total, played } = difficultyBreakdown[diffKey];
        difficultyBreakdown[diffKey].percentage = total > 0 ? Math.round((played / total) * 10000) / 100 : 0;
      }
    }

    return NextResponse.json({
      playData: {
        totalSongs,
        playedSongs,
        playPercentage,
        difficultyBreakdown,
      },
    });
  } catch (error) {
    console.error('API Error in /api/dashboard/play-percent:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
