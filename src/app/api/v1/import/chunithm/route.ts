// 파일 경로: src/app/api/v1/import/chunithm/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

interface ProfileData {
  rating: number;
  overPower: number;
  playCount: number;
  playerName?: string;
  title?: string;
  character?: string;
}

interface PlaylogData {
  musicId: string;  // string 타입으로 변경
  difficulty: string;
  score: number;
  rank?: string;
  isNewRecord?: boolean;
  isFullCombo?: boolean;
  isAllJustice?: boolean;
}

interface ImportRequestBody {
  profile: ProfileData;
  playlogs: PlaylogData[];
}

export async function POST(req: Request) {
  try {
    // 사용자 인증 확인
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // 요청 본문에서 데이터 추출
    const body: ImportRequestBody = await req.json();
    const { profile, playlogs } = body;

    if (!profile || !playlogs || !Array.isArray(playlogs)) {
      return NextResponse.json(
        { error: 'Invalid request body. Profile and playlogs are required.' },
        { status: 400 }
      );
    }

    // 사용자의 CHUNITHM 프로필 존재 여부 확인
    const existingProfile = await prisma.chunithmProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'CHUNITHM profile not found. Please create a profile first.' },
        { status: 404 }
      );
    }

    // 트랜잭션으로 프로필 업데이트와 플레이로그 갱신을 묶어서 처리
    await prisma.$transaction(async (tx) => {
      // 1. 프로필 업데이트
      await tx.chunithmProfile.update({
        where: { userId: session.user.id },
        data: {
          rating: profile.rating,
          overPower: profile.overPower,
          playCount: profile.playCount,
          playerName: profile.playerName || existingProfile.playerName,
          title: profile.title,
          character: profile.character,
          updatedAt: new Date(),
        }
      });

      // 2. 플레이로그 갱신 (upsert)
      for (const playlog of playlogs) {
        await tx.chunithmPlaylog.upsert({
          where: {
            profileId_musicId_difficulty: {
              profileId: existingProfile.id,
              musicId: playlog.musicId,
              difficulty: playlog.difficulty,
            }
          },
          create: {
            profileId: existingProfile.id,
            musicId: playlog.musicId,
            difficulty: playlog.difficulty,
            score: playlog.score,
            rank: playlog.rank,
            isFullCombo: playlog.isFullCombo || false,
            isAllJustice: playlog.isAllJustice || false,
          },
          update: {
            score: playlog.score,
            rank: playlog.rank,
            isFullCombo: playlog.isFullCombo || false,
            isAllJustice: playlog.isAllJustice || false,
          }
        });
      }
    });

    // 성공 응답
    return NextResponse.json(
      { 
        message: 'Data imported successfully',
        profileUpdated: true,
        playlogsProcessed: playlogs.length 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[CHUNITHM_IMPORT_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
