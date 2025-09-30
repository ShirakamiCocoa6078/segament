import { NextRequest } from 'next/server';
import { calculateRating } from '@/lib/ratingUtils';
import { ImageResponse } from '@vercel/og';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import React from 'react';

export async function GET(req: NextRequest) {
  try {
    // DB에서 userId로 ratingLists(best/new) 추출
    const prisma = new PrismaClient();
    const profileId = req.nextUrl.searchParams.get('profileId') ?? undefined;
    const gameData = await prisma.gameData.findUnique({
      where: { profileId }
    });
    const ratingLists = gameData?.ratingLists || { best: [], new: [] };
    const bestRaw = Array.isArray(ratingLists.best) ? ratingLists.best : [];
    const newRaw = Array.isArray(ratingLists.new) ? ratingLists.new : [];

    // chunithmSongData.json, jacket_data.json 불러오기
    const fs = await import('fs/promises');
    const path = await import('path');
    const songDataPath = path.resolve(process.cwd(), 'src/lib/chunithmSongData.json');
    const jacketDataPath = path.resolve(process.cwd(), 'src/lib/jacket_data.json');
    const songData = JSON.parse(await fs.readFile(songDataPath, 'utf-8')) as any[];
    const jacketData = JSON.parse(await fs.readFile(jacketDataPath, 'utf-8')) as { idx: string; title: string; jacketUrl: string }[];

    // 점수→랭크 변환 함수
    function scoreToRank(score: number): string {
      if (score >= 1009000) return 'SSS+';
      if (score >= 1007500) return 'SSS';
      if (score >= 1005000) return 'SS+';
      if (score >= 1000000) return 'SS';
      if (score >= 990000) return 'S+';
      if (score >= 975000) return 'S';
      if (score >= 950000) return 'AAA';
      if (score >= 925000) return 'AA';
      if (score >= 900000) return 'A';
      if (score >= 800000) return 'BBB';
      if (score >= 700000) return 'B';
      if (score >= 600000) return 'C';
      return 'D';
    }


    // 곡 정보 확장 함수
    function enrichSong(rawSong: any): any {
      const { id, difficulty, score } = rawSong;
      const songMeta = songData.find((s: any) => s.meta.id === id);
      const diffKey = (difficulty || '').toLowerCase();
      const diffMap: Record<string, string> = { bas: 'basic', adv: 'advanced', exp: 'expert', mas: 'master', ult: 'ultima', basic: 'basic', advanced: 'advanced', expert: 'expert', master: 'master', ultima: 'ultima' };
      const diff = diffMap[diffKey] || diffKey;
      const songDetail = songMeta?.data?.[diff] || {};
      const jacketObj = jacketData.find((j: any) => j.idx === id);
      return {
        id,
        title: songMeta?.meta?.title || rawSong.title || '-',
        genre: songMeta?.meta?.genre || '-',
        version: songMeta?.meta?.version || '-',
        difficulty: difficulty || '-',
        score: score ?? '-',
        rank: scoreToRank(score ?? 0),
        const: songDetail.const ?? '-',
        level: songDetail.level ?? '-',
        ratingValue: (songDetail.const && score) ? calculateRating(songDetail.const, score) : '-',
        jacketUrl: jacketObj?.jacketUrl || `/jacket/${id}.jpg`,
      };
    }

    // 확장된 곡 정보 리스트 생성
  const best30 = bestRaw.map((song: any) => enrichSong(song));
  const new20 = newRaw.map((song: any) => enrichSong(song));

    // 이미지 렌더링(기존 텍스트 → 구조화된 곡 정보)
    return new ImageResponse(
      React.createElement('div', {
        style: {
          width: '1800px',
          height: '3924px',
          background: '#fff',
          color: '#222',
          fontSize: 32,
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }
      }, [
        React.createElement('h1', { style: { fontSize: 64, marginBottom: '32px' }, key: 'title' }, 'Best30 / New20 레이팅표'),
        React.createElement('div', {
          key: 'best30',
          style: {
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '48px',
          }
        }, [
          React.createElement('h2', { style: { fontSize: 48, margin: '24px 0' }, key: 'b30title' }, 'Best30'),
          best30.length === 0
            ? React.createElement('div', { style: { fontSize: 32, color: '#888' }, key: 'b30-empty' }, '데이터 없음')
            : best30.map((song: any, i: number) =>
                React.createElement('div', { key: `b30-${i}` },
                  `${i + 1}. ${song.title} | 점수: ${song.score} | 난이도: ${song.difficulty} | 상수: ${song.const} | 레벨: ${song.level} | 랭크: ${song.rank} | 레이팅: ${song.ratingValue} | 장르: ${song.genre} | 버전: ${song.version}`
                )
              )
        ]),
        React.createElement('div', {
          key: 'new20',
          style: {
            display: 'flex',
            flexDirection: 'column',
          }
        }, [
          React.createElement('h2', { style: { fontSize: 48, margin: '24px 0' }, key: 'n20title' }, 'New20'),
          new20.length === 0
            ? React.createElement('div', { style: { fontSize: 32, color: '#888' }, key: 'n20-empty' }, '데이터 없음')
            : new20.map((song: any, i: number) =>
                React.createElement('div', { key: `n20-${i}` },
                  `${i + 1}. ${song.title} | 점수: ${song.score} | 난이도: ${song.difficulty} | 상수: ${song.const} | 레벨: ${song.level} | 랭크: ${song.rank} | 레이팅: ${song.ratingValue} | 장르: ${song.genre} | 버전: ${song.version}`
                )
              )
        ]),
      ]),
      {
        width: 1800,
        height: 3924,
      }
    );
  } catch (error) {
    console.error(error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
