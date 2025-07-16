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
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const userExists = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { username: true },
        });

        // 새로운 구글 사용자이거나, 기존 사용자이지만 추가 정보(username)를 입력하지 않은 경우
        if (!userExists?.username) {
          const googleProfile = profile as any;
          const params = new URLSearchParams({
            email: user.email!,
            name: googleProfile.name,
            image: googleProfile.picture,
          });
          // 추가 정보 입력 페이지로 리디렉션
          return `/signup?${params.toString()}`;
        }
      }
      // 일반 로그인 또는 이미 가입 완료된 구글 사용자의 경우
      return true;
    },
    async session({ session, token }) {
      // 세션의 user 객체에 토큰의 정보를 추가합니다.
      session.user.id = token.id as string;
      session.user.username = token.username as string;
      session.user.nickname = token.nickname as string;
      return session;
    },
    async jwt({ token, user }) {
      // 최초 로그인 시, DB에서 사용자 정보를 조회하여 토큰에 추가 정보를 저장합니다.
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.username = dbUser.username;
          token.nickname = dbUser.nickname;
        }
      }
      return token;
    },
  },
  pages: {
    signIn: '/',
    error: '/', // 에러 발생 시 리디렉션될 페이지
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };