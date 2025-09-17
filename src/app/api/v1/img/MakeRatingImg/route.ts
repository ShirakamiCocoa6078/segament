import { NextRequest } from 'next/server';
import { ImageResponse } from '@vercel/og';
import MakeRatingImg, { MakeRatingImgProps } from '@/components/dashboard/MakeRatingImg';
import React from 'react';

// 인증 및 DB 관련 유틸(실제 프로젝트에 맞게 구현 필요)
async function getSession(req: NextRequest) {
  // 실제 인증 로직 구현 필요
  return { user: { nickname: 'testNickname', id: '1' } };
}
async function getUserProfile(userId: string) {
  // DB에서 유저 프로필 정보 조회
  return {
    nickname: 'testNickname',
    rating: 15.32,
    level: 99,
    playCount: 1234,
  };
}
async function getRatingSongs(userId: string) {
  // DB에서 Best30, New20 곡 정보 조회
  // 실제 데이터로 교체 필요
  const dummySong = {
    id: '1',
    title: 'Song Title',
    level: '13',
    jacketUrl: 'https://dummyimage.com/180x180/eee/333.png&text=Jacket',
    constant: 13.2,
    ratingValue: 15.32,
    score: 1000000,
    difficulty: 'MASTER',
    rank: 1,
  };
  return {
    best30: Array(30).fill(dummySong).map((s, i) => ({ ...s, id: String(i + 1), rank: i + 1 })),
    new20: Array(20).fill(dummySong).map((s, i) => ({ ...s, id: String(i + 31), rank: i + 1 })),
  };
}

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  // 1. 인증 및 세션 확인
  const session = await getSession(req);
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  // 2. DB에서 정보 조회
  const profile = await getUserProfile(session.user.id);
  const { best30, new20 } = await getRatingSongs(session.user.id);
  // 3. 평균 레이팅 계산
  const best30Avg = best30.length ? best30.reduce((a, b) => a + b.ratingValue, 0) / best30.length : 0;
  const new20Avg = new20.length ? new20.reduce((a, b) => a + b.ratingValue, 0) / new20.length : 0;
  // 4. props 생성
  const props: MakeRatingImgProps = {
    profile,
    best30,
    new20,
    best30Avg,
    new20Avg,
  };
  // 5. 이미지 생성
  return new ImageResponse(
    React.createElement(MakeRatingImg, props),
    {
      width: 1200,
      height: 1800,
      fonts: [
        {
          name: 'Inter',
          data: await fetch('https://rsms.me/inter/font-files/Inter-Regular.woff').then(res => res.arrayBuffer()),
          style: 'normal',
        },
      ],
    }
  );
}
