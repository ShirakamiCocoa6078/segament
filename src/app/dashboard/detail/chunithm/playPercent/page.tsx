// 파일 경로: src/app/dashboard/detail/chunithm/playPercent/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface PlayPercentData {
  totalSongs: number;
  playedSongs: number;
  percentage: number;
  difficultyBreakdown: {
    [key: string]: {
      total: number;
      played: number;
      percentage: number;
    };
  };
}

export default function ChunithmPlayPercentPage() {
  const [playData, setPlayData] = useState<PlayPercentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: 실제 API 구현 시 교체
    const fetchPlayPercent = async () => {
      try {
        // 임시 데이터
        const mockData: PlayPercentData = {
          totalSongs: 850,
          playedSongs: 420,
          percentage: 49.4,
          difficultyBreakdown: {
            BASIC: { total: 850, played: 680, percentage: 80.0 },
            ADVANCED: { total: 850, played: 520, percentage: 61.2 },
            EXPERT: { total: 850, played: 380, percentage: 44.7 },
            MASTER: { total: 680, played: 250, percentage: 36.8 },
            ULTIMA: { total: 120, played: 45, percentage: 37.5 },
          },
        };
        
        setTimeout(() => {
          setPlayData(mockData);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch play percent data:', error);
        setIsLoading(false);
      }
    };

    fetchPlayPercent();
  }, []);

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

  if (!playData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              순회 진행도 데이터를 불러올 수 없습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const difficultyColors = {
    BASIC: 'bg-green-500',
    ADVANCED: 'bg-yellow-500',
    EXPERT: 'bg-red-500',
    MASTER: 'bg-purple-500',
    ULTIMA: 'bg-black',
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">CHUNITHM 순회 진행도</h1>
      
      {/* 전체 진행도 */}
      <Card>
        <CardHeader>
          <CardTitle>전체 진행도</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">
              {playData.playedSongs} / {playData.totalSongs} 곡
            </span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {playData.percentage.toFixed(1)}%
            </Badge>
          </div>
          <Progress value={playData.percentage} className="h-3" />
        </CardContent>
      </Card>

      {/* 난이도별 진행도 */}
      <Card>
        <CardHeader>
          <CardTitle>난이도별 진행도</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(playData.difficultyBreakdown).map(([difficulty, data]) => (
            <div key={difficulty} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-4 h-4 rounded ${difficultyColors[difficulty as keyof typeof difficultyColors] || 'bg-gray-500'}`}
                  />
                  <span className="font-medium text-lg">{difficulty}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {data.played} / {data.total}
                  </span>
                  <Badge variant="outline">
                    {data.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <Progress value={data.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 통계 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{playData.playedSongs}</p>
              <p className="text-sm text-muted-foreground">플레이한 곡 수</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{playData.totalSongs - playData.playedSongs}</p>
              <p className="text-sm text-muted-foreground">미플레이 곡 수</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{playData.percentage.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">전체 진행률</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
