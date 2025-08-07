// 파일 경로: src/app/api/v1/import/chunithm/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function OPTIONS(request: NextRequest) {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return new NextResponse(null, { headers });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { gameType, region, profile, gameData } = body;

    if (!profile || !profile.playerName) {
      return NextResponse.json({ message: 'Player name is missing.' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const gameProfile = await tx.gameProfile.upsert({
        where: { userId_gameType_region: { userId: session.user.id, gameType, region } },
        update: profile,
        create: { ...profile, userId: session.user.id, gameType, region },
      });

      await tx.gameData.upsert({
        where: { profileId: gameProfile.id },
        update: {
          playlogs: gameData.playlogs,
          ratingLists: gameData.ratingLists,
        },
        create: {
          profileId: gameProfile.id,
          playlogs: gameData.playlogs,
          ratingLists: gameData.ratingLists,
        }
      });

      return gameProfile;
    });

    return NextResponse.json({ message: 'Data imported successfully.', profileId: result.id }, { status: 200 });
  } catch (error) {
    console.error('API Error in /api/v1/import/chunithm:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}