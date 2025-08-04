// 파일 경로: src/app/dashboard/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import RegisterProfileDialog from '@/components/dashboard/RegisterProfileDialog';
import { ProfileCard } from '@/components/dashboard/ProfileCard';
import { LoadingState } from '@/components/ui/loading-spinner';
import type { ProfileSummary, DashboardResponse } from '@/types';
import { apiGet } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';

export default function DashboardPage() {
  const { status } = useSession();
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    try {
      const data = await apiGet<DashboardResponse>(API_ENDPOINTS.DASHBOARD);
      setProfiles(data.profiles || []);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfiles();
    } else if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status, fetchProfiles]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="container mx-auto p-4">
      {profiles.length > 0 ? (
        <div>
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map(profile => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
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