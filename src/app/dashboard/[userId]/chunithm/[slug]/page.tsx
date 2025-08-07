// 파일 경로: src/app/dashboard/[userId]/chunithm/[slug]/page.tsx
'use client';

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
  const { userId, slug } = params;
  const { data: session } = useSession();

  useEffect(() => {
    const fetchProfile = async () => {
      if (typeof slug !== 'string' || typeof userId !== 'string') return;
      
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
              <Link href={`/dashboard/${userId}/dashboard`}>
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
              <Link href={`/dashboard/${userId}/dashboard`}>
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
        <Link href={`/dashboard/${userId}/dashboard`}>
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
      
      <ProfileDisplay profile={profile} />

      <Tabs defaultValue="best" className="w-full mt-6">
        <TabsList>
          <TabsTrigger value="best">Best</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          {accessMode.showPrivateData && (
            <TabsTrigger value="all">All Records</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="best">
          <SongDataTable data={profile.gameData?.ratingLists.best || []} />
        </TabsContent>
        
        <TabsContent value="new">
          <SongDataTable data={profile.gameData?.ratingLists.new || []} />
        </TabsContent>
        
        {accessMode.showPrivateData && (
          <TabsContent value="all">
            <SongDataTable data={profile.gameData?.playlogs || []} showPagination={true} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
