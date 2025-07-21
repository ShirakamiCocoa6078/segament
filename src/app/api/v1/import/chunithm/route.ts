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
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders });

  try {
    const body = await req.json();
    const { gameType, region, profile, playlogs, bestRatingList, newRatingList } = body;

    const safeProfile = {
      playerName: profile.playerName || 'Unknown',
      rating: parseFloat(profile.rating) || 0,
      overPower: parseFloat(profile.overPower) || 0,
      level: parseInt(profile.level) || 0,
      playCount: parseInt(profile.playCount) || 0,
      honors: profile.honors || [],
      teamName: profile.teamName,
      lastPlayDate: profile.lastPlayDate,
      battleRankImg: profile.battleRankImg,
      friendCode: profile.friendCode,
    };

    const gameProfile = await prisma.gameProfile.upsert({
        where: { userId_gameType_region: { userId: session.user.id, gameType, region } },
        update: { ...safeProfile },
        create: { userId: session.user.id, gameType, region, ...safeProfile },
    });
    
    await Promise.all([
        prisma.ratingList.upsert({
            where: { profileId_type: { profileId: gameProfile.id, type: 'BEST' } },
            update: { list: bestRatingList || [] },
            create: { profileId: gameProfile.id, type: 'BEST', list: bestRatingList || [] }
        }),
        prisma.ratingList.upsert({
            where: { profileId_type: { profileId: gameProfile.id, type: 'NEW' } },
            update: { list: newRatingList || [] },
            create: { profileId: gameProfile.id, type: 'NEW', list: newRatingList || [] }
        })
    ]);

    if (playlogs && playlogs.length > 0) {
        const chunkSize = 100;
        for (let i = 0; i < playlogs.length; i += chunkSize) {
            const chunk = playlogs.slice(i, i + chunkSize);
            await prisma.$transaction(
                chunk.map(log => 
                    prisma.gamePlaylog.upsert({
                        where: { profileId_musicId_difficulty: { profileId: gameProfile.id, musicId: log.title, difficulty: log.difficulty, } },
                        update: { ...log },
                        create: { profileId: gameProfile.id, musicId: log.title, ...log },
                    })
                )
            );
        }
    }
    
    return NextResponse.json({ message: 'Data imported successfully.' }, { status: 200 });
  } catch (error: any) { console.error('[IMPORT_API_ERROR]', error); return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 }); }
}