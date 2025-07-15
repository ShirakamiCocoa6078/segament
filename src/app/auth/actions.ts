"use server"

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function completeSignUp(data: any) {
    const { email, name, image, nickname, username, password } = data;

    try {
        // 자신을 제외한 다른 사용자가 해당 아이디나 닉네임을 사용하는지 확인
        const existingUser = await prisma.user.findFirst({
            where: {
                NOT: { email },
                OR: [{ username }, { nickname }]
            }
        });

        if (existingUser) {
            return { error: "이미 사용 중인 아이디 또는 닉네임입니다." };
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // 사용자가 존재하면 업데이트, 없으면 생성 (upsert 사용)
        await prisma.user.upsert({
            where: { email },
            update: {
                nickname,
                username,
                hashedPassword,
            },
            create: {
                email,
                name,
                image,
                nickname,
                username,
                hashedPassword,
                emailVerified: new Date(), // Google 인증을 통해 이메일이 확인됨
            }
        });

        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "서버 오류가 발생했습니다." };
    }
} 