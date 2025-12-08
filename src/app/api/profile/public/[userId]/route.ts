// 파일 경로: src/app/api/profile/public/[userId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { DashboardResponse } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
): Promise<NextResponse<DashboardResponse | { error: string }>> {
  try {
    const { userId } = await params;

    // 사용자 존재 여부 및 프로필 공개 설정 확인
    const user = await prisma.user.findUnique({
      where: { userId: userId },
      include: {
        gameProfiles: {
          select: {
            profileId: true,
            gameType: true,
            region: true,
            playerName: true,
            rating: true,
            ratingHistory: true,
            isPublic: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // TODO: 사용자별 프로필 공개 설정이 있다면 여기서 확인
    // 현재는 모든 프로필을 공개로 처리
    const isProfilePublic = true; // 추후 user.isProfilePublic 등으로 변경

    if (!isProfilePublic) {
      return NextResponse.json({ error: 'Profile is private' }, { status: 403 });
    }

    // 공개 프로필 데이터만 반환 (민감한 정보 제외)

    const publicProfiles = user.gameProfiles
      .filter((profile: any) => profile.gameType && profile.region && profile.playerName && profile.rating !== null)
      .map((profile: any) => ({
        id: profile.profileId,
        userId: user.userId, // ProfileSummary 타입에 맞게 공개용 userId 추가
        gameType: profile.gameType!,
        region: profile.region!,
        playerName: profile.playerName!,
        rating: profile.rating!,
        isPublic: typeof profile.isPublic === 'boolean' ? profile.isPublic : true,
        // playCount 등 민감한 정보는 제외
      }));

    // 닉네임(혹은 name) 필드가 user에 있다고 가정
    return NextResponse.json({
      profiles: publicProfiles,
      nickname: user.name || user.userId
    });

  } catch (error) {
    console.error('Public profile API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
