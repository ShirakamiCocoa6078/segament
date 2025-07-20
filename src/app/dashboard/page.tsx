'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">대시보드</h1>
        <p className="text-muted-foreground">
          다시 오신 것을 환영합니다! 당신의 리듬 게임 여정 요약입니다.
        </p>
      </div>

      {/* 프로필 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>프로필 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">플레이어 이름</p>
                <p className="text-lg font-semibold">프로필 정보 로딩 중...</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">현재 레이팅</p>
                <p className="text-lg font-semibold">프로필 정보 로딩 중...</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">칭호</p>
                <Badge variant="secondary">프로필 정보 로딩 중...</Badge>
              </div>
            </div>
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
                  <TableHead>레이팅</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[60px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[50px]" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">레이팅 정보 로딩 중...</p>
            </div>
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
                {[...Array(5)].map((_, i) => (
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
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">플레이 기록 로딩 중...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
