import { requireAuth } from '@/lib/auth';
import { handleError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const user = await requireAuth();
    const cookieStore = await cookies();
    const currentRefreshToken = cookieStore.get('refreshToken')?.value;

    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        ip: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
        refreshToken: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Mark current session and hide refresh token
    const sessionsWithCurrent = sessions.map((session) => ({
      id: session.id,
      ip: session.ip,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isCurrent: session.refreshToken === currentRefreshToken,
    }));

    return Response.json({
      success: true,
      data: sessionsWithCurrent,
    });
  } catch (error) {
    return handleError(error);
  }
}
