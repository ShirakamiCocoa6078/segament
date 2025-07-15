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
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const userExists = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (userExists) {
          return true; // 기존 유저면 로그인 허용
        } else {
          // 신규 유저면 회원가입 페이지로 리디렉션
          const params = new URLSearchParams();
          if (user.email) params.append("email", user.email);
          if (user.name) params.append("name", user.name);
          if (user.image) params.append("image", user.image);
          
          return `/signup?${params.toString()}`;
        }
      }
      return true; // Google 로그인이 아닌 경우
    },
    async session({ session, user }) {
      const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
      // @ts-ignore
      session.user.id = user.id;
      // @ts-ignore
      session.user.nickname = dbUser?.nickname; // 세션에 닉네임 추가
      return session;
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 