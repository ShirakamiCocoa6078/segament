// 파일 경로: src/app/api/user/api-key/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';

/**
 * 현재 로그인된 사용자의 API 키를 조회하는 GET 핸들러
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { apiKey: true }, // API 키 필드만 선택적으로 조회
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ apiKey: user.apiKey }, { status: 200 });
  } catch (error) {
    console.error('[API_KEY_GET_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * 사용자의 API 키를 새로 생성하거나 재발급하는 POST 핸들러
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // 암호학적으로 안전한 32바이트 길이의 랜덤 문자열을 생성하여 API 키로 사용
    const newApiKey = randomBytes(32).toString('hex');

    await prisma.user.update({
      where: { id: session.user.id },
      data: { apiKey: newApiKey },
    });

    return NextResponse.json({ apiKey: newApiKey, message: 'API key generated successfully.' }, { status: 200 });
  } catch (error) {
    console.error('[API_KEY_POST_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}