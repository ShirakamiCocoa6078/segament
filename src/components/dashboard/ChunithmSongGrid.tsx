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
  // 레이팅표 생성 팝업 상태 및 로직
  const [showRatingImgPopup, setShowRatingImgPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpenRatingImgPopup = async () => {
    setShowRatingImgPopup(true);
    setLoading(true);
    setImgUrl(null);
    setError(null);
    try {
      const res = await fetch('/api/v1/img/MakeRatingImg');
      if (!res.ok) throw new Error('이미지 생성 실패');
      const blob = await res.blob();
      setImgUrl(URL.createObjectURL(blob));
    } catch (e: any) {
      setError(e.message || '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };
  const handleCloseRatingImgPopup = () => {
    setShowRatingImgPopup(false);
    setImgUrl(null);
    setError(null);
    setLoading(false);
  };
  const handleDownload = () => {
    if (!imgUrl) return;
    const nickname = 'user'; // TODO: 실제 닉네임 연동
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const filename = `${nickname}_${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.png`;
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = filename;
    a.click();
  };
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
      <div className="mb-4">
        <div className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {type === 'best' ? 'Best 30' : 'New 20'}
          </h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition ml-4" onClick={handleOpenRatingImgPopup}>
            레이팅표 생성
          </button>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mt-2">
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
      {/* 팝업 UI (베타: 버튼 클릭 시 화면 중앙에 표시, 실제 이미지/스피너/다운로드/오류 처리 등은 후속 구현) */}
      {showRatingImgPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-lg min-w-[400px] min-h-[200px] flex flex-col items-center">
            <div className="mb-4 text-lg font-bold">레이팅표 생성</div>
            {loading && (
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-2" />
                <div>이미지 생성 중...</div>
              </div>
            )}
            {error && (
              <div className="text-red-600 mb-4">{error}</div>
            )}
            {imgUrl && !loading && !error && (
              <>
                <img src={imgUrl} alt="레이팅표" className="mb-4 max-w-full max-h-[600px] border" />
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mb-2" onClick={handleDownload}>다운로드</button>
              </>
            )}
            <button className="mt-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={handleCloseRatingImgPopup}>닫기</button>
          </div>
        </div>
      )}
      
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
