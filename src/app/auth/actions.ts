"use server"

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Google / 일반 회원가입을 모두 처리하는 최종 서버 액션
export async function signUpUser(data: any) {
    const { email, name, image, nickname, username, password } = data;

    // 아이디나 닉네임이 이미 다른 사람에게 사용되고 있는지 확인합니다.
    const existingUser = await prisma.user.findFirst({
        where: {
            // email이 있다면, 해당 email을 가진 사용자는 중복 검사에서 제외합니다.
            ...(email && { NOT: { email } }),
            OR: [{ username }, { nickname }]
        }
    });

    if (existingUser) {
        return { error: "이미 사용 중인 아이디 또는 닉네임입니다." };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    try {
        // upsert를 사용하여 안정성을 확보합니다.
        await prisma.user.upsert({
            // where: email이 있는 경우(Google 연동)에만 이 조건을 사용합니다.
            where: { email: email || `__NEVER_MATCH__${Date.now()}` }, 
            
            // update: email이 일치하는 기존 유저가 있다면 이 정보를 업데이트합니다.
            update: {
                name: nickname,
                nickname,
                username,
                hashedPassword,
            },

            // create: email이 일치하는 유저가 없다면(일반 가입 포함) 새로운 레코드를 생성합니다.
            create: {
                email, // Google 가입 시에는 이메일 저장, 일반 가입 시에는 null
                name: nickname,
                image, // Google 가입 시에만 저장
                nickname,
                username,
                hashedPassword,
                ...(email && { emailVerified: new Date() }), // Google 가입 시에만 이메일 인증됨 처리
            }
        });

        return { success: true };

    } catch (error) {
        console.error("회원가입 처리 오류:", error);
        return { error: "데이터베이스 처리 중 오류가 발생했습니다." };
    }
}