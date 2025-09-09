import { Card, CardContent } from "@/components/ui/card";
import { scoreToRank, cn } from "@/lib/utils";

const difficultyColorMap = {
  ULTIMA: 'custom-ult-border', // 커스텀 스타일 적용
  MASTER: 'border-purple-500',
  EXPERT: 'border-red-500',
  ADVANCED: 'border-yellow-400',
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
  bestRank?: number | null;
  newRank?: number | null;
}

export function SongRecordCard({ song, small = false, bestRank, newRank }: SongRecordCardProps) {
  const rank = scoreToRank(song.score);
  const borderColorClass = difficultyColorMap[song.difficulty as keyof typeof difficultyColorMap] || 'border-transparent';
  const isUlt = song.difficulty === 'ULTIMA';

  // Bn/[rating] 또는 Nn/[rating] 텍스트 생성
  let ratingLabel = null;
  if (bestRank) {
    ratingLabel = <span className="ml-2 text-red-500 font-bold text-[13px]">B{bestRank}/{song.ratingValue.toFixed(2)}</span>;
  } else if (newRank) {
    ratingLabel = <span className="ml-2 text-blue-500 font-bold text-[13px]">N{newRank}/{song.ratingValue.toFixed(2)}</span>;
  }

  return (
    <Card
      className={cn(
        "border-l-4 shadow-sm bg-background rounded-lg",
        !isUlt ? borderColorClass : '',
        small ? "min-h-[72px]" : "min-h-[96px]",
      )}
      style={
        isUlt
          ? {
              borderLeft: '8px solid',
              borderImage: 'repeating-linear-gradient(135deg, #d00 0 10px, #111 10px 20px) 8',
            }
          : undefined
      }
    >
      <CardContent className={cn("flex justify-between items-center", small ? "p-2" : "p-3")}> 
        <div className={cn("flex flex-col flex-grow pr-2 overflow-hidden", small ? "gap-0" : "gap-1")}> 
          <p className={cn("font-bold truncate", small ? "text-[13px]" : "text-lg")} title={song.title}>{song.title}</p>
          <p className={cn("text-muted-foreground flex items-center", small ? "text-[15px]" : "text-xl")}> 
            <span className={cn("font-extrabold text-primary ml-0", small ? "text-[20px]" : "text-3xl")}>{song.score.toLocaleString()}</span>
            <span className={cn("font-bold ml-2 text-primary", small ? "text-[16px]" : "text-2xl")}>{rank}</span>
          </p>
        </div>
        <div className={cn("flex flex-col items-end flex-shrink-0", small ? "w-[60px]" : "w-[90px]")}> 
          <p className={cn("font-extrabold text-primary leading-tight flex items-center", small ? "text-[16px]" : "text-2xl")}> 
            {ratingLabel ? ratingLabel : song.ratingValue.toFixed(2)}
          </p>
          <p className={cn("font-semibold", small ? "text-[11px]" : "text-md")}>{song.level} <span className="text-muted-foreground">{song.difficulty.slice(0, 3)}</span></p>
          <p className={cn("text-muted-foreground", small ? "text-[10px]" : "text-xs")}>Const: {song.const.toFixed(1)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
