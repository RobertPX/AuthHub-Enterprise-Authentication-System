import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { verifyAccessToken } from './jwt';
import { UnauthorizedError } from './errors';
import prisma from './prisma';
import type { Role } from '@prisma/client';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return null;
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new UnauthorizedError('Authentication required');
  }

  return user;
}

export async function requireRole(allowedRoles: Role[]): Promise<AuthUser> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new UnauthorizedError('Insufficient permissions');
  }

  return user;
}

export function getClientInfo(request: Request): { ip: string | null; userAgent: string | null } {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : null;
  const userAgent = request.headers.get('user-agent');

  return { ip, userAgent };
}
