// 파일 경로: src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import RegisterProfileDialog from '@/components/dashboard/RegisterProfileDialog';

// TODO: 향후 이 타입 정의는 @/types/index.ts 와 같은 공용 파일로 분리하여 관리합니다.
interface ProfileSummary {
  id: string;
  gameType: string;
  region: string;
  playerName: string;
  rating: number;
}

export default function DashboardPage() {
  const { status } = useSession();
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchProfiles = async () => {
        try {
          const response = await fetch('/api/dashboard');
          if (!response.ok) throw new Error('Failed to fetch');
          const data = await response.json();
          setProfiles(data.profiles || []);
        } catch (error) {
          console.error('Failed to fetch profile data:', error);
          setProfiles([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfiles();
    } else if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status]);

  if (isLoading) {
    return <div className="text-center p-10">데이터를 불러오는 중...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {profiles.length > 0 ? (
        <div>
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map(profile => {
              const gameTypeSlug = profile.gameType.toLowerCase();
              const regionSlug = profile.region.toLowerCase();
              const detailUrl = `/dashboard/detail/${gameTypeSlug}/${regionSlug}`;

              return (
                <Link href={detailUrl} key={profile.id} className="block p-6 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors">
                  <h2 className="text-xl font-semibold">{profile.gameType}</h2>
                  <p className="text-sm text-gray-500 mb-2">{profile.region}</p>
                  <p className="text-lg">{profile.playerName}</p>
                  <p className="text-gray-600">Rating: {profile.rating.toFixed(2)}</p>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
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