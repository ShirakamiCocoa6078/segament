// 파일 경로: src/app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { SegamentLogo } from "@/components/icons";
import { signIn } from "next-auth/react";
import { useCallback } from "react";

export default function Home() {
  const handleSignIn = useCallback(() => {
    signIn('google', { callbackUrl: '/auth/verify' });
  }, []);

  // 세션 확인 및 리다이렉트
  const { data: session, status } = require('next-auth/react').useSession();
  const router = require('next/navigation').useRouter();
  require('react').useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      router.replace(`/${session.user.id}/dashboard`);
    }
  }, [status, session, router]);

    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 to-transparent_30%"></div>
        <div className="z-10 flex flex-col items-center text-center w-full">
          <div className="flex items-center gap-2 sm:gap-4 mb-4">
            <SegamentLogo className="h-12 w-12 sm:h-16 sm:w-16" />
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-headline font-bold text-primary">
              Segament
            </h1>
          </div>
          <p className="max-w-xs sm:max-w-md mb-6 sm:mb-8 text-base sm:text-lg text-foreground/80 font-body">
            츄니즘 및 마이마이 프로필
          </p>
          <Button className="w-full sm:w-auto py-3 sm:py-2 text-base sm:text-lg" onClick={handleSignIn}>
            Google 계정으로 계속하기
          </Button>
        </div>
      </main>
  );
}