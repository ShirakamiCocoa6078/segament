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
  clearType?: number;
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
        className: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
        gap: 'gap-4'
      };
    } else {
      return {
        columns: 4,
        maxSongs: 20,
        className: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
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
        {displaySongs.map((song, index) => (
          <div key={`${song.id}-${song.difficulty}-${index}`} className="w-full max-w-[490px]">
            <ChunithmSongCard song={song} />
          </div>
        ))}
      </div>
    </div>
  );
}
