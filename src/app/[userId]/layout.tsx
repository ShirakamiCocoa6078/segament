// 파일 경로: src/app/[userId]/layout.tsx
'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";

import { Toaster } from "@/components/ui/toaster";

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const params = useParams();
  const userId = params?.userId as string | undefined;
  // [주의] userId는 URL 파라미터로 전달되지만, 실제로는 공개용 userId가 들어와야 하며, cuid가 들어올 경우 버그 발생 가능
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // 자동 리다이렉트 제거: 비로그인 유저도 공개 프로필/대시보드 접근 허용

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }


  const isOwner = session?.user?.id === userId;
  // [주의] session.user.id는 내부용 cuid(id)임. userId(공개용)와 혼동 주의

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-4">
            <div className="relative">
              {!isOwner && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    💡 다른 사용자의 공개 프로필을 보고 있습니다.
                  </p>
                </div>
              )}
              {children}
            </div>
          </main>
        </div>
        {/* Toast 메시지 렌더링 */}
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
