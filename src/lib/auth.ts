// 파일 경로: src/lib/auth.ts

import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";

// [리뉴얼 필요] PrismaAdapter가 커스텀 스키마(userSystemId/cuid, userId 분리)와 완전히 호환되는지 재점검 필요
// [주의] 프록시에서 userId→userSystemId 변환이 누락되거나, 세션/토큰에 userId/cuid 혼용이 발생할 수 있음
// [개선] PrismaAdapter 및 세션/토큰 로직에서 id(내부용 cuid), userId(공개용) 필드가 명확히 분리되어야 함
const getPrismaProxy = (prisma: PrismaClient) => {
  return new Proxy(prisma, {
    get: (target, prop: string) => {
      if (prop === 'account' || prop === 'session') {
        const model = (target as any)[prop];
        return new Proxy(model, {
          get: (modelTarget, modelProp: string) => {
            const originalMethod = modelTarget[modelProp];
            if (['create', 'update', 'upsert', 'findUnique', 'findFirst', 'findMany'].includes(modelProp) && typeof originalMethod === 'function') {
              return (...args: any[]) => {
                const params = args[0] || {};
                
                const mapUserIdToUserSystemId = (obj: any) => {
                  if (obj && obj.userId) {
                    obj.userSystemId = obj.userId;
                    delete obj.userId;
                  }
                };

                // Prisma 쿼리의 다양한 부분에서 필드 이름 매핑을 수행합니다.
                if (params.where) mapUserIdToUserSystemId(params.where);
                if (params.data) mapUserIdToUserSystemId(params.data);
                if (params.create) mapUserIdToUserSystemId(params.create);
                if (params.update) mapUserIdToUserSystemId(params.update);
                
                return originalMethod.apply(modelTarget, args);
              };
            }
            return originalMethod;
          },
        });
      }
      return (target as any)[prop];
    },
  });
};

// 생성된 프록시를 PrismaAdapter에 전달합니다.
const prismaProxy = getPrismaProxy(prisma);

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prismaProxy),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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

    // [리뉴얼 필요] jwt 토큰에 id(내부용 cuid), userId(공개용) 필드가 혼용되지 않도록 주의
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        if (dbUser) {
          token.id = dbUser.id; // 내부용 cuid
          token.userId = dbUser.userId; // 공개용 userId
        }
      }
      return token;
    },
    // [리뉴얼 필요] 세션 객체에도 id(내부용 cuid), userId(공개용) 필드가 혼용되지 않도록 주의
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string; // 내부용 cuid
        // userId가 없으면 DB에서 조회해서라도 반드시 넣어줌 (공개용 userId)
        if (token.userId) {
          session.user.userId = token.userId as string;
        } else if (token.id) {
          const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
          if (dbUser?.userId) {
            session.user.userId = dbUser.userId;
          }
        }
      }
      return session;
    },
  },
};
