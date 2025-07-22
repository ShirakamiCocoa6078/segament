// 파일 경로: src/app/dashboard/detail/chunithm/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// TODO: 이 타입 정의는 향후 @/types/index.ts 와 같은 공용 파일로 분리하여 관리합니다.
interface Playlog {
  title: string;
  difficulty: string;
  score: number;
  rank: string;
  // ... 기타 필드
}

interface ProfileDetail {
  playerName: string;
  rating: number;
  level: number;
  overPower: number;
  playCount: number;
  gameData?: {
    playlogs: Playlog[];
    ratingLists: {
        best: any[];
        recent: any[];
    };
  }
}

export default function ChunithmDetailPage() {
  const params = useParams();
  const { slug } = params; // URL로부터 'jp' 또는 'intl'을 가져옴

  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof slug === 'string') {
      const region = slug.toUpperCase();
      fetch(`/api/dashboard/detail?gameType=CHUNITHM&region=${region}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('프로필 정보를 불러오는데 실패했습니다.');
          }
          return res.json();
        })
        .then(data => {
          setProfile(data.profile);
        })
        .catch(err => {
          setError(err.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
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
      
      {/* TODO: 이 섹션은 향후 별도의 컴포넌트로 분리합니다. (예: ProfileSummaryCard.tsx) */}
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

      {/* TODO: 이 섹션들은 향후 탭(Tabs) UI로 구성하여 Best, New, All Logs를 전환하며 볼 수 있도록 구현합니다. */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Rating List (Best)</h2>
        {/* TODO: 이 테이블은 shadcn/ui의 Table 컴포넌트를 사용하여 재사용 가능한 컴포넌트로 만듭니다. */}
        <div className="p-2 bg-gray-100 rounded text-xs overflow-x-auto">
            <pre>{JSON.stringify(profile.gameData?.ratingLists.best.slice(0, 5), null, 2)}</pre>
        </div>
      </div>
       <div className="mt-4">
        <h2 className="text-2xl font-semibold mb-2">Playlogs</h2>
         {/* TODO: 이 테이블은 필터링, 정렬 기능이 포함된 데이터 테이블로 고도화합니다. */}
        <div className="p-2 bg-gray-100 rounded text-xs overflow-x-auto">
            <pre>{JSON.stringify(profile.gameData?.playlogs.slice(0, 5), null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}