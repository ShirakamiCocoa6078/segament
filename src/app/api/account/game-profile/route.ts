import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient, GameType, Region } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      game,
      region,
      // userId from bookmarklet is now gameUserId
      lastPlayDate,
      playerInfo,
      playlogs,
      ratingLists,
      level,
      rating,
      overPower,
      playCount,
      playerName,
      friendCode,
      honors,
      ratingHistory,
    } = body;

    if (!game || !region) {
      return NextResponse.json({ error: 'Missing required fields: game, region' }, { status: 400 });
    }

    const profile = await prisma.gameProfile.upsert({
      where: {
        userSystemId_gameType_region: {
          userSystemId: session.user.id,
          gameType: game as GameType,
          region: region as Region,
        },
      },
      update: {
        playerName: playerName,
        friendCode: friendCode,
        lastPlayDate: lastPlayDate,
        level: level,
        rating: rating,
        overPower: overPower,
        playCount: playCount,
        playerInfo: playerInfo,
        playlogs: playlogs,
        ratingLists: ratingLists,
        honors: honors,
        ratingHistory: ratingHistory,
      },
      create: {
        userSystemId: session.user.id,
        gameType: game as GameType,
        region: region as Region,
        playerName: playerName,
        friendCode: friendCode,
        lastPlayDate: lastPlayDate,
        level: level,
        rating: rating,
        overPower: overPower,
        playCount: playCount,
        playerInfo: playerInfo,
        playlogs: playlogs,
        ratingLists: ratingLists,
        honors: honors,
        ratingHistory: ratingHistory,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error upserting game profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { profileId } = await req.json();

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    // Delete the GameProfile directly, ensuring the user owns it.
    await prisma.gameProfile.delete({
      where: {
        profileId: profileId,
        userSystemId: session.user.id,
      },
    });

    return NextResponse.json({ message: 'Game profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting game profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
