import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from 'bcrypt';
import { type JWT } from "next-auth/jwt";

const prisma = new PrismaClient()

// 디버깅을 위해 NextAuthOptions를 별도로 정의합니다.
export const authOptions: NextAuthOptions = {
  // 1. Prisma 어댑터 설정
  adapter: PrismaAdapter(prisma),

  // 2. 인증 제공자 설정
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
          throw new Error("존재하지 않는 아이디이거나, 비밀번호가 설정되지 않은 계정입니다.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.hashedPassword);

        if (!isValid) {
          throw new Error("비밀번호가 일치하지 않습니다.");
        }

        return user;
      }
    })
  ],

  // 3. NextAuth Secret 키 설정
  secret: process.env.NEXTAUTH_SECRET,

  // 4. 디버그 모드 활성화 (개발 환경에서 상세 로그 출력)
  debug: process.env.NODE_ENV === 'development',

  // 5. 세션 전략 설정
  session: {
    strategy: "jwt",
  },

  // 6. 콜백 함수 (디버깅 로그 추가)
  callbacks: {
    // signIn: 사용자가 로그인을 시도할 때 호출
    async signIn({ user, account }) {
      console.log("--- signIn Callback Start ---");
      console.log("User:", JSON.stringify(user, null, 2));
      console.log("Account:", JSON.stringify(account, null, 2));

      if (account?.provider === "google") {
        try {
          const userInDb = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          console.log("User in DB:", JSON.stringify(userInDb, null, 2));

          if (userInDb && !userInDb.nickname) {
            console.log("Redirecting to signup page for profile completion.");
            const params = new URLSearchParams({
              email: user.email || '',
              name: user.name || '',
              image: user.image || '',
            });
            console.log("--- signIn Callback End (Redirecting) ---");
            // 리디렉션은 상대 경로가 아닌 전체 URL을 반환해야 할 수 있습니다.
            // NEXTAUTH_URL 환경변수를 꼭 확인하세요.
            return `/signup?${params.toString()}`;
          }

          console.log("User exists and has nickname, or is a new user handled by adapter. Allowing sign in.");
          console.log("--- signIn Callback End (Success) ---");
          return true; // 로그인 허용

        } catch (error) {
          console.error("Error in signIn callback:", error);
          console.log("--- signIn Callback End (Error) ---");
          return false; // 오류 발생 시 로그인 거부
        }
      }
      console.log("Not a Google provider. Allowing sign in.");
      console.log("--- signIn Callback End (Non-Google) ---");
      return true;
    },

    // jwt: JWT가 생성되거나 업데이트될 때 호출
    async jwt({ token, user, account }) {
        console.log("--- jwt Callback ---");
        console.log("Token:", JSON.stringify(token, null, 2));
        console.log("User:", JSON.stringify(user, null, 2));
        console.log("Account:", JSON.stringify(account, null, 2));
        if (user) { // 로그인 직후
            const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
            token.id = user.id;
            token.nickname = dbUser?.nickname;
        }
        return token;
    },

    // session: 세션이 접근될 때마다 호출
    async session({ session, token }: { session: any; token: JWT }) {
      console.log("--- session Callback ---");
      console.log("Session:", JSON.stringify(session, null, 2));
      console.log("Token:", JSON.stringify(token, null, 2));
      if (session.user) {
        session.user.id = token.id;
        session.user.nickname = token.nickname;
      }
      console.log("Final Session:", JSON.stringify(session, null, 2));
      return session;
    },
  },

  // 7. 이벤트 콜백 (로그인 성공/실패 시 로그 기록)
  events: {
    async signIn(message) {
      console.log("Sign In Event:", JSON.stringify(message, null, 2));
    },
    async signOut(message) {
      console.log("Sign Out Event:", JSON.stringify(message, null, 2));
    },
    async createUser(message) {
      console.log("Create User Event:", JSON.stringify(message, null, 2));
    },
    async linkAccount(message) {
      console.log("Link Account Event:", JSON.stringify(message, null, 2));
    },
    async session(message) {
      // 세션 이벤트는 너무 자주 발생하므로 필요할 때만 활성화
      // console.log("Session Event:", message);
    },
    async error(message) {
        console.error("Authentication Error Event:", message);
    }
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 