// 파일 경로: src/components/dashboard/SongRatingTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// TODO: 이 타입 정의는 @/types/index.ts 와 같은 공용 파일로 분리하여 관리합니다.
interface Song {
  id: string;
  title: string;
  difficulty: string;
  score: number;
  const: number;
  ratingValue: number;
}

interface SongRatingTableProps {
  songs: Song[];
}

export function SongRatingTable({ songs }: SongRatingTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60%]">Title</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Const</TableHead>
          <TableHead className="text-right">Rating</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {songs.map((song) => (
          <TableRow key={`${song.id}-${song.difficulty}`}>
            <TableCell className="font-medium">
              <div className="flex flex-col">
                <span>{song.title}</span>
                <span className="text-xs text-muted-foreground">{song.difficulty}</span>
              </div>
            </TableCell>
            <TableCell>{song.score.toLocaleString()}</TableCell>
            <TableCell>{song.const.toFixed(1)}</TableCell>
            <TableCell className="text-right font-semibold">{song.ratingValue.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}