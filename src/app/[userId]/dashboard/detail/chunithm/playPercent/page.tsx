// 파일 경로: src/app/[userId]/dashboard/detail/chunithm/playPercent/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChunithmProfile {
  id: string;
  playerName: string;
  region: string;
  rating: number;
  level: number;
}

interface PlayPercentData {
  totalSongs: number;
  playedSongs: number;
  playPercentage: number;
  difficultyBreakdown: {
    [key: string]: {
      total: number;
      played: number;
      percentage: number;
    };
  };
}

interface AccessMode {
  mode: 'owner' | 'visitor';
  canEdit: boolean;
  showPrivateData: boolean;
}

export default function ChunithmPlayPercentPage() {
  const [profiles, setProfiles] = useState<ChunithmProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ChunithmProfile | null>(null);
  const [playData, setPlayData] = useState<PlayPercentData | null>(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [isLoadingPlayData, setIsLoadingPlayData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessMode, setAccessMode] = useState<AccessMode>({ mode: 'visitor', canEdit: false, showPrivateData: false });
  
  const params = useParams();
  const { userId } = params;
  const { data: session } = useSession();

  // 프로필 목록 가져오기
  useEffect(() => {
    const fetchProfiles = async () => {
      if (typeof userId !== 'string') return;
      
      try {
        const isOwner = session?.user?.id === userId;
        setAccessMode({
          mode: isOwner ? 'owner' : 'visitor',
          canEdit: isOwner,
          showPrivateData: isOwner
        });

        const endpoint = isOwner 
          ? '/api/dashboard'
          : `/api/profile/public/${userId}`;
          
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('프로필이 비공개로 설정되어 있습니다.');
          } else if (response.status === 404) {
            throw new Error('사용자를 찾을 수 없습니다.');
          } else {
            throw new Error('프로필 정보를 불러오는데 실패했습니다.');
          }
        }
        
        const data = await response.json();
        const chunithmProfiles = data.profiles?.filter((profile: any) => profile.gameType === 'CHUNITHM') || [];
        
        setProfiles(chunithmProfiles);
        
        // 첫 번째 프로필을 기본 선택
        if (chunithmProfiles.length > 0) {
          setSelectedProfile(chunithmProfiles[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoadingProfiles(false);
      }
    };

    if (session !== undefined) {
      fetchProfiles();
    }
  }, [userId, session]);

  // 선택된 프로필에 따른 플레이 데이터 가져오기
  useEffect(() => {
    const fetchPlayData = async () => {
      if (!selectedProfile) return;
      
      setIsLoadingPlayData(true);
      try {
        const isOwner = session?.user?.id === userId;
        const endpoint = isOwner 
          ? `/api/dashboard/play-percent?gameType=CHUNITHM&region=${selectedProfile.region}`
          : `/api/profile/play-percent/${userId}?gameType=CHUNITHM&region=${selectedProfile.region}`;
          
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('프로필이 비공개로 설정되어 있습니다.');
          } else if (response.status === 404) {
            throw new Error('플레이 데이터를 찾을 수 없습니다.');
          } else {
            throw new Error('플레이 데이터를 불러오는데 실패했습니다.');
          }
        }
        
        const data = await response.json();
        setPlayData(data.playData);
      } catch (err) {
        console.error('플레이 데이터 로딩 에러:', err);
        setPlayData(null);
      } finally {
        setIsLoadingPlayData(false);
      }
    };

    if (selectedProfile) {
      fetchPlayData();
    }
  }, [selectedProfile, userId, session]);

  const handleProfileChange = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setSelectedProfile(profile);
    }
  };

  if (isLoadingProfiles) {
    return <div className="p-4 text-center">프로필을 불러오는 중...</div>;
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Link href={`/${userId}/dashboard`}>
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  대시보드로 돌아가기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">CHUNITHM 프로필이 존재하지 않습니다.</p>
              <Link href={`/${userId}/dashboard`}>
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  대시보드로 돌아가기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <Link href={`/${userId}/dashboard`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {accessMode.mode === 'owner' ? '내 대시보드' : '프로필로 돌아가기'}
          </Button>
        </Link>
        
        {accessMode.mode === 'visitor' && (
          <div className="text-sm text-muted-foreground bg-gray-100 px-3 py-1 rounded">
            공개 프로필 보기
          </div>
        )}
      </div>

      {/* 프로필 선택 섹션 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>프로필 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label htmlFor="profile-select" className="text-sm font-medium">
              CHUNITHM 프로필:
            </label>
            <Select value={selectedProfile?.id || ''} onValueChange={handleProfileChange}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="프로필을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.playerName} ({profile.region})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 선택된 프로필 정보 표시 */}
      {selectedProfile && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>선택된 프로필</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{selectedProfile.playerName}</p>
                <p className="text-sm text-muted-foreground">플레이어 닉네임</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{selectedProfile.region}</p>
                <p className="text-sm text-muted-foreground">지역</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{selectedProfile.rating.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">레이팅</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 플레이 데이터 표시 */}
      {isLoadingPlayData && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground">플레이 데이터를 불러오는 중...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoadingPlayData && playData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CHUNITHM 플레이 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{playData.totalSongs}</p>
                  <p className="text-sm text-muted-foreground">총 곡 수</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{playData.playedSongs}</p>
                  <p className="text-sm text-muted-foreground">플레이한 곡 수</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{playData.playPercentage.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">플레이 퍼센트</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>난이도별 플레이 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(playData.difficultyBreakdown).map(([difficulty, data]) => (
                  <div key={difficulty} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">{difficulty.toUpperCase()}</span>
                      <span className="text-sm text-muted-foreground">
                        {data.played} / {data.total}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${data.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{data.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!isLoadingPlayData && !playData && selectedProfile && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground">해당 프로필의 플레이 데이터가 없습니다.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}