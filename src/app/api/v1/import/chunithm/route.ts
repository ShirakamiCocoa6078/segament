// 파일 경로: src/app/api/v1/import/chunithm/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import fs from "fs";
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
  const ratings = songIds.map(id => scores[id]).filter(v => typeof v === "number");
  if (ratings.length === 0) return 0;
  return round4(ratings.reduce((a, b) => a + b, 0) / ratings.length);
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
function updateRatingHistory(prevHistory: any, newData: any, date: string) {
  const updated = { ...prevHistory };
  if (!updated.B30eve) updated.B30eve = {};
  if (!updated.N20eve) updated.N20eve = {};
  if (!updated.rating) updated.rating = {};

  // 곡별 레이팅 계산 (실제 곡/점수 구조에 맞게 조정 필요)
  const B30Ids = newData.B30; // B30 곡 id 배열
  const N20Ids = newData.N20; // N20 곡 id 배열
  const scores = newData.scores; // { 곡id: 점수 }
  const rating = round4(newData.rating);

  const avgB30 = getAverageRating(B30Ids, scores);
  const avgN20 = getAverageRating(N20Ids, scores);

  // 변화 감지
  const prevB30 = Object.values(updated.B30eve).at(-1);
  const prevN20 = Object.values(updated.N20eve).at(-1);
  const prevRating = Object.values(updated.rating).at(-1);

  const changes = [];
  if (prevB30 !== avgB30) changes.push("B30eve");
  if (prevN20 !== avgN20) changes.push("N20eve");
  if (prevRating !== rating) changes.push("rating");
  if (changes.length === 0) return updated;

  // 중복 등록 처리
  const key = getNextKey(updated.rating, date);

  updated.B30eve[key] = avgB30;
  updated.N20eve[key] = avgN20;
  updated.rating[key] = rating;

  return updated;
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
      // 기존 프로필 조회
      const existingProfile = await tx.gameProfile.findUnique({
        where: { userId_gameType_region: { userId: session.user.id, gameType, region } }
      });

      // ratingHistory 구조화
      let updatedRatingHistory: any = existingProfile?.ratingHistory ?? {};

      // 북마크릿에서 받은 데이터 구조에 맞게 newData 생성
      // 실제 B30/N20 곡 id 추출, scores, rating 값은 gameData에서 전달받아야 함
      const newData = {
        B30: gameData.B30Ids ?? [], // B30 곡 id 배열
        N20: gameData.N20Ids ?? [], // N20 곡 id 배열
        scores: gameData.scores ?? {}, // { 곡id: 점수 }
        rating: profile.rating
      };
      const date = profile.ratingTimestamp?.split('|')[0] ?? '';

      updatedRatingHistory = updateRatingHistory(updatedRatingHistory, newData, date);

      // ratingTimestamp는 데이터베이스에 저장하지 않음
      const { ratingTimestamp: _, ...profileData } = profile;

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

      return gameProfile;
    });

    return NextResponse.json({ message: 'Data imported successfully.', profileId: result.id }, { status: 200 });
  } catch (error) {
    console.error('API Error in /api/v1/import/chunithm:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}