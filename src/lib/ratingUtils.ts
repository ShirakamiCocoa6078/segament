// 파일 경로: src/lib/ratingUtils.ts

/**
 * 보면 상수와 점수를 기반으로 단일 곡 레이팅 값을 계산합니다.
 * @param constant - 보면 상수 (예: 14.5)
 * @param score - 플레이 점수 (예: 1009000)
 * @returns 계산된 단일 곡 레이팅 값
 */
export function calculateRating(constant: number, score: number): number {
  if (score >= 1009000) { // SSS+
    return constant + 2.15;
  }
  if (score >= 1007500) { // SSS
    return constant + 2.00 + ( Math.floor((score - 1007500)/100) * 0.01);
  }
  if (score >= 1005000) { // SS+
    return constant + 1.50 + ( Math.floor((score - 1005000)/50) * 0.01);
  }
  if (score >= 1000000) { // SS
    return constant + 1.00 + ( Math.floor((score - 1000000)/100) * 0.01);
  }
  if (score >= 990000) { // S+
    return constant + 0.6 + ( Math.floor((score - 990000)/250) * 0.01);
  }
  if (score >= 975000) { // S
    // S부터 S+ 까지는 15000점 구간에 1.00의 레이팅이 배분되어 있음.
    // 975000점: +0.0, 990000점: +0.5, 1000000점: +1.0
    return constant + ( Math.floor((score - 975000)/250) * 0.01);
  }
  if (score >= 950000) { // AAA
    return constant - 1.50; // (3.00 / 25000)
  }
  if (score >= 925000) { // AA
    return constant - 3.00;
  }
  if (score >= 900000) { // A
    return constant - 5.00; // (2.00 / 25000)
  }
  if (score >= 800000) { // BBB
    return (constant - 5.00) / 2;
  }
  // B, C, D
  if(score < 800000){
    return 0;
  }
  return 0;
}