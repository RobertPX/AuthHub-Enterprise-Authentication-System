import { requireAuth } from '@/lib/auth';
import { handleError } from '@/lib/errors';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const authUser = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return handleError(error);
  }
}
