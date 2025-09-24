import { NextRequest } from 'next/server';
import { ImageResponse } from '@vercel/og';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import React from 'react';

// 최소 렌더링 테스트: 정상 동작 확인용
export async function GET(req: NextRequest) {
  try {
    // Prisma 클라이언트 초기화
    const prisma = new PrismaClient();
    // 쿼리 파라미터에서 gameType, region 추출
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get('userId');
    const gameType = searchParams.get('gameType') || 'CHUNITHM';
    const region = searchParams.get('region') || 'JP';
    // 세션에서 userId 자동 추출 (쿼리 파라미터 없을 때)
    if (!userId) {
      const session = await getServerSession(authOptions);
      userId = session?.user?.id;
    }
    if (!userId) {
      return new Response('로그인 정보가 없습니다.', { status: 401 });
    }
    // GameProfile 조회
    const profile = await prisma.gameProfile.findUnique({
      where: {
        userId_gameType_region: {
          userId,
          gameType,
          region,
        },
      },
      include: { gameData: true },
    });
    if (!profile || !profile.gameData || !profile.gameData.ratingLists) {
      return new Response('No rating data found', { status: 404 });
    }
    // ratingLists에서 best30, new20 추출
    const ratingLists = profile.gameData.ratingLists as any;
  const best30 = Array.isArray(ratingLists.best30) ? ratingLists.best30 : [];
  const new20 = Array.isArray(ratingLists.new20) ? ratingLists.new20 : [];
    const image = new ImageResponse(
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
                  `${i + 1}. ${song.title} | 점수: ${song.score} | 난이도: ${song.difficulty ?? '-'} | 상수: ${song.const ?? '-'} | 랭크: ${song.rank ?? '-'}`
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
                  `${i + 1}. ${song.title} | 점수: ${song.score} | 난이도: ${song.difficulty ?? '-'} | 상수: ${song.const ?? '-'} | 랭크: ${song.rank ?? '-'}`
                )
              )
        ]),
      ]),
      {
        width: 1800,
        height: 3924,
      }
    );
    return image;
  } catch (err) {
    return new Response('Internal Server Error', { status: 500 });
  }
}
