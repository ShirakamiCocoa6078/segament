// 파일 경로: src/app/api/v1/import/chunithm/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import fs from "fs";
import { calculateRating } from '@/lib/ratingUtils';
const chunithmSongData = JSON.parse(fs.readFileSync(process.cwd() + "/src/lib/chunithmSongData.json", "utf-8"));

export async function OPTIONS(request: NextRequest) {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return new NextResponse(null, { headers });
}


// 소수점 4자리 반올림
function round4(val: number) {
  return Math.round(val * 10000) / 10000;
}

// 곡별 평균 계산
function getAverageRating(songIds: string[], scores: Record<string, number>) {
  // ratingLists(best/new)에서 곡별 const/난이도/score를 모두 매칭하여 레이팅 공식 적용
  // 호출부에서 ratingLists를 추가로 전달해야 함
  return 0; // 더 아래에서 실제 계산
}

// n번째 등록 key 생성
function getNextKey(obj: Record<string, any>, date: string) {
  let n = 0;
  let key = date;
  while (obj[key] !== undefined) {
    n += 1;
    key = `${date}#${n}`;
  }
  return key;
}

// ratingHistory 업데이트
function updateRatingHistory(prevHistory: any, newRating: number, date: string) {
  const updated: any = { ...prevHistory };
  if (!updated.rating) updated.rating = {};
  const lastKey = Object.keys(updated.rating).at(-1);
  const lastValue = lastKey ? updated.rating[lastKey] : undefined;
  if (lastValue !== newRating) {
    const key = lastKey && lastKey.startsWith(date) ? getNextKey(updated.rating, date) : date;
    updated.rating[key] = newRating;
  }
  return updated;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log('[API 요청 body 디버그]', JSON.stringify(body, null, 2));
    const { gameType, region, profile, gameData } = body;

    if (!profile || !profile.playerName) {
      return NextResponse.json({ message: 'Player name is missing.' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 기존 프로필 조회
      const existingProfile = await tx.gameProfile.findUnique({
        where: { userId_gameType_region: { userId: session.user.id, gameType, region } }
      });

      // ratingHistory 구조화 (북마크릿 저장 로직은 그대로)
      let updatedRatingHistory: any = existingProfile?.ratingHistory ?? {};

      // 북마크릿에서 받은 데이터 구조에 맞게 newData 생성
      const newData = {
        B30: gameData.B30Ids ?? [],
        N20: gameData.N20Ids ?? [],
        scores: gameData.scores ?? {},
        rating: profile.rating,
        best: gameData.ratingLists?.best ?? [],
        new: gameData.ratingLists?.new ?? []
      };
      const date = profile.ratingTimestamp?.split('|')[0] ?? '';

  updatedRatingHistory = updateRatingHistory(updatedRatingHistory, newData.rating, date);

      // ratingTimestamp는 데이터베이스에 저장하지 않음
      const { ratingTimestamp: _, ...profileData } = profile;

      // 북마크릿 데이터 저장
      const gameProfile = await tx.gameProfile.upsert({
        where: { userId_gameType_region: { userId: session.user.id, gameType, region } },
        update: {
          ...profileData,
          ratingHistory: updatedRatingHistory
        },
        create: { 
          ...profileData, 
          userId: session.user.id, 
          gameType, 
          region,
          ratingHistory: updatedRatingHistory
        },
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

  // 평균값 계산 및 B30/N20 관련 로직 완전 삭제
  // rating 값만 관리

      return gameProfile;
    });

    return NextResponse.json({ message: 'Data imported successfully.', profileId: result.id }, { status: 200 });
  } catch (error) {
    console.error('API Error in /api/v1/import/chunithm:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}