// 파일 경로: src/app/api/v1/import/chunithm/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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
    const { gameType, region, profile, playlogs, bestRatingList, newRatingList } = body;

    if (!profile || !profile.playerName) {
      return NextResponse.json({ message: 'Player name is missing.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const gameProfile = await prisma.gameProfile.upsert({
      where: { userId_gameType_region: { userId: user.id, gameType, region } },
      update: profile,
      create: { ...profile, userId: user.id, gameType, region },
    });
    
    await prisma.ratingList.upsert({
      where: { profileId_type: { profileId: gameProfile.id, type: 'BEST' } },
      update: { list: bestRatingList },
      create: { profileId: gameProfile.id, type: 'BEST', list: bestRatingList },
    });
    
    await prisma.ratingList.upsert({
        where: { profileId_type: { profileId: gameProfile.id, type: 'NEW' } },
        update: { list: newRatingList },
        create: { profileId: gameProfile.id, type: 'NEW', list: newRatingList },
    });


    if (playlogs && playlogs.length > 0) {
      const chunkSize = 100;
      for (let i = 0; i < playlogs.length; i += chunkSize) {
        const chunk = playlogs.slice(i, i + chunkSize);
        await prisma.$transaction(
          chunk.map(log => {
            const { title, ...playlogData } = log;
            const musicId = title;

            return prisma.gamePlaylog.upsert({
              where: { profileId_musicId_difficulty: { profileId: gameProfile.id, musicId, difficulty: log.difficulty } },
              update: playlogData,
              create: {
                profileId: gameProfile.id,
                musicId,
                ...playlogData
              },
            });
          })
        );
      }
    }
    
    return NextResponse.json({ message: 'Data imported successfully.' }, { status: 200 });
  } catch (error) {
    console.error('API Error in /api/v1/import/chunithm:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}