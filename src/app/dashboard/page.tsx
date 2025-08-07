// 파일 경로: src/app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user?.id) {
      // 사용자가 로그인되어 있으면 새로운 URL 구조로 리다이렉트
      router.replace(`/dashboard/${session.user.id}/dashboard`);
    } else {
      // 로그인되어 있지 않으면 로그인 페이지로 리다이렉트
      router.replace('/auth/signin');
    }
  }, [session, status, router]);

  // 리다이렉트 중 표시할 로딩 상태
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-muted-foreground">대시보드로 이동 중...</p>
      </div>
    </div>
  );
}