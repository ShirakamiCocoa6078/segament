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

    if (playlogs && playlogs.length > 0) {
        const chunkSize = 100; // 한 번에 처리할 데이터 묶음 크기
        for (let i = 0; i < playlogs.length; i += chunkSize) {
            const chunk = playlogs.slice(i, i + chunkSize);
            
            await prisma.$transaction(
                chunk.map(log => 
                    prisma.gamePlaylog.upsert({
                        where: {
                            profileId_musicId_difficulty: {
                                profileId: gameProfile.id,
                                musicId: log.title,
                                difficulty: log.difficulty,
                            },
                        },
                        update: { score: log.score, isFullCombo: log.isFullCombo, isAllJustice: log.isAllJustice },
                        create: { profileId: gameProfile.id, musicId: log.title, score: log.score, difficulty: log.difficulty, isFullCombo: log.isFullCombo, isAllJustice: log.isAllJustice },
                    })
                )
            );
            console.log(`[IMPORT_API] Processed chunk, logs ${i + 1}-${i + chunk.length}/${playlogs.length}`);
        }
    }
    
    return NextResponse.json({ message: 'Data imported successfully.' }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error('[IMPORT_API_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}