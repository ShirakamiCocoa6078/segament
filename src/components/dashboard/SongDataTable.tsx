// 파일 경로: src/components/dashboard/SongDataTable.tsx
'use client';

import { useState, useMemo, useEffect, ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { cn, scoreToRank } from '@/lib/utils';
import { SongRecordCard } from './SongRecordCard';

// --- 타입 정의 (이전과 동일) ---
interface SongData {
  id: string;
  title: string;
  score: number;
  level: string;
  difficulty: string;
  const: number;
  ratingValue: number;
  ratingListType?: 'best' | 'new' | null;
}

interface SongDataTableProps {
  data: SongData[];
  showPagination?: boolean;
}

type SortKey = keyof SongData;
type SortDirection = 'asc' | 'desc';

// --- 헬퍼 함수 (이전과 동일) ---
const difficultyOrder: { [key: string]: number } = { BASIC: 1, ADVANCED: 2, EXPERT: 3, MASTER: 4, ULTIMA: 5 };
const difficultyColorMap: { [key: string]: string } = {
  BASIC: 'text-green-600',
  ADVANCED: 'text-yellow-600',
  EXPERT: 'text-red-600',
  MASTER: '', // 조건부 적용
  ULTIMA: '', // 조건부 적용
};
const levelToNumber = (level: string): number => {
    const isPlus = level.includes('+');
    const num = parseFloat(level.replace('+', ''));
    return isPlus ? num + 0.5 : num;
};

export function SongDataTable({ data, showPagination = false }: SongDataTableProps) {
  // 정렬 관련 상태
  const [sortKey, setSortKey] = useState<SortKey>('ratingValue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedValue = localStorage.getItem('segament-rowsPerPage');
      return savedValue ? Number(savedValue) : 15;
    }
    return 15;
  });
  const [currentPage, setCurrentPage] = useState(1);
  // 모바일 모드 감지
  const [isMobileMode, setIsMobileMode] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateMode = () => {
        setIsMobileMode(localStorage.getItem('uiMode') === 'mobile');
      };
      updateMode();
      window.addEventListener('storage', updateMode);
      return () => {
        window.removeEventListener('storage', updateMode);
      };
    }
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('segament-rowsPerPage', String(rowsPerPage));
    }
  }, [rowsPerPage]);
  // 정렬 함수
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      let compare = 0;
      if (sortKey === 'level') {
        compare = levelToNumber(String(aVal || '0')) - levelToNumber(String(bVal || '0'));
      } else if (sortKey === 'difficulty') {
        compare = (difficultyOrder[String(aVal || '')] || 0) - (difficultyOrder[String(bVal || '')] || 0);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        compare = aVal - bVal;
      } else {
        compare = String(aVal).localeCompare(String(bVal));
      }
      return sortDirection === 'asc' ? compare : -compare;
    });
  }, [data, sortKey, sortDirection]);
  const totalPages = showPagination && rowsPerPage > 0 ? Math.ceil(sortedData.length / rowsPerPage) : 1;
  const paginatedData = useMemo(() => {
    if (!showPagination || rowsPerPage === 0) { return sortedData; }
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, rowsPerPage, showPagination]);
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };
  // --- 모바일 UI ---
  if (isMobileMode) {
    return (
      <div className="w-full max-w-[525px] mx-auto">
        {/* 모바일 정렬 UI */}
        <div className="flex items-center justify-between mb-2">
          <Select value={sortKey} onValueChange={v => setSortKey(v as SortKey)}>
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ratingValue">레이팅</SelectItem>
              <SelectItem value="level">레벨</SelectItem>
              <SelectItem value="score">스코어</SelectItem>
              <SelectItem value="title">곡명</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')}>
            {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </Button>
        </div>
        {/* 카드 리스트 */}
        <div>
          {sortedData.map(song => (
            <SongRecordCard key={song.id + song.difficulty} song={song} />
          ))}
        </div>
      </div>
    );
  }
  // --- PC 테이블 UI ---
  return (
    <div>
      {/* 페이지네이션 컨트롤 상단 */}
      {showPagination && (
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">페이지에 표시하는 곡 수:</p>
            <Select
              value={rowsPerPage.toString()}
              onValueChange={value => {
                setRowsPerPage(value === '0' ? 0 : Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="0">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-2">곡명</TableHead>
            <TableHead className="px-2 cursor-pointer" onClick={() => handleSort('score')}>스코어 / 랭크 {sortKey === 'score' && (sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
            <TableHead className="px-2 cursor-pointer" onClick={() => handleSort('level')}>레벨 / 난이도 {sortKey === 'level' && (sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
            <TableHead className="px-2 cursor-pointer" onClick={() => handleSort('const')}>상수 {sortKey === 'const' && (sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
            <TableHead className="px-2 cursor-pointer" onClick={() => handleSort('ratingValue')}>레이팅 {sortKey === 'ratingValue' && (sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map(item => (
            <TableRow key={item.id + item.difficulty} className={cn({
              'bg-orange-50 dark:bg-orange-900/20': item.ratingListType === 'best',
              'bg-yellow-50 dark:bg-yellow-900/20': item.ratingListType === 'new',
            })}>
              <TableCell className="font-medium px-2 py-1 truncate max-w-[180px]">{item.title}</TableCell>
              <TableCell className="px-2 py-1 text-right whitespace-nowrap">
                {item.score.toLocaleString()} <span className="text-xs text-muted-foreground">({scoreToRank(item.score)})</span>
              </TableCell>
              <TableCell className="px-2 py-1 text-center">
                {item.level} <span className="font-semibold ml-1">{item.difficulty.slice(0, 3)}</span>
              </TableCell>
              <TableCell className="px-2 py-1 text-center">{item.const.toFixed(1)}</TableCell>
              <TableCell className="px-2 py-1 text-right font-bold">{item.ratingValue.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* 페이지 이동 컨트롤 하단 */}
      {showPagination && (
        <div className="flex items-center justify-end mt-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* 페이지 스크롤 버튼 */}
      <div className="fixed bottom-8 right-8 flex flex-col space-y-2">
        <Button variant="outline" size="icon" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}