import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      // Google 로그인인 경우
      if (account?.provider === "google") {
        const userInDb = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        // 사용자가 존재하지만 닉네임이 없다면, 추가 정보 입력 페이지로 리디렉션
        if (userInDb && !userInDb.nickname) {
          const params = new URLSearchParams({
            email: user.email || '',
            name: user.name || '',
            image: user.image || '',
          });
          return `/signup?${params.toString()}`;
        }
      }
      // 그 외의 경우는 모두 로그인 허용
      return true;
    },
    async session({ session, user }) {
      // 세션에 사용자 ID와 닉네임 추가
      const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
      if (session.user) {
        // @ts-ignore
        session.user.id = user.id;
        // @ts-ignore
        session.user.nickname = dbUser?.nickname;
      }
      return session;
    },
  },
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST } 