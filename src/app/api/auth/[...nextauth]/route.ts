import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // 1. 로그인 시도 시 가장 먼저 호출됩니다.
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // 2. DB에서 이메일로 사용자를 찾습니다.
        // PrismaAdapter가 이 시점에 기본적인 User, Account 레코드를 생성합니다.
        const userInDb = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        // 3. 사용자는 존재하지만, nickname이 없다면 추가 정보 입력이 필요한 신규 유저입니다.
        if (userInDb && !userInDb.nickname) {
          const params = new URLSearchParams({
            email: user.email || '',
            name: user.name || '',
            image: user.image || '',
          });
          // 4. 회원가입 페이지로 리디렉션합니다.
          return `/signup?${params.toString()}`;
        }
      }
      // 5. 기존 유저이거나 다른 방식의 로그인이면 통과시킵니다.
      return true;
    },
    
    // JWT 토큰에 닉네임 정보를 추가합니다.
    async jwt({ token, user }) {
        if (user) {
            const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
            token.id = user.id;
            token.nickname = dbUser?.nickname;
        }
        return token;
    },

    // 6. 세션 객체에 닉네임을 포함시켜 클라이언트(대시보드 등)에서 사용할 수 있게 합니다.
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id;
        // 구글 이름(token.name)이 아닌, DB의 닉네임(token.nickname)을 세션에 저장합니다.
        session.user.name = token.nickname || token.name; 
        session.user.nickname = token.nickname;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };