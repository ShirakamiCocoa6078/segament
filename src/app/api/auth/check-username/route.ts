// 파일 경로: src/app/api/auth/check-username/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ message: 'Username is required.' }, { status: 400 });
    }

    // Prisma를 사용해 DB의 User 테이블에서 해당 id(username)를 가진 유저를 찾습니다.
    const existingUser = await prisma.user.findUnique({
      where: {
        id: username,
      },
    });

    // 유저가 존재하지 않으면 -> 사용 가능한 아이디
    if (!existingUser) {
      return NextResponse.json({ isAvailable: true }, { status: 200 });
    }

    // 유저가 존재하면 -> 이미 사용 중인 아이디
    return NextResponse.json({ isAvailable: false }, { status: 200 });
    
  } catch (error) {
    console.error('[CHECK_USERNAME_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 