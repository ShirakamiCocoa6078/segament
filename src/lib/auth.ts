// 파일 경로: src/lib/auth.ts

import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";

// PrismaAdapter가 커스텀 스키마(userSystemId)와 호환되도록 프록시를 생성합니다.
// 이 프록시는 PrismaAdapter가 'account' 또는 'session' 모델에 대해 쿼리를 실행할 때,
// 'userId' 필드를 'userSystemId'로 동적으로 변환하여 스키마 불일치 문제를 해결합니다.
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

    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
