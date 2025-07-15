"use server"

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function completeSignUp(data: any) {
    const { email, name, image, nickname, username, password } = data;

    try {
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ username }, { nickname }] }
        });

        if (existingUser) {
            return { error: "이미 사용 중인 아이디 또는 닉네임입니다." };
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // This should be `create` because the user is not in the DB yet.
        await prisma.user.create({
            data: {
              email,
              name,
              image,
              nickname,
              username,
              hashedPassword,
            },
        });

        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "서버 오류가 발생했습니다." };
    }
} 