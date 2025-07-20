// 파일 경로: src/lib/ratingUtils.ts

/**
 * CHUNITHM 레이팅 계산 유틸리티 함수들
 * CHUNITHM Wiki 기준으로 구현됨
 */

/**
 * 단일 곡의 레이팅 값을 계산하는 함수
 * @param score 플레이어의 점수 (0 ~ 1,010,000)
 * @param constant 보면 상수 (채보 정수)
 * @returns 레이팅 값 (소수점 둘째 자리까지)
 */
export function calculateSingleRatingValue(score: number, constant: number): number {
  if (score >= 1007500) {
    // SSS (1,007,500점 이상)
    // 1,007,500점에서 constant + 2.00
    // 100점마다 +0.01
    const extraPoints = Math.floor((score - 1007500) / 100);
    return constant + 2.00 + (extraPoints * 0.01);
  } else if (score >= 1005000) {
    // SS+ (1,005,000점 ~ 1,007,499점)
    // 1,005,000점에서 constant + 1.50
    // 50점마다 +0.01
    const extraPoints = Math.floor((score - 1005000) / 50);
    return constant + 1.50 + (extraPoints * 0.01);
  } else if (score >= 1000000) {
    // SS (1,000,000점 ~ 1,004,999점)
    // 1,000,000점에서 constant + 1.00
    // 100점마다 +0.01
    const extraPoints = Math.floor((score - 1000000) / 100);
    return constant + 1.00 + (extraPoints * 0.01);
  } else if (score >= 990000) {
    // S+ (990,000점 ~ 999,999점)
    // 990,000점에서 constant + 0.60
    // 250점마다 +0.01
    const extraPoints = Math.floor((score - 990000) / 250);
    return constant + 0.60 + (extraPoints * 0.01);
  } else if (score >= 975000) {
    // S (975,000점 ~ 989,999점)
    // 975,000점에서 constant + 0.00
    // 250점마다 +0.01
    const extraPoints = Math.floor((score - 975000) / 250);
    return constant + 0.00 + (extraPoints * 0.01);
  } else if (score >= 950000) {
    // AAA (950,000점 ~ 974,999점)
    // 선형 보간 없음, 고정값
    return constant - 1.5;
  } else if (score >= 925000) {
    // AA (925,000점 ~ 949,999점)
    // 선형 보간 없음, 고정값
    return constant - 3.0;
  } else if (score >= 900000) {
    // A (900,000점 ~ 924,999점)
    // 선형 보간 없음, 고정값
    return constant - 5.0;
  } else if (score >= 800000) {
    // BBB (800,000점 ~ 899,999점)
    // (譜面定数-5.0)/2
    return Math.max(0, (constant - 5.0) / 2);
  } else if (score >= 500000) {
    // C (500,000점 ~ 799,999점)
    // 0
    return 0;
  } else {
    // 500,000점 미만
    return 0;
  }
}

/**
 * 플레이어 레이팅에 따른 색상을 반환하는 함수
 * @param rating 플레이어 레이팅
 * @returns 레이팅 색상 이름
 */
export function getRatingColor(rating: number): string {
  if (rating >= 16.00) {
    return '虹'; // 무지개 (Rainbow)
  } else if (rating >= 15.25) {
    return '金'; // 금색 (Gold)
  } else if (rating >= 14.50) {
    return '銀'; // 은색 (Silver)
  } else if (rating >= 13.25) {
    return '銅'; // 동색 (Bronze)
  } else if (rating >= 12.00) {
    return '紫'; // 보라색 (Purple)
  } else if (rating >= 10.00) {
    return '赤'; // 빨간색 (Red)
  } else if (rating >= 7.00) {
    return '橙'; // 주황색 (Orange)
  } else if (rating >= 4.00) {
    return '緑'; // 초록색 (Green)
  } else if (rating >= 2.00) {
    return '青'; // 파란색 (Blue)
  } else if (rating >= 1.00) {
    return '黄'; // 노란색 (Yellow)
  } else {
    return '灰'; // 회색 (Gray)
  }
}

/**
 * 점수에 따른 등급 색상을 반환하는 함수 (일본어)
 * @param score 플레이어의 점수
 * @returns 등급 색상 문자열
 */
export function getScoreGradeColor(score: number): string {
  if (score >= 1007500) return "金"; // 금색 (SSS)
  if (score >= 1005000) return "銀+"; // 은색+ (SS+)
  if (score >= 1000000) return "銀"; // 은색 (SS)
  if (score >= 990000) return "銅+"; // 동색+ (S+)
  if (score >= 975000) return "銅"; // 동색 (S)
  if (score >= 950000) return "紫"; // 보라 (AAA)
  if (score >= 925000) return "赤"; // 빨강 (AA)
  if (score >= 900000) return "黄"; // 노랑 (A)
  if (score >= 800000) return "青"; // 파랑 (BBB)
  return "緑"; // 초록 (C 이하)
}

/**
 * 점수에 따른 등급 색상을 반환하는 함수 (한국어)
 * @param score 플레이어의 점수
 * @returns 등급 색상 문자열
 */
export function getScoreGradeColorKorean(score: number): string {
  if (score >= 1007500) return "금색"; // SSS
  if (score >= 1005000) return "은색+"; // SS+
  if (score >= 1000000) return "은색"; // SS
  if (score >= 990000) return "동색+"; // S+
  if (score >= 975000) return "동색"; // S
  if (score >= 950000) return "보라"; // AAA
  if (score >= 925000) return "빨강"; // AA
  if (score >= 900000) return "노랑"; // A
  if (score >= 800000) return "파랑"; // BBB
  return "초록"; // C 이하
}

/**
 * 점수에 따른 등급명을 반환하는 함수
 * @param score 플레이어의 점수
 * @returns 등급명 문자열
 */
export function getScoreGrade(score: number): string {
  if (score >= 1007500) return "SSS";
  if (score >= 1005000) return "SS+";
  if (score >= 1000000) return "SS";
  if (score >= 990000) return "S+";
  if (score >= 975000) return "S";
  if (score >= 950000) return "AAA";
  if (score >= 925000) return "AA";
  if (score >= 900000) return "A";
  if (score >= 800000) return "BBB";
  if (score >= 500000) return "C";
  return "D";
}

/**
 * 레이팅 색상을 한국어로 변환하는 함수
 * @param colorName 일본어 색상 이름
 * @returns 한국어 색상 이름
 */
export function getRatingColorKorean(rating: number): string {
  const colorName = getRatingColor(rating);
  
  const colorMap: { [key: string]: string } = {
    '虹': '무지개',
    '金': '금색',
    '銀': '은색', 
    '銅': '동색',
    '紫': '보라색',
    '赤': '빨간색',
    '橙': '주황색',
    '緑': '초록색',
    '青': '파란색',
    '黄': '노란색',
    '灰': '회색'
  };
  
  return colorMap[colorName] || '알 수 없음';
}

/**
 * Best 30과 Recent 10을 기반으로 플레이어 레이팅을 계산하는 함수
 * @param best30 Best 30 레이팅 값들의 배열
 * @param recent10 Recent 10 레이팅 값들의 배열
 * @returns 계산된 플레이어 레이팅
 */
export function calculatePlayerRating(best30: number[], recent10: number[]): number {
  // Best 30의 평균
  const best30Average = best30.length > 0 
    ? best30.reduce((sum, rating) => sum + rating, 0) / best30.length 
    : 0;
  
  // Recent 10의 평균  
  const recent10Average = recent10.length > 0
    ? recent10.reduce((sum, rating) => sum + rating, 0) / recent10.length
    : 0;
  
  // 플레이어 레이팅 = (Best 30 평균 + Recent 10 평균) / 2
  return (best30Average + recent10Average) / 2;
}
