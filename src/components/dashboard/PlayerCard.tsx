// 파일 경로: src/components/dashboard/PlayerCard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- 타입 정의 ---
interface Honor {
  text: string;
  color: string;
}
interface ProfileDetail {
  playerName: string;
  rating: number;
  level: number;
  honors?: Honor[];
  teamName?: string;
  characterImage?: string;
  playCount: number;
}

export function PlayerCard({ profile }: { profile: ProfileDetail }) {
    // 칭호 색상에 따른 Badge 스타일 매핑
    const honorVariantMap: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
        GOLD: 'default',
        PLATINA: 'secondary',
        SILVER: 'outline'
        // 기타 색상은 필요에 따라 추가
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={profile.characterImage} alt={profile.playerName} />
                        <AvatarFallback>{profile.playerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-3xl">{profile.playerName}</CardTitle>
                            {profile.teamName && <Badge variant="secondary">{profile.teamName}</Badge>}
                        </div>
                        <div className="flex items-baseline space-x-4 text-muted-foreground mt-1">
                            <span>Lv. {profile.level}</span>
                            <span>Rating: {profile.rating.toFixed(2)}</span>
                            <span>Play Count: {profile.playCount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-semibold mr-2">Honors:</span>
                    {profile.honors?.slice(0, 3).map((honor: { color: string; text: string }, index: number) => (
                        <Badge key={index} variant={honorVariantMap[honor.color] || 'default'}>
                            {honor.text}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}