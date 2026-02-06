import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, getClientInfo } from '@/lib/auth';
import { generateTokenPair } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/rate-limit';
import { handleError, UnauthorizedError } from '@/lib/errors';
import { validateBody } from '@/lib/validate';
import { loginSchema } from '@/validators/auth.schema';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { ip, userAgent } = getClientInfo(request);

    // Rate limiting (strict for login attempts)
    await checkRateLimit(ip || 'anonymous', 'strict');

    // Validate input
    const { email, password } = await validateBody(request, loginSchema);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Log failed attempt
      logger.warn('Login attempt with non-existent email', { email, ip });
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      // Log failed attempt
      logger.warn('Login attempt with invalid password', { email, ip });
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_FAILED',
          ip,
          metadata: { reason: 'invalid_password', userAgent },
        },
      });
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const tokenPair = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokenPair.refreshToken,
        ip,
        userAgent,
        expiresAt: tokenPair.expiresAt,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        ip,
        metadata: { userAgent },
      },
    });

    logger.audit('LOGIN', user.id, { email: user.email, ip });

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        tokens: {
          accessToken: tokenPair.accessToken,
          refreshToken: tokenPair.refreshToken,
        },
      },
      message: 'Login successful',
    });

    // Set cookies using headers for maximum compatibility
    const isProduction = process.env.NODE_ENV === 'production';

    response.headers.append(
      'Set-Cookie',
      `accessToken=${tokenPair.accessToken}; Path=/; HttpOnly; Max-Age=${15 * 60}${isProduction ? '; Secure; SameSite=Lax' : '; SameSite=Lax'}`
    );
    response.headers.append(
      'Set-Cookie',
      `refreshToken=${tokenPair.refreshToken}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}${isProduction ? '; Secure; SameSite=Lax' : '; SameSite=Lax'}`
    );

    return response;
  } catch (error) {
    return handleError(error);
  }
}
