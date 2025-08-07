// 파일 경로: src/app/dashboard/[userId]/layout.tsx
'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';
import DashboardLayout from '@/app/dashboard/layout';

interface UserDashboardLayoutProps {
  children: ReactNode;
}

export default function UserDashboardLayout({ children }: UserDashboardLayoutProps) {
  const params = useParams();
  const { userId } = params;
  const { data: session } = useSession();
  
  const isOwner = session?.user?.id === userId;

  return (
    <DashboardLayout>
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
    </DashboardLayout>
  );
}
