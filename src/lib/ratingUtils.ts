/**
 * 레이팅 배열을 받아 최대/최소/평균을 반환하는 헬퍼 함수
 */
export function getRatingStats(ratings: number[]) {
  if (ratings.length === 0) return { max: 0, min: 0, average: 0 };
  const max = Math.max(...ratings);
  const min = Math.min(...ratings);
  const average = Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10000) / 10000;
  return { max, min, average };
}
// 파일 경로: src/lib/ratingUtils.ts

/**
 * 보면 상수와 점수를 기반으로 단일 곡 레이팅 값을 계산합니다.
 * @param constant - 보면 상수 (예: 14.5)
 * @param score - 플레이 점수 (예: 1009000)
 * @returns 계산된 단일 곡 레이팅 값
 */
export function calculateRating(constant: number, score: number): number {
  let result = 0;
  if (score >= 1009000) { // SSS+
    result = (constant*100) + (2.15 * 100);
    return result / 100;
  }
  if (score >= 1007500) { // SSS
    result = (constant * 100) + (2.0 * 100) + ( Math.floor((score - 1007500)/100));
    return result / 100;
  }
  if (score >= 1005000) { // SS+
    result = (constant * 100) + (1.50 * 100) + ( Math.floor((score - 1005000)/50));
    return result / 100;
  }
  if (score >= 1000000) { // SS
    result = (constant * 100) + (1.0 * 100) + ( Math.floor((score - 1000000)/100));
    return result / 100;
  }
  if (score >= 990000) { // S+
    result = (constant * 100) + (0.6 * 100) + ( Math.floor((score - 990000)/250));
    return result / 100;
  }
  if (score >= 975000) { // S
    result = (constant * 100) + ( Math.floor((score - 975000)/250));
    return result / 100;
  }
  if (score >= 950000) { // AAA
    result = (constant * 100) - (1.5 * 100);
    return result / 100;
  }
  if (score >= 925000) { // AA
    result = (constant * 100) - (3.0 * 100);
    return result / 100;
  }
  if (score >= 900000) { // A
    result = (constant * 100) - (5.0 * 100);
    return result / 100;
  }
  if (score >= 800000) { // BBB
    result = (constant * 100 - (5.0 * 100)) / 2;
    return result / 100;
  }
  // B, C, D
  if(score < 800000){
    return result;
  }
  return result;
}