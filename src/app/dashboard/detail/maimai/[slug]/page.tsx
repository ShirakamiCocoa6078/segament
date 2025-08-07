// 파일 경로: src/app/dashboard/detail/maimai/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SongDataTable } from '@/components/dashboard/SongDataTable';
import { SongRatingTable } from '@/components/dashboard/SongRatingTable';
import { PlaylogTable } from '@/components/dashboard/PlaylogTable';

interface ProfileData {
  id: string;
  playerName: string;
  rating: number;
  level: number;
  gameData: {
    playlogs: any[];
    ratingLists: {
      best: any[];
      new: any[];
    };
  };
}

export default function MaimaiDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/dashboard/detail?gameType=MAIMAI&region=JP`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile);
        } else {
          console.error('Failed to fetch profile data');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              프로필 데이터를 불러올 수 없습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">maimai 곡 프로필</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {profile.playerName}
        </Badge>
      </div>

      {/* 프로필 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{profile.rating.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Rating</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{profile.level}</p>
              <p className="text-sm text-muted-foreground">Level</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{profile.gameData?.playlogs?.length || 0}</p>
              <p className="text-sm text-muted-foreground">총 플레이 수</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 탭 컨텐츠 */}
      <Tabs defaultValue="best" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="best">Best 30</TabsTrigger>
          <TabsTrigger value="new">New 15</TabsTrigger>
          <TabsTrigger value="playlogs">플레이 로그</TabsTrigger>
        </TabsList>
        
        <TabsContent value="best" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Best 30 곡</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.gameData?.ratingLists?.best ? (
                <SongRatingTable songs={profile.gameData.ratingLists.best} />
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Best 30 데이터가 없습니다.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>New 15 곡</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.gameData?.ratingLists?.new ? (
                <SongRatingTable songs={profile.gameData.ratingLists.new} />
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  New 15 데이터가 없습니다.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="playlogs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>최근 플레이 로그</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.gameData?.playlogs ? (
                <PlaylogTable playlogs={profile.gameData.playlogs.slice(0, 50)} />
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  플레이 로그 데이터가 없습니다.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
