// 파일 경로: src/app/api/v1/import/chunithm/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// CORS를 허용할 도메인 목록
const allowedOrigins = [
  'https://new.chunithm-net.com',
  'https://chunithm-net-eng.com'
];

/**
 * 요청의 Origin 헤더를 확인하여 동적으로 CORS 헤더를 생성하는 함수
 * @param {Request} req - 들어온 요청 객체
 * @returns {HeadersInit} - 설정할 CORS 헤더
 */
const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  const headers: HeadersInit = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
          playerName: profile.playerName,
          rating: profile.rating,
          overPower: profile.overPower,
          playCount: profile.playCount,
          title: profile.title,
          character: profile.character,
        },
        create: {
          userId: session.user.id,
          gameType: gameType,
          region: region,
          playerName: profile.playerName,
          rating: profile.rating,
          overPower: profile.overPower,
          playCount: profile.playCount,
          title: profile.title,
          character: profile.character,
        },
      });

      if (playlogs && playlogs.length > 0) {
        for (const log of playlogs) {
          await tx.gamePlaylog.upsert({
            where: {
              profileId_musicId_difficulty: {
                profileId: gameProfile.id,
                musicId: log.musicId,
                difficulty: log.difficulty,
              },
            },
            update: {
              score: log.score,
              rank: log.rank,
              isFullCombo: log.isFullCombo,
              isAllJustice: log.isAllJustice,
            },
            create: {
              profileId: gameProfile.id,
              musicId: log.musicId,
              difficulty: log.difficulty,
              score: log.score,
              rank: log.rank,
              isFullCombo: log.isFullCombo,
              isAllJustice: log.isAllJustice,
            },
          });
        }
      }
    });
    
    return NextResponse.json({ message: 'Data imported successfully.' }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error('[IMPORT_API_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}