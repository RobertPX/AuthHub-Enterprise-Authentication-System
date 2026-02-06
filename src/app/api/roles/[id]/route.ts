import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { handleError, NotFoundError } from '@/lib/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Available roles (from Prisma enum)
const ROLES = [
  { id: 'USER', name: 'User', description: 'Standard user with basic access' },
  { id: 'MANAGER', name: 'Manager', description: 'Manager with elevated permissions' },
  { id: 'ADMIN', name: 'Admin', description: 'Administrator with full access' },
];

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await requireRole(['ADMIN']);

    const role = ROLES.find((r) => r.id === id.toUpperCase());

    if (!role) {
      throw new NotFoundError('Role not found');
    }

    return Response.json({
      success: true,
      data: role,
    });
  } catch (error) {
    return handleError(error);
  }
}
