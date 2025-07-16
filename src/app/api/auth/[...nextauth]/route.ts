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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("아이디와 비밀번호를 입력해주세요.");
        }
        const user = await prisma.user.findUnique({
          where: { username: credentials.username }
        });
        if (!user || !user.hashedPassword) {
          throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");
        }
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );
        if (!isPasswordCorrect) {
          throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");
        }
        return user;
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    // signIn 콜백의 역할을 명확히 합니다.
    async signIn({ user, account }) {
      // OAuth 제공자(Google)를 통한 로그인일 때만 실행
      if (account?.provider === "google") {
        // PrismaAdapter가 User와 Account 생성을 완료한 후, DB에서 직접 확인합니다.
        const userInDb = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { username: true } // username 존재 여부만 확인
        });

        // username이 없다면, 추가 정보 입력이 필요한 신규 사용자입니다.
        if (userInDb && !userInDb.username) {
          const params = new URLSearchParams({
            email: user.email || '',
            name: user.name || '',
            image: user.image || '',
          });
          // 회원가입 페이지로 리디렉션합니다.
          return `/signup?${params.toString()}`;
        }
      }
      // 그 외의 경우(기존 Google 유저, 일반 로그인 등)는 모두 로그인을 허용합니다.
      return true;
    },
    
    // JWT 토큰과 세션에 닉네임 정보를 올바르게 포함시킵니다.
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
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.nickname; // 모든 곳에서 닉네임이 표시되도록 설정
        session.user.nickname = token.nickname;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };