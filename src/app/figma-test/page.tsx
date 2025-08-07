// 파일 경로: src/app/figma-test/page.tsx
'use client';

import { useEffect, useState } from 'react';

// PlayerCard의 헬퍼 함수들을 재사용합니다.
const getRatingColor = (rating: number): string => {
  if (rating >= 17.00) return 'kiwami';
  if (rating >= 16.00) return 'rainbow';
  // ... (기타 색상)
  return 'green';
};

const splitLevel = (level: number): { star: number | null, lv: number } => {
    if (level < 100) return { star: null, lv: level };
    const star = Math.floor(level / 100);
    const lv = level % 100;
    return { star, lv: lv > 0 ? lv : 99 };
};

export default function FigmaTestPage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/figma-test-profile')
      .then(res => res.json())
      .then(data => {
        if (data.profile) {
          setProfile(data.profile);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="bg-black text-white min-h-screen p-4">Loading Profile...</div>;
  if (!profile) return <div className="bg-black text-white min-h-screen p-4">Could not load JP CHUNITHM profile. Please import data first.</div>;
  
  const ratingColor = getRatingColor(profile.rating);
  const { star, lv } = splitLevel(profile.level);

  return (
    <div className="bg-black text-white min-h-screen p-8 space-y-8">
      <h1 className="text-2xl font-bold border-b pb-2">Figma Export Test Page</h1>

      {/* 각 요소를 섹션으로 분리 */}
      <section>
        <h2 className="text-lg font-semibold">1. Nameplate</h2>
        {profile.nameplateImage && <img src={profile.nameplateImage} alt="Nameplate" className="w-[512px] h-[100px] object-cover" />}
      </section>

      <section className="flex space-x-8">
        <div>
          <h2 className="text-lg font-semibold">2. Character</h2>
          <div className="relative w-48 h-48">
              {profile.characterBackground && <img src={profile.characterBackground} alt="Character BG" className="absolute inset-0 w-full h-full"/>}
              {profile.characterImage && <img src={profile.characterImage} alt="Character" className="absolute inset-0 w-full h-full"/>}
          </div>
        </div>
        <div>
            <h2 className="text-lg font-semibold">3. Emblems & Rank</h2>
            <div className="flex items-center space-x-4">
                {profile.classEmblemBase && <div className="relative w-24 h-24">
                    <img src={profile.classEmblemBase} alt="Emblem Base" className="absolute inset-0 w-full h-full" />
                    {profile.classEmblemTop && <img src={profile.classEmblemTop} alt="Emblem Top" className="absolute inset-0 w-full h-full" />}
                </div>}
                {profile.battleRankImg && <img src={profile.battleRankImg} alt="Battle Rank" className="h-24"/>}
            </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">4. Team & Honors</h2>
        <div className="flex flex-col items-start space-y-2">
            {profile.teamName && <div className="w-[300px] h-[34px] bg-no-repeat bg-center" style={{ backgroundImage: `url(https://new.chunithm-net.com/chuni-mobile/html/mobile/images/team_bg_${profile.teamEmblemColor}.png)`}} />}
            {profile.honors?.map((h: { color: string }, i: number) => <div key={i} className="w-[300px] h-[32px] bg-no-repeat bg-center" style={{ backgroundImage: `url(https://new.chunithm-net.com/chuni-mobile/html/mobile/images/honor_bg_${h.color.toLowerCase()}.png)`}} />)}
        </div>
      </section>
      
      <section>
        <h2 className="text-lg font-semibold">5. Text Elements</h2>
        <div className="space-y-4">
            <p className="text-5xl font-bold">{profile.playerName}</p>
            <p className="text-3xl">Team: {profile.teamName}</p>
            {profile.honors?.map((h, i) => <p key={i} className="text-xl">Honor {i+1}: {h.text}</p>)}
        </div>
      </section>

       <section>
        <h2 className="text-lg font-semibold">6. Rating Digits ({ratingColor})</h2>
        <div className="flex items-center space-x-1">
            {Array.from({length: 10}, (_, i) => i).map(digit => <img key={digit} src={`https://new.chunithm-net.com/chuni-mobile/html/mobile/images/rating/rating_${ratingColor}_0${digit}.png`} alt={`${digit}`} className="h-10" />)}
            <img src={`https://new.chunithm-net.com/chuni-mobile/html/mobile/images/rating/rating_${ratingColor}_comma.png`} alt="," className="h-5"/>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">7. Level Star Icon</h2>
        <div className="w-16 h-16 bg-contain bg-no-repeat" style={{ backgroundImage: `url(https://chunithm-net-eng.com/mobile/images/icon_reborn_star.png)`}} />
      </section>
    </div>
  );
}