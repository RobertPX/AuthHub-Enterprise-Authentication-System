import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, getClientInfo } from '@/lib/auth';
import { handleError } from '@/lib/errors';
import logger from '@/lib/logger';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { ip } = getClientInfo(request);
    const cookieStore = await cookies();

    // Get refresh token from cookie
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (refreshToken) {
      // Delete the session
      await prisma.session.deleteMany({
        where: {
          refreshToken,
          userId: user.id,
        },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGOUT',
        ip,
      },
    });

    logger.audit('LOGOUT', user.id, { ip });

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful',
    });

    // Clear cookies by setting them with expired maxAge
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    return handleError(error);
  }
}
