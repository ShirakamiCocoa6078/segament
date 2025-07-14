"use server";

import { getPersonalizedTips } from "@/ai/flows/personalized-tips";
import { chunithmData, maimaiData, userProfile } from "@/lib/mock-data";

export async function generateTipsAction() {
  try {
    const userProfileHistory = `
      사용자: ${userProfile.username}
      
      츄니즘 데이터:
      레이팅: ${chunithmData.rating}
      플레이 횟수: ${chunithmData.playCount}
      강점: ${chunithmData.strengths.join(", ")}
      약점: ${chunithmData.weaknesses.join(", ")}
      최근 플레이: ${chunithmData.recentPlays
        .map((p) => `${p.song} - 점수: ${p.score}`)
        .join("\n")}

      마이마이 데이터:
      레이팅: ${maimaiData.rating}
      플레이 횟수: ${maimaiData.playCount}
      강점: ${maimaiData.strengths.join(", ")}
      약점: ${maimaiData.weaknesses.join(", ")}
      최근 플레이: ${maimaiData.recentPlays
        .map((p) => `${p.song} - 점수: ${p.score}%`)
        .join("\n")}
    `;

    const result = await getPersonalizedTips({ userProfileHistory });
    return { success: true, tips: result.tips };
  } catch (error) {
    console.error(error);
    return { success: false, error: "팁 생성에 실패했습니다. 나중에 다시 시도해주세요." };
  }
}
