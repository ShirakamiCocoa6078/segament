'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- 타입 정의 ---
// TODO: 향후 이 타입 정의들은 @/types/index.ts 와 같은 공용 파일로 분리하여 관리합니다.
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
}

// --- 헬퍼 함수 ---
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
    const ratingColor = getRatingColor(profile.rating);
    const ratingDigits = profile.rating.toFixed(2).split('');

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
                            {profile.teamName && (
                                <div 
                                    className="px-4 py-1 rounded-md text-sm font-semibold text-white bg-no-repeat bg-center bg-contain flex items-center justify-center"
                                    style={{ backgroundImage: `url(https://new.chunithm-net.com/chuni-mobile/html/mobile/images/team_bg_${profile.teamEmblemColor || 'normal'}.png)`, minWidth: '120px', height: '28px' }}
                                >
                                    {profile.teamName}
                                </div>
                            )}
                        </div>
                        <div className="flex items-baseline space-x-4 text-muted-foreground mt-1">
                            <span>Lv. {profile.level}</span>
                            <div className="flex items-center space-x-0.5">
                                <span>Rating: </span>
                                {ratingDigits.map((digit, index) => 
                                    digit === '.' 
                                    ? <img key={index} src={`https://new.chunithm-net.com/chuni-mobile/html/mobile/images/rating/rating_${ratingColor}_comma.png`} alt="," className="h-3 self-end mb-0.5"/>
                                    : <img key={index} src={`https://new.chunithm-net.com/chuni-mobile/html/mobile/images/rating/rating_${ratingColor}_0${digit}.png`} alt={digit} className="h-5" />
                                )}
                            </div>
                            <span>Play Count: {profile.playCount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2 items-center">
                    {profile.honors?.slice(0, 3).map((honor, index) => (
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