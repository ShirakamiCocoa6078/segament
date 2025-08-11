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
  clearType?: string; // 문자열로 변경
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
    "FAILED": "none",
    "CLEAR": "https://new.chunithm-net.com/chuni-mobile/html/mobile/images/icon_clear.png",
    "HARD": "https://new.chunithm-net.com/chuni-mobile/html/mobile/images/icon_hard.png",
    "BRAVE": "https://new.chunithm-net.com/chuni-mobile/html/mobile/images/icon_brave.png",
    "ABSOLUTE": "https://new.chunithm-net.com/chuni-mobile/html/mobile/images/icon_absolute.png",
    "CATASTROPHY": "https://new.chunithm-net.com/chuni-mobile/html/mobile/images/icon_catastrophy.png"
  },
  comboType: {
    0: "none",
    1: "https://new.chunithm-net.com/chuni-mobile/html/mobile/images/icon_fullcombo.png",
    2: "https://new.chunithm-net.com/chuni-mobile/html/mobile/images/icon_alljustice.png",
    3: "https://new.chunithm-net.com/chuni-mobile/html/mobile/images/icon_alljusticecritical.png"
  },
  fullChainType: {
    0: "none",
    1: "https://new.chunithm-net.com/chuni-mobile/html/mobile/images/icon_fullchain.png",
    2: "https://new.chunithm-net.com/chuni-mobile/html/mobile/images/icon_fullchain2.png"
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

  useEffect(() => {
    // /jacket/{idx}.jpg 경로로 직접 설정
    const jacketPath = `/jacket/${song.id}.jpg`;
    setJacketUrl(jacketPath);
  }, [song.id]);

  // 콤보 타입 결정
  const getComboType = () => {
    if (song.isAllJusticeCritical) return 3;
    if (song.isAllJustice) return 2;
    if (song.isFullCombo) return 1;
    return 0;
  };

  const comboType = getComboType();
  const clearType = song.clearType || "FAILED";
  const fullChainType = song.fullChainType || 0;

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

      {/* 스코어 */}
      <div className="px-3 py-2 text-right flex-shrink-0">
        <p className="text-lg font-bold text-blue-600">
          {formatScore(song.score)}
        </p>
      </div>

      {/* 클리어/콤보/풀체인 아이콘들 */}
      <div className="px-2 py-2 flex flex-col justify-end h-full flex-shrink-0">
        <div className="flex space-x-1 items-center">
          {/* clearType */}
          {clearType !== "FAILED" && ICON_MAPPING.clearType[clearType as keyof typeof ICON_MAPPING.clearType] !== "none" && (
            <Image
              src={ICON_MAPPING.clearType[clearType as keyof typeof ICON_MAPPING.clearType]}
              alt={`Clear Type ${clearType}`}
              width={16}
              height={18}
              className="w-4 h-[18px]"
            />
          )}
          
          {/* comboType */}
          {comboType > 0 && ICON_MAPPING.comboType[comboType as keyof typeof ICON_MAPPING.comboType] !== "none" && (
            <Image
              src={ICON_MAPPING.comboType[comboType as keyof typeof ICON_MAPPING.comboType]}
              alt={`Combo Type ${comboType}`}
              width={16}
              height={18}
              className="w-4 h-[18px]"
            />
          )}
          
          {/* fullChainType */}
          {fullChainType > 0 && ICON_MAPPING.fullChainType[fullChainType as keyof typeof ICON_MAPPING.fullChainType] !== "none" && (
            <Image
              src={ICON_MAPPING.fullChainType[fullChainType as keyof typeof ICON_MAPPING.fullChainType]}
              alt={`Full Chain Type ${fullChainType}`}
              width={16}
              height={18}
              className="w-4 h-[18px]"
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
