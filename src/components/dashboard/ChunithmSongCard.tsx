// 파일 경로: src/components/dashboard/ChunithmSongCard.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SongData {
  id: string;
  title: string;
  difficulty: string;
  score: number;
  level?: string;
  const?: number;
  clearType?: number; // 숫자로 변경
  comboType?: number;
  fullChainType?: number;
  isFullCombo?: boolean;
  isAllJustice?: boolean;
  isAllJusticeCritical?: boolean;
}

interface ChunithmSongCardProps {
  song: SongData;
}

// 아이콘 매핑
const ICON_MAPPING = {
  clearType: {
    0: "none",
    1: "/playLogs/image/icon_clear.png",
    2: "/playLogs/image/icon_hard.png",
    3: "/playLogs/image/icon_brave.png",
    4: "/playLogs/image/icon_absolute.png",
    5: "/playLogs/image/icon_catastrophy.png"
  },
  comboType: {
    0: "none",
    1: "/playLogs/image/icon_fullcombo.png",
    2: "/playLogs/image/icon_alljustice.png",
    3: "/playLogs/image/icon_alljusticecritical.png"
  },
  fullChainType: {
    0: "none",
    1: "/playLogs/image/icon_fullchain.png",
    2: "/playLogs/image/icon_fullchain2.png"
  }
};;

// 난이도별 색상
const DIFFICULTY_COLORS = {
  BASIC: '#1EB393',
  ADVANCED: '#FF7E00', 
  EXPERT: '#E35454',
  MASTER: '#BF6AFF',
  ULTIMA: 'linear-gradient(45deg, #232323 25%, #FF3A3A 25%, #FF3A3A 50%, #232323 50%, #232323 75%, #FF3A3A 75%)'
};

export function ChunithmSongCard({ song }: ChunithmSongCardProps) {
  const [jacketUrl, setJacketUrl] = useState<string>('');

  // 디버깅: 받은 곡 데이터 확인
  console.log(`[ChunithmSongCard] 곡 데이터:`, {
    id: song.id,
    title: song.title,
    difficulty: song.difficulty,
    score: song.score,
    clearType: song.clearType,
    comboType: song.comboType,
    fullChainType: song.fullChainType,
    isFullCombo: song.isFullCombo,
    isAllJustice: song.isAllJustice,
    isAllJusticeCritical: song.isAllJusticeCritical
  });

  useEffect(() => {
    // /jacket/{idx}.jpg 경로로 직접 설정
    const jacketPath = `/jacket/${song.id}.jpg`;
    setJacketUrl(jacketPath);
  }, [song.id]);

  // 데이터베이스 값을 그대로 사용 (계산 로직 제거)
  const clearType = Number(song.clearType) || 0;
  const comboType = Number(song.comboType) || 0;
  const fullChainType = Number(song.fullChainType) || 0;

  // 디버깅: 아이콘 매핑 결과 확인
  console.log(`[ChunithmSongCard] ${song.title} 아이콘 정보:`, {
    원본_clearType: song.clearType,
    사용될_clearType: clearType,
    원본_comboType: song.comboType,
    사용될_comboType: comboType,
    원본_fullChainType: song.fullChainType,
    사용될_fullChainType: fullChainType,
    clearType_아이콘_URL: ICON_MAPPING.clearType[clearType as keyof typeof ICON_MAPPING.clearType],
    comboType_아이콘_URL: ICON_MAPPING.comboType[comboType as keyof typeof ICON_MAPPING.comboType],
    fullChainType_아이콘_URL: ICON_MAPPING.fullChainType[fullChainType as keyof typeof ICON_MAPPING.fullChainType]
  });

  const getDifficultyColor = () => {
    const difficulty = song.difficulty?.toUpperCase();
    return DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS] || '#232323';
  };

  const formatScore = (score: number) => {
    return score.toLocaleString();
  };

  return (
    <div className="relative flex items-center w-full max-w-[490px] h-[100px] bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
      {/* 자켓 이미지 */}
      <div className="w-[100px] h-[100px] flex-shrink-0">
        {jacketUrl ? (
          <Image
            src={jacketUrl}
            alt={song.title}
            width={100}
            height={100}
            className="w-full h-full object-cover"
            onError={() => setJacketUrl('')}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}
      </div>

      {/* 곡 정보 */}
      <div className="flex-1 px-3 py-2 flex flex-col justify-between h-full min-w-0">
        <div className="flex flex-col space-y-1">
          <h3 className="text-sm font-semibold text-gray-900 truncate" title={song.title}>
            {song.title}
          </h3>
          <p className="text-xs text-gray-600">
            레벨: {song.level || 'N/A'}
          </p>
          <p className="text-xs text-gray-500">
            상수: {song.const ? song.const.toFixed(1) : 'N/A'}
          </p>
        </div>
      </div>

      {/* 스코어와 아이콘을 겹쳐서 배치하는 컨테이너 */}
      <div className="relative px-3 py-2 flex-shrink-0 min-w-0">
        {/* 스코어 */}
        <div className="text-right mb-2">
          <p className="text-lg font-bold text-blue-600">
            {formatScore(song.score)}
          </p>
        </div>

        {/* 클리어/콤보/풀체인 아이콘들 */}
        <div className="flex space-x-1 items-center justify-end">
          {/* clearType */}
          {clearType > 0 && ICON_MAPPING.clearType[clearType as keyof typeof ICON_MAPPING.clearType] !== "none" && (
            <Image
              src={ICON_MAPPING.clearType[clearType as keyof typeof ICON_MAPPING.clearType]}
              alt={`Clear Type ${clearType}`}
              width={64}
              height={18}
              className="max-w-[64px] w-8 sm:w-12 md:w-16 h-[18px] object-contain"
            />
          )}
          
          {/* comboType */}
          {comboType > 0 && ICON_MAPPING.comboType[comboType as keyof typeof ICON_MAPPING.comboType] !== "none" && (
            <Image
              src={ICON_MAPPING.comboType[comboType as keyof typeof ICON_MAPPING.comboType]}
              alt={`Combo Type ${comboType}`}
              width={64}
              height={18}
              className="max-w-[64px] w-8 sm:w-12 md:w-16 h-[18px] object-contain"
            />
          )}
          
          {/* fullChainType */}
          {fullChainType > 0 && ICON_MAPPING.fullChainType[fullChainType as keyof typeof ICON_MAPPING.fullChainType] !== "none" && (
            <Image
              src={ICON_MAPPING.fullChainType[fullChainType as keyof typeof ICON_MAPPING.fullChainType]}
              alt={`Full Chain Type ${fullChainType}`}
              width={64}
              height={18}
              className="max-w-[64px] w-8 sm:w-12 md:w-16 h-[18px] object-contain"
            />
          )}
        </div>
      </div>

      {/* 난이도 색상 표시 */}
      <div 
        className="w-[9px] h-[100px] rounded-r-lg flex-shrink-0"
        style={{
          background: getDifficultyColor(),
          backgroundSize: song.difficulty?.toUpperCase() === 'ULTIMA' ? '8px 8px' : 'auto'
        }}
      />
    </div>
  );
}
