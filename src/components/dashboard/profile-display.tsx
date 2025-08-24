// 파일 경로: src/components/dashboard/profile-display.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- 타입 정의 (이전과 동일) ---
interface Honor {
  text: string;
  color: 'NORMAL' | 'SILVER' | 'GOLD' | 'PLATINA' | 'RAINBOW' | 'ONGEKI';
}
interface ProfileDetail {
  playerName: string;
  rating: number;
  level: number;
  honors?: Honor[];
  teamName?: string;
  teamEmblemColor?: string;
  characterImage?: string;
  playCount: number;
  ratingHistory?: Record<string, number>; // 레이팅 히스토리 추가
}

// --- 헬퍼 함수 (이전과 동일) ---
const getRatingColor = (rating: number): string => {
  if (rating >= 17.00) return 'kiwami';
  if (rating >= 16.00) return 'rainbow';
  if (rating >= 15.25) return 'platinum';
  if (rating >= 14.50) return 'gold';
  if (rating >= 13.25) return 'silver';
  if (rating >= 12.00) return 'bronze';
  if (rating >= 10.00) return 'purple';
  if (rating >= 7.00) return 'red';
  if (rating >= 4.00) return 'orange';
  return 'green';
};

const honorBgMap: Record<string, string> = {
    NORMAL: 'normal',
    SILVER: 'silver',
    GOLD: 'gold',
    PLATINA: 'platina',
    RAINBOW: 'rainbow',
    ONGEKI: 'ongeki',
};

export function ProfileDisplay({ profile }: { profile: ProfileDetail }) {
    // 최신 레이팅 가져오기 (히스토리가 있으면 최신 값, 없으면 기본 rating)
    const getLatestRating = () => {
        if (!profile.ratingHistory || Object.keys(profile.ratingHistory).length === 0) {
            return profile.rating;
        }
        
        const sortedEntries = Object.entries(profile.ratingHistory).sort((a, b) => {
            // 날짜-시간 문자열을 비교 (2025-08-12|11:04 형식)
            return a[0].localeCompare(b[0]);
        });
        
        return sortedEntries[sortedEntries.length - 1][1];
    };

    const currentRating = getLatestRating();
    const ratingColor = getRatingColor(currentRating);
    const ratingDigits = currentRating.toFixed(2).split('');

    // --- 신규: 레이팅 숫자별 스타일 정의 ---
    const ratingDigitStyles = [
        { width: '12px', height: '20px' }, // 첫 번째 숫자
        { width: '12px', height: '20px' }, // 두 번째 숫자
        { width: '5px', height: '6px' },   // 콤마 (기존 크기 유지)
        { width: '12px', height: '20px' }, // 세 번째 숫자
        { width: '12px', height: '20px' }, // 네 번째 숫자
    ];

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <div className="flex flex-wrap items-center gap-4">
                    <Avatar className="h-16 w-16 md:h-20 md:w-20">
                        <AvatarImage src={profile.characterImage} alt={profile.playerName} />
                        <AvatarFallback>{profile.playerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <CardTitle className="text-2xl md:text-3xl">{profile.playerName}</CardTitle>
                            {profile.teamName && (
                                <div 
                                    className="text-sm font-semibold text-white bg-no-repeat bg-center bg-contain"
                                    // --- 수정: 팀 엠블럼 스타일 적용 ---
                                    style={{ 
                                        backgroundImage: `url(https://new.chunithm-net.com/chuni-mobile/html/mobile/images/team_bg_${profile.teamEmblemColor || 'normal'}.png)`,
                                        display: 'flex',
                                        width: '210px',
                                        height: '50px',
                                        padding: '16px 42px 17px 42px',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    {profile.teamName}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm md:text-base text-muted-foreground mt-1">
                            <span>Lv. {profile.level}</span>
                            <div className="flex items-end space-x-0.5">
                                <span className="mr-1">Rating: </span>
                                <span className="font-bold text-lg md:text-xl text-blue-600 dark:text-blue-300">{currentRating.toFixed(2)}</span>
                            </div>
                            <span>Play Count: {profile.playCount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2 items-center">
                    {profile.honors?.slice(0, 3).map((honor: { color: string; text: string }, index: number) => (
                        <div 
                            key={index}
                            className="w-[240px] h-[30px] bg-no-repeat bg-center bg-contain flex items-center justify-center overflow-hidden" 
                            style={{ backgroundImage: `url(https://new.chunithm-net.com/chuni-mobile/html/mobile/images/honor_bg_${honorBgMap[honor.color] || 'normal'}.png)`}}
                        >
                            <div className="player_honor_text_view" style={{ width: '100%', textAlign: 'center' }}>
                                <div className="player_honor_text text-black text-sm px-2 truncate" draggable="true">
                                    <span>{honor.text}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}