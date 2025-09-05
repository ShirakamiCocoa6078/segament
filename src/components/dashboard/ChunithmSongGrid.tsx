// 파일 경로: src/components/dashboard/ChunithmSongGrid.tsx
'use client';

import { ChunithmSongCard } from './ChunithmSongCard';
import { calculateRating } from '@/lib/ratingUtils';
import chunithmSongData from '@/lib/chunithmSongData.json';
import { useState } from 'react';

interface SongData {
  id: string;
  title: string;
  difficulty: string;
  score: number;
  level?: string;
  const?: number;
  displayConst?: string | number;
  clearType?: number; // 숫자로 변경
  comboType?: number;
  fullChainType?: number;
  isFullCombo?: boolean;
  isAllJustice?: boolean;
  isAllJusticeCritical?: boolean;
}

interface ChunithmSongGridProps {
  songs: SongData[];
  type: 'best' | 'new';
}

export function ChunithmSongGrid({ songs, type }: ChunithmSongGridProps) {
  // 임시 곡 입력 상태
  const [tempSongs, setTempSongs] = useState<SongData[]>([]);
  const [tempTitle, setTempTitle] = useState('');
  const [tempLevel, setTempLevel] = useState('');
  const [tempConst, setTempConst] = useState('');
  const [tempDifficulty, setTempDifficulty] = useState('BAS');
  const [tempScore, setTempScore] = useState('');

  // 레벨별 상수 선택지 예시 (실제 데이터에 맞게 수정 가능)
  const levelConstMap: Record<string, string[]> = {
    '1': ['1.0'],
    '2': ['2.0'],
    '3': ['3.0'],
    '4': ['4.0'],
    '5': ['5.0'],
    '6': ['6.0'],
    '7': ['7.0'],
    '7+': ['7.5'],
    '8': ['8.0'],
    '8+': ['8.5'],
    '9': ['9.0'],
    '9+': ['9.5'],
    '10': ['10.0', '10.1', '10.2', '10.3', '10.4'],
    '10+': ['10.5','10.6', '10.7', '10.8', '10.9'],
    '11': ['11.0', '11.1', '11.2', '11.3', '11.4'],
    '11+': ['11.5', '11.6', '11.7', '11.8', '11.9'],
    '12': ['12.0', '12.1', '12.2', '12.3', '12.4'],
    '12+': ['12.5', '12.6', '12.7', '12.8', '12.9'],
    '13': ['13.0', '13.1', '13.2', '13.3', '13.4'],
    '13+': ['13.5', '13.6', '13.7', '13.8', '13.9'],
    '14': ['14.0', '14.1', '14.2', '14.3', '14.4'],
    '14+': ['14.5', '14.6', '14.7', '14.8', '14.9'],
    '15': ['15.0', '15.1', '15.2', '15.3', '15.4'],
    '15+': ['15.5', '15.6', '15.7'],
  };
  // 곡 상세 데이터 매칭 함수
  function getSongDetail(id: string, difficulty: string) {
    const entry = (chunithmSongData as any[]).find(e => e.meta.id === id);
    if (!entry) {
      return { level: undefined, const: undefined };
    }
    const diffKey = difficulty.toLowerCase();
    const diffData = entry.data[diffKey];
    if (!diffData) {
      return { level: undefined, const: undefined };
    }
    // const 값이 "nn.n?" 형태면 그대로 반환
    return { level: diffData.level, const: diffData.const };
  }
  const getGridConfig = () => {
    if (type === 'best') {
      return {
        columns: 3,
        maxSongs: 30,
        className: 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3',
        gap: 'gap-4'
      };
    } else {
      return {
        columns: 3,
        maxSongs: 20,
        className: 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3',
        gap: 'gap-3'
      };
    }
  };

  const config = getGridConfig();
  const displaySongs = songs.slice(0, config.maxSongs);

  // 곡 데이터에 level/const를 주입
  const enrichedSongs = displaySongs.map(song => {
    const detail = getSongDetail(song.id, song.difficulty);
    let constValue = detail.const ?? song.const;
    let displayConst = constValue;
    let calcConst: number | undefined = undefined;
    if (typeof constValue === 'string' && constValue.endsWith('?')) {
      calcConst = parseFloat(constValue);
    } else if (typeof constValue === 'string') {
      calcConst = parseFloat(constValue);
    } else if (typeof constValue === 'number') {
      calcConst = constValue;
    }
    return {
      ...song,
      level: detail.level ?? song.level,
      const: calcConst,
      displayConst,
    };
  });
  // 임시 곡도 enrichedSongs에 추가 후 레이팅 기준 내림차순 정렬
  const allSongs = type === 'new'
    ? [...enrichedSongs, ...tempSongs].sort((a, b) => {
        // 레이팅 계산: 1009000점 초과면 보면상수+2.15, 아니면 calculateRating
        const getRating = (song: SongData) => {
          if (song.const && song.score) {
            if (song.score > 1009000) return song.const + 2.15;
            return calculateRating(song.const, song.score);
          }
          return 0;
        };
        return getRating(b) - getRating(a);
      })
    : enrichedSongs;

  // 레이팅 통계 계산 (임시 곡 포함 전체 곡 기준)
  const ratings = allSongs
    .filter(song => song.const && song.score)
    .map(song => {
      if (song.score > 1009000) {
        return Math.floor((song.const! + 2.15) * 100) / 100;
      }
      const rating = calculateRating(song.const!, song.score);
      return rating;
    });

  const averageRating = ratings.length > 0
    ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10000) / 10000
    : 0;

  const ratingStats = ratings.length > 0 ? {
    max: Math.floor(Math.max(...ratings) * 100) / 100,
    min: Math.floor(Math.min(...ratings) * 100) / 100,
    average: averageRating
  } : null;

  if (displaySongs.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <p>표시할 곡이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="text-center mb-4">
  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {type === 'best' ? 'Best 30' : 'New 20'}
        </h3>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <p className="text-sm text-gray-500">
            {allSongs.length}곡 표시
          </p>
          {ratingStats && (
            <div className="text-xs text-gray-600 flex flex-wrap gap-4 justify-center sm:justify-end">
              <span className="text-green-600 font-medium">
                최대: {ratingStats.max.toFixed(2)}
              </span>
              <span className="text-red-600 font-medium">
                최소: {ratingStats.min.toFixed(2)}
              </span>
              <span className="text-blue-600 font-medium">
                평균: {ratingStats.average.toFixed(4)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className={`grid ${config.className} ${config.gap} justify-items-center`}>
        {allSongs.map((song, index) => {
          let gridColumnClass = '';
          if (type === 'new' && allSongs.length === 20) {
            if (index === 18) {
              gridColumnClass = 'xl:col-start-1 xl:col-end-2 xl:ml-[50%]';
            } else if (index === 19) {
              gridColumnClass = 'xl:col-start-2 xl:col-end-3 xl:ml-[50%]';
            }
          }
          return (
            <div 
              key={`${song.id}-${song.difficulty}-${index}`} 
              className={`w-full ${type === 'new' ? 'max-w-[637px]' : 'max-w-[490px]'} ${gridColumnClass}`}
            >
              <ChunithmSongCard song={song} index={index} />
            </div>
          );
        })}
        {/* New 20에서 곡이 19개 이하일 때만 임시 입력 UI 표시 */}
        {type === 'new' && allSongs.length < 20 && (
          <div className="w-full max-w-[637px] p-4 border rounded bg-gray-50 dark:bg-gray-800 flex flex-col gap-2">
            <div className="font-bold mb-2 text-gray-800 dark:text-gray-100">임시 곡 추가</div>
            <input
              type="text"
              className="border rounded px-2 py-1 mb-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="곡명 입력"
              value={tempTitle}
              onChange={e => setTempTitle(e.target.value)}
            />
            <select
              className="border rounded px-2 py-1 mb-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              value={tempLevel}
              onChange={e => {
                setTempLevel(e.target.value);
                setTempConst('');
              }}
            >
              <option value="">레벨 선택</option>
              {['1','2','3','4','5','6','7','7+','8','8+','9','9+','10','10+','11','11+','12','12+','13','13+','14','14+','15','15+'].map(lv => (
                <option key={lv} value={lv}>{lv}</option>
              ))}
            </select>
            <select
              className="border rounded px-2 py-1 mb-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              value={tempConst}
              onChange={e => setTempConst(e.target.value)}
              disabled={!tempLevel}
            >
              <option value="">상수 선택</option>
              {tempLevel && levelConstMap[tempLevel]?.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              className="border rounded px-2 py-1 mb-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              value={tempDifficulty}
              onChange={e => setTempDifficulty(e.target.value)}
            >
              <option value="BAS">BAS</option>
              <option value="ADV">ADV</option>
              <option value="EXP">EXP</option>
              <option value="MAS">MAS</option>
              <option value="ULT">ULT</option>
            </select>
            <input
              type="number"
              className="border rounded px-2 py-1 mb-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="스코어 입력"
              value={tempScore}
              onChange={e => setTempScore(e.target.value)}
            />
            <button
              type="button"
              className={`bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded font-semibold hover:bg-blue-700 dark:hover:bg-blue-800 transition ${tempTitle && tempLevel && tempConst && tempDifficulty && tempScore ? '' : 'opacity-50 cursor-not-allowed'}`}
              disabled={!(tempTitle && tempLevel && tempConst && tempDifficulty && tempScore)}
              onClick={() => {
                // 임시 곡 추가
                setTempSongs([...tempSongs, {
                  id: `temp-${Date.now()}`,
                  title: tempTitle,
                  level: tempLevel,
                  const: parseFloat(tempConst),
                  displayConst: tempConst,
                  difficulty: tempDifficulty,
                  score: Number(tempScore),
                }]);
                setTempTitle('');
                setTempLevel('');
                setTempConst('');
                setTempDifficulty('BAS');
                setTempScore('');
              }}
            >+ 추가</button>
          </div>
        )}
      </div>
    </div>
  );
}
