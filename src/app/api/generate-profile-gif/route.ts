// 파일 경로: src/app/api/generate-profile-gif/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import React from 'react';
// 수정: 'react-dom/server'의 정적 import를 제거합니다.
// import ReactDOMServer from 'react-dom/server'; 
import { ProfileTemplate } from '@/components/gif/ProfileTemplate';

import core from 'puppeteer-core';
import chrome from 'chrome-aws-lambda';

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

    const honors = profile.honors?.length ? profile.honors : [{ text: '称号なし', color: 'NORMAL' }];
    
    // 수정: API 실행 시점에 'react-dom/server'를 동적으로 import 합니다.
    const ReactDOMServer = (await import('react-dom/server')).default;

    const htmlFrames = honors.map(honor => {
      const reactElement = React.createElement(ProfileTemplate, { 
        profile: profile as any,
        honorToShow: honor 
      });
      return `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(reactElement)}`;
    });

    const browser = await core.launch({
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1823, height: 722 });

    const imageFrames: Buffer[] = [];
    for (const html of htmlFrames) {
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const screenshotBuffer = await page.screenshot({ type: 'png' });
        imageFrames.push(screenshotBuffer);
    }
    await browser.close();
    
    // 현재는 임시로 첫 번째 프레임의 PNG를 반환합니다.
    return new NextResponse(imageFrames[0], {
        headers: { 'Content-Type': 'image/png' }
    });

  } catch (error) {
    console.error('API Error in generate-profile-gif:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}