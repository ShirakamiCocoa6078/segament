// 파일 경로: src/app/api/profile/detail/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { GameType, Region } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get('gameType');
    const region = searchParams.get('region');
    const { userId } = await params;

    if (!gameType || !region) {
      return NextResponse.json(
        { error: 'gameType과 region이 필요합니다.' },
        { status: 400 }
      );
    }

    // 유저가 존재하는지 확인
    const user = await prisma.user.findUnique({
      where: { userId: userId },
      select: { 
        id: true, 
        email: true, 
        name: true 
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: '유저를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 세션 확인 - 본인이면 모든 데이터 제공
    const session = await getServerSession();
    const isOwner = session?.user?.email === user.email;

    // 프로필 데이터 가져오기 (userSystemId에는 user.id(cuid) 사용)
    const profile = await prisma.gameProfile.findFirst({
      where: {
        userSystemId: user.id,
        gameType: gameType as GameType,
        region: region as Region,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: '해당 게임의 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비공개 프로필 접근 제한
    if (!profile.isPublic && !isOwner) {
      return NextResponse.json(
        { error: '비공개 프로필입니다.' },
        { status: 403 }
      );
    }

    // 공개용 데이터 구성

    // playerInfo에서 friendCode, honors, teamName 등 추출
    let honors = undefined;
    let friendCode = undefined;
    let teamName = undefined;
    let teamEmblemColor = undefined;
    let characterImage = undefined;
    let playerInfo = undefined;
    if (profile.playerInfo) {
      try {
        playerInfo = typeof profile.playerInfo === 'string' ? JSON.parse(profile.playerInfo) : profile.playerInfo;
        honors = playerInfo.honors;
        friendCode = playerInfo.friendCode;
        teamName = playerInfo.teamName;
        teamEmblemColor = playerInfo.teamEmblemColor;
        characterImage = playerInfo.characterImage;
      } catch (e) {
        // 파싱 실패시 무시
      }
    }


    // chunithmSongData import (곡 정보 enrich용)
    const songData = (await import('@/lib/chunithmSongData.json')).default;
    const songMap = new Map((songData as any[]).map((song: any) => [song.meta.id.toString(), song]));

    // 곡 정보 enrich 함수 (dashboard/detail과 동일)
    function processList(list: any[] | undefined, playlogs: any[] = []) {
      if (!list || !Array.isArray(list)) return [];
      // playlogMap 생성
      const playlogMap = new Map();
      if (Array.isArray(playlogs)) {
        playlogs.forEach((log: any) => {
          const key = `${log.id}-${log.difficulty}`;
          playlogMap.set(key, log);
        });
      }
      return list.map(item => {
        const songInfo = songMap.get(item.id?.toString?.() ?? '');
        const difficultyKey = item.difficulty?.toLowerCase?.() ?? '';
        const songDifficultyInfo = songInfo?.data?.[difficultyKey];
        const enrichedItem: any = { ...item, level: 'N/A', const: 0, ratingValue: 0 };
        if (songDifficultyInfo && typeof songDifficultyInfo.const === 'number') {
          enrichedItem.const = songDifficultyInfo.const;
          enrichedItem.level = songDifficultyInfo.level || 'N/A';
        }
        // playlog 정보 병합
        const key = `${item.id}-${item.difficulty}`;
        const playlogEntry = playlogMap.get(key);
        if (playlogEntry) {
          enrichedItem.clearType = playlogEntry.clearType;
          enrichedItem.comboType = playlogEntry.comboType;
          enrichedItem.fullChainType = playlogEntry.fullChainType;
          enrichedItem.isFullCombo = playlogEntry.isFullCombo;
          enrichedItem.isAllJustice = playlogEntry.isAllJustice;
          enrichedItem.isAllJusticeCritical = playlogEntry.isAllJusticeCritical;
        }
        return enrichedItem;
      });
    }

    // playlogs (본인만)
    const playlogs = isOwner ? (profile.playlogs || []) : [];
    const ratingLists = profile.ratingLists || { best: [], new: [] };
    const enrichedRatingLists = {
      best: processList(ratingLists.best, playlogs),
      new: processList(ratingLists.new, playlogs),
    };

    const publicProfile = {
      playerName: profile.playerName,
      rating: profile.rating,
      level: profile.level,
      honors,
      friendCode,
      teamName,
      teamEmblemColor,
      characterImage,
      playCount: profile.playCount,
      ratingLists: enrichedRatingLists,
      ...(isOwner && { playlogs }),
    };

    return NextResponse.json({
      profile: publicProfile,
      accessMode: isOwner ? 'owner' : 'visitor',
    });

  } catch (error) {
    console.error('Profile detail API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
