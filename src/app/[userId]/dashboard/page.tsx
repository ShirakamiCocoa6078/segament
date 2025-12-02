// 파일 경로: src/app/[userId]/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ProfileCard } from '@/components/dashboard/ProfileCard';
import RegisterProfileDialog from '@/components/dashboard/RegisterProfileDialog';
import { LoadingState } from '@/components/ui/loading-spinner';
import { Card, CardContent } from '@/components/ui/card';
import type { ProfileSummary } from '@/types';

interface AccessMode {
  mode: 'owner' | 'visitor' | 'private';
  canEdit: boolean;
  showPrivateData: boolean;
}

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  useEffect(() => {
    // 임시 디버그: 세션 userId 및 전체 세션 콘솔 출력
    console.log('세션 userId:', session?.user?.userId);
    console.log('세션 전체:', session);
  }, [session]);
  const params = useParams();
  const { userId } = params;
  // (중복 useEffect 제거)
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessMode, setAccessMode] = useState<AccessMode>({ 
    mode: 'visitor', 
    canEdit: false, 
    showPrivateData: false 
  });

  useEffect(() => {
    const fetchProfiles = async () => {
      const userIdStr = String(userId);
      const sessionUserId = String(session?.user?.userId);
      if (!userIdStr) return;
      try {
        const isOwner = sessionUserId === userIdStr;
        setAccessMode({
          mode: isOwner ? 'owner' : 'visitor',
          canEdit: isOwner,
          showPrivateData: isOwner
        });
        const endpoint = isOwner
          ? '/api/dashboard'
          : `/api/profile/public/${userIdStr}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          if (response.status === 403) {
            setAccessMode(prev => ({ ...prev, mode: 'private' }));
            throw new Error('프로필이 비공개로 설정되어 있습니다.');
          } else if (response.status === 404) {
            throw new Error('사용자를 찾을 수 없습니다.');
          } else {
            throw new Error('프로필 정보를 불러오는데 실패했습니다.');
          }
        }
        const data = await response.json();
        setProfiles(data.profiles || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    if (status !== 'loading') {
      fetchProfiles();
    }
  }, [userId, session?.user?.userId, status]);

  if (status === 'loading' || isLoading) {
    return <LoadingState />;
  }

  if (error) {
    // 비공개 프로필 안내만 표시, 자동 리다이렉트 없음
    if (accessMode.mode === 'private') {
      return (
        <div className="container mx-auto p-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <p className="text-muted-foreground mb-4">
                  이 사용자는 프로필을 비공개로 설정했습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    // 그 외 에러는 안내만 표시
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userIdStr = String(userId);
  const sessionUserId = String(session?.user?.userId);
  const isOwner = sessionUserId === userIdStr && accessMode.mode === 'owner';

  // 프로필 렌더링 분기
  let visibleProfiles = profiles;
  if (!isOwner) {
    visibleProfiles = profiles.filter(p => p.isPublic);
  }

  return (
    <div className="container mx-auto p-2 sm:p-4">
      {isOwner ? (
        visibleProfiles.length > 0 ? (
          <div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left w-full sm:w-auto">
                내 대시보드
              </h1>
              <RegisterProfileDialog />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {visibleProfiles.map(profile => (
                <ProfileCard 
                  key={profile.id} 
                  profile={profile} 
                  userId={userId as string}
                  accessMode={accessMode}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="max-w-xs sm:max-w-md mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
                등록된 게임 프로필이 없습니다.
              </h2>
              <div className="mb-6 text-base sm:text-lg text-gray-600 dark:text-gray-200">
                게임 프로필을 등록해 주세요.
              </div>
              <RegisterProfileDialog />
            </div>
          </div>
        )
      ) : (
        visibleProfiles.length > 0 ? (
          <div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left w-full sm:w-auto">
                {`${userId}님의 프로필`}
              </h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {visibleProfiles.map(profile => (
                <ProfileCard 
                  key={profile.id} 
                  profile={profile} 
                  userId={userId as string}
                  accessMode={accessMode}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="max-w-xs sm:max-w-md mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
                열람 가능한 프로필이 존재하지 않습니다.
              </h2>
              <div className="mb-6 text-base sm:text-lg text-gray-600 dark:text-gray-200">
                이 사용자는 모든 게임 프로필을 비공개로 설정했습니다.
              </div>
              {/* 로그인/내 대시보드로 이동 버튼 */}
              {!session?.user ? (
                <button
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  onClick={() => { window.location.href = '/'; }}
                >로그인</button>
              ) : (
                <button
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  onClick={() => { window.location.href = `/${session.user.userId}/dashboard`; }}
                >내 대시보드로 이동</button>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
