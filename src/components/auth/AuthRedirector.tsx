// 파일 경로: src/components/auth/AuthRedirector.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthRedirector() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 세션 로딩 중이거나, 이미 인증 관련 페이지에 있다면 아무것도 하지 않음
    if (status === 'loading' || pathname.startsWith('/signup') || pathname.startsWith('/api/auth')) {
      setIsChecking(false);
      return;
    }

    // 로그인 상태일 때만 프로필 상태를 확인
    if (status === 'authenticated') {
      fetch('/api/user/profile-status')
        .then((res) => res.json())
        .then((data) => {
          if (data.hasProfile) {
            // 프로필이 있으면 -> 대시보드로 이동 (현재 페이지가 대시보드가 아닐 경우에만)
            if (pathname !== '/dashboard') {
              router.push('/dashboard');
            }
          } else {
            // 프로필이 없으면 -> 프로필 생성 페이지로 이동
            router.push('/profile/create');
          }
        })
        .catch(console.error)
        .finally(() => setIsChecking(false));
    } else {
      setIsChecking(false);
    }
  }, [status, pathname, router]);

  // 프로필 상태를 확인하는 동안 로딩 인디케이터 등을 보여줄 수 있습니다.
  // 여기서는 간단히 null을 반환합니다.
  return null;
}
