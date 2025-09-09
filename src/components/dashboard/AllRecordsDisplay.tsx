// 파일 경로: src/components/dashboard/AllRecordsDisplay.tsx
'use client';

import { useState, useMemo } from 'react';
import { SongRecordCard } from './SongRecordCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';

export interface SongData {
  title: string;
  score: number;
  level: string;
  difficulty: string;
  const: number;
  ratingValue: number;
  ratingListType?: 'best' | 'new' | null;
}

export interface AllRecordsDisplayProps {
  data: SongData[];
}

// ...existing code...

type SortKey = keyof SongData;
type SortDirection = 'asc' | 'desc';

const sortOptions: { value: SortKey, label: string }[] = [
  { value: 'ratingValue', label: '레이팅' },
  { value: 'level', label: '레벨' },
  { value: 'const', label: '상수' },
  { value: 'score', label: '스코어' },
  { value: 'title', label: '곡명' },
  { value: 'difficulty', label: '난이도' },
];

const secondarySortOptions: { value: SortKey | 'none', label: string }[] = [
  { value: 'none', label: '없음' },
  ...sortOptions
];

const levelToNumber = (level: string) => parseFloat(level.replace('+', '.5'));

export function AllRecordsDisplay({ data }: AllRecordsDisplayProps) {
  const pageSizeOptions = [30, 50, 100, 0];
  const [pageSize, setPageSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('segament-records-pageSize');
      return saved ? Number(saved) : 30;
    }
    return 30;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [primarySort, setPrimarySort] = useState<{ key: SortKey, dir: SortDirection }>({ key: 'ratingValue', dir: 'desc' });
  const [secondarySort, setSecondarySort] = useState<{ key: SortKey | 'none', dir: SortDirection }>({ key: 'level', dir: 'desc' });
// ...existing code...

  // Best30/New20 순위 계산 (레이팅 내림차순 기준)
  const bestList = data.filter(song => song.ratingListType === 'best');
  const newList = data.filter(song => song.ratingListType === 'new');
  const sortedBestList = [...bestList].sort((a, b) => b.ratingValue - a.ratingValue);
  const sortedNewList = [...newList].sort((a, b) => b.ratingValue - a.ratingValue);

  // 페이지 사이즈 변경 시 로컬 저장
  const handlePageSizeChange = (value: string) => {
    const num = Number(value);
    setPageSize(num);
    setCurrentPage(1);
    if (typeof window !== 'undefined') {
      localStorage.setItem('segament-records-pageSize', value);
    }
  };

  // 정렬
  const sortedData = useMemo(() => {
    const difficultyOrder = ['ULT', 'MAS', 'EXP', 'ADV', 'BAS'];
    const compare = (a: SongData, b: SongData, key: SortKey) => {
      if (key === 'level') {
        return levelToNumber(a.level) - levelToNumber(b.level);
      }
      if (key === 'difficulty') {
        const idxA = difficultyOrder.indexOf(a.difficulty);
        const idxB = difficultyOrder.indexOf(b.difficulty);
        return idxA - idxB;
      }
      const valA = a[key];
      const valB = b[key];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return valA - valB;
      }
      return String(valA).localeCompare(String(valB));
    };
    return [...data].sort((a, b) => {
      const primaryResult = compare(a, b, primarySort.key) * (primarySort.dir === 'asc' ? 1 : -1);
      if (primaryResult !== 0) {
        return primaryResult;
      }
      if (secondarySort.key === 'none') {
        return 0;
      }
      return compare(a, b, secondarySort.key as SortKey) * (secondarySort.dir === 'asc' ? 1 : -1);
    });
  }, [data, primarySort, secondarySort]);

  // 페이지네이션
  const totalPages = pageSize === 0 ? 1 : Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    if (pageSize === 0) {
      return sortedData;
    }
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize]);

  const toggleDirection = <T extends { key: any; dir: SortDirection }>(sortSetter: React.Dispatch<React.SetStateAction<T>>) => {
    sortSetter(prev => ({ ...prev, dir: prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  // 카드 오버레이 스타일
  // 오버레이 제거, 중앙 텍스트 표시

  return (
    <div>
      {/* 정렬/페이지네이션 컨트롤 */}
      <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">1차 정렬:</span>
          <Select value={primarySort.key} onValueChange={(v) => setPrimarySort(p => ({ ...p, key: v as SortKey }))}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>{sortOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => toggleDirection(setPrimarySort)}>
            {primarySort.dir === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">2차 정렬:</span>
          <Select value={secondarySort.key} onValueChange={(v) => setSecondarySort(p => ({ ...p, key: v as SortKey | 'none' }))}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>{secondarySortOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => toggleDirection(setSecondarySort)}>
            {secondarySort.dir === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">표시량:</span>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="0">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* 카드 그리드: 2열, 카드 크기 축소, 오버레이 적용 */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {paginatedData.map((song) => {
          let bestRank: number | null = null;
          let newRank: number | null = null;
          if (song.ratingListType === 'best') {
            const idx = sortedBestList.findIndex(s => s.title === song.title && s.difficulty === song.difficulty);
            if (idx !== -1) bestRank = idx + 1;
          } else if (song.ratingListType === 'new') {
            const idx = sortedNewList.findIndex(s => s.title === song.title && s.difficulty === song.difficulty);
            if (idx !== -1) newRank = idx + 1;
          }
          return (
            <div key={`${song.title}-${song.difficulty}`} className="relative">
              <SongRecordCard song={{ ...song, ratingValue: Number(song.ratingValue.toFixed(2)) }} small bestRank={bestRank} newRank={newRank} />
            </div>
          );
        })}
      </div>
      {/* 페이지 이동 컨트롤 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-4 gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
            <ArrowUp className="h-4 w-4" />
          </Button>
          <span className="text-sm">{currentPage} / {totalPages}</span>
          <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
