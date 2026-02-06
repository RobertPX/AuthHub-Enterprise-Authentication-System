import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getClientInfo } from '@/lib/auth';
import { generateTokenPair } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/rate-limit';
import { handleError, UnauthorizedError } from '@/lib/errors';
import logger from '@/lib/logger';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { ip, userAgent } = getClientInfo(request);
    const cookieStore = await cookies();

    // Rate limiting
    await checkRateLimit(ip || 'anonymous', 'auth');

    // Get refresh token from cookie or body
    let refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      try {
        const body = await request.json();
        refreshToken = body.refreshToken;
      } catch {
        // No body provided
      }
    }

    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token required');
    }

    // Find session with refresh token
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      // Delete expired session
      await prisma.session.delete({
        where: { id: session.id },
      });
      throw new UnauthorizedError('Refresh token expired');
    }

    // Generate new tokens (token rotation)
    const newTokenPair = generateTokenPair({
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    // Update session with new refresh token
    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: newTokenPair.refreshToken,
        expiresAt: newTokenPair.expiresAt,
        ip,
        userAgent,
      },
    });

    logger.audit('TOKEN_REFRESH', session.user.id, { ip });

    // Create response
    const response = NextResponse.json({
      success: true,
      data: {
        user: session.user,
        tokens: {
          accessToken: newTokenPair.accessToken,
          refreshToken: newTokenPair.refreshToken,
        },
      },
      message: 'Token refreshed successfully',
    });

    // Set new cookies on the response
    response.cookies.set('accessToken', newTokenPair.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });
    response.cookies.set('refreshToken', newTokenPair.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    return handleError(error);
  }
}
