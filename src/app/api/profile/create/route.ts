// 파일 경로: src/app/api/profile/create/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { playerName, title } = await req.json();

    if (!playerName) {
      return NextResponse.json({ message: 'Player name is required.' }, { status: 400 });
    }

    // 이미 프로필이 있는지 한번 더 확인
    const existingProfile = await prisma.chunithmProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      return NextResponse.json({ message: 'Profile already exists.' }, { status: 409 });
    }

    // 새 ChunithmProfile을 생성하고 User와 연결
    await prisma.chunithmProfile.create({
      data: {
        userId: session.user.id,
        playerName: playerName,
        title: title || '', // 칭호는 선택사항
      },
    });

    return NextResponse.json({ message: 'Profile created successfully.' }, { status: 201 });

  } catch (error) {
    console.error('[PROFILE_CREATE_API_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
