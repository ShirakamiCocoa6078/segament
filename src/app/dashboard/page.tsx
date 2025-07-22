// 파일 경로: src/app/dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import RegisterProfileDialog from '@/components/dashboard/RegisterProfileDialog'; 

// 프로필 데이터 타입을 정의하여 코드 안정성을 높입니다.
// 실제 데이터 구조에 맞게 확장될 수 있습니다.
interface ProfileData {
  playerName: string;
  rating: number;
  level: number;
  playCount: number;
  // gameData 등 다른 데이터도 포함될 수 있습니다.
  [key: string]: any; 
}

export default function DashboardPage() {
  const { status } = useSession();
  // 수정: profileData 상태를 추가하여 API 응답을 저장합니다.
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchProfile = async () => {
        try {
          const response = await fetch('/api/dashboard');
          if (!response.ok) {
            setProfileData(null);
            return;
          }
          const data = await response.json();
          if (data && data.profile) {
            // 수정: 받아온 프로필 데이터를 상태에 저장합니다.
            setProfileData(data.profile);
          } else {
            setProfileData(null);
          }
        } catch (error) {
          console.error('Failed to fetch profile data:', error);
          setProfileData(null);
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
    <div className="container mx-auto p-4">
      {/* --- 수정: profileData가 있을 때 실제 대시보드 UI를 렌더링 --- */}
      {profileData ? (
        <div>
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 플레이어 정보 카드 */}
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold">{profileData.playerName}</h2>
              <p className="text-gray-600">Rating: {profileData.rating}</p>
              <p className="text-gray-600">Level: {profileData.level}</p>
              <p className="text-gray-600">Play Count: {profileData.playCount}</p>
            </div>
            {/* 추가적인 데이터 시각화 컴포넌트가 위치할 자리 */}
          </div>
        </div>
      ) : (
        // --- 기존 로직: profileData가 없을 때 환영 메시지 표시 ---
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