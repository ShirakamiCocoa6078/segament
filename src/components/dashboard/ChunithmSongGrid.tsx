// 파일 경로: src/components/dashboard/ChunithmSongGrid.tsx
'use client';

import { ChunithmSongCard } from './ChunithmSongCard';

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
  // 디버깅: 받은 데이터 확인
  console.log(`[ChunithmSongGrid] ${type} 타입으로 받은 songs 데이터:`, songs);
  console.log(`[ChunithmSongGrid] songs 배열 길이:`, songs.length);
  
  // 첫 번째 곡의 상세 정보 확인
  if (songs.length > 0) {
    console.log(`[ChunithmSongGrid] 첫 번째 곡 상세 정보:`, {
      id: songs[0].id,
      title: songs[0].title,
      difficulty: songs[0].difficulty,
      score: songs[0].score,
      clearType: songs[0].clearType,
      comboType: songs[0].comboType,
      fullChainType: songs[0].fullChainType,
      isFullCombo: songs[0].isFullCombo,
      isAllJustice: songs[0].isAllJustice,
      isAllJusticeCritical: songs[0].isAllJusticeCritical
    });
  }

  const getGridConfig = () => {
    if (type === 'best') {
      return {
        columns: 3,
        maxSongs: 30,
        className: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
        gap: 'gap-4'
      };
    } else {
      return {
        columns: 3,
        maxSongs: 20,
        className: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        gap: 'gap-3'
      };
    }
  };

  const config = getGridConfig();
  const displaySongs = songs.slice(0, config.maxSongs);

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
        <p className="text-sm text-gray-500">
          {displaySongs.length}곡 표시
        </p>
      </div>
      
      <div className={`grid ${config.className} ${config.gap} justify-items-center`}>
        {displaySongs.map((song, index) => {
          // New 20에서 마지막 2개 요소(19, 20번째)의 위치 조정
          let gridColumnClass = '';
          if (type === 'new' && displaySongs.length === 20) {
            if (index === 18) { // 19번째 요소 (0-based index 18)
              gridColumnClass = 'lg:col-start-1 lg:col-end-2 lg:ml-[50%]'; // 1-2 열 사이
            } else if (index === 19) { // 20번째 요소 (0-based index 19)
              gridColumnClass = 'lg:col-start-2 lg:col-end-3 lg:ml-[50%]'; // 2-3 열 사이
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
