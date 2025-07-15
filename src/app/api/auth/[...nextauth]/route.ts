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
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const userInDb = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { username: true } 
        });

        // 사용자가 DB에 있지만, username이 없다면 신규 유저로 판단
        if (userInDb && !userInDb.username) {
          const params = new URLSearchParams({
            email: user.email || '',
            name: user.name || '',
            image: user.image || '',
          });
          // 정상적으로 /signup 페이지로 리디렉션
          return `/signup?${params.toString()}`;
        }
      }
      return true;
    },
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