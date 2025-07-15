"use server"

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function signUpUser(data: any) {
    const { email, nickname, username, password } = data;

    // 아이디나 닉네임이 이미 존재하는지 확인
    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ username }, { nickname }] }
    });
    if (existingUser) {
        return { error: "이미 사용 중인 아이디 또는 닉네임입니다." };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // 시나리오 1: Google 연동 가입 (email 값이 존재)
    if (email) {
        // NextAuth가 미리 생성한 User 레코드를 찾아 추가 정보를 업데이트합니다.
        await prisma.user.update({
            where: { email: email },
            data: {
                name: nickname, // 구글 이름 대신 입력받은 닉네임으로 통일
                nickname,
                username,
                hashedPassword,
            },
        });
    } 
    // 시나리오 2: 일반 회원가입 (email 값이 없음)
    else {
        // 모든 정보를 사용하여 새로운 User 레코드를 생성합니다.
        await prisma.user.create({
            data: {
                name: nickname,
                nickname,
                username,
                hashedPassword,
                // email 필드는 비워둡니다.
            }
        });
    }

    return { success: true };
}