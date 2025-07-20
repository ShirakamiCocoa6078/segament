'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ChunithmProfile {
  id: string;
  userId: string;
  playerName: string;
  rating: number;
  overPower: number;
  title?: string;
  character?: string;
  playCount: number;
  firstPlayDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface ChunithmPlaylog {
  profileId: string;
  musicId: string;
  difficulty: string;
  score: number;
  rank?: string;
  isAllJustice: boolean;
  isFullCombo: boolean;
}

interface DashboardData {
  profile: ChunithmProfile;
  playlogs: ChunithmPlaylog[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [profileExists, setProfileExists] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/dashboard');
        
        if (response.status === 404) {
          // 프로필이 없는 경우
          setProfileExists(false);
          return;
        }
        
        if (!response.ok) {
          throw new Error('데이터를 불러오는 데 실패했습니다.');
        }
        
        const dashboardData = await response.json();
        setData(dashboardData);
        setProfileExists(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    // 세션이 로딩 중이 아니고 인증된 상태일 때만 API 호출
    if (status !== 'loading' && status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status]);

  // 세션 로딩 중
  if (status === 'loading') {
    return (
      <div className="space-y-8 p-6">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[120px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">대시보드</h1>
        <p className="text-muted-foreground">
          다시 오신 것을 환영합니다! 당신의 리듬 게임 여정 요약입니다.
        </p>
      </div>

      {/* 에러 표시 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 프로필 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>프로필 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          ) : data?.profile ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">플레이어 이름</p>
                <p className="text-lg font-semibold">{data.profile.playerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">현재 레이팅</p>
                <p className="text-lg font-semibold">{data.profile.rating.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">칭호</p>
                <Badge variant="secondary">{data.profile.title || '칭호 없음'}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">오버파워</p>
                <p className="text-lg font-semibold">{data.profile.overPower.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">플레이 횟수</p>
                <p className="text-lg font-semibold">{data.profile.playCount}회</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">캐릭터</p>
                <p className="text-lg font-semibold">{data.profile.character || '없음'}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">프로필 정보를 찾을 수 없습니다.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 레이팅 분석 테이블 */}
        <Card>
          <CardHeader>
            <CardTitle>레이팅 분석</CardTitle>
            <p className="text-sm text-muted-foreground">Best 30 + Recent 10</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>곡명</TableHead>
                  <TableHead>난이도</TableHead>
                  <TableHead>점수</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-[120px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[60px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[80px]" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : data?.playlogs && data.playlogs.length > 0 ? (
                  data.playlogs.slice(0, 10).map((playlog, i) => (
                    <TableRow key={`${playlog.musicId}-${playlog.difficulty}-${i}`}>
                      <TableCell className="font-medium">{playlog.musicId}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{playlog.difficulty}</Badge>
                      </TableCell>
                      <TableCell>{playlog.score.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      플레이 기록이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {!isLoading && (!data?.playlogs || data.playlogs.length === 0) && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">레이팅 정보가 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 최근 플레이 기록 테이블 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 플레이 기록</CardTitle>
            <p className="text-sm text-muted-foreground">최근 10곡</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>곡명</TableHead>
                  <TableHead>점수</TableHead>
                  <TableHead>랭크</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-[120px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[40px]" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : data?.playlogs && data.playlogs.length > 0 ? (
                  data.playlogs.slice(0, 10).map((playlog, i) => (
                    <TableRow key={`${playlog.musicId}-${playlog.difficulty}-recent-${i}`}>
                      <TableCell className="font-medium">{playlog.musicId}</TableCell>
                      <TableCell>{playlog.score.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={playlog.rank === 'SSS' ? 'default' : 'secondary'}>
                          {playlog.rank || 'N/A'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      플레이 기록이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {!isLoading && (!data?.playlogs || data.playlogs.length === 0) && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">플레이 기록이 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
