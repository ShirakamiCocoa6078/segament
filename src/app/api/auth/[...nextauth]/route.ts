import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // ... GoogleProvider, CredentialsProvider ...
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    // signIn 콜백은 이제 특별한 리디렉션 로직이 필요 없습니다.
    // 어댑터가 유저를 생성/연결하고, /auth/verify 페이지가 나머지를 처리합니다.
    async signIn({ user, account }) {
      return true;
    },
    
    // session과 jwt 콜백은 닉네임 처리를 위해 그대로 유지합니다.
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.nickname;
        session.user.nickname = token.nickname;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (dbUser) {
          token.id = dbUser.id;
          token.nickname = dbUser.nickname;
        }
      }
      return token;
    },
  },
  pages: {
    signIn: '/',
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };