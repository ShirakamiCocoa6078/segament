// 파일 경로: src/app/dashboard/detail/chunithm/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SongDataTable } from '@/components/dashboard/SongDataTable';
import { PlayerCard } from '@/components/dashboard/PlayerCard';

// --- 타입 정의 ---
// TODO: 향후 이 타입 정의들은 @/types/index.ts 와 같은 공용 파일로 분리하여 관리합니다.
interface Honor {
  text: string;
  color: 'NORMAL' | 'SILVER' | 'GOLD' | 'PLATINA' | 'RAINBOW' | 'ONGEKI';
}

interface SongData {
  id: string;
  title: string;
  score: number;
  level: string;
  difficulty: string;
  const: number;
  ratingValue: number;
  ratingListType?: 'best' | 'new' | null;
}

interface ProfileDetail {
  playerName: string;
  rating: number;
  level: number;
  honors?: Honor[];
  teamName?: string;
  teamEmblemColor?: string;
  classEmblemTop?: string;
  classEmblemBase?: string;
  characterImage?: string;
  characterBackground?: string;
  nameplateImage?: string;
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
  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const { slug } = params;

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
      <PlayerCard profile={profile} />

      <Tabs defaultValue="best" className="w-full mt-6">
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