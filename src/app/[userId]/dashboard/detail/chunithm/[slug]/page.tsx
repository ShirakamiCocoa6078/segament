
'use client';
// 디버깅: 주요 상태를 useEffect에서 출력
// (아래에서 useEffect를 올바른 위치에 배치)

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';
import { SongDataTable } from '@/components/dashboard/SongDataTable';
import { ProfileDisplay } from '@/components/dashboard/profile-display';
import { ChunithmSongGrid } from '@/components/dashboard/ChunithmSongGrid';

interface ProfileDetail {
  playerName: string;
  rating: number;
  level: number;
  honors?: any[];
  teamName?: string;
  teamEmblemColor?: string;
  characterImage?: string;
  playCount: number;
  gameData?: {
    playlogs: any[];
    ratingLists: {
        best: any[];
        new: any[];
    };
  }
}

interface AccessMode {
  mode: 'owner' | 'visitor';
  canEdit: boolean;
  showPrivateData: boolean;
}

export default function UserChunithmDetailPage() {

  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessMode, setAccessMode] = useState<AccessMode>({ mode: 'visitor', canEdit: false, showPrivateData: false });
  
  const params = useParams();
  const userId = params?.userId as string | undefined;
  const slug = params?.slug as string | undefined;
  const { data: session } = useSession();

  // 디버깅: 주요 상태를 useEffect에서 출력
  useEffect(() => {
  }, [session, userId, slug, accessMode, isLoading, error, profile]);

  useEffect(() => {
  const fetchProfile = async () => {
      if (typeof slug !== 'string' || typeof userId !== 'string') {
        return;
      }
      
      try {
        const isOwner = session?.user?.id === userId;
        setAccessMode({
          mode: isOwner ? 'owner' : 'visitor',
          canEdit: isOwner,
          showPrivateData: isOwner
        });

        const region = slug.toUpperCase();
        const endpoint = isOwner 
          ? `/api/dashboard/detail?gameType=CHUNITHM&region=${region}`
          : `/api/profile/detail/${userId}?gameType=CHUNITHM&region=${region}`;
          
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('프로필이 비공개로 설정되어 있습니다.');
          } else if (response.status === 404) {
            throw new Error('프로필을 찾을 수 없습니다.');
          } else {
            throw new Error('프로필 정보를 불러오는데 실패했습니다.');
          }
        }
        
        const data = await response.json();
        setProfile(data.profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [slug, userId, session?.user?.id]);

  if (isLoading) return <div className="p-4 text-center">로딩 중...</div>;
  
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
  
  if (!profile) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">프로필이 존재하지 않습니다.</p>
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
      {/* 상단 우측 로그인/프로필 영역 */}
      <div className="flex items-center justify-between mb-6">
        <Link href={`/${userId}/dashboard`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {accessMode.mode === 'owner' ? '내 대시보드' : '프로필로 돌아가기'}
          </Button>
        </Link>
        {/* 로그인 유저 프로필 대신 로그인 버튼 */}
        {!session?.user ? (
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = '/';
            }}
          >
            로그인
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            {/* 로그인 유저 프로필 표시 (원래대로) */}
            {/* ...프로필 아바타 등 표시 가능... */}
          </div>
        )}
        {accessMode.mode === 'visitor' && (
          <div className="text-sm text-muted-foreground bg-gray-100 px-3 py-1 rounded">
            공개 프로필 보기
          </div>
        )}
      </div>

      <ProfileDisplay profile={profile} />

      <Tabs defaultValue="best" className="w-full mt-6">
        <TabsList>
          <TabsTrigger value="best">Best 30</TabsTrigger>
          <TabsTrigger value="new">New 20</TabsTrigger>
          {accessMode.showPrivateData && (
            <TabsTrigger value="all">All Records</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="best" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <ChunithmSongGrid 
                songs={profile.gameData?.ratingLists.best || []} 
                type="best"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <ChunithmSongGrid 
                songs={profile.gameData?.ratingLists.new || []} 
                type="new"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {accessMode.showPrivateData && (
          <TabsContent value="all" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <SongDataTable data={profile.gameData?.playlogs || []} showPagination={true} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
