import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import React from 'react';
import { ProfileTemplate } from '@/components/playerCard/ProfileTemplate';
import { put } from '@vercel/blob';

// API 실행 시점에 라이브러리를 동적으로 import하여 빌드 오류를 방지합니다.
async function getDependencies() {
    const ReactDOMServer = (await import('react-dom/server')).default;
    const puppeteer = (await import('puppeteer-core')).default;
    const chromium = (await import('@sparticuz/chromium')).default;
    return { ReactDOMServer, puppeteer, chromium };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) { 
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 }); 
  }

  try {
    const { ReactDOMServer, puppeteer, chromium } = await getDependencies();
    
    // JP CHUNITHM 프로필만 조회합니다.
    const profile = await prisma.gameProfile.findFirst({
      where: { userId: session.user.id, gameType: 'CHUNITHM', region: 'JP' },
    });

    if (!profile) { 
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 }); 
    }
    
    // 칭호가 없을 경우를 대비한 기본값 설정
    const honors = profile.honors?.length ? profile.honors : [{ text: '称号なし', color: 'NORMAL' }];
    
    // Puppeteer 브라우저 실행
    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1823, height: 722 });

    const imageUrls: string[] = [];
    
    // 각 칭호별로 이미지를 생성합니다.
    for (const honor of honors) {
        const html = `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(React.createElement(ProfileTemplate, { profile: profile as any, honorToShow: honor }))}`;
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const screenshotBuffer = await page.screenshot({ type: 'png' });
        
        // 생성된 이미지를 Vercel Blob에 업로드하고 공개 URL을 받습니다.
        // 파일명을 고유하게 만들어 캐시 문제를 방지하고, 덮어쓰도록 설정합니다.
        const blob = await put(`profiles/${profile.id}-${honor.text}.png`, screenshotBuffer, { 
          access: 'public',
          addRandomSuffix: false, 
        });
        imageUrls.push(blob.url);
    }
    await browser.close();

    // 생성된 이미지 URL 목록을 JSON 형태로 반환합니다.
    return NextResponse.json({ imageUrls });

  } catch (error) {
    console.error('API Error in generate-profile-images:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}