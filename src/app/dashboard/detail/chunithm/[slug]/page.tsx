// 파일 경로: src/app/dashboard/detail/chunithm/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SongDataTable } from '@/components/dashboard/SongDataTable'; // 통합 테이블 컴포넌트 import

// --- 타입 정의 ---
// TODO: 향후 이 타입 정의들은 @/types/index.ts 와 같은 공용 파일로 분리하여 관리합니다.
interface SongData {
  id: string;
  title: string;
  score: number;
  level: string;
  difficulty: string;
  const: number;
  ratingValue: number;
}

interface ProfileDetail {
  playerName: string;
  rating: number;
  level: number;
  overPower: number;
  playCount: number;
  gameData?: {
    playlogs: SongData[];
    ratingLists: {
        best: SongData[];
        new: SongData[];
    };
  }
}
// --- 타입 정의 끝 ---

export default function ChunithmDetailPage() {
  const params = useParams();
  const { slug } = params;

  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof slug === 'string') {
      const region = slug.toUpperCase();
      fetch(`/api/dashboard/detail?gameType=CHUNITHM&region=${region}`)
        .then(res => {
          if (!res.ok) throw new Error('프로필 정보를 불러오는데 실패했습니다.');
          return res.json();
        })
        .then(data => setProfile(data.profile))
        .catch(err => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [slug]);

  if (isLoading) return <div className="p-4 text-center">로딩 중...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!profile) return <div className="p-4 text-center">프로필이 존재하지 않습니다.</div>;

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-4xl font-bold">{profile.playerName}</h1>
        <p className="text-xl text-muted-foreground">CHUNITHM - {slug.toString().toUpperCase()}</p>
      </header>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-gray-100 rounded-lg text-center">
            <p className="text-sm text-gray-500">Rating</p>
            <p className="text-2xl font-bold">{profile.rating.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-lg text-center">
            <p className="text-sm text-gray-500">Level</p>
            <p className="text-2xl font-bold">{profile.level}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-lg text-center">
            <p className="text-sm text-gray-500">Over Power</p>
            <p className="text-2xl font-bold">{profile.overPower.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-lg text-center">
            <p className="text-sm text-gray-500">Play Count</p>
            <p className="text-2xl font-bold">{profile.playCount}</p>
        </div>
      </div>

      <Tabs defaultValue="best" className="w-full">
        <TabsList>
          <TabsTrigger value="best">Best</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="all">All Records</TabsTrigger>
        </TabsList>
        <TabsContent value="best">
            <SongDataTable data={profile.gameData?.ratingLists.best || []} />
        </TabsContent>
        <TabsContent value="new">
            <SongDataTable data={profile.gameData?.ratingLists.new || []} />
        </TabsContent>
        <TabsContent value="all">
            <SongDataTable data={profile.gameData?.playlogs || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}