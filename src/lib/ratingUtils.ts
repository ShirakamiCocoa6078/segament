// 파일 경로: src/lib/ratingUtils.ts

export const calculateSingleRatingValue = (score: number, constant: number): number => {
  if (score >= 1009000) return constant + 2.15;
  if (score >= 1007500) return constant + 2.00 + (score - 1007500) * 0.0001;
  if (score >= 1005000) return constant + 1.50 + (score - 1005000) * 0.0002;
  if (score >= 1000000) return constant + 1.00 + (score - 1000000) * 0.0001;
  if (score >= 975000)  return constant + 0.00 + (score - 975000) * 0.00004;
  return 0;
};

export const calculatePlayerRating = (playlogs: any[], musicData: any[], newSongs: string[]) => {
  const ratingTargets = playlogs.map(log => {
    const song = musicData.find(m => m.meta.title === log.musicId);
    if (!song || !song.data[log.difficulty]) return null;
    
    const constant = song.data[log.difficulty].const;
    const ratingValue = calculateSingleRatingValue(log.score, constant);
    
    return {
      title: log.musicId,
      difficulty: log.difficulty,
      score: log.score,
      ratingValue: ratingValue,
      isNewSong: newSongs.includes(log.musicId),
    };
  }).filter(Boolean) as { title: string; difficulty: string; score: number; ratingValue: number; isNewSong: boolean; }[];

  const newSongsRatings = ratingTargets.filter(r => r.isNewSong).sort((a, b) => b.ratingValue - a.ratingValue);
  const oldSongsRatings = ratingTargets.filter(r => !r.isNewSong).sort((a, b) => b.ratingValue - a.ratingValue);

  const best30 = oldSongsRatings.slice(0, 30);
  const new20 = newSongsRatings.slice(0, 20);
  
  const ratingPool = [...best30, ...new20];
  if (ratingPool.length === 0) {
    return { finalRating: 0, best30: [], new20: [] };
  }

  const finalRating = ratingPool.reduce((sum, log) => sum + log.ratingValue, 0) / ratingPool.length;

  return {
    finalRating: parseFloat(finalRating.toFixed(2)),
    best30,
    new20,
  };
};