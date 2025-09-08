// 파일 경로: src/components/dashboard/SongRecordCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { scoreToRank } from "@/lib/utils";

interface SongRecordCardProps {
  song: {
    title: string;
    score: number;
    level: string;
    difficulty: string;
    const: number;
    ratingValue: number;
  };
}

export function SongRecordCard({ song }: SongRecordCardProps) {
  return (
    <Card className="mb-2">
      <CardContent className="flex justify-between items-center p-3">
        <div className="flex flex-col flex-grow pr-2">
          <p className="font-bold truncate">{song.title}</p>
          <p className="text-sm text-muted-foreground">
            {song.score.toLocaleString()} ({scoreToRank(song.score)})
          </p>
        </div>
        <div className="flex flex-col items-end flex-shrink-0 w-[80px]">
          <p className="text-lg font-extrabold text-primary">{song.ratingValue.toFixed(2)}</p>
          <p className="text-sm">{song.level} <span className="font-semibold">{song.difficulty.slice(0, 3)}</span></p>
          <p className="text-xs text-muted-foreground">Const: {song.const.toFixed(1)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
