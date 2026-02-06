import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, getClientInfo } from '@/lib/auth';
import { generateTokenPair } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/rate-limit';
import { handleError, ConflictError } from '@/lib/errors';
import { validateBody } from '@/lib/validate';
import { registerSchema } from '@/validators/auth.schema';
import logger from '@/lib/logger';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { ip, userAgent } = getClientInfo(request);

    // Rate limiting
    await checkRateLimit(ip || 'anonymous', 'auth');

    // Validate input
    const { email, password, name } = await validateBody(request, registerSchema);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

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
        action: 'REGISTER',
        ip,
        metadata: { userAgent },
      },
    });

    logger.audit('REGISTER', user.id, { email: user.email, ip });

    // Set cookies
    const cookieStore = await cookies();
    cookieStore.set('accessToken', tokenPair.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });
    cookieStore.set('refreshToken', tokenPair.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return Response.json(
      {
        success: true,
        data: {
          user,
          tokens: {
            accessToken: tokenPair.accessToken,
            refreshToken: tokenPair.refreshToken,
          },
        },
        message: 'Registration successful',
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
