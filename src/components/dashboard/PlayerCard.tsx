// 파일 경로: src/components/dashboard/PlayerCard.tsx
'use client';

import { useState, useEffect } from 'react';

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
  classEmblemTop?: string;
  classEmblemBase?: string;
  characterImage?: string;
  characterBackground?: string;
  nameplateImage?: string;
  battleRankImg?: string;
}

// --- 헬퍼 함수 (이전과 동일) ---
const getRatingColor = (rating: number): string => {
  if (rating >= 17.00) return 'kiwami';
  if (rating >= 16.00) return 'rainbow';
  // ...
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
        NORMAL: 'normal', SILVER: 'silver', GOLD: 'gold',
        PLATINA: 'platina', RAINBOW: 'rainbow', ONGEKI: 'ongeki',
    };
    const currentHonor = profile.honors?.[currentHonorIndex];

    // 폰트 스타일 객체
    const msPGRFont = { fontFamily: '"MS PGothic", sans-serif' };

    return (
        <div className="relative w-[576px] h-[224px] rounded-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* 배경 네임플레이트 */}
            {profile.nameplateImage && <img src={profile.nameplateImage} alt="Nameplate" className="absolute inset-0 w-full h-full object-cover rounded-lg" />}

            {/* 캐릭터 이미지 */}
            <div className="absolute left-0 top-0 w-1/4 h-full">
                {profile.characterBackground && <img src={profile.characterBackground} alt="Character BG" className="absolute inset-0 w-full h-full object-cover"/>}
                {profile.characterImage && <img src={profile.characterImage} alt="Character" className="absolute inset-0 w-full h-full object-contain"/>}
            </div>

            {/* 팀 정보 */}
            {profile.teamName && (
                <div className="absolute left-[141px] top-0 w-96 h-20 bg-no-repeat bg-center" style={{ backgroundImage: `url(https://new.chunithm-net.com/chuni-mobile/html/mobile/images/team_bg_${profile.teamEmblemColor}.png)`}}>
                    <div className="absolute left-[61px] top-[16px] text-white text-2xl" style={msPGRFont}>{profile.teamName}</div>
                </div>
            )}

            {/* 칭호 */}
            {currentHonor && (
                <div className="absolute left-[157px] top-[55px] w-96 h-10 bg-no-repeat bg-center" style={{ backgroundImage: `url(https://new.chunithm-net.com/chuni-mobile/html/mobile/images/honor_bg_${honorBgMap[currentHonor.color]}.png)`}}>
                    <div className="absolute left-[122px] top-[9px] text-black text-xl" style={msPGRFont}>{currentHonor.text}</div>
                </div>
            )}
            
            {/* 닉네임 */}
            <div className="absolute left-[240px] top-[97px] text-white text-3xl" style={msPGRFont}>{profile.playerName}</div>

            {/* 레벨 */}
            <div className="absolute left-[162px] top-[118px] text-white text-lg" style={msPGRFont}>Lv.</div>
            <div className="absolute left-[189px] top-[96px] text-white text-4xl" style={msPGRFont}>{String(lv).padStart(2, '0')}</div>
            {star !== null && (
                <div className="relative left-[157px] top-[95px]">
                    <img className="absolute w-8 h-8" src="https://chunithm-net-eng.com/mobile/images/icon_reborn_star.png" />
                    <div className="absolute left-[12px] top-[11px] text-white text-lg" style={msPGRFont}>{star}</div>
                </div>
            )}

            {/* 레이팅 */}
            <div className="absolute left-[170px] top-[148px] flex items-end h-[34px]">
                <span className="text-xl mr-2 text-white">RATING</span>
                {ratingDigits.map((digit, index) => 
                    digit === '.' 
                    ? <img key={index} src={`https://new.chunithm-net.com/chuni-mobile/html/mobile/images/rating/rating_${ratingColor}_comma.png`} alt="," className="h-[8px] mb-[6px]"/>
                    : <img key={index} src={`https://new.chunithm-net.com/chuni-mobile/html/mobile/images/rating/rating_${ratingColor}_0${digit}.png`} alt={digit} className="h-[21px]" />
                )}
            </div>

            {/* 엠블럼 & 배틀랭크 */}
            <div className="absolute right-[24px] top-[97px] flex items-center space-x-2">
                {profile.battleRankImg && <img className="h-10" src={profile.battleRankImg} />}
                {(profile.classEmblemBase || profile.classEmblemTop) && (
                    <div className="relative w-20 h-20">
                        {profile.classEmblemBase && <img src={profile.classEmblemBase} className="absolute inset-0 w-full h-full" />}
                        {profile.classEmblemTop && <img src={profile.classEmblemTop} className="absolute inset-0 w-full h-full" />}
                    </div>
                )}
            </div>
        </div>
    );
}