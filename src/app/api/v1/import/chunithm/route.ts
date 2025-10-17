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
function getAverageRating(ratingLists: { best: any[], new: any[] }) {
  let bestRatingSum = 0;
  for (const song of ratingLists.best) {
    const songData = chunithmSongData.find((s: any) => s.id.toString() === song.id.toString());
    if (songData) {
      const sheet = songData.sheets.find((sh: any) => sh.difficulty.toUpperCase() === song.difficulty.toUpperCase());
      if (sheet) {
        bestRatingSum += calculateRating(sheet.const, song.score);
      }
    }
  }

  let newRatingSum = 0;
  for (const song of ratingLists.new) {
    const songData = chunithmSongData.find((s: any) => s.id.toString() === song.id.toString());
    if (songData) {
      const sheet = songData.sheets.find((sh: any) => sh.difficulty.toUpperCase() === song.difficulty.toUpperCase());
      if (sheet) {
        newRatingSum += calculateRating(sheet.const, song.score);
      }
    }
  }

  return {
    bestAvg: round4(bestRatingSum / 30),
    newAvg: round4(newRatingSum / 20),
  };
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
function updateRatingHistory(prevHistory: any, date: string, newValues: { rating: number, bestAvg: number, newAvg: number }) {
  const updated: any = { ...prevHistory };

  // 각 필드(rating, bestAvg, newAvg)에 대해 업데이트 확인 및 적용
  for (const [field, value] of Object.entries(newValues)) {
    if (!updated[field]) updated[field] = {};
    const lastKey = Object.keys(updated[field]).at(-1);
    const lastValue = lastKey ? updated[field][lastKey] : undefined;

    if (lastValue !== value) {
      const key = lastKey && lastKey.startsWith(date) ? getNextKey(updated[field], date) : date;
      updated[field][key] = value;
    }
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
        where: { userSystemId_gameType_region: { userSystemId: session.user.id, gameType, region } }
      });

      // ratingHistory 구조화
      let updatedRatingHistory: any = existingProfile?.ratingHistory ?? {};
      const date = profile.ratingTimestamp?.split('|')[0] ?? '';

      // 평균 레이팅 계산
      const { bestAvg, newAvg } = getAverageRating(gameData.ratingLists);

      // ratingHistory 업데이트
      updatedRatingHistory = updateRatingHistory(updatedRatingHistory, date, {
        rating: profile.rating,
        bestAvg,
        newAvg,
      });

      // ratingTimestamp는 데이터베이스에 저장하지 않음
      const { ratingTimestamp, ...profileData } = profile;

      // 북마크릿 데이터 저장
      const gameProfile = await tx.gameProfile.upsert({
        where: { userSystemId_gameType_region: { userSystemId: session.user.id, gameType, region } },
        update: {
          ...profileData,
          lastPlayDate: profile.lastPlayDate ? new Date(profile.lastPlayDate) : null,
          ratingHistory: updatedRatingHistory,
          playlogs: gameData.playlogs,
          ratingLists: gameData.ratingLists,
        },
        create: {
          ...profileData,
          lastPlayDate: profile.lastPlayDate ? new Date(profile.lastPlayDate) : null,
          userSystemId: session.user.id,
          gameType,
          region,
          ratingHistory: updatedRatingHistory,
          playlogs: gameData.playlogs,
          ratingLists: gameData.ratingLists,
        },
      });

      // GameData 테이블 관련 로직 삭제됨

      // 평균값 계산 및 B30/N20 관련 로직 완전 삭제
      // rating 값만 관리

      return gameProfile;
    });

    return NextResponse.json({ message: 'Data imported successfully.', profileId: result.profileId }, { status: 200 });
  } catch (error) {
    console.error('API Error in /api/v1/import/chunithm:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}