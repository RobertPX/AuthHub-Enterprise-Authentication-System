import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { handleError } from '@/lib/errors';
import { validateQuery } from '@/lib/validate';
import { paginationSchema } from '@/validators/user.schema';

export async function GET(request: NextRequest) {
  try {
    // Only ADMIN can list all users
    await requireRole(['ADMIN']);

    const { searchParams } = new URL(request.url);
    const { page, limit } = validateQuery(searchParams, paginationSchema);

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    return Response.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
