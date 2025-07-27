// 파일 경로: src/components/dashboard/SongDataTable.tsx
'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

// TODO: 이 타입 정의는 @/types/index.ts 와 같은 공용 파일로 분리하여 관리합니다.
interface SongData {
  id: string;
  title: string;
  score: number;
  level: string;
  difficulty: string;
  const: number;
  ratingValue: number;
}

interface SongDataTableProps {
  data: SongData[];
}

type SortKey = keyof SongData;
type SortDirection = 'asc' | 'desc';

const difficultyOrder: { [key: string]: number } = {
  BASIC: 1,
  ADVANCED: 2,
  EXPERT: 3,
  MASTER: 4,
  ULTIMA: 5,
};

export function SongDataTable({ data }: SongDataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('ratingValue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      let compare = 0;
      if (sortKey === 'difficulty') {
        compare = (difficultyOrder[aVal] || 0) - (difficultyOrder[bVal] || 0);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        compare = aVal - bVal;
      } else {
        compare = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === 'asc' ? compare : -compare;
    });
  }, [data, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const renderSortArrow = (key: SortKey) => {
    if (sortKey === key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40%]">
            <Button variant="ghost" onClick={() => handleSort('title')}>곡명 {renderSortArrow('title')}</Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => handleSort('score')}>스코어 {renderSortArrow('score')}</Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => handleSort('level')}>레벨 {renderSortArrow('level')}</Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => handleSort('difficulty')}>난이도 {renderSortArrow('difficulty')}</Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => handleSort('const')}>상수 {renderSortArrow('const')}</Button>
          </TableHead>
          <TableHead className="text-right">
            <Button variant="ghost" onClick={() => handleSort('ratingValue')}>레이팅 {renderSortArrow('ratingValue')}</Button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((item) => (
          <TableRow key={`${item.id}-${item.difficulty}`}>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>{item.score.toLocaleString()}</TableCell>
            <TableCell>{item.level}</TableCell>
            <TableCell>{item.difficulty}</TableCell>
            <TableCell>{item.const.toFixed(1)}</TableCell>
            <TableCell className="text-right font-semibold">{item.ratingValue.toFixed(4)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}