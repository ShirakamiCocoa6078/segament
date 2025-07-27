// 파일 경로: src/components/dashboard/PlayerCard.tsx
'use client';

import { useState, useEffect } from 'react';

// --- 타입 정의 ---
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

    // 칭호 순환을 위한 프론트엔드 로직
    useEffect(() => {
        if (!profile.honors || profile.honors.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentHonorIndex(prevIndex => (prevIndex + 1) % profile.honors.length);
        }, 3000); // 3초마다 칭호 변경
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
    const msPGRFont = { fontFamily: '"MS PGothic", sans-serif' };

    return (
        // Figma 기반 최종 디자인 레이아웃 (1823x722px 기준)
        <div className="relative w-[1823px] h-[722px] overflow-hidden">
            {profile.nameplateImage && <img src={profile.nameplateImage} alt="Nameplate" className="absolute inset-0 w-full h-full object-cover" />}
            
            <div className="absolute left-0 top-0 w-[549px] h-full">
              {profile.characterBackground && <img src={profile.characterBackground} alt="Character BG" className="absolute inset-0 w-full h-full object-cover"/>}
              {profile.characterImage && <img src={profile.characterImage} alt="Character" className="absolute inset-0 w-full h-full object-contain"/>}
            </div>

            {profile.teamName && (
                <div className="absolute w-[1176px] h-[208px] left-[549px] top-[20px] bg-no-repeat bg-center" style={{ backgroundImage: `url(https://new.chunithm-net.com/chuni-mobile/html/mobile/images/team_bg_${profile.teamEmblemColor}.png)`}}>
                    <div className="absolute w-[878px] h-[113px] left-[197px] top-[38px] flex items-center justify-center text-white text-8xl" style={msPGRFont}>{profile.teamName}</div>
                </div>
            )}

            {currentHonor && (
                <div className="absolute w-[1170px] h-[128px] left-[549px] top-[182px] bg-no-repeat bg-center" style={{ backgroundImage: `url(https://new.chunithm-net.com/chuni-mobile/html/mobile/images/honor_bg_${honorBgMap[currentHonor.color]}.png)`}}>
                    <div className="absolute w-[916px] h-[65px] left-[254px] top-[29px] flex items-center justify-center text-black text-8xl" style={msPGRFont}>{currentHonor.text}</div>
                </div>
            )}
            
            <div className="absolute w-[731px] h-[96px] left-[748px] top-[363px] flex items-center justify-center text-white text-8xl" style={msPGRFont}>{profile.playerName}</div>

            <div className="absolute w-[160px] h-[128px] left-[549px] top-[378px] flex items-center justify-center text-white text-6xl" style={msPGRFont}>Lv.</div>
            <div className="absolute w-[160px] h-[144px] left-[634px] top-[361px] flex items-center justify-center text-white text-8xl" style={msPGRFont}>{String(lv).padStart(2, '0')}</div>
            {star !== null && (
              <>
                <img className="absolute w-[125px] h-[125px] left-[532px] top-[307px]" src="https://chunithm-net-eng.com/mobile/images/icon_reborn_star.png" />
                <div className="absolute w-[112px] h-[96px] left-[567px] top-[324px] flex items-center justify-center text-white text-8xl" style={msPGRFont}>{star}</div>
              </>
            )}

            <div className="absolute left-[700px] top-[490px] flex items-end h-[85px]">
                <span className="text-4xl mr-4 text-white">RATING</span>
                {ratingDigits.map((digit, index) => 
                    digit === '.' 
                    ? <img key={index} src={`https://new.chunithm-net.com/chuni-mobile/html/mobile/images/rating/rating_${ratingColor}_comma.png`} alt="," className="w-7 h-7 mb-4"/>
                    : <img key={index} src={`https://new.chunithm-net.com/chuni-mobile/html/mobile/images/rating/rating_${ratingColor}_0${digit}.png`} alt={digit} className="h-20" />
                )}
            </div>

            <div className="absolute right-[50px] top-[315px] flex items-center space-x-4">
                {profile.battleRankImg && <img className="h-40" src={profile.battleRankImg} />}
                {(profile.classEmblemBase || profile.classEmblemTop) && (
                    <div className="relative w-64 h-64">
                        {profile.classEmblemBase && <img src={profile.classEmblemBase} className="absolute inset-0 w-full h-full" />}
                        {profile.classEmblemTop && <img src={profile.classEmblemTop} className="absolute inset-0 w-full h-full" />}
                    </div>
                )}
            </div>
        </div>
    );
}