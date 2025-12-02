import prisma from './prisma';
import { GameType, Region } from '@prisma/client';

/**
 * 시스템 ID를 기반으로 사용자의 게임 프로필을 조회합니다.
 * @param userSystemId - 사용자의 고유 시스템 ID (cuid)
 * @param gameType - 게임 종류 (CHUNITHM 등)
 * @param region - 서버 지역 (JP, INT)
 * @returns GameProfile 객체 또는 null
 */
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
    console.error('Error fetching game profile by system ID:', error);
    return null;
  }
}

/**
 * 사용자 ID(닉네임)를 기반으로 사용자의 게임 프로필을 조회합니다.
 * 공개 프로필 조회 등 외부 시스템에서 사용될 수 있습니다.
 * @param userId - 사용자가 설정한 고유 ID (닉네임)
 * @param gameType - 게임 종류 (CHUNITHM 등)
 * @param region - 서버 지역 (JP, INT)
 * @returns GameProfile 객체 또는 null
 */
export async function getGameProfileByUserId(userId: string, gameType: GameType, region: Region) {
  try {
    const gameProfile = await prisma.gameProfile.findFirst({
      where: {
        user: {
          userId: userId,
        },
        gameType: gameType,
        region: region,
      },
    });
    return gameProfile;
  } catch (error) {
    console.error('Error fetching game profile by user ID:', error);
    return null;
  }
}
