// 파일 경로: src/app/api/auth/[...nextauth]/route.ts

import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma"; // 생성한 전역 Prisma Client 인스턴스를 import

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'google' || !profile?.email) {
        // Google 로그인이 아니거나, 프로필에 이메일이 없으면 로그인 실패 처리
        return false;
      }

      // 1. DB에서 해당 이메일로 사용자를 검색
      const existingUser = await prisma.user.findUnique({
        where: { email: profile.email },
      });

      // 2. 사용자가 존재하면 -> 로그인 성공
      if (existingUser) {
        return true;
      }

      // 3. 사용자가 존재하지 않으면 -> 회원가입 페이지로 리디렉션
      // profile에서 필요한 정보를 추출하여 URL 쿼리 파라미터로 넘겨줍니다.
      const params = new URLSearchParams();
      params.append('email', profile.email);
      if (profile.name) {
        params.append('name', profile.name);
      }
      // Google 프로필 이미지 URL을 가져옵니다.
      // NextAuth.js v4의 GoogleProfile 타입에서는 'picture' 속성으로 제공될 수 있습니다.
      const image = (profile as any).picture || user.image;
      if (image) {
        params.append('image', image);
      }
      
      // Google 계정의 고유 ID(providerAccountId)도 함께 넘겨줍니다.
      if (account.providerAccountId) {
        params.append('providerAccountId', account.providerAccountId);
      }
      params.append('provider', account.provider);

      // 리디렉션할 URL을 반환합니다.
      return `/signup?${params.toString()}`;
    },

    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };