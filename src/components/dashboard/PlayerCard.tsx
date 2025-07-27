// 파일 경로: src/components/dashboard/PlayerCard.tsx
'use client';

import { cn } from '@/lib/utils';

// TODO: 이 타입 정의는 @/types/index.ts 와 같은 공용 파일로 분리하여 관리합니다.
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
    return { star, lv: lv > 0 ? lv : 1 }; // 100, 200레벨 등에서 lv가 0이 되는 것을 방지
};

export function PlayerCard({ profile }: { profile: ProfileDetail }) {
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

    return (
        <div className="relative w-[320px] h-[480px] mx-auto overflow-hidden text-white font-bold">
            {/* 1. 네임플레이트 (가장 아래, z-index: 10) */}
            {profile.nameplateImage && <img src={profile.nameplateImage} alt="Nameplate" className="absolute inset-0 w-full h-full z-10" />}

            {/* 2. 캐릭터 배경 (z-index: 20) */}
            {profile.characterBackground && <img src={profile.characterBackground} alt="Character BG" className="absolute top-[132px] left-[10px] w-[300px] h-[300px] z-20" />}
            
            {/* 3. 캐릭터 이미지 (z-index: 30) */}
            {profile.characterImage && <img src={profile.characterImage} alt="Character" className="absolute top-[132px] left-[10px] w-[300px] h-[300px] z-30" />}

            {/* 4. 팀 정보 (z-index: 40) */}
            {profile.teamName && profile.teamEmblemColor && (
                <div className="absolute top-[12px] left-[10px] w-[300px] h-[34px] bg-no-repeat bg-center bg-contain z-40 flex items-center justify-center" style={{ backgroundImage: `url(https://new.chunithm-net.com/chuni-mobile/html/mobile/images/team_bg_${profile.teamEmblemColor}.png)`}}>
                    <span className="text-lg tracking-wider" style={{ textShadow: '1px 1px 2px black' }}>{profile.teamName}</span>
                </div>
            )}
            
            {/* 5. 칭호 (z-index: 40) */}
            <div className="absolute top-[55px] left-[10px] flex flex-col space-y-[2px] z-40">
                {profile.honors?.slice(0, 3).map((honor, index) => (
                    <div key={index} className="w-[300px] h-[32px] bg-no-repeat bg-center bg-contain flex items-center justify-center overflow-hidden" style={{ backgroundImage: `url(https://new.chunithm-net.com/chuni-mobile/html/mobile/images/honor_bg_${honorBgMap[honor.color] || 'normal'}.png)`}}>
                        {/* TODO: 텍스트 오버플로우 시 스크롤 애니메이션 구현 */}
                        <span className="text-black text-base px-4" style={{ textShadow: 'none' }}>{honor.text}</span>
                    </div>
                ))}
            </div>
            
            {/* 6. 레벨 (z-index: 40) */}
            <div className="absolute bottom-[48px] left-[18px] z-40">
                <span className="text-sm" style={{ textShadow: '1px 1px 2px black' }}>Lv.</span>
                <span className="text-3xl ml-1">{String(lv).padStart(2, '0')}</span>
                {star !== null && (
                    <div className="absolute top-[-30px] left-[-5px] w-12 h-12 bg-contain bg-no-repeat flex items-center justify-center" style={{ backgroundImage: `url(https://new.chunithm-net.com/chuni-mobile/html/mobile/images/icon_reborn.png)`}}>
                         <span className="text-sm mt-1">{star}</span>
                    </div>
                )}
            </div>
            
            {/* 7. 레이팅 (z-index: 40) */}
            <div className="absolute bottom-[8px] right-[10px] flex items-end h-[30px] z-40">
                <span className="text-lg mr-1" style={{ textShadow: '1px 1px 2px black' }}>RATING</span>
                {ratingDigits.map((digit, index) => 
                    digit === '.' 
                    ? <img key={index} src={`https://new.chunithm-net.com/chuni-mobile/html/mobile/images/rating/rating_${ratingColor}_comma.png`} alt="comma" className="h-[12px] mb-[4px]"/>
                    : <img key={index} src={`https://new.chunithm-net.com/chuni-mobile/html/mobile/images/rating/rating_${ratingColor}_0${digit}.png`} alt={digit} className="h-[26px]" />
                )}
            </div>
            
            {/* 8. 엠블럼 (z-index: 25) */}
            {profile.classEmblemBase && <img src={profile.classEmblemBase} alt="Emblem Base" className="absolute top-[160px] right-[15px] z-20" />}
            {profile.classEmblemTop && <img src={profile.classEmblemTop} alt="Emblem Top" className="absolute top-[160px] right-[15px] z-25" />}

            {/* 9. 닉네임 (z-index: 40) */}
            <p className="absolute bottom-[8px] left-[18px] text-2xl z-40" style={{ textShadow: '1px 1px 3px black' }}>{profile.playerName}</p>
        </div>
    );
}