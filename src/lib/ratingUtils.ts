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
    return constant + 2.00 + ((score - 1007500) * 0.0001);
  }
  if (score >= 1005000) { // SS+
    return constant + 1.50 + ((score - 1005000) * 0.0002);
  }
  if (score >= 1000000) { // SS
    return constant + 1.00 + ((score - 1000000) * 0.0001);
  }
  if (score >= 975000) { // S
    // S부터 S+ 까지는 15000점 구간에 1.00의 레이팅이 배분되어 있음.
    // 975000점: +0.0, 990000점: +0.5, 1000000점: +1.0
    return constant + ((score - 975000) / 25000);
  }
  if (score >= 950000) { // AAA
    return constant - 1.50 + ((score - 950000) * 0.00006); // (3.00 / 25000)
  }
  if (score >= 925000) { // AA
    return constant - 3.00 + ((score - 925000) * 0.00006);
  }
  if (score >= 900000) { // A
    return constant - 5.00 + ((score - 900000) * 0.00008); // (2.00 / 25000)
  }
  if (score >= 800000) { // BBB
    const baseRating = (constant - 5.00) / 2;
    return baseRating + (((score - 800000) / 100000) * baseRating);
  }
  // B, C, D
  return 0;
}