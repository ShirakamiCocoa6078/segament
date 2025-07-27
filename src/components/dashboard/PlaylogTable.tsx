// 파일 경로: src/components/dashboard/PlaylogTable.tsx
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
interface Playlog {
  id: string;
  title: string;
  difficulty: string;
  score: number;
  rank: string;
  const: number;
  ratingValue: number;
}

interface PlaylogTableProps {
  playlogs: Playlog[];
}

type SortKey = 'score' | 'const';
type SortDirection = 'asc' | 'desc';

export function PlaylogTable({ playlogs }: PlaylogTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedLogs = useMemo(() => {
    return [...playlogs].sort((a, b) => {
      if (a[sortKey] < b[sortKey]) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (a[sortKey] > b[sortKey]) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [playlogs, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50%]">Title</TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => handleSort('score')}>
              Score <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
             <Button variant="ghost" onClick={() => handleSort('const')}>
              Const <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead className="text-right">Rank</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedLogs.map((log) => (
          <TableRow key={`${log.id}-${log.difficulty}`}>
            <TableCell className="font-medium">
              <div className="flex flex-col">
                <span>{log.title}</span>
                <span className="text-xs text-muted-foreground">{log.difficulty}</span>
              </div>
            </TableCell>
            <TableCell>{log.score.toLocaleString()}</TableCell>
            <TableCell>{log.const.toFixed(1)}</TableCell>
            <TableCell className="text-right font-semibold">{log.rank}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}