// 파일 경로: src/app/api/generate-profile-gif/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { ProfileTemplate } from '@/components/gif/ProfileTemplate';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const profile = await prisma.gameProfile.findFirst({
      where: { userId: session.user.id, gameType: 'CHUNITHM', region: 'JP' },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 칭호가 없거나 1개일 경우를 대비하여 기본값 설정
    const honors = profile.honors?.length ? profile.honors : [{ text: '称号なし', color: 'NORMAL' }];

    const htmlFrames = honors.map(honor => {
      const reactElement = React.createElement(ProfileTemplate, { 
        profile: profile as any, // prisma 타입과 컴포넌트 prop 타입 일치를 위해 any 사용
        honorToShow: honor 
      });
      return `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(reactElement)}`;
    });

    // TODO: 다음 단계에서 이 htmlFrames 배열을 Puppeteer에 전달하여 이미지로 캡처하고 GIF로 인코딩합니다.
    
    // 현재 단계에서는 생성된 HTML 중 첫 번째 프레임을 브라우저에서 확인할 수 있도록 반환합니다.
    return new NextResponse(htmlFrames[0], {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });

  } catch (error) {
    console.error('API Error in generate-profile-gif:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}