import React from 'react';

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

interface ProfileTemplateProps {
  profile: ProfileDetail;
  honorToShow: Honor;
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

export const ProfileTemplate = ({ profile, honorToShow }: ProfileTemplateProps) => {
  const { star, lv } = splitLevel(profile.level);
  const ratingColor = getRatingColor(profile.rating);
  const ratingDigits = profile.rating.toFixed(2).split('');
  const honorBgMap: Record<string, string> = {
      NORMAL: 'normal', SILVER: 'silver', GOLD: 'gold',
      PLATINA: 'platina', RAINBOW: 'rainbow', ONGEKI: 'ongeki',
  };
  const msPGRFont = { fontFamily: '"MS PGothic", sans-serif' };
  
  // 텍스트 스타일 정의
  const blackTextStyle = { color: 'black', textShadow: '1px 1px 1px rgba(255,255,255,0.3)' };
  const whiteTextStyle = { color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' };

  return (
    <html>
      <head>
        <style>{`
          body { margin: 0; }
          div, span, img { position: absolute; box-sizing: border-box; }
        `}</style>
      </head>
      <body>
        <div style={{ width: '1823px', height: '722px', position: 'relative', overflow: 'hidden' }}>
            {profile.nameplateImage && <img src={profile.nameplateImage} style={{ inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
            
            <div style={{ left: 0, top: 0, width: '549px', height: '100%' }}>
              {profile.characterBackground && <img src={profile.characterBackground} style={{ inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}/>}
              {profile.characterImage && <img src={profile.characterImage} style={{ inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}/>}
            </div>

            {profile.teamName && (
                <div style={{ width: '1176px', height: '208px', left: '549px', top: '20px', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundImage: `url(https://new.chunithm-net.com/chuni-mobile/html/mobile/images/team_bg_${profile.teamEmblemColor}.png)`}}>
                    <div style={{ width: '878px', height: '113px', left: '197px', top: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '96px', ...whiteTextStyle, ...msPGRFont }}>{profile.teamName}</div>
                </div>
            )}

            {honorToShow && (
                <div style={{ width: '1170px', height: '128px', left: '549px', top: '182px', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundImage: `url(https://new.chunithm-net.com/chuni-mobile/html/mobile/images/honor_bg_${honorBgMap[honorToShow.color]}.png)`}}>
                    <div style={{ width: '916px', height: '65px', left: '254px', top: '29px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '96px', ...msPGRFont }}>{honorToShow.text}</div>
                </div>
            )}
            
            <div style={{ width: '731px', height: '96px', left: '748px', top: '363px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '96px', ...blackTextStyle, ...msPGRFont }}>{profile.playerName}</div>

            <div style={{ width: '160px', height: '128px', left: '549px', top: '378px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', ...blackTextStyle, ...msPGRFont }}>Lv.</div>
            <div style={{ width: '160px', height: '144px', left: '634px', top: '361px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '96px', ...blackTextStyle, ...msPGRFont }}>{String(lv).padStart(2, '0')}</div>
            {star !== null && (
              <div style={{ left: '532px', top: '307px' }}>
                <img style={{ width: '125px', height: '125px' }} src="https://chunithm-net-eng.com/mobile/images/icon_reborn_star.png" />
                <div style={{ width: '112px', height: '96px', left: '7px', top: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '96px', ...blackTextStyle, ...msPGRFont }}>{star}</div>
              </div>
            )}

            <div style={{ left: '700px', top: '490px', display: 'flex', alignItems: 'flex-end', height: '85px' }}>
                <span style={{ fontSize: '48px', marginRight: '16px', ...blackTextStyle }}>RATING</span>
                {ratingDigits.map((digit, index) => 
                    digit === '.' 
                    ? <img key={index} src={`https://new.chunithm-net.com/chuni-mobile/html/mobile/images/rating/rating_${ratingColor}_comma.png`} style={{ width: '27px', height: '27px', marginBottom: '16px' }}/>
                    : <img key={index} src={`https://new.chunithm-net.com/chuni-mobile/html/mobile/images/rating/rating_${ratingColor}_0${digit}.png`} style={{ height: '79px' }} />
                )}
            </div>

            <div style={{ position: 'absolute', right: '50px', top: '315px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                {profile.battleRankImg && <img style={{ height: '160px' }} src={profile.battleRankImg} />}
                {(profile.classEmblemBase || profile.classEmblemTop) && (
                    <div style={{ position: 'relative', width: '256px', height: '256px' }}>
                        {profile.classEmblemBase && <img src={profile.classEmblemBase} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />}
                        {profile.classEmblemTop && <img src={profile.classEmblemTop} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />}
                    </div>
                )}
            </div>
        </div>
      </body>
    </html>
  );
};