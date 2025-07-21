// 파일 경로: src/app/api/v1/import/chunithm/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

const allowedOrigins = [
  'https://new.chunithm-net.com',
  'https://chunithm-net-eng.com'
];

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  const headers: HeadersInit = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
};

export async function OPTIONS(req: Request) {
  return NextResponse.json({}, { headers: getCorsHeaders(req) });
}

export async function POST(req: Request) {
  const corsHeaders = getCorsHeaders(req);
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { gameType, region, profile, playlogs } = body;

    const safeProfile = {
      ...profile,
      rating: parseFloat(profile.rating) || 0,
      overPower: parseFloat(profile.overPower) || 0,
      playCount: parseInt(profile.playCount) || 0,
    };

    // 1. 프로필 정보를 먼저 저장/업데이트합니다.
    const gameProfile = await prisma.gameProfile.upsert({
        where: { userId_gameType_region: { userId: session.user.id, gameType, region } },
        update: {
          playerName: safeProfile.playerName,
          rating: safeProfile.rating,
          overPower: safeProfile.overPower,
          playCount: safeProfile.playCount,
          title: safeProfile.title,
        },
        create: {
          userId: session.user.id,
          gameType, region,
          playerName: safeProfile.playerName,
          rating: safeProfile.rating,
          overPower: safeProfile.overPower,
          playCount: safeProfile.playCount,
          title: safeProfile.title,
        },
    });
    
    // [추가] 새로운 레이팅 정보를 GameRatingLog에 기록합니다.
    await prisma.gameRatingLog.create({
        data: {
            profileId: gameProfile.id,
            rating: safeProfile.rating,
        }
    });

    // 2. 플레이로그가 있는 경우, 개별적으로 처리하여 안정성을 높입니다.
    if (playlogs && playlogs.length > 0) {
        let successCount = 0;
        let errorCount = 0;

        for (const log of playlogs) {
            try {
                await prisma.gamePlaylog.upsert({
                    where: {
                        profileId_musicId_difficulty: {
                            profileId: gameProfile.id,
                            musicId: log.title, // musicId는 현재 title을 사용
                            difficulty: log.difficulty,
                        },
                    },
                    update: { score: log.score, isFullCombo: log.isFullCombo, isAllJustice: log.isAllJustice },
                    create: { profileId: gameProfile.id, musicId: log.title, score: log.score, difficulty: log.difficulty, isFullCombo: log.isFullCombo, isAllJustice: log.isAllJustice },
                });
                successCount++;
            } catch (e: any) {
                errorCount++;
                // 문제가 발생한 곡의 정보만 콘솔에 기록하고, 전체 작업은 계속 진행합니다.
                console.error(`Failed to upsert playlog for song: ${log.title} (${log.difficulty})`, e.message);
            }
        }
        console.log(`[IMPORT_API] Playlog processing complete. Success: ${successCount}, Failed: ${errorCount}`);
    }
    
    return NextResponse.json({ message: 'Data imported successfully.' }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error('[IMPORT_API_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}