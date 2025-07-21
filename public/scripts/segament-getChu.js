// 파일 경로: src/app/api/v1/import/chunithm/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// CORS 설정은 이전과 동일
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

    await prisma.$transaction(async (tx) => {
      const gameProfile = await tx.gameProfile.upsert({
        where: {
          userId_gameType_region: {
            userId: session.user.id,
            gameType: gameType,
            region: region,
          },
        },
        update: {
          playerName: safeProfile.playerName,
          rating: safeProfile.rating,
          overPower: safeProfile.overPower,
          playCount: safeProfile.playCount,
          title: safeProfile.title,
        },
        create: {
          userId: session.user.id,
          gameType: gameType,
          region: region,
          playerName: safeProfile.playerName,
          rating: safeProfile.rating,
          overPower: safeProfile.overPower,
          playCount: safeProfile.playCount,
          title: safeProfile.title,
        },
      });

      if (playlogs && playlogs.length > 0) {
        // [수정] for...of 루프 대신 Promise.all을 사용하여 모든 upsert 작업을 병렬로 실행합니다.
        // 이것이 타임아웃을 해결하는 핵심입니다.
        const upsertPromises = playlogs.map(log => 
          tx.gamePlaylog.upsert({
            where: {
              profileId_musicId_difficulty: {
                profileId: gameProfile.id,
                musicId: log.title,
                difficulty: log.difficulty,
              },
            },
            update: {
              score: log.score,
              isFullCombo: log.isFullCombo,
              isAllJustice: log.isAllJustice,
            },
            create: {
              profileId: gameProfile.id,
              musicId: log.title,
              difficulty: log.difficulty,
              score: log.score,
              isFullCombo: log.isFullCombo,
              isAllJustice: log.isAllJustice,
            },
          })
        );
        // 모든 DB 작업을 한 번에 실행하고 완료될 때까지 기다립니다.
        await Promise.all(upsertPromises);
      }
    });
    
    return NextResponse.json({ message: 'Data imported successfully.' }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error('[IMPORT_API_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}