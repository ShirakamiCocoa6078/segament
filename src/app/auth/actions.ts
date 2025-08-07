"use server"

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function signUpUser(data: any) {
  const { email, name, image } = data;

  // 시나리오 1: Google 연동 가입 (email 값이 존재)
  if (email) {
    // 이 경우에는 NextAuth Adapter가 이미 User와 Account를 생성했으므로,
    // 우리는 User 정보만 업데이트하면 됩니다.
    await prisma.user.update({
      where: { email },
      data: {
        name: name, // 입력받은 이름으로 업데이트
      },
    });
  } 
  // 시나리오 2: 일반 회원가입 (email 값이 없음)
  else {
    // 일반 회원가입은 현재 스키마에서는 지원하지 않음
    return { error: "일반 회원가입은 현재 지원되지 않습니다." };
  }

  return { success: true };
}

export async function checkUserRegistration({ email }: { email: string }) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return { registered: false };
    }

    // 사용자는 존재하지만 name이 없는 경우 (가입 미완료)
    if (!user.name) {
      return { registered: false };
    }

    return { registered: true, user };
  } catch (error) {
    console.error('Error checking user registration:', error);
    return { registered: false, error: 'Failed to check registration status' };
  }
}