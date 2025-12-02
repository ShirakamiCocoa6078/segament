import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    return NextResponse.json({ isAvailable: !user });
  } catch (error) {
    console.error('Error checking userId:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
