// 파일 경로: src/components/dashboard/PlayerCard.tsx
'use client';

import { useState, useEffect } from 'react';

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
  classEmblemTop?: string;
  classEmblemBase?: string;
  characterImage?: string;
  characterBackground?: string;
  nameplateImage?: string;
  battleRankImg?: string;
}

// --- 헬퍼 함수들 ---
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

const splitLevel = (level: number): { star: number | null, lv: number } => {
    if (level < 100) return { star: null, lv: level };
    const star = Math.floor(level / 100);
    const lv = level % 100;
    return { star, lv: lv > 0 ? lv : 99 };
};

export function PlayerCard({ profile }: { profile: ProfileDetail }) {
    const [currentHonorIndex, setCurrentHonorIndex] = useState(0);

    useEffect(() => {
        if (!profile.honors || profile.honors.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentHonorIndex(prevIndex => (prevIndex + 1) % profile.honors.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [profile.honors]);

    const { star, lv } = splitLevel(profile.level);
    const ratingColor = getRatingColor(profile.rating);
    const ratingDigits = profile.rating.toFixed(2).split('');
    const honorBgMap: Record<string, string> = {
        NORMAL: 'normal',
        SILVER: 'silver',
        GOLD: 'gold',
        PLATINA: 'platina',
        RAINBOW: 'rainbow',
        ONGEKI: 'ongeki',
    };
    const currentHonor = profile.honors?.[currentHonorIndex];

    return (
        <div 
            className="relative w-[512px] h-[203px] mx-auto bg-cover bg-center rounded-lg overflow-hidden text-white font-bold"
            style={{ backgroundImage: `url(${profile.nameplateImage})` }}
        >
            <div className="flex h-full w-full">
                {/* 1. 좌측 캐릭터 영역 */}
                <div className="relative w-1/4 h-full flex-shrink-0">
                    {profile.characterBackground && <img src={profile.characterBackground} alt="Character BG" className="absolute inset-0 w-full h-full object-cover"/>}
                    {profile.characterImage && <img src={profile.characterImage} alt="Character" className="absolute inset-0 w-full h-full object-contain"/>}
                </div>

                {/* 2. 우측 정보 영역 */}
                <div className="w-3/4 h-full p-4 flex flex-col justify-between">
                    {/* 2a. 상단 (팀, 칭호) */}
                    <div className="flex flex-col items-end">
                        {profile.teamName && profile.teamEmblemColor && (
                            <div className="w-[200px] h-[28px] bg-no-repeat bg-center bg-contain flex items-center justify-center" style={{ backgroundImage: `url(https://new.chunithm-net.com/chuni-mobile/html/mobile/images/team_bg_${profile.teamEmblemColor}.png)`}}>
                                <span className="text-base" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{profile.teamName}</span>
                            </div>
                        )}
                        {currentHonor && (
                             <div className="w-[240px] h-[28px] bg-no-repeat bg-center bg-contain flex items-center justify-center mt-1" style={{ backgroundImage: `url(https://new.chunithm-net.com/chuni-mobile/html/mobile/images/honor_bg_${honorBgMap[currentHonor.color] || 'normal'}.png)`}}>
                                <span className="text-black text-sm px-2 truncate" style={{ textShadow: 'none' }}>{currentHonor.text}</span>
                            </div>
                        )}
                    </div>

                    {/* 2b. 하단 (메인 정보) */}
                    <div className="flex items-end justify-between">
                        {/* 레벨, 이름, 레이팅 */}
                        <div className="flex-grow pt-6">
                            <div className="flex items-end space-x-3">
                                <div className="relative">
                                    {star !== null && (
                                        <div className="absolute -top-1 -left-1 w-8 h-8 bg-contain bg-no-repeat flex items-center justify-center" style={{ backgroundImage: `url(https://chunithm-net-eng.com/mobile/images/icon_reborn_star.png)`}}>
                                            <span className="text-xs text-white">{star}</span>
                                        </div>
                                    )}
                                    <span className="text-sm">Lv.</span><span className="text-2xl ml-1">{String(lv).padStart(2, '0')}</span>
                                </div>
                                <span className="text-3xl pb-1">{profile.playerName}</span>
                            </div>
                            <div className="flex items-end mt-1">
                                <span className="text-xl mr-2">RATING</span>
                                {ratingDigits.map((digit, index) => 
                                    digit === '.' 
                                    ? <img key={index} src={`https://new.chunithm-net.com/chuni-mobile/html/mobile/images/rating/rating_${ratingColor}_comma.png`} alt="," className="h-[14px] mb-[4px]"/>
                                    : <img key={index} src={`https://new.chunithm-net.com/chuni-mobile/html/mobile/images/rating/rating_${ratingColor}_0${digit}.png`} alt={digit} className="h-[24px]" />
                                )}
                            </div>
                        </div>

                        {/* 엠블럼, 배틀랭크 */}
                        <div className="flex items-end space-x-3 flex-shrink-0">
                            {(profile.classEmblemBase || profile.classEmblemTop) && (
                                <div className="relative w-14 h-14">
                                    {profile.classEmblemBase && <img src={profile.classEmblemBase} alt="Emblem Base" className="absolute inset-0 w-full h-full" />}
                                    {profile.classEmblemTop && <img src={profile.classEmblemTop} alt="Emblem Top" className="absolute inset-0 w-full h-full" />}
                                </div>
                            )}
                            {profile.battleRankImg && <img src={profile.battleRankImg} alt="Battle Rank" className="h-14"/>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}