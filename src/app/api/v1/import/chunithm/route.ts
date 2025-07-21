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
  console.log('[IMPORT_API] Received POST request.');

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error('[IMPORT_API] Authentication failed: No session found.');
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders });
  }
  console.log(`[IMPORT_API] User authenticated: ${session.user.id}`);

  try {
    const body = await req.json();
    const { gameType, region, profile, playlogs } = body;
    console.log(`[IMPORT_API] Data received for ${gameType} (${region}). Profile: ${profile.playerName}, Playlogs: ${playlogs?.length || 0}`);

    const safeProfile = {
      ...profile,
      rating: parseFloat(profile.rating) || 0,
      overPower: parseFloat(profile.overPower) || 0,
      playCount: parseInt(profile.playCount) || 0,
    };

    console.log('[IMPORT_API] Starting database transaction.');
    await prisma.$transaction(async (tx) => {
      console.log('[IMPORT_API] Upserting GameProfile...');
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
      console.log(`[IMPORT_API] GameProfile upserted with ID: ${gameProfile.id}`);

      if (playlogs && playlogs.length > 0) {
        console.log(`[IMPORT_API] Upserting ${playlogs.length} playlogs...`);
        let count = 0;
        for (const log of playlogs) {
          await tx.gamePlaylog.upsert({
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
          });
          count++;
          if (count % 10 === 0) {
            console.log(`[IMPORT_API] Processed ${count}/${playlogs.length} playlogs...`);
          }
        }
        console.log('[IMPORT_API] All playlogs upserted successfully.');
      }
    });
    
    console.log('[IMPORT_API] Transaction completed successfully.');
    return NextResponse.json({ message: 'Data imported successfully.' }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error('[IMPORT_API_ERROR] An error occurred during the import process:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}