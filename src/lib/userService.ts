import { prisma } from '@/lib/db';

/**
 * userId(닉네임)로 cuid(id) 반환
 */
export async function getUserIdToCuid(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { userId },
    select: { id: true },
  });
  return user?.id ?? null;
}
