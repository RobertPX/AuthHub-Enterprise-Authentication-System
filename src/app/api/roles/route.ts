import { requireAuth } from '@/lib/auth';
import { handleError } from '@/lib/errors';

// Available roles (from Prisma enum)
const ROLES = [
  { id: 'USER', name: 'User', description: 'Standard user with basic access' },
  { id: 'MANAGER', name: 'Manager', description: 'Manager with elevated permissions' },
  { id: 'ADMIN', name: 'Admin', description: 'Administrator with full access' },
];

export async function GET() {
  try {
    await requireAuth();

    return Response.json({
      success: true,
      data: ROLES,
    });
  } catch (error) {
    return handleError(error);
  }
}
