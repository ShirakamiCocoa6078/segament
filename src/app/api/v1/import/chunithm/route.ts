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
function updateRatingHistory(prevHistory: any, newData: any, date: string) {
  const updated = { ...prevHistory };
  if (!updated.B30eve) updated.B30eve = {};
  if (!updated.N20eve) updated.N20eve = {};
  if (!updated.rating) updated.rating = {};

  // 곡별 레이팅 계산 (상수/난이도/점수 모두 매칭)
  const B30Ids = newData.B30; // B30 곡 id 배열
  const N20Ids = newData.N20; // N20 곡 id 배열
  const scores = newData.scores; // { 곡id: 점수 }
  const rating = round4(newData.rating);
  const bestArr = Array.isArray(newData.best) ? newData.best : [];
  const newArr = Array.isArray(newData.new) ? newData.new : [];
  const getRatingAverage = (songIds: string[], scores: Record<string, number>, ratingLists: any[]) => {
    const ratings = songIds.map(id => {
      const item = ratingLists.find((e: any) => e.id === id);
      if (!item) return undefined;
      const song = chunithmSongData.find((e: any) => e.meta.id === id);
      if (!song) return undefined;
      const diffKey = item.difficulty?.toLowerCase();
      const constValue = song.data?.[diffKey]?.const;
      const scoreValue = scores[id];
      return (typeof constValue === 'number' && typeof scoreValue === 'number')
        ? calculateRating(constValue, scoreValue)
        : undefined;
    }).filter(v => typeof v === 'number');
    return ratings.length > 0
      ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length * 10000) / 10000
      : 0;
  };
  const avgB30 = getRatingAverage(B30Ids, scores, bestArr);
  const avgN20 = getRatingAverage(N20Ids, scores, newArr);

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

      // ratingHistory 구조화 (북마크릿 저장 로직은 그대로)
      let updatedRatingHistory: any = existingProfile?.ratingHistory ?? {};

      // 북마크릿에서 받은 데이터 구조에 맞게 newData 생성
      const newData = {
        B30: gameData.B30Ids ?? [],
        N20: gameData.N20Ids ?? [],
        scores: gameData.scores ?? {},
        rating: profile.rating
      };
      const date = profile.ratingTimestamp?.split('|')[0] ?? '';

      updatedRatingHistory = updateRatingHistory(updatedRatingHistory, newData, date);

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

      // 저장 이후 ratingLists 기반 평균값 계산 및 ratingHistory 갱신
      const dbGameData = await tx.gameData.findUnique({ where: { profileId: gameProfile.id } });
      // ratingLists 타입 안전하게 변환
      let ratingLists: any = dbGameData?.ratingLists;
      if (typeof ratingLists === 'string') {
        try { ratingLists = JSON.parse(ratingLists); } catch { ratingLists = {}; }
      }
      // ratingHistory 타입 안전하게 변환
      let prevHistory: any = gameProfile.ratingHistory;
      if (typeof prevHistory === 'string') {
        try { prevHistory = JSON.parse(prevHistory); } catch { prevHistory = {}; }
      }
      if (ratingLists && typeof ratingLists === 'object') {
        const bestArr = Array.isArray(ratingLists.best) ? ratingLists.best : [];
        const newArr = Array.isArray(ratingLists.new) ? ratingLists.new : [];
        const bestIds = bestArr.map((item: any) => item.id);
        const newIds = newArr.map((item: any) => item.id);
        const scores: Record<string, number> = {};
        [...bestArr, ...newArr].forEach((item: any) => {
          if (item && item.id && typeof item.score === 'number') {
            scores[item.id] = item.score;
          }
        });
        // 곡별 레이팅 공식 적용
        const getRatingAverage = (songIds: string[], scores: Record<string, number>) => {
          const ratings = songIds.map(id => {
            const item = [...bestArr, ...newArr].find((e: any) => e.id === id);
            if (!item) return undefined;
            const song = chunithmSongData.find((e: any) => e.meta.id === id);
            if (!song) return undefined;
            // 난이도 키 추출
            const diffKey = item.difficulty?.toLowerCase();
            const constValue = song.data?.[diffKey]?.const;
            const scoreValue = scores[id];
            return (typeof constValue === 'number' && typeof scoreValue === 'number')
              ? calculateRating(constValue, scoreValue)
              : undefined;
          }).filter(v => typeof v === 'number');
          return ratings.length > 0
            ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length * 10000) / 10000
            : 0;
        };
        const avgB30 = getRatingAverage(bestIds, scores);
        const avgN20 = getRatingAverage(newIds, scores);
        const rating = typeof gameProfile.rating === 'number' ? gameProfile.rating : Number(gameProfile.rating);
        const prevB30 = prevHistory.B30eve && typeof prevHistory.B30eve === 'object' ? Object.values(prevHistory.B30eve).at(-1) : undefined;
        const prevN20 = prevHistory.N20eve && typeof prevHistory.N20eve === 'object' ? Object.values(prevHistory.N20eve).at(-1) : undefined;
        const prevRating = prevHistory.rating && typeof prevHistory.rating === 'object' ? Object.values(prevHistory.rating).at(-1) : undefined;
        if (!prevHistory.B30eve || prevB30 !== avgB30 || !prevHistory.N20eve || prevN20 !== avgN20 || !prevHistory.rating || prevRating !== rating) {
          // 변화가 있으면 ratingHistory 갱신
          const dateKey = date || new Date().toISOString().slice(0, 10);
          const newHistory: any = {
            B30eve: prevHistory.B30eve && typeof prevHistory.B30eve === 'object' ? { ...prevHistory.B30eve } : {},
            N20eve: prevHistory.N20eve && typeof prevHistory.N20eve === 'object' ? { ...prevHistory.N20eve } : {},
            rating: prevHistory.rating && typeof prevHistory.rating === 'object' ? { ...prevHistory.rating } : {}
          };
          newHistory.B30eve[dateKey] = avgB30;
          newHistory.N20eve[dateKey] = avgN20;
          newHistory.rating[dateKey] = rating;
          await tx.gameProfile.update({
            where: { id: gameProfile.id },
            data: { ratingHistory: newHistory }
          });
        }
      }

      return gameProfile;
    });

    return NextResponse.json({ message: 'Data imported successfully.', profileId: result.id }, { status: 200 });
  } catch (error) {
    console.error('API Error in /api/v1/import/chunithm:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}