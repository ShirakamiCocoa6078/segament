// 파일 경로: src/components/dashboard/ChunithmSongGrid.tsx
'use client';

import { ChunithmSongCard } from './ChunithmSongCard';
import { calculateRating } from '@/lib/ratingUtils';

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

interface ChunithmSongGridProps {
  songs: SongData[];
  type: 'best' | 'new';
}

export function ChunithmSongGrid({ songs, type }: ChunithmSongGridProps) {
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

  // 레이팅 통계 계산
  const ratings = displaySongs
    .filter(song => song.const && song.score)
    .map(song => calculateRating(song.const!, song.score));
  
  const ratingStats = ratings.length > 0 ? {
    max: Math.max(...ratings),
    min: Math.min(...ratings),
    average: ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
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
        <h3 className="text-lg font-semibold text-gray-800">
          {type === 'best' ? 'Best 30' : 'New 20'}
        </h3>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <p className="text-sm text-gray-500">
            {displaySongs.length}곡 표시
          </p>
          {ratingStats && (
            <div className="text-xs text-gray-600 flex flex-wrap gap-4 justify-center sm:justify-end">
              <span className="text-green-600 font-medium">
                최대: {ratingStats.max.toFixed(4)}
              </span>
              <span className="text-red-600 font-medium">
                최소: {ratingStats.min.toFixed(4)}
              </span>
              <span className="text-blue-600 font-medium">
                평균: {ratingStats.average.toFixed(4)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className={`grid ${config.className} ${config.gap} justify-items-center`}>
        {displaySongs.map((song, index) => {
          // New 20에서 마지막 2개 요소(19, 20번째)의 위치 조정 (XL 화면에서만)
          let gridColumnClass = '';
          if (type === 'new' && displaySongs.length === 20) {
            if (index === 18) { // 19번째 요소 (0-based index 18)
              gridColumnClass = 'xl:col-start-1 xl:col-end-2 xl:ml-[50%]'; // 1-2 열 사이 (XL에서만)
            } else if (index === 19) { // 20번째 요소 (0-based index 19)
              gridColumnClass = 'xl:col-start-2 xl:col-end-3 xl:ml-[50%]'; // 2-3 열 사이 (XL에서만)
            }
          }
          
          return (
            <div 
              key={`${song.id}-${song.difficulty}-${index}`} 
              className={`w-full ${type === 'new' ? 'max-w-[637px]' : 'max-w-[490px]'} ${gridColumnClass}`}
            >
              <ChunithmSongCard song={song} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
