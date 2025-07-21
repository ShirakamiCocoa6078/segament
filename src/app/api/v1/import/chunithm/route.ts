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
    // [수정] 이제 profile 또는 playlogsChunk 둘 중 하나만 처리합니다.
    const { gameType, region, profile, playlogsChunk, isFirstChunk, isLastChunk } = body;

    // 첫 번째 청크는 프로필 정보를 포함합니다.
    if (isFirstChunk && profile) {
      const safeProfile = {
        ...profile,
        rating: parseFloat(profile.rating) || 0,
        overPower: parseFloat(profile.overPower) || 0,
        playCount: parseInt(profile.playCount) || 0,
      };

      const gameProfile = await prisma.gameProfile.upsert({
        where: { userId_gameType_region: { userId: session.user.id, gameType, region } },
        update: { ...safeProfile },
        create: { userId: session.user.id, gameType, region, ...safeProfile },
      });

      // 프로필 ID를 반환하여 북마크릿이 다음 요청에 사용하도록 합니다.
      return NextResponse.json({ message: 'Profile chunk processed.', profileId: gameProfile.id }, { status: 200, headers: corsHeaders });
    }

    // 두 번째부터는 플레이로그 청크만 처리합니다.
    if (playlogsChunk && playlogsChunk.length > 0) {
      const { profileId } = body;
      if (!profileId) {
        return NextResponse.json({ error: 'profileId is required for playlog chunks.' }, { status: 400, headers: corsHeaders });
      }

      await prisma.$transaction(
        playlogsChunk.map(log =>
          prisma.gamePlaylog.upsert({
            where: {
              profileId_musicId_difficulty: {
                profileId: profileId,
                musicId: log.title,
                difficulty: log.difficulty,
              },
            },
            update: { score: log.score, isFullCombo: log.isFullCombo, isAllJustice: log.isAllJustice },
            create: { profileId, musicId: log.title, ...log },
          })
        )
      );
      
      return NextResponse.json({ message: `Playlog chunk processed. isLastChunk: ${isLastChunk}` }, { status: 200, headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400, headers: corsHeaders });

  } catch (error: any) {
    console.error('[IMPORT_API_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}