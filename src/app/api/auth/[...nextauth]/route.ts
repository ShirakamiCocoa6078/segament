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
    // 1. Google 로그인 제공자
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // 2. 아이디/비밀번호 로그인 제공자
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

        // 사용자가 없거나, 비밀번호 필드가 없으면(Google 유저) 로그인 실패
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
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // Google 로그인 시도 시 가입 여부 판단
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const userInDb = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        // DB에 유저는 있지만 username이 없다면 = 추가 정보 입력이 필요한 신규 유저
        if (userInDb && !userInDb.username) {
          const params = new URLSearchParams({
            email: user.email || '',
            name: user.name || '', // Google 이름은 임시로만 사용
            image: user.image || '',
          });
          return `/signup?${params.toString()}`;
        }
      }
      return true;
    },
    
    // 세션에 닉네임 정보를 포함
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.nickname; // 모든 곳에서 구글 이름 대신 닉네임 사용
        session.user.nickname = token.nickname;
        session.user.username = token.username;
      }
      return session;
    },

    // JWT 토큰에 DB의 최신 정보를 담음
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [{ id: user.id }, { email: user.email }],
          }
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.nickname = dbUser.nickname;
          token.username = dbUser.username;
        }
      }
      return token;
    },
  },
  pages: {
    signIn: '/', // 로그인 페이지 경로
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };