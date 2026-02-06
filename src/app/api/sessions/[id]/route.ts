import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, getClientInfo } from '@/lib/auth';
import { handleError, NotFoundError, ForbiddenError } from '@/lib/errors';
import logger from '@/lib/logger';
import { cookies } from 'next/headers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await requireAuth();
    const { ip } = getClientInfo(request);
    const cookieStore = await cookies();
    const currentRefreshToken = cookieStore.get('refreshToken')?.value;

    // Find the session
    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    // Users can only revoke their own sessions
    if (session.userId !== currentUser.id) {
      throw new ForbiddenError('You can only revoke your own sessions');
    }

    // Check if trying to revoke current session
    const isCurrentSession = session.refreshToken === currentRefreshToken;

    // Delete the session
    await prisma.session.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'REVOKE_SESSION',
        ip,
        metadata: { sessionId: id, isCurrentSession },
      },
    });

    logger.audit('REVOKE_SESSION', currentUser.id, { sessionId: id, isCurrentSession });

    // If revoking current session, clear cookies
    if (isCurrentSession) {
      cookieStore.delete('accessToken');
      cookieStore.delete('refreshToken');
    }

    return Response.json({
      success: true,
      message: isCurrentSession
        ? 'Current session revoked. You have been logged out.'
        : 'Session revoked successfully',
    });
  } catch (error) {
    return handleError(error);
  }
}
