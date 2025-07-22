// 파일 경로: src/app/dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// 수정: 컴포넌트의 실제 위치를 정확히 명시합니다.
import RegisterProfileDialog from '@/components/dashboard/RegisterProfileDialog'; 

export default function DashboardPage() {
  const { status } = useSession();
  const [profileExists, setProfileExists] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 세션 상태가 'authenticated'일 때만 프로필 정보를 가져옵니다.
    if (status === 'authenticated') {
      const fetchProfile = async () => {
        try {
          const response = await fetch('/api/dashboard');
          
          if (!response.ok) {
            setProfileExists(false);
            return;
          }

          const data = await response.json();
          
          if (data && data.profile) {
            setProfileExists(true);
          } else {
            setProfileExists(false);
          }
        } catch (error) {
          console.error('Failed to fetch profile data:', error);
          setProfileExists(false);
        } finally {
          setIsLoading(false);
        }
      };

      fetchProfile();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [status]);

  if (isLoading) {
    return <div className="text-center p-10">데이터를 불러오는 중...</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="text-center p-10">로그인이 필요합니다.</div>;
  }

  return (
    <div>
      {/* 프로필이 있는 경우, 향후 대시보드 콘텐츠가 표시될 영역 */}
      {profileExists && (
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p>플레이어 프로필 정보가 여기에 표시됩니다.</p>
        </div>
      )}

      {/* 프로필이 없는 경우 환영 메시지 */}
      {!profileExists && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold font-headline">Segament에 오신 것을 환영합니다!</h1>
            <p className="text-xl text-muted-foreground max-w-md">
              데이터를 관리하려면 게임 프로필을 등록해주세요.
            </p>
          </div>
          <RegisterProfileDialog />
        </div>
      )}
    </div>
  );
} 