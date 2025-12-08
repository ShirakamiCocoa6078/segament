import prisma from './prisma';
import { GameType, Region } from '@prisma/client';

/**
 * 시스템 ID를 기반으로 사용자의 게임 프로필을 조회합니다.
 * @param userSystemId - 사용자의 고유 시스템 ID (cuid)
 * @param gameType - 게임 종류 (CHUNITHM 등)
 * @param region - 서버 지역 (JP, INT)
 * @returns GameProfile 객체 또는 null
 */
// [OK] userSystemId는 내부용 cuid(고유 식별자)로만 사용해야 하며, 외부 노출/URL에는 사용하지 않음
export async function getGameProfileByUserSystemId(userSystemId: string, gameType: GameType, region: Region) {
  try {
    const gameProfile = await prisma.gameProfile.findUnique({
      where: {
        userSystemId_gameType_region: {
          userSystemId,
          gameType,
          region,
        },
      },
    });
    return gameProfile;
  } catch (error) {
    console.error('Error fetching game profile by userSystemId:', error);
    return null;
  }
}

import { getUserIdToCuid } from './userService';

/**
 * userId(공개용) → userSystemId(cuid)로 변환 후, cuid 기반으로 조회
 * @param userId - 공개용 userId(닉네임 등)
 * @param gameType - 게임 종류 (CHUNITHM 등)
 * @param region - 서버 지역 (JP, INT)
 * @returns GameProfile 객체 또는 null
 * [주의] userId는 공개용(닉네임 등)으로만 사용, DB join 등 내부 참조에는 반드시 userSystemId(cuid) 사용해야 함
 * [개선] userId를 먼저 userSystemId(cuid)로 변환한 뒤, 내부적으로 userSystemId 기반으로 조회하도록 리팩터링
 */
export async function getGameProfileByUserId(userId: string, gameType: GameType, region: Region) {
  try {
    const userSystemId = await getUserIdToCuid(userId);
    if (!userSystemId) {
      return null;
    }
    return await getGameProfileByUserSystemId(userSystemId, gameType, region);
  } catch (error) {
    console.error('Error fetching game profile by userId (via cuid):', error);
    return null;
  }
}
