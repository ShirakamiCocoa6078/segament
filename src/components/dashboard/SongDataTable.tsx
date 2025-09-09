// 파일 경로: src/components/dashboard/SongDataTable.tsx
'use client';

import { useState, useMemo, useEffect, ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { cn, scoreToRank } from '@/lib/utils';
import { AllRecordsDisplay } from './AllRecordsDisplay';

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
  // 모든 환경에서 카드 그리드 UI로 통일
  return <AllRecordsDisplay data={data} />;
}