"use server"

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function signUpUser(data: any) {
  const { email, name, image, nickname, username, password } = data;

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { nickname }] }
  });
  if (existingUser) {
    return { error: "이미 사용 중인 아이디 또는 닉네임입니다." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  // 시나리오 1: Google 연동 가입 (email 값이 존재)
  if (email) {
    // 이 경우에는 NextAuth Adapter가 이미 User와 Account를 생성했으므로,
    // 우리는 User 정보만 업데이트하면 됩니다.
    await prisma.user.update({
      where: { email },
      data: {
        name: nickname, // 구글 이름 대신 입력받은 닉네임으로 통일
        nickname,
        username,
        hashedPassword, // 일반 로그인을 대비해 비밀번호도 저장
      },
    });
  } 
  // 시나리오 2: 일반 회원가입 (email 값이 없음)
  else {
    // 트랜잭션을 사용하여 User와 Account 생성을 동시에 처리합니다.
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: nickname,
          nickname,
          username,
          hashedPassword,
        }
      });

      await tx.account.create({
        data: {
          userId: newUser.id,
          type: "credentials",
          provider: "credentials",
          providerAccountId: newUser.id,
        }
      });
    });
  }

  return { success: true };
}