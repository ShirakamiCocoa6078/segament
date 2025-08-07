// 파일 경로: src/app/dashboard/[userId]/dashboard/page.tsx
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
  const params = useParams();
  const userId = params.userId as string;
  const { data: session, status } = useSession();
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accessMode, setAccessMode] = useState<AccessMode>({ mode: 'private', canEdit: false, showPrivateData: false });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // 접근 권한 확인
        const isOwner = session?.user?.id === userId;
        
        if (isOwner) {
          // 본인 접근 - 전체 데이터
          const response = await fetch('/api/dashboard');
          const data = await response.json();
          setProfiles(data.profiles || []);
          setAccessMode({ mode: 'owner', canEdit: true, showPrivateData: true });
        } else {
          // 타인/익명 접근 - 공개 데이터만
          const response = await fetch(`/api/profile/public/${userId}`);
          if (response.ok) {
            const data = await response.json();
            setProfiles(data.profiles || []);
            setAccessMode({ mode: 'visitor', canEdit: false, showPrivateData: false });
          } else if (response.status === 404) {
            setAccessMode({ mode: 'private', canEdit: false, showPrivateData: false });
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status !== 'loading') {
      fetchProfileData();
    }
  }, [userId, session?.user?.id, status]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (accessMode.mode === 'private') {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">비공개 프로필</h1>
              <p className="text-muted-foreground">
                이 사용자의 프로필은 비공개로 설정되어 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {accessMode.mode === 'owner' ? '대시보드' : `${userId}님의 프로필`}
        </h1>
        {accessMode.mode === 'visitor' && (
          <div className="text-sm text-muted-foreground">
            공개 프로필 보기
          </div>
        )}
      </div>

      {profiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map(profile => (
            <ProfileCard 
              key={profile.id} 
              profile={profile} 
              userId={userId}
              accessMode={accessMode}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="space-y-4">
            {accessMode.mode === 'owner' ? (
              <>
                <h2 className="text-4xl font-bold font-headline">Segament에 오신 것을 환영합니다!</h2>
                <p className="text-xl text-muted-foreground max-w-md">
                  데이터를 관리하려면 게임 프로필을 등록해주세요.
                </p>
                <RegisterProfileDialog />
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold">등록된 프로필이 없습니다</h2>
                <p className="text-muted-foreground">
                  이 사용자는 아직 게임 프로필을 등록하지 않았습니다.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
