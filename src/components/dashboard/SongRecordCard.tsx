import { Card, CardContent } from "@/components/ui/card";
import { scoreToRank, cn } from "@/lib/utils";

const difficultyColorMap = {
  ULTIMA: 'border-red-500',
  MASTER: 'border-purple-500',
  EXPERT: 'border-yellow-500',
  ADVANCED: 'border-blue-500',
  BASIC: 'border-green-500',
};

interface SongData {
  title: string;
  score: number;
  level: string;
  difficulty: string;
  const: number;
  ratingValue: number;
}

interface SongRecordCardProps {
  song: SongData;
  small?: boolean;
}

export function SongRecordCard({ song, small = false }: SongRecordCardProps) {
  const rank = scoreToRank(song.score);
  const borderColorClass = difficultyColorMap[song.difficulty as keyof typeof difficultyColorMap] || 'border-transparent';

  return (
    <Card className={cn("border-l-4", borderColorClass, "shadow-sm bg-background", small ? "min-h-[72px]" : "min-h-[96px]")}> 
      <CardContent className={cn("flex justify-between items-center", small ? "p-2" : "p-3")}> 
        <div className={cn("flex flex-col flex-grow pr-2 overflow-hidden", small ? "gap-0" : "gap-1")}> 
          <p className={cn("font-bold truncate", small ? "text-[13px]" : "text-lg")} title={song.title}>{song.title}</p>
          <p className={cn("text-muted-foreground", small ? "text-[11px]" : "text-sm")}> 
            {song.score.toLocaleString()} <span className={cn("font-semibold ml-2", small ? "text-[11px]" : "")}>{rank}</span>
          </p>
        </div>
        <div className={cn("flex flex-col items-end flex-shrink-0", small ? "w-[60px]" : "w-[90px]")}> 
          <p className={cn("font-extrabold text-primary leading-tight", small ? "text-[16px]" : "text-2xl")}>{song.ratingValue.toFixed(2)}</p>
          <p className={cn("font-semibold", small ? "text-[11px]" : "text-md")}>{song.level} <span className="text-muted-foreground">{song.difficulty.slice(0, 3)}</span></p>
          <p className={cn("text-muted-foreground", small ? "text-[10px]" : "text-xs")}>Const: {song.const.toFixed(1)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
