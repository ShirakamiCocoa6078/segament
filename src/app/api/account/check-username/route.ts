import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    return NextResponse.json({ isAvailable: !user });
  } catch (error) {
    console.error('Error checking username:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
