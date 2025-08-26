// 파일 경로: src/components/dashboard/SongDataTable.tsx
'use client';

import { useState, useMemo, useEffect, ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  // 난이도 축약 표기
  const difficultyShortMap: { [key: string]: string } = {
    BASIC: 'BAS',
    ADVANCED: 'ADV',
    EXPERT: 'EXP',
    MASTER: 'MAS',
    ULTIMA: 'ULT',
  };
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('segament-rowsPerPage', String(rowsPerPage));
    }
  }, [rowsPerPage]);

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
  
  const renderSortArrow = (key: SortKey) => {
    if (sortKey === key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-20" />;
  };

  const SortableHeader = ({ sortKey: key, children }: { sortKey: SortKey, children: ReactNode }) => (
    <TableHead>
        <Button variant="ghost" onClick={() => handleSort(key)} className="px-2">
            {children} {renderSortArrow(key)}
        </Button>
    </TableHead>
  );

  // 모바일 모드 감지 (localStorage 기반)
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

  return (
    <div className={isMobileMode ? 'max-w-[420px] mx-auto' : ''}>
      {/* 수정: 페이지네이션 컨트롤 상단으로 이동 */}
      {showPagination && (
        <div className="flex items-center justify-end mb-4">
            <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">페이지에 표시하는 곡 수:</p>
                <Select
                    value={rowsPerPage.toString()}
                    onValueChange={(value) => {
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
          <TableRow className={isMobileMode ? 'text-xs' : ''}>
            <SortableHeader sortKey="title"><span className={isMobileMode ? 'text-xs' : ''}>곡명</span></SortableHeader>
            <SortableHeader sortKey="score"><span className={isMobileMode ? 'text-xs' : ''}>스코어</span></SortableHeader>
            <SortableHeader sortKey="level"><span className={isMobileMode ? 'text-xs' : ''}>레벨</span></SortableHeader>
            <SortableHeader sortKey="difficulty"><span className={isMobileMode ? 'text-xs' : ''}>난이도</span></SortableHeader>
            <SortableHeader sortKey="const"><span className={isMobileMode ? 'text-xs' : ''}>상수</span></SortableHeader>
            <SortableHeader sortKey="ratingValue"><span className={isMobileMode ? 'text-xs' : ''}>레이팅</span></SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item) => {
            // 난이도 색상 조건
            let difficultyClass = '';
            let difficultyStyle: React.CSSProperties | undefined = undefined;
            if (item.difficulty === 'MASTER') {
              difficultyClass = 'text-purple-600';
              if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                difficultyClass = 'text-purple-400'; // 다크모드에서 10% 밝게
              }
            } else if (item.difficulty === 'ULTIMA') {
              if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                difficultyClass = 'text-[#683240]'; // 다크모드: 검붉은색
                difficultyStyle = {
                  WebkitTextStroke: '1px #fff',
                };
              } else {
                difficultyClass = 'text-gray-700'; // 화이트모드: 어두운 회색
              }
            } else {
              difficultyClass = difficultyColorMap[item.difficulty] || '';
            }
            return (
              <TableRow 
                key={`${item.id}-${item.difficulty}`}
                className={cn({
                  'bg-orange-50 dark:bg-orange-900/20': item.ratingListType === 'best',
                  'bg-yellow-50 dark:bg-yellow-900/20': item.ratingListType === 'new',
                  'text-xs': isMobileMode,
                })}
              >
                <TableCell className={isMobileMode ? 'font-medium px-2 py-1' : 'font-medium'}>{item.title}</TableCell>
                <TableCell className={isMobileMode ? 'px-1 py-1' : ''}>{item.score.toLocaleString()}</TableCell>
                <TableCell className={isMobileMode ? 'px-1 py-1' : ''}>{item.level}</TableCell>
                <TableCell className={cn(isMobileMode ? 'font-semibold px-1 py-1' : 'font-semibold', difficultyClass)}>
                  <span style={difficultyStyle}>{difficultyShortMap[item.difficulty] || item.difficulty}</span>
                </TableCell>
                <TableCell className={isMobileMode ? 'px-1 py-1' : ''}>{item.const.toFixed(1)}</TableCell>
                <TableCell className={isMobileMode ? 'text-right font-semibold px-1 py-1' : 'text-right font-semibold'}>{item.ratingValue.toFixed(4)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {/* 수정: 페이지 이동 컨트롤만 하단에 남김 */}
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

      {/* 신규: 페이지 스크롤 버튼 */}
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