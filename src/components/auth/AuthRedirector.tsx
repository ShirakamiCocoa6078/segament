// 파일 경로: src/components/auth/AuthRedirector.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthRedirector() {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 세션 로딩 중이거나, 이미 인증 관련 페이지에 있다면 아무것도 하지 않음
    if (status === 'loading' || pathname.startsWith('/signup') || pathname.startsWith('/api/auth')) {
      return;
    }

    // 로그인 상태이고 현재 경로가 대시보드가 아니라면 대시보드로 이동
    if (status === 'authenticated' && pathname !== '/dashboard') {
      router.push('/dashboard');
    }
  }, [status, pathname, router]);

  return null;
}
