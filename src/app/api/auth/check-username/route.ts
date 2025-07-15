import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { username } = await req.json();

        if (!username || typeof username !== 'string') {
            return NextResponse.json({ error: '아이디를 입력해주세요.' }, { status: 400 });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                username: username,
            },
        });

        // existingUser가 존재하면 isAvailable은 false, 존재하지 않으면 true를 반환
        return NextResponse.json({ isAvailable: !existingUser });

    } catch (error) {
        console.error("아이디 중복 확인 오류:", error);
        return NextResponse.json({ error: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
} 