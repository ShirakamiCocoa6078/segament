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
    await prisma.user.update({
      where: { email },
      data: {
        name: nickname, // 구글 이름 대신 닉네임으로 통일
        nickname,
        username,
        hashedPassword,
      },
    });
  } 
  // 시나리오 2: 일반 회원가입 (email 값이 없음)
  else {
    await prisma.user.create({
      data: {
        name: nickname,
        nickname,
        username,
        hashedPassword,
        // email 필드는 의도적으로 비워둡니다 (null).
      }
    });
  }

  return { success: true };
}