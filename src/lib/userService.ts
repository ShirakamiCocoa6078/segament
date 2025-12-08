import { prisma } from '@/lib/db';

/**
 * userId(닉네임)로 cuid(id) 반환
 * [주의] 반환값은 내부용 cuid(id)임. 외부 노출/URL에는 사용 금지
 */
export async function getUserIdToCuid(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { userId },
    select: { id: true },
  });
  return user?.id ?? null; // [주의] 반환값은 내부용 cuid(id)
}
