// 파일 경로: src/app/api/auth/register/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      username, 
      nickname, 
      email, 
      name, 
      image, 
      provider, 
      providerAccountId 
    } = body;

    // 1. 필수 정보가 모두 있는지 확인
    if (!username || !nickname || !email || !provider || !providerAccountId) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    // 2. 트랜잭션을 사용하여 User와 Account를 동시에 생성 (데이터 무결성 보장)
    await prisma.$transaction(async () => {
      // 2-1. 혹시 모를 중복 아이디 재확인
      const existingUserById = await prisma.user.findUnique({
        where: { userId: username },
      });

      if (existingUserById) {
        throw new Error('Username already exists.');
      }

      // 2-2. 혹시 모를 중복 이메일 재확인 (다른 사용자가 이미 가입했을 경우)
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: email },
      });

      if (existingUserByEmail) {
        throw new Error('Email already registered.');
      }

      // 2-3. User 레코드 생성
      const newUser = await prisma.user.create({
        data: {
          userId: username, // 사용자가 입력한 고유 아이디
          name: nickname, // 사용자가 입력한 닉네임
          email: email,
          image: image,
          emailVerified: new Date(),
        },
      });

      // 2-4. Account 레코드 생성 (User와 연결)
      await prisma.account.create({
        data: {
          userSystemId: newUser.id,
          type: 'oauth',
          provider: provider,
          providerAccountId: providerAccountId,
        },
      });
    });

    // 3. 성공 응답 반환
    return NextResponse.json({ message: 'User registered successfully.' }, { status: 201 });

  } catch (error: any) {
    console.error('[REGISTER_API_ERROR]', error);
    // 에러 메시지에 따라 다른 상태 코드 반환
    if (error.message.includes('already exists')) {
        return NextResponse.json({ message: error.message }, { status: 409 }); // 409 Conflict
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
