import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, userId, publicStates } = await req.json();

    if (userId) {
      const existingUser = await prisma.user.findUnique({
        where: { userId },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json({ error: 'User ID already taken' }, { status: 409 });
      }
    }

    // 기본 프로필 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name,
        userId: userId,
      },
    });

    // 공개여부 상태가 전달된 경우 각 프로필에 반영
    if (publicStates && typeof publicStates === 'object') {
      const profileIds = Object.keys(publicStates);
      for (const profileId of profileIds) {
        await prisma.gameProfile.update({
          where: { profileId: profileId },
          data: { isPublic: !!publicStates[profileId] },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
