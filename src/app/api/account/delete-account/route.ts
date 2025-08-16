import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // Perform deletion in a transaction to ensure atomicity
    await prisma.$transaction([
      // Delete related GameData
      prisma.gameData.deleteMany({
        where: { profile: { userId: userId } },
      }),
      // Delete related GameProfiles
      prisma.gameProfile.deleteMany({
        where: { userId: userId },
      }),
      // Delete related Accounts
      prisma.account.deleteMany({
        where: { userId: userId },
      }),
      // Delete related Sessions
      prisma.session.deleteMany({
        where: { userId: userId },
      }),
      // Finally, delete the User
      prisma.user.delete({
        where: { id: userId },
      }),
    ]);

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
