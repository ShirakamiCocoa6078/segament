"use server"

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Google 연동 가입과 일반 회원가입을 모두 처리하는 서버 액션
export async function universalSignUp(data: any) {
    const { email, name, image, nickname, username, password } = data;

    // --- 시나리오 1: Google 연동 가입 (email, name, image가 존재) ---
    // Prisma Adapter가 미리 생성한 User 레코드를 찾아 추가 정보를 업데이트합니다.
    if (email && name) { 
        try {
            const existingUser = await prisma.user.findFirst({
                where: { NOT: { email }, OR: [{ username }, { nickname }] }
            });
            if (existingUser) {
                return { error: "이미 사용 중인 아이디 또는 닉네임입니다." };
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            await prisma.user.update({
                where: { email: email },
                data: {
                    name: nickname, // 구글 이름 대신 입력받은 닉네임으로 통일
                    nickname,
                    username,
                    hashedPassword,
                },
            });
            return { success: true, isGoogleSignUp: true };
        } catch (error) {
            console.error("Google 연동 회원가입 처리 오류:", error);
            return { error: "Google 연동 회원가입 중 오류가 발생했습니다." };
        }
    }
    // --- 시나리오 2: 일반 회원가입 (email, name, image가 없음) ---
    // 모든 정보를 사용하여 새로운 User 레코드를 생성합니다.
    else {
        try {
            const existingUser = await prisma.user.findFirst({
                where: { OR: [{ email: data.newEmail }, { username }, { nickname }] }
            });
            if (existingUser) {
                return { error: "이미 사용 중인 이메일, 아이디 또는 닉네임입니다." };
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            await prisma.user.create({
                data: {
                    email: data.newEmail, // 폼에서 직접 입력받은 이메일
                    name: nickname,
                    nickname,
                    username,
                    hashedPassword,
                }
            });
            return { success: true, isGoogleSignUp: false };
        } catch (error) {
            console.error("일반 회원가입 처리 오류:", error);
            return { error: "일반 회원가입 중 오류가 발생했습니다." };
        }
    }
}