import { ProfileDisplay } from "@/components/dashboard/profile-display";
import { PersonalizedTips } from "@/components/dashboard/personalized-tips";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChunithmIcon, MaimaiIcon } from "@/components/icons";
import { chunithmData, maimaiData } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">대시보드</h1>
        <p className="text-muted-foreground">
          다시 오신 것을 환영합니다! 당신의 리듬 게임 여정 요약입니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              츄니즘 레이팅
            </CardTitle>
            <ChunithmIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chunithmData.rating.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              상위 30 + 최근 베스트 10
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">마이마이 레이팅</CardTitle>
            <MaimaiIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maimaiData.rating}</div>
            <p className="text-xs text-muted-foreground">
              현재 및 과거 시즌 베스트
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">츄니즘 칭호</CardTitle>
            <ChunithmIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <Badge variant="secondary" className="text-lg">{chunithmData.title}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">마이마이 칭호</CardTitle>
            <MaimaiIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-lg">{maimaiData.title}</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProfileDisplay />
        </div>
        <div>
          <PersonalizedTips />
        </div>
      </div>
    </div>
  );
}
