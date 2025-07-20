// 파일 경로: src/app/api/v1/import/chunithm/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// CORS(Cross-Origin Resource Sharing)를 허용하기 위한 공통 헤더입니다.
// 다른 도메인(예: chunithm-net.com)에서 우리 API로 요청을 보낼 수 있도록 허용합니다.
const corsHeaders = {
  // 현재는 모든 출처를 허용합니다. 보안을 강화하려면 특정 도메인으로 교체할 수 있습니다.
  // 예: 'Access-Control-Allow-Origin': 'https://chunithm-net-eng.com, https://new.chunithm-net.com'
  'Access-Control-Allow-Origin': 'https://chunithm-net-eng.com, https://new.chunithm-net.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * 브라우저가 본 요청(POST)을 보내기 전에, 먼저 보내는 'pre-flight' 요청을 처리합니다.
 * 이 OPTIONS 핸들러는 CORS 요청을 허용한다는 것을 브라우저에 알려주는 역할을 합니다.
 */
export async function OPTIONS(req: Request) {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * 북마크릿으로부터 실제 데이터(프로필, 플레이로그 등)를 받아 처리하는 POST 핸들러입니다.
 */
export async function POST(req: Request) {
  // 서버 사이드에서 현재 로그인된 사용자의 세션을 가져옵니다.
  const session = await getServerSession(authOptions);

  // 세션이 없으면 인증되지 않은 사용자로 간주하고 에러를 반환합니다.
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { gameType, region, profile, playlogs } = body; // 북마크릿에서 보낸 데이터를 추출합니다.

    // 데이터 무결성을 보장하기 위해 트랜잭션을 사용합니다.
    await prisma.$transaction(async (tx) => {
      // 1. GameProfile을 찾거나 업데이트합니다.
      const gameProfile = await tx.gameProfile.upsert({
        where: {
          userId_gameType_region: {
            userId: session.user.id,
            gameType: gameType,
            region: region,
          },
        },
        update: {
          // 북마크릿에서 가져온 최신 정보로 업데이트합니다.
          playerName: profile.playerName,
          rating: profile.rating,
          overPower: profile.overPower,
          playCount: profile.playCount,
          title: profile.title,
          character: profile.character,
        },
        create: {
          // 프로필이 없는 경우, 새로 생성합니다.
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

      // 2. 플레이로그를 갱신합니다.
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

    // 모든 작업이 성공하면 성공 메시지를 반환합니다.
    return NextResponse.json({ message: 'Data imported successfully.' }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error('[IMPORT_API_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}