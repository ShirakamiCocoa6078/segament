"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function VerifyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 세션이 확인되었고, 사용자가 인증된 상태일 때만 로직을 실행합니다.
    if (status === "authenticated" && session?.user?.email) {
      const checkAndRedirect = async () => {
        try {
          // API 라우트를 통해 사용자의 가입 완료 여부를 확인합니다.
          const response = await fetch('/api/auth/check-registration');
          if (!response.ok) throw new Error('Failed to check registration');
          
          const registrationStatus = await response.json();

          if (registrationStatus.registered) {
            // 이미 가입된 유저라면 대시보드로 이동합니다.
            router.replace("/dashboard");
          } else {
            // 신규 유저라면 구글 정보를 포함하여 회원가입 페이지로 이동합니다.
            const params = new URLSearchParams({
              email: session.user.email || '',
              name: session.user.name || '',
              image: session.user.image || '',
            });
            router.replace(`/signup?${params.toString()}`);
          }
        } catch (error) {
          console.error('Registration check failed:', error);
          // 에러 발생 시 메인 페이지로 리다이렉트
          router.replace("/");
        }
      };

      checkAndRedirect();
    }
    // 인증에 실패했다면(예: 팝업을 닫은 경우) 메인 페이지로 돌려보냅니다.
    else if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, session, router]);

  // 로딩 중 UI: 사용자에게 현재 처리 중임을 알려줍니다.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">로그인 정보를 확인 중입니다...</p>
    </div>
  );
}