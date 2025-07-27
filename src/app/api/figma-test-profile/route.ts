// 파일 경로: src/app/api/generate-profile-gif/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
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
    
    // --- 수정: 칭호 개수에 따른 조건부 로직 추가 ---
    if (honors.length <= 1) {
      // --- 칭호가 1개 이하일 경우: PNG 생성 ---
      const html = `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(
        React.createElement(ProfileTemplate, { profile: profile as any, honorToShow: honors[0] })
      )}`;

      const browser = await core.launch({
          args: chrome.args,
          executablePath: await chrome.executablePath,
          headless: chrome.headless,
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1823, height: 722 });
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const screenshotBuffer = await page.screenshot({ type: 'png' });
      await browser.close();

      return new NextResponse(screenshotBuffer, {
          headers: { 'Content-Type': 'image/png' }
      });

    } else {
      // --- 칭호가 2개 이상일 경우: GIF 생성 ---
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

      // TODO: 다음 단계에서 이 imageFrames 배열을 GIF로 인코딩하여 반환합니다.
      // 현재는 임시로 첫 번째 프레임의 PNG를 반환합니다.
      return new NextResponse(imageFrames[0], {
          headers: { 'Content-Type': 'image/png', 'X-Generated-As': 'GIF-Placeholder' }
      });
    }

  } catch (error) {
    console.error('API Error in generate-profile-gif:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}