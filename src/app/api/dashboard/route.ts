// 파일 경로: src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import type { DashboardResponse } from '@/types';

export async function GET(): Promise<NextResponse<DashboardResponse | { error: string }>> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        gameProfiles: {
          select: {
            id: true,
            gameType: true,
            region: true,
            playerName: true,
            rating: true,
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

    return NextResponse.json({ profiles: user.gameProfiles || [] });

  } catch (error) {
    console.error('API Error in /api/dashboard:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}